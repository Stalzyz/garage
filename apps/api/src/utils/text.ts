/**
 * Utility to clean up HTML tags, HTML entities, and Markdown symbols
 * from text fields before rendering them in PDF documents.
 */
export function cleanDocumentText(text: string | null | undefined): string {
  if (!text) return '';

  // 1. Remove HTML tags
  let cleaned = text.replace(/<\/?[^>]+(>|$)/g, '');

  // 2. Unescape common HTML entities
  const entities: { [key: string]: string } = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&apos;': "'",
    '&nbsp;': ' '
  };
  cleaned = cleaned.replace(/&[a-zA-Z0-9#]+;/g, (match) => entities[match] || match);

  // 3. Clean up common Markdown symbols
  cleaned = cleaned
    .replace(/^#+\s+/gm, '') // Remove starting headers (e.g. ## Header)
    .replace(/\*\*([^*]+)\*\*/g, '$1') // Bold **text**
    .replace(/\*([^*]+)\*/g, '$1') // Italic *text*
    .replace(/__([^_]+)__/g, '$1') // Underline __text__
    .replace(/_([^_]+)_/g, '$1') // Italic _text_
    .replace(/`([^`]+)`/g, '$1') // Inline code `text`
    .replace(/^\s*[-*+]\s+/gm, '• '); // List bullets

  return cleaned.trim();
}
