import React from 'react';
import { Page, View, Text, StyleSheet, Image } from '@react-pdf/renderer';
import { PDFDocument } from './PDFDocument';
import { BrandConfig } from '../../utils/brand';

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#fafaf9',
    padding: 30,
    fontFamily: 'Inter',
    color: '#1c1917',
  },
  container: {
    flex: 1,
    borderWidth: 6,
    borderStyle: 'solid',
    borderColor: '#e2e8f0', 
    padding: 24,
    backgroundColor: '#ffffff',
  },
  innerContainer: {
    flex: 1,
    width: '100%',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '#f1f5f9',
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    height: 80,
    objectFit: 'contain',
    marginBottom: 20,
  },
  academyName: {
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 10,
    color: '#64748b',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 40,
  },
  certTitle: {
    fontSize: 32,
    fontWeight: 'heavy',
    color: '#0f172a',
    letterSpacing: 4,
    textTransform: 'uppercase',
    marginBottom: 16,
  },
  presentText: {
    fontSize: 12,
    color: '#64748b',
    fontStyle: 'italic',
    marginBottom: 24,
  },
  studentName: {
    fontSize: 36,
    fontWeight: 'bold',
    marginVertical: 8,
  },
  nameUnderline: {
    width: '60%',
    height: 2,
    backgroundColor: '#f1f5f9',
    marginBottom: 24,
  },
  completionText: {
    fontSize: 12,
    color: '#334155',
    textAlign: 'center',
    width: '70%',
    lineHeight: 1.6,
    marginBottom: 16,
  },
  courseName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 40,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    marginTop: 40,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 24,
  },
  metaCol: {
    alignItems: 'center',
  },
  metaLabel: {
    fontSize: 9,
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
  },
  metaValue: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#334155',
  },
  signaturesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    marginTop: 40,
  },
  signatureBlock: {
    alignItems: 'center',
    width: 180,
  },
  sigLine: {
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: '#94a3b8',
    marginBottom: 8,
  },
  sigText: {
    fontSize: 10,
    color: '#64748b',
  },
  sigTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#334155',
    marginTop: 4,
  }
});

export interface TemplateCertificateProps {
  brand: BrandConfig;
  studentName: string;
  courseName: string;
  certificateId: string;
  grade?: string | null;
  issuedAt: string;
}

export const TemplateCertificate: React.FC<TemplateCertificateProps> = ({ 
  brand, studentName, courseName, certificateId, grade, issuedAt 
}) => (
  <PDFDocument title={`Certificate - ${studentName}`} author={brand.companyName}>
    <Page size="A4" orientation="landscape" style={styles.page}>
      <View style={[styles.container, { borderColor: brand.primaryColor }]}>
        <View style={styles.innerContainer}>
          
          {brand.logoUrl ? (
            <Image src={brand.logoUrl} style={styles.logo} />
          ) : (
            <Text style={[styles.academyName, { color: brand.primaryColor }]}>
              {brand.companyName}
            </Text>
          )}
          
          <Text style={styles.subtitle}>Innovate • Create • Elevate</Text>

          <Text style={styles.certTitle}>Certificate of Completion</Text>
          
          <Text style={styles.presentText}>This is proudly presented to</Text>
          
          <Text style={[styles.studentName, { color: brand.primaryColor }]}>
            {studentName}
          </Text>
          <View style={styles.nameUnderline} />

          <Text style={styles.completionText}>
            For successfully completing the required coursework, examinations, and projects to master the skills associated with
          </Text>

          <Text style={[styles.courseName, { color: brand.secondaryColor }]}>
            {courseName}
          </Text>

          <View style={styles.metaRow}>
            <View style={styles.metaCol}>
              <Text style={styles.metaLabel}>Date Issued</Text>
              <Text style={styles.metaValue}>{new Date(issuedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</Text>
            </View>
            <View style={styles.metaCol}>
              <Text style={styles.metaLabel}>Certificate ID</Text>
              <Text style={styles.metaValue}>{certificateId}</Text>
            </View>
            {grade && (
              <View style={styles.metaCol}>
                <Text style={styles.metaLabel}>Grade</Text>
                <Text style={styles.metaValue}>{grade}</Text>
              </View>
            )}
          </View>

          <View style={styles.signaturesRow}>
            <View style={styles.signatureBlock}>
              <View style={styles.sigLine} />
              <Text style={styles.sigTitle}>Academic Director</Text>
              <Text style={styles.sigText}>{brand.companyName}</Text>
            </View>
            <View style={styles.signatureBlock}>
              <View style={styles.sigLine} />
              <Text style={styles.sigTitle}>Lead Instructor</Text>
              <Text style={styles.sigText}>Certified by {brand.companyName}</Text>
            </View>
          </View>

        </View>
      </View>
    </Page>
  </PDFDocument>
);
