"use client";

import * as React from "react";
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MousePointerClick, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button, ButtonProps } from "@/components/ui/button"; // Using existing Button component

// Helper component for success particles animation
function SuccessParticles({
  buttonRef,
}: {
  buttonRef: React.RefObject<HTMLButtonElement>;
}) {
  const rect = buttonRef.current?.getBoundingClientRect();
  if (!rect) return null;

  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  return (
    <AnimatePresence>
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="fixed w-1 h-1 bg-black dark:bg-white rounded-full z-50"
          style={{ left: centerX, top: centerY }}
          initial={{
            scale: 0,
            x: 0,
            y: 0,
          }}
          animate={{
            scale: [0, 1, 0],
            x: [0, (i % 2 ? 1 : -1) * (Math.random() * 50 + 20)],
            y: [0, -Math.random() * 50 - 20],
          }}
          transition={{
            duration: 0.6,
            delay: i * 0.1,
            ease: "easeOut",
          }}
        />
      ))}
    </AnimatePresence>
  );
}

interface ParticleButtonProps extends ButtonProps {
  onSuccess?: () => void;
  successDuration?: number;
  isLoading?: boolean;
  isSuccess?: boolean;
}

export function ParticleButton({
  children,
  onClick,
  onSuccess,
  successDuration = 1000,
  className,
  isLoading = false,
  isSuccess = false,
  disabled,
  ...props
}: ParticleButtonProps) {
  const [showParticles, setShowParticles] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    if (onClick) {
      await onClick(e);
    }
    if (onSuccess) {
      setShowParticles(true);
      setTimeout(() => {
        setShowParticles(false);
        onSuccess();
      }, successDuration);
    }
  };

  return (
    <>
      {showParticles && <SuccessParticles buttonRef={buttonRef} />}
      <Button
        ref={buttonRef}
        onClick={handleClick}
        className={cn(
          "relative",
          showParticles && "scale-95",
          "transition-transform duration-100",
          className
        )}
        disabled={disabled || isLoading || isSuccess}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading...
          </>
        ) : isSuccess ? (
          <>
            <Check className="mr-2 h-4 w-4" />
            Success!
          </>
        ) : (
          <>
            {children}
            <MousePointerClick className="h-4 w-4 ml-2" />
          </>
        )}
      </Button>
    </>
  );
}