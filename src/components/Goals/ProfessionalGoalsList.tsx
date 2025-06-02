
import React, { useState } from 'react';
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
  Trash2
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

const professionalGoals = [
  {
    id: '1',
    title: 'Achieve Carbon Neutrality in Manufacturing',
    description: 'Implement comprehensive carbon reduction strategies across all manufacturing facilities to achieve net-zero emissions.',
    category: 'emissions-reduction',
    scope: 'Scope 1',
    priority: 'critical',
    status: 'on-track',
    progress: 72,
    baselineValue: 15000,
    targetValue: 0,
    unit: 'tCO2e',
    baselineYear: 2020,
    targetYear: 2030,
    owner: 'Sarah Chen',
    department: 'Operations',
    budget: '$2.5M',
    nextMilestone: 'Q3 Energy Audit',
    milestoneDue: '2025-09-15',
    risks: ['high', 'medium'],
    framework: 'SBTi',
    lastUpdated: '2025-05-15',
    trend: 'up'
  },
  {
    id: '2',
    title: 'Supply Chain Emissions Reduction',
    description: 'Collaborate with key suppliers to reduce Scope 3 emissions by 40% through partnership and procurement strategies.',
    category: 'supply-chain',
    scope: 'Scope 3',
    priority: 'high',
    status: 'at-risk',
    progress: 34,
    baselineValue: 25000,
    targetValue: 15000,
    unit: 'tCO2e',
    baselineYear: 2022,
    targetYear: 2028,
    owner: 'Michael Rodriguez',
    department: 'Procurement',
    budget: '$850K',
    nextMilestone: 'Supplier Assessment',
    milestoneDue: '2025-07-20',
    risks: ['high', 'medium', 'low'],
    framework: 'CDP',
    lastUpdated: '2025-05-10',
    trend: 'down'
  },
  {
    id: '3',
    title: '100% Renewable Energy Transition',
    description: 'Complete transition to renewable energy sources for all facilities, achieving 100% clean electricity consumption.',
    category: 'renewable-energy',
    scope: 'Scope 2',
    priority: 'high',
    status: 'on-track',
    progress: 68,
    baselineValue: 0,
    targetValue: 100,
    unit: '%',
    baselineYear: 2023,
    targetYear: 2027,
    owner: 'Emma Thompson',
    department: 'Facilities',
    budget: '$4.2M',
    nextMilestone: 'Solar Installation Phase 2',
    milestoneDue: '2025-08-01',
    risks: ['medium'],
    framework: 'RE100',
    lastUpdated: '2025-05-18',
    trend: 'up'
  }
];

interface ProfessionalGoalsListProps {
  scope?: string;
}

const ProfessionalGoalsList = ({ scope }: ProfessionalGoalsListProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [sortBy, setSortBy] = useState('priority');

  const filteredGoals = professionalGoals
    .filter(goal => scope ? goal.scope === scope : true)
    .filter(goal => 
      goal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      goal.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      goal.owner.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(goal => statusFilter === 'all' || goal.status === statusFilter)
    .filter(goal => priorityFilter === 'all' || goal.priority === priorityFilter);

  const getPriorityBadge = (priority: string) => {
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
      case 'on-track':
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            On Track
          </Badge>
        );
      case 'at-risk':
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
            {status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
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

  const handleDeleteGoal = (goalId: string) => {
    toast.success(`Goal #${goalId} deleted`);
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
                  <SelectItem value="on-track">On Track</SelectItem>
                  <SelectItem value="at-risk">At Risk</SelectItem>
                  <SelectItem value="behind">Behind</SelectItem>
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

      {/* Goals List */}
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
          filteredGoals.map(goal => (
            <Card key={goal.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="text-lg">{goal.title}</CardTitle>
                      {getTrendIcon(goal.trend)}
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{goal.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {getStatusBadge(goal.status)}
                      {getPriorityBadge(goal.priority)}
                      <Badge variant="outline">{goal.scope}</Badge>
                      <Badge variant="outline">{goal.framework}</Badge>
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
                      <span className="text-sm font-medium">{goal.progress}%</span>
                      <span className="text-xs text-muted-foreground">
                        ({goal.targetValue - goal.baselineValue > 0 ? '+' : ''}{Math.round((goal.targetValue - goal.baselineValue) * goal.progress / 100)} {goal.unit})
                      </span>
                    </div>
                  </div>
                  <Progress 
                    value={goal.progress} 
                    className={cn(
                      "h-2",
                      goal.status === 'on-track' && "text-green-600",
                      goal.status === 'at-risk' && "text-amber-600",
                      goal.status === 'behind' && "text-red-600"
                    )}
                  />
                </div>

                {/* Key Information Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Target</p>
                    <p className="font-medium">{goal.targetValue} {goal.unit} by {goal.targetYear}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Owner</p>
                    <p className="font-medium flex items-center">
                      <Users className="w-3 h-3 mr-1" />
                      {goal.owner}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Budget</p>
                    <p className="font-medium">{goal.budget}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Next Milestone</p>
                    <p className="font-medium flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      {goal.nextMilestone}
                    </p>
                  </div>
                </div>

                {/* Risk Indicators */}
                {goal.risks.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Risks:</span>
                    <div className="flex gap-1">
                      {goal.risks.map((risk, index) => (
                        <Badge 
                          key={index}
                          variant="outline"
                          className={cn(
                            "text-xs",
                            risk === 'high' && "border-red-300 text-red-700",
                            risk === 'medium' && "border-amber-300 text-amber-700",
                            risk === 'low' && "border-green-300 text-green-700"
                          )}
                        >
                          {risk}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
              
              <div className="border-t bg-muted/30 px-6 py-3">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <span>Milestone due: {new Date(goal.milestoneDue).toLocaleDateString()}</span>
                    <span>Department: {goal.department}</span>
                  </div>
                  <span>Updated: {new Date(goal.lastUpdated).toLocaleDateString()}</span>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default ProfessionalGoalsList;
