import React from 'react';
import {
  Document, Page, Text, View, StyleSheet, Font, Image
} from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#ffffff',
    padding: 48,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#111',
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 40 },
  brandBlock: {},
  logo: { width: 150, height: 70, objectFit: 'contain', marginBottom: 8 },
  brandName: { fontSize: 22, fontWeight: 'bold', color: '#111', marginBottom: 4 },
  brandSub: { fontSize: 9, color: '#888' },
  invoiceBlock: { alignItems: 'flex-end' },
  invoiceLabel: { fontSize: 22, fontWeight: 'bold', marginBottom: 4 },
  invoiceNumber: { fontSize: 10, color: '#888' },
  statusBadge: {
    marginTop: 6,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 4,
    backgroundColor: '#dcfce7',
  },
  statusText: { fontSize: 9, fontWeight: 'bold', color: '#16a34a' },
  divider: { borderBottom: '1px solid #e5e7eb', marginBottom: 24 },
  twoCol: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 32 },
  colLabel: { fontSize: 8, color: '#9ca3af', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.8 },
  colValue: { fontSize: 11, color: '#111', fontWeight: 'bold' },
  colSub: { fontSize: 9, color: '#6b7280', marginTop: 2 },
  table: { marginBottom: 24 },
  tableHeader: {
    flexDirection: 'row', backgroundColor: '#f8fafc',
    paddingVertical: 8, paddingHorizontal: 10, borderRadius: 4,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 10, paddingHorizontal: 10,
    borderBottom: '1px solid #f1f5f9',
  },
  th: { fontSize: 8, fontWeight: 'bold', color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5 },
  td: { fontSize: 10, color: '#111' },
  colDesc: { flex: 3 },
  colQty: { flex: 0.8, textAlign: 'right' },
  colRate: { flex: 1.2, textAlign: 'right' },
  colDisc: { flex: 1, textAlign: 'right' },
  colTotal: { flex: 1.2, textAlign: 'right' },
  totals: { alignItems: 'flex-end', marginBottom: 24 },
  totalsRow: { flexDirection: 'row', justifyContent: 'space-between', width: 220, marginBottom: 4 },
  totalsLabel: { fontSize: 9, color: '#6b7280' },
  totalsValue: { fontSize: 10, color: '#111' },
  grandTotal: {
    flexDirection: 'row', justifyContent: 'space-between',
    width: 220, marginTop: 8,
    borderTopWidth: 2, borderTopStyle: 'solid',
    paddingTop: 8,
  },
  grandLabel: { fontSize: 12, fontWeight: 'bold', color: '#111' },
  grandValue: { fontSize: 12, fontWeight: 'bold' },
  notes: { backgroundColor: '#f8fafc', borderRadius: 4, padding: 12, marginBottom: 24 },
  notesLabel: { fontSize: 8, color: '#6b7280', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  notesText: { fontSize: 9, color: '#374151' },
  footer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 48 },
  footerText: { fontSize: 8, color: '#9ca3af' },
});

interface InvoiceItem { description: string; quantity: number; unitPrice: number; taxRate: number; discountRate?: number; hsnCode?: string | null; total: number }
interface InvoicePDFProps {
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
    discountRate?: number;
    cgst: number;
    sgst: number;
    igst: number;
    totalAmount: number;
    paidAmount: number;
    notes?: string | null;
    items: InvoiceItem[];
  };
  orgName: string;
  orgAddress?: string | null;
  orgLogoUrl?: string | null;
  gstNumber?: string | null;
  themeColors?: {
    primary?: string;
    secondary?: string;
    accent?: string;
  };
}

