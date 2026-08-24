import React from 'react';
import { Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { PDFDocument, baseStyles } from './PDFDocument';
import { DocHeader, DocFooter } from './components';
import { BrandConfig } from '../../utils/brand';

const styles = StyleSheet.create({
  employeeBox: {
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 8,
    marginBottom: 30,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  label: {
    width: 100,
    fontSize: 9,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  value: {
    flex: 1,
    fontSize: 10,
    fontWeight: 'medium',
    color: '#0f172a',
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
  colDate: { flex: 1.5 },
  colCategory: { flex: 1.5 },
  colDesc: { flex: 3 },
  colAmount: { flex: 1.5, textAlign: 'right' },
  summaryBox: {
    alignSelf: 'flex-end',
    width: 250,
    padding: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: 'bold',
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

const formatCurrency = (amount: number, currency: string) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
};

export const TemplateExpenseReport: React.FC<TemplateExpenseReportProps> = ({ 
  brand, employeeName, department, reportId, status, submittedAt, currency, items
}) => {
  const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);

  return (
    <PDFDocument title={`Expense Report - ${reportId}`} author={brand.companyName}>
      <Page size="A4" style={baseStyles.page}>
        <DocHeader 
          brand={brand} 
          title="EXPENSE REPORT" 
          metadata={[
            { label: 'Report ID', value: reportId },
            { label: 'Date', value: new Date(submittedAt).toLocaleDateString() },
            { label: 'Status', value: status },
          ]}
        />

        <View style={styles.employeeBox}>
          <View style={styles.row}>
            <Text style={styles.label}>Employee:</Text>
            <Text style={styles.value}>{employeeName}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Department:</Text>
            <Text style={styles.value}>{department}</Text>
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, styles.colDate]}>Date</Text>
            <Text style={[styles.tableHeaderCell, styles.colCategory]}>Category</Text>
            <Text style={[styles.tableHeaderCell, styles.colDesc]}>Description</Text>
            <Text style={[styles.tableHeaderCell, styles.colAmount]}>Amount</Text>
          </View>

          {items.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.colDate]}>{new Date(item.date).toLocaleDateString()}</Text>
              <Text style={[styles.tableCell, styles.colCategory]}>{item.category}</Text>
              <Text style={[styles.tableCell, styles.colDesc]}>{item.description}</Text>
              <Text style={[styles.tableCell, styles.colAmount]}>{formatCurrency(item.amount, currency)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.summaryBox}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Expenses</Text>
            <Text style={[styles.summaryValue, { color: brand.primaryColor }]}>
              {formatCurrency(totalAmount, currency)}
            </Text>
          </View>
        </View>

        <DocFooter brand={brand} />
      </Page>
    </PDFDocument>
  );
};
