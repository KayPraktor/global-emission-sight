import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  PlusCircle, 
  FileSpreadsheet, 
  Shield, 
  Target,
  TrendingUp,
  Building2
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface QuickAction {
  icon: React.ElementType;
  label: string;
  description: string;
  path: string;
  color: string;
}

const quickActions: QuickAction[] = [
  {
    icon: PlusCircle,
    label: 'Add Emissions',
    description: 'Log new entry',
    path: '/data-entry',
    color: 'text-emerald-600',
  },
  {
    icon: FileSpreadsheet,
    label: 'Generate Report',
    description: 'Create report',
    path: '/reports',
    color: 'text-blue-600',
  },
  {
    icon: Shield,
    label: 'Compliance',
    description: 'View status',
    path: '/enterprise',
    color: 'text-purple-600',
  },
  {
    icon: Target,
    label: 'Goals',
    description: 'Track progress',
    path: '/goals',
    color: 'text-amber-600',
  },
  {
    icon: TrendingUp,
    label: 'Scenarios',
    description: 'Plan reductions',
    path: '/scenario-planning',
    color: 'text-rose-600',
  },
  {
    icon: Building2,
    label: 'Facilities',
    description: 'Manage sites',
    path: '/facilities',
    color: 'text-cyan-600',
  },
];

export function QuickActionsBar() {
  const navigate = useNavigate();

  return (
    <div className="bg-muted/30 rounded-xl p-4 border border-border/50">
      <h3 className="text-sm font-semibold text-muted-foreground mb-3 px-1">
        Quick Actions
      </h3>
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
        {quickActions.map((action, index) => (
          <motion.div
            key={action.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: index * 0.05 }}
          >
            <Button
              variant="ghost"
              className="w-full h-auto flex flex-col items-center gap-1.5 py-3 px-2 hover:bg-background hover:shadow-sm transition-all duration-200 group"
              onClick={() => navigate(action.path)}
            >
              <div className={`p-2 rounded-lg bg-background shadow-sm group-hover:scale-110 transition-transform duration-200`}>
                <action.icon className={`h-5 w-5 ${action.color}`} />
              </div>
              <span className="text-xs font-medium">{action.label}</span>
              <span className="text-[10px] text-muted-foreground hidden md:block">
                {action.description}
              </span>
            </Button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default QuickActionsBar;
