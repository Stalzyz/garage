import React from 'react';
import { Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { PDFDocument, baseStyles } from './PDFDocument';
import { DocHeader, DocFooter } from './components';
import { BrandConfig } from '../../utils/brand';

const styles = StyleSheet.create({
  content: {
    marginTop: 30,
    paddingHorizontal: 20,
  },
  date: {
    fontSize: 10,
    color: '#334155',
    marginBottom: 40,
  },
  subject: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 24,
    textDecoration: 'underline',
    textAlign: 'center',
  },
  paragraph: {
    fontSize: 10,
    color: '#334155',
    lineHeight: 1.8,
    marginBottom: 16,
  },
  bold: {
    fontWeight: 'bold',
    color: '#0f172a',
  },
  signatureSection: {
    marginTop: 60,
  },
  signatureBox: {
    width: 250,
  },
  signatureLine: {
    borderBottomWidth: 1,
    borderBottomColor: '#cbd5e1',
    marginBottom: 8,
  },
  signatureName: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  signatureTitle: {
    fontSize: 9,
    color: '#64748b',
  }
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
  brand, employeeName, positionTitle, startDate, endDate, issuedAt
}) => {
  return (
    <PDFDocument title={`Experience Letter - ${employeeName}`} author={brand.companyName}>
      <Page size="A4" style={baseStyles.page}>
        <DocHeader brand={brand} title="" />

        <View style={styles.content}>
          <Text style={styles.date}>Date: {new Date(issuedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</Text>
          
          <Text style={styles.subject}>TO WHOMSOEVER IT MAY CONCERN</Text>

          <Text style={styles.paragraph}>
            This is to certify that <Text style={styles.bold}>{employeeName}</Text> was employed with <Text style={styles.bold}>{brand.companyName}</Text> in the capacity of <Text style={styles.bold}>{positionTitle}</Text>.
          </Text>

          <Text style={styles.paragraph}>
            Their tenure with us was from <Text style={styles.bold}>{new Date(startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</Text> to <Text style={styles.bold}>{new Date(endDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</Text>.
          </Text>

          <Text style={styles.paragraph}>
            During their employment, we found them to be a dedicated, hardworking, and reliable professional. They exhibited a high level of commitment to their responsibilities and contributed significantly to the goals of our organization.
          </Text>

          <Text style={styles.paragraph}>
            We wish them the very best in all their future endeavors.
          </Text>

          <View style={styles.signatureSection} wrap={false}>
            <View style={styles.signatureBox}>
              <View style={[styles.signatureLine, { marginTop: 40 }]} />
              <Text style={styles.signatureName}>For {brand.companyName}</Text>
              <Text style={styles.signatureTitle}>Human Resources Department</Text>
            </View>
          </View>
        </View>

        <DocFooter brand={brand} />
      </Page>
    </PDFDocument>
  );
};
