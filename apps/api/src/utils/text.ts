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

/**
 * Converts a numeric amount to Indian English Currency Words
 * e.g., 17700 -> "Rupees Seventeen Thousand Seven Hundred Only"
 */
export function numberToWordsIN(num: number): string {
  if (!num || num === 0) return 'Rupees Zero Only';

  const units = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
  ];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function convertChunk(n: number): string {
    if (n === 0) return '';
    if (n < 20) return units[n];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + units[n % 10] : '');
    return units[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' ' + convertChunk(n % 100) : '');
  }

  const integerPart = Math.floor(Math.abs(num));
  const decimalPart = Math.round((Math.abs(num) - integerPart) * 100);

  let result = '';

  const crore = Math.floor(integerPart / 10000000);
  let rem = integerPart % 10000000;

  const lakh = Math.floor(rem / 100000);
  rem = rem % 100000;

  const thousand = Math.floor(rem / 1000);
  rem = rem % 1000;

  const hundred = rem;

  if (crore > 0) result += convertChunk(crore) + ' Crore ';
  if (lakh > 0) result += convertChunk(lakh) + ' Lakh ';
  if (thousand > 0) result += convertChunk(thousand) + ' Thousand ';
  if (hundred > 0) result += convertChunk(hundred);

  result = result.trim();
  if (!result) result = 'Zero';

  let words = `Rupees ${result}`;
  if (decimalPart > 0) {
    words += ` and ${convertChunk(decimalPart)} Paise`;
  }
  words += ' Only';

  return words;
}

