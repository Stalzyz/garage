import React from 'react';
import { Page, View, Text, StyleSheet, Image } from '@react-pdf/renderer';
import { PDFDocument, baseStyles, colors, sp } from './PDFDocument';
import { DocFooter } from './components';
import { BrandConfig, resolveBrandLogo } from '../../utils/brand';
import { cleanDocumentText } from '../../utils/text';

const safeCurrency = (c: string) => c === '₹' ? 'Rs.' : c;

const fmt = (amount: number, currency: string) => {
  const n = new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount || 0);
  return `${safeCurrency(currency)} ${n}`;
};

const styles = StyleSheet.create({
  // ─── Header ──────────────────────────────────────────────────────────────
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: sp['16'],
    paddingBottom: sp['12'],
    borderBottomWidth: 1,
    borderBottomColor: colors.rule,
  },
  headerLeft: {
    flexDirection: 'column',
    maxWidth: '55%',
  },
  logo: {
    maxWidth: 200,
    maxHeight: 55,
    objectFit: 'contain',
    marginBottom: sp['6'],
  },
  companyName: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: colors.ink,
    marginBottom: 2,
  },
  tradeName: {
    fontSize: 8.5,
    fontFamily: 'Helvetica-Bold',
    color: colors.muted,
    marginBottom: 4,
  },
  supplierMeta: {
    fontSize: 8,
    color: colors.body,
    lineHeight: 1.35,
  },
  headerRight: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    maxWidth: '42%',
  },
  documentBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginBottom: 6,
  },
  documentBadgeText: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: colors.white,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  invoiceTitle: {
    fontSize: 22,
    fontFamily: 'Helvetica-Bold',
    color: colors.ink,
    letterSpacing: 1,
    textTransform: 'uppercase',
    textAlign: 'right',
    marginBottom: 4,
  },
  headerMetaText: {
    fontSize: 8,
    color: colors.muted,
    lineHeight: 1.4,
    textAlign: 'right',
  },

  // ─── Meta & Bill-To Grid ──────────────────────────────────────────────────
  gridContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: sp['16'],
    backgroundColor: '#f8fafc',
    borderRadius: 6,
    padding: sp['12'],
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  gridColLeft: {
    flex: 1.1,
    paddingRight: sp['12'],
  },
  gridColRight: {
    flex: 0.9,
    alignItems: 'flex-end',
  },
  sectionHeading: {
    fontSize: 8.5,
    fontFamily: 'Helvetica-Bold',
    color: colors.ink,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  clientName: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: colors.ink,
    marginBottom: 3,
  },
  clientMeta: {
    fontSize: 8,
    color: colors.body,
    lineHeight: 1.35,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 3,
  },
  metaLabel: {
    fontSize: 8,
    color: colors.muted,
    marginRight: 6,
    textAlign: 'right',
  },
  metaValue: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: colors.ink,
    textAlign: 'right',
  },

  // ─── Table ────────────────────────────────────────────────────────────────
  table: {
    width: '100%',
    marginBottom: sp['16'],
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#0f172a',
    paddingVertical: 6,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  tableHeaderCell: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: colors.white,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    alignItems: 'center',
  },
  tableRowEven: {
    backgroundColor: '#ffffff',
  },
  tableRowOdd: {
    backgroundColor: '#f8fafc',
  },
  tableCell: {
    fontSize: 8,
    color: colors.ink,
  },
  colNum: { width: '6%', textAlign: 'center' },
  colDesc: { width: '44%', paddingRight: 6 },
  colSac: { width: '14%', textAlign: 'center' },
  colQty: { width: '8%', textAlign: 'center' },
  colRate: { width: '14%', textAlign: 'right' },
  colTotal: { width: '14%', textAlign: 'right', fontFamily: 'Helvetica-Bold' },

  // ─── Bottom Sections ──────────────────────────────────────────────────────
  bottomGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: sp['16'],
  },
  bottomLeft: {
    width: '54%',
    paddingRight: sp['12'],
  },
  bottomRight: {
    width: '42%',
  },

  // Payment Box
  boxContainer: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 6,
    padding: sp['10'],
    marginBottom: sp['10'],
  },
  boxHeading: {
    fontSize: 8.5,
    fontFamily: 'Helvetica-Bold',
    color: colors.ink,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 5,
  },
  boxRow: {
    flexDirection: 'row',
    marginBottom: 2.5,
  },
  boxLabel: {
    fontSize: 7.5,
    color: colors.muted,
    width: 75,
  },
  boxValue: {
    fontSize: 7.5,
    fontFamily: 'Helvetica-Bold',
    color: colors.ink,
    flex: 1,
  },

  // Terms Box
  termsHeading: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: colors.ink,
    textTransform: 'uppercase',
    marginBottom: 3,
  },
  termsText: {
    fontSize: 7.5,
    color: colors.body,
    lineHeight: 1.35,
    marginBottom: 3,
  },
  exemptionNotice: {
    fontSize: 7.5,
    color: '#047857',
    fontFamily: 'Helvetica-Oblique',
    lineHeight: 1.3,
    backgroundColor: '#ecfdf5',
    padding: 4,
    borderRadius: 3,
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#a7f3d0',
  },

  // Summary Rows
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2.5,
  },
  summaryLabel: {
    fontSize: 8,
    color: colors.muted,
  },
  summaryValue: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: colors.ink,
  },
  totalBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 4,
    marginTop: 6,
  },
  totalBannerLabel: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: colors.white,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  totalBannerValue: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: colors.white,
  },

  // Signatory
  signatoryBlock: {
    marginTop: sp['20'],
    alignItems: 'flex-end',
  },
  sigSpace: {
    height: 24,
  },
  sigLine: {
    width: 130,
    borderBottomWidth: 1,
    borderBottomColor: '#94a3b8',
    marginBottom: 3,
  },
  sigName: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: colors.ink,
  },
  sigRole: {
    fontSize: 7,
    color: colors.muted,
    textTransform: 'uppercase',
  },

  // E-Invoice Strip
  eInvoiceStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f1f5f9',
    borderRadius: 4,
    padding: 6,
    marginTop: sp['8'],
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  eInvoiceText: {
    fontSize: 7,
    color: '#475569',
    fontFamily: 'Helvetica-Bold',
  },
});

