/**
 * @file Schema Map — Data Dictionary
 * @description Reference mapping of every major database table to its TypeScript
 * type and column names. Use this as a quick-reference when writing queries or
 * debugging field-name mismatches.
 *
 * All column names use **snake_case** to match the Postgres schema exactly.
 * The canonical types are auto-generated in `@/integrations/supabase/types.ts`.
 *
 * @example
 * ```ts
 * import type { Database } from '@/integrations/supabase/types';
 * type Facility = Database['public']['Tables']['facilities']['Row'];
 * ```
 */

// ─── Facilities ─────────────────────────────────────────────────────────────
/**
 * **Table:** `public.facilities`
 *
 * | Column           | Type          | Notes                              |
 * |------------------|---------------|------------------------------------|
 * | id               | uuid (PK)     | gen_random_uuid()                  |
 * | user_id          | uuid          | Owner                              |
 * | name             | text          |                                    |
 * | facility_type    | facility_type | Enum: office, warehouse, …         |
 * | country_code     | text          | ISO-2                              |
 * | city             | text          |                                    |
 * | address          | text          |                                    |
 * | metadata         | jsonb         |                                    |
 * | organization_id  | uuid          | FK → organizations                 |
 * | created_at       | timestamptz   |                                    |
 * | updated_at       | timestamptz   |                                    |
 */
export type _FacilitySchema = 'facilities';

// ─── Emission Factors ───────────────────────────────────────────────────────
/**
 * **Table:** `public.emission_factors`
 *
 * | Column           | Type            | Notes                            |
 * |------------------|-----------------|----------------------------------|
 * | id               | uuid (PK)       |                                  |
 * | user_id          | uuid            | Nullable for system factors      |
 * | name             | text            |                                  |
 * | category         | text            |                                  |
 * | scope            | emission_scope  | Enum: S1, S2, S3                 |
 * | factor_value     | numeric         |                                  |
 * | unit             | ef_unit         | Enum: kgCO2e/kWh, kgCO2e/kg, …  |
 * | source           | text            |                                  |
 * | methodology      | text            |                                  |
 * | is_custom        | boolean         | Default: false                   |
 * | is_latest        | boolean         | Default: true                    |
 * | superseded_by    | uuid            | FK → emission_factors            |
 * | version          | varchar         |                                  |
 * | year             | integer         |                                  |
 * | region           | text            |                                  |
 * | country_code     | text            |                                  |
 * | organization_id  | uuid            | FK → organizations               |
 * | created_at       | timestamptz     |                                  |
 * | updated_at       | timestamptz     |                                  |
 */
export type _EmissionFactorSchema = 'emission_factors';

// ─── Emissions Entries ──────────────────────────────────────────────────────
/**
 * **Table:** `public.emissions_entries`
 *
 * | Column               | Type              | Notes                       |
 * |----------------------|-------------------|-----------------------------|
 * | id                   | uuid (PK)         |                             |
 * | user_id              | uuid              |                             |
 * | facility_id          | uuid              | FK → facilities             |
 * | emission_factor_id   | uuid              | FK → emission_factors       |
 * | entry_date           | date              |                             |
 * | scope                | emission_scope    | S1, S2, S3                  |
 * | category             | text              |                             |
 * | quantity             | numeric           |                             |
 * | unit                 | emission_unit     | kWh, MWh, L, kg, t, m3      |
 * | calculation_method   | text              |                             |
 * | data_quality_score   | numeric           |                             |
 * | approval_status      | approval_status   |                             |
 * | organization_id      | uuid              | FK → organizations          |
 * | metadata             | jsonb             |                             |
 * | created_at           | timestamptz       |                             |
 * | updated_at           | timestamptz       |                             |
 */
export type _EmissionsEntrySchema = 'emissions_entries';

// ─── Calculations ───────────────────────────────────────────────────────────
/**
 * **Table:** `public.calculations`
 *
 * | Column                | Type        | Notes                           |
 * |-----------------------|-------------|---------------------------------|
 * | id                    | uuid (PK)   |                                 |
 * | user_id               | uuid        |                                 |
 * | emissions_entry_id    | uuid        | FK → emissions_entries          |
 * | emission_factor_id    | uuid        | FK → emission_factors           |
 * | calculated_emissions  | numeric     | Result in tCO₂e                 |
 * | calculation_formula   | text        |                                 |
 * | confidence_score      | numeric     |                                 |
 * | uncertainty           | numeric     |                                 |
 * | calculation_timestamp | timestamptz |                                 |
 * | metadata              | jsonb       |                                 |
 */
export type _CalculationSchema = 'calculations';

// ─── Goals ──────────────────────────────────────────────────────────────────
/**
 * **Table:** `public.goals`
 *
 * Key columns: `id`, `user_id`, `organization_id`, `title`, `target_date`,
 * `baseline_emissions`, `target_emissions`, `current_emissions`,
 * `progress_percentage`, `status` (goal_status enum), `scope_covered`.
 */
export type _GoalSchema = 'goals';

// ─── Reports ────────────────────────────────────────────────────────────────
/**
 * **Table:** `public.reports`
 *
 * Key columns: `id`, `user_id`, `organization_id`, `title`, `report_type`,
 * `status` (report_status enum), `period_start`, `period_end`,
 * `total_emissions`, `scope_1_emissions`, `scope_2_emissions`,
 * `scope_3_emissions`, `file_url`, `metadata`.
 */
export type _ReportSchema = 'reports';

// ─── Organizations ──────────────────────────────────────────────────────────
/**
 * **Table:** `public.organizations`
 *
 * Key columns: `id`, `name`, `industry`, `sub_industry`, `employee_count`,
 * `annual_revenue_usd`, `square_footage`, `metadata`.
 */
export type _OrganizationSchema = 'organizations';

// ─── Enterprise Metrics ─────────────────────────────────────────────────────
/**
 * **Table:** `public.enterprise_metrics`
 *
 * Key columns: `id`, `organization_id`, `metric_date`, `total_emissions`,
 * `scope_1_emissions`, `scope_2_emissions`, `scope_3_emissions`,
 * `carbon_cost`, `compliance_score`, `carbon_intensity`,
 * `net_zero_progress`, `risk_exposure`, `metadata`.
 */
export type _EnterpriseMetricSchema = 'enterprise_metrics';

// ─── Materiality Assessments ────────────────────────────────────────────────
/**
 * **Table:** `public.materiality_assessments`
 *
 * Key columns: `id`, `organization_id`, `user_id`, `topic_id`, `topic_name`,
 * `topic_category`, `esrs_standard`, `impact_score`, `financial_score`,
 * `is_material`, `assessed_at`.
 */
export type _MaterialityAssessmentSchema = 'materiality_assessments';
