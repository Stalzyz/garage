/**
 * Multi-Vendor Subdomain & Custom CNAME Routing Middleware Helper
 */

export interface VendorDomainResolution {
  isCustomDomain: boolean;
  subdomain: string | null;
  vendorSlug: string | null;
}

export function parseVendorHost(hostname: string, baseDomain: string = 'grekam.in'): VendorDomainResolution {
  const cleanHost = hostname.toLowerCase().split(':')[0]; // Remove port if present

  // Case 1: Main Platform domain (e.g., app.grekam.in or localhost)
  if (cleanHost === baseDomain || cleanHost === `app.${baseDomain}` || cleanHost === 'localhost') {
    return {
      isCustomDomain: false,
      subdomain: null,
      vendorSlug: null,
    };
  }

  // Case 2: Subdomain routing (e.g., pixelstudio.grekam.in)
  if (cleanHost.endsWith(`.${baseDomain}`)) {
    const subdomain = cleanHost.replace(`.${baseDomain}`, '');
    return {
      isCustomDomain: false,
      subdomain,
      vendorSlug: subdomain,
    };
  }

  // Case 3: Fully custom CNAME domain (e.g., store.pixelstudiomedia.com)
  return {
    isCustomDomain: true,
    subdomain: null,
    vendorSlug: cleanHost,
  };
}
