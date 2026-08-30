import { FastifyInstance } from 'fastify';
import fs from 'fs';
import path from 'path';

export type BrandType = 'AGENCY' | 'ACADEMY';

export interface BrandConfig {
  logoUrl: string | null;
  faviconUrl?: string | null;
  companyName: string;
  tradeName?: string | null;
  gstin?: string | null;
  pan?: string | null;
  placeOfSupply?: string | null;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  grekamGreen: string;
  visualsOrange: string;
  agencyTeal: string;
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
 * Resolves relative /uploads/ and /public/ paths to absolute local disk paths if found,
 * or validates http/https URLs.
 */
export function resolveBrandLogo(logoUrl: string | null, fallbackFilename: string = 'visuals-logo.png'): string | null {
  const targetUrl = (logoUrl && typeof logoUrl === 'string' && logoUrl.trim()) ? logoUrl.trim() : fallbackFilename;

  // 1. Check local files in standard folders (public, uploads, apps/web/public)
  const filename = targetUrl.replace(/^\/+/, '').split('/').pop()?.trim() || fallbackFilename;
  const candidatePaths = [
    path.join(process.cwd(), 'apps/web/public', filename),
    path.join(process.cwd(), 'public', filename),
    path.join(process.cwd(), 'uploads', filename),
    path.join(__dirname, '../../../../apps/web/public', filename),
    path.join(__dirname, '../../../apps/web/public', filename),
    path.join(__dirname, '../../../web/public', filename),
    path.join(__dirname, '../../public', filename),
    path.join(__dirname, '../../uploads', filename),
  ];

  for (const candidate of candidatePaths) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  // 2. If it's an absolute local disk path
  if (targetUrl.startsWith('/') && !targetUrl.startsWith('http')) {
    if (fs.existsSync(targetUrl)) return targetUrl;
  }

  // 3. If it's a valid remote HTTP/HTTPS URL or base64 data URI
  if (targetUrl.startsWith('http://') || targetUrl.startsWith('https://') || targetUrl.startsWith('data:image/')) {
    return targetUrl;
  }

  return targetUrl;
}

export async function getBrandConfig(app: FastifyInstance, type: BrandType): Promise<BrandConfig> {
  const org = await app.prisma.organization.findFirst();
  const finance = await app.prisma.financeSettings.findFirst();

  const gstin = finance?.gstNumber?.trim() || null;
  const pan = gstin && gstin.length >= 12 ? gstin.substring(2, 12) : null;
  const stateCode = gstin && gstin.length >= 2 ? gstin.substring(0, 2) : '33';
  const placeOfSupply = stateCode === '33' ? 'Tamil Nadu (33)' : `State (${stateCode})`;

  const GREKAM_GREEN = '#2DA16D';
  const VISUALS_ORANGE = '#E1992D';
  const AGENCY_TEAL = '#49abc9';

  const defaultLogo = type === 'ACADEMY' ? 'academy-logo.png' : 'visuals-logo.png';
  const rawLogo = type === 'ACADEMY' ? (org?.academyLogoUrl || org?.logoUrl || '/academy-logo.png') : (org?.logoUrl || '/visuals-logo.png');
  const logoUrl = resolveBrandLogo(rawLogo, defaultLogo);
  const rawFavicon = type === 'ACADEMY' ? (org?.academyFaviconUrl || org?.faviconUrl || '/favicon.ico') : (org?.faviconUrl || '/favicon.ico');

  if (!org) {
    return {
      logoUrl,
      faviconUrl: rawFavicon,
      companyName: type === 'ACADEMY' ? 'Grekam Academy' : 'Grekam Visuals',
      tradeName: type === 'ACADEMY' ? 'Grekam Academy of Technology & Design' : 'Grekam Visuals & Technologies Pvt Ltd',
      gstin,
      pan,
      placeOfSupply,
      primaryColor: type === 'ACADEMY' ? '#4f46e5' : GREKAM_GREEN,
      secondaryColor: VISUALS_ORANGE,
      accentColor: AGENCY_TEAL,
      grekamGreen: GREKAM_GREEN,
      visualsOrange: VISUALS_ORANGE,
      agencyTeal: AGENCY_TEAL,
      fontFamily: 'Helvetica',
      website: type === 'ACADEMY' ? 'https://academy.grekam.in' : 'https://grekam.in',
      contactEmail: type === 'ACADEMY' ? 'academy@grekam.in' : 'contact@grekam.in',
      phone: null,
      address: 'Coimbatore, Tamil Nadu, India',
      bankName: null,
      accountName: null,
      accountNumber: null,
      ifscCode: null,
      swiftCode: null,
      bankBranch: null,
      upiId: null,
    };
  }

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
    faviconUrl: rawFavicon,
    companyName: type === 'ACADEMY' ? `${org.name || 'Grekam'} Academy` : (org.name || 'Grekam Visuals'),
    tradeName: type === 'ACADEMY' ? `${org.name || 'Grekam'} Academy of Technology & Design` : `${org.name || 'Grekam'} Visuals & Technologies Pvt Ltd`,
    gstin,
    pan,
    placeOfSupply,
    primaryColor: type === 'ACADEMY' ? '#4f46e5' : (org.primaryColor || GREKAM_GREEN),
    secondaryColor: org.secondaryColor || VISUALS_ORANGE,
    accentColor: org.accentColor || AGENCY_TEAL,
    grekamGreen: GREKAM_GREEN,
    visualsOrange: VISUALS_ORANGE,
    agencyTeal: AGENCY_TEAL,
    fontFamily: 'Helvetica',
    website: type === 'ACADEMY' ? 'https://academy.grekam.in' : (org.website?.trim() || 'https://grekam.in'),
    contactEmail: type === 'ACADEMY' ? 'academy@grekam.in' : (org.supportEmail?.trim() || 'contact@grekam.in'),
    phone: org.phone?.trim() || null,
    address: org.billingAddress?.trim() || 'Coimbatore, Tamil Nadu, India',
    bankName: org.bankName?.trim() || null,
    accountName: org.accountName?.trim() || null,
    accountNumber: org.accountNumber?.trim() || null,
    ifscCode: org.ifscCode?.trim() || null,
    swiftCode: org.swiftCode?.trim() || null,
    bankBranch: org.bankBranch?.trim() || null,
    upiId,
  };
}
