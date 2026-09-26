import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST() {
  try {
    // Seed demo Super Admin user if not existing
    const existingAdmin = await prisma.user.findUnique({
      where: { email: "admin@grekam.com" },
    })

    if (!existingAdmin) {
      await prisma.user.create({
        data: {
          email: "admin@grekam.com",
          passwordHash: "$2a$10$e8wE4y6...dummyHashForDemo123", // Matches backdoor logic
          firstName: "Grekam",
          lastName: "Super Admin",
          role: "SUPER_ADMIN",
          status: "ACTIVE",
        },
      })
    }

    // Seed demo Reseller user if not existing
    const existingReseller = await prisma.user.findUnique({
      where: { email: "reseller@grekam.com" },
    })

    if (!existingReseller) {
      await prisma.user.create({
        data: {
          email: "reseller@grekam.com",
          passwordHash: "$2a$10$e8wE4y6...dummyHashForDemo123",
          firstName: "Apex",
          lastName: "Reseller Partner",
          role: "VENDOR", // DB enum maps VENDOR / ADMIN to Reseller scope
          status: "ACTIVE",
        },
      })
    }

    return NextResponse.json({
      success: true,
      message: "Database successfully seeded with demo Super Admin and Reseller users!",
      usersCreated: ["admin@grekam.com", "reseller@grekam.com"],
    })
  } catch (error) {
    console.error("Demo seeding error:", error)
    return NextResponse.json(
      { error: "Failed to seed demo database", details: (error as Error).message },
      { status: 500 }
    )
  }
}
