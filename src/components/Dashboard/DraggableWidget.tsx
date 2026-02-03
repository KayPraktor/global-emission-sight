import React from 'react';
import { motion } from 'framer-motion';
import { GripVertical, X, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface DraggableWidgetProps {
  id: string;
  title: string;
  children: React.ReactNode;
  isCustomizeMode: boolean;
  isVisible: boolean;
  onRemove?: () => void;
  onSettings?: () => void;
  className?: string;
  dragHandleClassName?: string;
}

export const DraggableWidget: React.FC<DraggableWidgetProps> = React.memo(({
  id,
  title,
  children,
  isCustomizeMode,
  isVisible,
  onRemove,
  onSettings,
  className,
  dragHandleClassName,
}) => {
  if (!isVisible && !isCustomizeMode) {
    return null;
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ 
        opacity: isVisible ? 1 : 0.4, 
        scale: 1,
      }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "relative group",
        isCustomizeMode && "ring-2 ring-primary/30 ring-dashed rounded-lg bg-primary/5",
        !isVisible && isCustomizeMode && "opacity-50 bg-muted/50",
        className
      )}
    >
      {/* Customize Mode Overlay */}
      {isCustomizeMode && (
        <div className="absolute inset-0 z-10 pointer-events-none">
          {/* Drag Handle */}
          <div 
            className={cn(
              "absolute top-2 left-2 p-1.5 bg-background/95 rounded-md shadow-md border cursor-grab active:cursor-grabbing pointer-events-auto flex items-center gap-1.5",
              dragHandleClassName
            )}
          >
            <GripVertical className="w-4 h-4 text-primary" />
            <span className="text-xs font-medium text-foreground pr-1">{title}</span>
          </div>

          {/* Action Buttons */}
          <div className="absolute top-2 right-2 flex items-center gap-1 pointer-events-auto">
            {onSettings && (
              <Button
                variant="secondary"
                size="icon"
                className="h-7 w-7"
                onClick={onSettings}
              >
                <Settings className="w-3.5 h-3.5" />
              </Button>
            )}
            {onRemove && (
              <Button
                variant="secondary"
                size="icon"
                className="h-7 w-7 hover:bg-destructive hover:text-destructive-foreground"
                onClick={onRemove}
              >
                <X className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Widget Content */}
      <div className={cn(isCustomizeMode && "pointer-events-none")}>
        {children}
      </div>
    </motion.div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison - only re-render if these props change
  return (
    prevProps.id === nextProps.id &&
    prevProps.isCustomizeMode === nextProps.isCustomizeMode &&
    prevProps.isVisible === nextProps.isVisible &&
    prevProps.title === nextProps.title &&
    prevProps.children === nextProps.children
  );
});

DraggableWidget.displayName = 'DraggableWidget';

export default DraggableWidget;
