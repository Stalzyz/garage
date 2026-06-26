import React from 'react';
import {
  Document, Page, Text, View, StyleSheet,
} from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#fafaf9',
    padding: 30,
    fontFamily: 'Helvetica',
    color: '#1c1917',
  },
  container: {
    flex: 1,
    border: '8px double #b45309', // Gold double border
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  innerContainer: {
    flex: 1,
    width: '100%',
    border: '1px solid #e7e5e4',
    padding: 20,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  academyName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e3a8a',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 9,
    color: '#78716c',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 20,
  },
  certTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#111827',
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  presentText: {
    fontSize: 10,
    color: '#78716c',
    fontStyle: 'italic',
    marginBottom: 15,
  },
  studentName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#b45309', // Gold color name
    marginVertical: 8,
  },
  nameUnderline: {
    width: '60%',
    height: '1px',
    backgroundColor: '#e7e5e4',
    marginBottom: 15,
  },
  completionText: {
    fontSize: 9,
    color: '#44403c',
    textAlign: 'center',
    width: '80%',
    lineHeight: 1.5,
    marginBottom: 8,
  },
  courseName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1e3a8a',
    marginBottom: 20,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    marginTop: 20,
    borderTop: '1px solid #f5f5f4',
    paddingTop: 15,
  },
  metaCol: {
    alignItems: 'center',
  },
  metaLabel: {
    fontSize: 8,
    color: '#a8a29e',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  metaValue: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#44403c',
  },
  signaturesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    marginTop: 30,
  },
  signatureBlock: {
    alignItems: 'center',
    width: 150,
  },
  sigLine: {
    width: '100%',
    borderBottom: '1px solid #78716c',
    marginBottom: 4,
  },
  sigText: {
    fontSize: 8,
    color: '#78716c',
  },
  sigTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#44403c',
    marginTop: 2,
  }
});

interface CertificatePDFProps {
  studentName: string;
  courseName: string;
  certificateId: string;
  grade?: string | null;
  issuedAt: string;
}

export const CertificatePDF = ({ studentName, courseName, certificateId, grade, issuedAt }: CertificatePDFProps) => (
  <Document>
    <Page size="A4" orientation="landscape" style={styles.page}>
      <View style={styles.container}>
        <View style={styles.innerContainer}>
          {/* Top Logo / Brand block */}
          <View style={{ alignItems: 'center' }}>
            <Text style={styles.academyName}>Grekam Academy of Design</Text>
            <Text style={styles.subtitle}>Innovate • Create • Elevate</Text>
          </View>

          {/* Certificate Main Title */}
          <View style={{ alignItems: 'center' }}>
            <Text style={styles.certTitle}>Certificate of Completion</Text>
            <Text style={styles.presentText}>This is proudly presented to</Text>
            <Text style={styles.studentName}>{studentName}</Text>
            <View style={styles.nameUnderline} />
            <Text style={styles.completionText}>
              for successfully completing all academic requirements, projects, and assessments set forth by the Academy Board of Educators.
            </Text>
            <Text style={styles.courseName}>{courseName}</Text>
          </View>

          {/* Metadata Row (Dates, ID, Grades) */}
          <View style={styles.metaRow}>
            <View style={styles.metaCol}>
              <Text style={styles.metaLabel}>Date Issued</Text>
              <Text style={styles.metaValue}>{issuedAt}</Text>
            </View>
            <View style={styles.metaCol}>
              <Text style={styles.metaLabel}>Grade Obtained</Text>
              <Text style={styles.metaValue}>{grade || 'Passed'}</Text>
            </View>
            <View style={styles.metaCol}>
              <Text style={styles.metaLabel}>Certificate ID</Text>
              <Text style={styles.metaValue}>{certificateId}</Text>
            </View>
          </View>

          {/* Signatures */}
          <View style={styles.signaturesRow}>
            <View style={styles.signatureBlock}>
              <View style={styles.sigLine} />
              <Text style={styles.sigText}>Deepak Grekam</Text>
              <Text style={styles.sigTitle}>Academy Director</Text>
            </View>
            <View style={styles.signatureBlock}>
              <View style={styles.sigLine} />
              <Text style={styles.sigText}>Lead Instructor</Text>
              <Text style={styles.sigTitle}>Board of Education</Text>
            </View>
          </View>
        </View>
      </View>
    </Page>
  </Document>
);
