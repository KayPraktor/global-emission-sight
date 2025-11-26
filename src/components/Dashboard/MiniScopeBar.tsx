import React from 'react';
import { cn } from '@/lib/utils';

interface MiniScopeBarProps {
  scope1: number;
  scope2: number;
  scope3: number;
  total: number;
  className?: string;
}

export const MiniScopeBar: React.FC<MiniScopeBarProps> = ({
  scope1,
  scope2,
  scope3,
  total,
  className = ''
}) => {
  const s1Percent = (scope1 / total) * 100;
  const s2Percent = (scope2 / total) * 100;
  const s3Percent = (scope3 / total) * 100;

  return (
    <div className={cn("flex h-2 w-full rounded-full overflow-hidden bg-muted", className)}>
      {scope1 > 0 && (
        <div
          className="bg-red-500"
          style={{ width: `${s1Percent}%` }}
          title={`Scope 1: ${scope1.toFixed(1)} tCO₂e`}
        />
      )}
      {scope2 > 0 && (
        <div
          className="bg-blue-500"
          style={{ width: `${s2Percent}%` }}
          title={`Scope 2: ${scope2.toFixed(1)} tCO₂e`}
        />
      )}
      {scope3 > 0 && (
        <div
          className="bg-purple-500"
          style={{ width: `${s3Percent}%` }}
          title={`Scope 3: ${scope3.toFixed(1)} tCO₂e`}
        />
      )}
    </div>
  );
};
