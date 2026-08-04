import { ChevronDown, PlayCircle, FileText, MonitorPlay } from "lucide-react"

export function CurriculumSection({ modules }: { modules: any[] }) {
  if (!modules || modules.length === 0) return null;

  return (
    <section id="curriculum" className="py-24 px-4 bg-[#050505] border-t border-white/5">
      <div className="container mx-auto max-w-4xl text-[#FAFAF8]">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
            Course Curriculum
          </h2>
          <p className="text-[#A1A1AA] text-lg">
            Everything you need to master this craft, step by step.
          </p>
        </div>

        <div className="space-y-4">
          {modules.map((module: any, mi: number) => (
            <details
              key={module.id}
              className="group bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-white/15 transition-colors"
              open={mi === 0}
            >
              <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                <div className="flex items-center gap-4">
                  <span className="text-xs font-black tracking-widest uppercase px-4 py-1.5 rounded-full bg-gradient-to-r from-[#FF6B35] to-[#FF9F6B] text-white shadow-lg">
                    Module {mi + 1}
                  </span>
                  <h3 className="font-bold text-xl tracking-tight">{module.title}</h3>
                </div>
                <ChevronDown className="w-5 h-5 text-[#A1A1AA] group-open:rotate-180 transition-transform flex-shrink-0" />
              </summary>

              <div className="border-t border-white/5 bg-black/20">
                <ul className="divide-y divide-white/5">
                  {module.lessons && module.lessons.length > 0 ? (
                    module.lessons.map((lesson: any, li: number) => (
                      <li key={lesson.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0 text-[#A1A1AA]">
                            {lesson.type === 'VIDEO' ? <PlayCircle className="w-4 h-4" /> :
                             lesson.type === 'PDF' || lesson.type === 'TEXT' ? <FileText className="w-4 h-4" /> :
                             <MonitorPlay className="w-4 h-4" />}
                          </div>
                          <div>
                            <p className="font-medium text-sm md:text-base">{lesson.title}</p>
                            <span className="text-xs text-[#A1A1AA] capitalize">{lesson.type.toLowerCase()}</span>
                          </div>
                        </div>
                        {lesson.duration && (
                          <div className="text-xs text-[#A1A1AA] bg-white/5 px-2 py-1 rounded">
                            {lesson.duration} min
                          </div>
                        )}
                      </li>
                    ))
                  ) : (
                    <li className="p-6 text-center text-sm text-[#A1A1AA]">No lessons added yet.</li>
                  )}
                </ul>
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
