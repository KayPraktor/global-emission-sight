import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { CheckCheck, X, AlertTriangle, Sparkles, FileText, Target, Bell } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface NotificationListProps {
  notifications: any[];
  loading: boolean;
  onMarkAllRead: () => void;
  onRefresh: () => void;
}

export function NotificationList({ notifications, loading, onMarkAllRead, onRefresh }: NotificationListProps) {
  const navigate = useNavigate();
  const [processing, setProcessing] = useState<string | null>(null);

  const getIcon = (type: string) => {
    switch (type) {
      case 'anomaly': return <AlertTriangle className="h-4 w-4" />;
      case 'insight': return <Sparkles className="h-4 w-4" />;
      case 'report': return <FileText className="h-4 w-4" />;
      case 'goal': return <Target className="h-4 w-4" />;
      default: return null;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'error': return 'text-red-600';
      case 'warning': return 'text-orange-600';
      case 'success': return 'text-green-600';
      default: return 'text-blue-600';
    }
  };

  const handleNotificationClick = async (notification: any) => {
    setProcessing(notification.id);
    
    try {
      // Mark as read
      if (!notification.is_read) {
        await supabase
          .from('notifications')
          .update({ is_read: true, read_at: new Date().toISOString() })
          .eq('id', notification.id);
      }

      // Navigate if action URL exists
      if (notification.action_url) {
        navigate(notification.action_url);
      }

      onRefresh();
    } catch (error) {
      console.error('Error handling notification click:', error);
      toast.error('Failed to process notification');
    } finally {
      setProcessing(null);
    }
  };

  const handleDismiss = async (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation();
    setProcessing(notificationId);

    try {
      await supabase
        .from('notifications')
        .update({ is_dismissed: true, dismissed_at: new Date().toISOString() })
        .eq('id', notificationId);

      toast.success('Notification dismissed');
      onRefresh();
    } catch (error) {
      console.error('Error dismissing notification:', error);
      toast.error('Failed to dismiss notification');
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Loading notifications...
      </div>
    );
  }

  return (
    <div className="flex flex-col max-h-[600px]">
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="font-semibold">Notifications</h3>
        {notifications.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onMarkAllRead}
            className="text-xs"
          >
            <CheckCheck className="h-3 w-3 mr-1" />
            Mark all read
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="p-8 text-center text-muted-foreground">
          <Bell className="h-12 w-12 mx-auto mb-2 opacity-30" />
          <p>No notifications</p>
        </div>
      ) : (
        <ScrollArea className="flex-1">
          <div className="divide-y">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 hover:bg-muted/50 cursor-pointer transition-colors ${
                  !notification.is_read ? 'bg-blue-50/50 dark:bg-blue-950/20' : ''
                } ${processing === notification.id ? 'opacity-50' : ''}`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-1 ${getSeverityColor(notification.severity)}`}>
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium text-sm">{notification.title}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {notification.message}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 flex-shrink-0"
                        onClick={(e) => handleDismiss(e, notification.id)}
                        disabled={processing === notification.id}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        {notification.type}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
