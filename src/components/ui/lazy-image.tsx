
import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  placeholder?: string;
  className?: string;
  containerClassName?: string;
  blurDataURL?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  placeholder,
  className = '',
  containerClassName = '',
  blurDataURL,
  onLoad,
  onError,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  return (
    <div
      ref={containerRef}
      className={cn('relative overflow-hidden', containerClassName)}
    >
      {!isInView ? (
        <Skeleton className={cn('w-full h-full', className)} />
      ) : (
        <>
          {blurDataURL && !isLoaded && (
            <img
              src={blurDataURL}
              alt=""
              className={cn('absolute inset-0 w-full h-full object-cover blur-sm', className)}
            />
          )}
          
          {!isLoaded && !hasError && (
            <Skeleton className={cn('absolute inset-0 w-full h-full', className)} />
          )}
          
          {hasError ? (
            <div className={cn('flex items-center justify-center bg-muted text-muted-foreground', className)}>
              <span className="text-sm">Failed to load image</span>
            </div>
          ) : (
            <motion.img
              ref={imgRef}
              src={src}
              alt={alt}
              className={cn('w-full h-full object-cover', className)}
              initial={{ opacity: 0 }}
              animate={{ opacity: isLoaded ? 1 : 0 }}
              transition={{ duration: 0.3 }}
              onLoad={handleLoad}
              onError={handleError}
              {...props}
            />
          )}
        </>
      )}
    </div>
  );
};

interface ImageGalleryProps {
  images: Array<{
    src: string;
    alt: string;
    placeholder?: string;
  }>;
  columns?: number;
  gap?: number;
  className?: string;
}

export const LazyImageGallery: React.FC<ImageGalleryProps> = ({
  images,
  columns = 3,
  gap = 4,
  className = ''
}) => {
  return (
    <div
      className={cn('grid', className)}
      style={{
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: `${gap * 0.25}rem`
      }}
    >
      {images.map((image, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="aspect-square"
        >
          <LazyImage
            src={image.src}
            alt={image.alt}
            placeholder={image.placeholder}
            className="rounded-lg"
            containerClassName="w-full h-full"
          />
        </motion.div>
      ))}
    </div>
  );
};
