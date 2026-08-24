import React from 'react';
import { Page, View, Text, StyleSheet, Image } from '@react-pdf/renderer';
import { PDFDocument, colors, sp } from './PDFDocument';
import { BrandConfig, resolveBrandLogo } from '../../utils/brand';

const styles = StyleSheet.create({
  page: {
    backgroundColor: colors.white,
    padding: 24,
    fontFamily: 'Helvetica',
    color: colors.ink,
  },
  // Single crisp outer frame with primary brand color
  frame: {
    flex: 1,
    borderWidth: 4,
    padding: 3,
  },
  innerContainer: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.rule,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 48,
    paddingVertical: 24,
  },

  // Academy Brand
  logo: {
    height: 44,
    width: 140,
    objectFit: 'contain',
    marginBottom: sp['8'],
  },
  academyName: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginBottom: 2,
    textAlign: 'center',
  },
  tagline: {
    fontSize: 8,
    color: colors.muted,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: sp['16'],
    textAlign: 'center',
  },

  // Certificate Header
  certTitle: {
    fontSize: 24,
    fontFamily: 'Helvetica-Bold',
    color: colors.ink,
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginBottom: sp['4'],
    textAlign: 'center',
  },

  // Recipient
  presentText: {
    fontSize: 10,
    color: colors.body,
    marginBottom: sp['8'],
    textAlign: 'center',
  },
  studentName: {
    fontSize: 26,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  nameAccentLine: {
    width: 160,
    height: 2,
    marginBottom: sp['16'],
  },

  // Course
  completionText: {
    fontSize: 9.5,
    color: colors.body,
    textAlign: 'center',
    lineHeight: 1.4,
    marginBottom: sp['8'],
    maxWidth: '80%',
  },
  courseName: {
    fontSize: 15,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
    marginBottom: sp['20'],
  },

  // Meta Row (Date, ID, Grade)
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.rule,
    paddingTop: sp['12'],
    width: '80%',
    marginBottom: sp['20'],
  },
  metaItem: {
    alignItems: 'center',
    paddingHorizontal: sp['20'],
  },
  metaSep: {
    width: 1,
    height: 20,
    backgroundColor: colors.rule,
  },
  metaLabel: {
    fontSize: 7,
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 2,
    textAlign: 'center',
  },
  metaValue: {
    fontSize: 9.5,
    fontFamily: 'Helvetica-Bold',
    color: colors.ink,
    textAlign: 'center',
  },

  // Signatures
  sigRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '75%',
  },
  sigBlock: {
    alignItems: 'center',
    width: 160,
  },
  sigSpace: { height: 28 },
  sigLine: {
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: colors.muted,
    marginBottom: 4,
  },
  sigName: {
    fontSize: 8.5,
    fontFamily: 'Helvetica-Bold',
    color: colors.ink,
    textAlign: 'center',
  },
  sigRole: {
    fontSize: 7.5,
    color: colors.muted,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
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
  brand, studentName, courseName, certificateId, grade, issuedAt,
}) => {
  const resolvedLogo = resolveBrandLogo(brand.logoUrl);

  return (
    <PDFDocument title={`Certificate — ${studentName}`} author={brand.companyName}>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={[styles.frame, { borderColor: brand.primaryColor }]}>
          <View style={styles.innerContainer}>
            {/* Logo or Academy Header */}
            {resolvedLogo ? (
              <Image src={resolvedLogo} style={styles.logo} />
            ) : (
              <Text style={[styles.academyName, { color: brand.primaryColor }]}>{brand.companyName}</Text>
            )}
            <Text style={styles.tagline}>CENTRE OF EXCELLENCE</Text>

            {/* Certificate Header */}
            <Text style={styles.certTitle}>CERTIFICATE OF COMPLETION</Text>

            {/* Recipient */}
            <Text style={styles.presentText}>This is proudly presented to</Text>
            <Text style={[styles.studentName, { color: brand.primaryColor }]}>{studentName}</Text>
            <View style={[styles.nameAccentLine, { backgroundColor: brand.primaryColor }]} />

            {/* Course */}
            <Text style={styles.completionText}>
              for successfully completing all requirements, practical assessments, and projects for
            </Text>
            <Text style={[styles.courseName, { color: brand.secondaryColor }]}>{courseName}</Text>

            {/* Meta Info */}
            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Date Issued</Text>
                <Text style={styles.metaValue}>
                  {new Date(issuedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                </Text>
              </View>
              <View style={styles.metaSep} />
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Certificate ID</Text>
                <Text style={styles.metaValue}>{certificateId}</Text>
              </View>
              {grade && (
                <>
                  <View style={styles.metaSep} />
                  <View style={styles.metaItem}>
                    <Text style={styles.metaLabel}>Grade</Text>
                    <Text style={styles.metaValue}>{grade}</Text>
                  </View>
                </>
              )}
            </View>

            {/* Signatures */}
            <View style={styles.sigRow}>
              <View style={styles.sigBlock}>
                <View style={styles.sigSpace} />
                <View style={styles.sigLine} />
                <Text style={styles.sigName}>Academic Director</Text>
                <Text style={styles.sigRole}>{brand.companyName}</Text>
              </View>
              <View style={styles.sigBlock}>
                <View style={styles.sigSpace} />
                <View style={styles.sigLine} />
                <Text style={styles.sigName}>Lead Instructor</Text>
                <Text style={styles.sigRole}>Certified Program</Text>
              </View>
            </View>
          </View>
        </View>
      </Page>
    </PDFDocument>
  );
};
