import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const API_INTERNAL = process.env.API_INTERNAL_URL || 'http://localhost:4000/api/v1';

/**
 * POST /api/upload-local
 *
 * Proxies multipart/form-data file uploads to the internal Fastify API,
 * explicitly forwarding the session cookie.
 *
 * WHY this exists:
 * Next.js rewrites (/api/v1/:path* → internal API) do NOT forward Cookie headers
 * for multipart/form-data requests. JSON bodies work fine through rewrites, but
 * multipart streams are handled differently — the Cookie header is stripped,
 * causing Fastify's requireAuth to return 401.
 *
 * This route explicitly reads the cookie from the incoming request headers and
 * sets it on the outgoing fetch, bypassing the rewrite cookie-stripping bug.
 */
export async function POST(request: NextRequest) {
  const cookieHeader = request.headers.get('cookie') || '';
  const contentType = request.headers.get('content-type') || '';

  if (!contentType.includes('multipart/form-data')) {
    return NextResponse.json({ error: 'Expected multipart/form-data' }, { status: 400 });
  }

  try {
    const body = await request.arrayBuffer();

    const apiRes = await fetch(`${API_INTERNAL}/storage/upload-local`, {
      method: 'POST',
      headers: {
        'content-type': contentType,
        'cookie': cookieHeader,
        ...(request.headers.get('x-forwarded-for') ? { 'x-forwarded-for': request.headers.get('x-forwarded-for')! } : {}),
        ...(request.headers.get('x-forwarded-host') ? { 'x-forwarded-host': request.headers.get('x-forwarded-host')! } : {}),
        ...(request.headers.get('x-forwarded-proto') ? { 'x-forwarded-proto': request.headers.get('x-forwarded-proto')! } : {}),
      },
      body,
    });

    const data = await apiRes.json().catch(() => ({ error: 'Invalid response from storage service' }));
    return NextResponse.json(data, { status: apiRes.status });
  } catch (err: any) {
    console.error('[upload-local proxy] Error:', err.message);
    return NextResponse.json({ error: 'Upload proxy failed', message: err.message }, { status: 500 });
  }
}
