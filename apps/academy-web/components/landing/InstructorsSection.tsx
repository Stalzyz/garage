import { prisma } from "../../src/lib/prisma";
import Image from "next/image";

export async function InstructorsSection() {
  let educators: any[] = [];
  try {
    educators = await prisma.educator.findMany({
      where: {
        verificationStatus: "VERIFIED"
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            avatarUrl: true,
          }
        }
      },
      take: 4,
    });
  } catch (error) {
    console.warn("Could not fetch educators from database during build.");
  }

  if (!educators || educators.length === 0) return null;

  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-black mb-6 text-foreground tracking-tight font-sans">
            Learn from Industry Experts
          </h2>
          <p className="text-xl text-muted-foreground font-handwriting">
            Our mentors don't just teach. They work at top companies and bring real-world experience to the classroom.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {educators.map((educator) => (
            <div key={educator.id} className="group relative bg-[#0d0d0d] border border-white/10 rounded-3xl overflow-hidden hover:shadow-[0_8px_30px_rgba(16,185,129,0.2)] transition-all duration-500">
              <div className="aspect-[4/5] relative bg-white/5">
                {educator.user.avatarUrl ? (
                  <Image
                    src={educator.user.avatarUrl}
                    alt={`${educator.user.firstName} ${educator.user.lastName}`}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-emerald-500/20 to-teal-900/40 text-emerald-500">
                    <span className="text-6xl font-black">{educator.user.firstName[0]}</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
              </div>
              
              <div className="absolute bottom-0 left-0 w-full p-6">
                <h3 className="text-2xl font-bold text-white mb-1">
                  {educator.user.firstName} {educator.user.lastName}
                </h3>
                <p className="text-emerald-400 font-medium text-sm mb-3">
                  {educator.designation} {educator.company ? `at ${educator.company}` : ''}
                </p>
                {educator.skills && educator.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {educator.skills.slice(0, 3).map((skill: string) => (
                      <span key={skill} className="text-xs px-2.5 py-1 rounded-full bg-white/10 text-white/80 backdrop-blur-md border border-white/5">
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
