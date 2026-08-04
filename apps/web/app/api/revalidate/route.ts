import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret');
  const path = request.nextUrl.searchParams.get('path');

  // Check for secret to prevent unauthorized revalidations
  // You should ideally set REVALIDATE_SECRET in your .env file
  const validSecret = process.env.REVALIDATE_SECRET || 'grekam_clear_cache';
  
  if (secret !== validSecret) {
    return NextResponse.json({ message: 'Invalid secret token' }, { status: 401 });
  }

  if (!path) {
    return NextResponse.json({ message: 'Missing path parameter' }, { status: 400 });
  }

  try {
    // Revalidate the specific path
    revalidatePath(path);
    return NextResponse.json({ revalidated: true, path, now: Date.now() });
  } catch (err) {
    return NextResponse.json({ message: 'Error revalidating cache' }, { status: 500 });
  }
}
