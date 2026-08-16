import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: ['GPTBot', 'PerplexityBot', 'Google-Extended', 'ClaudeBot', 'anthropic-ai'],
        allow: ['/', '/gallery', '/agency', '/contact'],
        disallow: ['/dashboard/', '/portal/', '/api/v1/auth/'],
      },
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/dashboard/', '/portal/', '/verify/', '/workspace/'],
      }
    ],
    sitemap: 'https://grekam.in/sitemap.xml',
  };
}
