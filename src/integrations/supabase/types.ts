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
      emission_factors: {
        Row: {
          category: string
          country_code: string | null
          created_at: string
          factor_value: number
          id: string
          is_custom: boolean | null
          metadata: Json | null
          methodology: string | null
          name: string
          region: string | null
          scope: Database["public"]["Enums"]["emission_scope"]
          source: string
          uncertainty: number | null
          unit: Database["public"]["Enums"]["ef_unit"]
          updated_at: string
          user_id: string | null
          year: number | null
        }
        Insert: {
          category: string
          country_code?: string | null
          created_at?: string
          factor_value: number
          id?: string
          is_custom?: boolean | null
          metadata?: Json | null
          methodology?: string | null
          name: string
          region?: string | null
          scope: Database["public"]["Enums"]["emission_scope"]
          source: string
          uncertainty?: number | null
          unit: Database["public"]["Enums"]["ef_unit"]
          updated_at?: string
          user_id?: string | null
          year?: number | null
        }
        Update: {
          category?: string
          country_code?: string | null
          created_at?: string
          factor_value?: number
          id?: string
          is_custom?: boolean | null
          metadata?: Json | null
          methodology?: string | null
          name?: string
          region?: string | null
          scope?: Database["public"]["Enums"]["emission_scope"]
          source?: string
          uncertainty?: number | null
          unit?: Database["public"]["Enums"]["ef_unit"]
          updated_at?: string
          user_id?: string | null
          year?: number | null
        }
        Relationships: []
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
      profiles: {
        Row: {
          company_name: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          job_title: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          company_name?: string | null
          created_at?: string
          email: string
          full_name: string
          id: string
          job_title?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          company_name?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          job_title?: string | null
          phone?: string | null
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
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
      report_status: ["draft", "pending", "approved", "published"],
    },
  },
} as const
