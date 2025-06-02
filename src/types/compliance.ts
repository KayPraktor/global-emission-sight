
export interface ComplianceDeadline {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  framework: string; // CDP, TCFD, CSRD, SBTi, etc.
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in-progress' | 'completed' | 'overdue';
  assignee?: string;
  estimatedHours?: number;
  completionPercentage: number;
  documents: string[];
  dependencies: string[];
}

export interface ComplianceFramework {
  id: string;
  name: string;
  description: string;
  deadlines: ComplianceDeadline[];
  requirements: string[];
}
