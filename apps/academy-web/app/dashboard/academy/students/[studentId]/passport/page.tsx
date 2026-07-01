"use client"

import { useState, use } from "react"
import { useApi, fetchApi } from "@/lib/useApi"
import { QRCodeSVG } from "qrcode.react"
import { toast } from "sonner"
import {
  ArrowLeft, Star, Plus, X, Loader2, Shield, Award,
  BookOpen, Briefcase, GraduationCap, Heart, Phone, Mail,
  Edit2, Check, Droplets, Zap, Target
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

function StarRating({ value, onChange }: { value: number; onChange?: (v: number) => void }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <button key={i} onClick={() => onChange?.(i)} type="button"
          className={`transition-transform hover:scale-110 ${onChange ? "cursor-pointer" : "cursor-default"}`}>
          <Star className={`w-4 h-4 ${i <= value ? "fill-amber-400 text-amber-400" : "text-white/20"}`} />
        </button>
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
    <div className="relative flex items-center justify-center" style={{ width: 180, height: 180 }}>
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

export default function StudentPassportPage({ params }: { params: Promise<{ studentId: string }> }) {
  const resolvedParams = use(params)
  const studentId = resolvedParams.studentId

  const { data: passport, mutate, isLoading } = useApi<any>(`/academy/passport/${studentId}`)
  const [addSkillOpen, setAddSkillOpen] = useState(false)
  const [skillForm, setSkillForm] = useState({ skillName: "", category: "TECHNICAL", rating: 3, notes: "" })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingSkill, setEditingSkill] = useState<string | null>(null)

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await fetchApi(`/academy/passport/${studentId}/skills`, {
        method: "POST",
        body: JSON.stringify(skillForm)
      })
      toast.success("Skill updated!")
      setAddSkillOpen(false)
      setSkillForm({ skillName: "", category: "TECHNICAL", rating: 3, notes: "" })
      mutate()
    } catch (err: any) {
      toast.error(err.message || "Failed to save skill")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRatingChange = async (skillId: string, skillName: string, category: string, newRating: number) => {
    try {
      await fetchApi(`/academy/passport/${studentId}/skills`, {
        method: "POST",
        body: JSON.stringify({ skillName, category, rating: newRating })
      })
      toast.success(`${skillName} updated to ${newRating}★`)
      mutate()
    } catch (err: any) {
      toast.error(err.message || "Failed to update rating")
    }
  }

  const handleDeleteSkill = async (skillId: string) => {
    try {
      await fetchApi(`/academy/passport/${studentId}/skills/${skillId}`, { method: "DELETE" })
      toast.success("Skill removed")
      mutate()
    } catch (err: any) {
      toast.error(err.message || "Failed to delete skill")
    }
  }

  if (isLoading && !passport) {
    return <div className="flex h-full items-center justify-center text-white"><Loader2 className="animate-spin w-6 h-6" /></div>
  }
  if (!passport) return <div className="flex h-full items-center justify-center text-white/40">Student not found.</div>

  const name = `${passport.user?.firstName || ''} ${passport.user?.lastName || ''}`.trim()
  const skills = passport.skills || []
  const skillsByCategory = SKILL_CATEGORIES.reduce((acc: any, cat) => {
    acc[cat] = skills.filter((s: any) => s.category === cat)
    return acc
  }, {})
  const careerScore = passport.careerScore || 0
  const passportUrl = `${typeof window !== 'undefined' ? window.location.origin : 'https://akademi.grekam.in'}/student/${studentId}`

  return (
    <div className="flex flex-col min-h-full bg-[#050505] text-white p-8 overflow-auto">
      <Link href="/dashboard/academy/students/onsite" className="flex items-center gap-2 text-white/40 hover:text-white text-sm mb-8 w-fit transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Students
      </Link>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* ── Left: ID Card ─────────────────────────────────────────────── */}
        <div className="xl:col-span-1 space-y-4">

          {/* Physical ID Card */}
          <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460]">
            {/* Holographic shimmer */}
            <div className="absolute inset-0 bg-gradient-to-tr from-violet-500/5 via-transparent to-cyan-500/5 pointer-events-none" />
            <div className="absolute top-0 right-0 w-40 h-40 bg-violet-500/10 blur-3xl rounded-full pointer-events-none" />

            <div className="relative p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="text-[10px] text-white/40 tracking-[0.2em] uppercase">Grekam Academy</div>
                  <div className="text-[10px] text-violet-400 tracking-widest uppercase font-bold">Student Digital Passport</div>
                </div>
                <Shield className="w-6 h-6 text-violet-400" />
              </div>

              {/* Avatar + Name */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-3xl font-black border-2 border-white/10 shrink-0">
                  {name.charAt(0)}
                </div>
                <div>
                  <h1 className="text-xl font-black">{name}</h1>
                  <p className="text-xs text-white/40 font-mono mt-1">{passport.studentCode}</p>
                  <div className={`inline-flex items-center gap-1.5 mt-2 text-[10px] px-2 py-1 rounded-full font-bold
                    ${passport.isAlumni ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"}`}>
                    <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                    {passport.isAlumni ? "ALUMNI" : "ACTIVE STUDENT"}
                  </div>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-3 mb-6 text-xs">
                {[
                  { icon: Mail, label: "Email", value: passport.user?.email },
                  { icon: Phone, label: "Phone", value: passport.user?.phone || "—" },
                  { icon: Droplets, label: "Blood Group", value: passport.bloodGroup || "—" },
                  { icon: GraduationCap, label: "Delivery", value: passport.deliveryMode },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="bg-white/5 rounded-xl p-3">
                    <div className="flex items-center gap-1.5 text-white/40 mb-1"><Icon className="w-3 h-3" />{label}</div>
                    <div className="text-white font-medium truncate">{value}</div>
                  </div>
                ))}
              </div>

              {/* Enrollments */}
              {passport.enrollments?.slice(0, 2).map((e: any) => (
                <div key={e.id} className="bg-white/5 rounded-xl p-3 mb-2 text-xs">
                  <div className="text-white/40 mb-0.5">Enrolled Course</div>
                  <div className="font-bold text-white">{e.batch?.course?.name}</div>
                  <div className="text-violet-400">{e.batch?.name}</div>
                </div>
              ))}

              {/* QR Code */}
              <div className="mt-4 bg-white p-4 rounded-2xl flex items-center justify-between">
                <div className="text-black">
                  <div className="text-[9px] font-bold uppercase tracking-widest mb-1">Scan to Verify</div>
                  <div className="text-[8px] text-gray-500">{passport.studentCode}</div>
                </div>
                <QRCodeSVG value={passportUrl} size={70} bgColor="#ffffff" fgColor="#000000" level="Q" />
              </div>
            </div>
          </div>

          {/* Badges */}
          {passport.badges?.length > 0 && (
            <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-5">
              <h3 className="text-sm font-bold mb-4 flex items-center gap-2"><Award className="w-4 h-4 text-amber-400" /> Badges</h3>
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
            <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-5">
              <h3 className="text-sm font-bold mb-4 flex items-center gap-2"><BookOpen className="w-4 h-4 text-blue-400" /> Certificates</h3>
              <div className="space-y-2">
                {passport.Certificate.map((c: any) => (
                  <div key={c.id} className="text-xs flex items-center gap-2 bg-blue-500/5 border border-blue-500/10 rounded-xl px-3 py-2">
                    <Check className="w-3 h-3 text-blue-400 shrink-0" />
                    <span className="text-white/70">{c.course?.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Center: Career Score ──────────────────────────────────────── */}
        <div className="xl:col-span-1 space-y-4">
          <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-6">
            <h2 className="text-sm font-bold uppercase tracking-widest text-white/40 mb-6 flex items-center gap-2">
              <Target className="w-4 h-4" /> Career Readiness Score
            </h2>
            <div className="flex justify-center mb-6">
              <ScoreRing score={careerScore} />
            </div>
            <div className="space-y-3">
              {CAREER_SCORE_SEGMENTS.map(seg => (
                <div key={seg.label} className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
                  <div className="flex-1 text-xs text-white/60">{seg.label}</div>
                  <div className="text-xs text-white/30">{seg.weight}%</div>
                  <div className="w-20 h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${Math.min(100, (careerScore / 100) * 100)}%`, backgroundColor: seg.color }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 p-4 rounded-2xl bg-white/5 border border-white/5 text-center">
              <div className="text-xs text-white/40 mb-1">What this means</div>
              <div className="text-sm text-white font-medium">
                {careerScore >= 80 ? "This student is ready for placement and employer interviews." :
                 careerScore >= 60 ? "Solid progress. Focus on projects and skills to reach 80+." :
                 careerScore >= 40 ? "Keep building. Consistent attendance and assignments will lift the score." :
                 "Early stage. Guide this student to attend regularly and submit work."}
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          {passport.emergencyContact && (
            <div className="bg-red-500/5 border border-red-500/10 rounded-2xl p-5">
              <h3 className="text-sm font-bold mb-3 flex items-center gap-2 text-red-400"><Heart className="w-4 h-4" /> Emergency Contact</h3>
              <div className="text-sm text-white/70">
                {(() => { try { const c = JSON.parse(passport.emergencyContact); return `${c.name} · ${c.relation} · ${c.phone}` } catch { return passport.emergencyContact } })()}
              </div>
            </div>
          )}
        </div>

        {/* ── Right: Skill Matrix ───────────────────────────────────────── */}
        <div className="xl:col-span-1 space-y-4">
          <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-sm font-bold uppercase tracking-widest text-white/40 flex items-center gap-2">
                <Zap className="w-4 h-4" /> Skill Matrix
              </h2>
              <button onClick={() => setAddSkillOpen(true)}
                className="flex items-center gap-1.5 text-xs font-bold bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-2 rounded-xl transition-colors">
                <Plus className="w-3 h-3" /> Add Skill
              </button>
            </div>

            {skills.length === 0 && (
              <div className="text-center py-8 text-white/20 text-sm">No skills added yet. Click "Add Skill" to begin building this student's matrix.</div>
            )}

            {SKILL_CATEGORIES.map(cat => {
              const catSkills = skillsByCategory[cat] || []
              if (catSkills.length === 0) return null
              const catColors: Record<string, string> = { TECHNICAL: "text-violet-400", TOOL: "text-cyan-400", SOFT: "text-amber-400", DOMAIN: "text-emerald-400" }
              return (
                <div key={cat} className="mb-5">
                  <div className={`text-[10px] font-bold uppercase tracking-widest mb-3 ${catColors[cat]}`}>{cat}</div>
                  <div className="space-y-2">
                    {catSkills.map((skill: any) => (
                      <div key={skill.id} className="flex items-center gap-3 group">
                        <div className="flex-1 text-sm text-white/80 truncate">{skill.skillName}</div>
                        <StarRating value={skill.rating}
                          onChange={(v) => handleRatingChange(skill.id, skill.skillName, skill.category, v)} />
                        <button onClick={() => handleDeleteSkill(skill.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <X className="w-3 h-3 text-white/30 hover:text-red-400" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Portfolio preview */}
          {passport.portfolioProfile?.projects?.length > 0 && (
            <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-5">
              <h3 className="text-sm font-bold mb-4 flex items-center gap-2"><Briefcase className="w-4 h-4 text-emerald-400" /> Portfolio Projects</h3>
              <div className="space-y-2">
                {passport.portfolioProfile.projects.map((p: any) => (
                  <div key={p.id} className="text-xs bg-emerald-500/5 border border-emerald-500/10 rounded-xl px-3 py-2 text-white/70">{p.title}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Skill Modal */}
      {addSkillOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-[#111] border border-white/10 rounded-2xl p-8 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Add / Update Skill</h2>
              <button onClick={() => setAddSkillOpen(false)}><X className="w-5 h-5 text-white/50 hover:text-white" /></button>
            </div>
            <form onSubmit={handleAddSkill} className="space-y-4">
              <div>
                <label className="text-xs text-white/50 uppercase tracking-widest block mb-2">Skill Name</label>
                <input required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm"
                  placeholder="e.g. Figma, Communication, React"
                  value={skillForm.skillName} onChange={e => setSkillForm(p => ({...p, skillName: e.target.value}))} />
              </div>
              <div>
                <label className="text-xs text-white/50 uppercase tracking-widest block mb-2">Category</label>
                <select className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm"
                  value={skillForm.category} onChange={e => setSkillForm(p => ({...p, category: e.target.value}))}>
                  <option value="TECHNICAL">Technical</option>
                  <option value="TOOL">Tool / Software</option>
                  <option value="SOFT">Soft Skill</option>
                  <option value="DOMAIN">Domain Knowledge</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-white/50 uppercase tracking-widest block mb-2">Rating</label>
                <div className="flex gap-2 items-center">
                  <StarRating value={skillForm.rating} onChange={(v) => setSkillForm(p => ({...p, rating: v}))} />
                  <span className="text-xs text-white/40">{skillForm.rating} / 5</span>
                </div>
              </div>
              <div>
                <label className="text-xs text-white/50 uppercase tracking-widest block mb-2">Mentor Notes (optional)</label>
                <input className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm"
                  placeholder="e.g. Excellent with Figma auto-layout"
                  value={skillForm.notes} onChange={e => setSkillForm(p => ({...p, notes: e.target.value}))} />
              </div>
              <button type="submit" disabled={isSubmitting}
                className="w-full bg-white text-black font-bold py-3 rounded-xl hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2">
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Skill"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
