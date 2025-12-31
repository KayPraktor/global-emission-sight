import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bell, AlertTriangle, Target, Clock, CheckCheck, ExternalLink, X, Activity } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface Notification {
  id: string;
  type: 'anomaly' | 'compliance' | 'goal' | 'quality';
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'error';
  timestamp: string;
  actionUrl?: string;
  isNew?: boolean;
}

// Live indicator component with pulsing animation
const LiveIndicator = () => (
  <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-destructive/10">
    <span className="relative flex h-2 w-2">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
      <span className="relative inline-flex rounded-full h-2 w-2 bg-destructive"></span>
    </span>
    <span className="text-xs font-semibold text-destructive uppercase tracking-wide">Live</span>
  </div>
);

// Notification card component
interface NotificationCardProps {
  notification: Notification;
  index: number;
  onView: () => void;
  onDismiss: () => void;
}

const NotificationCard: React.FC<NotificationCardProps> = ({ notification, index, onView, onDismiss }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const getIcon = (type: string) => {
    switch (type) {
      case 'anomaly': return AlertTriangle;
      case 'compliance': return Clock;
      case 'goal': return Target;
      default: return Bell;
    }
  };

  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case 'error':
        return {
          border: 'border-l-destructive',
          bg: 'from-destructive/5 to-transparent dark:from-destructive/10',
          iconBg: 'bg-destructive/10',
          iconColor: 'text-destructive',
          hoverBorder: 'hover:border-destructive/50'
        };
      case 'warning':
        return {
          border: 'border-l-amber-500',
          bg: 'from-amber-500/5 to-transparent dark:from-amber-500/10',
          iconBg: 'bg-amber-500/10',
          iconColor: 'text-amber-600 dark:text-amber-500',
          hoverBorder: 'hover:border-amber-500/50'
        };
      default:
        return {
          border: 'border-l-primary',
          bg: 'from-primary/5 to-transparent dark:from-primary/10',
          iconBg: 'bg-primary/10',
          iconColor: 'text-primary',
          hoverBorder: 'hover:border-primary/50'
        };
    }
  };

  const getTypeBadgeStyles = (type: string) => {
    switch (type) {
      case 'anomaly': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'compliance': return 'bg-amber-500/10 text-amber-600 dark:text-amber-500 border-amber-500/20';
      case 'goal': return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 border-emerald-500/20';
      default: return 'bg-primary/10 text-primary border-primary/20';
    }
  };

  const Icon = getIcon(notification.type);
  const styles = getSeverityStyles(notification.severity);
  const isRecent = new Date().getTime() - new Date(notification.timestamp).getTime() < 60000; // 1 minute

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className={cn(
        "relative rounded-lg border border-l-4 bg-gradient-to-r cursor-pointer transition-all duration-200",
        styles.border,
        styles.bg,
        styles.hoverBorder,
        "border-border/50",
        isHovered && "shadow-md scale-[1.01]",
        isRecent && "ring-2 ring-primary/20 ring-offset-1 ring-offset-background"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onView}
    >
      {/* New notification glow effect */}
      {isRecent && (
        <motion.div
          className="absolute inset-0 rounded-lg bg-primary/5"
          initial={{ opacity: 0.5 }}
          animate={{ opacity: [0.5, 0.2, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}

      <div className="relative p-4">
        <div className="flex items-start gap-3">
          {/* Icon with colored background */}
          <div className={cn(
            "flex-shrink-0 p-2 rounded-lg",
            styles.iconBg
          )}>
            <Icon className={cn("h-4 w-4", styles.iconColor)} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-sm text-foreground truncate">
                    {notification.title}
                  </h4>
                  {isRecent && (
                    <span className="flex-shrink-0 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-primary text-primary-foreground">
                      New
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {notification.description}
                </p>
              </div>

              {/* Type badge */}
              <Badge 
                variant="outline" 
                className={cn(
                  "flex-shrink-0 text-[10px] font-medium uppercase tracking-wide border",
                  getTypeBadgeStyles(notification.type)
                )}
              >
                {notification.type}
              </Badge>
            </div>

            {/* Footer with timestamp and hover actions */}
            <div className="flex items-center justify-between mt-2">
              <span className="text-[11px] text-muted-foreground">
                {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
              </span>

              {/* Action buttons - visible on hover */}
              <AnimatePresence>
                {isHovered && (
                  <motion.div
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="flex items-center gap-1"
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs gap-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        onView();
                      }}
                    >
                      <ExternalLink className="h-3 w-3" />
                      View
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs text-muted-foreground hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDismiss();
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Loading skeleton
const NotificationSkeleton = () => (
  <div className="space-y-3">
    {[0, 1, 2].map((i) => (
      <div 
        key={i} 
        className="rounded-lg border border-l-4 border-l-muted p-4 animate-pulse"
        style={{ animationDelay: `${i * 150}ms` }}
      >
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-muted" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-muted rounded w-2/3" />
            <div className="h-3 bg-muted rounded w-full" />
            <div className="h-3 bg-muted rounded w-1/4" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

// Empty state
const EmptyState = () => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="flex flex-col items-center justify-center py-12 text-center"
  >
    <motion.div
      animate={{ 
        y: [0, -5, 0],
        rotate: [0, 5, -5, 0]
      }}
      transition={{ 
        duration: 2,
        repeat: Infinity,
        repeatType: "reverse"
      }}
      className="mb-4 p-4 rounded-full bg-muted"
    >
      <Bell className="h-8 w-8 text-muted-foreground" />
    </motion.div>
    <h4 className="font-semibold text-foreground mb-1">All caught up!</h4>
    <p className="text-sm text-muted-foreground max-w-[200px]">
      No new notifications. We'll alert you when something needs attention.
    </p>
  </motion.div>
);

const RealtimeNotificationsPanel: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: orgMember } = await supabase
          .from('organization_members')
          .select('organization_id')
          .eq('user_id', user.id)
          .single();

        if (!orgMember) return;

        const allNotifications: Notification[] = [];

        // Fetch recent anomalies (last 7 days)
        const { data: anomalies } = await supabase
          .from('emissions_anomalies')
          .select('*')
          .eq('user_id', user.id)
          .gte('detected_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
          .order('detected_at', { ascending: false })
          .limit(5);

        anomalies?.forEach(anomaly => {
          allNotifications.push({
            id: anomaly.id,
            type: 'anomaly',
            title: anomaly.anomaly_type,
            description: anomaly.description || 'Anomaly detected in emissions data',
            severity: anomaly.severity === 'critical' ? 'error' : anomaly.severity === 'high' ? 'warning' : 'info',
            timestamp: anomaly.detected_at || anomaly.created_at || new Date().toISOString(),
            actionUrl: '/analytics?tab=anomalies'
          });
        });

        // Fetch upcoming compliance deadlines (next 30 days)
        const { data: deadlines } = await supabase
          .from('compliance_deadlines')
          .select('*')
          .eq('organization_id', orgMember.organization_id)
          .gte('due_date', new Date().toISOString())
          .lte('due_date', new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString())
          .order('due_date', { ascending: true })
          .limit(3);

        deadlines?.forEach(deadline => {
          allNotifications.push({
            id: deadline.id,
            type: 'compliance',
            title: deadline.title,
            description: `Due ${formatDistanceToNow(new Date(deadline.due_date), { addSuffix: true })}`,
            severity: deadline.priority === 'high' || deadline.priority === 'critical' ? 'error' : 'warning',
            timestamp: deadline.created_at || new Date().toISOString(),
            actionUrl: '/enterprise'
          });
        });

        // Fetch recent goal achievements
        const { data: goals } = await supabase
          .from('goals')
          .select('*')
          .eq('organization_id', orgMember.organization_id)
          .gte('progress_percentage', 25)
          .order('updated_at', { ascending: false })
          .limit(3);

        goals?.forEach(goal => {
          const progress = goal.progress_percentage || 0;
          if (progress >= 25 && progress % 25 === 0) {
            allNotifications.push({
              id: goal.id,
              type: 'goal',
              title: `${progress}% milestone reached`,
              description: goal.title,
              severity: 'info',
              timestamp: goal.updated_at,
              actionUrl: '/goals'
            });
          }
        });

        // Sort by timestamp
        allNotifications.sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );

        setNotifications(allNotifications.slice(0, 8));
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();

    // Set up real-time subscriptions
    const anomalyChannel = supabase
      .channel('anomaly-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'emissions_anomalies'
        },
        () => fetchNotifications()
      )
      .subscribe();

    const deadlineChannel = supabase
      .channel('deadline-notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'compliance_deadlines'
        },
        () => fetchNotifications()
      )
      .subscribe();

    const goalChannel = supabase
      .channel('goal-notifications')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'goals'
        },
        () => fetchNotifications()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(anomalyChannel);
      supabase.removeChannel(deadlineChannel);
      supabase.removeChannel(goalChannel);
    };
  }, []);

  const visibleNotifications = notifications.filter(n => !dismissedIds.has(n.id));
  const unreadCount = visibleNotifications.length;

  const handleDismiss = (id: string) => {
    setDismissedIds(prev => new Set([...prev, id]));
  };

  const handleMarkAllRead = () => {
    setDismissedIds(new Set(notifications.map(n => n.id)));
  };

  const handleView = (notification: Notification) => {
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
  };

  return (
    <div className="rounded-xl border border-border/50 bg-card shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border/50 bg-gradient-to-r from-muted/30 to-transparent">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Icon container */}
            <div className="relative p-2.5 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 ring-1 ring-primary/10">
              <Activity className="h-5 w-5 text-primary" />
            </div>
            
            {/* Title and live indicator */}
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-foreground">Activity Feed</h3>
                <LiveIndicator />
                {unreadCount > 0 && (
                  <Badge 
                    variant="secondary" 
                    className="h-5 min-w-[20px] px-1.5 text-[10px] font-bold"
                  >
                    {unreadCount}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Anomalies, compliance & goals
              </p>
            </div>
          </div>

          {/* Mark all read button */}
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs gap-1.5 text-muted-foreground hover:text-foreground"
              onClick={handleMarkAllRead}
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Clear all
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {loading ? (
          <NotificationSkeleton />
        ) : visibleNotifications.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
            <AnimatePresence mode="popLayout">
              {visibleNotifications.map((notification, index) => (
                <NotificationCard
                  key={notification.id}
                  notification={notification}
                  index={index}
                  onView={() => handleView(notification)}
                  onDismiss={() => handleDismiss(notification.id)}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default RealtimeNotificationsPanel;
