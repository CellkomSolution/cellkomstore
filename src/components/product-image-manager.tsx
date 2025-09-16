"use client";

import * as React from "react";
import { ImageUploader } from "@/components/image-uploader";
import { Button } from "@/components/ui/button";
import { PlusCircle, XCircle, GripVertical } from "lucide-react";
import { ProductImage } from "@/lib/supabase/products";
import { toast } from "sonner";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface ProductImageManagerProps {
  initialImages: ProductImage[];
  onImagesChange: (images: ProductImage[]) => void;
  disabled?: boolean;
}

interface DraggableImageProps {
  image: ProductImage;
  onUpdate: (id: string, newUrl: string) => void;
  onRemove: (id: string) => void;
  disabled: boolean;
}

const DraggableImage: React.FC<DraggableImageProps> = ({ image, onUpdate, onRemove, disabled }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: image.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 0,
    opacity: isDragging ? 0.7 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-2 p-2 border rounded-md bg-card">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="cursor-grab"
        {...attributes}
        {...listeners}
        disabled={disabled}
      >
        <GripVertical className="h-5 w-5 text-muted-foreground" />
      </Button>
      <div className="flex-1">
        <ImageUploader
          bucketName="product-images"
          currentImageUrl={image.imageUrl}
          onUploadSuccess={(newUrl) => onUpdate(image.id, newUrl)}
          onRemove={() => onRemove(image.id)}
          disabled={disabled}
          aspectRatio="aspect-square"
          className="w-24 h-24"
        />
      </div>
      <Button
        type="button"
        variant="destructive"
        size="icon"
        onClick={() => onRemove(image.id)}
        disabled={disabled}
      >
        <XCircle className="h-5 w-5" />
      </Button>
    </div>
  );
};

export function ProductImageManager({ initialImages, onImagesChange, disabled = false }: ProductImageManagerProps) {
  const [images, setImages] = React.useState<ProductImage[]>(initialImages);

  React.useEffect(() => {
    // Ensure images are ordered correctly when initialImages change
    const sortedInitialImages = [...initialImages].sort((a, b) => a.order - b.order);
    setImages(sortedInitialImages);
  }, [initialImages]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  const handleAddImage = () => {
    const newImage: ProductImage = {
      id: `new-${Date.now()}-${Math.random()}`, // Temporary ID for new images
      product_id: '', // Will be set on save
      imageUrl: '',
      order: images.length > 0 ? Math.max(...images.map(img => img.order)) + 1 : 0,
    };
    setImages((prev) => [...prev, newImage]);
    onImagesChange([...images, newImage]);
  };

  const handleUpdateImage = (id: string, newUrl: string) => {
    const updatedImages = images.map((img) =>
      img.id === id ? { ...img, imageUrl: newUrl } : img
    );
    setImages(updatedImages);
    onImagesChange(updatedImages);
  };

  const handleRemoveImage = (id: string) => {
    const updatedImages = images.filter((img) => img.id !== id);
    setImages(updatedImages);
    onImagesChange(updatedImages);
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setImages((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        const newOrder = arrayMove(items, oldIndex, newIndex).map((item, index) => ({
          ...item,
          order: index, // Reassign order based on new position
        }));
        onImagesChange(newOrder);
        return newOrder;
      });
    }
  };

  // Helper function for reordering arrays (from dnd-kit examples)
  function arrayMove<T>(array: T[], from: number, to: number): T[] {
    const newArray = [...array];
    const [movedItem] = newArray.splice(from, 1);
    newArray.splice(to, 0, movedItem);
    return newArray;
  }

  return (
    <div className="space-y-4">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={images.map(img => img.id)} strategy={verticalListSortingStrategy}>
          {images.map((image) => (
            <DraggableImage
              key={image.id}
              image={image}
              onUpdate={handleUpdateImage}
              onRemove={handleRemoveImage}
              disabled={disabled}
            />
          ))}
        </SortableContext>
      </DndContext>
      <Button
        type="button"
        variant="outline"
        onClick={handleAddImage}
        disabled={disabled}
        className="w-full"
      >
        <PlusCircle className="mr-2 h-4 w-4" />
        Tambah Gambar Lain
      </Button>
    </div>
  );
}