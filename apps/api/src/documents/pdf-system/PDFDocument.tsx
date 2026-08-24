import React from 'react';
import { Document, Font, StyleSheet } from '@react-pdf/renderer';

// Register standard fonts — URLs fetched directly from Google Fonts v20
Font.register({
  family: 'Inter',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfMZg.ttf', fontWeight: 'normal' },
    { src: 'https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuI6fMZg.ttf', fontWeight: 'medium' },
    { src: 'https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuFuYMZg.ttf', fontWeight: 'bold' },
    { src: 'https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuDyYMZg.ttf', fontWeight: 'heavy' },
  ],
});

export const baseStyles = StyleSheet.create({
  page: {
    fontFamily: 'Inter',
    backgroundColor: '#ffffff',
    color: '#0f172a', // Slate 900
    fontSize: 10,
    lineHeight: 1.5,
    padding: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 24,
  },
  text: {
    fontSize: 10,
    color: '#334155',
  },
  muted: {
    color: '#94a3b8',
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    marginVertical: 16,
  }
});

interface PDFDocumentProps {
  children: React.ReactNode;
  author?: string;
  title?: string;
  subject?: string;
}

export const PDFDocument: React.FC<PDFDocumentProps> = ({ children, author, title, subject }) => {
  return (
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
};
