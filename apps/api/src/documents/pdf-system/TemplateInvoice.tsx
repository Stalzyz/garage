import React from 'react';
import { Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { PDFDocument, baseStyles } from './PDFDocument';
import { DocHeader, DocFooter } from './components';
import { BrandConfig } from '../../utils/brand';
import { cleanDocumentText } from '../../utils/text';

const styles = StyleSheet.create({
  billToSection: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 6,
    padding: 16,
    marginBottom: 24,
    marginTop: 10,
  },
  billToLabel: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  clientName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 4,
  },
  clientText: {
    fontSize: 9,
    color: '#475569',
    lineHeight: 1.4,
  },
  table: {
    width: '100%',
    marginBottom: 24,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1.5,
    borderBottomColor: '#0f172a',
    paddingBottom: 8,
    paddingHorizontal: 8,
    marginBottom: 6,
  },
  tableHeaderCell: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#0f172a',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  tableCell: {
    fontSize: 9,
    color: '#334155',
    lineHeight: 1.4,
  },
  colDesc: { flex: 4 },
  colQty: { flex: 1, textAlign: 'center' },
  colRate: { flex: 1.5, textAlign: 'right' },
  colTotal: { flex: 1.5, textAlign: 'right' },
  summaryBox: {
    alignSelf: 'flex-end',
    width: 220,
    paddingVertical: 8,
    marginTop: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  summaryLabel: {
    fontSize: 9,
    color: '#64748b',
  },
  summaryValue: {
    fontSize: 9,
    fontWeight: 'medium',
    color: '#0f172a',
  },
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    marginTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  grandTotalLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  grandTotalValue: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  notesSection: {
    backgroundColor: '#f8fafc',
    borderLeftWidth: 4,
    padding: 16,
    borderRadius: 4,
    marginTop: 30,
  },
  notesLabel: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#0f172a',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
  },
  notesText: {
    fontSize: 9,
    color: '#475569',
    lineHeight: 1.5,
  }
});

interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate?: number;
  discountRate?: number;
  total: number;
}

export interface TemplateInvoiceProps {
  brand: BrandConfig;
  invoice: {
    invoiceNumber: string;
    clientName: string;
    clientEmail?: string | null;
    clientGst?: string | null;
    status: string;
    currency: string;
    dueDate: string;
    createdAt: string;
    subtotal: number;
    cgst: number;
    sgst: number;
    igst: number;
    totalAmount: number;
    paidAmount: number;
    notes?: string | null;
    items: InvoiceItem[];
  };
}

const formatCurrency = (amount: number, currency: string) => {
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
  return `${currency} ${formatted}`;
};

export const TemplateInvoice: React.FC<TemplateInvoiceProps> = ({ brand, invoice }) => {
  const balanceDue = invoice.totalAmount - invoice.paidAmount;

  return (
    <PDFDocument title={`Invoice ${invoice.invoiceNumber}`} author={brand.companyName}>
      <Page size="A4" style={baseStyles.page}>
        <DocHeader 
          brand={brand} 
          title="INVOICE"
          metadata={[
            { label: 'Invoice No.', value: invoice.invoiceNumber },
            { label: 'Date', value: new Date(invoice.createdAt).toLocaleDateString() },
            { label: 'Due Date', value: new Date(invoice.dueDate).toLocaleDateString() },
            { label: 'Status', value: invoice.status },
          ]}
        />

        <View style={styles.billToSection}>
          <Text style={styles.billToLabel}>Bill To</Text>
          <Text style={styles.clientName}>{invoice.clientName}</Text>
          {invoice.clientEmail && <Text style={styles.clientText}>{invoice.clientEmail}</Text>}
          {invoice.clientGst && <Text style={styles.clientText}>GSTIN: {invoice.clientGst}</Text>}
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, styles.colDesc]}>Description</Text>
            <Text style={[styles.tableHeaderCell, styles.colQty]}>Qty</Text>
            <Text style={[styles.tableHeaderCell, styles.colRate]}>Rate</Text>
            <Text style={[styles.tableHeaderCell, styles.colTotal]}>Amount</Text>
          </View>

          {invoice.items.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.colDesc]}>{cleanDocumentText(item.description)}</Text>
              <Text style={[styles.tableCell, styles.colQty]}>{item.quantity}</Text>
              <Text style={[styles.tableCell, styles.colRate]}>{formatCurrency(item.unitPrice, invoice.currency)}</Text>
              <Text style={[styles.tableCell, styles.colTotal]}>{formatCurrency(item.total, invoice.currency)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.summaryBox}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>{formatCurrency(invoice.subtotal, invoice.currency)}</Text>
          </View>
          {(invoice.cgst > 0 || invoice.sgst > 0) ? (
            <>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>CGST</Text>
                <Text style={styles.summaryValue}>{formatCurrency(invoice.cgst, invoice.currency)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>SGST</Text>
                <Text style={styles.summaryValue}>{formatCurrency(invoice.sgst, invoice.currency)}</Text>
              </View>
            </>
          ) : invoice.igst > 0 ? (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>IGST</Text>
              <Text style={styles.summaryValue}>{formatCurrency(invoice.igst, invoice.currency)}</Text>
            </View>
          ) : null}
          
          <View style={styles.grandTotalRow}>
            <Text style={styles.grandTotalLabel}>Total</Text>
            <Text style={[styles.grandTotalValue, { color: brand.primaryColor }]}>
              {formatCurrency(invoice.totalAmount, invoice.currency)}
            </Text>
          </View>

          {invoice.paidAmount > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Amount Paid</Text>
              <Text style={styles.summaryValue}>{formatCurrency(invoice.paidAmount, invoice.currency)}</Text>
            </View>
          )}
          
          {balanceDue > 0 && (
            <View style={[styles.summaryRow, { marginTop: 4 }]}>
              <Text style={[styles.summaryLabel, { fontWeight: 'bold', color: '#0f172a' }]}>Balance Due</Text>
              <Text style={[styles.summaryValue, { fontWeight: 'bold' }]}>{formatCurrency(balanceDue, invoice.currency)}</Text>
            </View>
          )}
        </View>

        {invoice.notes && (
          <View style={[styles.notesSection, { borderLeftColor: brand.primaryColor }]}>
            <Text style={styles.notesLabel}>Notes & Terms</Text>
            <Text style={styles.notesText}>{cleanDocumentText(invoice.notes)}</Text>
          </View>
        )}

        <DocFooter brand={brand} />
      </Page>
    </PDFDocument>
  );
};
