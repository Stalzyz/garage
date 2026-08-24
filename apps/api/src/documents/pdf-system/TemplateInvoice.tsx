import React from 'react';
import { Page, View, Text, StyleSheet, Image } from '@react-pdf/renderer';
import { PDFDocument, baseStyles, colors, sp } from './PDFDocument';
import { DocFooter } from './components';
import { BrandConfig, resolveBrandLogo } from '../../utils/brand';
import { cleanDocumentText } from '../../utils/text';

const safeCurrency = (c: string) => c === '₹' ? 'Rs.' : c;

const fmt = (amount: number, currency: string) => {
  const n = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
  return `${safeCurrency(currency)} ${n}`;
};

const styles = StyleSheet.create({
  // ─── Inline Header ────────────────────────────────────────────────────────
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: sp['20'],
  },
  headerLeft: {
    flexDirection: 'column',
    maxWidth: '55%',
  },
  logo: {
    width: 120,
    height: 38,
    objectFit: 'contain',
    marginBottom: sp['4'],
  },
  companyName: {
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    color: colors.ink,
    marginBottom: sp['4'],
  },
  headerRight: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    maxWidth: '40%',
  },
  companyMeta: {
    fontSize: 8,
    color: colors.muted,
    lineHeight: 1.4,
    textAlign: 'right',
  },

  // ─── Document Title Stamp ──────────────────────────────────────────────────
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: sp['20'],
  },
  invoiceTitle: {
    fontSize: 32,
    fontFamily: 'Helvetica-Bold',
    color: colors.ink,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },

  // ─── Billed To vs Invoice Metadata Grid ───────────────────────────────────
  billToGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: sp['24'],
  },
  billToLeft: {
    flex: 1.2,
    paddingRight: sp['24'],
  },
  billToLabel: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: colors.ink,
    marginBottom: sp['8'],
  },
  billToName: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: colors.ink,
    marginBottom: 4,
  },
  billToMeta: {
    fontSize: 8.5,
    color: colors.body,
    lineHeight: 1.4,
  },
  metadataContainer: {
    flex: 0.8,
    alignItems: 'flex-end',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 4,
  },
  metaLabel: {
    fontSize: 8.5,
    color: colors.muted,
    marginRight: sp['8'],
    textAlign: 'right',
  },
  metaValue: {
    fontSize: 8.5,
    fontFamily: 'Helvetica-Bold',
    color: colors.ink,
    textAlign: 'right',
  },
  
  // Brand Highlight Banner for "Total Due"
  totalDueBanner: {
    marginTop: sp['12'],
    paddingVertical: sp['8'],
    paddingHorizontal: sp['16'],
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: 230,
  },
  bannerLabel: {
    fontSize: 9,
    color: colors.white,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  bannerValue: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: colors.white,
  },

  // ─── Items Table ──────────────────────────────────────────────────────────
  table: {
    width: '100%',
    marginBottom: sp['24'],
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1.5,
    borderBottomColor: colors.ink,
    paddingBottom: 6,
    marginBottom: 4,
  },
  tableHeaderCell: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: sp['8'],
    paddingHorizontal: sp['6'],
    minHeight: 24,
    alignItems: 'center',
  },
  tableRowEven: {
    backgroundColor: colors.surface,
  },
  tableRowOdd: {
    backgroundColor: colors.white,
  },
  tableCell: {
    fontSize: 8.5,
    color: colors.body,
    lineHeight: 1.4,
  },
  colDesc: { flex: 4.5, paddingRight: sp['8'] },
  colQty: { width: 44, textAlign: 'center' },
  colRate: { width: 80, textAlign: 'right' },
  colTotal: { width: 80, textAlign: 'right' },

  // ─── Bottom Layout Grid (Payment Info vs Totals) ──────────────────────────
  bottomGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: sp['8'],
  },
  bottomLeft: {
    width: '52%',
  },
  bottomRight: {
    width: '40%',
    alignItems: 'flex-end',
  },

  // Terms and Payment Info
  termsLabel: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: colors.ink,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  termsValue: {
    fontSize: 8,
    color: colors.body,
    marginBottom: sp['12'],
  },
  paymentBox: {
    borderTopWidth: 1,
    borderTopColor: colors.ruleStrong,
    paddingTop: sp['8'],
    marginTop: sp['4'],
  },
  paymentLabel: {
    fontSize: 8.5,
    fontFamily: 'Helvetica-Bold',
    color: colors.ink,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  paymentRow: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  paymentRowLabel: {
    fontSize: 8,
    color: colors.muted,
    width: 80,
  },
  paymentRowValue: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: colors.ink,
    flex: 1,
  },

  // Totals Summary
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingVertical: 3,
  },
  summaryLabel: {
    fontSize: 8.5,
    color: colors.muted,
  },
  summaryValue: {
    fontSize: 8.5,
    fontFamily: 'Helvetica-Bold',
    color: colors.ink,
  },
  bottomBanner: {
    marginTop: sp['8'],
    paddingVertical: sp['8'],
    paddingHorizontal: sp['12'],
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  bottomBannerLabel: {
    fontSize: 8.5,
    color: colors.white,
  },
  bottomBannerValue: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: colors.white,
  },

  // Signatory
  signatoryBlock: {
    marginTop: sp['32'],
    alignItems: 'flex-end',
  },
  sigSpace: {
    height: 32,
  },
  sigLine: {
    width: 140,
    borderBottomWidth: 1,
    borderBottomColor: colors.ruleStrong,
    marginBottom: 4,
  },
  sigName: {
    fontSize: 8.5,
    fontFamily: 'Helvetica-Bold',
    color: colors.ink,
  },
  sigRole: {
    fontSize: 7.5,
    color: colors.muted,
    textTransform: 'uppercase',
  },

  // Callout Message
  calloutText: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    marginTop: sp['24'],
  },
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
  const resolvedLogo = resolveBrandLogo(brand.logoUrl);

  return (
    <PDFDocument title={`Invoice ${invoice.invoiceNumber}`} author={brand.companyName}>
      <Page size="A4" style={baseStyles.page}>
        
        {/* ─── Premium Flow Header ────────────────────────────────────────────── */}
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            {resolvedLogo ? (
              <Image src={resolvedLogo} style={styles.logo} />
            ) : (
              <Text style={[styles.companyName, { color: brand.primaryColor }]}>
                {brand.companyName}
              </Text>
            )}
          </View>
          <View style={styles.headerRight}>
            {brand.address && <Text style={styles.companyMeta}>{brand.address}</Text>}
            {brand.contactEmail && <Text style={styles.companyMeta}>{brand.contactEmail}</Text>}
            {brand.phone && <Text style={styles.companyMeta}>{brand.phone}</Text>}
            {brand.website && <Text style={styles.companyMeta}>{brand.website}</Text>}
          </View>
        </View>

        {/* ─── INVOICE Title Stamp ────────────────────────────────────────────── */}
        <View style={styles.titleContainer}>
          <Text style={styles.invoiceTitle}>INVOICE</Text>
        </View>

        {/* ─── Client Info vs Invoice Info Banner ──────────────────────────────── */}
        <View style={styles.billToGrid}>
          <View style={styles.billToLeft}>
            <Text style={styles.billToLabel}>Invoice to:</Text>
            <Text style={styles.billToName}>{invoice.clientName}</Text>
            {invoice.clientAddress && <Text style={styles.billToMeta}>{invoice.clientAddress}</Text>}
            {invoice.clientEmail && <Text style={styles.billToMeta}>{invoice.clientEmail}</Text>}
            {invoice.clientGst && <Text style={styles.billToMeta}>GSTIN: {invoice.clientGst}</Text>}
          </View>

          <View style={styles.metadataContainer}>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Invoice No:</Text>
              <Text style={styles.metaValue}>{invoice.invoiceNumber}</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Invoice Date:</Text>
              <Text style={styles.metaValue}>
                {new Date(invoice.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
              </Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Due Date:</Text>
              <Text style={styles.metaValue}>
                {new Date(invoice.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
              </Text>
            </View>

            {/* Solid Brand Banner */}
            <View style={[styles.totalDueBanner, { backgroundColor: brand.primaryColor }]}>
              <Text style={styles.bannerLabel}>Total Due:</Text>
              <Text style={styles.bannerValue}>{fmt(invoice.totalAmount, invoice.currency)}</Text>
            </View>
          </View>
        </View>

        {/* ─── Items Table ────────────────────────────────────────────────────── */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, styles.colDesc]}>Item description</Text>
            <Text style={[styles.tableHeaderCell, styles.colQty]}>Quantity</Text>
            <Text style={[styles.tableHeaderCell, styles.colRate]}>Unit price</Text>
            <Text style={[styles.tableHeaderCell, styles.colTotal]}>Total</Text>
          </View>
          
          {invoice.items.map((item, i) => (
            <View key={i} style={[styles.tableRow, i % 2 === 1 ? styles.tableRowEven : styles.tableRowOdd]}>
              <Text style={[styles.tableCell, styles.colDesc]}>
                {cleanDocumentText(item.description)}
              </Text>
              <Text style={[styles.tableCell, styles.colQty]}>{item.quantity}</Text>
              <Text style={[styles.tableCell, styles.colRate]}>{fmt(item.unitPrice, invoice.currency)}</Text>
              <Text style={[styles.tableCell, styles.colTotal]}>{fmt(item.total, invoice.currency)}</Text>
            </View>
          ))}
        </View>

        {/* ─── Bottom Grid (Payment Info / Terms vs Summary / Signatory) ──────── */}
        <View style={styles.bottomGrid} wrap={false}>
          {/* Left Column: Terms + Payment Info */}
          <View style={styles.bottomLeft}>
            {invoice.notes && (
              <>
                <Text style={styles.termsLabel}>Terms:</Text>
                <Text style={styles.termsValue}>{cleanDocumentText(invoice.notes)}</Text>
              </>
            )}

            {/* Bank and UPI Details Block */}
            {brand.bankName && brand.accountNumber && (
              <View style={styles.paymentBox}>
                <Text style={styles.paymentLabel}>Payment Information</Text>
                <View style={styles.paymentRow}>
                  <Text style={styles.paymentRowLabel}>Bank Name:</Text>
                  <Text style={styles.paymentRowValue}>{brand.bankName}</Text>
                </View>
                {brand.accountName && (
                  <View style={styles.paymentRow}>
                    <Text style={styles.paymentRowLabel}>Account Name:</Text>
                    <Text style={styles.paymentRowValue}>{brand.accountName}</Text>
                  </View>
                )}
                <View style={styles.paymentRow}>
                  <Text style={styles.paymentRowLabel}>Account No:</Text>
                  <Text style={styles.paymentRowValue}>{brand.accountNumber}</Text>
                </View>
                {brand.ifscCode && (
                  <View style={styles.paymentRow}>
                    <Text style={styles.paymentRowLabel}>IFSC Code:</Text>
                    <Text style={styles.paymentRowValue}>{brand.ifscCode}</Text>
                  </View>
                )}
                {brand.upiId && (
                  <View style={styles.paymentRow}>
                    <Text style={styles.paymentRowLabel}>UPI ID:</Text>
                    <Text style={styles.paymentRowValue}>{brand.upiId}</Text>
                  </View>
                )}
              </View>
            )}
          </View>

          {/* Right Column: Summaries + Signatory */}
          <View style={styles.bottomRight}>
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

            {/* Total Highlight Banner */}
            <View style={[styles.bottomBanner, { backgroundColor: brand.primaryColor }]}>
              <Text style={styles.bottomBannerLabel}>Total Due:</Text>
              <Text style={styles.bottomBannerValue}>{fmt(invoice.totalAmount, invoice.currency)}</Text>
            </View>

            {/* Authorized Signatory Block */}
            <View style={styles.signatoryBlock}>
              <View style={styles.sigSpace} />
              <View style={styles.sigLine} />
              <Text style={styles.sigName}>Authorized Signatory</Text>
              <Text style={styles.sigRole}>{brand.companyName}</Text>
            </View>
          </View>
        </View>

        {/* Thank You Callout Message */}
        <Text style={[styles.calloutText, { color: brand.primaryColor }]} wrap={false}>
          Thank you for your business
        </Text>

        <DocFooter brand={brand} />
      </Page>
    </PDFDocument>
  );
};
