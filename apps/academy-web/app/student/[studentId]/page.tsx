"use client"

import { use, useState, useEffect } from "react"
import { useApi } from "@/lib/useApi"
import { QRCodeSVG } from "qrcode.react"
import {
  Star, Shield, Award, BookOpen, Briefcase, 
  GraduationCap, Phone, Mail, Droplets, Zap, 
  Target, Loader2, ArrowLeft, ExternalLink
} from "lucide-react"
import Link from "next/link"

const CAREER_SCORE_SEGMENTS = [
  { label: "Attendance", weight: 15, color: "#8b5cf6" },
  { label: "Assignments", weight: 15, color: "#3b82f6" },
  { label: "Projects", weight: 20, color: "#06b6d4" },
  { label: "Skills", weight: 20, color: "#10b981" },
  { label: "Communication", weight: 10, color: "#f59e0b" },
  { label: "Portfolio", weight: 10, color: "#f97316" },
  { label: "Interview", weight: 10, color: "#ec4899" },
]

function StarRating({ value }: { value: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} className={`w-4 h-4 ${i <= value ? "fill-amber-400 text-amber-400" : "text-white/20"}`} />
      ))}
    </div>
  )
}

function ScoreRing({ score }: { score: number }) {
  const radius = 70
  const circumference = 2 * Math.PI * radius
  const strokeDash = (score / 100) * circumference
  const color = score >= 75 ? "#10b981" : score >= 50 ? "#f59e0b" : "#ef4444"
  const label = score >= 80 ? "Job Ready" : score >= 60 ? "Near Ready" : score >= 40 ? "Developing" : "Early Stage"

  return (
    <div className="relative flex items-center justify-center animate-fade-in" style={{ width: 180, height: 180 }}>
      <svg width="180" height="180" className="-rotate-90">
        <circle cx="90" cy="90" r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="12" />
        <circle cx="90" cy="90" r={radius} fill="none" stroke={color}
          strokeWidth="12" strokeLinecap="round"
          strokeDasharray={`${strokeDash} ${circumference}`}
          style={{ filter: `drop-shadow(0 0 8px ${color})`, transition: "stroke-dasharray 1s ease" }} />
      </svg>
      <div className="absolute text-center">
        <div className="text-4xl font-black" style={{ color }}>{score}</div>
        <div className="text-xs text-white/40 mt-1">/ 100</div>
        <div className="text-[10px] font-bold mt-1" style={{ color }}>{label}</div>
      </div>
    </div>
  )
}

const SKILL_CATEGORIES = ["TECHNICAL", "TOOL", "SOFT", "DOMAIN"]

