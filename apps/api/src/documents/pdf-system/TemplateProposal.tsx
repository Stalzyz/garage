import React from 'react';
import { Page, View, Text, StyleSheet, Image } from '@react-pdf/renderer';
import { PDFDocument, baseStyles, colors, sp } from './PDFDocument';
import { DocHeader, DocRepeatHeader, DocFooter } from './components';
import { BrandConfig, resolveBrandLogo } from '../../utils/brand';
import { cleanDocumentText } from '../../utils/text';

const safeCurrency = (c: string) => c === '₹' ? 'Rs.' : c;

const fmt = (amount: number, currency: string) => {
  const n = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
  return `${safeCurrency(currency)} ${n}`;
};

const styles = StyleSheet.create({
  // Cover Page
  coverPage: {
    flex: 1,
    padding: 56,
    backgroundColor: colors.white,
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  coverTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingBottom: sp['20'],
    borderBottomWidth: 1,
    borderBottomColor: colors.rule,
  },
  coverBrand: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: colors.ink,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  coverMonth: {
    fontSize: 9,
    color: colors.muted,
  },
  coverMiddle: {
    marginVertical: sp['48'],
    borderLeftWidth: 4,
    borderLeftColor: colors.green,
    paddingLeft: sp['20'],
  },
  coverType: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 3,
    textTransform: 'uppercase',
    color: colors.green,
    marginBottom: sp['8'],
  },
  coverTitle: {
    fontSize: 26,
    fontFamily: 'Helvetica-Bold',
    color: colors.ink,
    lineHeight: 1.3,
  },
  coverBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingTop: sp['20'],
    borderTopWidth: 1,
    borderTopColor: colors.rule,
  },
  coverLabel: {
    fontSize: 7.5,
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 3,
  },
  coverName: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: colors.ink,
    marginBottom: 2,
  },
  coverMeta: { fontSize: 8.5, color: colors.body },

  // Client info grid
  clientGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderWidth: 1,
    borderColor: colors.green,
    borderRadius: 4,
    backgroundColor: '#f0fdf4',
    padding: sp['12'],
    marginBottom: sp['20'],
  },
  clientItem: { width: '50%', marginBottom: sp['8'] },
  clientLabel: { fontSize: 7.5, color: colors.muted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 },
  clientValue: { fontSize: 9.5, fontFamily: 'Helvetica-Bold', color: colors.ink },

  // Section title
  sectionTitle: {
    fontSize: 9.5,
    fontFamily: 'Helvetica-Bold',
    color: colors.green,
    textTransform: 'uppercase',
    letterSpacing: 1,
    paddingBottom: 4,
    borderBottomWidth: 1.5,
    borderBottomColor: colors.green,
    marginBottom: sp['12'],
  },

  // Table
  table: { width: '100%', marginBottom: sp['16'], borderWidth: 1, borderColor: colors.rule, borderRadius: 4, overflow: 'hidden' },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: colors.green,
    paddingVertical: 6,
    paddingHorizontal: 6,
    marginBottom: 0,
  },
  tableHeaderCell: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: colors.white,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.rule,
    paddingVertical: sp['8'],
    paddingHorizontal: 6,
    minHeight: 22,
  },
  tableCell: { fontSize: 9, color: colors.body, lineHeight: 1.4 },
  colDesc: { flex: 4.5, paddingRight: sp['8'] },
  colQty: { width: 36, textAlign: 'center' },
  colRate: { width: 80, textAlign: 'right' },
  colTotal: { width: 80, textAlign: 'right', fontFamily: 'Helvetica-Bold' },

  // Summary
  summaryOuter: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: sp['20'] },
  summaryInner: { width: 220 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 2 },
  summaryLabel: { fontSize: 8.5, color: colors.muted },
  summaryValue: { fontSize: 8.5, fontFamily: 'Helvetica-Bold', color: colors.ink },
  totalRule: { borderTopWidth: 1.5, borderTopColor: colors.orange, marginVertical: 6 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: colors.ink },
  totalValue: { fontSize: 12, fontFamily: 'Helvetica-Bold', color: colors.green },

  // Notes
  notesBox: {
    borderLeftWidth: 3,
    borderLeftColor: colors.green,
    backgroundColor: colors.surface,
    padding: sp['12'],
    marginBottom: sp['20'],
  },
  notesText: { fontSize: 8.5, color: colors.body, lineHeight: 1.6 },

  // Signatures
  sigSection: { flexDirection: 'row', justifyContent: 'space-between', marginTop: sp['32'] },
  sigBlock: { width: '45%' },
  sigSpace: { height: 40 },
  sigLine: { borderBottomWidth: 1, borderBottomColor: colors.ruleStrong, marginBottom: 5 },
  sigName: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: colors.ink, marginBottom: 2 },
  sigRole: { fontSize: 7.5, color: colors.muted, textTransform: 'uppercase', letterSpacing: 0.5 },
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

