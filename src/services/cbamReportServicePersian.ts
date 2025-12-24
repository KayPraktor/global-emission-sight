import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { PersianPDFGenerator } from './persianPDFGenerator';
import { BrandingConfig } from './professionalPDFGenerator';
import { 
  toPersianNumber, 
  toJalaliDate, 
  persianLabels, 
  getFullPersianDate,
  getCategoryPersian,
  iranianCompanies 
} from '@/utils/persianHelpers';
import { CBAMProduct, CBAMReportData, CBAM_CN_CODES } from './cbamReportService';

class CBAMReportServicePersian {
  async generateCBAMReport(data: CBAMReportData): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('لطفاً برای تولید گزارش وارد شوید');
        return;
      }

      toast.info('در حال تولید گزارش CBAM فارسی...');

      const branding = await this.fetchBrandingSettings(user.id);
      await this.generateCBAMPDF(data, branding);

      toast.success('گزارش CBAM فارسی با موفقیت تولید شد!');
    } catch (error) {
      console.error('Error generating Persian CBAM report:', error);
      toast.error('خطا در تولید گزارش CBAM فارسی');
    }
  }

  async generateSampleCBAMReport(): Promise<void> {
    const sampleData: CBAMReportData = {
      reportingPeriod: {
        start: '2024-01-01',
        end: '2024-03-31'
      },
      declarant: {
        name: 'علی محمدی',
        position: 'مدیر پایداری',
        company: 'فولاد مبارکه اصفهان',
        eoriNumber: 'IR123456789012345',
        address: 'اصفهان، شهرک صنعتی مبارکه'
      },
      products: [
        {
          id: '1',
          cnCode: '7207 11 14',
          productDescription: 'محصولات نیمه‌تمام آهنی، با کمتر از ۰.۲۵٪ کربن',
          countryOfOrigin: 'ایران',
          installationName: 'فولاد مبارکه اصفهان',
          installationId: 'IR-MSC-001',
          quantityImported: 5000,
          quantityUnit: 'تن',
          embeddedEmissionsDirect: 8500,
          embeddedEmissionsIndirect: 1200,
          totalEmbeddedEmissions: 9700,
          specificEmbeddedEmissions: 1.94,
          carbonPricePaid: 0,
          carbonPriceCurrency: 'EUR'
        },
        {
          id: '2',
          cnCode: '7601 10 00',
          productDescription: 'آلومینیوم خام، غیر آلیاژی',
          countryOfOrigin: 'ایران',
          installationName: 'آلومینیوم ایران (ایرالکو)',
          installationId: 'IR-IRALCO-001',
          quantityImported: 2000,
          quantityUnit: 'تن',
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
          productDescription: 'سیمان پرتلند، سایر',
          countryOfOrigin: 'ایران',
          installationName: 'سیمان تهران',
          installationId: 'IR-TCC-001',
          quantityImported: 10000,
          quantityUnit: 'تن',
          embeddedEmissionsDirect: 7500,
          embeddedEmissionsIndirect: 500,
          totalEmbeddedEmissions: 8000,
          specificEmbeddedEmissions: 0.8,
          carbonPricePaid: 0,
          carbonPriceCurrency: 'EUR'
        }
      ],
      totalEmissions: 48500,
      totalCarbonPricePaid: 0,
      methodology: 'مقادیر پیش‌فرض از مقررات اجرایی EU CBAM'
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
      companyName: data?.company_name || 'شرکت شما',
      companyLogoUrl: data?.company_logo_url,
      primaryColor: data?.primary_color || '#1e40af',
      secondaryColor: data?.secondary_color || '#3b82f6',
      headerText: data?.header_text || persianLabels.confidentialNotice,
      footerText: data?.footer_text
    };
  }

  private async generateCBAMPDF(data: CBAMReportData, branding: BrandingConfig): Promise<void> {
    const pdf = new PersianPDFGenerator(branding);

    // Convert dates to Jalali
    const startJalali = toJalaliDate(data.reportingPeriod.start);
    const endJalali = toJalaliDate(data.reportingPeriod.end);
    const periodText = `${startJalali} - ${endJalali}`;

    // Cover page
    pdf.createCoverPage(
      persianLabels.reportTitle,
      `${persianLabels.reportingPeriod}: ${periodText}`,
      getFullPersianDate(new Date().toISOString()),
      persianLabels.reportSubtitle
    );

    // Executive Summary
    pdf.addSection(persianLabels.executiveSummary, 1);
    pdf.addParagraph(
      'این گزارش اظهارنامه جامعی از انتشارات تعبیه‌شده برای کالاهای وارداتی به اتحادیه اروپا ارائه می‌دهد، مطابق با مقررات مکانیزم تعدیل مرزی کربن اتحادیه اروپا (CBAM) شماره ۲۰۲۳/۹۵۶.'
    );
    pdf.addSpacing(5);

    const uniqueCountries = [...new Set(data.products.map(p => p.countryOfOrigin))];

    pdf.addMetricsRow([
      { label: persianLabels.totalProducts, value: toPersianNumber(data.products.length), unit: persianLabels.items },
      { label: persianLabels.totalEmissions, value: this.formatPersianNumber(data.totalEmissions), unit: persianLabels.tCO2e },
      { label: persianLabels.carbonPricePaid, value: `€${this.formatPersianNumber(data.totalCarbonPricePaid)}`, changeType: 'neutral' },
      { label: persianLabels.countriesOfOrigin, value: toPersianNumber(uniqueCountries.length) }
    ]);

    // Declarant Information
    pdf.addSection(persianLabels.declarantInfo, 1);
    pdf.addKeyValueSection([
      { label: persianLabels.companyName, value: data.declarant.company, highlight: true },
      { label: persianLabels.authorizedRep, value: data.declarant.name },
      { label: persianLabels.position, value: data.declarant.position },
      { label: persianLabels.eoriNumber, value: data.declarant.eoriNumber || persianLabels.notSpecified },
      { label: persianLabels.address, value: data.declarant.address || persianLabels.notSpecified }
    ]);

    // Products Summary Table
    pdf.addSection(persianLabels.importedGoods, 1);
    pdf.addParagraph(persianLabels.importedGoodsDesc);
    pdf.addSpacing(5);

    pdf.addTable(
      [persianLabels.cnCode, persianLabels.description, persianLabels.origin, persianLabels.quantity, persianLabels.embeddedCO2e],
      data.products.map(p => [
        p.cnCode,
        p.productDescription.substring(0, 40) + (p.productDescription.length > 40 ? '...' : ''),
        p.countryOfOrigin,
        `${this.formatPersianNumber(p.quantityImported)} ${p.quantityUnit}`,
        `${this.formatPersianNumber(p.totalEmbeddedEmissions)} ${persianLabels.tonnes}`
      ]),
      { title: persianLabels.productsSummary, showRowNumbers: true }
    );

    // Detailed Product Information
    pdf.addPage();
    pdf.addSection(persianLabels.detailedProductInfo, 1);

    data.products.forEach((product, index) => {
      pdf.addSection(`${persianLabels.product} ${toPersianNumber(index + 1)}: ${product.cnCode}`, 2);
      pdf.addKeyValueSection([
        { label: persianLabels.cnCode, value: product.cnCode, highlight: true },
        { label: persianLabels.productDescription, value: product.productDescription },
        { label: persianLabels.countryOfOrigin, value: product.countryOfOrigin },
        { label: persianLabels.installationName, value: product.installationName },
        { label: persianLabels.installationId, value: product.installationId || persianLabels.notAvailable },
        { label: persianLabels.quantityImported, value: `${this.formatPersianNumber(product.quantityImported)} ${product.quantityUnit}` },
        { label: persianLabels.directEmissions, value: `${this.formatPersianNumber(product.embeddedEmissionsDirect)} ${persianLabels.tCO2e}` },
        { label: persianLabels.indirectEmissions, value: `${this.formatPersianNumber(product.embeddedEmissionsIndirect)} ${persianLabels.tCO2e}` },
        { label: persianLabels.totalEmbeddedEmissions, value: `${this.formatPersianNumber(product.totalEmbeddedEmissions)} ${persianLabels.tCO2e}`, highlight: true },
        { label: persianLabels.specificEmbeddedEmissions, value: `${toPersianNumber(product.specificEmbeddedEmissions.toFixed(3))} tCO₂e/t` },
        { label: persianLabels.carbonPricePaid, value: `${product.carbonPriceCurrency} ${this.formatPersianNumber(product.carbonPricePaid)}` }
      ]);
      pdf.addSpacing(10);
    });

    // Emissions Breakdown by Category
    pdf.addPage();
    pdf.addSection(persianLabels.emissionsAnalysis, 1);

    const categoryBreakdown = this.calculateCategoryBreakdown(data.products);
    pdf.addTable(
      [persianLabels.productCategory, persianLabels.products, persianLabels.totalEmissionsTCO2e, persianLabels.share],
      categoryBreakdown.map(cat => [
        getCategoryPersian(cat.category),
        toPersianNumber(cat.count),
        this.formatPersianNumber(cat.emissions),
        toPersianNumber(cat.percentage.toFixed(1)) + '٪'
      ]),
      { title: persianLabels.emissionsByCategory }
    );

    pdf.addSpacing(10);

    // Country breakdown
    const countryBreakdown = this.calculateCountryBreakdown(data.products);
    pdf.addTable(
      [persianLabels.countryOfOrigin, persianLabels.products, persianLabels.totalEmissionsTCO2e, persianLabels.carbonPricePaidEUR],
      countryBreakdown.map(country => [
        country.country,
        toPersianNumber(country.count),
        this.formatPersianNumber(country.emissions),
        this.formatPersianNumber(country.carbonPricePaid)
      ]),
      { title: persianLabels.emissionsByCountry }
    );

    // Methodology
    pdf.addPage();
    pdf.addMethodologySection([
      {
        name: persianLabels.emissionCalcMethodology,
        description: persianLabels.emissionCalcDesc,
        source: 'EU CBAM Implementing Regulation (EU) 2023/1773'
      },
      {
        name: persianLabels.directEmissionsScope1,
        description: persianLabels.directEmissionsDesc,
        source: 'GHG Protocol Corporate Standard'
      },
      {
        name: persianLabels.indirectEmissionsScope2,
        description: persianLabels.indirectEmissionsDesc,
        source: 'GHG Protocol Scope 2 Guidance'
      },
      {
        name: persianLabels.carbonPriceCalc,
        description: persianLabels.carbonPriceDesc,
        source: 'EU CBAM Regulation Article 9'
      }
    ]);

    // Declaration
    pdf.addDeclarationSection(
      data.declarant.name,
      `${data.declarant.position}، ${data.declarant.company}`,
      getFullPersianDate(new Date().toISOString())
    );

    // Finalize and save
    const filename = `CBAM_Report_Persian_${data.reportingPeriod.start}_${data.reportingPeriod.end}.pdf`;
    pdf.finalize(filename);
  }

  private formatPersianNumber(num: number): string {
    return toPersianNumber(num.toLocaleString('en-US', { maximumFractionDigits: 2 }));
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

export const cbamReportServicePersian = new CBAMReportServicePersian();
