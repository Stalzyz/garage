import React from 'react';
import { Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { PDFDocument, baseStyles, colors, sp } from './PDFDocument';
import { DocHeader, DocRepeatHeader, DocFooter } from './components';
import { BrandConfig } from '../../utils/brand';

const safeCurrency = (c: string) => c === '₹' ? 'Rs.' : c;

const fmt = (amount: number, currency: string) => {
  const n = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
  return `${safeCurrency(currency)} ${n}`;
};

const styles = StyleSheet.create({
  // Employee info grid
  infoGrid: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.rule,
    borderBottomWidth: 1,
    borderBottomColor: colors.rule,
    paddingVertical: sp['8'],
    marginBottom: sp['20'],
  },
  infoItem: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 7.5,
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 9.5,
    fontFamily: 'Helvetica-Bold',
    color: colors.ink,
  },

  // Table
  table: { width: '100%', marginBottom: sp['16'] },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1.5,
    borderBottomColor: colors.ink,
    paddingBottom: sp['6'],
    marginBottom: sp['4'],
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
    borderBottomWidth: 1,
    borderBottomColor: colors.rule,
    paddingVertical: sp['8'],
    minHeight: 24,
    alignItems: 'center',
  },
  tableRowAlt: {
    backgroundColor: colors.surface,
  },
  tableCell: {
    fontSize: 9,
    color: colors.body,
    lineHeight: 1.4,
  },
  colDate: { flex: 1.5 },
  colCategory: { flex: 1.5 },
  colDesc: { flex: 4 },
  colAmount: { flex: 2, textAlign: 'right' },

  // Summary Box
  summaryOuter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: sp['24'],
  },
  summaryInner: { width: 220 },
  totalRule: { borderTopWidth: 1.5, borderTopColor: colors.ink, marginVertical: sp['6'] },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 2 },
  totalLabel: { fontSize: 10.5, fontFamily: 'Helvetica-Bold', color: colors.ink },
  totalValue: { fontSize: 12, fontFamily: 'Helvetica-Bold' },

  // Approval section
  approvalTitle: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: colors.ink,
    textTransform: 'uppercase',
    letterSpacing: 1,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.rule,
    marginBottom: sp['16'],
  },
  sigRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sigBlock: { width: '45%' },
  sigSpace: { height: 36 },
  sigLine: {
    borderBottomWidth: 1,
    borderBottomColor: colors.ruleStrong,
    marginBottom: sp['6'],
  },
  sigName: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: colors.ink,
    marginBottom: 2,
  },
  sigRole: {
    fontSize: 8,
    color: colors.muted,
    textTransform: 'uppercase',
  },
});

export interface ExpenseItem {
  date: string;
  category: string;
  description: string;
  amount: number;
}

export interface TemplateExpenseReportProps {
  brand: BrandConfig;
  employeeName: string;
  department: string;
  reportId: string;
  status: string;
  submittedAt: string;
  currency: string;
  items: ExpenseItem[];
}

export const TemplateExpenseReport: React.FC<TemplateExpenseReportProps> = ({
  brand, employeeName, department, reportId, status, submittedAt, currency, items,
}) => {
  const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);

  return (
    <PDFDocument title={`Expense Report — ${reportId}`} author={brand.companyName}>
      <Page size="A4" style={baseStyles.page}>
        <DocRepeatHeader brand={brand} docType="EXPENSE REPORT" />
        <DocHeader
          brand={brand}
          title="EXPENSE REPORT"
          metadata={[
            { label: 'Report ID', value: reportId },
            { label: 'Date', value: new Date(submittedAt).toLocaleDateString('en-IN') },
            { label: 'Status', value: status.toUpperCase() },
          ]}
        />

        {/* Employee Info Grid */}
        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Submitted By</Text>
            <Text style={styles.infoValue}>{employeeName}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Department</Text>
            <Text style={styles.infoValue}>{department}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Total Items</Text>
            <Text style={styles.infoValue}>{items.length}</Text>
          </View>
        </View>

        {/* Items Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, styles.colDate]}>Date</Text>
            <Text style={[styles.tableHeaderCell, styles.colCategory]}>Category</Text>
            <Text style={[styles.tableHeaderCell, styles.colDesc]}>Description</Text>
            <Text style={[styles.tableHeaderCell, styles.colAmount]}>Amount</Text>
          </View>
          {items.map((item, i) => (
            <View key={i} style={[styles.tableRow, i % 2 === 1 ? styles.tableRowAlt : {}]}>
              <Text style={[styles.tableCell, styles.colDate]}>
                {new Date(item.date).toLocaleDateString('en-IN')}
              </Text>
              <Text style={[styles.tableCell, styles.colCategory]}>{item.category}</Text>
              <Text style={[styles.tableCell, styles.colDesc]}>{item.description}</Text>
              <Text style={[styles.tableCell, styles.colAmount]}>{fmt(item.amount, currency)}</Text>
            </View>
          ))}
        </View>

        {/* Total Summary */}
        <View style={styles.summaryOuter} wrap={false}>
          <View style={styles.summaryInner}>
            <View style={styles.totalRule} />
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total Expenses</Text>
              <Text style={[styles.totalValue, { color: brand.primaryColor }]}>
                {fmt(totalAmount, currency)}
              </Text>
            </View>
          </View>
        </View>

        {/* Approval Signatures */}
        <View wrap={false}>
          <Text style={styles.approvalTitle}>Approval</Text>
          <View style={styles.sigRow}>
            <View style={styles.sigBlock}>
              <View style={styles.sigSpace} />
              <View style={styles.sigLine} />
              <Text style={styles.sigName}>{employeeName}</Text>
              <Text style={styles.sigRole}>Employee Signature</Text>
            </View>
            <View style={styles.sigBlock}>
              <View style={styles.sigSpace} />
              <View style={styles.sigLine} />
              <Text style={styles.sigName}>Authorized Manager</Text>
              <Text style={styles.sigRole}>Manager Approval</Text>
            </View>
          </View>
        </View>

        <DocFooter brand={brand} />
      </Page>
    </PDFDocument>
  );
};
