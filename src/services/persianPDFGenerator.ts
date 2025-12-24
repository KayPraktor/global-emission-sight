import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { BrandingConfig } from './professionalPDFGenerator';
import { toPersianNumber, toJalaliDate, persianLabels, getFullPersianDate } from '@/utils/persianHelpers';

const hexToRGB = (hex: string): [number, number, number] => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result 
    ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
    : [37, 99, 235];
};

/**
 * Persian PDF Generator with RTL support
 * Uses jsPDF with right-to-left text alignment for Persian/Farsi content
 */
export class PersianPDFGenerator {
  private doc: jsPDF;
  private branding: BrandingConfig;
  private currentY: number = 0;
  private pageWidth: number = 210;
  private pageHeight: number = 297;
  private marginLeft: number = 15;
  private marginRight: number = 15;
  private contentWidth: number;
  private pageNumber: number = 1;
  private tocEntries: Array<{ title: string; page: number; level: number }> = [];

  constructor(branding: BrandingConfig) {
    this.doc = new jsPDF();
    this.branding = branding;
    this.contentWidth = this.pageWidth - this.marginLeft - this.marginRight;
  }

  /**
   * Get right-aligned X position for RTL text
   */
  private getRightX(): number {
    return this.pageWidth - this.marginRight;
  }

  /**
   * Format number in Persian
   */
  private formatPersianNumber(num: number): string {
    return toPersianNumber(num.toLocaleString('en-US', { maximumFractionDigits: 2 }));
  }

  /**
   * Create professional cover page with Persian text (RTL)
   */
  createCoverPage(title: string, subtitle: string, reportDate: string, reportType: string) {
    const [r, g, b] = hexToRGB(this.branding.primaryColor);
    
    // Full-page gradient header
    this.doc.setFillColor(r, g, b);
    this.doc.rect(0, 0, this.pageWidth, 120, 'F');
    
    // Decorative accent line
    const [sr, sg, sb] = hexToRGB(this.branding.secondaryColor);
    this.doc.setFillColor(sr, sg, sb);
    this.doc.rect(0, 120, this.pageWidth, 4, 'F');
    
    // Company name (RTL aligned)
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(28);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(this.branding.companyName, this.getRightX(), 45, { align: 'right' });
    
    // Report title
    this.doc.setFontSize(22);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(title, this.getRightX(), 70, { align: 'right' });
    
    // Report subtitle
    this.doc.setFontSize(14);
    this.doc.text(subtitle, this.getRightX(), 85, { align: 'right' });
    
    // Report type badge (RTL position)
    this.doc.setFillColor(255, 255, 255, 0.2);
    this.doc.roundedRect(this.pageWidth - this.marginRight - 80, 95, 80, 12, 3, 3, 'F');
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(reportType, this.pageWidth - this.marginRight - 5, 103, { align: 'right' });
    
    // Date and metadata section
    this.doc.setTextColor(0, 0, 0);
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'normal');
    this.currentY = 150;
    
    // Report metadata box
    this.doc.setDrawColor(r, g, b);
    this.doc.setLineWidth(0.5);
    this.doc.roundedRect(this.marginLeft, 140, this.contentWidth, 50, 3, 3, 'S');
    
    this.doc.setFontSize(10);
    this.doc.setTextColor(100, 100, 100);
    
    // RTL labels (on the right)
    this.doc.text(persianLabels.reportingPeriod + ':', this.getRightX() - 10, 155, { align: 'right' });
    this.doc.text(persianLabels.generatedOn + ':', this.getRightX() - 10, 165, { align: 'right' });
    this.doc.text(persianLabels.documentId + ':', this.getRightX() - 10, 175, { align: 'right' });
    
    // RTL values (left of labels)
    this.doc.setTextColor(0, 0, 0);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(reportDate, this.getRightX() - 60, 155, { align: 'right' });
    this.doc.text(getFullPersianDate(new Date().toISOString()), this.getRightX() - 60, 165, { align: 'right' });
    this.doc.text(this.generateDocumentId(), this.getRightX() - 60, 175, { align: 'right' });
    
    // Confidentiality notice
    if (this.branding.headerText) {
      this.doc.setFillColor(255, 243, 205);
      this.doc.roundedRect(this.marginLeft, 200, this.contentWidth, 20, 3, 3, 'F');
      this.doc.setFontSize(9);
      this.doc.setTextColor(133, 100, 4);
      this.doc.setFont('helvetica', 'italic');
      this.doc.text(persianLabels.confidentialNotice, this.getRightX() - 10, 212, { align: 'right' });
    }
    
