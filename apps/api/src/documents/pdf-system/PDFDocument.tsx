import React from 'react';
import { Document, StyleSheet, Font } from '@react-pdf/renderer';

// Register hyphenation callback globally to disable automatic hyphenation across all documents
Font.registerHyphenationCallback((word) => [word]);

/**
 * Shared spacing tokens used across all templates (in points).
 */
export const sp = {
  '4': 4,
  '6': 6,
  '8': 8,
  '12': 12,
  '16': 16,
  '20': 20,
  '24': 24,
  '32': 32,
  '40': 40,
  '48': 48,
};

/**
 * Shared color tokens — executive neutral palette.
 */
export const colors = {
  ink: '#0f172a',
  body: '#334155',
  muted: '#64748b',
  faint: '#94a3b8',
  rule: '#e2e8f0',
  ruleStrong: '#cbd5e1',
  surface: '#f8fafc',
  white: '#ffffff',
  teal: '#49abc9',
  green: '#2DA16D',
  orange: '#E1992D',
};

/**
 * Standard page style.
 *
 * paddingTop: 48 — no fixed header stealing space on every page.
 *   The DocHeader is flow-based (no position: absolute, no fixed prop).
 *   It renders inline at the top of whatever page it's placed on.
 *   On multi-page docs, a thin SmallPageHeader is used for subsequent pages.
 * paddingBottom: 48 — DocFooter is fixed (safe, never overlaps body content).
 */
export const baseStyles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    backgroundColor: colors.white,
    color: colors.ink,
    fontSize: 10,
    lineHeight: 1.5,
    paddingTop: 48,
    paddingBottom: 56,
    paddingHorizontal: 48,
  },
});

interface PDFDocumentProps {
  children: React.ReactNode;
  author?: string;
  title?: string;
  subject?: string;
}

export const PDFDocument: React.FC<PDFDocumentProps> = ({ children, author, title, subject }) => (
  <Document
    author={author}
    title={title}
    subject={subject}
    creator="Grekam OS"
    producer="Grekam Document Engine"
  >
    {children}
  </Document>
);
