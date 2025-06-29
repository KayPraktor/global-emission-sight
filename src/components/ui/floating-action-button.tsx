
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Plus, FileText, Upload, Download, MessageSquare, X } from 'lucide-react';
import { HoverScale } from './animated-elements';

interface FABAction {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  color?: string;
}

interface FloatingActionButtonProps {
  actions?: FABAction[];
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}

const defaultActions: FABAction[] = [
  {
    icon: FileText,
    label: 'New Report',
    onClick: () => console.log('New Report'),
    color: 'bg-blue-500 hover:bg-blue-600'
  },
  {
    icon: Upload,
    label: 'Import Data',
    onClick: () => console.log('Import Data'),
    color: 'bg-green-500 hover:bg-green-600'
  },
  {
    icon: Download,
    label: 'Export Data',
    onClick: () => console.log('Export Data'),
    color: 'bg-purple-500 hover:bg-purple-600'
  },
  {
    icon: MessageSquare,
    label: 'Quick Help',
    onClick: () => console.log('Quick Help'),
    color: 'bg-orange-500 hover:bg-orange-600'
  }
];

const positionClasses = {
  'bottom-right': 'bottom-6 right-6',
  'bottom-left': 'bottom-6 left-6',
  'top-right': 'top-6 right-6',
  'top-left': 'top-6 left-6',
};

export function FloatingActionButton({ 
  actions = defaultActions, 
  position = 'bottom-right' 
}: FloatingActionButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.5, 
      y: position.includes('bottom') ? 20 : -20 
    },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 500,
        damping: 30
      }
    }
  };

  return (
    <div className={`fixed ${positionClasses[position]} z-50 flex flex-col items-end gap-3`}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="flex flex-col gap-3"
          >
            {actions.map((action, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="flex items-center gap-3"
              >
                <div className="bg-black/80 text-white px-3 py-1 rounded-lg text-sm whitespace-nowrap opacity-0 animate-fade-in">
                  {action.label}
                </div>
                <HoverScale>
                  <Button
                    size="icon"
                    onClick={action.onClick}
                    className={`h-12 w-12 rounded-full shadow-lg ${action.color || 'bg-primary hover:bg-primary/90'}`}
                  >
                    <action.icon className="h-5 w-5" />
                  </Button>
                </HoverScale>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <HoverScale>
        <Button
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
          className="h-14 w-14 rounded-full shadow-xl bg-primary hover:bg-primary/90 relative"
        >
          <motion.div
            animate={{ rotate: isOpen ? 45 : 0 }}
            transition={{ duration: 0.2 }}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
          </motion.div>
        </Button>
      </HoverScale>
    </div>
  );
}
