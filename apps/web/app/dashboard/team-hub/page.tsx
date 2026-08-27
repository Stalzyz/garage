"use client"

import { useState, useRef, useEffect } from "react"
import { 
  Trophy, Target, Megaphone, Sparkles, Flame, Heart, 
  PartyPopper, Award, Plus, Send, Calendar, CheckCircle2,
  Zap, MessageCircle, Star, ShieldAlert, Pin, User
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useApi, fetchApi } from "@/lib/useApi"
import { SlideOver } from "@/components/SlideOver"
import { toast } from "sonner"

// Confetti Particle System
function triggerConfetti() {
  if (typeof window === "undefined") return
  const canvas = document.createElement("canvas")
  canvas.style.position = "fixed"
  canvas.style.inset = "0"
  canvas.style.width = "100vw"
  canvas.style.height = "100vh"
  canvas.style.pointerEvents = "none"
  canvas.style.zIndex = "9999"
  document.body.appendChild(canvas)

  const ctx = canvas.getContext("2d")
  if (!ctx) return

  canvas.width = window.innerWidth
  canvas.height = window.innerHeight

  const particles: any[] = []
  const colors = ["#ff007a", "#00f0ff", "#ffd700", "#39ff14", "#ff5500", "#a855f7"]

  for (let i = 0; i < 90; i++) {
    particles.push({
      x: canvas.width / 2,
      y: canvas.height / 2,
      vx: (Math.random() - 0.5) * 18,
      vy: (Math.random() - 0.7) * 18,
      size: Math.random() * 8 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 10,
      opacity: 1
    })
  }

  let animationFrame: number
  const render = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    let active = false

    particles.forEach(p => {
      p.x += p.vx
      p.y += p.vy
      p.vy += 0.4 // gravity
      p.opacity -= 0.015
      p.rotation += p.rotationSpeed

      if (p.opacity > 0) {
        active = true
        ctx.save()
        ctx.globalAlpha = p.opacity
        ctx.translate(p.x, p.y)
        ctx.rotate((p.rotation * Math.PI) / 180)
        ctx.fillStyle = p.color
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size)
        ctx.restore()
      }
    })

    if (active) {
      animationFrame = requestAnimationFrame(render)
    } else {
      canvas.remove()
    }
  }
  render()
}

// Graffiti Theme Styles
const GRAFFITI_THEMES: Record<string, { card: string; glow: string; textGlow: string; border: string }> = {
  CYBERPUNK_NEON: {
    card: "bg-gradient-to-br from-[#0c0f1d] via-[#150a21] to-[#091524]",
    glow: "shadow-[0_0_30px_rgba(255,0,122,0.25)] hover:shadow-[0_0_45px_rgba(0,240,255,0.4)]",
    textGlow: "drop-shadow-[0_0_10px_rgba(0,240,255,0.8)] text-cyan-400 font-black",
    border: "border-cyan-500/40 hover:border-pink-500/60"
  },
  GOLD_GLOW: {
    card: "bg-gradient-to-br from-[#1a1506] via-[#120e03] to-[#241a05]",
    glow: "shadow-[0_0_30px_rgba(255,215,0,0.2)] hover:shadow-[0_0_45px_rgba(255,215,0,0.4)]",
    textGlow: "drop-shadow-[0_0_10px_rgba(255,215,0,0.8)] text-amber-300 font-black",
    border: "border-amber-500/40 hover:border-yellow-400/60"
  },
  FIRE_STORM: {
    card: "bg-gradient-to-br from-[#1c0808] via-[#210905] to-[#120404]",
    glow: "shadow-[0_0_30px_rgba(255,85,0,0.25)] hover:shadow-[0_0_45px_rgba(255,85,0,0.45)]",
    textGlow: "drop-shadow-[0_0_10px_rgba(255,85,0,0.8)] text-orange-400 font-black",
    border: "border-orange-500/40 hover:border-red-500/60"
  },
  RETRO_WAVE: {
    card: "bg-gradient-to-br from-[#150721] via-[#10051a] to-[#210729]",
    glow: "shadow-[0_0_30px_rgba(168,85,247,0.25)] hover:shadow-[0_0_45px_rgba(236,72,153,0.45)]",
    textGlow: "drop-shadow-[0_0_10px_rgba(168,85,247,0.8)] text-purple-300 font-black",
    border: "border-purple-500/40 hover:border-pink-500/60"
  }
}

