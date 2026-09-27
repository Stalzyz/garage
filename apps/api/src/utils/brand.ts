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

export async function getBrandConfig(app: FastifyInstance, type: BrandType, opts?: { tenantId?: string; workspaceId?: string }): Promise<BrandConfig> {
  let org: any = null;
  if (opts?.tenantId) {
    const tb = await app.prisma.tenantBranding.findUnique({
      where: { tenantId: opts.tenantId },
      include: { tenant: true },
    });
    if (tb) {
      org = {
        name: tb.tenant.name,
        companyName: tb.companyName || tb.tenant.name,
        logoUrl: tb.logoUrl,
        faviconUrl: tb.faviconUrl,
        primaryColor: tb.primaryColor,
        secondaryColor: tb.secondaryColor,
        accentColor: tb.accentColor,
        supportEmail: tb.supportEmail,
        billingAddress: tb.billingAddress,
        website: tb.websiteUrl,
        phone: tb.supportPhone,
        gstNumber: tb.taxId,
        panNumber: tb.taxId,
        bankName: tb.bankName,
        accountNumber: tb.accountNumber,
        ifscCode: tb.ifscCode,
        swiftCode: tb.swiftCode,
        bankBranch: tb.bankBranch,
      };
    }
  }

  if (!org && opts?.workspaceId) {
    org = await app.prisma.organization.findUnique({ where: { workspaceId: opts.workspaceId } });
  }

  if (!org) {
    org = await app.prisma.organization.findFirst();
  }

  const finance = await app.prisma.financeSettings.findFirst();

  const gstin = (org?.gstNumber || finance?.gstNumber)?.trim() || null;
  const pan = (org?.panNumber || (gstin && gstin.length >= 12 ? gstin.substring(2, 12) : null))?.trim() || null;
  const stateCode = gstin && gstin.length >= 2 ? gstin.substring(0, 2) : '33';
  const placeOfSupply = stateCode === '33' ? 'Tamil Nadu (33)' : `State (${stateCode})`;

  const DEFAULT_PRIMARY = '#4f46e5';
  const DEFAULT_SECONDARY = '#10b981';
  const DEFAULT_ACCENT = '#f59e0b';

  const defaultLogo = type === 'ACADEMY' ? 'academy-logo.png' : 'visuals-logo.png';
  const rawLogo = type === 'ACADEMY' ? (org?.academyLogoUrl || org?.logoUrl || null) : (org?.logoUrl || null);
  const logoUrl = rawLogo ? resolveBrandLogo(rawLogo, defaultLogo) : null;
  const rawFavicon = type === 'ACADEMY' ? (org?.academyFaviconUrl || org?.faviconUrl || null) : (org?.faviconUrl || null);

  if (!org) {
    return {
      logoUrl,
      faviconUrl: rawFavicon,
      companyName: type === 'ACADEMY' ? 'Grekam Academy' : 'Grekam Visuals',
      tradeName: type === 'ACADEMY' ? 'Grekam Academy' : 'Grekam Visuals',
      gstin,
      pan,
      placeOfSupply,
      primaryColor: DEFAULT_PRIMARY,
      secondaryColor: DEFAULT_SECONDARY,
      accentColor: DEFAULT_ACCENT,
      grekamGreen: DEFAULT_SECONDARY,
      visualsOrange: DEFAULT_ACCENT,
      agencyTeal: DEFAULT_PRIMARY,
      fontFamily: 'Helvetica',
      website: null,
      contactEmail: null,
      phone: null,
      address: null,
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
    companyName: org.companyName?.trim() || org.name || 'Garage SaaS',
    tradeName: org.companyName?.trim() || org.name || 'Garage SaaS',
    gstin,
    pan,
    placeOfSupply,
    primaryColor: org.primaryColor?.trim() || DEFAULT_PRIMARY,
    secondaryColor: org.secondaryColor?.trim() || DEFAULT_SECONDARY,
    accentColor: org.accentColor?.trim() || DEFAULT_ACCENT,
    grekamGreen: org.secondaryColor?.trim() || DEFAULT_SECONDARY,
    visualsOrange: org.accentColor?.trim() || DEFAULT_ACCENT,
    agencyTeal: org.primaryColor?.trim() || DEFAULT_PRIMARY,
    fontFamily: 'Helvetica',
    website: org.website?.trim() || null,
    contactEmail: org.supportEmail?.trim() || null,
    phone: org.phone?.trim() || null,
    address: org.billingAddress?.trim() || null,
    bankName: org.bankName?.trim() || null,
    accountName: org.accountName?.trim() || null,
    accountNumber: org.accountNumber?.trim() || null,
    ifscCode: org.ifscCode?.trim() || null,
    swiftCode: org.swiftCode?.trim() || null,
    bankBranch: org.bankBranch?.trim() || null,
    upiId,
  };
}
