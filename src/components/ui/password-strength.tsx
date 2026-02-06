import React, { useMemo } from 'react';
import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

interface PasswordStrengthProps {
  password: string;
  className?: string;
}

interface PasswordRequirement {
  label: string;
  met: boolean;
}

export const getPasswordStrength = (password: string): number => {
  let strength = 0;
  
  if (password.length >= 8) strength += 20;
  if (password.length >= 12) strength += 10;
  if (/[a-z]/.test(password)) strength += 20;
  if (/[A-Z]/.test(password)) strength += 20;
  if (/[0-9]/.test(password)) strength += 15;
  if (/[^a-zA-Z0-9]/.test(password)) strength += 15;
  
  return Math.min(100, strength);
};

export const getStrengthLabel = (strength: number): { label: string; color: string } => {
  if (strength < 30) return { label: 'Weak', color: 'text-destructive' };
  if (strength < 60) return { label: 'Fair', color: 'text-warning' };
  if (strength < 80) return { label: 'Good', color: 'text-primary' };
  return { label: 'Strong', color: 'text-accent-foreground' };
};

export const PasswordStrength: React.FC<PasswordStrengthProps> = ({ password, className }) => {
  const strength = useMemo(() => getPasswordStrength(password), [password]);
  const { label, color } = useMemo(() => getStrengthLabel(strength), [strength]);
  
  const requirements: PasswordRequirement[] = useMemo(() => [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'Contains lowercase letter', met: /[a-z]/.test(password) },
    { label: 'Contains uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'Contains a number', met: /[0-9]/.test(password) },
    { label: 'Contains special character', met: /[^a-zA-Z0-9]/.test(password) },
  ], [password]);

  if (!password) return null;

  return (
    <div className={cn('space-y-3', className)}>
      {/* Strength bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Password strength</span>
          <span className={cn('font-medium', color)}>{label}</span>
        </div>
        <Progress 
          value={strength} 
          className="h-2"
          indicatorClassName={cn(
            strength < 30 && 'bg-destructive',
            strength >= 30 && strength < 60 && 'bg-warning',
            strength >= 60 && strength < 80 && 'bg-primary',
            strength >= 80 && 'bg-accent'
          )}
        />
      </div>

      {/* Requirements checklist */}
      <ul className="space-y-1 text-sm">
        {requirements.map((req) => (
          <li 
            key={req.label}
            className={cn(
              'flex items-center gap-2 transition-colors',
              req.met ? 'text-accent-foreground' : 'text-muted-foreground'
            )}
          >
            {req.met ? (
              <Check className="h-3.5 w-3.5" />
            ) : (
              <X className="h-3.5 w-3.5" />
            )}
            {req.label}
          </li>
        ))}
      </ul>
    </div>
  );
};