export const InvoicePDF = ({ invoice, orgName, orgAddress, orgLogoUrl, gstNumber, themeColors }: InvoicePDFProps) => {
  const primaryColor = themeColors?.primary || '#2563eb';
  const secondaryColor = themeColors?.secondary || '#1e40af';
  const accentColor = themeColors?.accent || '#10b981';

  return (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.brandBlock}>
          {orgLogoUrl && <Image src={orgLogoUrl} style={styles.logo} />}
          {!orgLogoUrl && <Text style={styles.brandName}>{orgName}</Text>}
          {orgAddress && <Text style={styles.brandSub}>{orgAddress}</Text>}
          {gstNumber && <Text style={styles.brandSub}>GSTIN: {gstNumber}</Text>}
        </View>
        <View style={styles.invoiceBlock}>
          <Text style={{ ...styles.invoiceLabel, color: primaryColor }}>INVOICE</Text>
          <Text style={styles.invoiceNumber}>#{invoice.invoiceNumber}</Text>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>{invoice.status}</Text>
          </View>
        </View>
      </View>

      <View style={styles.divider} />

      {/* Bill To + Dates */}
      <View style={styles.twoCol}>
        <View>
          <Text style={styles.colLabel}>Bill To</Text>
          <Text style={styles.colValue}>{invoice.clientName}</Text>
          {invoice.clientEmail && <Text style={styles.colSub}>{invoice.clientEmail}</Text>}
          {invoice.clientGst && <Text style={styles.colSub}>GSTIN: {invoice.clientGst}</Text>}
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={styles.colLabel}>Invoice Date</Text>
          <Text style={styles.colValue}>{new Date(invoice.createdAt).toLocaleDateString('en-IN')}</Text>
          <Text style={{ ...styles.colLabel, marginTop: 12 }}>Due Date</Text>
          <Text style={styles.colValue}>{new Date(invoice.dueDate).toLocaleDateString('en-IN')}</Text>
        </View>
      </View>

      {/* Table */}
      <View style={styles.table}>
        <View style={{ ...styles.tableHeader, backgroundColor: primaryColor + '15' }}>
          <Text style={{ ...styles.th, ...styles.colDesc }}>Description</Text>
          <Text style={{ ...styles.th, ...styles.colQty }}>Qty</Text>
          <Text style={{ ...styles.th, ...styles.colRate }}>Rate ({invoice.currency})</Text>
          <Text style={{ ...styles.th, ...styles.colDisc }}>Disc %</Text>
          <Text style={{ ...styles.th, ...styles.colTotal }}>Total ({invoice.currency})</Text>
        </View>
        {invoice.items.map((item, i) => (
          <View key={i} style={styles.tableRow}>
            <View style={styles.colDesc}>
              <Text style={styles.td}>{item.description}</Text>
              {item.hsnCode && (
                <Text style={{ fontSize: 7, color: '#8b949e', marginTop: 2 }}>HSN/SAC: {item.hsnCode}</Text>
              )}
            </View>
            <Text style={{ ...styles.td, ...styles.colQty }}>{item.quantity}</Text>
            <Text style={{ ...styles.td, ...styles.colRate }}>{item.unitPrice.toLocaleString('en-IN')}</Text>
            <Text style={{ ...styles.td, ...styles.colDisc }}>{item.discountRate || 0}%</Text>
            <Text style={{ ...styles.td, ...styles.colTotal }}>{item.total.toLocaleString('en-IN')}</Text>
          </View>
        ))}
      </View>

      {/* Totals */}
      <View style={styles.totals}>
        <View style={styles.totalsRow}>
          <Text style={styles.totalsLabel}>Subtotal</Text>
          <Text style={styles.totalsValue}>{invoice.currency} {invoice.subtotal.toLocaleString('en-IN')}</Text>
        </View>
        {(invoice.discountRate && invoice.discountRate > 0) ? (
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Overall Discount ({invoice.discountRate}%)</Text>
            <Text style={{ ...styles.totalsValue, color: '#ef4444' }}>-{invoice.currency} {(invoice.subtotal * (invoice.discountRate / 100)).toLocaleString('en-IN')}</Text>
          </View>
        ) : null}
        {invoice.cgst > 0 && (
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>CGST</Text>
            <Text style={styles.totalsValue}>{invoice.currency} {invoice.cgst.toLocaleString('en-IN')}</Text>
          </View>
        )}
        {invoice.sgst > 0 && (
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>SGST</Text>
            <Text style={styles.totalsValue}>{invoice.currency} {invoice.sgst.toLocaleString('en-IN')}</Text>
          </View>
        )}
        {invoice.igst > 0 && (
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>IGST</Text>
            <Text style={styles.totalsValue}>{invoice.currency} {invoice.igst.toLocaleString('en-IN')}</Text>
          </View>
        )}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: 220, marginBottom: 4, marginTop: 4 }}>
          <Text style={styles.totalsLabel}>Total</Text>
          <Text style={styles.totalsValue}>{invoice.currency} {invoice.totalAmount.toLocaleString('en-IN')}</Text>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: 220, marginBottom: 4 }}>
          <Text style={styles.totalsLabel}>Amount Paid</Text>
          <Text style={styles.totalsValue}>{invoice.currency} {invoice.paidAmount.toLocaleString('en-IN')}</Text>
        </View>
        <View style={{ ...styles.grandTotal, borderTopColor: primaryColor }}>
          <Text style={styles.grandLabel}>Amount Due</Text>
          <Text style={{ ...styles.grandValue, color: primaryColor }}>{invoice.currency} {(invoice.totalAmount - invoice.paidAmount).toLocaleString('en-IN')}</Text>
        </View>
      </View>

      {/* Notes */}
      {invoice.notes && (
        <View style={styles.notes}>
          <Text style={styles.notesLabel}>Notes</Text>
          <Text style={styles.notesText}>{invoice.notes}</Text>
        </View>
      )}

      <View style={styles.footer}>
        <Text style={styles.footerText}>Thank you for your business.</Text>
        <Text style={styles.footerText}>Generated by {orgName}</Text>
      </View>
  </Document>
  );
};
