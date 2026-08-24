import React from 'react';
import { Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { PDFDocument, baseStyles } from './PDFDocument';
import { DocHeader, DocFooter } from './components';
import { BrandConfig } from '../../utils/brand';

const styles = StyleSheet.create({
  coverPage: {
    flex: 1,
    justifyContent: 'center',
    padding: 60,
  },
  coverTitleLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 20,
    color: '#94a3b8',
  },
  coverTitle: {
    fontSize: 36,
    fontWeight: 'heavy',
    color: '#0f172a',
    marginBottom: 60,
    lineHeight: 1.2,
  },
  coverPrepared: {
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  coverPreparedLabel: {
    fontSize: 10,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  coverClientName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 4,
  },
  coverClientMeta: {
    fontSize: 12,
    color: '#334155',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0f172a',
    marginTop: 30,
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  preparedForBox: {
    backgroundColor: '#f8fafc',
    padding: 20,
    borderRadius: 8,
    marginBottom: 30,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gridItem: {
    width: '50%',
    marginBottom: 16,
  },
  gridLabel: {
    fontSize: 9,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  gridValue: {
    fontSize: 11,
    color: '#0f172a',
    fontWeight: 'medium',
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
    marginTop: 20,
    paddingTop: 20,
  },
  notesText: {
    fontSize: 10,
    color: '#334155',
    lineHeight: 1.6,
  },
  acceptanceSection: {
    marginTop: 60,
  },
  signatureBox: {
    width: 250,
    borderTopWidth: 1,
    borderTopColor: '#cbd5e1',
    paddingTop: 8,
    marginTop: 60,
  },
  signatureLabel: {
    fontSize: 10,
    color: '#64748b',
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
      <Page size="A4" style={{ ...baseStyles.page, padding: 0 }}>
        <View style={styles.coverPage}>
          <DocHeader brand={brand} title="" />
          
          <View style={{ marginTop: 80 }}>
            <Text style={[styles.coverTitleLabel, { color: brand.primaryColor }]}>Proposal</Text>
            <Text style={styles.coverTitle}>{proposal.title}</Text>
          </View>

          <View style={styles.coverPrepared}>
            <Text style={styles.coverPreparedLabel}>Prepared For</Text>
            <Text style={styles.coverClientName}>{proposal.clientName}</Text>
            {proposal.clientCompany && <Text style={styles.coverClientMeta}>{proposal.clientCompany}</Text>}
            <Text style={[styles.coverClientMeta, { marginTop: 16 }]}>
              {new Date(proposal.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </Text>
          </View>
        </View>
      </Page>

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
              <Text style={[styles.tableCell, styles.colDesc]}>{item.description}</Text>
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

        {proposal.notes && (
          <View wrap={false}>
            <Text style={styles.sectionTitle}>Terms & Notes</Text>
            <View style={styles.notesSection}>
              <Text style={styles.notesText}>{proposal.notes}</Text>
            </View>
          </View>
        )}

        <View style={styles.acceptanceSection} wrap={false}>
          <Text style={styles.sectionTitle}>Acceptance</Text>
          <Text style={styles.notesText}>By signing below, you agree to the terms and scope of work outlined in this proposal.</Text>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureLabel}>Accepted By</Text>
            <Text style={[styles.gridValue, { marginBottom: 4 }]}>{proposal.clientName}</Text>
            <Text style={styles.gridLabel}>Date: ____________________</Text>
          </View>
        </View>

        <DocFooter brand={brand} />
      </Page>
    </PDFDocument>
  );
};