    // Footer on cover page
    this.doc.setFontSize(8);
    this.doc.setTextColor(128, 128, 128);
    this.doc.setFont('helvetica', 'normal');
    const footerText = `© ${toPersianNumber(new Date().getFullYear())} ${this.branding.companyName}. ${persianLabels.allRightsReserved}`;
    this.doc.text(footerText, this.getRightX(), 285, { align: 'right' });
    
    this.doc.addPage();
    this.pageNumber = 2;
  }

  /**
   * Add section header (RTL)
   */
  addSection(title: string, level: number = 1) {
    if (this.currentY > 250) {
      this.doc.addPage();
      this.currentY = 30;
      this.pageNumber++;
    }
    
    this.tocEntries.push({ title, page: this.pageNumber, level });
    
    const [r, g, b] = hexToRGB(this.branding.primaryColor);
    
    if (level === 1) {
      // Main section header with colored bar (RTL position)
      this.doc.setFillColor(r, g, b);
      this.doc.rect(this.getRightX() - 4, this.currentY - 5, 4, 12, 'F');
      
      this.doc.setFontSize(16);
      this.doc.setFont('helvetica', 'bold');
      this.doc.setTextColor(r, g, b);
      this.doc.text(title, this.getRightX() - 10, this.currentY + 3, { align: 'right' });
      
      this.currentY += 15;
    } else {
      // Subsection header
      this.doc.setFontSize(13);
      this.doc.setFont('helvetica', 'bold');
      this.doc.setTextColor(0, 0, 0);
      this.doc.text(title, this.getRightX(), this.currentY + 3, { align: 'right' });
      
      // Underline (RTL)
      this.doc.setDrawColor(r, g, b);
      this.doc.setLineWidth(0.5);
      const textWidth = this.doc.getTextWidth(title);
      this.doc.line(this.getRightX() - textWidth, this.currentY + 6, this.getRightX(), this.currentY + 6);
      
      this.currentY += 12;
    }
  }

  /**
   * Add paragraph text (RTL)
   */
  addParagraph(text: string, options?: { fontSize?: number; color?: string; bold?: boolean }) {
    const fontSize = options?.fontSize || 10;
    const bold = options?.bold || false;
    
    this.doc.setFontSize(fontSize);
    this.doc.setFont('helvetica', bold ? 'bold' : 'normal');
    this.doc.setTextColor(60, 60, 60);
    
    const lines = this.doc.splitTextToSize(text, this.contentWidth);
    
    lines.forEach((line: string) => {
      if (this.currentY > 270) {
        this.doc.addPage();
        this.currentY = 30;
        this.pageNumber++;
      }
      this.doc.text(line, this.getRightX(), this.currentY, { align: 'right' });
      this.currentY += fontSize * 0.5;
    });
    
    this.currentY += 5;
  }

  /**
   * Add key-value pairs (RTL layout)
   */
  addKeyValueSection(data: Array<{ label: string; value: string; highlight?: boolean }>) {
    const [r, g, b] = hexToRGB(this.branding.primaryColor);
    
    data.forEach((item, index) => {
      if (this.currentY > 265) {
        this.doc.addPage();
        this.currentY = 30;
        this.pageNumber++;
      }
      
      // Alternating background
      if (index % 2 === 0) {
        this.doc.setFillColor(248, 250, 252);
        this.doc.rect(this.marginLeft, this.currentY - 4, this.contentWidth, 12, 'F');
      }
      
      // Label (RTL - on the right)
      this.doc.setFontSize(10);
      this.doc.setFont('helvetica', 'normal');
      this.doc.setTextColor(100, 100, 100);
      this.doc.text(item.label, this.getRightX() - 5, this.currentY + 3, { align: 'right' });
      
      // Value (RTL - to the left of label)
      this.doc.setFont('helvetica', 'bold');
      if (item.highlight) {
        this.doc.setTextColor(r, g, b);
      } else {
        this.doc.setTextColor(0, 0, 0);
      }
      this.doc.text(item.value, this.getRightX() - 90, this.currentY + 3, { align: 'right' });
      
      this.currentY += 12;
    });
    
    this.currentY += 5;
  }

  /**
   * Add table with RTL column order
   */
  addTable(headers: string[], rows: string[][], options?: { 
    title?: string; 
    showRowNumbers?: boolean;
    highlightFirstColumn?: boolean;
  }) {
    if (this.currentY > 200) {
      this.doc.addPage();
      this.currentY = 30;
      this.pageNumber++;
    }
    
    const [r, g, b] = hexToRGB(this.branding.primaryColor);
    
    if (options?.title) {
      this.doc.setFontSize(11);
      this.doc.setFont('helvetica', 'bold');
      this.doc.setTextColor(0, 0, 0);
      this.doc.text(options.title, this.getRightX(), this.currentY, { align: 'right' });
      this.currentY += 8;
    }
    
    // Reverse headers and rows for RTL
    const rtlHeaders = [...headers].reverse();
    const rtlRows = options?.showRowNumbers 
      ? rows.map((row, i) => [...row, toPersianNumber(i + 1)].reverse())
      : rows.map(row => [...row].reverse());
    
    const tableHeaders = options?.showRowNumbers
      ? [...rtlHeaders, '#']
      : rtlHeaders;
    
    autoTable(this.doc, {
      startY: this.currentY,
      head: [tableHeaders],
      body: rtlRows,
      theme: 'grid',
      headStyles: { 
        fillColor: [r, g, b],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'right', // RTL alignment
        cellPadding: 4
      },
      bodyStyles: {
        textColor: [50, 50, 50],
        cellPadding: 3,
        halign: 'right' // RTL alignment
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252]
      },
      columnStyles: options?.highlightFirstColumn ? {
        [headers.length - 1]: { fontStyle: 'bold', fillColor: [240, 240, 250] as [number, number, number] }
      } : {},
      margin: { left: this.marginLeft, right: this.marginRight },
      didDrawPage: () => {
        this.pageNumber++;
      }
    });
    
    this.currentY = (this.doc as any).lastAutoTable.finalY + 10;
  }

  /**
   * Add metrics row (RTL layout)
   */
  addMetricsRow(metrics: Array<{ label: string; value: string; unit?: string; change?: string; changeType?: 'positive' | 'negative' | 'neutral' }>) {
    const cardWidth = (this.contentWidth - (metrics.length - 1) * 5) / metrics.length;
    const [r, g, b] = hexToRGB(this.branding.primaryColor);
    
    if (this.currentY > 230) {
      this.doc.addPage();
      this.currentY = 30;
      this.pageNumber++;
    }
    
    // Reverse metrics for RTL (rightmost first)
    const rtlMetrics = [...metrics].reverse();
    
    rtlMetrics.forEach((metric, index) => {
      const x = this.marginLeft + index * (cardWidth + 5);
      
      // Card background
      this.doc.setFillColor(248, 250, 252);
      this.doc.setDrawColor(r, g, b);
      this.doc.setLineWidth(0.5);
      this.doc.roundedRect(x, this.currentY, cardWidth, 35, 3, 3, 'FD');
      
      // Top accent line
      this.doc.setFillColor(r, g, b);
      this.doc.rect(x, this.currentY, cardWidth, 3, 'F');
      
      // Label (RTL - right aligned in card)
      this.doc.setFontSize(8);
      this.doc.setFont('helvetica', 'normal');
      this.doc.setTextColor(100, 100, 100);
      this.doc.text(metric.label, x + cardWidth - 5, this.currentY + 12, { align: 'right' });
      
      // Value (RTL)
      this.doc.setFontSize(16);
      this.doc.setFont('helvetica', 'bold');
      this.doc.setTextColor(0, 0, 0);
      this.doc.text(metric.value, x + cardWidth - 5, this.currentY + 24, { align: 'right' });
      
      // Unit (RTL - before value)
      if (metric.unit) {
        this.doc.setFontSize(9);
        this.doc.setFont('helvetica', 'normal');
        this.doc.setTextColor(100, 100, 100);
        const valueWidth = this.doc.getTextWidth(metric.value);
        this.doc.text(metric.unit, x + cardWidth - 7 - valueWidth, this.currentY + 24, { align: 'right' });
      }
      
      // Change indicator
      if (metric.change) {
        const changeColor = metric.changeType === 'positive' ? [22, 163, 74] : 
                           metric.changeType === 'negative' ? [220, 38, 38] : [100, 100, 100];
        this.doc.setFontSize(8);
        this.doc.setTextColor(changeColor[0], changeColor[1], changeColor[2]);
        this.doc.text(metric.change, x + 5, this.currentY + 30);
      }
    });
    
    this.currentY += 45;
  }

  /**
   * Add declaration section (RTL)
   */
  addDeclarationSection(declarant: string, position: string, date: string) {
    if (this.currentY > 220) {
      this.doc.addPage();
      this.currentY = 30;
      this.pageNumber++;
    }
    
    const [r, g, b] = hexToRGB(this.branding.primaryColor);
    
    // Declaration box
    this.doc.setFillColor(248, 250, 252);
    this.doc.setDrawColor(r, g, b);
    this.doc.setLineWidth(1);
    this.doc.roundedRect(this.marginLeft, this.currentY, this.contentWidth, 60, 5, 5, 'FD');
    
    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(0, 0, 0);
    this.doc.text(persianLabels.declarationOfAccuracy, this.getRightX() - 10, this.currentY + 15, { align: 'right' });
    
    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(60, 60, 60);
    const lines = this.doc.splitTextToSize(persianLabels.declarationText, this.contentWidth - 20);
    lines.forEach((line: string, idx: number) => {
      this.doc.text(line, this.getRightX() - 10, this.currentY + 25 + (idx * 4), { align: 'right' });
    });
    
    // Signature line (RTL position)
    this.doc.setDrawColor(0, 0, 0);
    this.doc.setLineWidth(0.5);
    this.doc.line(this.getRightX() - 80, this.currentY + 50, this.getRightX() - 10, this.currentY + 50);
    
    this.doc.setFontSize(8);
    this.doc.text(declarant, this.getRightX() - 10, this.currentY + 55, { align: 'right' });
    this.doc.text(position, this.getRightX() - 10, this.currentY + 60, { align: 'right' });
    
    // Date (RTL)
    this.doc.text(`${persianLabels.date}: ${date}`, this.marginLeft + 60, this.currentY + 55, { align: 'right' });
    
    this.currentY += 70;
  }

  /**
   * Add methodology section (RTL)
   */
  addMethodologySection(methodologies: Array<{ name: string; description: string; source?: string }>) {
    this.addSection(persianLabels.methodology, 1);
    
    methodologies.forEach((method) => {
      if (this.currentY > 250) {
        this.doc.addPage();
        this.currentY = 30;
        this.pageNumber++;
      }
      
      this.doc.setFontSize(11);
      this.doc.setFont('helvetica', 'bold');
      this.doc.setTextColor(0, 0, 0);
      this.doc.text(method.name, this.getRightX(), this.currentY, { align: 'right' });
      this.currentY += 6;
      
      this.doc.setFontSize(9);
      this.doc.setFont('helvetica', 'normal');
      this.doc.setTextColor(60, 60, 60);
      const lines = this.doc.splitTextToSize(method.description, this.contentWidth);
      lines.forEach((line: string) => {
        this.doc.text(line, this.getRightX(), this.currentY, { align: 'right' });
        this.currentY += 4;
      });
      this.currentY += 3;
      
      if (method.source) {
        this.doc.setFontSize(8);
        this.doc.setTextColor(100, 100, 100);
        this.doc.setFont('helvetica', 'italic');
        this.doc.text(`${method.source} :منبع`, this.getRightX(), this.currentY, { align: 'right' });
        this.currentY += 6;
      }
      
      this.currentY += 5;
    });
  }

  /**
   * Finalize document with Persian page numbers and footers
   */
  finalize(filename: string) {
    const pageCount = this.doc.getNumberOfPages();
    const [r, g, b] = hexToRGB(this.branding.primaryColor);
    
    for (let i = 1; i <= pageCount; i++) {
      this.doc.setPage(i);
      
      // Footer line
      this.doc.setDrawColor(r, g, b);
      this.doc.setLineWidth(0.5);
      this.doc.line(this.marginLeft, 282, this.pageWidth - this.marginRight, 282);
      
      // Footer text (RTL)
      this.doc.setFontSize(8);
      this.doc.setTextColor(128, 128, 128);
      this.doc.setFont('helvetica', 'normal');
      
      const footerText = this.branding.footerText || 
        `${getFullPersianDate(new Date().toISOString())} :${persianLabels.generatedOn}`;
      this.doc.text(footerText, this.getRightX(), 288, { align: 'right' });
      
      // Page number (Persian numerals)
      this.doc.setTextColor(r, g, b);
      const pageText = `${toPersianNumber(pageCount)} ${persianLabels.of} ${toPersianNumber(i)} ${persianLabels.page}`;
      this.doc.text(pageText, this.marginLeft, 288);
    }
    
    this.doc.save(filename);
  }

  // Helper to generate document ID
  private generateDocumentId(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `DOC-${timestamp}-${random}`;
  }

  // Add new page
  addPage() {
    this.doc.addPage();
    this.currentY = 30;
    this.pageNumber++;
  }

  // Get current Y position
  getCurrentY(): number {
    return this.currentY;
  }

  // Set current Y position
  setCurrentY(y: number) {
    this.currentY = y;
  }

  // Add spacing
  addSpacing(pixels: number) {
    this.currentY += pixels;
  }
}
