import React from 'react';
import { Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { PDFDocument, baseStyles, colors, sp } from './PDFDocument';
import { DocHeader, DocRepeatHeader, DocFooter } from './components';
import { BrandConfig } from '../../utils/brand';

const styles = StyleSheet.create({
  date: {
    fontSize: 9,
    color: colors.muted,
    marginBottom: sp['16'],
  },
  addressBlock: {
    marginBottom: sp['20'],
  },
  addressName: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: colors.ink,
    marginBottom: 2,
  },
  addressLine: {
    fontSize: 9,
    color: colors.body,
    lineHeight: 1.4,
  },
  subject: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: colors.ink,
    marginBottom: sp['16'],
  },
  paragraph: {
    fontSize: 9.5,
    color: colors.body,
    lineHeight: 1.6,
    marginBottom: sp['12'],
  },
  bold: {
    fontFamily: 'Helvetica-Bold',
    color: colors.ink,
  },

  // Detail grid
  detailGrid: {
    borderTopWidth: 1,
    borderTopColor: colors.rule,
    marginVertical: sp['16'],
  },
  detailRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.rule,
    paddingVertical: sp['8'],
  },
  detailLabel: {
    width: 140,
    fontSize: 8.5,
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailValue: {
    flex: 1,
    fontSize: 9.5,
    fontFamily: 'Helvetica-Bold',
    color: colors.ink,
  },

  // Signatures
  sigSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: sp['32'],
  },
  sigBlock: { width: '45%' },
  sigSpace: { height: 40 },
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

export interface TemplateOfferLetterProps {
  brand: BrandConfig;
  candidateName: string;
  candidateAddress?: string;
  positionTitle: string;
  department: string;
  startDate: string;
  salary: string;
  reportingTo: string;
  issuedAt: string;
}

export const TemplateOfferLetter: React.FC<TemplateOfferLetterProps> = ({
  brand, candidateName, candidateAddress, positionTitle, department, startDate, salary, reportingTo, issuedAt,
}) => (
  <PDFDocument title={`Offer Letter — ${candidateName}`} author={brand.companyName}>
    <Page size="A4" style={baseStyles.page}>
      <DocRepeatHeader brand={brand} docType="OFFER LETTER" />
      <DocHeader brand={brand} title="OFFER OF EMPLOYMENT" />

      <Text style={styles.date}>
        {new Date(issuedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
      </Text>

      <View style={styles.addressBlock}>
        <Text style={styles.addressName}>{candidateName}</Text>
        {candidateAddress && <Text style={styles.addressLine}>{candidateAddress}</Text>}
      </View>

      <Text style={styles.subject}>Subject: Offer of Employment — {positionTitle}</Text>

      <Text style={styles.paragraph}>
        Dear <Text style={styles.bold}>{candidateName}</Text>,
      </Text>

      <Text style={styles.paragraph}>
        We are pleased to extend an offer of employment for the position of <Text style={styles.bold}>{positionTitle}</Text> in the <Text style={styles.bold}>{department}</Text> department at <Text style={styles.bold}>{brand.companyName}</Text>. Following our recent interviews, we believe your background and skills will be a great addition to our organization.
      </Text>

      <View style={styles.detailGrid}>
        {[
          { label: 'Position', value: positionTitle },
          { label: 'Department', value: department },
          { label: 'Start Date', value: new Date(startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) },
          { label: 'Compensation', value: salary },
          { label: 'Reporting To', value: reportingTo },
        ].map(({ label, value }) => (
          <View key={label} style={styles.detailRow}>
            <Text style={styles.detailLabel}>{label}</Text>
            <Text style={styles.detailValue}>{value}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.paragraph}>
        This offer is contingent upon successful completion of background checks and verification of credentials. You will be expected to adhere to all standard organization policies.
      </Text>

      <Text style={styles.paragraph}>
        To accept this offer, please sign and return a copy of this letter. We look forward to welcoming you to the team!
      </Text>

      <View style={styles.sigSection} wrap={false}>
        <View style={styles.sigBlock}>
          <View style={styles.sigSpace} />
          <View style={styles.sigLine} />
          <Text style={styles.sigName}>{brand.companyName}</Text>
          <Text style={styles.sigRole}>Authorized Signatory</Text>
        </View>
        <View style={styles.sigBlock}>
          <View style={styles.sigSpace} />
          <View style={styles.sigLine} />
          <Text style={styles.sigName}>{candidateName}</Text>
          <Text style={styles.sigRole}>Candidate Acceptance</Text>
        </View>
      </View>

      <DocFooter brand={brand} />
    </Page>
  </PDFDocument>
);
