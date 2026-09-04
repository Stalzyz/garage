import React from 'react';
import { Page, View, Text, StyleSheet, Image } from '@react-pdf/renderer';
import { PDFDocument, baseStyles, colors, sp } from './PDFDocument';
import { DocFooter } from './components';
import { BrandConfig, resolveBrandLogo } from '../../utils/brand';
import { cleanDocumentText, numberToWordsIN } from '../../utils/text';

const safeCurrency = (c: string) => c === '₹' ? 'Rs.' : c;

const fmt = (amount: number, currency: string = 'INR') => {
  const n = new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount || 0);
  return `${n}`;
};

const BRAND_DARK_GREEN = '#064e3b';
const BRAND_EMERALD = '#055740';
const MINT_BG = '#f0fdf4';
const MINT_BORDER = '#dcfce7';
const MINT_TEXT = '#15803d';

const styles = StyleSheet.create({
  // ─── Header ──────────────────────────────────────────────────────────────
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: sp['16'],
  },
  headerLeft: {
    flexDirection: 'column',
    maxWidth: '52%',
  },
  logo: {
    maxWidth: 220,
    maxHeight: 50,
    objectFit: 'contain',
    marginBottom: sp['4'],
  },
  tagline: {
    fontSize: 7.5,
    color: '#64748b',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: sp['8'],
  },
  companyName: {
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    color: '#0f172a',
    marginBottom: 2,
  },
  supplierMeta: {
    fontSize: 8.5,
    color: '#475569',
    lineHeight: 1.35,
  },
  headerRight: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    maxWidth: '45%',
  },
  invoiceTitle: {
    fontSize: 24,
    fontFamily: 'Helvetica-Bold',
    color: BRAND_DARK_GREEN,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: sp['8'],
  },
  metaTable: {
    width: '100%',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 3,
    alignItems: 'center',
  },
  metaLabel: {
    fontSize: 8.5,
    color: '#64748b',
    marginRight: 6,
    textAlign: 'right',
  },
  metaValue: {
    fontSize: 8.5,
    fontFamily: 'Helvetica-Bold',
    color: '#0f172a',
    textAlign: 'right',
  },
  statusBadge: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  statusBadgeText: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: MINT_TEXT,
  },

  // ─── 2-Column Mint Cards ──────────────────────────────────────────────────
  gridContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: sp['16'],
  },
  mintCard: {
    flex: 0.485,
    backgroundColor: MINT_BG,
    borderWidth: 1,
    borderColor: MINT_BORDER,
    borderRadius: 8,
    padding: sp['12'],
  },
  cardTitle: {
    fontSize: 9.5,
    fontFamily: 'Helvetica-Bold',
    color: BRAND_DARK_GREEN,
    marginBottom: sp['4'],
  },
  cardHeadingText: {
    fontSize: 10.5,
    fontFamily: 'Helvetica-Bold',
    color: '#0f172a',
    marginBottom: sp['4'],
  },
  cardBodyText: {
    fontSize: 8.5,
    color: '#334155',
    lineHeight: 1.4,
  },

  // ─── Table ────────────────────────────────────────────────────────────────
  table: {
    width: '100%',
    marginBottom: sp['12'],
    borderRadius: 6,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: BRAND_EMERALD,
    paddingVertical: 7,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  tableHeaderCell: {
    fontSize: 8.5,
    fontFamily: 'Helvetica-Bold',
    color: colors.white,
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 7,
    paddingHorizontal: 8,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    alignItems: 'center',
  },
  tableRowEven: {
    backgroundColor: '#ffffff',
  },
  tableRowOdd: {
    backgroundColor: '#fafafa',
  },
  tableCell: {
    fontSize: 8.5,
    color: '#1e293b',
  },
  colNum: { width: '6%', textAlign: 'center' },
  colDesc: { width: '42%', paddingRight: 6 },
  colSac: { width: '14%', textAlign: 'center' },
  colQty: { width: '8%', textAlign: 'center' },
  colRate: { width: '15%', textAlign: 'right' },
  colTotal: { width: '15%', textAlign: 'right', fontFamily: 'Helvetica-Bold' },

  itemTitle: {
    fontSize: 8.5,
    fontFamily: 'Helvetica-Bold',
    color: '#0f172a',
  },
  itemSub: {
    fontSize: 7.5,
    color: '#64748b',
    marginTop: 1,
  },

  // ─── Bottom Section Grid ──────────────────────────────────────────────────
  bottomGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: sp['16'],
  },
  bottomLeft: {
    width: '52%',
    paddingRight: sp['8'],
  },
  wordsCard: {
    backgroundColor: MINT_BG,
    borderWidth: 1,
    borderColor: MINT_BORDER,
    borderRadius: 6,
    padding: sp['8'],
    marginBottom: sp['12'],
  },
  wordsLabel: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: BRAND_DARK_GREEN,
    marginBottom: 2,
  },
  wordsText: {
    fontSize: 8.5,
    fontFamily: 'Helvetica-Bold',
    color: '#0f172a',
  },

  bottomRight: {
    width: '45%',
  },
  summaryTable: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 6,
    overflow: 'hidden',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  summaryLabel: {
    fontSize: 8.5,
    color: '#475569',
  },
  summaryValue: {
    fontSize: 8.5,
    fontFamily: 'Helvetica-Bold',
    color: '#0f172a',
    textAlign: 'right',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: MINT_BG,
    paddingVertical: 7,
    paddingHorizontal: 8,
    borderTopWidth: 1,
    borderTopColor: MINT_BORDER,
  },
  totalLabel: {
    fontSize: 9.5,
    fontFamily: 'Helvetica-Bold',
    color: BRAND_DARK_GREEN,
  },
  totalValue: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: BRAND_DARK_GREEN,
  },

  // ─── Notes & Signatory ────────────────────────────────────────────────────
  notesSignatoryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: sp['8'],
    marginBottom: sp['12'],
  },
  notesCol: {
    width: '58%',
  },
  notesHeading: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#0f172a',
    marginBottom: 4,
  },
  noteItem: {
    fontSize: 7.5,
    color: '#475569',
    lineHeight: 1.35,
    marginBottom: 2,
  },
  sigCol: {
    width: '38%',
    alignItems: 'center',
  },
  sigFor: {
    fontSize: 8.5,
    fontFamily: 'Helvetica-Bold',
    color: '#0f172a',
    marginBottom: 16,
    textAlign: 'center',
  },
  sigLine: {
    width: 120,
    height: 1,
    backgroundColor: '#cbd5e1',
    marginBottom: 4,
  },
  sigRole: {
    fontSize: 8,
    color: '#64748b',
    textAlign: 'center',
  },

  // ─── Footer Bar ───────────────────────────────────────────────────────────
  footerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginTop: 'auto',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  footerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BRAND_EMERALD,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    marginRight: 6,
  },
  footerPillText: {
    fontSize: 7.5,
    fontFamily: 'Helvetica-Bold',
    color: colors.white,
  },
  footerSocials: {
    fontSize: 7.5,
    color: '#64748b',
  },
});

