import { Database } from '@/integrations/supabase/types';

// Database table types
export type Facility = Database['public']['Tables']['facilities']['Row'];
export type FacilityInsert = Database['public']['Tables']['facilities']['Insert'];
export type EmissionFactor = Database['public']['Tables']['emission_factors']['Row'];
export type EmissionFactorInsert = Database['public']['Tables']['emission_factors']['Insert'];
export type EmissionsEntry = Database['public']['Tables']['emissions_entries']['Row'];
export type EmissionsEntryInsert = Database['public']['Tables']['emissions_entries']['Insert'];
export type Calculation = Database['public']['Tables']['calculations']['Row'];
export type Goal = Database['public']['Tables']['goals']['Row'];
export type Report = Database['public']['Tables']['reports']['Row'];

// Enum types
export type EmissionScope = Database['public']['Enums']['emission_scope'];
export type EmissionUnit = Database['public']['Enums']['emission_unit'];
export type EFUnit = Database['public']['Enums']['ef_unit'];
export type FacilityType = Database['public']['Enums']['facility_type'];
export type GoalStatus = Database['public']['Enums']['goal_status'];
export type ReportStatus = Database['public']['Enums']['report_status'];
