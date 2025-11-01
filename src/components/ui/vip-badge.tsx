import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Crown, Shield, Star } from 'lucide-react';

interface VIPBadgeProps {
  tier?: 'premium' | 'enterprise' | 'executive';
}

export function VIPBadge({ tier = 'premium' }: VIPBadgeProps) {
  const config = {
    premium: {
      icon: Star,
      label: 'Premium Member',
      variant: 'gold' as const,
    },
    enterprise: {
      icon: Shield,
      label: 'Enterprise',
      variant: 'platinum' as const,
    },
    executive: {
      icon: Crown,
      label: 'Executive Access',
      variant: 'gold' as const,
    },
  };
  
  const { icon: Icon, label, variant } = config[tier];
  
  return (
    <Badge variant={variant} className="gap-1.5 px-3 py-1.5">
      <Icon className="h-3.5 w-3.5" />
      {label}
    </Badge>
  );
}
