/**
 * @file ComplianceStatusWidget
 * @description Extracted from Index.tsx — renders the compliance framework
 * status cards and the upcoming-deadlines list side by side.
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, Clock, Info, Shield, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProgressBar } from '@/components/ui/loading-states';
import { Tooltip } from '@/components/ui/feedback-system';
import { SectionHeader } from '@/components/ui/section-header';
import { StaggeredList } from '@/components/ui/page-transitions';
import { DraggableWidget } from '@/components/Dashboard/DraggableWidget';
import type { FrameworkStatus, UpcomingDeadline } from '@/services/complianceTrackingService';
import { DEADLINE_ROUTES } from '@/config/dashboardConfig';
import { toast } from 'sonner';

interface ComplianceStatusWidgetProps {
  frameworkStatuses: FrameworkStatus[];
  deadlines: UpcomingDeadline[];
  isCustomizeMode: boolean;
  isWidgetVisible: (id: string) => boolean;
  toggleWidgetVisibility: (id: string) => void;
}

const getFrameworkStyles = (color: string) => {
  if (color === 'emerald') return {
    border: 'border-l-emerald-500', bg: 'from-emerald-500/5 to-transparent',
    iconBg: 'bg-emerald-500/10', iconText: 'text-emerald-600',
    badge: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  };
  if (color === 'amber') return {
    border: 'border-l-amber-500', bg: 'from-amber-500/5 to-transparent',
    iconBg: 'bg-amber-500/10', iconText: 'text-amber-600',
    badge: 'bg-amber-100 text-amber-700 border-amber-200',
  };
  return {
    border: 'border-l-muted', bg: 'from-muted/5 to-transparent',
    iconBg: 'bg-muted/10', iconText: 'text-muted-foreground',
    badge: 'bg-muted text-muted-foreground border-border',
  };
};

const getUrgencyStyles = (urgency: string) => {
  if (urgency === 'high') return {
    border: 'border-l-destructive', bg: 'from-destructive/5 to-transparent',
    dot: 'bg-destructive shadow-destructive/50',
    daysBadge: 'bg-destructive/10 text-destructive border-destructive/20',
  };
  if (urgency === 'medium') return {
    border: 'border-l-amber-500', bg: 'from-amber-500/5 to-transparent',
    dot: 'bg-amber-500 shadow-amber-500/50',
    daysBadge: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  };
  return {
    border: 'border-l-emerald-500', bg: 'from-emerald-500/5 to-transparent',
    dot: 'bg-emerald-500 shadow-emerald-500/50',
    daysBadge: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  };
};

export const ComplianceStatusWidget: React.FC<ComplianceStatusWidgetProps> = ({
  frameworkStatuses,
  deadlines,
  isCustomizeMode,
  isWidgetVisible,
  toggleWidgetVisibility,
}) => {
  const navigate = useNavigate();

  const handleDeadlineClick = (deadline: UpcomingDeadline) => {
    const route =
      deadline.linkedRoute ||
      (deadline.framework ? DEADLINE_ROUTES[deadline.framework.toLowerCase()] : null) ||
      '/compliance';
    toast.success(`Navigating to ${deadline.title}`, { description: 'Opening the relevant section for this deadline.' });
    navigate(route);
  };

  if (!isWidgetVisible('compliance') && !isWidgetVisible('deadlines')) return null;

  return (
    <>
      <SectionHeader
        icon={Shield}
        title="Primary Actions"
        subtitle="Critical compliance and deadline management"
        helpText="Monitor your organization's compliance status and upcoming regulatory deadlines to ensure continuous adherence to carbon reporting standards."
        lastUpdated="2025-01-15T14:30:00Z"
      />

      <StaggeredList className="grid grid-cols-1 lg:grid-cols-2 gap-6" staggerDelay={0.1}>
        {/* Compliance Status */}
        {isWidgetVisible('compliance') && (
          <DraggableWidget
            id="compliance"
            title="Compliance Status"
            isCustomizeMode={isCustomizeMode}
            isVisible={isWidgetVisible('compliance')}
            onRemove={() => toggleWidgetVisibility('compliance')}
          >
            <div className="rounded-xl border bg-card overflow-hidden h-full flex flex-col">
              <div className="p-4 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 ring-1 ring-inset ring-primary/20">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Compliance Status</h4>
                    <p className="text-xs text-muted-foreground">Regulatory framework adherence</p>
                  </div>
                </div>
              </div>
              <div className="p-4 space-y-2 flex-1">
                {frameworkStatuses.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Shield className="h-8 w-8 text-muted-foreground mb-3" />
                    <p className="text-sm font-medium mb-1">No compliance data yet</p>
                    <p className="text-xs text-muted-foreground mb-3">Generate reports to track framework compliance</p>
                    <Button size="sm" variant="outline" onClick={() => navigate('/reports')}>Go to Reports</Button>
                  </div>
                ) : (
                  frameworkStatuses.map((item, index) => {
                    const styles = getFrameworkStyles(item.color);
                    const IconComp = item.status === 'compliant' ? CheckCircle2 : item.status === 'not_started' ? Info : Clock;
                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.01 }}
                        className={`p-3 rounded-xl border border-l-4 ${styles.border} bg-gradient-to-r ${styles.bg} transition-all duration-200 hover:shadow-sm cursor-pointer`}
                      >
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center gap-2">
                            <div className={`p-1.5 rounded-lg ${styles.iconBg}`}>
                              <IconComp className={`h-3.5 w-3.5 ${styles.iconText}`} />
                            </div>
                            <span className="text-sm font-medium">{item.name}</span>
                          </div>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${styles.badge}`}>{item.statusLabel}</span>
                        </div>
                        <ProgressBar value={item.progress} showLabel={false} className="h-1.5" />
                      </motion.div>
                    );
                  })
                )}
              </div>
            </div>
          </DraggableWidget>
        )}

        {/* Upcoming Deadlines */}
        {isWidgetVisible('deadlines') && (
          <DraggableWidget
            id="deadlines"
            title="Upcoming Deadlines"
            isCustomizeMode={isCustomizeMode}
            isVisible={isWidgetVisible('deadlines')}
            onRemove={() => toggleWidgetVisibility('deadlines')}
          >
            <div className="rounded-xl border bg-card overflow-hidden h-full flex flex-col">
              <div className="p-4 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 ring-1 ring-inset ring-primary/20">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Upcoming Deadlines</h4>
                    <p className="text-xs text-muted-foreground">Critical regulatory submissions</p>
                  </div>
                </div>
              </div>
              <div className="p-4 space-y-2 flex-1">
                {deadlines.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Clock className="h-8 w-8 text-muted-foreground mb-3" />
                    <p className="text-sm font-medium mb-1">No upcoming deadlines</p>
                    <p className="text-xs text-muted-foreground mb-3">Add compliance deadlines to track regulatory submissions</p>
                    <Button size="sm" variant="outline" onClick={() => navigate('/compliance')}>Manage Deadlines</Button>
                  </div>
                ) : (
                  deadlines.map((item, index) => {
                    const styles = getUrgencyStyles(item.urgency);
                    return (
                      <Tooltip key={item.id} content={`Priority: ${item.priority} • ${item.daysRemaining} days remaining`}>
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ scale: 1.01 }}
                          className={`p-3 rounded-xl border border-l-4 ${styles.border} bg-gradient-to-r ${styles.bg} cursor-pointer transition-all duration-200 hover:shadow-sm group`}
                          onClick={() => handleDeadlineClick(item)}
                          role="button"
                          tabIndex={0}
                          aria-label={`Navigate to ${item.title} deadline details`}
                          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleDeadlineClick(item); } }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`w-2.5 h-2.5 rounded-full ${styles.dot} shadow-sm`} />
                              <div>
                                <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{item.title}</span>
                                <div className="text-xs text-muted-foreground">{new Date(item.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`text-xs px-2 py-0.5 rounded-full font-mono font-medium border ${styles.daysBadge}`}>{item.daysRemaining}d</span>
                              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                            </div>
                          </div>
                        </motion.div>
                      </Tooltip>
                    );
                  })
                )}
              </div>
            </div>
          </DraggableWidget>
        )}
      </StaggeredList>
    </>
  );
};
