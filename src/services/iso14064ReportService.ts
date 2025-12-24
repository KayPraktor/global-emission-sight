import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ProfessionalPDFGenerator, BrandingConfig } from './professionalPDFGenerator';

export interface ISO14064ReportData {
  organizationalBoundary: {
    approach: 'operational-control' | 'financial-control' | 'equity-share';
    description: string;
    facilitiesIncluded: string[];
  };
  operationalBoundary: {
    scope1Included: boolean;
    scope2Included: boolean;
    scope3Included: boolean;
    scope3Categories?: string[];
    exclusions?: string[];
    justification?: string;
  };
  baseYear: {
    year: number;
    emissions: number;
    rationale: string;
  };
  reportingPeriod: {
    start: string;
    end: string;
  };
  emissions: {
    scope1: {
      total: number;
      sources: Array<{ category: string; emissions: number; methodology: string }>;
    };
    scope2: {
      locationBased: number;
      marketBased: number;
      sources: Array<{ category: string; emissions: number; methodology: string }>;
    };
    scope3?: {
      total: number;
      categories: Array<{ category: string; emissions: number; methodology: string }>;
    };
  };
  uncertainty: {
    overall: number;
    scope1: number;
    scope2: number;
    scope3?: number;
    methodology: string;
  };
  verification?: {
    status: 'verified' | 'pending' | 'not-verified';
    verifier?: string;
    level?: 'limited' | 'reasonable';
    date?: string;
    opinion?: string;
  };
  declarant: {
    name: string;
    position: string;
    company: string;
  };
}

