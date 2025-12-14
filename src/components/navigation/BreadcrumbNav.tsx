
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { ChevronLeft, Home } from 'lucide-react';
import { translations as t } from '@/lib/translations';

export function BreadcrumbNav() {
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(Boolean);
  
  // Build breadcrumb items
  const breadcrumbItems = [
    { path: '/', label: t.routes['/'], isHome: true }
  ];

  let currentPath = '';
  pathSegments.forEach(segment => {
    currentPath += `/${segment}`;
    const label = t.routes[currentPath as keyof typeof t.routes] || segment.charAt(0).toUpperCase() + segment.slice(1);
    breadcrumbItems.push({ path: currentPath, label, isHome: false });
  });

  // Don't show breadcrumb on home page
  if (location.pathname === '/') {
    return null;
  }

  return (
    <Breadcrumb className="mb-4">
      <BreadcrumbList>
        {breadcrumbItems.map((item, index) => (
          <React.Fragment key={item.path}>
            <BreadcrumbItem>
              {index === breadcrumbItems.length - 1 ? (
                <BreadcrumbPage className="flex items-center gap-1">
                  {item.isHome && <Home className="h-4 w-4" />}
                  {item.label}
                </BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link to={item.path} className="flex items-center gap-1 hover:text-foreground">
                    {item.isHome && <Home className="h-4 w-4" />}
                    {item.label}
                  </Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
            {index < breadcrumbItems.length - 1 && (
              <BreadcrumbSeparator>
                <ChevronLeft className="h-4 w-4" />
              </BreadcrumbSeparator>
            )}
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
