"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface GlowingEffectProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  intensity?: "low" | "medium" | "high";
}

export function GlowingEffect({ 
  children, 
  className, 
  intensity = "medium",
  ...props 
}: GlowingEffectProps) {
  const intensityClasses = {
    low: "shadow-lg shadow-primary/10",
    medium: "shadow-xl shadow-primary/20",
    high: "shadow-2xl shadow-primary/30"
  };

  return (
    <div
      className={cn(
        "relative",
        intensityClasses[intensity],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
