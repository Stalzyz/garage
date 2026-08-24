import React from 'react';
import { Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { PDFDocument, baseStyles } from './PDFDocument';
import { DocHeader, DocFooter } from './components';
import { BrandConfig } from '../../utils/brand';

const styles = StyleSheet.create({
  billToSection: {
    marginTop: 10,
    marginBottom: 40,
  },
  billToLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  clientName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 4,
  },
  clientText: {
    fontSize: 10,
    color: '#334155',
    lineHeight: 1.4,
  },
  table: {
    width: '100%',
    marginBottom: 30,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#cbd5e1',
    paddingBottom: 8,
    marginBottom: 8,
  },
  tableHeaderCell: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#475569',
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  tableCell: {
    fontSize: 10,
    color: '#334155',
  },
  colDesc: { flex: 4 },
  colQty: { flex: 1, textAlign: 'center' },
  colRate: { flex: 1.5, textAlign: 'right' },
  colTotal: { flex: 1.5, textAlign: 'right' },
  summaryBox: {
    alignSelf: 'flex-end',
    width: 250,
    padding: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    marginTop: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  summaryLabel: {
    fontSize: 10,
    color: '#64748b',
  },
  summaryValue: {
    fontSize: 10,
    fontWeight: 'medium',
    color: '#0f172a',
  },
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#cbd5e1',
  },
  grandTotalLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  grandTotalValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  notesSection: {
    marginTop: 40,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  notesLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  notesText: {
    fontSize: 9,
    color: '#64748b',
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
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
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
              <Text style={[styles.tableCell, styles.colDesc]}>{item.description}</Text>
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
          <View style={styles.notesSection}>
            <Text style={styles.notesLabel}>Notes & Terms</Text>
            <Text style={styles.notesText}>{invoice.notes}</Text>
          </View>
        )}

        <DocFooter brand={brand} />
      </Page>
    </PDFDocument>
  );
};
