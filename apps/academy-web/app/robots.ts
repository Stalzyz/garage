import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: ['GPTBot', 'PerplexityBot', 'Google-Extended', 'ClaudeBot', 'anthropic-ai'],
        allow: ['/', '/gallery', '/academy/courses', '/student/*'],
        disallow: ['/dashboard/', '/portal/', '/api/v1/auth/'],
      },
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/dashboard/', '/portal/', '/scanner/', '/kiosk/'],
      }
    ],
    sitemap: 'https://academy.grekam.in/sitemap.xml',
  };
}
