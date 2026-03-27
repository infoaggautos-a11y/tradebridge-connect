import { Invoice, INVOICE_STATUS_LABELS } from '@/types/invoice';
import { invoiceService } from './invoiceService';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRecord = Record<string, any>;

interface JsPDFWithAutoTable extends jsPDF {
  lastAutoTable: {
    finalY: number;
  };
}

declare module 'jspdf-autotable' {
  interface AutoTableHooks {
    didParseCell: (data: { column: { index: number }; cell: { text: string[]; styles: AnyRecord } }) => void;
  }
}

interface BrandConfig {
  primaryColor: [number, number, number];
  accentColor: [number, number, number];
  secondaryColor: [number, number, number];
  companyName: string;
  tagline: string;
  logo?: string;
}

const defaultBrand: BrandConfig = {
  primaryColor: [26, 26, 26],
  accentColor: [139, 90, 43],
  secondaryColor: [100, 100, 100],
  companyName: 'DIL Trade Bridge',
  tagline: 'Direct International Trade Platform',
};

export const generateBrandedPDF = (invoice: Invoice, brand?: Partial<BrandConfig>): void => {
  const config = { ...defaultBrand, ...brand };
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;

  const formatCurrency = (amount: number) => invoiceService.formatCurrency(amount, invoice.currency);

  doc.setFillColor(...config.primaryColor);
  doc.rect(0, 0, pageWidth, 45, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text(config.companyName, margin, 20);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(config.tagline, margin, 28);

  doc.setFontSize(8);
  doc.text('International Trade Solutions', margin, 35);

  const statusColors: Record<string, [number, number, number]> = {
    paid: [34, 139, 34],
    overdue: [220, 53, 69],
    draft: [128, 128, 128],
    sent: [0, 123, 255],
    partial: [255, 193, 7],
  };

  const statusColor = statusColors[invoice.status] || [128, 128, 128];
  doc.setFillColor(...statusColor);
  const statusText = INVOICE_STATUS_LABELS[invoice.status].toUpperCase();
  const statusWidth = doc.getTextWidth(statusText) + 10;
  doc.roundedRect(pageWidth - margin - statusWidth, 12, statusWidth, 10, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(statusText, pageWidth - margin - statusWidth + 5, 18.5);

  doc.setTextColor(100, 100, 100);
  doc.setFontSize(36);
  doc.setFont('helvetica', 'light');
  doc.text('INVOICE', margin, 70);

  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.line(margin, 75, pageWidth - margin, 75);

  let yPos = 90;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(150, 150, 150);
  doc.text('INVOICE NUMBER', margin, yPos);
  doc.text('ISSUE DATE', margin + 70, yPos);
  doc.text('DUE DATE', margin + 130, yPos);

  doc.setTextColor(50, 50, 50);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  yPos += 8;
  doc.text(invoice.invoiceNumber, margin, yPos);
  doc.text(new Date(invoice.issueDate).toLocaleDateString(), margin + 70, yPos);
  doc.text(new Date(invoice.dueDate).toLocaleDateString(), margin + 130, yPos);

  yPos += 20;

  const colWidth = contentWidth / 2;
  const leftCol = margin;
  const rightCol = margin + colWidth;

  doc.setFillColor(250, 250, 250);
  doc.roundedRect(leftCol, yPos, colWidth - 5, 45, 2, 2, 'F');
  doc.roundedRect(rightCol, yPos, colWidth - 5, 45, 2, 2, 'F');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(150, 150, 150);
  doc.text('FROM', leftCol + 5, yPos + 8);
  doc.text('BILL TO', rightCol + 5, yPos + 8);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(50, 50, 50);
  doc.text(invoice.sellerName, leftCol + 5, yPos + 18);
  doc.text(invoice.buyerName, rightCol + 5, yPos + 18);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);

  let sellerY = yPos + 26;
  if (invoice.sellerEmail) {
    doc.text(invoice.sellerEmail, leftCol + 5, sellerY);
    sellerY += 5;
  }
  if (invoice.sellerAddress) {
    const addrLines = invoice.sellerAddress.split('\n');
    addrLines.forEach(line => {
      doc.text(line, leftCol + 5, sellerY);
      sellerY += 5;
    });
  }

  let buyerY = yPos + 26;
  if (invoice.buyerEmail) {
    doc.text(invoice.buyerEmail, rightCol + 5, buyerY);
    buyerY += 5;
  }
  if (invoice.buyerAddress) {
    const addrLines = invoice.buyerAddress.split('\n');
    addrLines.forEach(line => {
      doc.text(line, rightCol + 5, buyerY);
      buyerY += 5;
    });
  }

  yPos += 55;

  autoTable(doc, {
    startY: yPos,
    head: [['Description', 'Qty', 'Unit Price', 'Tax', 'Amount']],
    body: invoice.lineItems.map(item => [
      item.description,
      item.quantity.toString(),
      formatCurrency(item.unitPrice),
      item.taxRate ? `${item.taxRate}%` : '—',
      formatCurrency(item.quantity * item.unitPrice * (1 + (item.taxRate || 0) / 100)),
    ]),
    headStyles: {
      fillColor: config.primaryColor,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 9,
      textColor: [50, 50, 50],
    },
    alternateRowStyles: {
      fillColor: [250, 250, 250],
    },
    columnStyles: {
      0: { cellWidth: 'auto' },
      1: { cellWidth: 20, halign: 'center' },
      2: { cellWidth: 30, halign: 'right' },
      3: { cellWidth: 20, halign: 'right' },
      4: { cellWidth: 35, halign: 'right' },
    },
    margin: { left: margin, right: margin },
    tableWidth: contentWidth,
  });

  const tableEndY = (doc as JsPDFWithAutoTable).lastAutoTable.finalY + 10;

  const summaryX = pageWidth - margin - 80;
  let summaryY = tableEndY;

  doc.setFillColor(250, 250, 250);
  doc.roundedRect(summaryX - 10, summaryY - 5, 90, 70, 2, 2, 'F');

  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);

  const summaryItems = [
    { label: 'Subtotal', value: formatCurrency(invoice.subtotal) },
    ...(invoice.taxTotal > 0 ? [{ label: 'Tax', value: formatCurrency(invoice.taxTotal) }] : []),
    ...(invoice.discountTotal > 0 ? [{ label: 'Discount', value: `-${formatCurrency(invoice.discountTotal)}` }] : []),
    { label: 'TOTAL', value: formatCurrency(invoice.total), bold: true, large: true },
    ...(invoice.paidAmount > 0 ? [{ label: 'Paid', value: formatCurrency(invoice.paidAmount), green: true }] : []),
    ...(invoice.balanceDue > 0 ? [{ label: 'Balance Due', value: formatCurrency(invoice.balanceDue), bold: true }] : []),
  ];

  summaryItems.forEach((item, index) => {
    const itemY = summaryY + 5 + (index * 10);
    
    if (item.large) {
      doc.setDrawColor(...config.accentColor);
      doc.setLineWidth(0.5);
      doc.line(summaryX - 5, itemY - 2, summaryX + 80, itemY - 2);
    }

    doc.setFont('helvetica', item.bold ? 'bold' : 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(item.label, summaryX, itemY);

    doc.setTextColor(item.green ? [34, 139, 34] : item.large || item.bold ? 50 : 100, 
                     item.green ? [139, 34, 34] : item.large || item.bold ? 50 : 100, 
                     item.green ? [139, 34, 34] : item.large || item.bold ? 50 : 100);
    doc.text(item.value, summaryX + 80, itemY, { align: 'right' });
  });

  const notesSectionY = tableEndY + 80;

  if (invoice.notes || invoice.terms) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(50, 50, 50);
    
    let notesY = notesSectionY;
    
    if (invoice.notes) {
      doc.text('Notes', margin, notesY);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      doc.setFontSize(8);
      const noteLines = doc.splitTextToSize(invoice.notes, contentWidth);
      doc.text(noteLines, margin, notesY + 6);
      notesY += 6 + (noteLines.length * 4) + 10;
    }

    if (invoice.terms) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(50, 50, 50);
      doc.text('Terms & Conditions', margin, notesY);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      doc.setFontSize(8);
      const termLines = doc.splitTextToSize(invoice.terms, contentWidth);
      doc.text(termLines, margin, notesY + 6);
    }
  }

  const footerY = doc.internal.pageSize.getHeight() - 20;
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);

  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.setFont('helvetica', 'normal');
  doc.text('Thank you for your business!', pageWidth / 2, footerY, { align: 'center' });
  doc.text(`${config.companyName} | www.diltradebridge.com | support@diltradebridge.com`, pageWidth / 2, footerY + 5, { align: 'center' });

  if (invoice.dealTitle) {
    doc.text(`Invoice for Deal: ${invoice.dealTitle}`, pageWidth / 2, footerY + 12, { align: 'center' });
  }

  doc.save(`${invoice.invoiceNumber}.pdf`);
};

