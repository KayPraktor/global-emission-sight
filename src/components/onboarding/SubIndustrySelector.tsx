import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';

interface SubIndustry {
  id: string;
  industry: string;
  sub_industry: string;
  display_name: string;
  emission_categories: string[];
  typical_scopes: string[];
}

interface SubIndustrySelectorProps {
  industry: string;
  selectedSubIndustry: string | null;
  onSelect: (subIndustry: string) => void;
}

export function SubIndustrySelector({ industry, selectedSubIndustry, onSelect }: SubIndustrySelectorProps) {
  const [subIndustries, setSubIndustries] = useState<SubIndustry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubIndustries = async () => {
      if (!industry) {
        setSubIndustries([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      const { data, error } = await supabase
        .from('industry_sub_industries')
        .select('*')
        .eq('industry', industry)
        .order('display_name');

      if (!error && data) {
        setSubIndustries(data);
        // Auto-select first if none selected
        if (data.length > 0 && !selectedSubIndustry) {
          onSelect(data[0].sub_industry);
        }
      }
      setLoading(false);
    };

    fetchSubIndustries();
  }, [industry]);

  if (loading) {
    return <Skeleton className="h-10 w-full" />;
  }

  if (subIndustries.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <Label>Sub-Industry (Optional)</Label>
      <Select value={selectedSubIndustry || ''} onValueChange={onSelect}>
        <SelectTrigger>
          <SelectValue placeholder="Select your specific sector" />
        </SelectTrigger>
        <SelectContent>
          {subIndustries.map((sub) => (
            <SelectItem key={sub.id} value={sub.sub_industry}>
              {sub.display_name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