export interface TemplateInvoiceProps {
  invoice: any;
  brand: BrandConfig;
}

export const TemplateInvoice: React.FC<TemplateInvoiceProps> = ({ invoice, brand }) => {
  const isAcademy = invoice.businessUnit === 'ACADEMY';
  const logo = resolveBrandLogo(brand.logoUrl, isAcademy ? 'academy-logo.png' : 'visuals-logo.png');

  const formattedDate = invoice.createdAt ? new Date(invoice.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '';
  const formattedDueDate = invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '';

  const wordsAmount = numberToWordsIN(invoice.totalAmount || 0);

  return (
    <PDFDocument title={`${invoice.isProforma ? 'Proforma Invoice' : 'Tax Invoice'} ${invoice.invoiceNumber}`}>
      <Page size="A4" style={baseStyles.page}>
        
        {/* ─── 1. TOP HEADER STRIP ────────────────────────────────────────────── */}
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            {logo ? (
              <Image src={logo} style={styles.logo} />
            ) : (
              <Text style={styles.companyName}>{brand.companyName}</Text>
            )}
            <Text style={styles.tagline}>Ideas · Design · Digital Growth</Text>
            
            <Text style={styles.companyName}>{brand.companyName}</Text>
            <Text style={styles.supplierMeta}>{brand.address || 'Coimbatore, Tamil Nadu, India - 641024'}</Text>
            {brand.gstin && <Text style={styles.supplierMeta}>GSTIN : {brand.gstin}</Text>}
            {brand.pan && <Text style={styles.supplierMeta}>PAN : {brand.pan}</Text>}
          </View>

          <View style={styles.headerRight}>
            <Text style={styles.invoiceTitle}>
              {invoice.isProforma ? 'PROFORMA INVOICE' : 'TAX INVOICE'}
            </Text>

            <View style={styles.metaTable}>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Invoice No.</Text>
                <Text style={styles.metaLabel}>:</Text>
                <Text style={styles.metaValue}>{invoice.invoiceNumber}</Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Invoice Date</Text>
                <Text style={styles.metaLabel}>:</Text>
                <Text style={styles.metaValue}>{formattedDate}</Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Due Date</Text>
                <Text style={styles.metaLabel}>:</Text>
                <Text style={styles.metaValue}>{formattedDueDate}</Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Payment Status</Text>
                <Text style={styles.metaLabel}>:</Text>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusBadgeText}>
                    {invoice.status === 'PAID' ? 'Paid' : invoice.status === 'OVERDUE' ? 'Overdue' : 'Pending'}
                  </Text>
                </View>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Place of Supply</Text>
                <Text style={styles.metaLabel}>:</Text>
                <Text style={styles.metaValue}>{brand.placeOfSupply || 'Tamil Nadu (33)'}</Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Reverse Charge</Text>
                <Text style={styles.metaLabel}>:</Text>
                <Text style={styles.metaValue}>No</Text>
              </View>
            </View>
          </View>
        </View>

        {/* ─── 2. MINT CARDS (BILL TO & THANK YOU) ──────────────────────────── */}
        <View style={styles.gridContainer}>
          {/* Bill To Card */}
          <View style={styles.mintCard}>
            <Text style={styles.cardTitle}>Bill To</Text>
            <Text style={styles.cardHeadingText}>{invoice.clientName || 'Valued Client'}</Text>
            {invoice.clientAddress && <Text style={styles.cardBodyText}>{cleanDocumentText(invoice.clientAddress)}</Text>}
            {invoice.clientGst && <Text style={styles.cardBodyText}>GSTIN : {invoice.clientGst}</Text>}
            <Text style={styles.cardBodyText}>State : Tamil Nadu (33)</Text>
          </View>

          {/* Greeting Card */}
          <View style={styles.mintCard}>
            <Text style={styles.cardHeadingText}>
              Thank you for choosing {brand.companyName}!
            </Text>
            <Text style={styles.cardBodyText}>
              Designing bold ideas for a brighter tomorrow.
            </Text>
          </View>
        </View>

        {/* ─── 3. LINE ITEMS TABLE ──────────────────────────────────────────── */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, styles.colNum]}>#</Text>
            <Text style={[styles.tableHeaderCell, styles.colDesc]}>Description</Text>
            <Text style={[styles.tableHeaderCell, styles.colSac]}>HSN/SAC</Text>
            <Text style={[styles.tableHeaderCell, styles.colQty]}>Qty</Text>
            <Text style={[styles.tableHeaderCell, styles.colRate]}>Unit Price (₹)</Text>
            <Text style={[styles.tableHeaderCell, styles.colTotal]}>Amount (₹)</Text>
          </View>

          {invoice.items?.map((item: any, idx: number) => (
            <View key={idx} style={[styles.tableRow, idx % 2 === 0 ? styles.tableRowEven : styles.tableRowOdd]}>
              <Text style={[styles.tableCell, styles.colNum]}>{idx + 1}</Text>
              <View style={styles.colDesc}>
                <Text style={styles.itemTitle}>{item.description}</Text>
              </View>
              <Text style={[styles.tableCell, styles.colSac]}>{item.hsnCode || '998313'}</Text>
              <Text style={[styles.tableCell, styles.colQty]}>{item.quantity}</Text>
              <Text style={[styles.tableCell, styles.colRate]}>{fmt(item.unitPrice)}</Text>
              <Text style={[styles.tableCell, styles.colTotal]}>{fmt(item.total)}</Text>
            </View>
          ))}
        </View>

        {/* ─── 4. BOTTOM TOTALS & WORDS SECTION ──────────────────────────────── */}
        <View style={styles.bottomGrid}>
          <View style={styles.bottomLeft}>
            <View style={styles.wordsCard}>
              <Text style={styles.wordsLabel}>Amount in Words</Text>
              <Text style={styles.wordsText}>{wordsAmount}</Text>
            </View>
          </View>

          <View style={styles.bottomRight}>
            <View style={styles.summaryTable}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal</Text>
                <Text style={styles.summaryValue}>₹ {fmt(invoice.subtotal)}</Text>
              </View>

              {invoice.cgst > 0 && (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>CGST @ 9%</Text>
                  <Text style={styles.summaryValue}>₹ {fmt(invoice.cgst)}</Text>
                </View>
              )}

              {invoice.sgst > 0 && (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>SGST @ 9%</Text>
                  <Text style={styles.summaryValue}>₹ {fmt(invoice.sgst)}</Text>
                </View>
              )}

              {invoice.igst > 0 && (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>IGST @ 18%</Text>
                  <Text style={styles.summaryValue}>₹ {fmt(invoice.igst)}</Text>
                </View>
              )}

              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total Amount (₹)</Text>
                <Text style={styles.totalValue}>₹ {fmt(invoice.totalAmount)}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* ─── 5. NOTES & AUTHORIZED SIGNATORY ──────────────────────────────── */}
        <View style={styles.notesSignatoryGrid}>
          <View style={styles.notesCol}>
            <Text style={styles.notesHeading}>Notes</Text>
            <Text style={styles.noteItem}>1. This is a computer generated invoice and does not require a signature.</Text>
            <Text style={styles.noteItem}>2. Services provided under {brand.companyName}.</Text>
            <Text style={styles.noteItem}>3. Payment once made is non-refundable.</Text>
            <Text style={styles.noteItem}>4. For any billing queries, contact {brand.contactEmail || 'support@grekam.in'}.</Text>
            <Text style={styles.noteItem}>5. Thank you for being a valued client!</Text>
          </View>

          <View style={styles.sigCol}>
            <Text style={styles.sigFor}>For {brand.companyName}</Text>
            <View style={styles.sigLine} />
            <Text style={styles.sigRole}>Authorized Signatory</Text>
          </View>
        </View>

        {/* ─── 6. FOOTER BAR ────────────────────────────────────────────────── */}
        <View style={styles.footerBar}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={styles.footerPill}>
              <Text style={styles.footerPillText}>{brand.phone || '+91 422 123 4567'}</Text>
            </View>
            <View style={styles.footerPill}>
              <Text style={styles.footerPillText}>{brand.contactEmail || 'support@grekam.in'}</Text>
            </View>
            <View style={styles.footerPill}>
              <Text style={styles.footerPillText}>{brand.website || 'agency.grekam.in'}</Text>
            </View>
          </View>

          <Text style={styles.footerSocials}>Design · Develop · Grow</Text>
        </View>

      </Page>
    </PDFDocument>
  );
};
