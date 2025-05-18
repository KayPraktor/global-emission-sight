
import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from '@/components/ui/button';
import { AlertCircle, Calendar, CheckCircle, Info, MoreHorizontal, Target } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";

// Sample data - in a real app this would come from an API
const goals = [
  {
    id: '1',
    title: 'Reduce Scope 1 emissions by 25%',
    description: 'Direct reduction in greenhouse gas emissions from operations.',
    progress: 68,
    status: 'on-track',
    scope: 'Scope 1',
    targetDate: '2026-12-31',
    baselineYear: 2020,
    targetYear: 2026,
    lastUpdated: '2025-04-15',
  },
  {
    id: '2',
    title: 'Achieve 50% renewable energy usage',
    description: 'Transition to renewable energy sources for electricity.',
    progress: 42,
    status: 'on-track',
    scope: 'Scope 2',
    targetDate: '2028-12-31',
    baselineYear: 2021,
    targetYear: 2028,
    lastUpdated: '2025-04-28',
  },
  {
    id: '3',
    title: 'Zero emissions from business travel',
    description: 'Eliminate all emissions from business travel through offsets and alternatives.',
    progress: 15,
    status: 'at-risk',
    scope: 'Scope 3',
    targetDate: '2027-12-31',
    baselineYear: 2022,
    targetYear: 2027,
    lastUpdated: '2025-05-01',
  },
  {
    id: '4',
    title: 'Reduce Scope 3 supply chain emissions by 20%',
    description: 'Work with suppliers to reduce emissions in our value chain.',
    progress: 32,
    status: 'on-track',
    scope: 'Scope 3',
    targetDate: '2030-12-31',
    baselineYear: 2022,
    targetYear: 2030,
    lastUpdated: '2025-04-10',
  },
  {
    id: '5',
    title: 'Carbon neutrality for manufacturing',
    description: 'Achieve carbon neutrality across all manufacturing operations.',
    progress: 12,
    status: 'at-risk',
    scope: 'Scope 1',
    targetDate: '2030-12-31',
    baselineYear: 2023,
    targetYear: 2030,
    lastUpdated: '2025-03-22',
  },
];

interface GoalsListProps {
  scope?: string;
}

const GoalsList = ({ scope }: GoalsListProps) => {
  const filteredGoals = scope 
    ? goals.filter(goal => goal.scope === scope)
    : goals;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'on-track':
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="h-3.5 w-3.5 mr-1" />
            On Track
          </Badge>
        );
      case 'at-risk':
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
            <AlertCircle className="h-3.5 w-3.5 mr-1" />
            At Risk
          </Badge>
        );
      case 'behind':
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            <AlertCircle className="h-3.5 w-3.5 mr-1" />
            Behind
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
            <Info className="h-3.5 w-3.5 mr-1" />
            Not Started
          </Badge>
        );
    }
  };

  const getProgressColor = (progress: number, status: string) => {
    if (status === 'at-risk') return 'bg-amber-500';
    if (status === 'behind') return 'bg-red-500';
    return 'bg-green-500';
  };

  const handleUpdateProgress = (goalId: string) => {
    toast.success(`Progress updated for goal #${goalId}`);
  };

  const handleEditGoal = (goalId: string) => {
    toast.info(`Edit goal #${goalId}`);
  };

  const handleDeleteGoal = (goalId: string) => {
    toast.success(`Goal #${goalId} deleted`);
  };

  return (
    <div className="space-y-6">
      {filteredGoals.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <Target className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-lg font-medium text-gray-900">No goals found</p>
            <p className="text-gray-500 text-center mt-1">
              {scope ? `No ${scope} goals have been created yet.` : 'No goals have been created yet.'}
            </p>
            <Button className="mt-4">
              Create Your First Goal
            </Button>
          </CardContent>
        </Card>
      ) : (
        filteredGoals.map(goal => (
          <Card key={goal.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{goal.title}</CardTitle>
                  <CardDescription className="mt-1.5">{goal.description}</CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusBadge(goal.status)}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleUpdateProgress(goal.id)}>
                        Update Progress
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEditGoal(goal.id)}>
                        Edit Goal
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => handleDeleteGoal(goal.id)}
                        className="text-red-600"
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium">Progress</span>
                    <span className="text-sm font-medium">{goal.progress}%</span>
                  </div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Progress 
                          value={goal.progress} 
                          className="h-2"
                          indicatorClassName={getProgressColor(goal.progress, goal.status)}
                        />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{goal.progress}% complete</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Baseline</p>
                    <p className="font-medium">{goal.baselineYear}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Target Year</p>
                    <p className="font-medium">{goal.targetYear}</p>
                  </div>
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="border-t bg-muted/50 px-6 py-3">
              <div className="flex items-center justify-between w-full text-xs text-muted-foreground">
                <div className="flex items-center">
                  <Calendar className="h-3.5 w-3.5 mr-1" />
                  <span>Target Date: {new Date(goal.targetDate).toLocaleDateString()}</span>
                </div>
                <span>Last updated: {new Date(goal.lastUpdated).toLocaleDateString()}</span>
              </div>
            </CardFooter>
          </Card>
        ))
      )}
    </div>
  );
};

export default GoalsList;
