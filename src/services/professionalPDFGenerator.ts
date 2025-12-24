import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface BrandingConfig {
  companyName: string;
  companyLogoUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  headerText?: string;
  footerText?: string;
}

export interface PDFSection {
  title: string;
  type: 'text' | 'table' | 'keyValue' | 'chart';
  content: any;
  pageBreakBefore?: boolean;
}

const hexToRGB = (hex: string): [number, number, number] => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result 
    ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
    : [37, 99, 235]; // Default blue
};

export class ProfessionalPDFGenerator {
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

  // Create professional cover page
  createCoverPage(title: string, subtitle: string, reportDate: string, reportType: string) {
    const [r, g, b] = hexToRGB(this.branding.primaryColor);
    
    // Full-page gradient header
    this.doc.setFillColor(r, g, b);
    this.doc.rect(0, 0, this.pageWidth, 120, 'F');
    
    // Decorative accent line
    const [sr, sg, sb] = hexToRGB(this.branding.secondaryColor);
    this.doc.setFillColor(sr, sg, sb);
    this.doc.rect(0, 120, this.pageWidth, 4, 'F');
    
    // Company name
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(28);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(this.branding.companyName, this.marginLeft, 45);
    
    // Report title
    this.doc.setFontSize(22);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(title, this.marginLeft, 70);
    
    // Report subtitle
    this.doc.setFontSize(14);
    this.doc.text(subtitle, this.marginLeft, 85);
    
    // Report type badge
    this.doc.setFillColor(255, 255, 255, 0.2);
    this.doc.roundedRect(this.marginLeft, 95, 80, 12, 3, 3, 'F');
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(reportType, this.marginLeft + 5, 103);
    
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
    this.doc.text('Report Date:', this.marginLeft + 10, 155);
    this.doc.text('Generated:', this.marginLeft + 10, 165);
    this.doc.text('Document ID:', this.marginLeft + 10, 175);
    
    this.doc.setTextColor(0, 0, 0);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(reportDate, this.marginLeft + 50, 155);
    this.doc.text(new Date().toLocaleDateString('en-US', { 
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' 
    }), this.marginLeft + 50, 165);
    this.doc.text(this.generateDocumentId(), this.marginLeft + 50, 175);
    
    // Confidentiality notice
    if (this.branding.headerText) {
      this.doc.setFillColor(255, 243, 205);
      this.doc.roundedRect(this.marginLeft, 200, this.contentWidth, 20, 3, 3, 'F');
      this.doc.setFontSize(9);
      this.doc.setTextColor(133, 100, 4);
      this.doc.setFont('helvetica', 'italic');
      this.doc.text(this.branding.headerText, this.marginLeft + 10, 212);
    }
    
    // Footer on cover page
    this.doc.setFontSize(8);
    this.doc.setTextColor(128, 128, 128);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(this.branding.footerText || `© ${new Date().getFullYear()} ${this.branding.companyName}. All rights reserved.`, 
      this.marginLeft, 285);
    
    this.doc.addPage();
    this.pageNumber = 2;
  }

  // Add table of contents
  addTableOfContents() {
    this.addPageHeader('Table of Contents');
    this.currentY = 50;
    
    const [r, g, b] = hexToRGB(this.branding.primaryColor);
    
    this.tocEntries.forEach((entry, index) => {
      const indent = entry.level * 10;
      this.doc.setFontSize(entry.level === 1 ? 12 : 10);
      this.doc.setFont('helvetica', entry.level === 1 ? 'bold' : 'normal');
      this.doc.setTextColor(0, 0, 0);
      
      // Entry title
      this.doc.text(entry.title, this.marginLeft + indent, this.currentY);
      
      // Page number
      this.doc.setTextColor(r, g, b);
      this.doc.text(entry.page.toString(), this.pageWidth - this.marginRight - 5, this.currentY, { align: 'right' });
      
      // Dotted line
      this.doc.setDrawColor(200, 200, 200);
      this.doc.setLineDashPattern([1, 2], 0);
      const titleWidth = this.doc.getTextWidth(entry.title);
      this.doc.line(this.marginLeft + indent + titleWidth + 5, this.currentY, this.pageWidth - this.marginRight - 15, this.currentY);
      this.doc.setLineDashPattern([], 0);
      
      this.currentY += entry.level === 1 ? 10 : 7;
    });
    
    this.doc.addPage();
    this.pageNumber++;
  }

