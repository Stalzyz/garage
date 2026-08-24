import React from 'react';
import { Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { PDFDocument, baseStyles, colors, sp } from './PDFDocument';
import { DocHeader, DocRepeatHeader, DocFooter } from './components';
import { BrandConfig } from '../../utils/brand';
import { cleanDocumentText } from '../../utils/text';

// Helvetica (built-in PDF font) does not have the Rs symbol (₹).
// Replace it with the ASCII-safe abbreviation.
const safeCurrency = (c: string) => c === '₹' ? 'Rs.' : c;

const fmt = (amount: number, currency: string) => {
  const n = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
  return `${safeCurrency(currency)} ${n}`;
};

const statusColor = (status: string): string => {
  const s = status.toLowerCase();
  if (s === 'paid') return '#15803d';
  if (s === 'overdue') return '#b91c1c';
  if (s === 'cancelled') return '#64748b';
  return '#b45309';
};

const styles = StyleSheet.create({
  billToGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: sp['20'],
  },
  billToLeft: { flex: 1, paddingRight: sp['24'] },
  billToRight: { alignItems: 'flex-end' },
  billToLabel: {
    fontSize: 7.5,
    fontFamily: 'Helvetica-Bold',
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 3,
  },
  billToName: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: colors.ink,
    marginBottom: 3,
  },
  billToMeta: { fontSize: 8.5, color: colors.body, lineHeight: 1.4 },
  statusText: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },

  // Table
  table: { width: '100%', marginBottom: sp['16'] },
  tableHeader: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderTopColor: colors.ink,
    borderBottomColor: colors.ink,
    paddingVertical: 5,
    marginBottom: 2,
    backgroundColor: colors.surface,
  },
  tableHeaderCell: {
    fontSize: 7.5,
    fontFamily: 'Helvetica-Bold',
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.rule,
    paddingVertical: sp['8'],
    minHeight: 22,
  },
  tableCell: { fontSize: 9, color: colors.body, lineHeight: 1.4 },
  colDesc: { flex: 4.5, paddingRight: sp['8'] },
  colQty: { width: 36, textAlign: 'center' },
  colRate: { width: 80, textAlign: 'right' },
  colTotal: { width: 80, textAlign: 'right' },

  // Summary
  summaryOuter: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: sp['20'] },
  summaryInner: { width: 220 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 2 },
  summaryLabel: { fontSize: 8.5, color: colors.muted },
  summaryValue: { fontSize: 8.5, fontFamily: 'Helvetica-Bold', color: colors.ink },
  totalRule: { borderTopWidth: 1.5, borderTopColor: colors.ink, marginVertical: 6 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between' },
  totalLabel: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: colors.ink },
  totalValue: { fontSize: 11, fontFamily: 'Helvetica-Bold' },

  // Notes
  notesBox: {
    borderLeftWidth: 3,
    backgroundColor: colors.surface,
    padding: sp['12'],
    marginTop: sp['8'],
  },
  notesLabel: {
    fontSize: 7.5,
    fontFamily: 'Helvetica-Bold',
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  notesText: { fontSize: 8.5, color: colors.body, lineHeight: 1.6 },
});

interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface TemplateInvoiceProps {
  brand: BrandConfig;
  invoice: {
    invoiceNumber: string;
    clientName: string;
    clientEmail?: string | null;
    clientAddress?: string | null;
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

export const TemplateInvoice: React.FC<TemplateInvoiceProps> = ({ brand, invoice }) => {
  const balanceDue = Math.max(0, invoice.totalAmount - invoice.paidAmount);

  return (
    <PDFDocument title={`Invoice ${invoice.invoiceNumber}`} author={brand.companyName}>
      <Page size="A4" style={baseStyles.page}>
        {/* Thin repeat header on pages 2+ */}
        <DocRepeatHeader brand={brand} docType="INVOICE" />

        {/* Full header — inline flow, auto-sizes */}
        <DocHeader
          brand={brand}
          title="INVOICE"
          metadata={[
            { label: 'Invoice No', value: invoice.invoiceNumber },
            { label: 'Date', value: new Date(invoice.createdAt).toLocaleDateString('en-IN') },
            { label: 'Due Date', value: new Date(invoice.dueDate).toLocaleDateString('en-IN') },
            { label: 'Status', value: invoice.status.toUpperCase() },
          ]}
        />

        {/* Bill To */}
        <View style={styles.billToGrid}>
          <View style={styles.billToLeft}>
            <Text style={styles.billToLabel}>Billed To</Text>
            <Text style={styles.billToName}>{invoice.clientName}</Text>
            {invoice.clientEmail && <Text style={styles.billToMeta}>{invoice.clientEmail}</Text>}
            {invoice.clientAddress && <Text style={styles.billToMeta}>{invoice.clientAddress}</Text>}
            {invoice.clientGst && <Text style={styles.billToMeta}>GSTIN: {invoice.clientGst}</Text>}
          </View>
          <View style={styles.billToRight}>
            <Text style={styles.billToLabel}>Payment Status</Text>
            <Text style={[styles.statusText, { color: statusColor(invoice.status) }]}>
              {invoice.status.toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Items table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, styles.colDesc]}>Description</Text>
            <Text style={[styles.tableHeaderCell, styles.colQty]}>Qty</Text>
            <Text style={[styles.tableHeaderCell, styles.colRate]}>Rate</Text>
            <Text style={[styles.tableHeaderCell, styles.colTotal]}>Amount</Text>
          </View>
          {invoice.items.map((item, i) => (
            <View key={i} style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.colDesc]}>{cleanDocumentText(item.description)}</Text>
              <Text style={[styles.tableCell, styles.colQty]}>{item.quantity}</Text>
              <Text style={[styles.tableCell, styles.colRate]}>{fmt(item.unitPrice, invoice.currency)}</Text>
              <Text style={[styles.tableCell, styles.colTotal]}>{fmt(item.total, invoice.currency)}</Text>
            </View>
          ))}
        </View>

        {/* Summary */}
        <View style={styles.summaryOuter} wrap={false}>
          <View style={styles.summaryInner}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>{fmt(invoice.subtotal, invoice.currency)}</Text>
            </View>
            {invoice.cgst > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>CGST</Text>
                <Text style={styles.summaryValue}>{fmt(invoice.cgst, invoice.currency)}</Text>
              </View>
            )}
            {invoice.sgst > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>SGST</Text>
                <Text style={styles.summaryValue}>{fmt(invoice.sgst, invoice.currency)}</Text>
              </View>
            )}
            {invoice.igst > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>IGST</Text>
                <Text style={styles.summaryValue}>{fmt(invoice.igst, invoice.currency)}</Text>
              </View>
            )}
            <View style={styles.totalRule} />
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={[styles.totalValue, { color: brand.primaryColor }]}>
                {fmt(invoice.totalAmount, invoice.currency)}
              </Text>
            </View>
            {invoice.paidAmount > 0 && (
              <View style={[styles.summaryRow, { marginTop: 4 }]}>
                <Text style={styles.summaryLabel}>Amount Paid</Text>
                <Text style={styles.summaryValue}>{fmt(invoice.paidAmount, invoice.currency)}</Text>
              </View>
            )}
            {balanceDue > 0 && (
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { fontFamily: 'Helvetica-Bold', color: colors.ink }]}>Balance Due</Text>
                <Text style={[styles.summaryValue]}>{fmt(balanceDue, invoice.currency)}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Notes */}
        {invoice.notes && (
          <View style={[styles.notesBox, { borderLeftColor: brand.primaryColor }]} wrap={false}>
            <Text style={styles.notesLabel}>Notes & Terms</Text>
            <Text style={styles.notesText}>{cleanDocumentText(invoice.notes)}</Text>
          </View>
        )}

        <DocFooter brand={brand} />
      </Page>
    </PDFDocument>
  );
};
