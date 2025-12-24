import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ProfessionalPDFGenerator, BrandingConfig } from './professionalPDFGenerator';

export interface CBAMProduct {
  id: string;
  cnCode: string;
  productDescription: string;
  countryOfOrigin: string;
  installationName: string;
  installationId?: string;
  quantityImported: number;
  quantityUnit: string;
  embeddedEmissionsDirect: number;
  embeddedEmissionsIndirect: number;
  totalEmbeddedEmissions: number;
  specificEmbeddedEmissions: number;
  carbonPricePaid: number;
  carbonPriceCurrency: string;
}

export interface CBAMReportData {
  reportingPeriod: { start: string; end: string };
  declarant: {
    name: string;
    position: string;
    company: string;
    eoriNumber?: string;
    address?: string;
  };
  products: CBAMProduct[];
  totalEmissions: number;
  totalCarbonPricePaid: number;
  methodology: string;
}

// CBAM CN Codes (Carbon Border Adjustment Mechanism covered products)
export const CBAM_CN_CODES = [
  { code: '2523', category: 'Cement', description: 'Portland cement, aluminous cement, slag cement' },
  { code: '2507', category: 'Cement', description: 'Kaolin and other kaolinic clays' },
  { code: '7201', category: 'Iron & Steel', description: 'Pig iron and spiegeleisen' },
  { code: '7202', category: 'Iron & Steel', description: 'Ferro-alloys' },
  { code: '7203', category: 'Iron & Steel', description: 'Iron and non-alloy steel products' },
  { code: '7204', category: 'Iron & Steel', description: 'Ferrous waste and scrap' },
  { code: '7205', category: 'Iron & Steel', description: 'Granules and powders of pig iron' },
  { code: '7206', category: 'Iron & Steel', description: 'Iron and non-alloy steel ingots' },
  { code: '7207', category: 'Iron & Steel', description: 'Semi-finished products of iron' },
  { code: '7208', category: 'Iron & Steel', description: 'Flat-rolled products of iron' },
  { code: '7209', category: 'Iron & Steel', description: 'Flat-rolled products cold-rolled' },
  { code: '7210', category: 'Iron & Steel', description: 'Flat-rolled products clad, plated' },
  { code: '7211', category: 'Iron & Steel', description: 'Flat-rolled products width < 600mm' },
  { code: '7212', category: 'Iron & Steel', description: 'Flat-rolled products plated width < 600mm' },
  { code: '7213', category: 'Iron & Steel', description: 'Bars and rods, hot-rolled' },
  { code: '7214', category: 'Iron & Steel', description: 'Bars and rods, forged, hot-rolled' },
  { code: '7215', category: 'Iron & Steel', description: 'Bars and rods, other' },
  { code: '7216', category: 'Iron & Steel', description: 'Angles, shapes and sections' },
  { code: '7217', category: 'Iron & Steel', description: 'Wire of iron or non-alloy steel' },
  { code: '7218', category: 'Iron & Steel', description: 'Stainless steel ingots' },
  { code: '7219', category: 'Iron & Steel', description: 'Flat-rolled stainless steel' },
  { code: '7220', category: 'Iron & Steel', description: 'Flat-rolled stainless steel width < 600mm' },
  { code: '7221', category: 'Iron & Steel', description: 'Bars and rods of stainless steel' },
  { code: '7222', category: 'Iron & Steel', description: 'Bars and rods of stainless steel, other' },
  { code: '7223', category: 'Iron & Steel', description: 'Wire of stainless steel' },
  { code: '7224', category: 'Iron & Steel', description: 'Other alloy steel ingots' },
  { code: '7225', category: 'Iron & Steel', description: 'Flat-rolled products of other alloy steel' },
  { code: '7226', category: 'Iron & Steel', description: 'Flat-rolled other alloy steel width < 600mm' },
  { code: '7227', category: 'Iron & Steel', description: 'Bars and rods of other alloy steel' },
  { code: '7228', category: 'Iron & Steel', description: 'Bars and rods of other alloy steel, other' },
  { code: '7229', category: 'Iron & Steel', description: 'Wire of other alloy steel' },
  { code: '7601', category: 'Aluminium', description: 'Unwrought aluminium' },
  { code: '7602', category: 'Aluminium', description: 'Aluminium waste and scrap' },
  { code: '7603', category: 'Aluminium', description: 'Aluminium powders and flakes' },
  { code: '7604', category: 'Aluminium', description: 'Aluminium bars, rods and profiles' },
  { code: '7605', category: 'Aluminium', description: 'Aluminium wire' },
  { code: '7606', category: 'Aluminium', description: 'Aluminium plates, sheets and strip' },
  { code: '7607', category: 'Aluminium', description: 'Aluminium foil' },
  { code: '7608', category: 'Aluminium', description: 'Aluminium tubes and pipes' },
  { code: '2804', category: 'Hydrogen', description: 'Hydrogen' },
  { code: '2814', category: 'Fertilizers', description: 'Ammonia' },
  { code: '3102', category: 'Fertilizers', description: 'Mineral or chemical fertilizers, nitrogenous' },
  { code: '2716', category: 'Electricity', description: 'Electrical energy' },
];

