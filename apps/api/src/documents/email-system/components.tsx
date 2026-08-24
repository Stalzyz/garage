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
          <Section style={header}>
            {brand.logoUrl ? (
              <Img src={brand.logoUrl} width="150" alt={brand.companyName} />
            ) : (
              <Text style={{ ...companyName, color: brand.primaryColor }}>
                {brand.companyName}
              </Text>
            )}
          </Section>

          <Section style={contentBlock}>
            {children}
          </Section>

          <Hr style={hr} />

          <Section style={footer}>
            <Text style={footerText}>
              &copy; {new Date().getFullYear()} {brand.companyName}. All rights reserved.
            </Text>
            {brand.address && <Text style={footerText}>{brand.address}</Text>}
            <Text style={footerText}>
              {brand.website && <a href={brand.website} style={footerLink}>{brand.website}</a>}
              {brand.website && brand.contactEmail && ' • '}
              {brand.contactEmail && <a href={`mailto:${brand.contactEmail}`} style={footerLink}>{brand.contactEmail}</a>}
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export const EmailButton = ({ text, href, color = '#2563eb' }: { text: string; href: string; color?: string }) => (
  <Section style={{ textAlign: 'center' as const, marginTop: '32px', marginBottom: '32px' }}>
    <a
      href={href}
      style={{
        backgroundColor: color,
        borderRadius: '8px',
        color: '#fff',
        display: 'inline-block',
        fontSize: '14px',
        fontWeight: 'bold',
        lineHeight: '1.5',
        padding: '12px 24px',
        textDecoration: 'none',
        textAlign: 'center' as const,
      }}
    >
      {text}
    </a>
  </Section>
);

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '40px 20px',
  marginBottom: '64px',
  marginTop: '64px',
  borderRadius: '8px',
  boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
  maxWidth: '600px',
};

const header = {
  marginBottom: '32px',
  textAlign: 'center' as const,
};

const companyName = {
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '0',
};

const contentBlock = {
  padding: '0 20px',
};

const hr = {
  borderColor: '#e6ebf1',
  margin: '40px 0',
};

const footer = {
  textAlign: 'center' as const,
};

const footerText = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
  margin: '4px 0',
};

const footerLink = {
  color: '#8898aa',
  textDecoration: 'underline',
};
