
import { ComplianceDeadline, ComplianceFramework } from '@/types/compliance';

class ComplianceService {
  private deadlines: ComplianceDeadline[] = [];
  private frameworks: ComplianceFramework[] = [];

  getUpcomingDeadlines(days: number = 30): ComplianceDeadline[] {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() + days);

    return this.deadlines
      .filter(deadline => {
        const dueDate = new Date(deadline.dueDate);
        return dueDate <= cutoffDate && deadline.status !== 'completed';
      })
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }

  getOverdueDeadlines(): ComplianceDeadline[] {
    const now = new Date();
    return this.deadlines.filter(deadline => {
      const dueDate = new Date(deadline.dueDate);
      return dueDate < now && deadline.status !== 'completed';
    });
  }

  calculateComplianceScore(): number {
    const total = this.deadlines.length;
    const completed = this.deadlines.filter(d => d.status === 'completed').length;
    const overdue = this.getOverdueDeadlines().length;
    
    // Penalty for overdue items
    const score = ((completed - overdue * 0.5) / total) * 100;
    return Math.max(score, 0);
  }

  generateComplianceCalendar(year: number): ComplianceDeadline[] {
    // Generate recurring compliance deadlines for the year
    const calendar: ComplianceDeadline[] = [];

    // CDP Deadlines
    calendar.push({
      id: `cdp-${year}`,
      title: 'CDP Climate Change Questionnaire',
      description: 'Submit annual climate change disclosure to CDP',
      dueDate: `${year}-07-28`,
      framework: 'CDP',
      priority: 'high',
      status: 'pending',
      completionPercentage: 0,
      documents: [],
      dependencies: []
    });

    // TCFD Deadlines
    calendar.push({
      id: `tcfd-${year}`,
      title: 'TCFD Annual Report',
      description: 'Publish Task Force on Climate-related Financial Disclosures report',
      dueDate: `${year}-12-31`,
      framework: 'TCFD',
      priority: 'medium',
      status: 'pending',
      completionPercentage: 0,
      documents: [],
      dependencies: []
    });

    return calendar;
  }

  async loadComplianceFrameworks(): Promise<void> {
    this.frameworks = [
      {
        id: 'cdp',
        name: 'CDP (Carbon Disclosure Project)',
        description: 'Global disclosure system for environmental impacts',
        deadlines: [],
        requirements: [
          'Annual GHG emissions inventory',
          'Scope 1, 2, and 3 emissions data',
          'Climate risk assessment',
          'Reduction targets and progress'
        ]
      },
      {
        id: 'tcfd',
        name: 'Task Force on Climate-related Financial Disclosures',
        description: 'Framework for climate-related financial risk disclosures',
        deadlines: [],
        requirements: [
          'Governance structure for climate risks',
          'Climate risk strategy and impacts',
          'Risk management processes',
          'Metrics and targets for climate performance'
        ]
      }
    ];

    // Load current year deadlines
    this.deadlines = this.generateComplianceCalendar(new Date().getFullYear());
  }
}

export const complianceService = new ComplianceService();
