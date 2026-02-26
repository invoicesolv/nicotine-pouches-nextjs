'use client';

import { useRef, ReactNode } from 'react';
import { motion, useInView, Variants } from 'framer-motion';

// Animation variants for different effects
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 }
};

const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 }
};

const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1 }
};

// Stagger container variants
const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1
    }
  }
};

// Stagger item variants
const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number]
    }
  }
};

// Hero stagger for text elements
const heroStagger: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2
    }
  }
};

const heroItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number]
    }
  }
};

interface AnimatedSectionProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  animation?: 'fadeInUp' | 'fadeIn' | 'scaleIn';
  delay?: number;
  duration?: number;
  once?: boolean;
  amount?: number;
}

// Single element fade-in on scroll
export function AnimatedSection({
  children,
  className,
  style,
  animation = 'fadeInUp',
  delay = 0,
  duration = 0.5,
  once = true,
  amount = 0.3
}: AnimatedSectionProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once, amount });

  const variants = {
    fadeInUp,
    fadeIn,
    scaleIn
  }[animation];

  return (
    <motion.div
      ref={ref}
      className={className}
      style={style}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={variants}
      transition={{
        duration,
        delay,
        ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number]
      }}
    >
      {children}
    </motion.div>
  );
}

interface StaggeredContainerProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  once?: boolean;
  amount?: number;
  staggerDelay?: number;
}

// Container for staggered children animations
export function StaggeredContainer({
  children,
  className,
  style,
  once = true,
  amount = 0.2,
  staggerDelay = 0.08
}: StaggeredContainerProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once, amount });

  const customStagger: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: 0.1
      }
    }
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      style={style}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={customStagger}
    >
      {children}
    </motion.div>
  );
}

interface StaggeredItemProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

// Individual item that staggers in
export function StaggeredItem({ children, className, style }: StaggeredItemProps) {
  return (
    <motion.div
      className={className}
      style={style}
      variants={staggerItem}
    >
      {children}
    </motion.div>
  );
}

interface HeroStaggerProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

// Hero section with staggered text
export function HeroStagger({ children, className, style }: HeroStaggerProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });

  return (
    <motion.div
      ref={ref}
      className={className}
      style={style}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={heroStagger}
    >
      {children}
    </motion.div>
  );
}

// Hero item for text elements
export function HeroItem({ children, className, style }: StaggeredItemProps) {
  return (
    <motion.div
      className={className}
      style={style}
      variants={heroItem}
    >
      {children}
    </motion.div>
  );
}

interface ProductCardHoverProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  hoverContent?: ReactNode;
}

// Product card with hover reveal effect
export function ProductCardHover({
  children,
  className,
  style,
  hoverContent
}: ProductCardHoverProps) {
  return (
    <motion.div
      className={className}
      style={{ ...style, position: 'relative' }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
    >
      {children}
      {hoverContent && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileHover={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0
          }}
        >
          {hoverContent}
        </motion.div>
      )}
    </motion.div>
  );
}

// Marquee animation for brand logos
interface MarqueeProps {
  children: ReactNode;
  speed?: number;
  pauseOnHover?: boolean;
  direction?: 'left' | 'right';
}

export function Marquee({
  children,
  speed = 30,
  pauseOnHover = true,
  direction = 'left'
}: MarqueeProps) {
  return (
    <div
      style={{
        overflow: 'hidden',
        width: '100%',
        maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)'
      }}
    >
      <motion.div
        style={{
          display: 'flex',
          gap: '25px',
          width: 'fit-content'
        }}
        animate={{
          x: direction === 'left' ? [0, '-50%'] : ['-50%', 0]
        }}
        transition={{
          x: {
            duration: speed,
            repeat: Infinity,
            ease: 'linear'
          }
        }}
        whileHover={pauseOnHover ? { animationPlayState: 'paused' } : undefined}
      >
        {children}
        {children}
      </motion.div>
    </div>
  );
}

// Export variants for custom use
export { fadeInUp, fadeIn, scaleIn, staggerContainer, staggerItem, heroStagger, heroItem };