export default function PublicStudentPassportPage({ params }: { params: Promise<{ studentId: string }> }) {
  const resolvedParams = use(params)
  const studentId = resolvedParams.studentId

  const { data: passport, error, isLoading } = useApi<any>(`/academy/passport/${studentId}`)
  const [passportUrl, setPassportUrl] = useState("")

  useEffect(() => {
    if (typeof window !== "undefined") {
      setPassportUrl(window.location.href)
    }
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-white/50 gap-3">
        <Loader2 className="animate-spin w-8 h-8 text-violet-500" />
        <p className="text-sm font-medium tracking-wide">Retrieving Digital Passport...</p>
      </div>
    )
  }

  if (error || !passport) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-white p-6">
        <div className="max-w-md text-center bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl">
          <Shield className="w-12 h-12 text-rose-500 mx-auto mb-4 opacity-75" />
          <h2 className="text-xl font-bold mb-2">Passport Not Found</h2>
          <p className="text-sm text-white/40 mb-6">This credential ID is invalid or has expired.</p>
          <Link href="/academy" className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/15 border border-white/10 rounded-xl text-xs font-bold transition-all">
            <ArrowLeft className="w-4 h-4" /> Go to Grekam Academy
          </Link>
        </div>
      </div>
    )
  }

  const name = `${passport.user?.firstName || ''} ${passport.user?.lastName || ''}`.trim()
  const skills = passport.skills || []
  const skillsByCategory = SKILL_CATEGORIES.reduce((acc: any, cat) => {
    acc[cat] = skills.filter((s: any) => s.category === cat)
    return acc
  }, {})
  const careerScore = passport.careerScore || 0

  return (
    <div className="min-h-screen bg-[#050505] text-white p-4 sm:p-8 font-sans relative overflow-x-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-violet-600/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-cyan-600/10 blur-[150px] rounded-full pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Parent Portal Banner Callout */}
        <div className="mb-8 p-4 bg-violet-500/10 border border-violet-500/20 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <p className="text-xs font-bold text-violet-300">Are you a parent or guardian?</p>
            <p className="text-[10px] text-white/50 mt-0.5">Access the private parent dashboard to check attendance logs, fee installments, and performance SOPs.</p>
          </div>
          <Link href={`/portal/parent/${studentId}`} className="flex items-center gap-1.5 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-violet-600/15 shrink-0">
            Parent Login <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Digital ID Passport */}
          <div className="space-y-6">
            <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-tr from-violet-500/5 via-transparent to-cyan-500/5 pointer-events-none" />
              <div className="absolute top-0 right-0 w-36 h-36 bg-violet-500/10 blur-3xl rounded-full pointer-events-none" />

              <div className="p-6 relative">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <div className="text-[10px] text-white/40 tracking-[0.2em] uppercase font-mono">Grekam Academy</div>
                    <div className="text-[10px] text-violet-400 tracking-wider uppercase font-bold mt-0.5">Student Digital Passport</div>
                  </div>
                  <Shield className="w-6 h-6 text-violet-400" />
                </div>

                <div className="flex items-center gap-4 mb-6">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-3xl font-black border-2 border-white/10 shrink-0 shadow-lg">
                    {name.charAt(0)}
                  </div>
                  <div>
                    <h1 className="text-xl font-black">{name}</h1>
                    <p className="text-xs text-white/40 font-mono mt-1">{passport.studentCode}</p>
                    <div className={`inline-flex items-center gap-1.5 mt-2.5 text-[9px] px-2.5 py-1 rounded-full font-bold border ${
                      passport.isAlumni ? "bg-amber-500/10 text-amber-400 border-amber-500/20" : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    }`}>
                      <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                      {passport.isAlumni ? "ALUMNI" : "ACTIVE STUDENT"}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-6 text-xs">
                  {[
                    { label: "Email", value: passport.user?.email || "—" },
                    { label: "Phone", value: passport.user?.phone || "—" },
                    { label: "Blood Group", value: passport.bloodGroup || "—" },
                    { label: "Delivery", value: passport.deliveryMode },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-white/5 rounded-xl p-3 border border-white/5">
                      <div className="text-white/40 text-[9px] uppercase tracking-wider mb-1 font-semibold">{label}</div>
                      <div className="text-white font-medium truncate">{value}</div>
                    </div>
                  ))}
                </div>

                {passport.enrollments?.slice(0, 2).map((e: any) => (
                  <div key={e.id} className="bg-white/5 border border-white/5 rounded-xl p-3 mb-2 text-xs">
                    <div className="text-white/40 text-[9px] uppercase tracking-wider mb-1 font-semibold">Enrolled Course</div>
                    <div className="font-bold text-white leading-tight">{e.batch?.course?.name}</div>
                    <div className="text-violet-400 font-mono mt-1">{e.batch?.name}</div>
                  </div>
                ))}

                {passportUrl && (
                  <div className="mt-4 bg-white p-4 rounded-2xl flex items-center justify-between border border-white/10 shadow-sm">
                    <div className="text-black">
                      <div className="text-[9px] font-bold uppercase tracking-widest mb-1">Scan to Verify</div>
                      <div className="text-[8px] text-gray-500 font-mono">{passport.studentCode}</div>
                    </div>
                    <QRCodeSVG value={passportUrl} size={65} bgColor="#ffffff" fgColor="#000000" level="Q" />
                  </div>
                )}
              </div>
            </div>

            {/* Badges Earned */}
            {passport.badges?.length > 0 && (
              <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-5 backdrop-blur-md">
                <h3 className="text-sm font-bold mb-4 flex items-center gap-2"><Award className="w-4 h-4 text-amber-400" /> Badges Earned</h3>
                <div className="flex flex-wrap gap-2">
                  {passport.badges.map((b: any) => (
                    <div key={b.id} className="text-xs px-3 py-1.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full font-bold">
                      {b.badge?.name || 'Badge'}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Certificates */}
            {passport.Certificate?.length > 0 && (
              <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-5 backdrop-blur-md">
                <h3 className="text-sm font-bold mb-4 flex items-center gap-2"><BookOpen className="w-4 h-4 text-blue-400" /> Certificates</h3>
                <div className="space-y-2">
                  {passport.Certificate.map((c: any) => (
                    <div key={c.id} className="text-xs flex items-center gap-2 bg-blue-500/5 border border-blue-500/10 rounded-xl px-3 py-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                      <span className="text-white/70 font-medium">{c.course?.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Middle Column: Career Score Ring & Weights */}
          <div className="space-y-6">
            <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 backdrop-blur-md">
              <h2 className="text-sm font-bold uppercase tracking-widest text-white/40 mb-6 flex items-center gap-2">
                <Target className="w-4 h-4" /> Career Readiness Score
              </h2>
              <div className="flex justify-center mb-6">
                <ScoreRing score={careerScore} />
              </div>
              
              <div className="space-y-3 mt-8">
                {CAREER_SCORE_SEGMENTS.map(seg => (
                  <div key={seg.label} className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
                    <div className="flex-1 text-xs text-white/60 font-medium">{seg.label}</div>
                    <div className="text-xs text-white/30 font-mono">{seg.weight}%</div>
                    <div className="w-20 h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${Math.min(100, (careerScore / 100) * 100)}%`, backgroundColor: seg.color }} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 p-4 rounded-2xl bg-white/5 border border-white/5 text-center">
                <div className="text-xs text-white/40 mb-1">Status Report</div>
                <div className="text-sm text-white font-semibold leading-relaxed">
                  {careerScore >= 80 ? "This student is highly qualified and job-ready for placement." :
                   careerScore >= 60 ? "Near employment readiness. Focus on completing projects and skills." :
                   "Actively developing core skills and attendance milestones."}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Skill Matrix & Portfolio */}
          <div className="space-y-6">
            <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 backdrop-blur-md">
              <h2 className="text-sm font-bold uppercase tracking-widest text-white/40 flex items-center gap-2 mb-6">
                <Zap className="w-4 h-4 text-violet-400" /> Verified Skill Matrix
              </h2>

              {skills.length === 0 && (
                <div className="text-center py-8 text-white/20 text-sm">No verified skills published on this passport.</div>
              )}

              {SKILL_CATEGORIES.map(cat => {
                const catSkills = skillsByCategory[cat] || []
                if (catSkills.length === 0) return null
                const catColors: Record<string, string> = { TECHNICAL: "text-violet-400", TOOL: "text-cyan-400", SOFT: "text-amber-400", DOMAIN: "text-emerald-400" }
                return (
                  <div key={cat} className="mb-6">
                    <div className={`text-[10px] font-bold uppercase tracking-widest mb-3 ${catColors[cat]} font-mono`}>{cat}</div>
                    <div className="space-y-3">
                      {catSkills.map((skill: any) => (
                        <div key={skill.id} className="flex items-center justify-between group">
                          <div className="flex-1 text-sm text-white/80 truncate pr-4 font-medium">{skill.skillName}</div>
                          <StarRating value={skill.rating} />
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Portfolio Projects */}
            {passport.portfolioProfile?.projects?.length > 0 && (
              <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-5 backdrop-blur-md">
                <h3 className="text-sm font-bold mb-4 flex items-center gap-2"><Briefcase className="w-4 h-4 text-emerald-400" /> Portfolio Projects</h3>
                <div className="space-y-3">
                  {passport.portfolioProfile.projects.map((p: any) => (
                    <div key={p.id} className="text-xs bg-emerald-500/5 border border-emerald-500/10 rounded-xl px-4 py-3 text-white/70 flex justify-between items-center">
                      <span className="font-bold">{p.title}</span>
                      {p.projectUrl && (
                        <a href={p.projectUrl} target="_blank" rel="noreferrer" className="text-emerald-400 hover:text-emerald-300 font-bold hover:underline">View Project</a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
