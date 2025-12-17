# Developer Onboarding Guide

## Table of Contents
1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Development Environment Setup](#development-environment-setup)
4. [Codebase Structure](#codebase-structure)
5. [Key Components](#key-components)
6. [Database Architecture](#database-architecture)
7. [Authentication & Authorization](#authentication--authorization)
8. [Edge Functions](#edge-functions)
9. [Development Workflow](#development-workflow)
10. [Common Patterns](#common-patterns)

---

## Project Overview

This is an **Enterprise Carbon Emissions Management Platform** - a full-stack SaaS application for tracking, analyzing, and reporting corporate carbon emissions. Key capabilities include:

- Multi-tenant organization management with role-based access control
- Emissions data entry with industry-specific workflows
- AI-powered insights and anomaly detection
- Compliance tracking (including Iran-specific regulations with Jalali calendar)
- Scenario planning and forecasting
- Automated reporting (PDF/Excel generation)
- Data approval workflows

---

## Technology Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **React 18** | UI framework |
| **TypeScript** | Type safety |
| **Vite** | Build tool & dev server |
| **Tailwind CSS** | Utility-first styling |
| **shadcn/ui** | Component library (Radix UI based) |
| **TanStack Query** | Server state management |
| **React Router v6** | Client-side routing |
| **Recharts / Chart.js** | Data visualization |
| **Framer Motion** | Animations |

### Backend (Lovable Cloud / Supabase)
| Technology | Purpose |
|------------|---------|
| **PostgreSQL** | Database |
| **Supabase Auth** | Authentication |
| **Edge Functions** | Serverless API (Deno/TypeScript) |
| **Row Level Security (RLS)** | Data isolation |
| **pg_cron** | Scheduled jobs |

### Key Libraries
```json
{
  "@tanstack/react-query": "Server state & caching",
  "react-hook-form": "Form management",
  "zod": "Schema validation",
  "date-fns": "Date manipulation",
  "jalali-moment": "Persian calendar support",
  "jspdf": "PDF generation",
  "xlsx": "Excel export",
  "docx": "Word document generation"
}
```

---

## Development Environment Setup

### Prerequisites
- Node.js 18+ (recommended: use nvm)
- npm or bun
- Git

### Initial Setup

```bash
# 1. Clone the repository
git clone <repository-url>
cd <project-directory>

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Environment Variables
The `.env` file is auto-managed by Lovable Cloud:
```env
VITE_SUPABASE_URL=<auto-configured>
VITE_SUPABASE_PUBLISHABLE_KEY=<auto-configured>
VITE_SUPABASE_PROJECT_ID=<auto-configured>
```

> ⚠️ **Never edit `.env` manually** - it's auto-generated.

### Key NPM Scripts
```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

---

## Codebase Structure

```
├── src/
│   ├── components/           # React components
│   │   ├── ui/              # shadcn/ui base components
│   │   ├── Analytics/       # Analytics page components
│   │   ├── Dashboard/       # Dashboard widgets
│   │   ├── EmissionsForm/   # Data entry wizard
│   │   ├── Enterprise/      # Executive dashboard
│   │   ├── Facilities/      # Facility management
│   │   ├── Goals/           # Goals tracking
│   │   ├── Industry/        # Industry-specific features
│   │   ├── Reports/         # Report generation
│   │   ├── Scenarios/       # Scenario planning
│   │   ├── admin/           # Admin panel components
│   │   ├── auth/            # Authentication components
│   │   ├── layouts/         # Page layouts
│   │   ├── navigation/      # Sidebar, breadcrumbs
│   │   ├── notifications/   # Notification system
│   │   ├── onboarding/      # User onboarding
│   │   └── settings/        # Settings page components
│   │
│   ├── pages/               # Route pages
│   │   ├── Index.tsx        # Main dashboard
│   │   ├── EnterpriseIndex.tsx  # Executive dashboard
│   │   ├── AdvancedAnalyticsPage.tsx
│   │   ├── DataEntryPage.tsx
│   │   ├── FacilitiesPage.tsx
│   │   ├── GoalsPage.tsx
│   │   ├── ReportsPage.tsx
│   │   ├── ScenarioPlanningPage.tsx
│   │   ├── AdminPage.tsx
│   │   ├── SettingsPage.tsx
│   │   ├── ApprovalsPage.tsx
│   │   ├── AuthPage.tsx
│   │   └── LandingPage.tsx
│   │
│   ├── services/            # Business logic & API calls
│   │   ├── emissionsService.ts
│   │   ├── facilityService.ts
│   │   ├── goalsService.ts
│   │   ├── analyticsService.ts
│   │   ├── approvalService.ts
│   │   └── ...
│   │
│   ├── hooks/               # Custom React hooks
│   │   ├── use-mobile.tsx
│   │   ├── use-toast.ts
│   │   ├── useRoles.ts
│   │   └── ...
│   │
│   ├── contexts/            # React contexts
│   │   ├── AuthContext.tsx
│   │   ├── OnboardingContext.tsx
│   │   └── AnalyticsFilterContext.tsx
│   │
│   ├── types/               # TypeScript types
│   │   ├── emissions.ts
│   │   ├── database.ts
│   │   └── ...
│   │
│   ├── data/                # Static configuration data
│   │   ├── industryConfig.ts
│   │   ├── industryWorkflows.ts
│   │   └── ...
│   │
│   ├── utils/               # Utility functions
│   │   ├── csvParser.ts
│   │   ├── csvExport.ts
│   │   └── ...
│   │
│   ├── integrations/
│   │   └── supabase/
│   │       ├── client.ts    # Supabase client (DO NOT EDIT)
│   │       └── types.ts     # Generated types (DO NOT EDIT)
│   │
│   ├── lib/
│   │   └── utils.ts         # cn() helper & utilities
│   │
│   ├── App.tsx              # Root component & routing
│   ├── main.tsx             # Entry point
│   └── index.css            # Global styles & design tokens
│
├── supabase/
│   ├── config.toml          # Supabase config (DO NOT EDIT)
│   └── functions/           # Edge Functions
│       ├── generate-emissions-insights/
│       ├── run-anomaly-scan/
│       ├── run-quality-scan/
│       ├── calculate-enterprise-metrics/
│       ├── validate-data-quality/
│       └── send-weekly-report/
│
├── public/                  # Static assets
├── tailwind.config.ts       # Tailwind configuration
├── vite.config.ts           # Vite configuration
└── package.json
```

---

## Key Components

### Layout & Navigation

#### `DashboardLayout.tsx`
Main application shell with sidebar navigation.

```tsx
<SidebarProvider>
  <DashboardLayout>
    <YourPageContent />
  </DashboardLayout>
</SidebarProvider>
```

#### `AppSidebar.tsx`
Navigation sidebar with collapsible groups:
- Overview (Dashboard, Enterprise)
- Data Management (Data Entry, Facilities, Emission Factors)
- Analysis (Analytics, Scenario Planning, Goals)
- Reporting (Reports, Approvals)
- Administration (Admin, Settings)

### Data Entry

#### `EmissionsWizard.tsx` / `IndustryAwareWizard.tsx`
Multi-step wizard for emissions data entry:
1. Basic Info (scope, category, date)
2. Activity Details (quantity, unit)
3. Facility Selection
4. Emission Factor Selection
5. Calculations & Review
6. Confirmation

The industry-aware version dynamically loads workflows based on user's organization industry.

### Analytics Components

| Component | Purpose |
|-----------|---------|
| `AnalyticsOverview.tsx` | Summary metrics and trends |
| `AnomalyDetectionPanel.tsx` | Display detected anomalies |
| `AIInsightsPanel.tsx` | AI-generated recommendations |
| `BenchmarkingDashboard.tsx` | Industry comparisons |
| `ForecastInsightsPanel.tsx` | Emissions forecasting |
| `DataQualityDashboard.tsx` | Data quality metrics |
| `IndustryComplianceCalendar.tsx` | Compliance deadlines |

### Dashboard Widgets

| Widget | Purpose |
|--------|---------|
| `EmissionsOverview.tsx` | Total emissions by scope |
| `EmissionsChart.tsx` | Time-series visualization |
| `TargetsWidget.tsx` | Goal progress tracking |
| `QualityAlertsWidget.tsx` | Data quality warnings |
| `InsightsNextActions.tsx` | Actionable recommendations |

---

## Database Architecture

### Core Tables

```
┌─────────────────────┐     ┌─────────────────────┐
│   organizations     │────<│ organization_members │
└─────────────────────┘     └─────────────────────┘
         │                           │
         │                           │
         ▼                           ▼
┌─────────────────────┐     ┌─────────────────────┐
│    facilities       │     │      profiles       │
└─────────────────────┘     └─────────────────────┘
         │
         │
         ▼
┌─────────────────────┐     ┌─────────────────────┐
│  emissions_entries  │────>│  emission_factors   │
└─────────────────────┘     └─────────────────────┘
         │
         │
         ▼
┌─────────────────────┐
│    calculations     │
└─────────────────────┘
```

### Key Tables

| Table | Purpose |
|-------|---------|
| `organizations` | Tenant/company records |
| `organization_members` | User-org relationships with roles |
| `profiles` | User profile data |
| `facilities` | Physical locations |
| `emissions_entries` | Raw emissions data |
| `emission_factors` | Conversion factors |
| `calculations` | Computed emissions (tCO2e) |
| `goals` | Reduction targets |
| `reports` | Generated reports metadata |
| `approval_requests` | Data approval workflow |
| `emissions_insights` | AI-generated insights |
| `emissions_anomalies` | Detected anomalies |
| `notifications` | User notifications |

### Multi-Tenant Pattern

All data tables include `organization_id` for tenant isolation:

```typescript
// Always include organization_id in queries
const { data } = await supabase
  .from('emissions_entries')
  .select('*')
  .eq('organization_id', organizationId);
```

---

## Authentication & Authorization

### Auth Flow

```tsx
// AuthContext provides user state
const { user, session, signIn, signOut } = useAuth();

// ProtectedRoute wraps authenticated pages
<ProtectedRoute>
  <DashboardLayout>...</DashboardLayout>
</ProtectedRoute>
```

### Role-Based Access Control

Roles: `owner`, `admin`, `member`, `viewer`

```typescript
// useRoles hook
const { role, isOwner, isAdmin, canApprove } = useRoles();

// Check permissions
if (canApprove) {
  // Show approval actions
}
```

### RLS Policies

All tables have Row Level Security policies:

```sql
-- Example: Users can only see their organization's data
CREATE POLICY "Users can view own org data"
ON emissions_entries FOR SELECT
USING (organization_id = get_user_organization(auth.uid()));
```

---

## Edge Functions

Located in `supabase/functions/`:

| Function | Trigger | Purpose |
|----------|---------|---------|
| `generate-emissions-insights` | Manual/Scheduled | AI insight generation |
| `run-anomaly-scan` | Daily (pg_cron) | Detect data anomalies |
| `run-quality-scan` | Daily (pg_cron) | Calculate quality scores |
| `calculate-enterprise-metrics` | Daily (pg_cron) | Aggregate KPIs |
| `validate-data-quality` | On insert | Real-time validation |
| `send-weekly-report` | Weekly (pg_cron) | Email reports |
| `analyze-onboarding-input` | Manual | AI onboarding analysis |

### Invoking Edge Functions

```typescript
const { data, error } = await supabase.functions.invoke(
  'generate-emissions-insights',
  {
    body: { userId, organizationId }
  }
);
```

---

## Development Workflow

### Adding a New Feature

1. **Plan the data model** - What tables/columns needed?
2. **Create migration** - Use Lovable's migration tool
3. **Add RLS policies** - Ensure data security
4. **Create service** - `src/services/newFeatureService.ts`
5. **Build components** - `src/components/NewFeature/`
6. **Add route** - Update `App.tsx` if new page
7. **Update navigation** - Add to `AppSidebar.tsx`

### Service Pattern

```typescript
// src/services/exampleService.ts
import { supabase } from '@/integrations/supabase/client';

export const exampleService = {
  async getAll(organizationId: string) {
    const { data, error } = await supabase
      .from('examples')
      .select('*')
      .eq('organization_id', organizationId);
    
    if (error) throw error;
    return data;
  },

  async create(item: CreateExampleInput) {
    const { data, error } = await supabase
      .from('examples')
      .insert(item)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};
```

### Component Pattern

```tsx
// src/components/Example/ExampleList.tsx
import { useQuery } from '@tanstack/react-query';
import { exampleService } from '@/services/exampleService';

export function ExampleList({ organizationId }: Props) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['examples', organizationId],
    queryFn: () => exampleService.getAll(organizationId),
  });

  if (isLoading) return <Skeleton />;
  if (error) return <ErrorState />;

  return (
    <Card>
      {data?.map(item => (
        <ExampleItem key={item.id} item={item} />
      ))}
    </Card>
  );
}
```

---

## Common Patterns

### Toast Notifications

```typescript
import { toast } from 'sonner';

// Success
toast.success('Data saved successfully');

// Error
toast.error('Failed to save data');

// With description
toast.info('Processing...', {
  description: 'This may take a moment'
});
```

### Form Handling

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(1, 'Required'),
  quantity: z.number().positive(),
});

function MyForm() {
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: '', quantity: 0 }
  });

  const onSubmit = (data) => {
    // Handle submission
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField name="name" control={form.control} render={...} />
      </form>
    </Form>
  );
}
```

### Design System Usage

Always use semantic tokens from `index.css`:

```tsx
// ✅ Correct - using semantic tokens
<div className="bg-background text-foreground border-border">
<Button variant="primary">

// ❌ Wrong - direct colors
<div className="bg-white text-black border-gray-200">
```

### Persian/Jalali Calendar

```typescript
import jalaliMoment from 'jalali-moment';

// Convert to Jalali
const jalaliDate = jalaliMoment(date).locale('fa').format('jYYYY/jMM/jDD');

// Parse Jalali
const gregorian = jalaliMoment('1404/02/15', 'jYYYY/jMM/jDD').toDate();
```

---

## Files You Should NOT Edit

| File | Reason |
|------|--------|
| `src/integrations/supabase/client.ts` | Auto-generated |
| `src/integrations/supabase/types.ts` | Auto-generated from schema |
| `supabase/config.toml` | Managed by Lovable Cloud |
| `.env` | Auto-configured |
| `package.json` | Use npm commands instead |

---

## Getting Help

- **Lovable Docs**: https://docs.lovable.dev
- **Supabase Docs**: https://supabase.com/docs
- **shadcn/ui**: https://ui.shadcn.com
- **TanStack Query**: https://tanstack.com/query

---

## Quick Reference

### Useful Commands

```bash
# Development
npm run dev

# Type checking
npx tsc --noEmit

# Find component usage
grep -r "ComponentName" src/

# Check bundle size
npm run build && npx vite-bundle-visualizer
```

### Key Paths

| Need to... | Go to... |
|------------|----------|
| Add a UI component | `src/components/ui/` |
| Create a service | `src/services/` |
| Add a page | `src/pages/` + `src/App.tsx` |
| Modify design tokens | `src/index.css` |
| Add Tailwind config | `tailwind.config.ts` |
| Create edge function | `supabase/functions/` |

---

*Last updated: December 2024*