  // Add section with automatic page break handling
  addSection(title: string, level: number = 1) {
    if (this.currentY > 250) {
      this.doc.addPage();
      this.currentY = 30;
      this.pageNumber++;
    }
    
    this.tocEntries.push({ title, page: this.pageNumber, level });
    
    const [r, g, b] = hexToRGB(this.branding.primaryColor);
    
    if (level === 1) {
      // Main section header with colored bar
      this.doc.setFillColor(r, g, b);
      this.doc.rect(this.marginLeft, this.currentY - 5, 4, 12, 'F');
      
      this.doc.setFontSize(16);
      this.doc.setFont('helvetica', 'bold');
      this.doc.setTextColor(r, g, b);
      this.doc.text(title, this.marginLeft + 10, this.currentY + 3);
      
      this.currentY += 15;
    } else {
      // Subsection header
      this.doc.setFontSize(13);
      this.doc.setFont('helvetica', 'bold');
      this.doc.setTextColor(0, 0, 0);
      this.doc.text(title, this.marginLeft, this.currentY + 3);
      
      // Underline
      this.doc.setDrawColor(r, g, b);
      this.doc.setLineWidth(0.5);
      this.doc.line(this.marginLeft, this.currentY + 6, this.marginLeft + this.doc.getTextWidth(title), this.currentY + 6);
      
      this.currentY += 12;
    }
  }