export const TemplateProposal: React.FC<TemplateProposalProps> = ({ brand, proposal }) => {
  const resolvedLogo = resolveBrandLogo(brand.logoUrl);

  return (
  <PDFDocument title={`Proposal — ${proposal.title}`} author={brand.companyName}>

    {/* ── Page 1: Cover ──────────────────────────────────────────────────────── */}
    <Page size="A4" style={{ ...baseStyles.page, padding: 0 }}>
      <View style={styles.coverPage}>
        <View style={[styles.coverTopRow, { justifyContent: 'flex-end' }]}>
          <Text style={styles.coverMonth}>
            {new Date(proposal.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </Text>
        </View>

        <View>
          {resolvedLogo ? (
            <Image src={resolvedLogo} style={{ maxWidth: 220, maxHeight: 60, objectFit: 'contain', objectPosition: 'left', alignSelf: 'flex-start', marginBottom: sp['20'] }} />
          ) : (
            <Text style={[styles.coverBrand, { marginBottom: sp['20'] }]}>{brand.companyName}</Text>
          )}
          <View style={[styles.coverMiddle, { borderLeftColor: brand.primaryColor, marginVertical: 0 }]}>
            <Text style={[styles.coverType, { color: brand.primaryColor }]}>Project Proposal</Text>
            <Text style={styles.coverTitle}>{proposal.title}</Text>
          </View>
        </View>

        <View style={styles.coverBottomRow}>
          <View>
            <Text style={styles.coverLabel}>Prepared For</Text>
            <Text style={styles.coverName}>{proposal.clientName}</Text>
            {proposal.clientCompany && <Text style={styles.coverMeta}>{proposal.clientCompany}</Text>}
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.coverLabel}>Submitted By</Text>
            <Text style={styles.coverName}>{brand.companyName}</Text>
            {brand.contactEmail && <Text style={styles.coverMeta}>{brand.contactEmail}</Text>}
          </View>
        </View>
      </View>
    </Page>

    {/* ── Page 2: Scope & Investment ─────────────────────────────────────────── */}
    <Page size="A4" style={baseStyles.page}>
      <DocRepeatHeader brand={brand} docType="PROPOSAL" />
      <DocHeader
        brand={brand}
        title="PROPOSAL"
        metadata={[
          { label: 'Date', value: new Date(proposal.createdAt).toLocaleDateString('en-IN') },
          { label: 'Valid Until', value: proposal.validUntil ? new Date(proposal.validUntil).toLocaleDateString('en-IN') : 'N/A' },
        ]}
      />

      {/* Client Info */}
      <View style={styles.clientGrid}>
        <View style={styles.clientItem}>
          <Text style={styles.clientLabel}>Client</Text>
          <Text style={styles.clientValue}>{proposal.clientName}</Text>
        </View>
        {proposal.clientCompany && (
          <View style={styles.clientItem}>
            <Text style={styles.clientLabel}>Organization</Text>
            <Text style={styles.clientValue}>{proposal.clientCompany}</Text>
          </View>
        )}
        {proposal.clientEmail && (
          <View style={styles.clientItem}>
            <Text style={styles.clientLabel}>Email</Text>
            <Text style={styles.clientValue}>{proposal.clientEmail}</Text>
          </View>
        )}
        {proposal.clientPhone && (
          <View style={styles.clientItem}>
            <Text style={styles.clientLabel}>Phone</Text>
            <Text style={styles.clientValue}>{proposal.clientPhone}</Text>
          </View>
        )}
      </View>

      <Text style={styles.sectionTitle}>Scope of Work</Text>
      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderCell, styles.colDesc]}>Description</Text>
          <Text style={[styles.tableHeaderCell, styles.colQty]}>Qty</Text>
          <Text style={[styles.tableHeaderCell, styles.colRate]}>Rate</Text>
          <Text style={[styles.tableHeaderCell, styles.colTotal]}>Amount</Text>
        </View>
        {proposal.items.map((item, i) => (
          <View key={i} style={styles.tableRow}>
            <Text style={[styles.tableCell, styles.colDesc]}>{cleanDocumentText(item.description)}</Text>
            <Text style={[styles.tableCell, styles.colQty]}>{item.quantity}</Text>
            <Text style={[styles.tableCell, styles.colRate]}>{fmt(item.unitPrice, proposal.currency)}</Text>
            <Text style={[styles.tableCell, styles.colTotal]}>{fmt(item.total, proposal.currency)}</Text>
          </View>
        ))}
      </View>

      <View style={styles.summaryOuter} wrap={false}>
        <View style={styles.summaryInner}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>{fmt(proposal.subtotal, proposal.currency)}</Text>
          </View>
          {proposal.tax > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tax ({proposal.taxRate || 18}%)</Text>
              <Text style={styles.summaryValue}>{fmt(proposal.tax, proposal.currency)}</Text>
            </View>
          )}
          <View style={styles.totalRule} />
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Investment</Text>
            <Text style={[styles.totalValue, { color: brand.primaryColor }]}>
              {fmt(proposal.totalAmount, proposal.currency)}
            </Text>
          </View>
        </View>
      </View>

      <DocFooter brand={brand} />
    </Page>

    {/* ── Page 3: Terms & Acceptance ─────────────────────────────────────────── */}
    <Page size="A4" style={baseStyles.page}>
      <DocRepeatHeader brand={brand} docType="TERMS & ACCEPTANCE" />
      <DocHeader brand={brand} title="TERMS &amp; ACCEPTANCE" />

      {proposal.notes && (
        <View style={{ marginBottom: sp['20'] }}>
          <Text style={styles.sectionTitle}>Terms & Conditions</Text>
          <View style={[styles.notesBox, { borderLeftColor: brand.primaryColor }]}>
            <Text style={styles.notesText}>{cleanDocumentText(proposal.notes)}</Text>
          </View>
        </View>
      )}

      <Text style={styles.sectionTitle}>Acceptance of Proposal</Text>
      <Text style={{ fontSize: 9, color: colors.body, lineHeight: 1.5, marginBottom: sp['16'] }}>
        By signing below, both parties acknowledge and accept the scope of work, investment schedule, and terms set forth in this proposal.
      </Text>

      <View style={styles.sigSection} wrap={false}>
        <View style={styles.sigBlock}>
          <View style={styles.sigSpace} />
          <View style={styles.sigLine} />
          <Text style={styles.sigName}>{brand.companyName}</Text>
          <Text style={styles.sigRole}>Authorized Representative</Text>
        </View>
        <View style={styles.sigBlock}>
          <View style={styles.sigSpace} />
          <View style={styles.sigLine} />
          <Text style={styles.sigName}>{proposal.clientName}</Text>
          <Text style={styles.sigRole}>Client Acceptance</Text>
        </View>
      </View>

      <DocFooter brand={brand} />
    </Page>
  </PDFDocument>
  );
};