class ISO14064ReportService {
  async generateISO14064Report(data: ISO14064ReportData): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please sign in to generate reports');
        return;
      }

      toast.info('Generating ISO 14064-1 Report...');

      const branding = await this.fetchBrandingSettings(user.id);
      await this.generateISO14064PDF(data, branding);

      toast.success('ISO 14064-1 Report generated successfully!');
    } catch (error) {
      console.error('Error generating ISO 14064-1 report:', error);
      toast.error('Failed to generate ISO 14064-1 report');
    }
  }

  async generateReportFromDatabase(year: number): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please sign in to generate reports');
        return;
      }

      toast.info('Fetching emissions data...');

      // Fetch emissions entries for the year
      const startDate = `${year}-01-01`;
      const endDate = `${year}-12-31`;

      const { data: entries, error } = await supabase
        .from('emissions_entries')
        .select('*, calculations(*), facilities(*)')
        .eq('user_id', user.id)
        .gte('entry_date', startDate)
        .lte('entry_date', endDate);

      if (error) throw error;

      if (!entries || entries.length === 0) {
        toast.error('No emissions data found for the selected year');
        return;
      }

      // Fetch base year data (previous year)
      const { data: baseYearEntries } = await supabase
        .from('emissions_entries')
        .select('*, calculations(*)')
        .eq('user_id', user.id)
        .gte('entry_date', `${year - 1}-01-01`)
        .lte('entry_date', `${year - 1}-12-31`);

      // Process data into ISO 14064 format
      const reportData = this.processEmissionsData(entries, baseYearEntries || [], year);
      
      await this.generateISO14064Report(reportData);
    } catch (error) {
      console.error('Error generating report from database:', error);
      toast.error('Failed to generate report');
    }
  }

  async generateSampleReport(): Promise<void> {
    const sampleData: ISO14064ReportData = {
      organizationalBoundary: {
        approach: 'operational-control',
        description: 'The organizational boundary encompasses all facilities and operations where the organization has operational control, including owned and leased facilities.',
        facilitiesIncluded: [
          'Headquarters - Tehran',
          'Manufacturing Plant - Karaj',
          'Distribution Center - Isfahan',
          'Regional Office - Shiraz'
        ]
      },
      operationalBoundary: {
        scope1Included: true,
        scope2Included: true,
        scope3Included: true,
        scope3Categories: [
          'Purchased goods and services',
          'Business travel',
          'Employee commuting',
          'Upstream transportation',
          'Waste generated in operations'
        ],
        exclusions: ['Downstream leased assets'],
        justification: 'Downstream leased assets excluded due to data unavailability and immateriality (<1% of total emissions).'
      },
      baseYear: {
        year: 2023,
        emissions: 15420,
        rationale: 'Base year selected as the first year of comprehensive GHG inventory with reliable data across all scopes.'
      },
      reportingPeriod: {
        start: '2024-01-01',
        end: '2024-12-31'
      },
      emissions: {
        scope1: {
          total: 4850,
          sources: [
            { category: 'Stationary Combustion', emissions: 2100, methodology: 'Direct measurement with emission factors from IPCC 2019' },
            { category: 'Mobile Combustion', emissions: 1650, methodology: 'Fuel consumption × emission factors (EPA 2024)' },
            { category: 'Process Emissions', emissions: 800, methodology: 'Mass balance calculation' },
            { category: 'Fugitive Emissions', emissions: 300, methodology: 'Estimation based on equipment count and leak rates' }
          ]
        },
        scope2: {
          locationBased: 8200,
          marketBased: 6100,
          sources: [
            { category: 'Purchased Electricity', emissions: 7500, methodology: 'Grid emission factors from IEA 2024' },
            { category: 'Purchased Steam', emissions: 700, methodology: 'Supplier-specific emission factors' }
          ]
        },
        scope3: {
          total: 12500,
          categories: [
            { category: 'Purchased Goods & Services', emissions: 6200, methodology: 'Spend-based method with EEIO factors' },
            { category: 'Business Travel', emissions: 1800, methodology: 'Distance-based calculation' },
            { category: 'Employee Commuting', emissions: 2100, methodology: 'Employee survey with distance-based factors' },
            { category: 'Upstream Transportation', emissions: 1600, methodology: 'Supplier data and ton-km calculations' },
            { category: 'Waste Generated', emissions: 800, methodology: 'Waste composition and disposal method factors' }
          ]
        }
      },
      uncertainty: {
        overall: 8.5,
        scope1: 5.0,
        scope2: 3.5,
        scope3: 15.0,
        methodology: 'Monte Carlo simulation with 10,000 iterations based on IPCC Tier 1 uncertainty ranges for activity data and emission factors.'
      },
      verification: {
        status: 'verified',
        verifier: 'Green Assurance Partners',
        level: 'limited',
        date: '2025-02-15',
        opinion: 'Based on our limited assurance engagement, nothing has come to our attention that causes us to believe that the GHG statement is not fairly stated in accordance with ISO 14064-1:2018.'
      },
      declarant: {
        name: 'Dr. Sara Tehrani',
        position: 'Chief Sustainability Officer',
        company: 'Sample Corporation'
      }
    };

    await this.generateISO14064Report(sampleData);
  }

  private async fetchBrandingSettings(userId: string): Promise<BrandingConfig> {
    const { data } = await supabase
      .from('report_branding_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    return {
      companyName: data?.company_name || 'Your Company',
      companyLogoUrl: data?.company_logo_url,
      primaryColor: data?.primary_color || '#065f46',
      secondaryColor: data?.secondary_color || '#10b981',
      headerText: data?.header_text || 'ISO 14064-1:2018 Compliant GHG Inventory',
      footerText: data?.footer_text
    };
  }

  private processEmissionsData(entries: any[], baseYearEntries: any[], year: number): ISO14064ReportData {
    // Calculate scope emissions
    let scope1 = 0, scope2 = 0, scope3 = 0;
    const scope1Sources: { [key: string]: number } = {};
    const scope2Sources: { [key: string]: number } = {};
    const scope3Categories: { [key: string]: number } = {};
    const facilities = new Set<string>();

    entries.forEach(entry => {
      const emissions = entry.calculations?.[0]?.calculated_emissions || 0;
      
      if (entry.facilities?.name) {
        facilities.add(entry.facilities.name);
      }

      if (entry.scope === 'S1') {
        scope1 += emissions;
        scope1Sources[entry.category] = (scope1Sources[entry.category] || 0) + emissions;
      } else if (entry.scope === 'S2') {
        scope2 += emissions;
        scope2Sources[entry.category] = (scope2Sources[entry.category] || 0) + emissions;
      } else if (entry.scope === 'S3') {
        scope3 += emissions;
        scope3Categories[entry.category] = (scope3Categories[entry.category] || 0) + emissions;
      }
    });

    // Calculate base year emissions
    const baseYearEmissions = baseYearEntries.reduce((sum, entry) => {
      return sum + (entry.calculations?.[0]?.calculated_emissions || 0);
    }, 0);

    return {
      organizationalBoundary: {
        approach: 'operational-control',
        description: 'All facilities and operations under organizational control.',
        facilitiesIncluded: Array.from(facilities)
      },
      operationalBoundary: {
        scope1Included: true,
        scope2Included: true,
        scope3Included: scope3 > 0
      },
      baseYear: {
        year: year - 1,
        emissions: baseYearEmissions,
        rationale: 'Previous year selected as base year for comparison.'
      },
      reportingPeriod: {
        start: `${year}-01-01`,
        end: `${year}-12-31`
      },
      emissions: {
        scope1: {
          total: scope1,
          sources: Object.entries(scope1Sources).map(([category, emissions]) => ({
            category,
            emissions,
            methodology: 'GHG Protocol calculation methodology'
          }))
        },
        scope2: {
          locationBased: scope2,
          marketBased: scope2 * 0.85, // Estimate
          sources: Object.entries(scope2Sources).map(([category, emissions]) => ({
            category,
            emissions,
            methodology: 'Location-based method with grid emission factors'
          }))
        },
        scope3: scope3 > 0 ? {
          total: scope3,
          categories: Object.entries(scope3Categories).map(([category, emissions]) => ({
            category,
            emissions,
            methodology: 'GHG Protocol Scope 3 Standard'
          }))
        } : undefined
      },
      uncertainty: {
        overall: 10,
        scope1: 5,
        scope2: 4,
        scope3: scope3 > 0 ? 20 : undefined,
        methodology: 'IPCC Tier 1 default uncertainty ranges'
      },
      declarant: {
        name: 'Report Generator',
        position: 'Sustainability Manager',
        company: 'Your Company'
      }
    };
  }

  private async generateISO14064PDF(data: ISO14064ReportData, branding: BrandingConfig): Promise<void> {
    const pdf = new ProfessionalPDFGenerator(branding);

    const periodYear = new Date(data.reportingPeriod.start).getFullYear();

    // Cover page
    pdf.createCoverPage(
      'GHG Inventory Report',
      `ISO 14064-1:2018 Compliant`,
      `Reporting Year: ${periodYear}`,
      'Greenhouse Gas Inventory'
    );

    // Executive Summary
    pdf.addSection('Executive Summary', 1);
    
    const totalEmissions = data.emissions.scope1.total + 
      data.emissions.scope2.locationBased + 
      (data.emissions.scope3?.total || 0);
    
    const yoyChange = data.baseYear.emissions > 0 
      ? ((totalEmissions - data.baseYear.emissions) / data.baseYear.emissions) * 100 
      : 0;

    pdf.addParagraph(
      `This report presents the greenhouse gas (GHG) inventory of ${branding.companyName} for the reporting period ${this.formatDate(data.reportingPeriod.start)} to ${this.formatDate(data.reportingPeriod.end)}, prepared in accordance with ISO 14064-1:2018 requirements.`
    );
    pdf.addSpacing(5);

    pdf.addMetricsRow([
      { 
        label: 'Total Emissions', 
        value: this.formatNumber(totalEmissions), 
        unit: 'tCO₂e',
        change: `${yoyChange >= 0 ? '+' : ''}${yoyChange.toFixed(1)}% vs base year`,
        changeType: yoyChange < 0 ? 'positive' : yoyChange > 0 ? 'negative' : 'neutral'
      },
      { label: 'Scope 1', value: this.formatNumber(data.emissions.scope1.total), unit: 'tCO₂e' },
      { label: 'Scope 2', value: this.formatNumber(data.emissions.scope2.locationBased), unit: 'tCO₂e' },
      { label: 'Scope 3', value: this.formatNumber(data.emissions.scope3?.total || 0), unit: 'tCO₂e' }
    ]);

    pdf.addSpacing(10);

    // Key highlights
    pdf.addSection('Key Highlights', 2);
    pdf.addKeyValueSection([
      { label: 'Reporting Standard', value: 'ISO 14064-1:2018', highlight: true },
      { label: 'Consolidation Approach', value: this.formatApproach(data.organizationalBoundary.approach) },
      { label: 'Base Year', value: data.baseYear.year.toString() },
      { label: 'Facilities Included', value: data.organizationalBoundary.facilitiesIncluded.length.toString() },
      { label: 'Uncertainty (±)', value: `${data.uncertainty.overall}%` },
      { label: 'Verification Status', value: this.formatVerificationStatus(data.verification?.status) }
    ]);

    // Organizational Boundary
    pdf.addPage();
    pdf.addSection('1. Organizational Boundary', 1);
    pdf.addParagraph(data.organizationalBoundary.description);
    pdf.addSpacing(5);

    pdf.addSection('Consolidation Approach', 2);
    pdf.addParagraph(
      `The ${this.formatApproach(data.organizationalBoundary.approach)} approach has been used for consolidating GHG emissions in accordance with ISO 14064-1:2018 Clause 5.1.`
    );

    pdf.addSection('Facilities Included', 2);
    pdf.addTable(
      ['#', 'Facility Name'],
      data.organizationalBoundary.facilitiesIncluded.map((f, i) => [(i + 1).toString(), f]),
      { title: 'List of Reporting Facilities' }
    );

    // Operational Boundary
    pdf.addPage();
    pdf.addSection('2. Operational Boundary', 1);
    pdf.addParagraph(
      'The operational boundary defines the scope of direct and indirect emissions included in the GHG inventory.'
    );
    pdf.addSpacing(5);

    pdf.addKeyValueSection([
      { label: 'Scope 1 (Direct Emissions)', value: data.operationalBoundary.scope1Included ? '✓ Included' : '✗ Excluded', highlight: data.operationalBoundary.scope1Included },
      { label: 'Scope 2 (Energy Indirect)', value: data.operationalBoundary.scope2Included ? '✓ Included' : '✗ Excluded', highlight: data.operationalBoundary.scope2Included },
      { label: 'Scope 3 (Other Indirect)', value: data.operationalBoundary.scope3Included ? '✓ Included' : '✗ Excluded', highlight: data.operationalBoundary.scope3Included }
    ]);

    if (data.operationalBoundary.scope3Categories && data.operationalBoundary.scope3Categories.length > 0) {
      pdf.addSection('Scope 3 Categories Included', 2);
      pdf.addTable(
        ['Category'],
        data.operationalBoundary.scope3Categories.map(c => [c])
      );
    }

    if (data.operationalBoundary.exclusions && data.operationalBoundary.exclusions.length > 0) {
      pdf.addSection('Exclusions', 2);
      pdf.addParagraph(`The following sources have been excluded from the inventory: ${data.operationalBoundary.exclusions.join(', ')}.`);
      if (data.operationalBoundary.justification) {
        pdf.addParagraph(`Justification: ${data.operationalBoundary.justification}`, { bold: true });
      }
    }

    // GHG Emissions Quantification
    pdf.addPage();
    pdf.addSection('3. GHG Emissions Quantification', 1);

    // Scope 1
    pdf.addSection('3.1 Scope 1: Direct Emissions', 2);
    pdf.addParagraph(
      `Total Scope 1 emissions: ${this.formatNumber(data.emissions.scope1.total)} tCO₂e`
    );
    pdf.addTable(
      ['Emission Source', 'Emissions (tCO₂e)', 'Quantification Methodology'],
      data.emissions.scope1.sources.map(s => [
        s.category,
        this.formatNumber(s.emissions),
        s.methodology
      ]),
      { title: 'Scope 1 Emission Sources' }
    );

    // Scope 2
    pdf.addSection('3.2 Scope 2: Energy Indirect Emissions', 2);
    pdf.addKeyValueSection([
      { label: 'Location-based emissions', value: `${this.formatNumber(data.emissions.scope2.locationBased)} tCO₂e`, highlight: true },
      { label: 'Market-based emissions', value: `${this.formatNumber(data.emissions.scope2.marketBased)} tCO₂e` }
    ]);
    pdf.addTable(
      ['Emission Source', 'Emissions (tCO₂e)', 'Quantification Methodology'],
      data.emissions.scope2.sources.map(s => [
        s.category,
        this.formatNumber(s.emissions),
        s.methodology
      ]),
      { title: 'Scope 2 Emission Sources (Location-based)' }
    );

    // Scope 3
    if (data.emissions.scope3 && data.emissions.scope3.categories.length > 0) {
      pdf.addPage();
      pdf.addSection('3.3 Scope 3: Other Indirect Emissions', 2);
      pdf.addParagraph(
        `Total Scope 3 emissions: ${this.formatNumber(data.emissions.scope3.total)} tCO₂e`
      );
      pdf.addTable(
        ['Category', 'Emissions (tCO₂e)', 'Quantification Methodology'],
        data.emissions.scope3.categories.map(c => [
          c.category,
          this.formatNumber(c.emissions),
          c.methodology
        ]),
        { title: 'Scope 3 Emission Categories' }
      );
    }

    // Base Year & Historical Comparison
    pdf.addPage();
    pdf.addSection('4. Base Year Comparison', 1);
    pdf.addKeyValueSection([
      { label: 'Base Year', value: data.baseYear.year.toString(), highlight: true },
      { label: 'Base Year Emissions', value: `${this.formatNumber(data.baseYear.emissions)} tCO₂e` },
      { label: 'Current Year Emissions', value: `${this.formatNumber(totalEmissions)} tCO₂e` },
      { label: 'Absolute Change', value: `${this.formatNumber(totalEmissions - data.baseYear.emissions)} tCO₂e` },
      { label: 'Percentage Change', value: `${yoyChange >= 0 ? '+' : ''}${yoyChange.toFixed(1)}%` }
    ]);
    pdf.addSpacing(5);
    pdf.addSection('Base Year Rationale', 2);
    pdf.addParagraph(data.baseYear.rationale);

    // Uncertainty Assessment
    pdf.addSection('5. Uncertainty Assessment', 1);
    pdf.addParagraph(data.uncertainty.methodology);
    pdf.addSpacing(5);
    pdf.addTable(
      ['Scope', 'Uncertainty Range'],
      [
        ['Scope 1', `±${data.uncertainty.scope1}%`],
        ['Scope 2', `±${data.uncertainty.scope2}%`],
        ...(data.uncertainty.scope3 ? [['Scope 3', `±${data.uncertainty.scope3}%`]] : []),
        ['Overall', `±${data.uncertainty.overall}%`]
      ],
      { title: 'Uncertainty by Scope', highlightFirstColumn: true }
    );

    // Verification Statement
    if (data.verification) {
      pdf.addPage();
      pdf.addSection('6. Assurance Statement', 1);
      pdf.addKeyValueSection([
        { label: 'Verification Status', value: this.formatVerificationStatus(data.verification.status), highlight: true },
        { label: 'Verifier', value: data.verification.verifier || 'Not specified' },
        { label: 'Assurance Level', value: data.verification.level === 'limited' ? 'Limited Assurance' : 'Reasonable Assurance' },
        { label: 'Verification Date', value: data.verification.date ? this.formatDate(data.verification.date) : 'Not specified' }
      ]);
      
      if (data.verification.opinion) {
        pdf.addSection('Verifier Opinion', 2);
        pdf.addParagraph(data.verification.opinion, { bold: true });
      }
    }

    // Methodology
    pdf.addPage();
    pdf.addMethodologySection([
      {
        name: 'ISO 14064-1:2018 Compliance',
        description: 'This inventory has been prepared in accordance with ISO 14064-1:2018 "Greenhouse gases — Part 1: Specification with guidance at the organization level for quantification and reporting of greenhouse gas emissions and removals."',
        source: 'ISO 14064-1:2018'
      },
      {
        name: 'GHG Protocol Standards',
        description: 'Calculation methodologies are aligned with the GHG Protocol Corporate Accounting and Reporting Standard and the GHG Protocol Scope 2 Guidance.',
        source: 'World Resources Institute & WBCSD'
      },
      {
        name: 'Emission Factors',
        description: 'Emission factors have been sourced from recognized databases including IPCC, national inventories, and supplier-specific data where available.',
        source: 'IPCC Guidelines 2019'
      },
      {
        name: 'Global Warming Potentials',
        description: 'GWP values are based on the IPCC Fifth Assessment Report (AR5) 100-year values as per ISO 14064-1:2018 requirements.',
        source: 'IPCC AR5'
      }
    ]);

    // Declaration
    pdf.addDeclarationSection(
      data.declarant.name,
      `${data.declarant.position}, ${data.declarant.company}`,
      new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    );

    // Finalize and save
    const filename = `ISO14064_GHG_Inventory_${periodYear}.pdf`;
    pdf.finalize(filename);
  }

  private formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  private formatNumber(num: number): string {
    return num.toLocaleString('en-US', { maximumFractionDigits: 2 });
  }

  private formatApproach(approach: string): string {
    const approaches: Record<string, string> = {
      'operational-control': 'Operational Control',
      'financial-control': 'Financial Control',
      'equity-share': 'Equity Share'
    };
    return approaches[approach] || approach;
  }

  private formatVerificationStatus(status?: string): string {
    const statuses: Record<string, string> = {
      'verified': '✓ Third-Party Verified',
      'pending': '⏳ Verification Pending',
      'not-verified': '○ Not Verified'
    };
    return statuses[status || 'not-verified'] || 'Not Verified';
  }
}

export const iso14064ReportService = new ISO14064ReportService();
