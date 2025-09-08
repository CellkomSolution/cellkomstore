"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ProductCardSkeleton() {
  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <CardContent className="p-0 flex flex-col flex-grow">
        <Skeleton className="w-full h-48 rounded-t-lg" />
        <div className="p-4 space-y-2 flex flex-col flex-grow">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <div className="flex-grow" />
          <Skeleton className="h-6 w-full" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-4 w-1/3" />
          </div>
          <Skeleton className="h-4 w-2/3" />
        </div>
      </CardContent>
    </Card>
  );
}