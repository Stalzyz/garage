/**
 * Utility to clean up HTML tags, HTML entities, and Markdown symbols
 * from text fields before rendering them in PDF documents,
 * preserving paragraph breaks, line breaks, and list formatting.
 */
export function cleanDocumentText(text: string | null | undefined): string {
  if (!text) return '';

  let cleaned = text;

  // 1. Convert block HTML tags & line breaks to proper newlines before stripping tags
  cleaned = cleaned
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<\/h[1-6]>/gi, '\n\n')
    .replace(/<\/tr>/gi, '\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<li[^>]*>/gi, '• ');

  // 2. Remove remaining HTML tags
  cleaned = cleaned.replace(/<\/?[^>]+(>|$)/g, ' ');

  // 3. Unescape common HTML entities
  const entities: { [key: string]: string } = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&apos;': "'",
    '&nbsp;': ' ',
    '&mdash;': '—',
    '&ndash;': '–',
    '&bull;': '•',
    '&check;': '✓',
  };
  cleaned = cleaned.replace(/&[a-zA-Z0-9#]+;/g, (match) => entities[match] || match);

  // 4. Clean up common Markdown symbols
  cleaned = cleaned
    .replace(/^#+\s+/gm, '') // Remove starting headers (e.g. ## Header)
    .replace(/\*\*([^*]+)\*\*/g, '$1') // Bold **text**
    .replace(/\*([^*]+)\*/g, '$1') // Italic *text*
    .replace(/__([^_]+)__/g, '$1') // Underline __text__
    .replace(/_([^_]+)_/g, '$1') // Italic _text_
    .replace(/`([^`]+)`/g, '$1') // Inline code `text`
    .replace(/^\s*[-*+]\s+/gm, '• '); // List bullets

  // 5. Clean up multiple spaces on same line while preserving line breaks
  cleaned = cleaned
    .split('\n')
    .map(line => line.replace(/[ \t]+/g, ' ').trim())
    .filter((line, index, arr) => {
      // Keep empty line only if previous line was not empty (max 1 empty line in a row)
      if (line === '') {
        return index > 0 && arr[index - 1] !== '';
      }
      return true;
    })
    .join('\n');

  return cleaned.trim();
}
