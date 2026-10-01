import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { 
      error: "Forbidden", 
      message: "Public password recovery is disabled by security policy. Account credentials can only be reset by an authorized administrator." 
    }, 
    { status: 403 }
  );
}

export async function GET() {
  return NextResponse.json(
    { 
      error: "Forbidden", 
      message: "Public password recovery is disabled by security policy. Account credentials can only be reset by an authorized administrator." 
    }, 
    { status: 403 }
  );
}
