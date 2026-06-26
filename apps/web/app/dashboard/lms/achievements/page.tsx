"use client"

import { Download, Award, Star, Zap, Target, Share2, Shield } from "lucide-react"
import { useApi } from "@/lib/useApi"
import { useSession } from "next-auth/react"

export default function AchievementsDashboard() {
  const { data: session } = useSession()
  const { data: mockContext } = useApi<any>("/lms/assignments/mock-context")
  const studentId = mockContext?.studentId

  const { data: badgesData, isLoading } = useApi<any>(studentId ? `/lms/badges?studentId=${studentId}` : null)
  const earnedBadges = badgesData?.badges || []

  // Add the earned badges to our display list. If a badge is earned, we show it brightly, else dim.
  const globalBadges = [
    { id: "b1", title: "Quick Starter", description: "Completed the first module in under 24 hours.", icon: Zap, color: "text-yellow-500 bg-yellow-500/10 border-yellow-500/20" },
    { id: "b2", title: "Perfect Protocol", description: "Achieve a perfect 100% on any assignment", icon: Star, color: "text-blue-500 bg-blue-500/10 border-blue-500/20" },
    { id: "b3", title: "First Step", description: "Complete your first graded assignment", icon: Target, color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" },
    { id: "b4", title: "High Achiever", description: "Score 90% or higher on an assignment", icon: Award, color: "text-purple-500 bg-purple-500/10 border-purple-500/20" },
    { id: "b5", title: "Master Designer", description: "Complete all UI/UX modules.", icon: Shield, color: "text-slate-500 bg-slate-500/10 border-slate-500/20" },
  ]

  // Map API badges over the UI badges
  const displayBadges = globalBadges.map(gb => {
    const earned = earnedBadges.find((eb: any) => eb.name === gb.title)
    return {
      ...gb,
      unlocked: !!earned,
      earnedAt: earned?.earnedAt
    }
  })

  // Calculate XP
  const totalXp = earnedBadges.reduce((sum: number, b: any) => sum + (b.xpReward || 0), 1250)

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">
      {/* Header */}
      <div className="flex-none px-6 py-5 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Achievements & Certificates</h1>
            <p className="text-sm text-muted-foreground mt-1">Track your progress, earn badges, and download your certificates.</p>
          </div>
          <div className="flex gap-4 items-center">
            <div className="flex items-center gap-2 bg-primary/10 px-3 py-1.5 rounded-lg border border-primary/20">
              <Star className="w-4 h-4 text-primary fill-primary" />
              <span className="text-sm font-bold text-primary">{totalXp.toLocaleString()} XP</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-10">
        
        {/* Certificates Section */}
        <section>
          <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
            <Award className="w-5 h-5 text-primary" /> Official Certificates
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Completed Certificate */}
            <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm group">
              <div className="aspect-[4/3] w-full bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg mb-6 border border-border/50 flex flex-col items-center justify-center relative overflow-hidden">
                {/* Decorative Elements */}
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent"></div>
                <Award className="w-16 h-16 text-primary mb-4 relative z-10" />
                <h3 className="text-white font-serif text-xl font-bold relative z-10">Grekam Academy</h3>
                <p className="text-slate-400 text-xs mt-2 relative z-10 uppercase tracking-widest">Certificate of Completion</p>
                <div className="absolute bottom-4 left-4 right-4 flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>ID: GRK-2025-0982</span>
                  <span>Issued: May 12, 2025</span>
                </div>
              </div>
              
              <div>
                <h4 className="font-bold text-foreground text-lg">Web Design Fundamentals</h4>
                <p className="text-sm text-muted-foreground mb-6">Completed on May 12, 2025</p>
                
                <div className="flex gap-3">
                  <button className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground py-2.5 rounded-lg text-sm font-bold shadow-sm hover:bg-primary/90 transition-all">
                    <Download className="w-4 h-4" /> Download PDF
                  </button>
                  <button className="px-3 border border-border/50 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors tooltip" title="Share on LinkedIn">
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* In Progress Certificate */}
            <div className="bg-muted/20 border border-dashed border-border/50 rounded-2xl p-6 flex flex-col justify-center items-center text-center opacity-80">
              <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                <Target className="w-8 h-8 text-muted-foreground" />
              </div>
              <h4 className="font-bold text-foreground">UI/UX Masterclass</h4>
              <p className="text-sm text-muted-foreground mt-2 mb-4">You are 65% through this course. Complete all modules to unlock this certificate.</p>
              <div className="w-full bg-muted rounded-full h-2 mb-2 overflow-hidden">
                <div className="bg-primary h-2 rounded-full" style={{ width: '65%' }}></div>
              </div>
            </div>

          </div>
        </section>

        {/* Badges & Gamification */}
        <section>
          <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-500" /> Badges & Achievements
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {isLoading ? (
              <div className="col-span-full py-10 flex justify-center"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"/></div>
            ) : displayBadges.map(badge => {
              const Icon = badge.icon
              return (
                <div key={badge.id} className={`p-5 rounded-2xl border ${badge.unlocked ? 'bg-card border-border/50 shadow-sm' : 'bg-muted/10 border-border/30 opacity-50 grayscale'}`}>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 border ${badge.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-foreground text-sm mb-1">{badge.title}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-2">{badge.description}</p>
                  {badge.unlocked && badge.earnedAt && (
                    <p className="text-[10px] text-primary font-bold tracking-wider uppercase">Unlocked: {new Date(badge.earnedAt).toLocaleDateString()}</p>
                  )}
                </div>
              )
            })}
          </div>
        </section>

      </div>
    </div>
  )
}
