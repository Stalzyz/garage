import { FastifyInstance } from 'fastify';

export type BrandType = 'AGENCY' | 'ACADEMY';

export interface BrandConfig {
  logoUrl: string | null;
  companyName: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
  website: string | null;
  contactEmail: string | null;
  phone: string | null;
  address: string | null;
}

export async function getBrandConfig(app: FastifyInstance, type: BrandType): Promise<BrandConfig> {
  const org = await app.prisma.organization.findFirst();
  
  if (!org) {
    return {
      logoUrl: null,
      companyName: 'Default Company',
      primaryColor: '#000000',
      secondaryColor: '#333333',
      accentColor: '#666666',
      fontFamily: 'Inter',
      website: null,
      contactEmail: null,
      phone: null,
      address: null,
    };
  }

  const logoUrl = type === 'ACADEMY' ? org.academyLogoUrl : org.logoUrl;

  return {
    logoUrl,
    companyName: org.name,
    primaryColor: org.primaryColor || '#2563eb',
    secondaryColor: org.secondaryColor || '#1e40af',
    accentColor: org.accentColor || '#10b981',
    fontFamily: 'Inter',
    website: org.website?.trim() || null,
    contactEmail: org.supportEmail?.trim() || null,
    phone: org.phone?.trim() || null,
    address: org.billingAddress?.trim() || null,
  };
}
