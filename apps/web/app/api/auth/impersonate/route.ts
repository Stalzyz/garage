import { NextResponse } from "next/server"

export async function POST() {
  return NextResponse.json(
    { 
      error: "Vendor impersonation is permanently disabled by platform security policy.",
      disabled: true 
    },
    { status: 403 }
  )
}

