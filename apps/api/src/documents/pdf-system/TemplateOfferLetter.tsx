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
    marginBottom: 24,
  },
  subject: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 24,
  },
  paragraph: {
    fontSize: 10,
    color: '#334155',
    lineHeight: 1.6,
    marginBottom: 16,
  },
  bold: {
    fontWeight: 'bold',
    color: '#0f172a',
  },
  detailsBox: {
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 8,
    marginVertical: 20,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  detailLabel: {
    width: 150,
    fontSize: 10,
    color: '#64748b',
  },
  detailValue: {
    flex: 1,
    fontSize: 10,
    fontWeight: 'medium',
    color: '#0f172a',
  },
  signatureSection: {
    marginTop: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  signatureBox: {
    width: 200,
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
  brand, candidateName, candidateAddress, positionTitle, department, startDate, salary, reportingTo, issuedAt
}) => {
  return (
    <PDFDocument title={`Offer Letter - ${candidateName}`} author={brand.companyName}>
      <Page size="A4" style={baseStyles.page}>
        <DocHeader brand={brand} title="OFFER OF EMPLOYMENT" />

        <View style={styles.content}>
          <Text style={styles.date}>{new Date(issuedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</Text>
          
          <View style={{ marginBottom: 24 }}>
            <Text style={styles.bold}>{candidateName}</Text>
            {candidateAddress && <Text style={styles.paragraph}>{candidateAddress}</Text>}
          </View>

          <Text style={styles.subject}>Subject: Offer of Employment - {positionTitle}</Text>

          <Text style={styles.paragraph}>
            Dear <Text style={styles.bold}>{candidateName}</Text>,
          </Text>

          <Text style={styles.paragraph}>
            We are pleased to offer you the position of <Text style={styles.bold}>{positionTitle}</Text> in the <Text style={styles.bold}>{department}</Text> department at {brand.companyName}. We believe that your skills and experience will be a valuable asset to our company.
          </Text>

          <View style={styles.detailsBox}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Position:</Text>
              <Text style={styles.detailValue}>{positionTitle}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Start Date:</Text>
              <Text style={styles.detailValue}>{new Date(startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Compensation:</Text>
              <Text style={styles.detailValue}>{salary}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Reporting To:</Text>
              <Text style={styles.detailValue}>{reportingTo}</Text>
            </View>
          </View>

          <Text style={styles.paragraph}>
            This offer is contingent upon the successful completion of our standard background check and verification of your references. You will be expected to adhere to all company policies and procedures outlined in the employee handbook.
          </Text>

          <Text style={styles.paragraph}>
            To accept this offer, please sign and return this letter by the date requested. We are excited to welcome you to the team and look forward to working with you!
          </Text>

          <View style={styles.signatureSection} wrap={false}>
            <View style={styles.signatureBox}>
              <View style={[styles.signatureLine, { marginTop: 40 }]} />
              <Text style={styles.signatureName}>{brand.companyName}</Text>
              <Text style={styles.signatureTitle}>Authorized Signatory</Text>
            </View>
            
            <View style={styles.signatureBox}>
              <View style={[styles.signatureLine, { marginTop: 40 }]} />
              <Text style={styles.signatureName}>{candidateName}</Text>
              <Text style={styles.signatureTitle}>Candidate Signature</Text>
            </View>
          </View>
        </View>

        <DocFooter brand={brand} />
      </Page>
    </PDFDocument>
  );
};
