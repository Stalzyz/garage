import { prisma } from "../../src/lib/prisma";
import { Calendar, MapPin, Clock, ArrowRight } from "lucide-react";
import Link from "next/link";

export async function UpcomingEvents() {
  const now = new Date();
  
  let events: any[] = [];
  let demos: any[] = [];
  
  try {
    // Fetch upcoming campus events
    events = await prisma.campusEvent.findMany({
      where: {
        date: { gte: now },
        isActive: true,
      },
      orderBy: { date: "asc" },
      take: 2,
    });
    
    // Fetch upcoming demo sessions
    demos = await prisma.demoSession.findMany({
      where: {
        scheduledAt: { gte: now },
        isActive: true,
      },
      orderBy: { scheduledAt: "asc" },
      take: 2,
    });
  } catch (error) {
    console.warn("Could not fetch events from database during build.");
  }

  // Combine and sort
  const combinedEvents = [
    ...events.map(e => ({
      id: e.id,
      title: e.title,
      type: e.type,
      date: e.date,
      location: e.location || "Online",
      link: `/events/${e.id}`,
      isDemo: false
    })),
    ...demos.map(d => ({
      id: d.id,
      title: d.title,
      type: "DEMO CLASS",
      date: d.scheduledAt,
      location: d.venue || (d.meetLink ? "Online Meeting" : "TBD"),
      link: `/demos/${d.id}`,
      isDemo: true
    }))
  ].sort((a, b) => a.date.getTime() - b.date.getTime()).slice(0, 3);

  if (combinedEvents.length === 0) return null;

  return (
    <section className="py-24 bg-[#FAFAF8] relative overflow-hidden">
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-5xl font-black mb-4 text-gray-900 tracking-tight font-sans">
              Upcoming Events & Demos
            </h2>
            <p className="text-xl text-gray-500 font-handwriting">
              Join our free workshops, masterclasses, and open-house demo sessions.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {combinedEvents.map((event) => (
            <div key={`${event.isDemo ? 'demo' : 'event'}-${event.id}`} className="bg-white border border-gray-100 rounded-3xl p-8 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] transition-all duration-300 group flex flex-col h-full">
              <div className="inline-block px-3 py-1 bg-emerald-50 text-emerald-600 font-bold text-xs rounded-full tracking-wider mb-6 w-fit">
                {event.type}
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4 line-clamp-2">
                {event.title}
              </h3>
              
              <div className="space-y-3 mb-8 mt-auto">
                <div className="flex items-center text-gray-500 text-sm">
                  <Calendar className="w-4 h-4 mr-3 text-emerald-500" />
                  {event.date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </div>
                <div className="flex items-center text-gray-500 text-sm">
                  <Clock className="w-4 h-4 mr-3 text-emerald-500" />
                  {event.date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div className="flex items-center text-gray-500 text-sm">
                  <MapPin className="w-4 h-4 mr-3 text-emerald-500" />
                  {event.location}
                </div>
              </div>
              
              <Link href={event.link} className="flex items-center justify-between w-full py-4 px-6 bg-gray-50 rounded-2xl text-gray-900 font-bold group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                <span>Save your spot</span>
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
