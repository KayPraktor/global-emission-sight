import React, { useState, useEffect } from 'react';
import { GlassmorphismCard } from '@/components/ui/glassmorphism-card';
import { Badge } from '@/components/ui/badge';
import { Bell, AlertTriangle, CheckCircle, Target, TrendingUp, Clock } from 'lucide-react';
import { DataFreshness } from '@/components/ui/data-freshness';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';

interface Notification {
  id: string;
  type: 'anomaly' | 'compliance' | 'goal' | 'quality';
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'error';
  timestamp: string;
  actionUrl?: string;
}

const RealtimeNotificationsPanel: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
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

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'anomaly':
        return AlertTriangle;
      case 'compliance':
        return Clock;
      case 'goal':
        return Target;
      default:
        return Bell;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'error':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'warning':
        return 'text-amber-600 bg-amber-50 border-amber-200';
      default:
        return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  if (loading) {
    return (
      <GlassmorphismCard variant="light" className="p-6">
        <div className="animate-pulse space-y-3">
          <div className="h-6 bg-muted rounded w-1/3"></div>
          <div className="h-20 bg-muted rounded"></div>
          <div className="h-20 bg-muted rounded"></div>
        </div>
      </GlassmorphismCard>
    );
  }

  return (
    <GlassmorphismCard variant="light" className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Bell className="h-5 w-5 text-primary" />
          <div>
            <h4 className="font-medium">Live Activity Feed</h4>
            <p className="text-sm text-muted-foreground">Real-time updates on anomalies, compliance & goals</p>
          </div>
        </div>
        <DataFreshness lastUpdated={new Date()} />
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Bell className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm">No recent notifications</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          <AnimatePresence>
            {notifications.map((notification, index) => {
              const Icon = getNotificationIcon(notification.type);
              return (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                  className={`p-3 rounded-lg border cursor-pointer hover:bg-accent/50 transition-colors ${getSeverityColor(notification.severity)}`}
                  onClick={() => notification.actionUrl && navigate(notification.actionUrl)}
                >
                  <div className="flex items-start gap-3">
                    <Icon className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-medium text-sm">{notification.title}</p>
                        <Badge variant="outline" className="text-xs flex-shrink-0">
                          {notification.type}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{notification.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </GlassmorphismCard>
  );
};

export default RealtimeNotificationsPanel;