  // Add paragraph text
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
      this.doc.text(line, this.marginLeft, this.currentY);
      this.currentY += fontSize * 0.5;
    });
    
    this.currentY += 5;
  }

  // Add key-value pairs (executive summary style)
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
      
      // Label
      this.doc.setFontSize(10);
      this.doc.setFont('helvetica', 'normal');
      this.doc.setTextColor(100, 100, 100);
      this.doc.text(item.label, this.marginLeft + 5, this.currentY + 3);
      
      // Value
      this.doc.setFont('helvetica', 'bold');
      if (item.highlight) {
        this.doc.setTextColor(r, g, b);
      } else {
        this.doc.setTextColor(0, 0, 0);
      }
      this.doc.text(item.value, this.marginLeft + 90, this.currentY + 3);
      
      this.currentY += 12;
    });
    
    this.currentY += 5;
  }

  // Add professional table
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
    const [sr, sg, sb] = hexToRGB(this.branding.secondaryColor);
    
    if (options?.title) {
      this.doc.setFontSize(11);
      this.doc.setFont('helvetica', 'bold');
      this.doc.setTextColor(0, 0, 0);
      this.doc.text(options.title, this.marginLeft, this.currentY);
      this.currentY += 8;
    }
    
    const tableRows = options?.showRowNumbers 
      ? rows.map((row, i) => [(i + 1).toString(), ...row])
      : rows;
    
    const tableHeaders = options?.showRowNumbers
      ? ['#', ...headers]
      : headers;
    
    autoTable(this.doc, {
      startY: this.currentY,
      head: [tableHeaders],
      body: tableRows,
      theme: 'grid',
      headStyles: { 
        fillColor: [r, g, b],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'left',
        cellPadding: 4
      },
      bodyStyles: {
        textColor: [50, 50, 50],
        cellPadding: 3
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252]
      },
      columnStyles: options?.highlightFirstColumn ? {
        0: { fontStyle: 'bold', fillColor: [240, 240, 250] as [number, number, number] }
      } : {},
      margin: { left: this.marginLeft, right: this.marginRight },
      didDrawPage: () => {
        this.pageNumber++;
      }
    });
    
    this.currentY = (this.doc as any).lastAutoTable.finalY + 10;
  }

  // Add metrics cards (visual KPI display)
  addMetricsRow(metrics: Array<{ label: string; value: string; unit?: string; change?: string; changeType?: 'positive' | 'negative' | 'neutral' }>) {
    const cardWidth = (this.contentWidth - (metrics.length - 1) * 5) / metrics.length;
    const [r, g, b] = hexToRGB(this.branding.primaryColor);
    
    if (this.currentY > 230) {
      this.doc.addPage();
      this.currentY = 30;
      this.pageNumber++;
    }
    
    metrics.forEach((metric, index) => {
      const x = this.marginLeft + index * (cardWidth + 5);
      
      // Card background
      this.doc.setFillColor(248, 250, 252);
      this.doc.setDrawColor(r, g, b);
      this.doc.setLineWidth(0.5);
      this.doc.roundedRect(x, this.currentY, cardWidth, 35, 3, 3, 'FD');
      
      // Top accent line
      this.doc.setFillColor(r, g, b);
      this.doc.rect(x, this.currentY, cardWidth, 3, 'F');
      
      // Label
      this.doc.setFontSize(8);
      this.doc.setFont('helvetica', 'normal');
      this.doc.setTextColor(100, 100, 100);
      this.doc.text(metric.label, x + 5, this.currentY + 12);
      
      // Value
      this.doc.setFontSize(16);
      this.doc.setFont('helvetica', 'bold');
      this.doc.setTextColor(0, 0, 0);
      this.doc.text(metric.value, x + 5, this.currentY + 24);
      
      // Unit
      if (metric.unit) {
        this.doc.setFontSize(9);
        this.doc.setFont('helvetica', 'normal');
        this.doc.setTextColor(100, 100, 100);
        const valueWidth = this.doc.getTextWidth(metric.value);
        this.doc.text(metric.unit, x + 7 + valueWidth, this.currentY + 24);
      }
      
      // Change indicator
      if (metric.change) {
        const changeColor = metric.changeType === 'positive' ? [22, 163, 74] : 
                           metric.changeType === 'negative' ? [220, 38, 38] : [100, 100, 100];
        this.doc.setFontSize(8);
        this.doc.setTextColor(changeColor[0], changeColor[1], changeColor[2]);
        this.doc.text(metric.change, x + cardWidth - 5, this.currentY + 30, { align: 'right' });
      }
    });
    
    this.currentY += 45;
  }

  // Add declaration/signature section
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
    this.doc.text('Declaration of Accuracy', this.marginLeft + 10, this.currentY + 15);
    
    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(60, 60, 60);
    const declarationText = 'I hereby declare that the information provided in this report is accurate and complete to the best of my knowledge, and that the data has been collected and calculated in accordance with the stated methodology.';
    const lines = this.doc.splitTextToSize(declarationText, this.contentWidth - 20);
    this.doc.text(lines, this.marginLeft + 10, this.currentY + 25);
    
    // Signature line
    this.doc.setDrawColor(0, 0, 0);
    this.doc.setLineWidth(0.5);
    this.doc.line(this.marginLeft + 10, this.currentY + 50, this.marginLeft + 80, this.currentY + 50);
    
    this.doc.setFontSize(8);
    this.doc.text(declarant, this.marginLeft + 10, this.currentY + 55);
    this.doc.text(position, this.marginLeft + 10, this.currentY + 60);
    
    // Date
    this.doc.text(`Date: ${date}`, this.marginLeft + 120, this.currentY + 55);
    
    this.currentY += 70;
  }

  // Add methodology section
  addMethodologySection(methodologies: Array<{ name: string; description: string; source?: string }>) {
    this.addSection('Methodology', 1);
    
    methodologies.forEach((method) => {
      if (this.currentY > 250) {
        this.doc.addPage();
        this.currentY = 30;
        this.pageNumber++;
      }
      
      this.doc.setFontSize(11);
      this.doc.setFont('helvetica', 'bold');
      this.doc.setTextColor(0, 0, 0);
      this.doc.text(method.name, this.marginLeft, this.currentY);
      this.currentY += 6;
      
      this.doc.setFontSize(9);
      this.doc.setFont('helvetica', 'normal');
      this.doc.setTextColor(60, 60, 60);
      const lines = this.doc.splitTextToSize(method.description, this.contentWidth);
      this.doc.text(lines, this.marginLeft, this.currentY);
      this.currentY += lines.length * 4 + 3;
      
      if (method.source) {
        this.doc.setFontSize(8);
        this.doc.setTextColor(100, 100, 100);
        this.doc.setFont('helvetica', 'italic');
        this.doc.text(`Source: ${method.source}`, this.marginLeft, this.currentY);
        this.currentY += 6;
      }
      
      this.currentY += 5;
    });
  }

  // Add page header (for regular pages)
  private addPageHeader(title?: string) {
    const [r, g, b] = hexToRGB(this.branding.primaryColor);
    
    // Header bar
    this.doc.setFillColor(r, g, b);
    this.doc.rect(0, 0, this.pageWidth, 20, 'F');
    
    // Company name
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(this.branding.companyName, this.marginLeft, 13);
    
    // Page title
    if (title) {
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(title, this.pageWidth - this.marginRight, 13, { align: 'right' });
    }
    
    this.currentY = 30;
  }

  // Finalize document with page numbers and footers
  finalize(filename: string) {
    const pageCount = this.doc.getNumberOfPages();
    const [r, g, b] = hexToRGB(this.branding.primaryColor);
    
    for (let i = 1; i <= pageCount; i++) {
      this.doc.setPage(i);
      
      // Footer line
      this.doc.setDrawColor(r, g, b);
      this.doc.setLineWidth(0.5);
      this.doc.line(this.marginLeft, 282, this.pageWidth - this.marginRight, 282);
      
      // Footer text
      this.doc.setFontSize(8);
      this.doc.setTextColor(128, 128, 128);
      this.doc.setFont('helvetica', 'normal');
      
      const footerText = this.branding.footerText || 
        `Generated on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`;
      this.doc.text(footerText, this.marginLeft, 288);
      
      // Page number
      this.doc.setTextColor(r, g, b);
      this.doc.text(`Page ${i} of ${pageCount}`, this.pageWidth - this.marginRight, 288, { align: 'right' });
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
