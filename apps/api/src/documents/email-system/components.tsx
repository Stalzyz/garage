import * as React from 'react';
import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import { BrandConfig } from '../../utils/brand';

interface EmailLayoutProps {
  brand: BrandConfig;
  previewText?: string;
  children: React.ReactNode;
}

export const EmailLayout = ({ brand, previewText, children }: EmailLayoutProps) => {
  return (
    <Html>
      <Head />
      {previewText && <Preview>{previewText}</Preview>}
      <Body style={main}>
        <Container style={container}>
          {/* Brand accent bar */}
          <div style={{ backgroundColor: brand.primaryColor, height: '4px', borderRadius: '4px 4px 0 0' }} />

          {/* Header */}
          <Section style={header}>
            {brand.logoUrl ? (
              <Img src={brand.logoUrl} width="120" height="40" alt={brand.companyName} style={{ objectFit: 'contain' }} />
            ) : (
              <Text style={{ ...companyNameStyle, color: brand.primaryColor }}>
                {brand.companyName}
              </Text>
            )}
          </Section>

          {/* Content */}
          <Section style={contentBlock}>
            {children}
          </Section>

          <Hr style={hr} />

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              &copy; {new Date().getFullYear()} {brand.companyName}. All rights reserved.
            </Text>
            {brand.address && <Text style={footerText}>{brand.address}</Text>}
            <Text style={footerText}>
              {brand.website && (
                <a href={brand.website} style={footerLink}>{brand.website}</a>
              )}
              {brand.website && brand.contactEmail && ' · '}
              {brand.contactEmail && (
                <a href={`mailto:${brand.contactEmail}`} style={footerLink}>{brand.contactEmail}</a>
              )}
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export const EmailButton = ({
  text,
  href,
  color = '#2563eb',
}: {
  text: string;
  href: string;
  color?: string;
}) => (
  <Section style={{ textAlign: 'center' as const, marginTop: '28px', marginBottom: '28px' }}>
    <a
      href={href}
      style={{
        backgroundColor: color,
        borderRadius: '6px',
        color: '#ffffff',
        display: 'inline-block',
        fontSize: '14px',
        fontWeight: 'bold',
        lineHeight: '1',
        padding: '14px 28px',
        textDecoration: 'none',
        textAlign: 'center' as const,
        letterSpacing: '0.3px',
      }}
    >
      {text}
    </a>
  </Section>
);

// ─── Styles ──────────────────────────────────────────────────────────────────

const main: React.CSSProperties = {
  backgroundColor: '#f0f4f8',
  fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
};

const container: React.CSSProperties = {
  backgroundColor: '#ffffff',
  margin: '40px auto',
  borderRadius: '8px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  maxWidth: '600px',
  overflow: 'hidden',
};

const header: React.CSSProperties = {
  padding: '28px 36px 20px',
  borderBottom: '1px solid #eef1f5',
};

const companyNameStyle: React.CSSProperties = {
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '0',
  letterSpacing: '0.5px',
};

const contentBlock: React.CSSProperties = {
  padding: '32px 36px',
  color: '#334155',
  fontSize: '14px',
  lineHeight: '1.7',
};

const hr: React.CSSProperties = {
  borderColor: '#e8edf2',
  margin: '0 36px',
};

const footer: React.CSSProperties = {
  textAlign: 'center' as const,
  padding: '20px 36px 28px',
};

const footerText: React.CSSProperties = {
  color: '#94a3b8',
  fontSize: '11px',
  lineHeight: '18px',
  margin: '3px 0',
};

const footerLink: React.CSSProperties = {
  color: '#94a3b8',
  textDecoration: 'none',
};
