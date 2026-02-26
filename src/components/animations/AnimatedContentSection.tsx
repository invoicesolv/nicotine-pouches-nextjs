'use client';

import { useRef, ReactNode } from 'react';
import { motion, useInView } from 'framer-motion';

interface AnimatedContentBlockProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  delay?: number;
}

// Animated wrapper for content blocks that fade in on scroll
export function AnimatedContentBlock({
  children,
  className,
  style,
  delay = 0
}: AnimatedContentBlockProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <motion.div
      ref={ref}
      className={className}
      style={style}
      initial={{ opacity: 0, y: 25 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 25 }}
      transition={{
        duration: 0.5,
        delay,
        ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number]
      }}
    >
      {children}
    </motion.div>
  );
}

interface AnimatedHeadingProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

// Animated heading that fades in
export function AnimatedHeading({
  children,
  className,
  style
}: AnimatedHeadingProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });

  return (
    <motion.div
      ref={ref}
      className={className}
      style={style}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{
        duration: 0.5,
        ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number]
      }}
    >
      {children}
    </motion.div>
  );
}

export default AnimatedContentBlock;
