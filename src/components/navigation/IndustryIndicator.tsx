import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Settings, HelpCircle } from 'lucide-react';
import { getOrganizationIndustry } from '@/services/industryService';
import { getIndustryById } from '@/data/industryConfig';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useSidebar } from '@/components/ui/sidebar';

interface IndustryIndicatorProps {
  organizationId: string;
  isAdmin?: boolean;
}

export function IndustryIndicator({ organizationId, isAdmin = false }: IndustryIndicatorProps) {
  const [industry, setIndustry] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  useEffect(() => {
    async function fetchIndustry() {
      try {
        const data = await getOrganizationIndustry(organizationId);
        setIndustry(data?.industry || null);
      } catch (error) {
        console.error('Failed to fetch industry:', error);
      } finally {
        setLoading(false);
      }
    }

    if (organizationId) {
      fetchIndustry();
    } else {
      setLoading(false);
    }
  }, [organizationId]);

  if (loading) {
    return (
      <div className="px-2 py-1.5">
        <Skeleton className="h-7 w-full rounded-md" />
      </div>
    );
  }

  const industryConfig = industry ? getIndustryById(industry) : null;
  const IconComponent = industryConfig?.icon || HelpCircle;

  // Collapsed state - just show icon
  if (isCollapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            to="/settings?tab=organization"
            className="flex items-center justify-center p-2 rounded-md hover:bg-sidebar-accent transition-colors"
          >
            <IconComponent 
              className="h-4 w-4" 
              style={{ color: industryConfig?.color || 'hsl(var(--muted-foreground))' }} 
            />
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right">
          {industryConfig ? `${industryConfig.name} Mode` : 'Configure Industry'}
        </TooltipContent>
      </Tooltip>
    );
  }

  // No industry configured
  if (!industryConfig) {
    return (
      <Link
        to="/settings?tab=organization"
        className="flex items-center gap-2 px-2 py-1.5 rounded-md text-xs text-muted-foreground hover:bg-sidebar-accent hover:text-foreground transition-colors group"
      >
        <HelpCircle className="h-4 w-4" />
        <span className="flex-1">Configure Industry</span>
        <Settings className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
      </Link>
    );
  }

  // Industry configured - show indicator
  const content = (
    <div className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-sidebar-accent transition-colors group">
      <IconComponent 
        className="h-4 w-4 shrink-0" 
        style={{ color: industryConfig.color }} 
      />
      <Badge 
        variant="secondary" 
        className="text-[10px] px-1.5 py-0 h-5 font-medium truncate"
        style={{ 
          backgroundColor: `${industryConfig.color}15`,
          color: industryConfig.color,
          borderColor: `${industryConfig.color}30`
        }}
      >
        {industryConfig.name} Mode
      </Badge>
      {isAdmin && (
        <Settings className="h-3 w-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground" />
      )}
    </div>
  );

  if (isAdmin) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Link to="/settings?tab=organization">
            {content}
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right">
          Click to change industry configuration
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div>{content}</div>
      </TooltipTrigger>
      <TooltipContent side="right">
        Your organization's industry configuration
      </TooltipContent>
    </Tooltip>
  );
}
