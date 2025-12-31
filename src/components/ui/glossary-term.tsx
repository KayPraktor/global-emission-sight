import React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

// Glossary of carbon management terms
const glossary: Record<string, string> = {
  'scope 1': 'Direct emissions from owned or controlled sources (e.g., company vehicles, on-site fuel combustion)',
  'scope 2': 'Indirect emissions from purchased electricity, steam, heating, and cooling',
  'scope 3': 'All other indirect emissions in the value chain (e.g., suppliers, business travel, product use)',
  'tco2e': 'Tonnes of carbon dioxide equivalent - a standard unit for measuring carbon footprint',
  'tco₂e': 'Tonnes of carbon dioxide equivalent - a standard unit for measuring carbon footprint',
  'co2e': 'Carbon dioxide equivalent - converts all greenhouse gases to a common unit',
  'ghg': 'Greenhouse Gas - gases that trap heat in the atmosphere (CO₂, methane, etc.)',
  'ghg protocol': 'The Greenhouse Gas Protocol - the most widely used international accounting standard for emissions',
  'csrd': 'Corporate Sustainability Reporting Directive - EU regulation for sustainability disclosures',
  'cbam': 'Carbon Border Adjustment Mechanism - EU policy taxing carbon-intensive imports',
  'iso 14064': 'International standard for greenhouse gas accounting and verification',
  'sbti': 'Science Based Targets initiative - framework for setting emissions reduction targets',
  'net zero': 'Achieving a balance between emissions produced and emissions removed from the atmosphere',
  'carbon intensity': 'Amount of carbon emissions per unit of activity (e.g., per revenue, per product)',
  'emission factor': 'A coefficient that converts activity data into greenhouse gas emissions',
  'baseline': 'The reference point against which emissions reductions are measured',
};

interface GlossaryTermProps {
  term: string;
  children?: React.ReactNode;
  className?: string;
}

export const GlossaryTerm: React.FC<GlossaryTermProps> = ({ 
  term, 
  children,
  className 
}) => {
  const normalizedTerm = term.toLowerCase();
  const definition = glossary[normalizedTerm];
  
  if (!definition) {
    return <span className={className}>{children || term}</span>;
  }

  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <span 
            className={cn(
              "border-b border-dashed border-muted-foreground/50 cursor-help",
              className
            )}
          >
            {children || term}
          </span>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <p className="text-sm">{definition}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default GlossaryTerm;
