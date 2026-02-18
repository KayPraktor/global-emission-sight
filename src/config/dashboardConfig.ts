/**
 * @file Dashboard Configuration
 * @description Extracted constants for the main dashboard (Index.tsx).
 * Centralizes widget definitions and route mappings so the page component
 * stays lean and these values can be reused or extended.
 */

import React from 'react';
import {
  Activity,
  BarChart3,
  Bell,
  CheckCircle2,
  Clock,
  Shield,
  Target as TargetIcon,
  TrendingUp,
  Zap,
} from 'lucide-react';
import type { WidgetConfig } from '@/components/Dashboard/DashboardCustomizer';

/**
 * Default widget configuration for the dashboard customizer.
 * Each entry describes a toggleable dashboard section.
 */
export const WIDGET_CONFIGS: WidgetConfig[] = [
  { id: 'overview',       name: 'Emissions Overview',      description: 'Total emissions summary by scope',          icon: React.createElement(Activity,     { className: 'w-4 h-4' }), defaultVisible: true },
  { id: 'chart',          name: 'Emissions Chart',         description: 'Monthly emissions visualization',           icon: React.createElement(BarChart3,    { className: 'w-4 h-4' }), defaultVisible: true },
  { id: 'timeline',       name: 'Emissions Timeline',      description: 'Historical emissions trend',                icon: React.createElement(TrendingUp,   { className: 'w-4 h-4' }), defaultVisible: true },
  { id: 'quickWins',      name: 'Quick Wins',              description: 'Actionable reduction opportunities',        icon: React.createElement(Zap,          { className: 'w-4 h-4' }), defaultVisible: true },
  { id: 'notifications',  name: 'Live Activity',           description: 'Real-time updates and notifications',       icon: React.createElement(Bell,         { className: 'w-4 h-4' }), defaultVisible: true },
  { id: 'compliance',     name: 'Compliance Status',       description: 'Regulatory framework adherence',            icon: React.createElement(Shield,       { className: 'w-4 h-4' }), defaultVisible: true },
  { id: 'deadlines',      name: 'Upcoming Deadlines',      description: 'Critical submission dates',                 icon: React.createElement(Clock,        { className: 'w-4 h-4' }), defaultVisible: true },
  { id: 'dataQuality',    name: 'Data Quality',            description: 'Data completeness metrics',                 icon: React.createElement(CheckCircle2, { className: 'w-4 h-4' }), defaultVisible: true },
  { id: 'industryKPIs',   name: 'Industry KPIs',           description: 'Sector-specific metrics',                   icon: React.createElement(TargetIcon,   { className: 'w-4 h-4' }), defaultVisible: true },
  { id: 'performance',    name: 'Performance Intelligence', description: 'Strategic insights and tracking',          icon: React.createElement(BarChart3,    { className: 'w-4 h-4' }), defaultVisible: true },
];

/**
 * Maps compliance-framework keys to their detail route.
 * Used when a user clicks on an upcoming deadline card.
 */
export const DEADLINE_ROUTES: Record<string, string> = {
  cdp:  '/enterprise',
  tcfd: '/reports',
  ghg:  '/reports',
  csrd: '/compliance',
  cbam: '/reports',
  sbti: '/goals',
};
