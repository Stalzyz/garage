import { FastifyInstance } from 'fastify';
import fs from 'fs';
import path from 'path';

export type BrandType = 'AGENCY' | 'ACADEMY';

export interface BrandConfig {
  logoUrl: string | null;
  companyName: string;
  tradeName?: string | null;
  gstin?: string | null;
  pan?: string | null;
  placeOfSupply?: string | null;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
  website: string | null;
  contactEmail: string | null;
  phone: string | null;
  address: string | null;
  bankName: string | null;
  accountName: string | null;
  accountNumber: string | null;
  ifscCode: string | null;
  swiftCode: string | null;
  bankBranch: string | null;
  upiId: string | null;
}

/**
 * Resolves a brand logo URL to a format safe for @react-pdf/renderer.
 * Resolves relative /uploads/ paths to absolute local disk paths if found,
 * or validates http/https URLs. If file does not exist, returns null to avoid ENOENT errors.
 */
export function resolveBrandLogo(logoUrl: string | null): string | null {
  if (!logoUrl || typeof logoUrl !== 'string') return null;
  const cleanUrl = logoUrl.trim();
  if (!cleanUrl) return null;

  // 1. If it's a relative URL or upload path like /uploads/abc or uploads/abc or /api/v1/uploads/abc
  if (cleanUrl.includes('/uploads/')) {
    const filename = cleanUrl.split('/uploads/').pop()?.trim();
    if (filename) {
      // Try root workspace uploads folder
      const rootUploadsPath = path.join(process.cwd(), 'uploads', filename);
      if (fs.existsSync(rootUploadsPath)) return rootUploadsPath;

      // Try apps/api/uploads folder
      const apiUploadsPath = path.join(__dirname, '../../uploads', filename);
      if (fs.existsSync(apiUploadsPath)) return apiUploadsPath;

      // Try public/uploads folder
      const publicUploadsPath = path.join(process.cwd(), 'public/uploads', filename);
      if (fs.existsSync(publicUploadsPath)) return publicUploadsPath;
    }
  }

  // 2. If it's an absolute local disk path
  if (cleanUrl.startsWith('/') && !cleanUrl.startsWith('http')) {
    if (fs.existsSync(cleanUrl)) return cleanUrl;
    return null; // Return null so @react-pdf doesn't throw ENOENT!
  }

  // 3. If it's a valid remote HTTP/HTTPS URL or base64 data URI
  if (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://') || cleanUrl.startsWith('data:image/')) {
    return cleanUrl;
  }

  return null;
}

export async function getBrandConfig(app: FastifyInstance, type: BrandType): Promise<BrandConfig> {
  const org = await app.prisma.organization.findFirst();
  const finance = await app.prisma.financeSettings.findFirst();

  const gstin = finance?.gstNumber?.trim() || null;
  const pan = gstin && gstin.length >= 12 ? gstin.substring(2, 12) : null;
  const stateCode = gstin && gstin.length >= 2 ? gstin.substring(0, 2) : '33';
  const placeOfSupply = stateCode === '33' ? 'Tamil Nadu (33)' : `State (${stateCode})`;

  if (!org) {
    return {
      logoUrl: null,
      companyName: type === 'ACADEMY' ? 'Grekam Academy' : 'Grekam Visuals',
      tradeName: type === 'ACADEMY' ? 'Grekam Academy of Technology & Design' : 'Grekam Visuals & Technologies Pvt Ltd',
      gstin,
      pan,
      placeOfSupply,
      primaryColor: type === 'ACADEMY' ? '#4f46e5' : '#0f172a',
      secondaryColor: '#2563eb',
      accentColor: '#10b981',
      fontFamily: 'Helvetica',
      website: type === 'ACADEMY' ? 'https://academy.grekam.in' : 'https://grekam.in',
      contactEmail: type === 'ACADEMY' ? 'academy@grekam.in' : 'contact@grekam.in',
      phone: null,
      address: 'Chennai, Tamil Nadu, India',
      bankName: null,
      accountName: null,
      accountNumber: null,
      ifscCode: null,
      swiftCode: null,
      bankBranch: null,
      upiId: null,
    };
  }

  const rawLogo = type === 'ACADEMY' ? (org.academyLogoUrl || org.logoUrl) : org.logoUrl;
  const logoUrl = resolveBrandLogo(rawLogo);

  // Dynamic professional UPI ID based on domain or support email
  let upiId: string | null = null;
  if (org.website) {
    const domain = org.website.trim().replace(/https?:\/\/(www\.)?/, '').split('/')[0];
    if (domain) {
      upiId = `pay@${domain}`;
    }
  } else if (org.supportEmail) {
    upiId = org.supportEmail.trim();
  }

  return {
    logoUrl,
    companyName: type === 'ACADEMY' ? `${org.name || 'Grekam'} Academy` : (org.name || 'Grekam Visuals'),
    tradeName: type === 'ACADEMY' ? `${org.name || 'Grekam'} Academy of Technology & Design` : `${org.name || 'Grekam'} Visuals & Technologies Pvt Ltd`,
    gstin,
    pan,
    placeOfSupply,
    primaryColor: type === 'ACADEMY' ? '#4f46e5' : (org.primaryColor || '#0f172a'),
    secondaryColor: org.secondaryColor || '#2563eb',
    accentColor: org.accentColor || '#10b981',
    fontFamily: 'Helvetica',
    website: type === 'ACADEMY' ? 'https://academy.grekam.in' : (org.website?.trim() || null),
    contactEmail: type === 'ACADEMY' ? 'academy@grekam.in' : (org.supportEmail?.trim() || null),
    phone: org.phone?.trim() || null,
    address: org.billingAddress?.trim() || 'Chennai, Tamil Nadu, India',
    bankName: org.bankName?.trim() || null,
    accountName: org.accountName?.trim() || null,
    accountNumber: org.accountNumber?.trim() || null,
    ifscCode: org.ifscCode?.trim() || null,
    swiftCode: org.swiftCode?.trim() || null,
    bankBranch: org.bankBranch?.trim() || null,
    upiId,
  };
}
