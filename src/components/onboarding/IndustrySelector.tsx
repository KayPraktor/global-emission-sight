import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { industries, type Industry } from '@/data/industryConfig';
import { Check } from 'lucide-react';

interface IndustrySelectorProps {
  selectedIndustry: string | null;
  onSelect: (industryId: string) => void;
}

export function IndustrySelector({ selectedIndustry, onSelect }: IndustrySelectorProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
      {industries.map((industry) => {
        const Icon = industry.icon;
        const isSelected = selectedIndustry === industry.id;
        
        return (
          <motion.div
            key={industry.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card
              className={`p-4 cursor-pointer transition-all h-full relative ${
                isSelected 
                  ? 'border-primary bg-primary/5 ring-2 ring-primary/20' 
                  : 'hover:border-primary/50'
              }`}
              onClick={() => onSelect(industry.id)}
            >
              {isSelected && (
                <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-0.5">
                  <Check className="h-3 w-3" />
                </div>
              )}
              <div className="text-center">
                <div className={`inline-flex p-3 rounded-lg bg-muted/50 mb-2 ${industry.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-sm font-medium mb-1">{industry.name}</h3>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {industry.description}
                </p>
              </div>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
