
import { Tenant, TenantSettings } from '@/types/tenant';

class TenantService {
  private currentTenant: Tenant | null = null;

  getCurrentTenant(): Tenant | null {
    return this.currentTenant;
  }

  setCurrentTenant(tenant: Tenant): void {
    this.currentTenant = tenant;
    localStorage.setItem('currentTenant', JSON.stringify(tenant));
  }

  getTenantSettings(): TenantSettings | null {
    return this.currentTenant?.settings || null;
  }

  updateTenantSettings(settings: Partial<TenantSettings>): void {
    if (this.currentTenant) {
      this.currentTenant.settings = { ...this.currentTenant.settings, ...settings };
      this.setCurrentTenant(this.currentTenant);
    }
  }

  hasPermission(resource: string, action: string): boolean {
    // Implementation for RBAC permission checking
    // This would be connected to the actual user permissions
    return true; // Simplified for now
  }
}

export const tenantService = new TenantService();