export const generateInvoicePDFBlob = (invoice: Invoice, brand?: Partial<BrandConfig>): Blob => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;

  const formatCurrency = (amount: number) => invoiceService.formatCurrency(amount, invoice.currency);
  const config = { ...defaultBrand, ...brand };

  doc.setFillColor(...config.primaryColor);
  doc.rect(0, 0, pageWidth, 45, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text(config.companyName, margin, 20);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(config.tagline, margin, 28);

  doc.setFontSize(8);
  doc.text('International Trade Solutions', margin, 35);

  const statusColors: Record<string, [number, number, number]> = {
    paid: [34, 139, 34],
    overdue: [220, 53, 69],
    draft: [128, 128, 128],
    sent: [0, 123, 255],
    partial: [255, 193, 7],
  };

  const statusColor = statusColors[invoice.status] || [128, 128, 128];
  doc.setFillColor(...statusColor);
  const statusText = INVOICE_STATUS_LABELS[invoice.status].toUpperCase();
  const statusWidth = doc.getTextWidth(statusText) + 10;
  doc.roundedRect(pageWidth - margin - statusWidth, 12, statusWidth, 10, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(statusText, pageWidth - margin - statusWidth + 5, 18.5);

  doc.setTextColor(100, 100, 100);
  doc.setFontSize(36);
  doc.setFont('helvetica', 'light');
  doc.text('INVOICE', margin, 70);

  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.line(margin, 75, pageWidth - margin, 75);

  let yPos = 90;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(150, 150, 150);
  doc.text('INVOICE NUMBER', margin, yPos);
  doc.text('ISSUE DATE', margin + 70, yPos);
  doc.text('DUE DATE', margin + 130, yPos);

  doc.setTextColor(50, 50, 50);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  yPos += 8;
  doc.text(invoice.invoiceNumber, margin, yPos);
  doc.text(new Date(invoice.issueDate).toLocaleDateString(), margin + 70, yPos);
  doc.text(new Date(invoice.dueDate).toLocaleDateString(), margin + 130, yPos);

  yPos += 20;

  const colWidth = contentWidth / 2;
  const leftCol = margin;
  const rightCol = margin + colWidth;

  doc.setFillColor(250, 250, 250);
  doc.roundedRect(leftCol, yPos, colWidth - 5, 45, 2, 2, 'F');
  doc.roundedRect(rightCol, yPos, colWidth - 5, 45, 2, 2, 'F');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(150, 150, 150);
  doc.text('FROM', leftCol + 5, yPos + 8);
  doc.text('BILL TO', rightCol + 5, yPos + 8);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(50, 50, 50);
  doc.text(invoice.sellerName, leftCol + 5, yPos + 18);
  doc.text(invoice.buyerName, rightCol + 5, yPos + 18);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);

  let sellerY = yPos + 26;
  if (invoice.sellerEmail) {
    doc.text(invoice.sellerEmail, leftCol + 5, sellerY);
    sellerY += 5;
  }
  if (invoice.sellerAddress) {
    const addrLines = invoice.sellerAddress.split('\n');
    addrLines.forEach(line => {
      doc.text(line, leftCol + 5, sellerY);
      sellerY += 5;
    });
  }

  let buyerY = yPos + 26;
  if (invoice.buyerEmail) {
    doc.text(invoice.buyerEmail, rightCol + 5, buyerY);
    buyerY += 5;
  }
  if (invoice.buyerAddress) {
    const addrLines = invoice.buyerAddress.split('\n');
    addrLines.forEach(line => {
      doc.text(line, rightCol + 5, buyerY);
      buyerY += 5;
    });
  }

  yPos += 55;

  autoTable(doc, {
    startY: yPos,
    head: [['Description', 'Qty', 'Unit Price', 'Tax', 'Amount']],
    body: invoice.lineItems.map(item => [
      item.description,
      item.quantity.toString(),
      formatCurrency(item.unitPrice),
      item.taxRate ? `${item.taxRate}%` : '—',
      formatCurrency(item.quantity * item.unitPrice * (1 + (item.taxRate || 0) / 100)),
    ]),
    headStyles: {
      fillColor: config.primaryColor,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 9,
      textColor: [50, 50, 50],
    },
    alternateRowStyles: {
      fillColor: [250, 250, 250],
    },
    columnStyles: {
      0: { cellWidth: 'auto' },
      1: { cellWidth: 20, halign: 'center' },
      2: { cellWidth: 30, halign: 'right' },
      3: { cellWidth: 20, halign: 'right' },
      4: { cellWidth: 35, halign: 'right' },
    },
    margin: { left: margin, right: margin },
    tableWidth: contentWidth,
  });

  const tableEndY = (doc as JsPDFWithAutoTable).lastAutoTable.finalY + 10;

  const summaryX = pageWidth - margin - 80;
  let summaryY = tableEndY;

  doc.setFillColor(250, 250, 250);
  doc.roundedRect(summaryX - 10, summaryY - 5, 90, 70, 2, 2, 'F');

  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);

  const summaryItems = [
    { label: 'Subtotal', value: formatCurrency(invoice.subtotal) },
    ...(invoice.taxTotal > 0 ? [{ label: 'Tax', value: formatCurrency(invoice.taxTotal) }] : []),
    ...(invoice.discountTotal > 0 ? [{ label: 'Discount', value: `-${formatCurrency(invoice.discountTotal)}` }] : []),
    { label: 'TOTAL', value: formatCurrency(invoice.total), bold: true, large: true },
    ...(invoice.paidAmount > 0 ? [{ label: 'Paid', value: formatCurrency(invoice.paidAmount), green: true }] : []),
    ...(invoice.balanceDue > 0 ? [{ label: 'Balance Due', value: formatCurrency(invoice.balanceDue), bold: true }] : []),
  ];

  summaryItems.forEach((item, index) => {
    const itemY = summaryY + 5 + (index * 10);
    
    if (item.large) {
      doc.setDrawColor(...config.accentColor);
      doc.setLineWidth(0.5);
      doc.line(summaryX - 5, itemY - 2, summaryX + 80, itemY - 2);
    }

    doc.setFont('helvetica', item.bold ? 'bold' : 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(item.label, summaryX, itemY);

    doc.setTextColor(item.green ? [34, 139, 34] : item.large || item.bold ? 50 : 100, 
                     item.green ? [139, 34, 34] : item.large || item.bold ? 50 : 100, 
                     item.green ? [139, 34, 34] : item.large || item.bold ? 50 : 100);
    doc.text(item.value, summaryX + 80, itemY, { align: 'right' });
  });

  const notesSectionY = tableEndY + 80;

  if (invoice.notes || invoice.terms) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(50, 50, 50);
    
    let notesY = notesSectionY;
    
    if (invoice.notes) {
      doc.text('Notes', margin, notesY);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      doc.setFontSize(8);
      const noteLines = doc.splitTextToSize(invoice.notes, contentWidth);
      doc.text(noteLines, margin, notesY + 6);
      notesY += 6 + (noteLines.length * 4) + 10;
    }

    if (invoice.terms) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(50, 50, 50);
      doc.text('Terms & Conditions', margin, notesY);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      doc.setFontSize(8);
      const termLines = doc.splitTextToSize(invoice.terms, contentWidth);
      doc.text(termLines, margin, notesY + 6);
    }
  }

  const footerY = doc.internal.pageSize.getHeight() - 20;
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);

  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.setFont('helvetica', 'normal');
  doc.text('Thank you for your business!', pageWidth / 2, footerY, { align: 'center' });
  doc.text(`${config.companyName} | www.diltradebridge.com | support@diltradebridge.com`, pageWidth / 2, footerY + 5, { align: 'center' });

  if (invoice.dealTitle) {
    doc.text(`Invoice for Deal: ${invoice.dealTitle}`, pageWidth / 2, footerY + 12, { align: 'center' });
  }

  return doc.output('blob');
};

export const previewInvoicePDF = (invoice: Invoice, brand?: Partial<BrandConfig>): string => {
  const blob = generateInvoicePDFBlob(invoice, brand);
  return URL.createObjectURL(blob);
};