class CBAMReportService {
  async generateCBAMReport(data: CBAMReportData): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please sign in to generate reports');
        return;
      }

      toast.info('Generating CBAM Report...');

      const branding = await this.fetchBrandingSettings(user.id);
      await this.generateCBAMPDF(data, branding);

      toast.success('CBAM Report generated successfully!');
    } catch (error) {
      console.error('Error generating CBAM report:', error);
      toast.error('Failed to generate CBAM report');
    }
  }

  async generateSampleCBAMReport(): Promise<void> {
    const sampleData: CBAMReportData = {
      reportingPeriod: {
        start: '2024-01-01',
        end: '2024-03-31'
      },
      declarant: {
        name: 'John Smith',
        position: 'Sustainability Manager',
        company: 'Sample Corporation',
        eoriNumber: 'DE123456789012345',
        address: 'Sample Street 123, Berlin, Germany'
      },
      products: [
        {
          id: '1',
          cnCode: '7207 11 14',
          productDescription: 'Semi-finished products of iron, containing < 0.25% carbon',
          countryOfOrigin: 'Turkey',
          installationName: 'Ereğli Iron & Steel Works',
          installationId: 'TR-001-ERDEMIR',
          quantityImported: 5000,
          quantityUnit: 'tonnes',
          embeddedEmissionsDirect: 8500,
          embeddedEmissionsIndirect: 1200,
          totalEmbeddedEmissions: 9700,
          specificEmbeddedEmissions: 1.94,
          carbonPricePaid: 25000,
          carbonPriceCurrency: 'EUR'
        },
        {
          id: '2',
          cnCode: '7601 10 00',
          productDescription: 'Unwrought aluminium, not alloyed',
          countryOfOrigin: 'Russia',
          installationName: 'Rusal Krasnoyarsk Aluminium',
          installationId: 'RU-002-KRAZ',
          quantityImported: 2000,
          quantityUnit: 'tonnes',
          embeddedEmissionsDirect: 2800,
          embeddedEmissionsIndirect: 28000,
          totalEmbeddedEmissions: 30800,
          specificEmbeddedEmissions: 15.4,
          carbonPricePaid: 0,
          carbonPriceCurrency: 'EUR'
        },
        {
          id: '3',
          cnCode: '2523 29 00',
          productDescription: 'Portland cement, other',
          countryOfOrigin: 'Egypt',
          installationName: 'Suez Cement Company',
          installationId: 'EG-003-SUEZ',
          quantityImported: 10000,
          quantityUnit: 'tonnes',
          embeddedEmissionsDirect: 7500,
          embeddedEmissionsIndirect: 500,
          totalEmbeddedEmissions: 8000,
          specificEmbeddedEmissions: 0.8,
          carbonPricePaid: 0,
          carbonPriceCurrency: 'EUR'
        }
      ],
      totalEmissions: 48500,
      totalCarbonPricePaid: 25000,
      methodology: 'Default values from EU CBAM Implementing Regulation'
    };

    await this.generateCBAMReport(sampleData);
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
      primaryColor: data?.primary_color || '#1e40af',
      secondaryColor: data?.secondary_color || '#3b82f6',
      headerText: data?.header_text || 'Confidential - EU CBAM Compliance Document',
      footerText: data?.footer_text
    };
  }

  private async generateCBAMPDF(data: CBAMReportData, branding: BrandingConfig): Promise<void> {
    const pdf = new ProfessionalPDFGenerator(branding);

    // Cover page
    pdf.createCoverPage(
      'CBAM Declaration Report',
      `Reporting Period: ${this.formatDate(data.reportingPeriod.start)} - ${this.formatDate(data.reportingPeriod.end)}`,
      new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      'EU Carbon Border Adjustment Mechanism'
    );

    // Executive Summary
    pdf.addSection('Executive Summary', 1);
    pdf.addParagraph(
      'This report provides a comprehensive declaration of embedded emissions for goods imported into the European Union, in accordance with the EU Carbon Border Adjustment Mechanism (CBAM) Regulation (EU) 2023/956.'
    );
    pdf.addSpacing(5);

    pdf.addMetricsRow([
      { label: 'Total Products', value: data.products.length.toString(), unit: 'items' },
      { label: 'Total Emissions', value: this.formatNumber(data.totalEmissions), unit: 'tCO₂e' },
      { label: 'Carbon Price Paid', value: `€${this.formatNumber(data.totalCarbonPricePaid)}`, changeType: 'neutral' },
      { label: 'Countries of Origin', value: [...new Set(data.products.map(p => p.countryOfOrigin))].length.toString() }
    ]);

    // Declarant Information
    pdf.addSection('Declarant Information', 1);
    pdf.addKeyValueSection([
      { label: 'Company Name', value: data.declarant.company, highlight: true },
      { label: 'Authorized Representative', value: data.declarant.name },
      { label: 'Position', value: data.declarant.position },
      { label: 'EORI Number', value: data.declarant.eoriNumber || 'Not specified' },
      { label: 'Address', value: data.declarant.address || 'Not specified' }
    ]);

    // Products Summary Table
    pdf.addSection('Imported Goods Declaration', 1);
    pdf.addParagraph(
      'The following table summarizes all CBAM-covered goods imported during the reporting period, including their embedded emissions and any carbon price paid in the country of origin.'
    );
    pdf.addSpacing(5);

    pdf.addTable(
      ['CN Code', 'Description', 'Origin', 'Quantity', 'Embedded CO₂e'],
      data.products.map(p => [
        p.cnCode,
        p.productDescription.substring(0, 40) + (p.productDescription.length > 40 ? '...' : ''),
        p.countryOfOrigin,
        `${this.formatNumber(p.quantityImported)} ${p.quantityUnit}`,
        `${this.formatNumber(p.totalEmbeddedEmissions)} t`
      ]),
      { title: 'Products Summary', showRowNumbers: true }
    );

    // Detailed Product Information
    pdf.addPage();
    pdf.addSection('Detailed Product Information', 1);

    data.products.forEach((product, index) => {
      pdf.addSection(`Product ${index + 1}: ${product.cnCode}`, 2);
      pdf.addKeyValueSection([
        { label: 'CN Code', value: product.cnCode, highlight: true },
        { label: 'Product Description', value: product.productDescription },
        { label: 'Country of Origin', value: product.countryOfOrigin },
        { label: 'Installation Name', value: product.installationName },
        { label: 'Installation ID', value: product.installationId || 'Not available' },
        { label: 'Quantity Imported', value: `${this.formatNumber(product.quantityImported)} ${product.quantityUnit}` },
        { label: 'Direct Emissions', value: `${this.formatNumber(product.embeddedEmissionsDirect)} tCO₂e` },
        { label: 'Indirect Emissions', value: `${this.formatNumber(product.embeddedEmissionsIndirect)} tCO₂e` },
        { label: 'Total Embedded Emissions', value: `${this.formatNumber(product.totalEmbeddedEmissions)} tCO₂e`, highlight: true },
        { label: 'Specific Embedded Emissions', value: `${product.specificEmbeddedEmissions.toFixed(3)} tCO₂e/t` },
        { label: 'Carbon Price Paid', value: `${product.carbonPriceCurrency} ${this.formatNumber(product.carbonPricePaid)}` }
      ]);
      pdf.addSpacing(10);
    });

    // Emissions Breakdown by Category
    pdf.addPage();
    pdf.addSection('Emissions Analysis', 1);

    const categoryBreakdown = this.calculateCategoryBreakdown(data.products);
    pdf.addTable(
      ['Product Category', 'Products', 'Total Emissions (tCO₂e)', 'Share (%)'],
      categoryBreakdown.map(cat => [
        cat.category,
        cat.count.toString(),
        this.formatNumber(cat.emissions),
        cat.percentage.toFixed(1) + '%'
      ]),
      { title: 'Emissions by Product Category' }
    );

    pdf.addSpacing(10);

    // Country breakdown
    const countryBreakdown = this.calculateCountryBreakdown(data.products);
    pdf.addTable(
      ['Country of Origin', 'Products', 'Total Emissions (tCO₂e)', 'Carbon Price Paid (EUR)'],
      countryBreakdown.map(country => [
        country.country,
        country.count.toString(),
        this.formatNumber(country.emissions),
        this.formatNumber(country.carbonPricePaid)
      ]),
      { title: 'Emissions by Country of Origin' }
    );

    // Methodology
    pdf.addPage();
    pdf.addMethodologySection([
      {
        name: 'Emission Calculation Methodology',
        description: data.methodology || 'Embedded emissions have been calculated in accordance with the EU CBAM Implementing Regulation (EU) 2023/1773. Where actual installation data was not available, default values from the European Commission have been applied.',
        source: 'EU CBAM Implementing Regulation (EU) 2023/1773'
      },
      {
        name: 'Direct Emissions (Scope 1)',
        description: 'Direct emissions include all greenhouse gas emissions from the production process, including combustion of fuels, process emissions, and fugitive emissions at the installation where the goods were produced.',
        source: 'GHG Protocol Corporate Standard'
      },
      {
        name: 'Indirect Emissions (Scope 2)',
        description: 'Indirect emissions include emissions from the generation of purchased electricity, heat, and steam consumed during the production of the imported goods.',
        source: 'GHG Protocol Scope 2 Guidance'
      },
      {
        name: 'Carbon Price Calculation',
        description: 'Carbon prices paid in the country of origin have been calculated based on carbon taxes, emissions trading scheme allowances, or equivalent measures applicable to the production of the goods.',
        source: 'EU CBAM Regulation Article 9'
      }
    ]);

    // Declaration
    pdf.addDeclarationSection(
      data.declarant.name,
      `${data.declarant.position}, ${data.declarant.company}`,
      new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    );

    // Finalize and save
    const filename = `CBAM_Report_${data.reportingPeriod.start}_${data.reportingPeriod.end}.pdf`;
    pdf.finalize(filename);
  }

  private formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  private formatNumber(num: number): string {
    return num.toLocaleString('en-US', { maximumFractionDigits: 2 });
  }

  private calculateCategoryBreakdown(products: CBAMProduct[]): Array<{ category: string; count: number; emissions: number; percentage: number }> {
    const categoryMap = new Map<string, { count: number; emissions: number }>();
    const totalEmissions = products.reduce((sum, p) => sum + p.totalEmbeddedEmissions, 0);

    products.forEach(product => {
      const cnCode = product.cnCode.split(' ')[0];
      const cbamCode = CBAM_CN_CODES.find(c => cnCode.startsWith(c.code));
      const category = cbamCode?.category || 'Other';
      
      const existing = categoryMap.get(category) || { count: 0, emissions: 0 };
      categoryMap.set(category, {
        count: existing.count + 1,
        emissions: existing.emissions + product.totalEmbeddedEmissions
      });
    });

    return Array.from(categoryMap.entries())
      .map(([category, data]) => ({
        category,
        count: data.count,
        emissions: data.emissions,
        percentage: (data.emissions / totalEmissions) * 100
      }))
      .sort((a, b) => b.emissions - a.emissions);
  }

  private calculateCountryBreakdown(products: CBAMProduct[]): Array<{ country: string; count: number; emissions: number; carbonPricePaid: number }> {
    const countryMap = new Map<string, { count: number; emissions: number; carbonPricePaid: number }>();

    products.forEach(product => {
      const existing = countryMap.get(product.countryOfOrigin) || { count: 0, emissions: 0, carbonPricePaid: 0 };
      countryMap.set(product.countryOfOrigin, {
        count: existing.count + 1,
        emissions: existing.emissions + product.totalEmbeddedEmissions,
        carbonPricePaid: existing.carbonPricePaid + product.carbonPricePaid
      });
    });

    return Array.from(countryMap.entries())
      .map(([country, data]) => ({
        country,
        ...data
      }))
      .sort((a, b) => b.emissions - a.emissions);
  }
}

export const cbamReportService = new CBAMReportService();
