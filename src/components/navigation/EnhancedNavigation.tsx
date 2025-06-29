
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import { 
  BarChart3, 
  FileSpreadsheet, 
  Target, 
  MonitorSmartphone,
  Zap,
  Settings,
  TrendingUp,
  Database,
  Shield,
  Users
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigationItems = [
  {
    title: 'Analytics',
    href: '/analytics',
    description: 'View comprehensive emissions analytics and insights',
    icon: BarChart3,
    items: [
      { title: 'Overview', href: '/analytics', description: 'Main analytics dashboard' },
      { title: 'Trends', href: '/analytics/trends', description: 'Emission trends analysis' },
      { title: 'Benchmarking', href: '/analytics/benchmarking', description: 'Compare with industry standards' },
    ]
  },
  {
    title: 'Reports',
    href: '/reports',
    description: 'Generate and manage emissions reports',
    icon: FileSpreadsheet,
    items: [
      { title: 'All Reports', href: '/reports', description: 'View all reports' },
      { title: 'Templates', href: '/reports/templates', description: 'Report templates' },
      { title: 'Scheduled', href: '/reports/scheduled', description: 'Automated reports' },
    ]
  },
  {
    title: 'Goals',
    href: '/goals',
    description: 'Set and track sustainability goals',
    icon: Target,
    items: [
      { title: 'Dashboard', href: '/goals', description: 'Goals overview' },
      { title: 'Targets', href: '/goals/targets', description: 'Emission targets' },
      { title: 'Progress', href: '/goals/progress', description: 'Track progress' },
    ]
  },
  {
    title: 'Tools',
    href: '/tools',
    description: 'Advanced tools and utilities',
    icon: Settings,
    items: [
      { title: 'Monitoring', href: '/monitoring', description: 'Real-time monitoring', icon: MonitorSmartphone },
      { title: 'AI Assistant', href: '/ai-assistant', description: 'AI-powered insights', icon: Zap },
      { title: 'Data Management', href: '/data-entry', description: 'Manage emissions data', icon: Database },
      { title: 'Compliance', href: '/compliance', description: 'Regulatory compliance', icon: Shield },
    ]
  }
];

export function EnhancedNavigation() {
  const location = useLocation();

  return (
    <NavigationMenu>
      <NavigationMenuList>
        {navigationItems.map((item) => (
          <NavigationMenuItem key={item.title}>
            <NavigationMenuTrigger 
              className={cn(
                navigationMenuTriggerStyle(),
                location.pathname.startsWith(item.href) && "bg-accent text-accent-foreground"
              )}
            >
              <item.icon className="mr-2 h-4 w-4" />
              {item.title}
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                <li className="row-span-3">
                  <NavigationMenuLink asChild>
                    <Link
                      className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                      to={item.href}
                    >
                      <item.icon className="h-6 w-6" />
                      <div className="mb-2 mt-4 text-lg font-medium">
                        {item.title}
                      </div>
                      <p className="text-sm leading-tight text-muted-foreground">
                        {item.description}
                      </p>
                    </Link>
                  </NavigationMenuLink>
                </li>
                {item.items.map((subItem) => (
                  <ListItem
                    key={subItem.title}
                    title={subItem.title}
                    href={subItem.href}
                  >
                    {subItem.description}
                  </ListItem>
                ))}
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  );
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a"> & { href: string; title: string }
>(({ className, title, children, href, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <Link
          ref={ref}
          to={href}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </Link>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";