const BADGES: Record<string, { label: string; icon: any; color: string }> = {
  PROJECT_HERO:     { label: "Project Hero",      icon: Trophy,      color: "text-amber-400 bg-amber-500/10 border-amber-500/30" },
  TOP_CLOSER:       { label: "Top Closer",        icon: Target,      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" },
  BUG_HUNTER:       { label: "Bug Hunter",        icon: Zap,         color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/30" },
  INNOVATOR:        { label: "Innovator",         icon: Sparkles,    color: "text-purple-400 bg-purple-500/10 border-purple-500/30" },
  MILESTONE_MASTER: { label: "Milestone Master", icon: PartyPopper, color: "text-pink-400 bg-pink-500/10 border-pink-500/30" }
}

export default function TeamHubDashboard() {
  const { data: achievementsData, mutate: mutateAchievements } = useApi<{ data: any[] }>("/team/achievements")
  const { data: goalsData, mutate: mutateGoals } = useApi<{ data: any[] }>("/team/goals")
  const { data: announcementsData, mutate: mutateAnnouncements } = useApi<{ data: any[] }>("/team/announcements")

  const achievements = achievementsData?.data || []
  const goals = goalsData?.data || []
  const announcements = announcementsData?.data || []

  // Active Tab: WINS | GOALS | ANNOUNCEMENTS
  const [activeTab, setActiveTab] = useState<"WINS" | "GOALS" | "ANNOUNCEMENTS">("WINS")

  // Modal States
  const [isWinModalOpen, setIsWinModalOpen] = useState(false)
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false)
  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false)

  // Forms
  const [winForm, setWinForm] = useState({
    title: "",
    description: "",
    badge: "PROJECT_HERO",
    graffitiTheme: "CYBERPUNK_NEON"
  })

  const [goalForm, setGoalForm] = useState({
    title: "",
    description: "",
    targetValue: 100,
    currentValue: 0,
    unit: "%",
    dueDate: ""
  })

  const [announcementForm, setAnnouncementForm] = useState({
    title: "",
    content: "",
    category: "GENERAL",
    isPinned: false
  })

  // Wish input state map { [achievementId]: string }
  const [wishInputs, setWishInputs] = useState<Record<string, string>>({})

  // Handlers
  const handleCreateWin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!winForm.title.trim() || !winForm.description.trim()) {
      return toast.error("Please provide title and description")
    }

    try {
      await fetchApi("/team/achievements", {
        method: "POST",
        body: JSON.stringify(winForm)
      })
      toast.success("Achievement posted to Team Wall!")
      triggerConfetti()
      setIsWinModalOpen(false)
      setWinForm({ title: "", description: "", badge: "PROJECT_HERO", graffitiTheme: "CYBERPUNK_NEON" })
      mutateAchievements()
    } catch (err: any) {
      toast.error(err.message || "Failed to post win")
    }
  }

  const handleReactToWin = async (achievementId: string, emoji: string) => {
    try {
      triggerConfetti()
      await fetchApi(`/team/achievements/${achievementId}/react`, {
        method: "POST",
        body: JSON.stringify({ emoji })
      })
      mutateAchievements()
    } catch (err: any) {
      toast.error(err.message || "Failed to react")
    }
  }

  const handlePostWish = async (achievementId: string) => {
    const text = wishInputs[achievementId]
    if (!text || !text.trim()) return toast.error("Please enter a wish message")

    try {
      triggerConfetti()
      await fetchApi(`/team/achievements/${achievementId}/wish`, {
        method: "POST",
        body: JSON.stringify({ text: text.trim() })
      })
      toast.success("Wish shared!")
      setWishInputs(prev => ({ ...prev, [achievementId]: "" }))
      mutateAchievements()
    } catch (err: any) {
      toast.error(err.message || "Failed to post wish")
    }
  }

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!goalForm.title.trim() || !goalForm.dueDate) return toast.error("Title and due date required")

    try {
      await fetchApi("/team/goals", {
        method: "POST",
        body: JSON.stringify(goalForm)
      })
      toast.success("Team goal initialized!")
      setIsGoalModalOpen(false)
      mutateGoals()
    } catch (err: any) {
      toast.error(err.message || "Failed to create goal")
    }
  }

  const handleUpdateGoalProgress = async (goalId: string, currentValue: number, targetValue: number) => {
    const status = currentValue >= targetValue ? "COMPLETED" : "ON_TRACK"
    try {
      await fetchApi(`/team/goals/${goalId}`, {
        method: "PATCH",
        body: JSON.stringify({ currentValue, status })
      })
      if (status === "COMPLETED") triggerConfetti()
      toast.success("Goal progress updated!")
      mutateGoals()
    } catch (err: any) {
      toast.error(err.message || "Failed to update goal")
    }
  }

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!announcementForm.title.trim() || !announcementForm.content.trim()) return toast.error("Title and content required")

    try {
      await fetchApi("/team/announcements", {
        method: "POST",
        body: JSON.stringify(announcementForm)
      })
      toast.success("Announcement broadcasted!")
      setIsAnnouncementModalOpen(false)
      mutateAnnouncements()
    } catch (err: any) {
      toast.error(err.message || "Failed to broadcast announcement")
    }
  }

  return (
    <div className="flex flex-col h-full min-h-0 overflow-hidden bg-transparent text-white relative font-sans">
      
      {/* Dynamic Background Blurs */}
      <div className="absolute top-0 left-1/4 w-[50%] h-[40%] bg-purple-600/10 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[50%] h-[40%] bg-pink-600/10 blur-[140px] rounded-full pointer-events-none" />

      {/* Header Bar */}
      <div className="flex-none px-8 py-6 border-b border-white/10 bg-black/30 backdrop-blur-md relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500 via-purple-600 to-cyan-400 p-0.5 shadow-[0_0_25px_rgba(236,72,153,0.3)]">
              <div className="w-full h-full bg-[#0d0914] rounded-[14px] flex items-center justify-center">
                <Trophy className="w-6 h-6 text-pink-400 animate-pulse" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-pink-200 to-cyan-300">
                Team Pulse & Wins Wall
              </h1>
              <p className="text-xs font-mono tracking-widest uppercase text-white/40 mt-0.5">
                Graffiti Achievements • Team Targets • Company Broadcasts
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            {activeTab === "WINS" && (
              <button
                onClick={() => setIsWinModalOpen(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white font-black tracking-wider uppercase text-[11px] px-6 py-3 rounded-xl shadow-[0_0_25px_rgba(236,72,153,0.4)] transition-all hover:scale-105"
              >
                <PartyPopper className="w-4 h-4" /> Share Achievement
              </button>
            )}

            {activeTab === "GOALS" && (
              <button
                onClick={() => setIsGoalModalOpen(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold tracking-wider uppercase text-[11px] px-6 py-3 rounded-xl shadow-[0_0_25px_rgba(6,182,212,0.4)] transition-all hover:scale-105"
              >
                <Target className="w-4 h-4" /> Set Team Goal
              </button>
            )}

            {activeTab === "ANNOUNCEMENTS" && (
              <button
                onClick={() => setIsAnnouncementModalOpen(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-bold tracking-wider uppercase text-[11px] px-6 py-3 rounded-xl shadow-[0_0_25px_rgba(245,158,11,0.4)] transition-all hover:scale-105"
              >
                <Megaphone className="w-4 h-4" /> Broadcast Announcement
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("WINS")}
            className={`px-5 py-2.5 rounded-xl text-xs font-mono font-bold tracking-widest uppercase transition-all flex items-center gap-2 border ${
              activeTab === "WINS" 
                ? "bg-gradient-to-r from-pink-500/20 to-purple-500/20 text-pink-300 border-pink-500/40 shadow-[0_0_20px_rgba(236,72,153,0.2)]" 
                : "bg-white/5 text-white/40 border-white/10 hover:text-white"
            }`}
          >
            <Trophy className="w-4 h-4" /> Wins & Achievements ({achievements.length})
          </button>
          <button
            onClick={() => setActiveTab("GOALS")}
            className={`px-5 py-2.5 rounded-xl text-xs font-mono font-bold tracking-widest uppercase transition-all flex items-center gap-2 border ${
              activeTab === "GOALS" 
                ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border-cyan-500/40 shadow-[0_0_20px_rgba(6,182,212,0.2)]" 
                : "bg-white/5 text-white/40 border-white/10 hover:text-white"
            }`}
          >
            <Target className="w-4 h-4" /> Team Goals ({goals.length})
          </button>
          <button
            onClick={() => setActiveTab("ANNOUNCEMENTS")}
            className={`px-5 py-2.5 rounded-xl text-xs font-mono font-bold tracking-widest uppercase transition-all flex items-center gap-2 border ${
              activeTab === "ANNOUNCEMENTS" 
                ? "bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.2)]" 
                : "bg-white/5 text-white/40 border-white/10 hover:text-white"
            }`}
          >
            <Megaphone className="w-4 h-4" /> Announcements ({announcements.length})
          </button>
        </div>
      </div>

      {/* Main View Area */}
      <div className="flex-1 overflow-y-auto p-8 relative z-10">
        
        {/* TAB 1: GRAFFITI ACHIEVEMENTS & WINS WALL */}
        {activeTab === "WINS" && (
          <div className="space-y-6">
            {achievements.length === 0 ? (
              <div className="text-center py-24 border border-dashed border-white/10 rounded-3xl bg-black/20 backdrop-blur-md">
                <Trophy className="w-12 h-12 text-pink-400/40 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-white">No Achievements Shared Yet</h3>
                <p className="text-xs text-white/40 max-w-sm mx-auto mt-1 mb-6">
                  Be the first to share a project milestone, closed deal, or team win with vibrant graffiti animations!
                </p>
                <button
                  onClick={() => setIsWinModalOpen(true)}
                  className="bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs uppercase px-5 py-2.5 rounded-xl transition-all"
                >
                  Share First Win
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {achievements.map((item: any) => {
                  const theme = GRAFFITI_THEMES[item.graffitiTheme] || GRAFFITI_THEMES.CYBERPUNK_NEON
                  const badgeInfo = BADGES[item.badge] || BADGES.PROJECT_HERO
                  const BadgeIcon = badgeInfo.icon
                  const reactions = item.reactions || {}
                  const wishes = item.wishes || []

                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`relative border rounded-3xl p-6 transition-all duration-300 ${theme.card} ${theme.border} ${theme.glow} backdrop-blur-xl overflow-hidden group`}
                    >
                      {/* Graffiti Spray Background Overlay Effect */}
                      <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-pink-500/10 via-purple-500/5 to-transparent blur-3xl pointer-events-none" />

                      {/* Author & Badge Header */}
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-sm font-bold text-pink-300">
                            {item.authorName?.charAt(0) || "U"}
                          </div>
                          <div>
                            <h4 className="font-bold text-white text-sm">{item.authorName}</h4>
                            <p className="text-[10px] font-mono text-white/40 uppercase tracking-widest">
                              {item.authorRole || "Staff Member"} • {new Date(item.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-xl border text-[10px] font-mono font-bold uppercase tracking-wider ${badgeInfo.color}`}>
                          <BadgeIcon className="w-3.5 h-3.5" />
                          <span>{badgeInfo.label}</span>
                        </div>
                      </div>

                      {/* Achievement Title & Description with Graffiti Glow */}
                      <div className="mb-6">
                        <h3 className={`text-xl mb-2 tracking-tight ${theme.textGlow}`}>
                          {item.title}
                        </h3>
                        <p className="text-xs text-white/75 leading-relaxed bg-black/30 p-3.5 rounded-xl border border-white/5">
                          {item.description}
                        </p>
                      </div>

                      {/* Quick Emoji Reaction Buttons */}
                      <div className="flex flex-wrap items-center gap-2 mb-6 pt-4 border-t border-white/10">
                        {["🎉", "🔥", "👏", "❤️", "🏆"].map(emoji => (
                          <button
                            key={emoji}
                            onClick={() => handleReactToWin(item.id, emoji)}
                            className="flex items-center gap-1.5 bg-white/5 hover:bg-white/15 border border-white/10 hover:border-white/30 px-3 py-1.5 rounded-xl text-xs transition-all hover:scale-110 active:scale-95"
                          >
                            <span>{emoji}</span>
                            <span className="font-mono font-bold text-[10px] text-white/70">
                              {reactions[emoji] || 0}
                            </span>
                          </button>
                        ))}
                      </div>

                      {/* Wishes & Congratulations Feed */}
                      <div className="bg-black/40 border border-white/10 rounded-2xl p-4 space-y-3">
                        <h5 className="text-[10px] font-mono uppercase tracking-widest text-white/40 font-bold flex items-center gap-1.5">
                          <Sparkles className="w-3 h-3 text-pink-400" /> Staff Wishes & Kudos ({wishes.length})
                        </h5>

                        {/* Existing Wishes */}
                        <div className="space-y-2 max-h-36 overflow-y-auto custom-scrollbar">
                          {wishes.length === 0 ? (
                            <p className="text-[11px] text-white/30 italic">Be the first to wish them!</p>
                          ) : (
                            wishes.map((w: any) => (
                              <div key={w.id} className="bg-white/5 border border-white/5 rounded-xl p-2.5 text-xs">
                                <div className="flex justify-between items-center mb-1">
                                  <span className="font-bold text-pink-300 text-[11px]">{w.authorName}</span>
                                  <span className="text-[9px] font-mono text-white/30">
                                    {new Date(w.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                                <p className="text-white/80 text-[11px]">{w.text}</p>
                              </div>
                            ))
                          )}
                        </div>

                        {/* Input Box to Send Wish */}
                        <div className="flex gap-2 pt-2 border-t border-white/5">
                          <input
                            value={wishInputs[item.id] || ""}
                            onChange={e => setWishInputs({ ...wishInputs, [item.id]: e.target.value })}
                            onKeyDown={e => { if (e.key === "Enter") handlePostWish(item.id) }}
                            placeholder="Send congratulations or wish them..."
                            className="flex-1 bg-black/60 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-pink-500/50"
                          />
                          <button
                            onClick={() => handlePostWish(item.id)}
                            className="bg-pink-600 hover:bg-pink-500 text-white p-2 rounded-xl transition-all"
                            title="Send Wish"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: TEAM GOALS & TARGETS */}
        {activeTab === "GOALS" && (
          <div className="space-y-6">
            {goals.length === 0 ? (
              <div className="text-center py-24 border border-dashed border-white/10 rounded-3xl bg-black/20 backdrop-blur-md">
                <Target className="w-12 h-12 text-cyan-400/40 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-white">No Team Goals Set</h3>
                <p className="text-xs text-white/40 max-w-sm mx-auto mt-1 mb-6">
                  Set quarterly revenue, project delivery, or operational targets for your staff team.
                </p>
                <button
                  onClick={() => setIsGoalModalOpen(true)}
                  className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs uppercase px-5 py-2.5 rounded-xl transition-all"
                >
                  Set First Team Goal
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {goals.map((goal: any) => {
                  const percent = Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100))
                  const isCompleted = goal.status === "COMPLETED" || percent >= 100

                  return (
                    <div
                      key={goal.id}
                      className="bg-black/40 border border-white/10 hover:border-cyan-500/40 rounded-3xl p-6 backdrop-blur-xl transition-all shadow-[0_0_20px_rgba(0,0,0,0.4)]"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-bold text-white">{goal.title}</h3>
                          {goal.description && <p className="text-xs text-white/50 mt-1">{goal.description}</p>}
                        </div>
                        <span className={`text-[10px] font-mono uppercase px-2.5 py-1 rounded-lg border font-bold ${
                          isCompleted ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" : "bg-cyan-500/10 text-cyan-400 border-cyan-500/30"
                        }`}>
                          {isCompleted ? "COMPLETED 🎉" : "ON TRACK"}
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-2 mb-6">
                        <div className="flex justify-between text-xs font-mono">
                          <span className="text-white/60">Progress ({percent}%)</span>
                          <span className="text-cyan-400 font-bold">
                            {goal.currentValue} / {goal.targetValue} {goal.unit}
                          </span>
                        </div>
                        <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden p-0.5 border border-white/10">
                          <div
                            style={{ width: `${percent}%` }}
                            className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-pink-500 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(6,182,212,0.8)]"
                          />
                        </div>
                      </div>

                      {/* Update Progress Input */}
                      <div className="flex items-center justify-between pt-4 border-t border-white/10 text-xs">
                        <div className="flex items-center gap-1.5 text-white/40 font-mono text-[11px]">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>Due: {new Date(goal.dueDate).toLocaleDateString()}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            defaultValue={goal.currentValue}
                            onBlur={e => {
                              const val = Number(e.target.value)
                              if (!isNaN(val) && val !== goal.currentValue) {
                                handleUpdateGoalProgress(goal.id, val, goal.targetValue)
                              }
                            }}
                            className="w-20 bg-black/60 border border-white/10 rounded-xl px-3 py-1 text-xs text-white font-mono text-center focus:outline-none focus:border-cyan-500"
                          />
                          <span className="text-white/40 text-xs font-mono">{goal.unit}</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: ANNOUNCEMENTS & BROADCASTS */}
        {activeTab === "ANNOUNCEMENTS" && (
          <div className="space-y-4">
            {announcements.length === 0 ? (
              <div className="text-center py-24 border border-dashed border-white/10 rounded-3xl bg-black/20 backdrop-blur-md">
                <Megaphone className="w-12 h-12 text-amber-400/40 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-white">No Announcements Broadcasted</h3>
                <p className="text-xs text-white/40 max-w-sm mx-auto mt-1 mb-6">
                  Broadcast official company news, policy updates, or holiday notices to all staff.
                </p>
                <button
                  onClick={() => setIsAnnouncementModalOpen(true)}
                  className="bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs uppercase px-5 py-2.5 rounded-xl transition-all"
                >
                  Broadcast First Notice
                </button>
              </div>
            ) : (
              announcements.map((ann: any) => (
                <div
                  key={ann.id}
                  className={`bg-black/40 border rounded-2xl p-6 backdrop-blur-xl transition-all ${
                    ann.isPinned ? "border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.15)]" : "border-white/10"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {ann.isPinned && (
                        <span className="flex items-center gap-1 text-[10px] font-mono font-bold uppercase bg-amber-500/10 text-amber-400 px-2.5 py-0.5 rounded-md border border-amber-500/30">
                          <Pin className="w-3 h-3" /> Pinned
                        </span>
                      )}
                      <span className="text-[10px] font-mono font-bold uppercase bg-white/10 text-white/70 px-2.5 py-0.5 rounded-md">
                        {ann.category}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-white/40">
                      {new Date(ann.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-2">{ann.title}</h3>
                  <p className="text-xs text-white/70 leading-relaxed whitespace-pre-line">{ann.content}</p>

                  <div className="mt-4 pt-3 border-t border-white/5 text-[10px] font-mono text-white/40 flex items-center gap-1">
                    <User className="w-3 h-3" /> Broadcast by {ann.authorName}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

      </div>

      {/* SHARE WIN SLIDE-OVER */}
      <SlideOver
        open={isWinModalOpen}
        onClose={() => setIsWinModalOpen(false)}
        title="Share Achievement to Wins Wall"
        subtitle="Celebrate completed projects, closed deals, or milestones with spray-paint graffiti theme!"
      >
        <form onSubmit={handleCreateWin} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Achievement Title *</label>
            <input
              required
              value={winForm.title}
              onChange={e => setWinForm({ ...winForm, title: e.target.value })}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-pink-500 placeholder:text-white/30"
              placeholder="e.g. Delivered RedBrick Brand Identity project 3 days ahead of deadline!"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Badge Type</label>
              <select
                value={winForm.badge}
                onChange={e => setWinForm({ ...winForm, badge: e.target.value })}
                className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white"
              >
                <option value="PROJECT_HERO">🚀 Project Hero</option>
                <option value="TOP_CLOSER">🎯 Top Closer</option>
                <option value="BUG_HUNTER">🐛 Bug Hunter</option>
                <option value="INNOVATOR">💡 Innovator</option>
                <option value="MILESTONE_MASTER">🏆 Milestone Master</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Graffiti Theme</label>
              <select
                value={winForm.graffitiTheme}
                onChange={e => setWinForm({ ...winForm, graffitiTheme: e.target.value })}
                className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white"
              >
                <option value="CYBERPUNK_NEON">⚡ Cyberpunk Neon</option>
                <option value="GOLD_GLOW">✨ Gold Glow</option>
                <option value="FIRE_STORM">🔥 Fire Storm</option>
                <option value="RETRO_WAVE">🌆 Retro Wave</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Details & Context *</label>
            <textarea
              required
              value={winForm.description}
              onChange={e => setWinForm({ ...winForm, description: e.target.value })}
              rows={4}
              placeholder="Share what went well, team members involved, or client feedback..."
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-pink-500 placeholder:text-white/30 resize-none"
            />
          </div>

          <div className="pt-4 border-t border-white/10 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsWinModalOpen(false)}
              className="px-5 py-3 border border-white/10 text-white/60 hover:text-white rounded-xl text-xs font-bold uppercase"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-black rounded-xl text-xs uppercase shadow-lg hover:scale-105 transition-all"
            >
              Post Win with Confetti 🎉
            </button>
          </div>
        </form>
      </SlideOver>

      {/* CREATE GOAL SLIDE-OVER */}
      <SlideOver
        open={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        title="Set Team Target & OKR"
        subtitle="Track team goals with live progress bars and target metrics."
      >
        <form onSubmit={handleCreateGoal} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Goal Title *</label>
            <input
              required
              value={goalForm.title}
              onChange={e => setGoalForm({ ...goalForm, title: e.target.value })}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500"
              placeholder="e.g. Complete 15 Agency Projects in Q3"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Target Value</label>
              <input
                type="number"
                required
                value={goalForm.targetValue}
                onChange={e => setGoalForm({ ...goalForm, targetValue: Number(e.target.value) })}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-3 text-sm text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Current Value</label>
              <input
                type="number"
                value={goalForm.currentValue}
                onChange={e => setGoalForm({ ...goalForm, currentValue: Number(e.target.value) })}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-3 text-sm text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Unit</label>
              <input
                value={goalForm.unit}
                onChange={e => setGoalForm({ ...goalForm, unit: e.target.value })}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-3 text-sm text-white font-mono"
                placeholder="%, Projects, ₹"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Target Due Date *</label>
            <input
              type="date"
              required
              value={goalForm.dueDate}
              onChange={e => setGoalForm({ ...goalForm, dueDate: e.target.value })}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white [color-scheme:dark]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Description</label>
            <textarea
              value={goalForm.description}
              onChange={e => setGoalForm({ ...goalForm, description: e.target.value })}
              rows={3}
              placeholder="Context or strategy notes for the team..."
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500 resize-none"
            />
          </div>

          <div className="pt-4 border-t border-white/10 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsGoalModalOpen(false)}
              className="px-5 py-3 border border-white/10 text-white/60 hover:text-white rounded-xl text-xs font-bold uppercase"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl text-xs uppercase shadow-lg transition-all"
            >
              Initialize Goal
            </button>
          </div>
        </form>
      </SlideOver>

      {/* CREATE ANNOUNCEMENT SLIDE-OVER */}
      <SlideOver
        open={isAnnouncementModalOpen}
        onClose={() => setIsAnnouncementModalOpen(false)}
        title="Broadcast Announcement"
        subtitle="Share official company updates or news with all staff."
      >
        <form onSubmit={handleCreateAnnouncement} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Title *</label>
            <input
              required
              value={announcementForm.title}
              onChange={e => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500"
              placeholder="e.g. Q3 Company All-Hands Meeting Schedule"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Category</label>
              <select
                value={announcementForm.category}
                onChange={e => setAnnouncementForm({ ...announcementForm, category: e.target.value })}
                className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white"
              >
                <option value="GENERAL">📢 General</option>
                <option value="URGENT">⚠️ Urgent</option>
                <option value="CELEBRATION">🎉 Celebration</option>
                <option value="MILESTONE">🏁 Milestone</option>
              </select>
            </div>

            <div className="flex items-center pt-6">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-mono text-white/80">
                <input
                  type="checkbox"
                  checked={announcementForm.isPinned}
                  onChange={e => setAnnouncementForm({ ...announcementForm, isPinned: e.target.checked })}
                  className="rounded border-white/20 bg-transparent text-amber-500 focus:ring-0"
                />
                <span>Pin to top of feed</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Content *</label>
            <textarea
              required
              value={announcementForm.content}
              onChange={e => setAnnouncementForm({ ...announcementForm, content: e.target.value })}
              rows={5}
              placeholder="Write the announcement message..."
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500 resize-none"
            />
          </div>

          <div className="pt-4 border-t border-white/10 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsAnnouncementModalOpen(false)}
              className="px-5 py-3 border border-white/10 text-white/60 hover:text-white rounded-xl text-xs font-bold uppercase"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-xs uppercase shadow-lg transition-all"
            >
              Broadcast Notice
            </button>
          </div>
        </form>
      </SlideOver>
    </div>
  )
}
