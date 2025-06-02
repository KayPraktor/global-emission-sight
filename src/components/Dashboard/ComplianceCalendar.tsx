
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calendar, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { ComplianceDeadline } from '@/types/compliance';

interface ComplianceCalendarProps {
  deadlines: ComplianceDeadline[];
}

const ComplianceCalendar: React.FC<ComplianceCalendarProps> = ({ deadlines }) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-amber-100 text-amber-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'overdue': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'in-progress': return <Clock className="w-4 h-4 text-amber-500" />;
      default: return <Calendar className="w-4 h-4 text-gray-500" />;
    }
  };

  const getDaysUntilDue = (dueDate: string) => {
    const due = new Date(dueDate);
    const now = new Date();
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Calendar className="w-5 h-5 mr-2" />
          Compliance Calendar
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {deadlines.map((deadline) => {
            const daysUntil = getDaysUntilDue(deadline.dueDate);
            
            return (
              <div key={deadline.id} className="p-4 border rounded-lg hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      {getStatusIcon(deadline.status)}
                      <h4 className="font-medium">{deadline.title}</h4>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{deadline.description}</p>
                    <div className="flex items-center space-x-2">
                      <Badge className={getPriorityColor(deadline.priority)}>
                        {deadline.priority}
                      </Badge>
                      <Badge variant="outline">{deadline.framework}</Badge>
                      {deadline.assignee && (
                        <Badge variant="outline">
                          Assigned: {deadline.assignee}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {daysUntil > 0 ? `${daysUntil} days` : `${Math.abs(daysUntil)} days overdue`}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(deadline.dueDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>Progress</span>
                    <span>{deadline.completionPercentage}%</span>
                  </div>
                  <Progress value={deadline.completionPercentage} className="h-2" />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default ComplianceCalendar;
