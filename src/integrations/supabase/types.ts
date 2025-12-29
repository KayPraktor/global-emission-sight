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
      approval_requests: {
        Row: {
          created_at: string | null
          entry_id: string
          id: string
          metadata: Json | null
          organization_id: string
          request_message: string | null
          requester_id: string
          review_message: string | null
          reviewed_at: string | null
          reviewer_id: string | null
          status: Database["public"]["Enums"]["approval_status"]
        }
        Insert: {
          created_at?: string | null
          entry_id: string
          id?: string
          metadata?: Json | null
          organization_id: string
          request_message?: string | null
          requester_id: string
          review_message?: string | null
          reviewed_at?: string | null
          reviewer_id?: string | null
          status?: Database["public"]["Enums"]["approval_status"]
        }
        Update: {
          created_at?: string | null
          entry_id?: string
          id?: string
          metadata?: Json | null
          organization_id?: string
          request_message?: string | null
          requester_id?: string
          review_message?: string | null
          reviewed_at?: string | null
          reviewer_id?: string | null
          status?: Database["public"]["Enums"]["approval_status"]
        }
        Relationships: [
          {
            foreignKeyName: "approval_requests_entry_id_fkey"
            columns: ["entry_id"]
            isOneToOne: false
            referencedRelation: "emissions_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "approval_requests_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: string | null
          metadata: Json | null
          new_values: Json | null
          old_values: Json | null
          organization_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
          organization_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
          organization_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
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
      carbon_credits: {
        Row: {
          created_at: string
          credit_type: Database["public"]["Enums"]["carbon_credit_type"]
          currency: string | null
          current_price: number | null
          id: string
          metadata: Json | null
          organization_id: string | null
          project_location: string | null
          project_name: string | null
          project_type: string | null
          purchase_date: string | null
          purchase_price: number | null
          quantity: number
          registry: string | null
          retirement_date: string | null
          retirement_purpose: string | null
          serial_numbers: string[] | null
          status: Database["public"]["Enums"]["carbon_credit_status"]
          updated_at: string
          user_id: string
          vintage_year: number
        }
        Insert: {
          created_at?: string
          credit_type?: Database["public"]["Enums"]["carbon_credit_type"]
          currency?: string | null
          current_price?: number | null
          id?: string
          metadata?: Json | null
          organization_id?: string | null
          project_location?: string | null
          project_name?: string | null
          project_type?: string | null
          purchase_date?: string | null
          purchase_price?: number | null
          quantity: number
          registry?: string | null
          retirement_date?: string | null
          retirement_purpose?: string | null
          serial_numbers?: string[] | null
          status?: Database["public"]["Enums"]["carbon_credit_status"]
          updated_at?: string
          user_id: string
          vintage_year: number
        }
        Update: {
          created_at?: string
          credit_type?: Database["public"]["Enums"]["carbon_credit_type"]
          currency?: string | null
          current_price?: number | null
          id?: string
          metadata?: Json | null
          organization_id?: string | null
          project_location?: string | null
          project_name?: string | null
          project_type?: string | null
          purchase_date?: string | null
          purchase_price?: number | null
          quantity?: number
          registry?: string | null
          retirement_date?: string | null
          retirement_purpose?: string | null
          serial_numbers?: string[] | null
          status?: Database["public"]["Enums"]["carbon_credit_status"]
          updated_at?: string
          user_id?: string
          vintage_year?: number
        }
        Relationships: [
          {
            foreignKeyName: "carbon_credits_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      carbon_prices: {
        Row: {
          created_at: string
          currency: string | null
          effective_date: string
          id: string
          metadata: Json | null
          price_per_tonne: number
          price_type: string
          source: string | null
        }
        Insert: {
          created_at?: string
          currency?: string | null
          effective_date: string
          id?: string
          metadata?: Json | null
          price_per_tonne: number
          price_type: string
          source?: string | null
        }
        Update: {
          created_at?: string
          currency?: string | null
          effective_date?: string
          id?: string
          metadata?: Json | null
          price_per_tonne?: number
          price_type?: string
          source?: string | null
        }
        Relationships: []
      }
      compliance_data_gaps: {
        Row: {
          created_at: string | null
          description: string
          disclosure_id: string
          disclosure_name: string
          due_date: string | null
          estimated_effort: string | null
          gap_type: string
          id: string
          metadata: Json | null
          organization_id: string | null
          owner_id: string | null
          recommendation: string | null
          resolution_status: string | null
          resolved_at: string | null
          severity: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description: string
          disclosure_id: string
          disclosure_name: string
          due_date?: string | null
          estimated_effort?: string | null
          gap_type: string
          id?: string
          metadata?: Json | null
          organization_id?: string | null
          owner_id?: string | null
          recommendation?: string | null
          resolution_status?: string | null
          resolved_at?: string | null
          severity: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string
          disclosure_id?: string
          disclosure_name?: string
          due_date?: string | null
          estimated_effort?: string | null
          gap_type?: string
          id?: string
          metadata?: Json | null
          organization_id?: string | null
          owner_id?: string | null
          recommendation?: string | null
          resolution_status?: string | null
          resolved_at?: string | null
          severity?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "compliance_data_gaps_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      compliance_deadlines: {
        Row: {
          assignee_id: string | null
          completion_percentage: number | null
          created_at: string | null
          dependencies: string[] | null
          description: string | null
          documents: string[] | null
          due_date: string
          estimated_hours: number | null
          framework_id: string | null
          id: string
          organization_id: string
          priority: string
          status: string
          title: string
          updated_at: string | null
        }
        Insert: {
          assignee_id?: string | null
          completion_percentage?: number | null
          created_at?: string | null
          dependencies?: string[] | null
          description?: string | null
          documents?: string[] | null
          due_date: string
          estimated_hours?: number | null
          framework_id?: string | null
          id?: string
          organization_id: string
          priority: string
          status?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          assignee_id?: string | null
          completion_percentage?: number | null
          created_at?: string | null
          dependencies?: string[] | null
          description?: string | null
          documents?: string[] | null
          due_date?: string
          estimated_hours?: number | null
          framework_id?: string | null
          id?: string
          organization_id?: string
          priority?: string
          status?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "compliance_deadlines_framework_id_fkey"
            columns: ["framework_id"]
            isOneToOne: false
            referencedRelation: "compliance_frameworks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compliance_deadlines_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      compliance_frameworks: {
        Row: {
          completeness_percentage: number | null
          created_at: string | null
          estimated_cost: number | null
          framework_name: string
          id: string
          metadata: Json | null
          next_deadline: string | null
          organization_id: string
          risk_level: string | null
          score: number | null
          status: string
          updated_at: string | null
        }
        Insert: {
          completeness_percentage?: number | null
          created_at?: string | null
          estimated_cost?: number | null
          framework_name: string
          id?: string
          metadata?: Json | null
          next_deadline?: string | null
          organization_id: string
          risk_level?: string | null
          score?: number | null
          status: string
          updated_at?: string | null
        }
        Update: {
          completeness_percentage?: number | null
          created_at?: string | null
          estimated_cost?: number | null
          framework_name?: string
          id?: string
          metadata?: Json | null
          next_deadline?: string | null
          organization_id?: string
          risk_level?: string | null
          score?: number | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "compliance_frameworks_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      csrd_disclosures: {
        Row: {
          completeness_score: number | null
          content: Json | null
          created_at: string | null
          data_quality_score: number | null
          disclosure_id: string
          disclosure_name: string
          disclosure_standard: string
          due_date: string | null
          id: string
          last_updated: string | null
          metadata: Json | null
          organization_id: string | null
          review_notes: string | null
          reviewer_id: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          completeness_score?: number | null
          content?: Json | null
          created_at?: string | null
          data_quality_score?: number | null
          disclosure_id: string
          disclosure_name: string
          disclosure_standard: string
          due_date?: string | null
          id?: string
          last_updated?: string | null
          metadata?: Json | null
          organization_id?: string | null
          review_notes?: string | null
          reviewer_id?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          completeness_score?: number | null
          content?: Json | null
          created_at?: string | null
          data_quality_score?: number | null
          disclosure_id?: string
          disclosure_name?: string
          disclosure_standard?: string
          due_date?: string | null
          id?: string
          last_updated?: string | null
          metadata?: Json | null
          organization_id?: string | null
          review_notes?: string | null
          reviewer_id?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "csrd_disclosures_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      dashboard_preferences: {
        Row: {
          created_at: string | null
          id: string
          is_default: boolean | null
          layout_config: Json
          organization_id: string | null
          updated_at: string | null
          user_id: string
          view_name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          layout_config?: Json
          organization_id?: string | null
          updated_at?: string | null
          user_id: string
          view_name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          layout_config?: Json
          organization_id?: string | null
          updated_at?: string | null
          user_id?: string
          view_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "dashboard_preferences_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
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
          organization_id: string | null
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
          organization_id?: string | null
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
          organization_id?: string | null
          scope_1_completeness?: number | null
          scope_2_completeness?: number | null
          scope_3_completeness?: number | null
          total_entries?: number | null
          user_id?: string
          validation_errors?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "data_quality_metrics_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
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
          organization_id: string | null
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
          organization_id?: string | null
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
          organization_id?: string | null
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
            foreignKeyName: "emission_factors_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
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
          organization_id: string | null
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
          organization_id?: string | null
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
          organization_id?: string | null
          status?: string | null
          target_year?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "emission_scenarios_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
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
          organization_id: string | null
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
          organization_id?: string | null
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
          organization_id?: string | null
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
          {
            foreignKeyName: "emissions_anomalies_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      emissions_entries: {
        Row: {
          activity_type: string | null
          approval_status: Database["public"]["Enums"]["approval_status"] | null
          assigned_reviewer: string | null
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
          organization_id: string | null
          quantity: number
          review_notes: string | null
          scope: Database["public"]["Enums"]["emission_scope"]
          submitted_at: string | null
          submitted_by: string | null
          unit: Database["public"]["Enums"]["emission_unit"]
          updated_at: string
          user_id: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          activity_type?: string | null
          approval_status?:
            | Database["public"]["Enums"]["approval_status"]
            | null
          assigned_reviewer?: string | null
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
          organization_id?: string | null
          quantity: number
          review_notes?: string | null
          scope: Database["public"]["Enums"]["emission_scope"]
          submitted_at?: string | null
          submitted_by?: string | null
          unit: Database["public"]["Enums"]["emission_unit"]
          updated_at?: string
          user_id: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          activity_type?: string | null
          approval_status?:
            | Database["public"]["Enums"]["approval_status"]
            | null
          assigned_reviewer?: string | null
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
          organization_id?: string | null
          quantity?: number
          review_notes?: string | null
          scope?: Database["public"]["Enums"]["emission_scope"]
          submitted_at?: string | null
          submitted_by?: string | null
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
          {
            foreignKeyName: "emissions_entries_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
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
          organization_id: string | null
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
          organization_id?: string | null
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
          organization_id?: string | null
          period?: string
          predicted_emissions?: number
          scope?: string
          upper_bound?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "emissions_forecasts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
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
          organization_id: string | null
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
          organization_id?: string | null
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
          organization_id?: string | null
          priority?: string
          recommendation?: string | null
          timeframe?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "emissions_insights_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      enterprise_insights: {
        Row: {
          category: string | null
          confidence_score: number | null
          created_at: string | null
          description: string | null
          id: string
          impact_co2_reduction: number | null
          impact_cost_saving: number | null
          insight_type: string
          metadata: Json | null
          organization_id: string
          priority: string
          source: string | null
          status: string | null
          title: string
        }
        Insert: {
          category?: string | null
          confidence_score?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          impact_co2_reduction?: number | null
          impact_cost_saving?: number | null
          insight_type: string
          metadata?: Json | null
          organization_id: string
          priority: string
          source?: string | null
          status?: string | null
          title: string
        }
        Update: {
          category?: string | null
          confidence_score?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          impact_co2_reduction?: number | null
          impact_cost_saving?: number | null
          insight_type?: string
          metadata?: Json | null
          organization_id?: string
          priority?: string
          source?: string | null
          status?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "enterprise_insights_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      enterprise_metrics: {
        Row: {
          carbon_cost: number | null
          carbon_intensity: number | null
          compliance_score: number | null
          created_at: string | null
          id: string
          metadata: Json | null
          metric_date: string
          net_zero_progress: number | null
          organization_id: string
          risk_exposure: number | null
          scope_1_emissions: number | null
          scope_2_emissions: number | null
          scope_3_emissions: number | null
          total_emissions: number | null
        }
        Insert: {
          carbon_cost?: number | null
          carbon_intensity?: number | null
          compliance_score?: number | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          metric_date: string
          net_zero_progress?: number | null
          organization_id: string
          risk_exposure?: number | null
          scope_1_emissions?: number | null
          scope_2_emissions?: number | null
          scope_3_emissions?: number | null
          total_emissions?: number | null
        }
        Update: {
          carbon_cost?: number | null
          carbon_intensity?: number | null
          compliance_score?: number | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          metric_date?: string
          net_zero_progress?: number | null
          organization_id?: string
          risk_exposure?: number | null
          scope_1_emissions?: number | null
          scope_2_emissions?: number | null
          scope_3_emissions?: number | null
          total_emissions?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "enterprise_metrics_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      enterprise_scenarios: {
        Row: {
          baseline_emissions: number
          baseline_year: number
          confidence_level: string | null
          created_at: string | null
          description: string | null
          id: string
          impact_score: number | null
          interventions: Json | null
          organization_id: string
          probability: number | null
          projected_costs: Json | null
          projected_emissions: Json | null
          scenario_name: string
          target_year: number
          updated_at: string | null
        }
        Insert: {
          baseline_emissions: number
          baseline_year: number
          confidence_level?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          impact_score?: number | null
          interventions?: Json | null
          organization_id: string
          probability?: number | null
          projected_costs?: Json | null
          projected_emissions?: Json | null
          scenario_name: string
          target_year: number
          updated_at?: string | null
        }
        Update: {
          baseline_emissions?: number
          baseline_year?: number
          confidence_level?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          impact_score?: number | null
          interventions?: Json | null
          organization_id?: string
          probability?: number | null
          projected_costs?: Json | null
          projected_emissions?: Json | null
          scenario_name?: string
          target_year?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "enterprise_scenarios_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
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
          organization_id: string | null
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
          organization_id?: string | null
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
          organization_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "facilities_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
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
          organization_id: string | null
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
          organization_id?: string | null
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
          organization_id?: string | null
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
          {
            foreignKeyName: "goals_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
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
      industry_compliance_templates: {
        Row: {
          created_at: string | null
          description: string | null
          framework_name: string
          id: string
          industry: string
          jurisdiction: string | null
          key_requirements: string[] | null
          reporting_frequency: string | null
          required_scopes: string[] | null
          typical_deadlines: Json | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          framework_name: string
          id?: string
          industry: string
          jurisdiction?: string | null
          key_requirements?: string[] | null
          reporting_frequency?: string | null
          required_scopes?: string[] | null
          typical_deadlines?: Json | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          framework_name?: string
          id?: string
          industry?: string
          jurisdiction?: string | null
          key_requirements?: string[] | null
          reporting_frequency?: string | null
          required_scopes?: string[] | null
          typical_deadlines?: Json | null
        }
        Relationships: []
      }
      industry_emission_factors: {
        Row: {
          activity_type: string
          category: string
          created_at: string | null
          factor_value: number
          id: string
          industry: string
          methodology: string | null
          name: string
          notes: string | null
          region: string | null
          scope: string
          source: string
          sub_industry: string | null
          uncertainty: number | null
          unit: string
          updated_at: string | null
          year: number | null
        }
        Insert: {
          activity_type: string
          category: string
          created_at?: string | null
          factor_value: number
          id?: string
          industry: string
          methodology?: string | null
          name: string
          notes?: string | null
          region?: string | null
          scope: string
          source: string
          sub_industry?: string | null
          uncertainty?: number | null
          unit: string
          updated_at?: string | null
          year?: number | null
        }
        Update: {
          activity_type?: string
          category?: string
          created_at?: string | null
          factor_value?: number
          id?: string
          industry?: string
          methodology?: string | null
          name?: string
          notes?: string | null
          region?: string | null
          scope?: string
          source?: string
          sub_industry?: string | null
          uncertainty?: number | null
          unit?: string
          updated_at?: string | null
          year?: number | null
        }
        Relationships: []
      }
      industry_kpi_presets: {
        Row: {
          benchmark_high: number | null
          benchmark_low: number | null
          benchmark_medium: number | null
          calculation_method: string | null
          created_at: string | null
          description: string | null
          display_order: number | null
          id: string
          industry: string
          kpi_key: string
          kpi_name: string
          unit: string
        }
        Insert: {
          benchmark_high?: number | null
          benchmark_low?: number | null
          benchmark_medium?: number | null
          calculation_method?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          industry: string
          kpi_key: string
          kpi_name: string
          unit: string
        }
        Update: {
          benchmark_high?: number | null
          benchmark_low?: number | null
          benchmark_medium?: number | null
          calculation_method?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          industry?: string
          kpi_key?: string
          kpi_name?: string
          unit?: string
        }
        Relationships: []
      }
      industry_sub_industries: {
        Row: {
          created_at: string | null
          display_name: string
          emission_categories: string[] | null
          id: string
          industry: string
          sub_industry: string
          typical_scopes: string[] | null
        }
        Insert: {
          created_at?: string | null
          display_name: string
          emission_categories?: string[] | null
          id?: string
          industry: string
          sub_industry: string
          typical_scopes?: string[] | null
        }
        Update: {
          created_at?: string | null
          display_name?: string
          emission_categories?: string[] | null
          id?: string
          industry?: string
          sub_industry?: string
          typical_scopes?: string[] | null
        }
        Relationships: []
      }
      issb_assessment_responses: {
        Row: {
          category: string
          created_at: string | null
          evidence_links: string[] | null
          id: string
          notes: string | null
          organization_id: string | null
          question_id: string
          response: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string | null
          evidence_links?: string[] | null
          id?: string
          notes?: string | null
          organization_id?: string | null
          question_id: string
          response: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string | null
          evidence_links?: string[] | null
          id?: string
          notes?: string | null
          organization_id?: string | null
          question_id?: string
          response?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "issb_assessment_responses_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
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
          organization_id: string | null
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
          organization_id?: string | null
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
          organization_id?: string | null
          read_at?: string | null
          related_id?: string | null
          related_table?: string | null
          severity?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_analytics: {
        Row: {
          ai_confidence: number | null
          ai_recommended_path: string | null
          challenge_selected: string | null
          completed: boolean
          completed_at: string | null
          created_at: string
          custom_input: string | null
          id: string
          step_reached: number
          time_spent_seconds: number | null
          user_id: string
        }
        Insert: {
          ai_confidence?: number | null
          ai_recommended_path?: string | null
          challenge_selected?: string | null
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          custom_input?: string | null
          id?: string
          step_reached?: number
          time_spent_seconds?: number | null
          user_id: string
        }
        Update: {
          ai_confidence?: number | null
          ai_recommended_path?: string | null
          challenge_selected?: string | null
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          custom_input?: string | null
          id?: string
          step_reached?: number
          time_spent_seconds?: number | null
          user_id?: string
        }
        Relationships: []
      }
      onboarding_feedback: {
        Row: {
          created_at: string
          feedback_text: string | null
          id: string
          improvements_suggested: string | null
          rating: number
          user_id: string
          would_recommend: boolean | null
        }
        Insert: {
          created_at?: string
          feedback_text?: string | null
          id?: string
          improvements_suggested?: string | null
          rating: number
          user_id: string
          would_recommend?: boolean | null
        }
        Update: {
          created_at?: string
          feedback_text?: string | null
          id?: string
          improvements_suggested?: string | null
          rating?: number
          user_id?: string
          would_recommend?: boolean | null
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
      organization_scope3_summary: {
        Row: {
          category_number: number
          created_at: string
          data_quality:
            | Database["public"]["Enums"]["emissions_data_quality"]
            | null
          emissions_tco2e: number
          id: string
          industry_average_percentage: number | null
          last_calculated: string | null
          metadata: Json | null
          methodology_notes: string | null
          organization_id: string
          reporting_year: number
          spend_based_percentage: number | null
          supplier_data_percentage: number | null
          updated_at: string
        }
        Insert: {
          category_number: number
          created_at?: string
          data_quality?:
            | Database["public"]["Enums"]["emissions_data_quality"]
            | null
          emissions_tco2e?: number
          id?: string
          industry_average_percentage?: number | null
          last_calculated?: string | null
          metadata?: Json | null
          methodology_notes?: string | null
          organization_id: string
          reporting_year: number
          spend_based_percentage?: number | null
          supplier_data_percentage?: number | null
          updated_at?: string
        }
        Update: {
          category_number?: number
          created_at?: string
          data_quality?:
            | Database["public"]["Enums"]["emissions_data_quality"]
            | null
          emissions_tco2e?: number
          id?: string
          industry_average_percentage?: number | null
          last_calculated?: string | null
          metadata?: Json | null
          methodology_notes?: string | null
          organization_id?: string
          reporting_year?: number
          spend_based_percentage?: number | null
          supplier_data_percentage?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_scope3_summary_category_number_fkey"
            columns: ["category_number"]
            isOneToOne: false
            referencedRelation: "scope3_categories"
            referencedColumns: ["category_number"]
          },
          {
            foreignKeyName: "organization_scope3_summary_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          annual_revenue_usd: number | null
          created_at: string
          employee_count: number | null
          id: string
          industry: string | null
          metadata: Json | null
          name: string
          square_footage: number | null
          sub_industry: string | null
          updated_at: string
        }
        Insert: {
          annual_revenue_usd?: number | null
          created_at?: string
          employee_count?: number | null
          id?: string
          industry?: string | null
          metadata?: Json | null
          name: string
          square_footage?: number | null
          sub_industry?: string | null
          updated_at?: string
        }
        Update: {
          annual_revenue_usd?: number | null
          created_at?: string
          employee_count?: number | null
          id?: string
          industry?: string | null
          metadata?: Json | null
          name?: string
          square_footage?: number | null
          sub_industry?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      process_calculators: {
        Row: {
          calculator_key: string
          calculator_name: string
          created_at: string | null
          description: string | null
          formula: string
          id: string
          industry: string
          input_fields: Json
          output_unit: string
          sub_industry: string | null
        }
        Insert: {
          calculator_key: string
          calculator_name: string
          created_at?: string | null
          description?: string | null
          formula: string
          id?: string
          industry: string
          input_fields?: Json
          output_unit: string
          sub_industry?: string | null
        }
        Update: {
          calculator_key?: string
          calculator_name?: string
          created_at?: string | null
          description?: string | null
          formula?: string
          id?: string
          industry?: string
          input_fields?: Json
          output_unit?: string
          sub_industry?: string | null
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
      quality_tracking: {
        Row: {
          accuracy_score: number | null
          completeness_score: number | null
          consistency_score: number | null
          created_at: string | null
          critical_issues: number | null
          freshness_score: number | null
          id: string
          metadata: Json | null
          metric_date: string
          organization_id: string | null
          overall_score: number | null
          total_entries: number | null
          user_id: string
          warnings: number | null
        }
        Insert: {
          accuracy_score?: number | null
          completeness_score?: number | null
          consistency_score?: number | null
          created_at?: string | null
          critical_issues?: number | null
          freshness_score?: number | null
          id?: string
          metadata?: Json | null
          metric_date: string
          organization_id?: string | null
          overall_score?: number | null
          total_entries?: number | null
          user_id: string
          warnings?: number | null
        }
        Update: {
          accuracy_score?: number | null
          completeness_score?: number | null
          consistency_score?: number | null
          created_at?: string | null
          critical_issues?: number | null
          freshness_score?: number | null
          id?: string
          metadata?: Json | null
          metric_date?: string
          organization_id?: string | null
          overall_score?: number | null
          total_entries?: number | null
          user_id?: string
          warnings?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "quality_tracking_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      report_branding_settings: {
        Row: {
          company_logo_url: string | null
          company_name: string | null
          created_at: string
          footer_text: string | null
          header_text: string | null
          id: string
          organization_id: string | null
          primary_color: string | null
          secondary_color: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          company_logo_url?: string | null
          company_name?: string | null
          created_at?: string
          footer_text?: string | null
          header_text?: string | null
          id?: string
          organization_id?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          company_logo_url?: string | null
          company_name?: string | null
          created_at?: string
          footer_text?: string | null
          header_text?: string | null
          id?: string
          organization_id?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "report_branding_settings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
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
          organization_id: string | null
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
          organization_id?: string | null
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
          organization_id?: string | null
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
        Relationships: [
          {
            foreignKeyName: "reports_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      roi_tracking: {
        Row: {
          carbon_credits_change: number | null
          carbon_credits_value: number | null
          compliance_savings: number | null
          created_at: string
          data_quality_savings: number | null
          emissions_tracked: number | null
          entries_processed: number | null
          estimated_hourly_rate: number | null
          id: string
          metadata: Json | null
          organization_id: string | null
          penalty_avoidance: number | null
          period: Database["public"]["Enums"]["roi_period_type"]
          period_end: string
          period_start: string
          platform_cost: number | null
          report_automation_savings: number | null
          reports_generated: number | null
          roi_percentage: number | null
          time_saved_hours: number | null
          time_savings_value: number | null
          total_roi_value: number | null
          user_id: string
        }
        Insert: {
          carbon_credits_change?: number | null
          carbon_credits_value?: number | null
          compliance_savings?: number | null
          created_at?: string
          data_quality_savings?: number | null
          emissions_tracked?: number | null
          entries_processed?: number | null
          estimated_hourly_rate?: number | null
          id?: string
          metadata?: Json | null
          organization_id?: string | null
          penalty_avoidance?: number | null
          period?: Database["public"]["Enums"]["roi_period_type"]
          period_end: string
          period_start: string
          platform_cost?: number | null
          report_automation_savings?: number | null
          reports_generated?: number | null
          roi_percentage?: number | null
          time_saved_hours?: number | null
          time_savings_value?: number | null
          total_roi_value?: number | null
          user_id: string
        }
        Update: {
          carbon_credits_change?: number | null
          carbon_credits_value?: number | null
          compliance_savings?: number | null
          created_at?: string
          data_quality_savings?: number | null
          emissions_tracked?: number | null
          entries_processed?: number | null
          estimated_hourly_rate?: number | null
          id?: string
          metadata?: Json | null
          organization_id?: string | null
          penalty_avoidance?: number | null
          period?: Database["public"]["Enums"]["roi_period_type"]
          period_end?: string
          period_start?: string
          platform_cost?: number | null
          report_automation_savings?: number | null
          reports_generated?: number | null
          roi_percentage?: number | null
          time_saved_hours?: number | null
          time_savings_value?: number | null
          total_roi_value?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "roi_tracking_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
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
      scope3_categories: {
        Row: {
          category_number: number
          created_at: string
          data_sources: string[] | null
          default_emission_factor: number | null
          description: string | null
          emission_factor_unit: string | null
          id: string
          is_upstream: boolean
          methodology_guidance: string | null
          name: string
        }
        Insert: {
          category_number: number
          created_at?: string
          data_sources?: string[] | null
          default_emission_factor?: number | null
          description?: string | null
          emission_factor_unit?: string | null
          id?: string
          is_upstream?: boolean
          methodology_guidance?: string | null
          name: string
        }
        Update: {
          category_number?: number
          created_at?: string
          data_sources?: string[] | null
          default_emission_factor?: number | null
          description?: string | null
          emission_factor_unit?: string | null
          id?: string
          is_upstream?: boolean
          methodology_guidance?: string | null
          name?: string
        }
        Relationships: []
      }
      supplier_emissions: {
        Row: {
          allocated_emissions: number | null
          allocation_method: string | null
          created_at: string
          data_source: string | null
          emission_intensity: number | null
          id: string
          intensity_unit: string | null
          metadata: Json | null
          methodology: string | null
          organization_id: string | null
          reporting_period_end: string | null
          reporting_period_start: string | null
          reporting_year: number
          revenue: number | null
          revenue_currency: string | null
          scope1_emissions: number | null
          scope2_emissions: number | null
          scope3_emissions: number | null
          supplier_id: string
          total_emissions: number | null
          uncertainty_percentage: number | null
          updated_at: string
          verification_status:
            | Database["public"]["Enums"]["verification_status"]
            | null
          verifier_name: string | null
        }
        Insert: {
          allocated_emissions?: number | null
          allocation_method?: string | null
          created_at?: string
          data_source?: string | null
          emission_intensity?: number | null
          id?: string
          intensity_unit?: string | null
          metadata?: Json | null
          methodology?: string | null
          organization_id?: string | null
          reporting_period_end?: string | null
          reporting_period_start?: string | null
          reporting_year: number
          revenue?: number | null
          revenue_currency?: string | null
          scope1_emissions?: number | null
          scope2_emissions?: number | null
          scope3_emissions?: number | null
          supplier_id: string
          total_emissions?: number | null
          uncertainty_percentage?: number | null
          updated_at?: string
          verification_status?:
            | Database["public"]["Enums"]["verification_status"]
            | null
          verifier_name?: string | null
        }
        Update: {
          allocated_emissions?: number | null
          allocation_method?: string | null
          created_at?: string
          data_source?: string | null
          emission_intensity?: number | null
          id?: string
          intensity_unit?: string | null
          metadata?: Json | null
          methodology?: string | null
          organization_id?: string | null
          reporting_period_end?: string | null
          reporting_period_start?: string | null
          reporting_year?: number
          revenue?: number | null
          revenue_currency?: string | null
          scope1_emissions?: number | null
          scope2_emissions?: number | null
          scope3_emissions?: number | null
          supplier_id?: string
          total_emissions?: number | null
          uncertainty_percentage?: number | null
          updated_at?: string
          verification_status?:
            | Database["public"]["Enums"]["verification_status"]
            | null
          verifier_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "supplier_emissions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_emissions_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      supplier_engagements: {
        Row: {
          assigned_to: string | null
          created_at: string
          description: string | null
          due_date: string | null
          engagement_type: Database["public"]["Enums"]["supplier_engagement_type"]
          id: string
          organization_id: string | null
          reminder_sent: boolean | null
          request_details: Json | null
          response_data: Json | null
          response_date: string | null
          sent_date: string | null
          status: string | null
          supplier_id: string
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          engagement_type: Database["public"]["Enums"]["supplier_engagement_type"]
          id?: string
          organization_id?: string | null
          reminder_sent?: boolean | null
          request_details?: Json | null
          response_data?: Json | null
          response_date?: string | null
          sent_date?: string | null
          status?: string | null
          supplier_id: string
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          engagement_type?: Database["public"]["Enums"]["supplier_engagement_type"]
          id?: string
          organization_id?: string | null
          reminder_sent?: boolean | null
          request_details?: Json | null
          response_data?: Json | null
          response_date?: string | null
          sent_date?: string | null
          status?: string | null
          supplier_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "supplier_engagements_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_engagements_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      supplier_products: {
        Row: {
          category: string | null
          created_at: string
          emission_factor: number | null
          emission_factor_source: string | null
          emission_factor_unit: string | null
          id: string
          lca_available: boolean | null
          lca_data: Json | null
          metadata: Json | null
          organization_id: string | null
          price_currency: string | null
          product_code: string | null
          product_name: string
          quantity_purchased: number | null
          scope3_category: number | null
          supplier_id: string
          total_emissions: number | null
          unit: string
          unit_price: number | null
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          emission_factor?: number | null
          emission_factor_source?: string | null
          emission_factor_unit?: string | null
          id?: string
          lca_available?: boolean | null
          lca_data?: Json | null
          metadata?: Json | null
          organization_id?: string | null
          price_currency?: string | null
          product_code?: string | null
          product_name: string
          quantity_purchased?: number | null
          scope3_category?: number | null
          supplier_id: string
          total_emissions?: number | null
          unit: string
          unit_price?: number | null
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          emission_factor?: number | null
          emission_factor_source?: string | null
          emission_factor_unit?: string | null
          id?: string
          lca_available?: boolean | null
          lca_data?: Json | null
          metadata?: Json | null
          organization_id?: string | null
          price_currency?: string | null
          product_code?: string | null
          product_name?: string
          quantity_purchased?: number | null
          scope3_category?: number | null
          supplier_id?: string
          total_emissions?: number | null
          unit?: string
          unit_price?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "supplier_products_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_products_scope3_category_fkey"
            columns: ["scope3_category"]
            isOneToOne: false
            referencedRelation: "scope3_categories"
            referencedColumns: ["category_number"]
          },
          {
            foreignKeyName: "supplier_products_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          annual_spend: number | null
          cdp_score: string | null
          city: string | null
          contact_email: string | null
          contact_name: string | null
          country_code: string | null
          created_at: string
          data_validity_date: string | null
          emissions_data_quality:
            | Database["public"]["Enums"]["emissions_data_quality"]
            | null
          engagement_status: Database["public"]["Enums"]["supplier_engagement_status"]
          has_science_based_target: boolean | null
          id: string
          industry: string | null
          last_data_submission: string | null
          metadata: Json | null
          name: string
          notes: string | null
          organization_id: string | null
          spend_category: string | null
          spend_currency: string | null
          supplier_score: number | null
          tier: Database["public"]["Enums"]["supplier_tier"]
          updated_at: string
        }
        Insert: {
          annual_spend?: number | null
          cdp_score?: string | null
          city?: string | null
          contact_email?: string | null
          contact_name?: string | null
          country_code?: string | null
          created_at?: string
          data_validity_date?: string | null
          emissions_data_quality?:
            | Database["public"]["Enums"]["emissions_data_quality"]
            | null
          engagement_status?: Database["public"]["Enums"]["supplier_engagement_status"]
          has_science_based_target?: boolean | null
          id?: string
          industry?: string | null
          last_data_submission?: string | null
          metadata?: Json | null
          name: string
          notes?: string | null
          organization_id?: string | null
          spend_category?: string | null
          spend_currency?: string | null
          supplier_score?: number | null
          tier?: Database["public"]["Enums"]["supplier_tier"]
          updated_at?: string
        }
        Update: {
          annual_spend?: number | null
          cdp_score?: string | null
          city?: string | null
          contact_email?: string | null
          contact_name?: string | null
          country_code?: string | null
          created_at?: string
          data_validity_date?: string | null
          emissions_data_quality?:
            | Database["public"]["Enums"]["emissions_data_quality"]
            | null
          engagement_status?: Database["public"]["Enums"]["supplier_engagement_status"]
          has_science_based_target?: boolean | null
          id?: string
          industry?: string | null
          last_data_submission?: string | null
          metadata?: Json | null
          name?: string
          notes?: string | null
          organization_id?: string | null
          spend_category?: string | null
          spend_currency?: string | null
          supplier_score?: number | null
          tier?: Database["public"]["Enums"]["supplier_tier"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "suppliers_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
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
          daily_quality_digest: boolean | null
          email_anomaly_alerts: boolean | null
          email_critical_only: boolean | null
          email_frequency: string | null
          email_quality_alerts: boolean | null
          email_weekly_insights: boolean | null
          id: string
          notification_anomaly_alerts: boolean | null
          notification_insights: boolean | null
          notification_sound: boolean | null
          organization_id: string | null
          quality_alert_threshold: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          daily_quality_digest?: boolean | null
          email_anomaly_alerts?: boolean | null
          email_critical_only?: boolean | null
          email_frequency?: string | null
          email_quality_alerts?: boolean | null
          email_weekly_insights?: boolean | null
          id?: string
          notification_anomaly_alerts?: boolean | null
          notification_insights?: boolean | null
          notification_sound?: boolean | null
          organization_id?: string | null
          quality_alert_threshold?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          daily_quality_digest?: boolean | null
          email_anomaly_alerts?: boolean | null
          email_critical_only?: boolean | null
          email_frequency?: string | null
          email_quality_alerts?: boolean | null
          email_weekly_insights?: boolean | null
          id?: string
          notification_anomaly_alerts?: boolean | null
          notification_insights?: boolean | null
          notification_sound?: boolean | null
          organization_id?: string | null
          quality_alert_threshold?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_notification_preferences_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
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
      validation_rules: {
        Row: {
          condition: Json
          created_at: string | null
          error_message: string
          id: string
          is_active: boolean | null
          organization_id: string | null
          rule_name: string
          rule_type: string
          severity: string
          updated_at: string | null
        }
        Insert: {
          condition: Json
          created_at?: string | null
          error_message: string
          id?: string
          is_active?: boolean | null
          organization_id?: string | null
          rule_name: string
          rule_type: string
          severity: string
          updated_at?: string | null
        }
        Update: {
          condition?: Json
          created_at?: string | null
          error_message?: string
          id?: string
          is_active?: boolean | null
          organization_id?: string | null
          rule_name?: string
          rule_type?: string
          severity?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "validation_rules_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
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
      create_user_organization: { Args: { org_name?: string }; Returns: string }
      get_user_organization: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_analyst_or_auditor: { Args: { _user_id: string }; Returns: boolean }
      is_org_member: {
        Args: { _org_id: string; _user_id: string }
        Returns: boolean
      }
      is_org_supervisor: {
        Args: { _org_id: string; _user_id: string }
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
      log_audit_event: {
        Args: {
          p_action: string
          p_entity_id?: string
          p_entity_type: string
          p_metadata?: Json
          p_new_values?: Json
          p_old_values?: Json
        }
        Returns: string
      }
    }
    Enums: {
      app_role: "admin" | "user" | "reporting_analyst" | "auditor"
      approval_status:
        | "draft"
        | "pending_review"
        | "changes_requested"
        | "approved"
        | "rejected"
      carbon_credit_status: "active" | "retired" | "sold" | "pending"
      carbon_credit_type:
        | "VCU"
        | "GCC"
        | "CER"
        | "EUA"
        | "ACR"
        | "CAR"
        | "GS_VER"
        | "OTHER"
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
      emissions_data_quality:
        | "primary"
        | "secondary"
        | "estimated"
        | "spend_based"
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
      industry_type:
        | "manufacturing"
        | "energy_utilities"
        | "financial_services"
        | "technology"
        | "healthcare_pharma"
        | "retail_consumer"
        | "transportation_logistics"
        | "construction_real_estate"
        | "agriculture_food"
        | "other"
      org_role: "owner" | "admin" | "member"
      report_status: "draft" | "pending" | "approved" | "published"
      roi_period_type: "monthly" | "quarterly" | "yearly"
      supplier_engagement_status:
        | "pending"
        | "invited"
        | "active"
        | "unresponsive"
        | "declined"
      supplier_engagement_type:
        | "survey"
        | "data_request"
        | "training"
        | "audit"
        | "collaboration"
      supplier_tier: "tier_1" | "tier_2" | "tier_3"
      verification_status:
        | "unverified"
        | "self_declared"
        | "third_party_verified"
        | "audited"
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
      app_role: ["admin", "user", "reporting_analyst", "auditor"],
      approval_status: [
        "draft",
        "pending_review",
        "changes_requested",
        "approved",
        "rejected",
      ],
      carbon_credit_status: ["active", "retired", "sold", "pending"],
      carbon_credit_type: [
        "VCU",
        "GCC",
        "CER",
        "EUA",
        "ACR",
        "CAR",
        "GS_VER",
        "OTHER",
      ],
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
      emissions_data_quality: [
        "primary",
        "secondary",
        "estimated",
        "spend_based",
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
      industry_type: [
        "manufacturing",
        "energy_utilities",
        "financial_services",
        "technology",
        "healthcare_pharma",
        "retail_consumer",
        "transportation_logistics",
        "construction_real_estate",
        "agriculture_food",
        "other",
      ],
      org_role: ["owner", "admin", "member"],
      report_status: ["draft", "pending", "approved", "published"],
      roi_period_type: ["monthly", "quarterly", "yearly"],
      supplier_engagement_status: [
        "pending",
        "invited",
        "active",
        "unresponsive",
        "declined",
      ],
      supplier_engagement_type: [
        "survey",
        "data_request",
        "training",
        "audit",
        "collaboration",
      ],
      supplier_tier: ["tier_1", "tier_2", "tier_3"],
      verification_status: [
        "unverified",
        "self_declared",
        "third_party_verified",
        "audited",
      ],
    },
  },
} as const
