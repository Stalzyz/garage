import React from 'react';
import { View, Text, Image, StyleSheet } from '@react-pdf/renderer';
import { BrandConfig, resolveBrandLogo } from '../../utils/brand';
import { colors, sp } from './PDFDocument';

const styles = StyleSheet.create({
  // ─── Full Page-1 Header (inline flow, NOT fixed/absolute) ─────────────────
  // This renders at the top of the page like normal content.
  // It sizes itself to whatever content it contains — no clipping, no overflow.
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',       // Align both columns to their bottom edges
    marginBottom: sp['20'],
    paddingBottom: sp['16'],
    borderBottomWidth: 1,
    borderBottomColor: colors.rule,
  },

  // Left column: Logo + company details
  headerLeft: {
    flexDirection: 'column',
    flex: 1,
    paddingRight: sp['24'],
  },
  logo: {
    maxWidth: 200,
    maxHeight: 52,
    objectFit: 'contain',
    objectPosition: 'left',
    marginBottom: sp['8'],
  },
  companyName: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 3,
  },
  companyMeta: {
    fontSize: 8,
    color: colors.muted,
    lineHeight: 1.5,
  },

  // Right column: Title stamp + metadata table
  headerRight: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    minWidth: 180,
    maxWidth: 240,
  },
  // Title is a single text — smaller controlled font size guarantees it never wraps.
  documentTitle: {
    fontSize: 17,
    fontFamily: 'Helvetica-Bold',
    color: colors.ink,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    textAlign: 'right',
    marginBottom: sp['8'],
  },
  // Metadata rows: label on left, value on right
  metaTable: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    width: '100%',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    width: '100%',
    marginBottom: 2,
  },
  metaLabel: {
    fontSize: 8,
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    width: 72,
    textAlign: 'right',
    marginRight: 8,
  },
  metaValue: {
    fontSize: 8.5,
    fontFamily: 'Helvetica-Bold',
    color: colors.ink,
    width: 100,
    textAlign: 'right',
  },

  // ─── Thin repeat header (fixed, appears on pages 2+) ─────────────────────
  // Small, safe, guaranteed to never collide with body content.
  repeatHeader: {
    position: 'absolute',
    top: 16,
    left: 48,
    right: 48,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.rule,
  },
  repeatBrand: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  repeatDocType: {
    fontSize: 8,
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  // ─── Footer (fixed, absolute bottom) ─────────────────────────────────────
  footer: {
    position: 'absolute',
    bottom: 18,
    left: 48,
    right: 48,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.rule,
    paddingTop: 6,
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  footerText: {
    fontSize: 7.5,
    color: colors.faint,
  },
  footerDot: {
    fontSize: 7.5,
    color: colors.faint,
    marginHorizontal: 4,
  },
});

/**
 * DocHeader — renders inline at the TOP of a page as flow content.
 * It auto-sizes to content, so titles and metadata never clip or overlap.
 * Place this as the first element inside a <Page>.
 */
export const DocHeader = ({
  brand,
  title,
  metadata,
}: {
  brand: BrandConfig;
  title: string;
  metadata?: Array<{ label: string; value: string }>;
}) => {
  const resolvedLogo = resolveBrandLogo(brand.logoUrl);

  return (
    <View style={styles.header}>
      {/* LEFT: Brand identity */}
      <View style={styles.headerLeft}>
        {resolvedLogo ? (
          <Image src={resolvedLogo} style={styles.logo} />
        ) : (
          <Text style={[styles.companyName, { color: brand.primaryColor }]}>
            {brand.companyName}
          </Text>
        )}
        {brand.address && <Text style={styles.companyMeta}>{brand.address}</Text>}
        {brand.contactEmail && <Text style={styles.companyMeta}>{brand.contactEmail}</Text>}
        {brand.phone && <Text style={styles.companyMeta}>{brand.phone}</Text>}
      </View>

      {/* RIGHT: Document type + metadata */}
      {title.length > 0 && (
        <View style={styles.headerRight}>
          <Text style={styles.documentTitle}>{title}</Text>
          {metadata && metadata.length > 0 && (
            <View style={styles.metaTable}>
              {metadata.map((meta, i) => (
                <View key={i} style={styles.metaRow}>
                  <Text style={styles.metaLabel}>{meta.label}</Text>
                  <Text style={styles.metaValue}>{meta.value}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      )}
    </View>
  );
};

/**
 * DocRepeatHeader — a thin fixed header that appears on pages 2+ only.
 * Use `render={({pageNumber}) => pageNumber > 1 ? <DocRepeatHeader .../> : null}` pattern
 * by wrapping it with a `<View fixed>` that conditionally shows.
 * Keep this very small so it never takes much space.
 */
export const DocRepeatHeader = ({
  brand,
  docType,
}: {
  brand: BrandConfig;
  docType: string;
}) => (
  <View style={styles.repeatHeader} fixed>
    <Text style={styles.repeatBrand}>{brand.companyName}</Text>
    <Text style={styles.repeatDocType}>{docType}</Text>
  </View>
);

/**
 * DocFooter — fixed footer at the bottom of every page.
 * Uses position: absolute so it never interacts with flow content.
 */
export const DocFooter = ({
  brand,
  pagination = true,
}: {
  brand: BrandConfig;
  pagination?: boolean;
}) => (
  <View style={styles.footer} fixed>
    <View style={styles.footerLeft}>
      <Text style={styles.footerText}>{brand.companyName}</Text>
      {brand.contactEmail && (
        <>
          <Text style={styles.footerDot}>•</Text>
          <Text style={styles.footerText}>{brand.contactEmail}</Text>
        </>
      )}
      {brand.website && (
        <>
          <Text style={styles.footerDot}>•</Text>
          <Text style={styles.footerText}>{brand.website}</Text>
        </>
      )}
    </View>
    {pagination && (
      <Text
        style={styles.footerText}
        render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
      />
    )}
  </View>
);
