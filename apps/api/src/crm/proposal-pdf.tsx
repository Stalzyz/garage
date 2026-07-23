import React from 'react';
import {
  Document, Page, Text, View, StyleSheet, Image
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
  logo: { width: 135, height: 55, objectFit: 'contain', marginBottom: 8 },
  brandName: { fontSize: 22, fontWeight: 'bold', color: '#111', marginBottom: 4 },
  brandSub: { fontSize: 9, color: '#888' },
  proposalBlock: { alignItems: 'flex-end' },
  proposalLabel: { fontSize: 22, fontWeight: 'bold', marginBottom: 4, textTransform: 'uppercase' },
  proposalTitle: { fontSize: 14, color: '#333', marginBottom: 4, width: 250, textAlign: 'right' },
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
  colTax: { flex: 1, textAlign: 'right' },
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

interface ProposalItem { description: string; quantity: number; unitPrice: number; discountRate?: number; taxRate?: number; total: number }
interface ProposalPDFProps {
  proposal: {
    id: string;
    title: string;
    clientName: string;
    clientCompany?: string | null;
    status: string;
    currency: string;
    validUntil?: string | null;
    createdAt: string;
    subtotal: number;
    discountRate?: number;
    taxRate?: number;
    tax: number;
    totalAmount: number;
    notes?: string | null;
    items: ProposalItem[];
  };
  orgName: string;
  orgAddress?: string | null;
  orgLogoUrl?: string | null;
  orgEmail?: string | null;
  orgPhone?: string | null;
  themeColors?: {
    primary?: string;
    secondary?: string;
    accent?: string;
  };
  orgBankName?: string | null;
  orgAccountName?: string | null;
  orgAccountNumber?: string | null;
  orgIfscCode?: string | null;
  orgSwiftCode?: string | null;
}

export const ProposalPDF = ({ 
  proposal, orgName, orgAddress, orgLogoUrl, orgEmail, orgPhone, themeColors,
  orgBankName, orgAccountName, orgAccountNumber, orgIfscCode, orgSwiftCode 
}: ProposalPDFProps) => {
  const primaryColor = themeColors?.primary || '#2563eb';
  const secondaryColor = themeColors?.secondary || '#1e40af';
  const accentColor = themeColors?.accent || '#10b981';

  return (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <View style={styles.brandBlock}>
          {orgLogoUrl && <Image src={orgLogoUrl} style={styles.logo} />}
          {!orgLogoUrl && <Text style={styles.brandName}>{orgName}</Text>}
          {orgAddress && <Text style={styles.brandSub}>{orgAddress}</Text>}
          {orgEmail && <Text style={styles.brandSub}>{orgEmail}</Text>}
          {orgPhone && <Text style={styles.brandSub}>{orgPhone}</Text>}
        </View>
        <View style={styles.proposalBlock}>
          <Text style={{ ...styles.proposalLabel, color: primaryColor }}>PROPOSAL</Text>
          <Text style={styles.proposalTitle}>{proposal.title}</Text>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>{proposal.status}</Text>
          </View>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.twoCol}>
        <View>
          <Text style={styles.colLabel}>Prepared For</Text>
          <Text style={styles.colValue}>{proposal.clientName}</Text>
          {proposal.clientCompany && <Text style={styles.colSub}>{proposal.clientCompany}</Text>}
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={styles.colLabel}>Date</Text>
          <Text style={styles.colValue}>{new Date(proposal.createdAt).toLocaleDateString('en-IN')}</Text>
          {proposal.validUntil && (
            <>
              <Text style={{ ...styles.colLabel, marginTop: 12 }}>Valid Until</Text>
              <Text style={styles.colValue}>{new Date(proposal.validUntil).toLocaleDateString('en-IN')}</Text>
            </>
          )}
        </View>
      </View>

      <View style={styles.table}>
        <View style={{ ...styles.tableHeader, backgroundColor: primaryColor + '15' }}>
          <Text style={{ ...styles.th, ...styles.colDesc }}>Service / Description</Text>
          <Text style={{ ...styles.th, ...styles.colQty }}>Qty</Text>
          <Text style={{ ...styles.th, ...styles.colRate }}>Rate ({proposal.currency})</Text>
          <Text style={{ ...styles.th, ...styles.colDisc }}>Disc %</Text>
          <Text style={{ ...styles.th, ...styles.colTax }}>Tax %</Text>
          <Text style={{ ...styles.th, ...styles.colTotal }}>Total ({proposal.currency})</Text>
        </View>
        {proposal.items.map((item, i) => (
          <View key={i} style={styles.tableRow}>
            <View style={styles.colDesc}>
              <Text style={styles.td}>{item.description}</Text>
            </View>
            <Text style={{ ...styles.td, ...styles.colQty }}>{item.quantity}</Text>
            <Text style={{ ...styles.td, ...styles.colRate }}>{item.unitPrice.toLocaleString('en-IN')}</Text>
            <Text style={{ ...styles.td, ...styles.colDisc }}>{item.discountRate || 0}%</Text>
            <Text style={{ ...styles.td, ...styles.colTax }}>{item.taxRate || 0}%</Text>
            <Text style={{ ...styles.td, ...styles.colTotal }}>{item.total.toLocaleString('en-IN')}</Text>
          </View>
        ))}
      </View>

      <View style={styles.totals}>
        <View style={styles.totalsRow}>
          <Text style={styles.totalsLabel}>Subtotal</Text>
          <Text style={styles.totalsValue}>{proposal.currency} {proposal.subtotal.toLocaleString('en-IN')}</Text>
        </View>
        {(proposal.discountRate && proposal.discountRate > 0) ? (
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Overall Discount ({proposal.discountRate}%)</Text>
            <Text style={{ ...styles.totalsValue, color: '#ef4444' }}>-{proposal.currency} {(proposal.subtotal * (proposal.discountRate / 100)).toLocaleString('en-IN')}</Text>
          </View>
        ) : null}
        {(proposal.tax && proposal.tax > 0) ? (
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Tax</Text>
            <Text style={styles.totalsValue}>{proposal.currency} {proposal.tax.toLocaleString('en-IN')}</Text>
          </View>
        ) : null}
        <View style={{ ...styles.grandTotal, borderTopColor: primaryColor }}>
          <Text style={styles.grandLabel}>Total Investment</Text>
          <Text style={{ ...styles.grandValue, color: primaryColor }}>{proposal.currency} {proposal.totalAmount.toLocaleString('en-IN')}</Text>
        </View>
      </View>

      {proposal.notes && (
        <View style={styles.notes}>
          <Text style={styles.notesLabel}>Notes & Scope of Work</Text>
          <Text style={styles.notesText}>{proposal.notes}</Text>
        </View>
      )}

      {(orgBankName || orgAccountNumber) && (
        <View style={{ ...styles.notes, backgroundColor: '#f0fdf4', marginTop: 12 }}>
          <Text style={styles.notesLabel}>Bank Details</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 4 }}>
            {orgBankName && (
              <View style={{ width: '50%', marginBottom: 8 }}>
                <Text style={{ fontSize: 7, color: '#6b7280', textTransform: 'uppercase' }}>Bank Name</Text>
                <Text style={{ fontSize: 9, color: '#111', fontWeight: 'bold' }}>{orgBankName}</Text>
              </View>
            )}
            {orgAccountName && (
              <View style={{ width: '50%', marginBottom: 8 }}>
                <Text style={{ fontSize: 7, color: '#6b7280', textTransform: 'uppercase' }}>Account Name</Text>
                <Text style={{ fontSize: 9, color: '#111', fontWeight: 'bold' }}>{orgAccountName}</Text>
              </View>
            )}
            {orgAccountNumber && (
              <View style={{ width: '50%', marginBottom: 8 }}>
                <Text style={{ fontSize: 7, color: '#6b7280', textTransform: 'uppercase' }}>Account No</Text>
                <Text style={{ fontSize: 9, color: '#111', fontWeight: 'bold' }}>{orgAccountNumber}</Text>
              </View>
            )}
            {orgIfscCode && (
              <View style={{ width: '50%', marginBottom: 8 }}>
                <Text style={{ fontSize: 7, color: '#6b7280', textTransform: 'uppercase' }}>IFSC Code</Text>
                <Text style={{ fontSize: 9, color: '#111', fontWeight: 'bold' }}>{orgIfscCode}</Text>
              </View>
            )}
            {orgSwiftCode && (
              <View style={{ width: '50%', marginBottom: 8 }}>
                <Text style={{ fontSize: 7, color: '#6b7280', textTransform: 'uppercase' }}>SWIFT Code</Text>
                <Text style={{ fontSize: 9, color: '#111', fontWeight: 'bold' }}>{orgSwiftCode}</Text>
              </View>
            )}
          </View>
        </View>
      )}

      <View style={styles.footer}>
        <Text style={styles.footerText}>Thank you for the opportunity to work with you.</Text>
        <Text style={styles.footerText}>Generated by {orgName}</Text>
      </View>
    </Page>
  </Document>
  );
};
