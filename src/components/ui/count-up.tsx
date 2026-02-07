import React, { useEffect, useState, useRef } from 'react';
import { cn } from '@/lib/utils';

interface CountUpProps {
  value: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  className?: string;
  startOnView?: boolean;
}

export const CountUp: React.FC<CountUpProps> = ({
  value,
  duration = 1.2,
  suffix = '',
  prefix = '',
  decimals = 0,
  className,
  startOnView = true,
}) => {
  const [displayValue, setDisplayValue] = useState(0);
  const [hasStarted, setHasStarted] = useState(!startOnView);
  const ref = useRef<HTMLSpanElement>(null);

  // Intersection observer for start on view
  useEffect(() => {
    if (!startOnView || hasStarted) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setHasStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [startOnView, hasStarted]);

  // Animation effect
  useEffect(() => {
    if (!hasStarted) return;

    const startTime = Date.now();
    const startValue = 0;
    const difference = value - startValue;

    const animate = () => {
      const elapsed = (Date.now() - startTime) / 1000;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease out cubic for smooth deceleration
      const easeOutCubic = 1 - Math.pow(1 - progress, 3);
      
      const currentValue = startValue + difference * easeOutCubic;
      setDisplayValue(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value, duration, hasStarted]);

  const formattedValue = displayValue.toFixed(decimals);
  const parts = formattedValue.split('.');
  const integerPart = parseInt(parts[0]).toLocaleString();
  const decimalPart = parts[1];

  return (
    <span ref={ref} className={cn('tabular-nums', className)}>
      {prefix}
      {integerPart}
      {decimals > 0 && `.${decimalPart}`}
      {suffix}
    </span>
  );
};

// Simple animated number without suffix handling
export const AnimatedNumber: React.FC<{
  value: number;
  className?: string;
}> = ({ value, className }) => {
  return <CountUp value={value} className={className} decimals={1} />;
};
