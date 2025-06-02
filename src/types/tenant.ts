
export interface Tenant {
  id: string;
  name: string;
  domain: string;
  settings: TenantSettings;
  subscription: SubscriptionTier;
  createdAt: string;
  updatedAt: string;
}

export interface TenantSettings {
  branding: {
    logo?: string;
    primaryColor: string;
    secondaryColor: string;
  };
  defaultMethodology: string;
  defaultCurrency: string;
  timezone: string;
  fiscalYearStart: string;
}

export type SubscriptionTier = 'starter' | 'professional' | 'enterprise';

export interface UserRole {
  id: string;
  name: string;
  permissions: Permission[];
  level: 'organization' | 'facility' | 'department';
}

export interface Permission {
  resource: string;
  actions: ('create' | 'read' | 'update' | 'delete')[];
}
