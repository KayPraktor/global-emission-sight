
import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface Notification {
  id: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
  type: 'info' | 'warning' | 'success' | 'error';
}

const notifications: Notification[] = [
  {
    id: '1',
    title: 'Data Collection Complete',
    description: 'Q1 emissions data collection is now complete.',
    time: '1h ago',
    read: false,
    type: 'success'
  },
  {
    id: '2',
    title: 'Reporting Deadline',
    description: 'CDP submission deadline is approaching in 2 weeks.',
    time: '3h ago',
    read: false,
    type: 'warning'
  },
  {
    id: '3',
    title: 'System Update',
    description: 'Emissions tracking system has been updated to v2.4',
    time: '1d ago',
    read: true,
    type: 'info'
  }
];

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notification[]>(notifications);
  
  const unreadCount = items.filter(item => !item.read).length;
  
  const markAllAsRead = () => {
    setItems(items.map(item => ({ ...item, read: true })));
  };
  
  const markAsRead = (id: string) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, read: true } : item
    ));
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-primary" 
              variant="default"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4">
          <h4 className="text-sm font-semibold">Notifications</h4>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              className="text-xs h-auto p-1" 
              onClick={markAllAsRead}
            >
              Mark all as read
            </Button>
          )}
        </div>
        <Separator />
        <div className="max-h-80 overflow-y-auto">
          {items.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No notifications
            </div>
          ) : (
            <div className="grid gap-1">
              {items.map((notification) => (
                <button
                  key={notification.id}
                  className={cn(
                    "flex flex-col w-full gap-1 p-4 text-left text-sm transition-colors hover:bg-accent",
                    notification.read ? "opacity-70" : ""
                  )}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-center justify-between">
                    <h5 className="font-medium">{notification.title}</h5>
                    <span className="text-xs text-muted-foreground">{notification.time}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {notification.description}
                  </p>
                  {!notification.read && (
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
        <Separator />
        <div className="p-2">
          <Button variant="outline" className="w-full text-xs" size="sm">
            View all notifications
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
