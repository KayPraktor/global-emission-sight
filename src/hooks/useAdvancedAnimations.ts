
import { useAnimation, useInView } from 'framer-motion';
import { useEffect, useRef } from 'react';

// Hook for scroll-triggered animations
export function useScrollAnimation() {
  const controls = useAnimation();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  useEffect(() => {
    if (inView) {
      controls.start('visible');
    }
  }, [controls, inView]);

  return { ref, controls };
}

// Hook for staggered animations
export function useStaggeredAnimation(delay: number = 0.1) {
  const controls = useAnimation();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (inView) {
      controls.start('visible');
    }
  }, [controls, inView]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: delay
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: 'easeOut'
      }
    }
  };

  return { ref, controls, containerVariants, itemVariants };
}

// Hook for advanced hover animations
export function useHoverAnimation() {
  const controls = useAnimation();

  const handleHoverStart = () => {
    controls.start({
      scale: 1.05,
      y: -5,
      boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
      transition: { duration: 0.3, ease: 'easeOut' }
    });
  };

  const handleHoverEnd = () => {
    controls.start({
      scale: 1,
      y: 0,
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      transition: { duration: 0.3, ease: 'easeOut' }
    });
  };

  return { controls, handleHoverStart, handleHoverEnd };
}

// Hook for loading animations
export function useLoadingAnimation() {
  const controls = useAnimation();

  const startLoading = () => {
    controls.start({
      opacity: 0.5,
      scale: 0.95,
      transition: { duration: 0.2 }
    });
  };

  const stopLoading = () => {
    controls.start({
      opacity: 1,
      scale: 1,
      transition: { duration: 0.3, ease: 'easeOut' }
    });
  };

  return { controls, startLoading, stopLoading };
}

// Hook for page transitions
export function usePageTransition() {
  const controls = useAnimation();

  const pageEnter = () => {
    return controls.start({
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' }
    });
  };

  const pageExit = () => {
    return controls.start({
      opacity: 0,
      y: -20,
      transition: { duration: 0.3, ease: 'easeIn' }
    });
  };

  return { controls, pageEnter, pageExit };
}
