import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Activity, 
  DollarSign, 
  Shield, 
  Zap,
  Target,
  TrendingUp,
  TrendingDown,
  ExternalLink,
  Pin,
  PinOff,
  GripVertical
} from 'lucide-react';
import { ExecutiveKPI } from '@/utils/enterpriseData';
import { toast } from 'sonner';

interface CustomizableKPIGridProps {
  kpis: ExecutiveKPI[];
  pinnedKPIs: string[];
  customizeMode: boolean;
  onTogglePin: (kpiId: string) => void;
  onReorder?: (sourceIndex: number, destinationIndex: number) => void;
}

export const CustomizableKPIGrid: React.FC<CustomizableKPIGridProps> = ({
  kpis,
  pinnedKPIs,
  customizeMode,
  onTogglePin,
  onReorder,
}) => {
  const navigate = useNavigate();
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const getNavigationPath = (kpi: ExecutiveKPI): string => {
    const title = kpi.title.toLowerCase();
    
    if (title.includes('emissions') || title.includes('carbon intensity')) {
      return '/data-entry';
    } else if (title.includes('compliance') || title.includes('data quality')) {
      return '/analytics?tab=quality';
    } else if (title.includes('cost') || title.includes('risk')) {
      return '/reports';
    } else if (title.includes('net zero') || title.includes('target')) {
      return '/goals';
    } else if (title.includes('facility') || title.includes('site')) {
      return '/facilities';
    }
    
    return '/data-entry';
  };

  const getTooltipText = (kpi: ExecutiveKPI): string => {
    const title = kpi.title.toLowerCase();
    
    if (title.includes('emissions')) {
      return 'Click to view emissions data entries and sources';
    } else if (title.includes('carbon intensity')) {
      return 'Click to view emissions analytics and intensity metrics';
    } else if (title.includes('compliance') || title.includes('data quality')) {
      return 'Click to view data quality dashboard and validation';
    } else if (title.includes('cost')) {
      return 'Click to view financial reports and carbon costs';
    } else if (title.includes('net zero') || title.includes('target')) {
      return 'Click to view and manage reduction goals';
    } else if (title.includes('risk')) {
      return 'Click to view risk analysis and reports';
    } else if (title.includes('facility') || title.includes('site')) {
      return 'Click to view facility emissions and details';
    }
    
    return 'Click to view more details';
  };

  const handleKPIClick = (kpi: ExecutiveKPI) => {
    if (customizeMode) return;
    
    const path = getNavigationPath(kpi);
    toast.info(`Navigating to ${kpi.title} details`, {
      description: 'View detailed data and analytics'
    });
    navigate(path);
  };

  const getKPIIcon = (category: string) => {
    switch (category) {
      case 'emissions': return <Activity className="w-5 h-5" />;
      case 'financial': return <DollarSign className="w-5 h-5" />;
      case 'compliance': return <Shield className="w-5 h-5" />;
      case 'operational': return <Zap className="w-5 h-5" />;
      default: return <Target className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    return 'bg-card hover:bg-accent/5 border-border';
  };

  const getTrendIcon = (trend: string) => {
    if (trend === 'up') {
      return <TrendingUp className="w-4 h-4 text-muted-foreground" />;
    } else if (trend === 'down') {
      return <TrendingDown className="w-4 h-4 text-muted-foreground" />;
    }
    return <Activity className="w-4 h-4 text-muted-foreground" />;
  };

  const isPinned = (kpiId: string) => pinnedKPIs.includes(kpiId);

  const handleDragStart = (index: number) => {
    if (!customizeMode || !onReorder) return;
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (!customizeMode || !onReorder) return;
    setDragOverIndex(index);
  };

  const handleDrop = (index: number) => {
    if (!customizeMode || !onReorder || draggedIndex === null) return;
    
    if (draggedIndex !== index) {
      onReorder(draggedIndex, index);
    }
    
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  // Sort KPIs: pinned first, then unpinned
  const sortedKPIs = [...kpis].sort((a, b) => {
    const aIsPinned = isPinned(a.id);
    const bIsPinned = isPinned(b.id);
    if (aIsPinned && !bIsPinned) return -1;
    if (!aIsPinned && bIsPinned) return 1;
    return 0;
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {sortedKPIs.map((kpi, index) => (
        <TooltipProvider key={kpi.id}>
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.div
                variants={fadeInUp}
                className={`relative ${customizeMode && onReorder ? 'cursor-move' : 'cursor-pointer'}`}
                onClick={() => !customizeMode && handleKPIClick(kpi)}
                whileHover={customizeMode ? {} : { scale: 1.02 }}
                whileTap={customizeMode ? {} : { scale: 0.98 }}
                draggable={customizeMode && !!onReorder}
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={() => handleDrop(index)}
                onDragEnd={handleDragEnd}
                style={{
                  opacity: draggedIndex === index ? 0.5 : 1,
                }}
              >
                <div className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                  customizeMode 
                    ? 'border-primary/30 hover:border-primary/50' 
                    : 'hover:shadow-lg hover:border-primary/50'
                } ${
                  dragOverIndex === index && draggedIndex !== index 
                    ? 'border-primary border-dashed' 
                    : ''
                } ${
                  isPinned(kpi.id) 
                    ? 'ring-2 ring-primary/20' 
                    : ''
                } group ${getStatusColor(kpi.status)}`}>
                  
                  {/* Drag handle and pin button */}
                  {customizeMode && (
                    <div className="absolute top-2 left-2 flex items-center gap-1">
                      {onReorder && (
                        <div className="p-1 bg-background/80 rounded cursor-move">
                          <GripVertical className="w-4 h-4 text-muted-foreground" />
                        </div>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 bg-background/80 hover:bg-background"
                        onClick={(e) => {
                          e.stopPropagation();
                          onTogglePin(kpi.id);
                        }}
                      >
                        {isPinned(kpi.id) ? (
                          <PinOff className="w-4 h-4 text-primary" />
                        ) : (
                          <Pin className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  )}

                  {!customizeMode && (
                    <>
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <ExternalLink className="w-4 h-4 text-primary" />
                      </div>
                      {isPinned(kpi.id) && (
                        <div className="absolute top-2 left-2">
                          <Pin className="w-4 h-4 text-primary fill-primary" />
                        </div>
                      )}
                    </>
                  )}

                  <div className="flex items-center justify-between mb-3 mt-2">
                    <div className="flex items-center space-x-2">
                      {getKPIIcon(kpi.category)}
                      <span className="text-sm font-medium text-muted-foreground">
                        {kpi.title}
                      </span>
                    </div>
                    {getTrendIcon(kpi.trend)}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-baseline space-x-2">
                      <span className="text-2xl font-bold">
                        {kpi.value.toLocaleString()}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {kpi.unit}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1">
                        <span className="text-sm font-medium">
                          {kpi.change > 0 ? '+' : ''}{kpi.change.toFixed(1)}%
                        </span>
                        <span className="text-xs text-muted-foreground">vs last month</span>
                      </div>
                      
                      {kpi.target && (
                        <div className="text-xs text-muted-foreground">
                          Target: {kpi.target.toLocaleString()} {kpi.unit}
                        </div>
                      )}
                    </div>

                    {kpi.target && (
                      <div className="space-y-1">
                        <Progress 
                          value={Math.min((kpi.value / kpi.target) * 100, 100)} 
                          className="h-2"
                        />
                        <div className="text-xs text-muted-foreground text-right">
                          {((kpi.value / kpi.target) * 100).toFixed(0)}% of target
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-sm">
                {customizeMode 
                  ? `${isPinned(kpi.id) ? 'Unpin' : 'Pin'} this KPI${onReorder ? ' or drag to reorder' : ''}`
                  : getTooltipText(kpi)
                }
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ))}
    </div>
  );
};
