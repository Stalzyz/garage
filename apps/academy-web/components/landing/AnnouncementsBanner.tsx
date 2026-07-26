import { prisma } from "../../src/lib/prisma";
import { Bell, ArrowRight } from "lucide-react";
import Link from "next/link";

export async function AnnouncementsBanner() {
  const now = new Date();
  let announcement = null;

  try {
    const announcements = await prisma.announcement.findMany({
      where: {
        isPinned: true,
        publishedAt: { lte: now },
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: now } }
        ]
      },
      orderBy: { publishedAt: "desc" },
      take: 1,
    });
    
    if (announcements.length > 0) {
      announcement = announcements[0];
    }
  } catch (error) {
    console.warn("Could not fetch announcements from database during build.");
  }

  if (!announcement) return null;

  return (
    <div className="bg-emerald-600 text-white relative z-50">
      <div className="container mx-auto px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between flex-wrap">
          <div className="w-0 flex-1 flex items-center">
            <span className="flex p-2 rounded-lg bg-emerald-800">
              <Bell className="h-5 w-5 text-white" aria-hidden="true" />
            </span>
            <p className="ml-3 font-medium truncate">
              <span className="md:hidden">{announcement.title}</span>
              <span className="hidden md:inline">
                <strong className="font-bold mr-2">{announcement.title}:</strong>
                {announcement.content}
              </span>
            </p>
          </div>
          <div className="order-3 mt-2 flex-shrink-0 w-full sm:order-2 sm:mt-0 sm:w-auto">
            <Link
              href="/dashboard/academy/admissions"
              className="flex items-center justify-center px-4 py-2 border border-transparent rounded-full shadow-sm text-sm font-medium text-emerald-600 bg-white hover:bg-emerald-50"
            >
              Learn more <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
