export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      calculations: {
        Row: {
          calculated_emissions: number
          calculation_formula: string | null
          calculation_timestamp: string
          confidence_score: number | null
          emission_factor_id: string
          emissions_entry_id: string
          id: string
          metadata: Json | null
          uncertainty: number | null
          user_id: string
        }
        Insert: {
          calculated_emissions: number
          calculation_formula?: string | null
          calculation_timestamp?: string
          confidence_score?: number | null
          emission_factor_id: string
          emissions_entry_id: string
          id?: string
          metadata?: Json | null
          uncertainty?: number | null
          user_id: string
        }
        Update: {
          calculated_emissions?: number
          calculation_formula?: string | null
          calculation_timestamp?: string
          confidence_score?: number | null
          emission_factor_id?: string
          emissions_entry_id?: string
          id?: string
          metadata?: Json | null
          uncertainty?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "calculations_emission_factor_id_fkey"
            columns: ["emission_factor_id"]
            isOneToOne: false
            referencedRelation: "emission_factors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calculations_emissions_entry_id_fkey"
            columns: ["emissions_entry_id"]
            isOneToOne: false
            referencedRelation: "emissions_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      data_quality_metrics: {
        Row: {
          calculated_at: string | null
          complete_entries: number | null
          completeness_score: number | null
          data_freshness_days: number | null
          id: string
          incomplete_entries: number | null
          last_entry_date: string | null
          metadata: Json | null
          metric_date: string
          missing_fields: Json | null
          scope_1_completeness: number | null
          scope_2_completeness: number | null
          scope_3_completeness: number | null
          total_entries: number | null
          user_id: string
          validation_errors: number | null
        }
        Insert: {
          calculated_at?: string | null
          complete_entries?: number | null
          completeness_score?: number | null
          data_freshness_days?: number | null
          id?: string
          incomplete_entries?: number | null
          last_entry_date?: string | null
          metadata?: Json | null
          metric_date: string
          missing_fields?: Json | null
          scope_1_completeness?: number | null
          scope_2_completeness?: number | null
          scope_3_completeness?: number | null
          total_entries?: number | null
          user_id: string
          validation_errors?: number | null
        }
        Update: {
          calculated_at?: string | null
          complete_entries?: number | null
          completeness_score?: number | null
          data_freshness_days?: number | null
          id?: string
          incomplete_entries?: number | null
          last_entry_date?: string | null
          metadata?: Json | null
          metric_date?: string
          missing_fields?: Json | null
          scope_1_completeness?: number | null
          scope_2_completeness?: number | null
          scope_3_completeness?: number | null
          total_entries?: number | null
          user_id?: string
          validation_errors?: number | null
        }
        Relationships: []
      }
      email_reports_log: {
        Row: {
          anomalies_count: number | null
          email_to: string
          error_message: string | null
          id: string
          insights_count: number | null
          metadata: Json | null
          report_type: string
          sent_at: string | null
          status: string
          subject: string | null
          user_id: string
        }
        Insert: {
          anomalies_count?: number | null
          email_to: string
          error_message?: string | null
          id?: string
          insights_count?: number | null
          metadata?: Json | null
          report_type: string
          sent_at?: string | null
          status: string
          subject?: string | null
          user_id: string
        }
        Update: {
          anomalies_count?: number | null
          email_to?: string
          error_message?: string | null
          id?: string
          insights_count?: number | null
          metadata?: Json | null
          report_type?: string
          sent_at?: string | null
          status?: string
          subject?: string | null
          user_id?: string
        }
        Relationships: []
      }
      emission_factor_updates: {
        Row: {
          created_at: string | null
          id: string
          is_dismissed: boolean | null
          is_read: boolean | null
          new_factor_id: string
          notification_type: string | null
          old_factor_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_dismissed?: boolean | null
          is_read?: boolean | null
          new_factor_id: string
          notification_type?: string | null
          old_factor_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_dismissed?: boolean | null
          is_read?: boolean | null
          new_factor_id?: string
          notification_type?: string | null
          old_factor_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "emission_factor_updates_new_factor_id_fkey"
            columns: ["new_factor_id"]
            isOneToOne: false
            referencedRelation: "emission_factors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "emission_factor_updates_old_factor_id_fkey"
            columns: ["old_factor_id"]
            isOneToOne: false
            referencedRelation: "emission_factors"
            referencedColumns: ["id"]
          },
        ]
      }
      emission_factors: {
        Row: {
          category: string
          country_code: string | null
          created_at: string
          factor_value: number
          id: string
          is_custom: boolean | null
          is_latest: boolean | null
          metadata: Json | null
          methodology: string | null
          name: string
          published_date: string | null
          region: string | null
          scope: Database["public"]["Enums"]["emission_scope"]
          source: string
          superseded_by: string | null
          uncertainty: number | null
          unit: Database["public"]["Enums"]["ef_unit"]
          updated_at: string
          user_id: string | null
          version: string | null
          version_notes: string | null
          year: number | null
        }
        Insert: {
          category: string
          country_code?: string | null
          created_at?: string
          factor_value: number
          id?: string
          is_custom?: boolean | null
          is_latest?: boolean | null
          metadata?: Json | null
          methodology?: string | null
          name: string
          published_date?: string | null
          region?: string | null
          scope: Database["public"]["Enums"]["emission_scope"]
          source: string
          superseded_by?: string | null
          uncertainty?: number | null
          unit: Database["public"]["Enums"]["ef_unit"]
          updated_at?: string
          user_id?: string | null
          version?: string | null
          version_notes?: string | null
          year?: number | null
        }
        Update: {
          category?: string
          country_code?: string | null
          created_at?: string
          factor_value?: number
          id?: string
          is_custom?: boolean | null
          is_latest?: boolean | null
          metadata?: Json | null
          methodology?: string | null
          name?: string
          published_date?: string | null
          region?: string | null
          scope?: Database["public"]["Enums"]["emission_scope"]
          source?: string
          superseded_by?: string | null
          uncertainty?: number | null
          unit?: Database["public"]["Enums"]["ef_unit"]
          updated_at?: string
          user_id?: string | null
          version?: string | null
          version_notes?: string | null
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "emission_factors_superseded_by_fkey"
            columns: ["superseded_by"]
            isOneToOne: false
            referencedRelation: "emission_factors"
            referencedColumns: ["id"]
          },
        ]
      }
      emission_scenarios: {
        Row: {
          baseline_emissions: number
          baseline_year: number
          created_at: string | null
          description: string | null
          id: string
          metadata: Json | null
          name: string
          status: string | null
          target_year: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          baseline_emissions: number
          baseline_year: number
          created_at?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          name: string
          status?: string | null
          target_year: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          baseline_emissions?: number
          baseline_year?: number
          created_at?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          name?: string
          status?: string | null
          target_year?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      emissions_anomalies: {
        Row: {
          acknowledged_at: string | null
          acknowledged_by: string | null
          actual_value: number | null
          anomaly_type: string
          created_at: string | null
          description: string | null
          detected_at: string | null
          deviation_percentage: number | null
          entry_id: string | null
          expected_value: number | null
          id: string
          is_acknowledged: boolean | null
          recommendation: string | null
          severity: string
          user_id: string
          z_score: number | null
        }
        Insert: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          actual_value?: number | null
          anomaly_type: string
          created_at?: string | null
          description?: string | null
          detected_at?: string | null
          deviation_percentage?: number | null
          entry_id?: string | null
          expected_value?: number | null
          id?: string
          is_acknowledged?: boolean | null
          recommendation?: string | null
          severity: string
          user_id: string
          z_score?: number | null
        }
        Update: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          actual_value?: number | null
          anomaly_type?: string
          created_at?: string | null
          description?: string | null
          detected_at?: string | null
          deviation_percentage?: number | null
          entry_id?: string | null
          expected_value?: number | null
          id?: string
          is_acknowledged?: boolean | null
          recommendation?: string | null
          severity?: string
          user_id?: string
          z_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "emissions_anomalies_entry_id_fkey"
            columns: ["entry_id"]
            isOneToOne: false
            referencedRelation: "emissions_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      emissions_entries: {
        Row: {
          activity_type: string | null
          calculation_method: string | null
          category: string
          created_at: string
          data_quality_score: number | null
          emission_factor_id: string | null
          entry_date: string
          facility_id: string | null
          id: string
          is_verified: boolean | null
          metadata: Json | null
          notes: string | null
          quantity: number
          scope: Database["public"]["Enums"]["emission_scope"]
          unit: Database["public"]["Enums"]["emission_unit"]
          updated_at: string
          user_id: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          activity_type?: string | null
          calculation_method?: string | null
          category: string
          created_at?: string
          data_quality_score?: number | null
          emission_factor_id?: string | null
          entry_date: string
          facility_id?: string | null
          id?: string
          is_verified?: boolean | null
          metadata?: Json | null
          notes?: string | null
          quantity: number
          scope: Database["public"]["Enums"]["emission_scope"]
          unit: Database["public"]["Enums"]["emission_unit"]
          updated_at?: string
          user_id: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          activity_type?: string | null
          calculation_method?: string | null
          category?: string
          created_at?: string
          data_quality_score?: number | null
          emission_factor_id?: string | null
          entry_date?: string
          facility_id?: string | null
          id?: string
          is_verified?: boolean | null
          metadata?: Json | null
          notes?: string | null
          quantity?: number
          scope?: Database["public"]["Enums"]["emission_scope"]
          unit?: Database["public"]["Enums"]["emission_unit"]
          updated_at?: string
          user_id?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "emissions_entries_emission_factor_id_fkey"
            columns: ["emission_factor_id"]
            isOneToOne: false
            referencedRelation: "emission_factors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "emissions_entries_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "facilities"
            referencedColumns: ["id"]
          },
        ]
      }
      emissions_forecasts: {
        Row: {
          confidence_score: number | null
          created_at: string | null
          generated_at: string | null
          id: string
          lower_bound: number | null
          model_version: string | null
          period: string
          predicted_emissions: number
          scope: string
          upper_bound: number | null
          user_id: string
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string | null
          generated_at?: string | null
          id?: string
          lower_bound?: number | null
          model_version?: string | null
          period: string
          predicted_emissions: number
          scope: string
          upper_bound?: number | null
          user_id: string
        }
        Update: {
          confidence_score?: number | null
          created_at?: string | null
          generated_at?: string | null
          id?: string
          lower_bound?: number | null
          model_version?: string | null
          period?: string
          predicted_emissions?: number
          scope?: string
          upper_bound?: number | null
          user_id?: string
        }
        Relationships: []
      }
      emissions_insights: {
        Row: {
          actioned_at: string | null
          category: string
          created_at: string | null
          dismissed_at: string | null
          expected_benefit: string | null
          finding: string | null
          generated_at: string | null
          id: string
          impact: string | null
          is_actioned: boolean | null
          is_dismissed: boolean | null
          metadata: Json | null
          priority: string
          recommendation: string | null
          timeframe: string | null
          title: string
          user_id: string
        }
        Insert: {
          actioned_at?: string | null
          category: string
          created_at?: string | null
          dismissed_at?: string | null
          expected_benefit?: string | null
          finding?: string | null
          generated_at?: string | null
          id?: string
          impact?: string | null
          is_actioned?: boolean | null
          is_dismissed?: boolean | null
          metadata?: Json | null
          priority: string
          recommendation?: string | null
          timeframe?: string | null
          title: string
          user_id: string
        }
        Update: {
          actioned_at?: string | null
          category?: string
          created_at?: string | null
          dismissed_at?: string | null
          expected_benefit?: string | null
          finding?: string | null
          generated_at?: string | null
          id?: string
          impact?: string | null
          is_actioned?: boolean | null
          is_dismissed?: boolean | null
          metadata?: Json | null
          priority?: string
          recommendation?: string | null
          timeframe?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      facilities: {
        Row: {
          address: string | null
          annual_revenue: number | null
          area_sqm: number | null
          city: string | null
          country_code: string
          created_at: string
          employees: number | null
          facility_type: Database["public"]["Enums"]["facility_type"]
          id: string
          industry: string | null
          latitude: number | null
          longitude: number | null
          metadata: Json | null
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          annual_revenue?: number | null
          area_sqm?: number | null
          city?: string | null
          country_code: string
          created_at?: string
          employees?: number | null
          facility_type?: Database["public"]["Enums"]["facility_type"]
          id?: string
          industry?: string | null
          latitude?: number | null
          longitude?: number | null
          metadata?: Json | null
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          annual_revenue?: number | null
          area_sqm?: number | null
          city?: string | null
          country_code?: string
          created_at?: string
          employees?: number | null
          facility_type?: Database["public"]["Enums"]["facility_type"]
          id?: string
          industry?: string | null
          latitude?: number | null
          longitude?: number | null
          metadata?: Json | null
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      goals: {
        Row: {
          baseline_emissions: number | null
          baseline_year: number | null
          created_at: string
          current_emissions: number | null
          description: string | null
          facility_id: string | null
          id: string
          metadata: Json | null
          milestones: Json | null
          progress_percentage: number | null
          scope_covered: string[] | null
          status: Database["public"]["Enums"]["goal_status"] | null
          target_date: string
          target_emissions: number | null
          target_reduction_percentage: number | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          baseline_emissions?: number | null
          baseline_year?: number | null
          created_at?: string
          current_emissions?: number | null
          description?: string | null
          facility_id?: string | null
          id?: string
          metadata?: Json | null
          milestones?: Json | null
          progress_percentage?: number | null
          scope_covered?: string[] | null
          status?: Database["public"]["Enums"]["goal_status"] | null
          target_date: string
          target_emissions?: number | null
          target_reduction_percentage?: number | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          baseline_emissions?: number | null
          baseline_year?: number | null
          created_at?: string
          current_emissions?: number | null
          description?: string | null
          facility_id?: string | null
          id?: string
          metadata?: Json | null
          milestones?: Json | null
          progress_percentage?: number | null
          scope_covered?: string[] | null
          status?: Database["public"]["Enums"]["goal_status"] | null
          target_date?: string
          target_emissions?: number | null
          target_reduction_percentage?: number | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "goals_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "facilities"
            referencedColumns: ["id"]
          },
        ]
      }
      industry_benchmarks: {
        Row: {
          created_at: string | null
          id: string
          industry: string
          last_updated: string | null
          metric_type: string
          naics_code: string
          p10: number | null
          p25: number | null
          p50: number | null
          p75: number | null
          p90: number | null
          sample_size: number | null
          source: string | null
          unit: string
          year: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          industry: string
          last_updated?: string | null
          metric_type: string
          naics_code: string
          p10?: number | null
          p25?: number | null
          p50?: number | null
          p75?: number | null
          p90?: number | null
          sample_size?: number | null
          source?: string | null
          unit: string
          year: number
        }
        Update: {
          created_at?: string | null
          id?: string
          industry?: string
          last_updated?: string | null
          metric_type?: string
          naics_code?: string
          p10?: number | null
          p25?: number | null
          p50?: number | null
          p75?: number | null
          p90?: number | null
          sample_size?: number | null
          source?: string | null
          unit?: string
          year?: number
        }
        Relationships: []
      }
      notifications: {
        Row: {
          action_url: string | null
          created_at: string | null
          dismissed_at: string | null
          id: string
          is_dismissed: boolean | null
          is_read: boolean | null
          message: string
          metadata: Json | null
          read_at: string | null
          related_id: string | null
          related_table: string | null
          severity: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string | null
          dismissed_at?: string | null
          id?: string
          is_dismissed?: boolean | null
          is_read?: boolean | null
          message: string
          metadata?: Json | null
          read_at?: string | null
          related_id?: string | null
          related_table?: string | null
          severity?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          created_at?: string | null
          dismissed_at?: string | null
          id?: string
          is_dismissed?: boolean | null
          is_read?: boolean | null
          message?: string
          metadata?: Json | null
          read_at?: string | null
          related_id?: string | null
          related_table?: string | null
          severity?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      organization_members: {
        Row: {
          created_at: string
          id: string
          organization_id: string
          role: Database["public"]["Enums"]["org_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          organization_id: string
          role?: Database["public"]["Enums"]["org_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          organization_id?: string
          role?: Database["public"]["Enums"]["org_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          id: string
          metadata: Json | null
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json | null
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string
          id: string
          onboarding_completed: boolean | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name: string
          id: string
          onboarding_completed?: boolean | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          onboarding_completed?: boolean | null
          updated_at?: string
        }
        Relationships: []
      }
      reports: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string
          facilities_included: string[] | null
          file_url: string | null
          generated_at: string | null
          id: string
          metadata: Json | null
          period_end: string
          period_start: string
          published_at: string | null
          report_type: string
          scope_1_emissions: number | null
          scope_2_emissions: number | null
          scope_3_emissions: number | null
          status: Database["public"]["Enums"]["report_status"] | null
          title: string
          total_emissions: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          facilities_included?: string[] | null
          file_url?: string | null
          generated_at?: string | null
          id?: string
          metadata?: Json | null
          period_end: string
          period_start: string
          published_at?: string | null
          report_type: string
          scope_1_emissions?: number | null
          scope_2_emissions?: number | null
          scope_3_emissions?: number | null
          status?: Database["public"]["Enums"]["report_status"] | null
          title: string
          total_emissions?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          facilities_included?: string[] | null
          file_url?: string | null
          generated_at?: string | null
          id?: string
          metadata?: Json | null
          period_end?: string
          period_start?: string
          published_at?: string | null
          report_type?: string
          scope_1_emissions?: number | null
          scope_2_emissions?: number | null
          scope_3_emissions?: number | null
          status?: Database["public"]["Enums"]["report_status"] | null
          title?: string
          total_emissions?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      scenario_interventions: {
        Row: {
          affected_scope: string[]
          annual_cost: number | null
          confidence_level: string | null
          created_at: string | null
          description: string | null
          id: string
          implementation_year: number
          intervention_type: string
          is_active: boolean | null
          metadata: Json | null
          name: string
          one_time_cost: number | null
          reduction_percentage: number
          roi_years: number | null
          scenario_id: string
          updated_at: string | null
        }
        Insert: {
          affected_scope: string[]
          annual_cost?: number | null
          confidence_level?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          implementation_year: number
          intervention_type: string
          is_active?: boolean | null
          metadata?: Json | null
          name: string
          one_time_cost?: number | null
          reduction_percentage: number
          roi_years?: number | null
          scenario_id: string
          updated_at?: string | null
        }
        Update: {
          affected_scope?: string[]
          annual_cost?: number | null
          confidence_level?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          implementation_year?: number
          intervention_type?: string
          is_active?: boolean | null
          metadata?: Json | null
          name?: string
          one_time_cost?: number | null
          reduction_percentage?: number
          roi_years?: number | null
          scenario_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scenario_interventions_scenario_id_fkey"
            columns: ["scenario_id"]
            isOneToOne: false
            referencedRelation: "emission_scenarios"
            referencedColumns: ["id"]
          },
        ]
      }
      scenario_projections: {
        Row: {
          created_at: string | null
          cumulative_reduction: number | null
          id: string
          projected_emissions: number
          scenario_id: string
          scope_1_emissions: number | null
          scope_2_emissions: number | null
          scope_3_emissions: number | null
          total_investment: number | null
          year: number
        }
        Insert: {
          created_at?: string | null
          cumulative_reduction?: number | null
          id?: string
          projected_emissions: number
          scenario_id: string
          scope_1_emissions?: number | null
          scope_2_emissions?: number | null
          scope_3_emissions?: number | null
          total_investment?: number | null
          year: number
        }
        Update: {
          created_at?: string | null
          cumulative_reduction?: number | null
          id?: string
          projected_emissions?: number
          scenario_id?: string
          scope_1_emissions?: number | null
          scope_2_emissions?: number | null
          scope_3_emissions?: number | null
          total_investment?: number | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "scenario_projections_scenario_id_fkey"
            columns: ["scenario_id"]
            isOneToOne: false
            referencedRelation: "emission_scenarios"
            referencedColumns: ["id"]
          },
        ]
      }
      user_emission_factor_versions: {
        Row: {
          auto_update: boolean | null
          created_at: string | null
          emission_factor_id: string
          id: string
          last_checked: string | null
          locked_version: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          auto_update?: boolean | null
          created_at?: string | null
          emission_factor_id: string
          id?: string
          last_checked?: string | null
          locked_version: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          auto_update?: boolean | null
          created_at?: string | null
          emission_factor_id?: string
          id?: string
          last_checked?: string | null
          locked_version?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_emission_factor_versions_emission_factor_id_fkey"
            columns: ["emission_factor_id"]
            isOneToOne: false
            referencedRelation: "emission_factors"
            referencedColumns: ["id"]
          },
        ]
      }
      user_notification_preferences: {
        Row: {
          created_at: string | null
          email_anomaly_alerts: boolean | null
          email_critical_only: boolean | null
          email_frequency: string | null
          email_weekly_insights: boolean | null
          id: string
          notification_anomaly_alerts: boolean | null
          notification_insights: boolean | null
          notification_sound: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email_anomaly_alerts?: boolean | null
          email_critical_only?: boolean | null
          email_frequency?: string | null
          email_weekly_insights?: boolean | null
          id?: string
          notification_anomaly_alerts?: boolean | null
          notification_insights?: boolean | null
          notification_sound?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email_anomaly_alerts?: boolean | null
          email_critical_only?: boolean | null
          email_frequency?: string | null
          email_weekly_insights?: boolean | null
          id?: string
          notification_anomaly_alerts?: boolean | null
          notification_insights?: boolean | null
          notification_sound?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_emission_factor_updates: {
        Args: never
        Returns: {
          factor_name: string
          new_factor_id: string
          new_version: string
          old_factor_id: string
          old_version: string
          user_id: string
        }[]
      }
      create_notification: {
        Args: {
          p_action_url?: string
          p_message: string
          p_related_id?: string
          p_related_table?: string
          p_severity?: string
          p_title: string
          p_type: string
          p_user_id: string
        }
        Returns: string
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_organization_member: {
        Args: { _organization_id: string; _user_id: string }
        Returns: boolean
      }
      is_organization_owner: {
        Args: { _organization_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
      ef_unit:
        | "kgCO2e/kWh"
        | "kgCO2e/MWh"
        | "kgCO2e/L"
        | "kgCO2e/kg"
        | "kgCO2e/t"
        | "kgCO2e/m3"
        | "kgCO2e/km"
        | "kgCO2e/passenger_km"
        | "kgCO2e/tonne_km"
        | "kgCO2e/night"
      emission_scope: "S1" | "S2" | "S3"
      emission_unit:
        | "kWh"
        | "MWh"
        | "L"
        | "kg"
        | "t"
        | "m3"
        | "km"
        | "passenger_km"
        | "tonne_km"
        | "night"
      facility_type:
        | "office"
        | "warehouse"
        | "factory"
        | "retail"
        | "datacenter"
        | "other"
      goal_status:
        | "not_started"
        | "in_progress"
        | "at_risk"
        | "completed"
        | "overdue"
      org_role: "owner" | "admin" | "member"
      report_status: "draft" | "pending" | "approved" | "published"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
      ef_unit: [
        "kgCO2e/kWh",
        "kgCO2e/MWh",
        "kgCO2e/L",
        "kgCO2e/kg",
        "kgCO2e/t",
        "kgCO2e/m3",
        "kgCO2e/km",
        "kgCO2e/passenger_km",
        "kgCO2e/tonne_km",
        "kgCO2e/night",
      ],
      emission_scope: ["S1", "S2", "S3"],
      emission_unit: [
        "kWh",
        "MWh",
        "L",
        "kg",
        "t",
        "m3",
        "km",
        "passenger_km",
        "tonne_km",
        "night",
      ],
      facility_type: [
        "office",
        "warehouse",
        "factory",
        "retail",
        "datacenter",
        "other",
      ],
      goal_status: [
        "not_started",
        "in_progress",
        "at_risk",
        "completed",
        "overdue",
      ],
      org_role: ["owner", "admin", "member"],
      report_status: ["draft", "pending", "approved", "published"],
    },
  },
} as const
