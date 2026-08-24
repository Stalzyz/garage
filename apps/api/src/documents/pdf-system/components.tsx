import React from 'react';
import { View, Text, Image, StyleSheet } from '@react-pdf/renderer';
import { BrandConfig } from '../../utils/brand';
import { baseStyles } from './PDFDocument';

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 40,
  },
  headerLeft: {
    flexDirection: 'column',
    maxWidth: '50%',
  },
  headerRight: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    maxWidth: '40%',
  },
  logo: {
    width: 140,
    height: 50,
    objectFit: 'contain',
    marginBottom: 16,
  },
  companyName: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#0f172a',
  },
  companyDetails: {
    fontSize: 9,
    color: '#64748b',
    lineHeight: 1.4,
  },
  documentTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0f172a',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  documentMeta: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 4,
  },
  metaLabel: {
    fontSize: 9,
    color: '#94a3b8',
    textTransform: 'uppercase',
    width: 70,
    textAlign: 'right',
    marginRight: 8,
  },
  metaValue: {
    fontSize: 9,
    fontWeight: 'medium',
    color: '#0f172a',
    width: 100,
    textAlign: 'right',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 16,
  },
  footerText: {
    fontSize: 8,
    color: '#94a3b8',
  },
  table: {
    width: '100%',
    marginTop: 20,
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  tableHeaderCell: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  tableCell: {
    fontSize: 9,
    color: '#334155',
  },
});

export const DocHeader = ({ brand, title, metadata }: { brand: BrandConfig; title: string; metadata?: Array<{label: string; value: string}> }) => (
  <View style={styles.header}>
    <View style={styles.headerLeft}>
      {brand.logoUrl ? (
        <Image src={brand.logoUrl} style={styles.logo} />
      ) : (
        <Text style={[styles.companyName, { color: brand.primaryColor }]}>{brand.companyName}</Text>
      )}
      {brand.address && <Text style={styles.companyDetails}>{brand.address}</Text>}
      {brand.phone && <Text style={styles.companyDetails}>{brand.phone}</Text>}
      {brand.contactEmail && <Text style={styles.companyDetails}>{brand.contactEmail}</Text>}
    </View>
    <View style={styles.headerRight}>
      <Text style={[styles.documentTitle, { color: brand.primaryColor }]}>{title}</Text>
      {metadata?.map((meta, i) => (
        <View key={i} style={styles.documentMeta}>
          <Text style={styles.metaLabel}>{meta.label}</Text>
          <Text style={styles.metaValue}>{meta.value}</Text>
        </View>
      ))}
    </View>
  </View>
);

export const DocFooter = ({ brand, pagination = true }: { brand: BrandConfig; pagination?: boolean }) => (
  <View style={styles.footer} fixed>
    <View style={{ flexDirection: 'row' }}>
      {brand.website && <Text style={[styles.footerText, { marginRight: 16 }]}>{brand.website}</Text>}
      {brand.contactEmail && <Text style={styles.footerText}>{brand.contactEmail}</Text>}
    </View>
    {pagination && (
      <Text style={styles.footerText} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
    )}
  </View>
);
