export type CourseDomain = 'DESIGN' | 'TECH' | 'VIDEO' | 'MARKETING';

export function getDomainFromCode(code: string | undefined): CourseDomain {
  if (!code) return 'TECH';
  
  if (code.includes('UXMP') || code.includes('GDM')) return 'DESIGN';
  if (code.includes('FSD') || code.includes('WDM')) return 'TECH';
  if (code.includes('VFX') || code.includes('VEM') || code.includes('3DA') || code.includes('MGM')) return 'VIDEO';
  if (code.includes('DMM')) return 'MARKETING';
  
  return 'TECH';
}

export function getFontClassForDomain(domain: CourseDomain): string {
  switch (domain) {
    case 'DESIGN': return 'font-[var(--font-playfair)]';
    case 'TECH': return 'font-[var(--font-space)]';
    case 'VIDEO': return 'font-[var(--font-inter)] tracking-wide';
    case 'MARKETING': return 'font-[var(--font-inter)] tracking-tight';
  }
}