interface InvoiceItem {
  description: string;
  hsnCode?: string | null;
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
    clientAddress?: string | null;
    clientGst?: string | null;
    businessUnit?: 'AGENCY' | 'ACADEMY' | string;
    studentId?: string | null;
    courseName?: string | null;
    batchName?: string | null;
    academicYear?: string | null;
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
    irn?: string | null;
    ackNo?: string | null;
    ackDate?: string | null;
    items: InvoiceItem[];
  };
}

export const TemplateInvoice: React.FC<TemplateInvoiceProps> = ({ brand, invoice }) => {
  const isAcademy = invoice.businessUnit === 'ACADEMY';
  const balanceDue = Math.max(0, invoice.totalAmount - invoice.paidAmount);
  const resolvedLogo = resolveBrandLogo(brand.logoUrl);

  const documentTitle = isAcademy ? 'TAX INVOICE / FEE RECEIPT' : 'TAX INVOICE';
  const primaryThemeColor = isAcademy ? '#4f46e5' : (brand.primaryColor || '#0f172a');
  const defaultSac = isAcademy ? '999293' : '998314';

  return (
    <PDFDocument title={`${documentTitle} - ${invoice.invoiceNumber}`} author={brand.companyName}>
      <Page size="A4" style={baseStyles.page}>
        
        {/* ─── 1. SUPPLIER & DOCUMENT HEADER ───────────────────────────────── */}
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            {resolvedLogo ? (
              <Image src={resolvedLogo} style={styles.logo} />
            ) : (
              <Text style={[styles.companyName, { color: primaryThemeColor }]}>
                {brand.companyName}
              </Text>
            )}
            {brand.tradeName && <Text style={styles.tradeName}>{brand.tradeName}</Text>}
            <Text style={styles.supplierMeta}>
              {brand.address || 'Chennai, Tamil Nadu, India'}
            </Text>
            {brand.gstin && (
              <Text style={styles.supplierMeta}>
                <Text style={{ fontFamily: 'Helvetica-Bold' }}>GSTIN: </Text>{brand.gstin}
                {brand.pan && <Text> | <Text style={{ fontFamily: 'Helvetica-Bold' }}>PAN: </Text>{brand.pan}</Text>}
              </Text>
            )}
            <Text style={styles.supplierMeta}>
              {brand.contactEmail && `${brand.contactEmail} `}
              {brand.phone && `| ${brand.phone} `}
              {brand.website && `| ${brand.website}`}
            </Text>
          </View>

          <View style={styles.headerRight}>
            <View style={[styles.documentBadge, { backgroundColor: primaryThemeColor }]}>
              <Text style={styles.documentBadgeText}>{documentTitle}</Text>
            </View>
            <Text style={styles.headerMetaText}>
              <Text style={{ fontFamily: 'Helvetica-Bold' }}>Invoice No: </Text>{invoice.invoiceNumber}
            </Text>
            <Text style={styles.headerMetaText}>
              <Text style={{ fontFamily: 'Helvetica-Bold' }}>Date: </Text>
              {new Date(invoice.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
            </Text>
            <Text style={styles.headerMetaText}>
              <Text style={{ fontFamily: 'Helvetica-Bold' }}>Place of Supply: </Text>
              {brand.placeOfSupply || 'Tamil Nadu (33)'}
            </Text>
          </View>
        </View>

        {/* ─── 2. RECIPIENT & INVOICE METADATA GRID ────────────────────────── */}
        <View style={styles.gridContainer}>
          {isAcademy ? (
            /* 🎓 ACADEMY STUDENT DETAILS BLOCK */
            <View style={styles.gridColLeft}>
              <Text style={styles.sectionHeading}>Student Particulars</Text>
              <Text style={styles.clientName}>{invoice.clientName}</Text>
              {invoice.studentId && (
                <Text style={styles.clientMeta}>
                  <Text style={{ fontFamily: 'Helvetica-Bold' }}>Student ID: </Text>{invoice.studentId}
                </Text>
              )}
              {invoice.courseName && (
                <Text style={styles.clientMeta}>
                  <Text style={{ fontFamily: 'Helvetica-Bold' }}>Program: </Text>{invoice.courseName}
                </Text>
              )}
              {invoice.batchName && (
                <Text style={styles.clientMeta}>
                  <Text style={{ fontFamily: 'Helvetica-Bold' }}>Batch: </Text>{invoice.batchName}
                </Text>
              )}
              <Text style={styles.clientMeta}>
                <Text style={{ fontFamily: 'Helvetica-Bold' }}>Academic Year: </Text>
                {invoice.academicYear || '2026–2027'}
              </Text>
              {invoice.clientEmail && <Text style={styles.clientMeta}>{invoice.clientEmail}</Text>}
            </View>
          ) : (
            /* 🏢 DIGITAL AGENCY BILL TO BLOCK */
            <View style={styles.gridColLeft}>
              <Text style={styles.sectionHeading}>Billed To (Customer Details)</Text>
              <Text style={styles.clientName}>{invoice.clientName}</Text>
              {invoice.clientAddress && <Text style={styles.clientMeta}>{invoice.clientAddress}</Text>}
              {invoice.clientGst && (
                <Text style={styles.clientMeta}>
                  <Text style={{ fontFamily: 'Helvetica-Bold' }}>GSTIN: </Text>{invoice.clientGst}
                </Text>
              )}
              {invoice.clientEmail && <Text style={styles.clientMeta}>{invoice.clientEmail}</Text>}
            </View>
          )}

          <View style={styles.gridColRight}>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Payment Terms:</Text>
              <Text style={styles.metaValue}>Due on Receipt / 7 Days</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Due Date:</Text>
              <Text style={styles.metaValue}>
                {new Date(invoice.dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
              </Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Status:</Text>
              <Text style={[styles.metaValue, { color: invoice.status === 'PAID' ? (brand.grekamGreen || '#2DA16D') : (brand.visualsOrange || '#E1992D') }]}>
                {invoice.status.replace(/_/g, ' ')}
              </Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Reverse Charge:</Text>
              <Text style={styles.metaValue}>No</Text>
            </View>
          </View>
        </View>

        {/* ─── 3. GST LINE ITEMS TABLE ─────────────────────────────────────── */}
        <View style={styles.table}>
          <View style={[styles.tableHeader, { backgroundColor: primaryThemeColor }]}>
            <Text style={[styles.tableHeaderCell, styles.colNum]}>#</Text>
            <Text style={[styles.tableHeaderCell, styles.colDesc]}>
              {isAcademy ? 'Fee Particulars & Curriculum' : 'Service Description'}
            </Text>
            <Text style={[styles.tableHeaderCell, styles.colSac]}>SAC / HSN</Text>
            <Text style={[styles.tableHeaderCell, styles.colQty]}>Qty</Text>
            <Text style={[styles.tableHeaderCell, styles.colRate]}>Rate ({invoice.currency})</Text>
            <Text style={[styles.tableHeaderCell, styles.colTotal]}>Amount ({invoice.currency})</Text>
          </View>
          
          {invoice.items.map((item, i) => (
            <View key={i} style={[styles.tableRow, i % 2 === 1 ? styles.tableRowEven : styles.tableRowOdd]}>
              <Text style={[styles.tableCell, styles.colNum]}>{String(i + 1).padStart(2, '0')}</Text>
              <Text style={[styles.tableCell, styles.colDesc]}>
                {cleanDocumentText(item.description)}
              </Text>
              <Text style={[styles.tableCell, styles.colSac]}>{item.hsnCode || defaultSac}</Text>
              <Text style={[styles.tableCell, styles.colQty]}>{item.quantity}</Text>
              <Text style={[styles.tableCell, styles.colRate]}>{fmt(item.unitPrice, invoice.currency)}</Text>
              <Text style={[styles.tableCell, styles.colTotal]}>{fmt(item.total, invoice.currency)}</Text>
            </View>
          ))}
        </View>

        {/* ─── 4. BOTTOM GRID: BANK/TERMS VS GST TOTALS & SIGNATURE ────────── */}
        <View style={styles.bottomGrid} wrap={false}>
          
          {/* Left Column: Bank Details, Terms, and Regulatory Notes */}
          <View style={styles.bottomLeft}>
            {/* Bank & UPI Information */}
            {brand.bankName && brand.accountNumber && (
              <View style={styles.boxContainer}>
                <Text style={[styles.boxHeading, { color: primaryThemeColor }]}>Bank &amp; UPI Payment Details</Text>
                <View style={styles.boxRow}>
                  <Text style={styles.boxLabel}>Bank Name:</Text>
                  <Text style={styles.boxValue}>{brand.bankName}</Text>
                </View>
                {brand.accountName && (
                  <View style={styles.boxRow}>
                    <Text style={styles.boxLabel}>Account Name:</Text>
                    <Text style={styles.boxValue}>{brand.accountName}</Text>
                  </View>
                )}
                <View style={styles.boxRow}>
                  <Text style={styles.boxLabel}>Account No:</Text>
                  <Text style={styles.boxValue}>{brand.accountNumber}</Text>
                </View>
                {brand.ifscCode && (
                  <View style={styles.boxRow}>
                    <Text style={styles.boxLabel}>IFSC Code:</Text>
                    <Text style={styles.boxValue}>{brand.ifscCode}</Text>
                  </View>
                )}
                {brand.upiId && (
                  <View style={styles.boxRow}>
                    <Text style={styles.boxLabel}>UPI ID:</Text>
                    <Text style={styles.boxValue}>{brand.upiId}</Text>
                  </View>
                )}
              </View>
            )}

            {/* Terms & Conditions Block */}
            <View>
              <Text style={[styles.termsHeading, { color: primaryThemeColor }]}>Terms &amp; Conditions</Text>
              {isAcademy ? (
                <>
                  <Text style={styles.termsText}>• Fees once paid are non-refundable and non-transferable under any circumstances.</Text>
                  <Text style={styles.termsText}>• Minimum 85% attendance and sprint project completion required for official certification.</Text>
                  <Text style={styles.termsText}>• All study material, code vaults, and LMS access are proprietary to Grekam Academy.</Text>
                  {invoice.cgst === 0 && invoice.sgst === 0 && invoice.igst === 0 && (
                    <Text style={styles.exemptionNotice}>
                      * Educational training services may qualify under GST Notification No. 12/2017-Central Tax (Rate) subject to statutory criteria.
                    </Text>
                  )}
                </>
              ) : (
                <>
                  <Text style={styles.termsText}>• Payment is due as per the payment terms mentioned on the invoice.</Text>
                  <Text style={styles.termsText}>• Services delivered according to approved technical milestone specification.</Text>
                  <Text style={styles.termsText}>• Third-party subscriptions, cloud hosting, domains, WhatsApp API fees, and advertising spend are billed separately.</Text>
                  <Text style={styles.termsText}>• Taxes are applicable as per prevailing statutory Indian GST regulations.</Text>
                </>
              )}
              {invoice.notes && (
                <Text style={[styles.termsText, { marginTop: 4, fontFamily: 'Helvetica-Oblique' }]}>
                  Note: {cleanDocumentText(invoice.notes)}
                </Text>
              )}
            </View>
          </View>

          {/* Right Column: Tax Breakdown, Grand Total, Signatory */}
          <View style={styles.bottomRight}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Taxable Subtotal</Text>
              <Text style={styles.summaryValue}>{fmt(invoice.subtotal, invoice.currency)}</Text>
            </View>

            {invoice.discountRate && invoice.discountRate > 0 ? (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Discount ({invoice.discountRate}%)</Text>
                <Text style={[styles.summaryValue, { color: brand.grekamGreen || '#2DA16D' }]}>
                  -{fmt(invoice.subtotal * (invoice.discountRate / 100), invoice.currency)}
                </Text>
              </View>
            ) : null}

            {invoice.cgst > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>CGST @ 9.0%</Text>
                <Text style={styles.summaryValue}>{fmt(invoice.cgst, invoice.currency)}</Text>
              </View>
            )}

            {invoice.sgst > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>SGST @ 9.0%</Text>
                <Text style={styles.summaryValue}>{fmt(invoice.sgst, invoice.currency)}</Text>
              </View>
            )}

            {invoice.igst > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>IGST @ 18.0%</Text>
                <Text style={styles.summaryValue}>{fmt(invoice.igst, invoice.currency)}</Text>
              </View>
            )}

            {/* Total Highlight Banner */}
            <View style={[styles.totalBanner, { backgroundColor: primaryThemeColor }]}>
              <Text style={styles.totalBannerLabel}>Total Amount:</Text>
              <Text style={styles.totalBannerValue}>{fmt(invoice.totalAmount, invoice.currency)}</Text>
            </View>

            {invoice.paidAmount > 0 && (
              <View style={[styles.summaryRow, { marginTop: 4 }]}>
                <Text style={styles.summaryLabel}>Paid to Date:</Text>
                <Text style={[styles.summaryValue, { color: brand.grekamGreen || '#2DA16D' }]}>{fmt(invoice.paidAmount, invoice.currency)}</Text>
              </View>
            )}

            {balanceDue > 0 && (
              <View style={[styles.summaryRow, { borderTopWidth: 1, borderTopColor: '#cbd5e1', paddingTop: 2 }]}>
                <Text style={[styles.summaryLabel, { fontFamily: 'Helvetica-Bold', color: brand.visualsOrange || '#E1992D' }]}>Balance Due:</Text>
                <Text style={[styles.summaryValue, { color: brand.visualsOrange || '#E1992D' }]}>{fmt(balanceDue, invoice.currency)}</Text>
              </View>
            )}

            {/* Authorized Signatory Block */}
            <View style={styles.signatoryBlock}>
              <View style={styles.sigSpace} />
              <View style={styles.sigLine} />
              <Text style={styles.sigName}>
                {isAcademy ? 'Academic Registrar / Dean' : 'Authorized Signatory'}
              </Text>
              <Text style={styles.sigRole}>{brand.companyName}</Text>
            </View>
          </View>
        </View>

        {/* ─── 5. E-INVOICE / STATUTORY VERIFICATION FOOTER STRIP ────────────── */}
        <View style={styles.eInvoiceStrip}>
          <Text style={styles.eInvoiceText}>
            IRN: {invoice.irn || 'e-Invoice generation registered on CBIC portal'}
          </Text>
          <Text style={styles.eInvoiceText}>
            Digitally Authenticated by {brand.companyName}
          </Text>
        </View>

        <DocFooter brand={brand} />
      </Page>
    </PDFDocument>
  );
};
