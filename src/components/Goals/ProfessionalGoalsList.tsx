
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  Filter, 
  MoreHorizontal, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Calendar,
  Users,
  FileText,
  Eye,
  Edit,
  Trash2,
  Loader2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { goalsService, GoalWithProgress } from '@/services/goalsService';
import { format } from 'date-fns';

interface ProfessionalGoalsListProps {
  scope?: string;
}

const ProfessionalGoalsList = ({ scope }: ProfessionalGoalsListProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [sortBy, setSortBy] = useState('priority');
  const [goals, setGoals] = useState<GoalWithProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadGoals();
  }, [scope]);

  const loadGoals = async () => {
    setIsLoading(true);
    const { data, error } = await goalsService.getGoalsWithProgress(scope);
    
    if (error) {
      toast.error('Failed to load goals', { description: error });
      setGoals([]);
    } else {
      setGoals(data || []);
    }
    
    setIsLoading(false);
  };

  const filteredGoals = goals
    .filter(goal => 
      goal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (goal.description && goal.description.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .filter(goal => statusFilter === 'all' || goal.status === statusFilter);

  const getPriorityBadge = (priority?: string) => {
    if (!priority) return null;
    const variants = {
      critical: 'bg-red-100 text-red-800 border-red-200',
      high: 'bg-orange-100 text-orange-800 border-orange-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      low: 'bg-green-100 text-green-800 border-green-200'
    };
    return (
      <Badge variant="outline" className={variants[priority as keyof typeof variants]}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'in_progress':
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            In Progress
          </Badge>
        );
      case 'at_risk':
        return (
          <Badge className="bg-amber-100 text-amber-800 border-amber-200">
            <AlertTriangle className="w-3 h-3 mr-1" />
            At Risk
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            <Clock className="w-3 h-3 mr-1" />
            {status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </Badge>
        );
    }
  };

  const getTrendIcon = (trend: string) => {
    return trend === 'up' ? (
      <TrendingUp className="w-4 h-4 text-green-600" />
    ) : (
      <TrendingDown className="w-4 h-4 text-red-600" />
    );
  };

  const handleViewGoal = (goalId: string) => {
    toast.info(`Opening goal details for #${goalId}`);
  };

  const handleEditGoal = (goalId: string) => {
    toast.info(`Editing goal #${goalId}`);
  };

  const handleDeleteGoal = async (goalId: string) => {
    const { success, error } = await goalsService.deleteGoal(goalId);
    
    if (error) {
      toast.error('Failed to delete goal', { description: error });
    } else {
      toast.success('Goal deleted successfully');
      loadGoals();
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search goals, owners, or descriptions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="at_risk">At Risk</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="not_started">Not Started</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>

              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="priority">Priority</SelectItem>
                  <SelectItem value="progress">Progress</SelectItem>
                  <SelectItem value="due-date">Due Date</SelectItem>
                  <SelectItem value="updated">Last Updated</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {/* Goals List */}
      {!isLoading && (
        <div className="space-y-4">
          {filteredGoals.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mb-4" />
              <p className="text-lg font-medium text-gray-900">No goals found</p>
              <p className="text-gray-500 text-center mt-1">
                {scope ? `No ${scope} goals match your current filters.` : 'No goals match your current filters.'}
              </p>
              <Button className="mt-4" onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setPriorityFilter('all');
              }}>
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredGoals.map(goal => {
            const progressPercent = goal.progressPercentage || 0;
            const scopeLabel = goal.scope_covered?.join(', ') || 'All Scopes';
            
            return (
            <Card key={goal.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="text-lg">{goal.title}</CardTitle>
                      {getTrendIcon(goal.trend)}
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{goal.description || 'No description provided'}</p>
                    <div className="flex flex-wrap gap-2">
                      {getStatusBadge(goal.status)}
                      <Badge variant="outline">{scopeLabel}</Badge>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleViewGoal(goal.id)}>
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEditGoal(goal.id)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Goal
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => handleDeleteGoal(goal.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Progress Section */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Progress to Target</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{progressPercent}%</span>
                      {goal.baseline_emissions && goal.actualEmissions && (
                        <span className="text-xs text-muted-foreground">
                          ({goal.actualEmissions.toFixed(1)} / {goal.target_emissions?.toFixed(1) || 'N/A'} tCO₂e)
                        </span>
                      )}
                    </div>
                  </div>
                  <Progress 
                    value={progressPercent} 
                    className={cn(
                      "h-2",
                      goal.status === 'in_progress' && "[&>div]:bg-green-600",
                      goal.status === 'at_risk' && "[&>div]:bg-amber-600",
                      goal.status === 'overdue' && "[&>div]:bg-red-600"
                    )}
                  />
                </div>

                {/* Key Information Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Target Date</p>
                    <p className="font-medium flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      {format(new Date(goal.target_date), 'MMM yyyy')}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Baseline</p>
                    <p className="font-medium">{goal.baseline_emissions?.toFixed(1) || 'N/A'} tCO₂e ({goal.baseline_year})</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Target Reduction</p>
                    <p className="font-medium">{goal.target_reduction_percentage || 'N/A'}%</p>
                  </div>
                </div>
              </CardContent>
              
              <div className="border-t bg-muted/30 px-6 py-3">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <span>Current: {goal.actualEmissions.toFixed(1)} tCO₂e</span>
                    {goal.facility_id && <span>Facility-specific goal</span>}
                  </div>
                  <span>Updated: {format(new Date(goal.updated_at), 'MMM dd, yyyy')}</span>
                </div>
              </div>
            </Card>
          );})
        )}
      </div>
      )}
    </div>
  );
};

export default ProfessionalGoalsList;
