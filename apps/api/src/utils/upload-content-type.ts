import path from 'path';

/**
 * Which uploaded files may be served inline from the app's own origin.
 *
 * `/api/v1/uploads/*` is served by @fastify/static from the same origin as the
 * dashboard. If an attachment named `invoice.html` or `logo.svg` is rendered
 * inline, the browser executes it as script on grekam.in with the session in
 * scope — stored XSS from anyone who can attach a file to a call or a lead.
 *
 * SVG is deliberately absent: it is an XML document that can carry <script> and
 * event handlers, so it is treated as active content despite being "an image".
 * Brand logos that must render inline belong under the public CMS media prefix
 * (`/api/v1/storage/asset/cms/`), which is served from R2, not from here.
 */
const INLINE_SAFE_EXTENSIONS = new Set([
  // Raster images
  'png', 'jpg', 'jpeg', 'gif', 'webp', 'avif', 'bmp', 'ico', 'tif', 'tiff',
  // Video (call recordings land here as .webm)
  'webm', 'mp4', 'm4v', 'mov',
  // Audio
  'm4a', 'mp3', 'wav', 'ogg', 'oga', 'aac', 'flac', 'opus',
  // Documents that browsers render in a sandboxed viewer
  'pdf',
]);

/**
 * True when the file can be served with its own content type. Anything else is
 * forced to application/octet-stream + Content-Disposition: attachment.
 *
 * Default-deny: an unrecognised extension is treated as active content.
 */
export function isInlineSafeUpload(filePath: string): boolean {
  // `path.extname` returns the last dot segment; strip any query-ish noise and
  // guard against a filename with no extension at all.
  const ext = path.extname(String(filePath || '')).replace(/^\./, '').toLowerCase();
  if (!ext) return false;
  return INLINE_SAFE_EXTENSIONS.has(ext);
}

/** Content types that a browser will execute rather than display. */
const ACTIVE_CONTENT = /\b(text\/html|application\/xhtml|image\/svg\+xml|text\/xml|application\/xml|application\/javascript|text\/javascript)\b/i;

/** Defence in depth: does this content type get executed in-page? */
export function isActiveContentType(contentType: string | undefined): boolean {
  if (!contentType) return false;
  return ACTIVE_CONTENT.test(contentType);
}
