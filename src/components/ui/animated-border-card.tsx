"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface AnimatedBorderCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export function AnimatedBorderCard({ children, className, ...props }: AnimatedBorderCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg border border-border/40 bg-card/50 backdrop-blur-sm",
        "before:absolute before:inset-0 before:rounded-lg before:p-[1px] before:bg-gradient-to-r before:from-primary/20 before:via-blue-500/20 before:to-purple-500/20",
        "before:opacity-0 before:transition-opacity before:duration-300",
        "hover:before:opacity-100",
        "after:absolute after:inset-[1px] after:rounded-lg after:bg-card",
        className
      )}
      {...props}
    >
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
