import React from 'react';
import { Sparkles } from 'lucide-react';

export function PersonalizedGreeting() {
  const firstName = 'Executive';
  
  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Morning';
    if (hour < 18) return 'Afternoon';
    return 'Evening';
  };
  
  return (
    <div className="flex items-center gap-3 mb-6">
      <Sparkles className="h-5 w-5 text-[#D4AF37] animate-pulse" />
      <p className="text-lg font-luxury text-foreground/80">
        Good {getTimeOfDay()}, <span className="font-semibold text-foreground">{firstName}</span>
      </p>
    </div>
  );
}
