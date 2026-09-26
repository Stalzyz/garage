import { NextResponse } from "next/server"
import { auth } from "../../../../auth"

export async function POST(req: Request) {
  try {
    const session = await auth()
    const userRole = session?.user?.role

    // Only SUPER_ADMIN and RESELLER_ADMIN are permitted to impersonate garages
    if (userRole !== "SUPER_ADMIN" && userRole !== "RESELLER_ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized: Only Super Admin and Reseller Admin can impersonate garages" },
        { status: 403 }
      )
    }

    const body = await req.json()
    const { garageId, garageName } = body

    if (!garageId) {
      return NextResponse.json({ error: "Garage ID is required" }, { status: 400 })
    }

    // In a full DB setup, create an impersonation JWT / session cookie here.
    // For demo & instant functionality, return successful redirect metadata.
    return NextResponse.json({
      success: true,
      garageId,
      garageName: garageName || "Selected Garage",
      redirectUrl: "/dashboard",
      message: `Successfully logged in as ${garageName || garageId}`,
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to process impersonation" }, { status: 500 })
  }
}
