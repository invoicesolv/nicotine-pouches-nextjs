'use client';

import { useRef, ReactNode } from 'react';
import { motion, useInView } from 'framer-motion';

interface AnimatedProductRowProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  rowIndex?: number;
}

// Animated wrapper for product row sections
export function AnimatedProductRow({
  children,
  className,
  style,
  rowIndex = 0
}: AnimatedProductRowProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <motion.div
      ref={ref}
      className={className}
      style={style}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{
        duration: 0.5,
        delay: rowIndex * 0.1,
        ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number]
      }}
    >
      {children}
    </motion.div>
  );
}

interface AnimatedProductCardProps {
  children: ReactNode;
  index: number;
  className?: string;
  style?: React.CSSProperties;
}

// Animated wrapper for individual product cards with stagger
export function AnimatedProductCard({
  children,
  index,
  className,
  style
}: AnimatedProductCardProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <motion.div
      ref={ref}
      className={className}
      style={style}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{
        duration: 0.4,
        delay: index * 0.05,
        ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number]
      }}
      whileHover={{
        y: -4,
        transition: { duration: 0.2 }
      }}
    >
      {children}
    </motion.div>
  );
}

// Animated section header
interface AnimatedSectionHeaderProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function AnimatedSectionHeader({
  children,
  className,
  style
}: AnimatedSectionHeaderProps) {
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

export default AnimatedProductRow;
