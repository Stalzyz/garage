import React from 'react';
import { Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { PDFDocument, baseStyles } from './PDFDocument';
import { DocHeader, DocFooter } from './components';
import { BrandConfig } from '../../utils/brand';
import { cleanDocumentText } from '../../utils/text';

const styles = StyleSheet.create({
  coverPage: {
    flex: 1,
    padding: 60,
    backgroundColor: '#f8fafc', // Modern off-white background tint
    justifyContent: 'space-between',
  },
  coverHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  coverLogoText: {
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 2,
    color: '#0f172a',
  },
  coverTitleContainer: {
    borderLeftWidth: 6,
    paddingLeft: 24,
    marginVertical: 'auto',
    maxWidth: '85%',
  },
  coverTitleLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 4,
    textTransform: 'uppercase',
    marginBottom: 16,
  },
  coverTitle: {
    fontSize: 34,
    fontWeight: 'heavy',
    color: '#0f172a',
    lineHeight: 1.2,
  },
  coverFooter: {
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 36,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  coverPreparedLabel: {
    fontSize: 8,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  coverClientName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 4,
  },
  coverClientMeta: {
    fontSize: 10,
    color: '#475569',
  },
  coverDate: {
    fontSize: 10,
    color: '#64748b',
    letterSpacing: 1,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#0f172a',
    marginTop: 26,
    marginBottom: 14,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 6,
  },
  preparedForBox: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 6,
    padding: 16,
    marginBottom: 24,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gridItem: {
    width: '50%',
    marginBottom: 10,
  },
  gridLabel: {
    fontSize: 8,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  gridValue: {
    fontSize: 10,
    color: '#0f172a',
    fontWeight: 'medium',
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
    fontSize: 11,
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
    marginTop: 8,
  },
  notesText: {
    fontSize: 9,
    color: '#475569',
    lineHeight: 1.6,
  },
  acceptanceSection: {
    marginTop: 30,
  },
  signatureBox: {
    width: 210,
  },
  signatureLine: {
    borderBottomWidth: 1.5,
    borderBottomColor: '#cbd5e1',
    marginBottom: 8,
  },
  signatureLabel: {
    fontSize: 8,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  }
});

interface ProposalItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface TemplateProposalProps {
  brand: BrandConfig;
  proposal: {
    id: string;
    title: string;
    clientName: string;
    clientCompany?: string | null;
    clientEmail?: string | null;
    clientPhone?: string | null;
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
}

const formatCurrency = (amount: number, currency: string) => {
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
  return `${currency} ${formatted}`;
};

export const TemplateProposal: React.FC<TemplateProposalProps> = ({ brand, proposal }) => {
  return (
    <PDFDocument title={`Proposal - ${proposal.title}`} author={brand.companyName}>
      {/* Page 1: Premium Title Page */}
      <Page size="A4" style={{ ...baseStyles.page, padding: 0 }}>
        <View style={styles.coverPage}>
          <View style={styles.coverHeader}>
            <Text style={styles.coverLogoText}>
              {brand.companyName.toUpperCase()}
            </Text>
            <Text style={styles.coverDate}>
              {new Date(proposal.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </Text>
          </View>

          <View style={[styles.coverTitleContainer, { borderLeftColor: brand.primaryColor }]}>
            <Text style={[styles.coverTitleLabel, { color: brand.primaryColor }]}>Project Proposal</Text>
            <Text style={styles.coverTitle}>{proposal.title}</Text>
          </View>

          <View style={styles.coverFooter}>
            <View>
              <Text style={styles.coverPreparedLabel}>Prepared For</Text>
              <Text style={styles.coverClientName}>{proposal.clientName}</Text>
              {proposal.clientCompany && <Text style={styles.coverClientMeta}>{proposal.clientCompany}</Text>}
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.coverPreparedLabel}>Organization</Text>
              <Text style={[styles.coverClientName, { fontSize: 13 }]}>{brand.companyName}</Text>
              {brand.contactEmail && <Text style={styles.coverClientMeta}>{brand.contactEmail}</Text>}
            </View>
          </View>
        </View>
      </Page>

      {/* Page 2: Scope & Investment Table */}
      <Page size="A4" style={baseStyles.page}>
        <DocHeader 
          brand={brand} 
          title="PROPOSAL"
          metadata={[
            { label: 'Date', value: new Date(proposal.createdAt).toLocaleDateString() },
            { label: 'Valid Until', value: proposal.validUntil ? new Date(proposal.validUntil).toLocaleDateString() : 'N/A' },
            { label: 'Status', value: proposal.status },
          ]}
        />

        <View style={styles.preparedForBox}>
          <View style={styles.grid}>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Client Name</Text>
              <Text style={styles.gridValue}>{proposal.clientName}</Text>
            </View>
            {proposal.clientCompany && (
              <View style={styles.gridItem}>
                <Text style={styles.gridLabel}>Company</Text>
                <Text style={styles.gridValue}>{proposal.clientCompany}</Text>
              </View>
            )}
            {proposal.clientEmail && (
              <View style={styles.gridItem}>
                <Text style={styles.gridLabel}>Email</Text>
                <Text style={styles.gridValue}>{proposal.clientEmail}</Text>
              </View>
            )}
            {proposal.clientPhone && (
              <View style={styles.gridItem}>
                <Text style={styles.gridLabel}>Phone</Text>
                <Text style={styles.gridValue}>{proposal.clientPhone}</Text>
              </View>
            )}
          </View>
        </View>

        <Text style={styles.sectionTitle}>Scope & Investment</Text>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, styles.colDesc]}>Description</Text>
            <Text style={[styles.tableHeaderCell, styles.colQty]}>Qty</Text>
            <Text style={[styles.tableHeaderCell, styles.colRate]}>Rate</Text>
            <Text style={[styles.tableHeaderCell, styles.colTotal]}>Amount</Text>
          </View>

          {proposal.items.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.colDesc]}>{cleanDocumentText(item.description)}</Text>
              <Text style={[styles.tableCell, styles.colQty]}>{item.quantity}</Text>
              <Text style={[styles.tableCell, styles.colRate]}>{formatCurrency(item.unitPrice, proposal.currency)}</Text>
              <Text style={[styles.tableCell, styles.colTotal]}>{formatCurrency(item.total, proposal.currency)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.summaryBox}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>{formatCurrency(proposal.subtotal, proposal.currency)}</Text>
          </View>
          {proposal.tax > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tax {proposal.taxRate ? `(${proposal.taxRate}%)` : ''}</Text>
              <Text style={styles.summaryValue}>{formatCurrency(proposal.tax, proposal.currency)}</Text>
            </View>
          )}
          <View style={styles.grandTotalRow}>
            <Text style={styles.grandTotalLabel}>Total Investment</Text>
            <Text style={[styles.grandTotalValue, { color: brand.primaryColor }]}>
              {formatCurrency(proposal.totalAmount, proposal.currency)}
            </Text>
          </View>
        </View>

        <DocFooter brand={brand} />
      </Page>

      {/* Page 3: Terms, Notes & Acceptance Signatures */}
      <Page size="A4" style={baseStyles.page}>
        <DocHeader brand={brand} title="PROPOSAL TERMS" />

        {proposal.notes && (
          <View style={{ marginBottom: 40 }}>
            <Text style={styles.sectionTitle}>Terms & Notes</Text>
            <View style={[styles.notesSection, { borderLeftColor: brand.primaryColor }]}>
              <Text style={styles.notesText}>{cleanDocumentText(proposal.notes)}</Text>
            </View>
          </View>
        )}

        <View style={styles.acceptanceSection}>
          <Text style={styles.sectionTitle}>Acceptance & Agreement</Text>
          <Text style={[styles.notesText, { marginBottom: 40 }]}>By signing below, you agree to the terms, pricing, and scope of work detailed in this project proposal.</Text>
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View style={styles.signatureBox}>
              <Text style={styles.signatureLabel}>For {brand.companyName}</Text>
              <View style={{ height: 45 }} />
              <View style={styles.signatureLine} />
              <Text style={styles.gridValue}>Authorized Representative</Text>
              <Text style={[styles.signatureLabel, { marginTop: 4 }]}>Date: ____________________</Text>
            </View>
            
            <View style={styles.signatureBox}>
              <Text style={styles.signatureLabel}>For Client: {proposal.clientName}</Text>
              <View style={{ height: 45 }} />
              <View style={styles.signatureLine} />
              <Text style={styles.gridValue}>Accepted By</Text>
              <Text style={[styles.signatureLabel, { marginTop: 4 }]}>Date: ____________________</Text>
            </View>
          </View>
        </View>

        <DocFooter brand={brand} />
      </Page>
    </PDFDocument>
  );
};
