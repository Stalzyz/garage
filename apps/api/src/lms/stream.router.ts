import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { ZodTypeProvider } from 'fastify-type-provider-zod';

/**
 * Cloudflare Stream Integration
 * 
 * For PRODUCTION, get your credentials from:
 * Cloudflare Dashboard -> Stream -> API Credentials
 * 
 * Required ENV vars:
 *  CF_ACCOUNT_ID      — Cloudflare Account ID
 *  CF_STREAM_TOKEN    — Cloudflare Stream API Token
 *  CF_STREAM_KEY_ID   — Signing Key ID (for signed URLs)
 *  CF_STREAM_KEY_PEM  — Signing Key PEM (for signed URLs)
 */
const CF_API = `https://api.cloudflare.com/client/v4/accounts/${process.env.CF_ACCOUNT_ID}/stream`;

export default async function streamRouter(app: FastifyInstance) {
  const server = app.withTypeProvider<ZodTypeProvider>();

  /**
   * POST /api/v1/lms/stream/upload-url
   * 
   * Returns a "Direct Creator Upload" URL for Cloudflare Stream.
   * The frontend can upload a video directly to this URL without hitting our API server.
   */
  server.post('/stream/upload-url', {
    schema: {
      body: z.object({
        lessonTitle: z.string(),
        maxDurationSeconds: z.number().default(7200) // 2 hours default max
      })
    }
  }, async (req, reply) => {
    const { lessonTitle, maxDurationSeconds } = req.body;

    if (!process.env.CF_ACCOUNT_ID || !process.env.CF_STREAM_TOKEN) {
      // Return a mock response if credentials are not configured
      app.log.warn('[Stream] CF_ACCOUNT_ID or CF_STREAM_TOKEN missing. Returning mock upload URL.');
      return {
        uploadUrl: 'https://upload.videodelivery.net/mock-direct-creator-upload',
        videoId: `mock-video-${Date.now()}`,
        message: 'MOCK MODE: Configure CF_ACCOUNT_ID and CF_STREAM_TOKEN for real uploads.'
      };
    }

    const response = await fetch(`${CF_API}/direct_upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.CF_STREAM_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        maxDurationSeconds,
        meta: { name: lessonTitle },
        requireSignedURLs: true, // Piracy protection
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      app.log.error(`[Stream] Cloudflare Stream API error: ${errText}`);
      return reply.code(502).send({ error: 'Failed to create upload URL from Cloudflare.' });
    }

    const data = await response.json() as any;
    return {
      uploadUrl: data.result.uploadURL,
      videoId: data.result.uid,
    };
  });

  /**
   * GET /api/v1/lms/stream/signed-url/:videoId
   * 
   * Returns a time-limited signed URL for an authenticated student to watch a video.
   * This prevents sharing of raw video links.
   */
  server.get('/stream/signed-url/:videoId', {
    schema: {
      params: z.object({ videoId: z.string() })
    }
  }, async (req, reply) => {
    const { videoId } = req.params;

    if (!process.env.CF_STREAM_KEY_ID || !process.env.CF_STREAM_KEY_PEM) {
      // Return a mock token for development
      return {
        signedUrl: `https://watch.videodelivery.net/${videoId}`,
        note: 'MOCK MODE: Unsigned URL — Configure CF_STREAM_KEY_ID and CF_STREAM_KEY_PEM for signed playback.'
      };
    }

    // Generate a signed JWT token using Cloudflare's API
    const tokenResponse = await fetch(`${CF_API}/${videoId}/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.CF_STREAM_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: process.env.CF_STREAM_KEY_ID,
        pem: process.env.CF_STREAM_KEY_PEM,
        exp: Math.floor(Date.now() / 1000) + 3600, // Expires in 1 hour
      }),
    });

    if (!tokenResponse.ok) {
      return reply.code(500).send({ error: 'Failed to generate signed token.' });
    }

    const tokenData = await tokenResponse.json() as any;
    const token = tokenData.result.token;

    return {
      signedUrl: `https://watch.videodelivery.net/${token}`,
    };
  });
}
