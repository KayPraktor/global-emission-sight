import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, FileSpreadsheet, Target, Building2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';

const quickActions = [
  {
    label: 'Add Emissions Entry',
    description: 'Log new emissions data',
    icon: PlusCircle,
    path: '/data-entry',
    color: 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20',
  },
  {
    label: 'Import Data',
    description: 'Bulk upload from CSV',
    icon: Upload,
    path: '/data-entry?action=import',
    color: 'bg-blue-500/10 text-blue-600 hover:bg-blue-500/20',
  },
  {
    label: 'Generate Report',
    description: 'Create compliance reports',
    icon: FileSpreadsheet,
    path: '/reports',
    color: 'bg-purple-500/10 text-purple-600 hover:bg-purple-500/20',
  },
  {
    label: 'Set Goals',
    description: 'Define reduction targets',
    icon: Target,
    path: '/goals',
    color: 'bg-amber-500/10 text-amber-600 hover:bg-amber-500/20',
  },
  {
    label: 'Manage Facilities',
    description: 'Add or edit locations',
    icon: Building2,
    path: '/facilities',
    color: 'bg-rose-500/10 text-rose-600 hover:bg-rose-500/20',
  },
];

export function QuickActionsPanel() {
  const navigate = useNavigate();

  return (
    <Card className="border-dashed border-2 border-primary/20 bg-primary/5">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold">What do you want to do?</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-3">
          {quickActions.map((action, index) => (
            <motion.div
              key={action.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Button
                variant="outline"
                className={`h-auto py-3 px-4 flex flex-col items-start gap-1 min-w-[140px] ${action.color} border-transparent`}
                onClick={() => navigate(action.path)}
              >
                <div className="flex items-center gap-2">
                  <action.icon className="h-4 w-4" />
                  <span className="font-medium">{action.label}</span>
                </div>
                <span className="text-xs opacity-70 font-normal">{action.description}</span>
              </Button>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
