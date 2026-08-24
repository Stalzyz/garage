import React from 'react';
import { Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { PDFDocument, baseStyles, colors, sp } from './PDFDocument';
import { DocHeader, DocRepeatHeader, DocFooter } from './components';
import { BrandConfig } from '../../utils/brand';

const styles = StyleSheet.create({
  date: {
    fontSize: 9,
    color: colors.muted,
    marginBottom: sp['20'],
  },
  subject: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: colors.ink,
    textTransform: 'uppercase',
    letterSpacing: 1,
    textAlign: 'center',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderTopColor: colors.rule,
    borderBottomColor: colors.rule,
    paddingVertical: sp['8'],
    marginBottom: sp['20'],
  },
  paragraph: {
    fontSize: 9.5,
    color: colors.body,
    lineHeight: 1.7,
    marginBottom: sp['12'],
  },
  bold: {
    fontFamily: 'Helvetica-Bold',
    color: colors.ink,
  },
  sigSection: {
    marginTop: sp['40'],
  },
  sigBlock: { width: 220 },
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

export interface TemplateExperienceLetterProps {
  brand: BrandConfig;
  employeeName: string;
  positionTitle: string;
  startDate: string;
  endDate: string;
  issuedAt: string;
}

export const TemplateExperienceLetter: React.FC<TemplateExperienceLetterProps> = ({
  brand, employeeName, positionTitle, startDate, endDate, issuedAt,
}) => {
  const fmt = (d: string) =>
    new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <PDFDocument title={`Experience Letter — ${employeeName}`} author={brand.companyName}>
      <Page size="A4" style={baseStyles.page}>
        <DocRepeatHeader brand={brand} docType="EXPERIENCE LETTER" />
        <DocHeader brand={brand} title="EXPERIENCE LETTER" />

        <Text style={styles.date}>Date: {fmt(issuedAt)}</Text>

        <Text style={styles.subject}>To Whomsoever It May Concern</Text>

        <Text style={styles.paragraph}>
          This is to certify that <Text style={styles.bold}>{employeeName}</Text> was employed with <Text style={styles.bold}>{brand.companyName}</Text> as a <Text style={styles.bold}>{positionTitle}</Text>.
        </Text>

        <Text style={styles.paragraph}>
          Their tenure with our organization was from <Text style={styles.bold}>{fmt(startDate)}</Text> to <Text style={styles.bold}>{fmt(endDate)}</Text>.
        </Text>

        <Text style={styles.paragraph}>
          During their employment, <Text style={styles.bold}>{employeeName}</Text> demonstrated high professional standards, dedication, and reliability in executing their duties and responsibilities.
        </Text>

        <Text style={styles.paragraph}>
          We express our appreciation for their contributions and wish them every success in their future endeavors.
        </Text>

        <View style={styles.sigSection} wrap={false}>
          <View style={styles.sigBlock}>
            <View style={styles.sigSpace} />
            <View style={styles.sigLine} />
            <Text style={styles.sigName}>For {brand.companyName}</Text>
            <Text style={styles.sigRole}>Human Resources Department</Text>
          </View>
        </View>

        <DocFooter brand={brand} />
      </Page>
    </PDFDocument>
  );
};
