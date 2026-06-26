"use client"

import { useState, useEffect } from "react"
import { Trophy, Star, Medal, ArrowUp, Zap } from "lucide-react"

export default function LeaderboardPage() {
  const [students, setStudents] = useState<any[]>([])
  const [myRank, setMyRank] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetch('http://localhost:4000/api/v1/academy/leaderboard')
      .then(res => res.json())
      .then(data => {
        setStudents(data.data || [])
        setIsLoading(false)
      })
      .catch(() => setIsLoading(false))

    fetch('http://localhost:4000/api/v1/academy/leaderboard/me')
      .then(res => res.json())
      .then(data => setMyRank(data.data))
      .catch(() => {})
  }, [])

  if (isLoading) {
    return <div className="flex justify-center items-center h-[calc(100vh-80px)]"><div className="animate-pulse w-12 h-12 rounded-full border-4 border-slate-200 border-t-[#49ABC9]" /></div>
  }

  const top3 = students.slice(0, 3)
  const rest = students.slice(3)

  return (
    <div className="bg-slate-50 min-h-[calc(100vh-80px)] overflow-y-auto font-sans selection:bg-[#CCF0FA] pb-24">
      <div className="bg-[#050505] text-white pt-16 pb-32 px-6 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#49ABC9] opacity-20 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 rounded-full text-sm font-bold text-[#49ABC9] mb-6">
            <Trophy className="w-4 h-4" /> Global Ranking
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4">Cohort Leaderboard</h1>
          <p className="text-white/60 max-w-lg mx-auto">Earn XP by completing assignments, passing quizzes, and participating in the community forums to climb the ranks!</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 -mt-16 relative z-20">
        
        {/* Top 3 Podium */}
        <div className="flex flex-col md:flex-row items-end justify-center gap-4 md:gap-8 mb-12">
          {top3.length >= 2 && (
            <div className="flex flex-col items-center order-2 md:order-1 flex-1 md:flex-none">
              <div className="relative mb-4">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-slate-800 border-4 border-slate-300 flex items-center justify-center text-xl font-bold text-slate-300 shadow-xl overflow-hidden">
                  {top3[1].user?.avatarUrl ? <img src={top3[1].user.avatarUrl} alt="" className="w-full h-full object-cover" /> : `${top3[1].user?.firstName?.charAt(0)}${top3[1].user?.lastName?.charAt(0)}`}
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-slate-300 flex items-center justify-center border-2 border-slate-50 text-slate-700 font-black shadow-sm">2</div>
              </div>
              <div className="text-center bg-white border border-slate-200 rounded-t-3xl p-6 w-full md:w-48 shadow-lg shadow-slate-200/50 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-slate-300" />
                <h3 className="font-bold text-slate-900 truncate">{top3[1].user?.firstName}</h3>
                <div className="text-[#49ABC9] font-black text-xl mt-1 flex items-center justify-center gap-1"><Zap className="w-4 h-4 fill-[#49ABC9]" /> {top3[1].xp}</div>
                <div className="h-16 md:h-24"></div>
              </div>
            </div>
          )}

          {top3.length >= 1 && (
            <div className="flex flex-col items-center order-1 md:order-2 flex-1 md:flex-none z-10">
              <div className="relative mb-4">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2"><Trophy className="w-8 h-8 text-amber-400 fill-amber-400 drop-shadow-md" /></div>
                <div className="w-20 h-20 md:w-28 md:h-28 rounded-full bg-slate-800 border-4 border-amber-400 flex items-center justify-center text-2xl font-bold text-amber-400 shadow-xl overflow-hidden shadow-amber-400/20">
                  {top3[0].user?.avatarUrl ? <img src={top3[0].user.avatarUrl} alt="" className="w-full h-full object-cover" /> : `${top3[0].user?.firstName?.charAt(0)}${top3[0].user?.lastName?.charAt(0)}`}
                </div>
                <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-amber-400 flex items-center justify-center border-2 border-slate-50 text-amber-900 font-black shadow-sm text-lg">1</div>
              </div>
              <div className="text-center bg-white border border-slate-200 rounded-t-3xl p-6 w-full md:w-56 shadow-2xl shadow-amber-400/10 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-amber-400" />
                <h3 className="font-bold text-slate-900 truncate text-lg">{top3[0].user?.firstName} {top3[0].user?.lastName}</h3>
                <div className="text-amber-500 font-black text-2xl mt-1 flex items-center justify-center gap-1"><Zap className="w-5 h-5 fill-amber-500" /> {top3[0].xp}</div>
                <div className="h-24 md:h-32"></div>
              </div>
            </div>
          )}

          {top3.length >= 3 && (
            <div className="flex flex-col items-center order-3 flex-1 md:flex-none">
              <div className="relative mb-4">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-slate-800 border-4 border-amber-700 flex items-center justify-center text-xl font-bold text-amber-700 shadow-xl overflow-hidden">
                  {top3[2].user?.avatarUrl ? <img src={top3[2].user.avatarUrl} alt="" className="w-full h-full object-cover" /> : `${top3[2].user?.firstName?.charAt(0)}${top3[2].user?.lastName?.charAt(0)}`}
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-amber-700 flex items-center justify-center border-2 border-slate-50 text-white font-black shadow-sm">3</div>
              </div>
              <div className="text-center bg-white border border-slate-200 rounded-t-3xl p-6 w-full md:w-48 shadow-lg shadow-slate-200/50 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-amber-700" />
                <h3 className="font-bold text-slate-900 truncate">{top3[2].user?.firstName}</h3>
                <div className="text-[#49ABC9] font-black text-xl mt-1 flex items-center justify-center gap-1"><Zap className="w-4 h-4 fill-[#49ABC9]" /> {top3[2].xp}</div>
                <div className="h-8 md:h-12"></div>
              </div>
            </div>
          )}
        </div>

        {/* My Rank Banner */}
        {myRank && myRank.rank > 3 && (
          <div className="bg-[#49ABC9] text-white rounded-2xl p-6 flex items-center justify-between shadow-lg shadow-[#49ABC9]/20 mb-8 border border-[#49ABC9]/50">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center font-black text-xl">#{myRank.rank}</div>
              <div>
                <h3 className="font-bold text-lg">Your Current Rank</h3>
                <p className="text-white/80 text-sm">Keep going! You have {myRank.xp} XP.</p>
              </div>
            </div>
            <ArrowUp className="w-6 h-6 text-white/50" />
          </div>
        )}

        {/* List of everyone else */}
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
          {rest.map((student, index) => (
            <div key={student.id} className="flex items-center justify-between p-4 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-8 text-center font-bold text-slate-400">#{index + 4}</div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center shrink-0 border border-slate-200 font-bold text-slate-600 text-sm">
                  {student.user?.firstName?.charAt(0)}{student.user?.lastName?.charAt(0)}
                </div>
                <div className="font-bold text-slate-900">{student.user?.firstName} {student.user?.lastName}</div>
              </div>
              <div className="flex items-center gap-1.5 font-black text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg">
                <Zap className="w-4 h-4 text-slate-400" /> {student.xp}
              </div>
            </div>
          ))}
          {rest.length === 0 && (
            <div className="p-8 text-center text-slate-500">No other students found.</div>
          )}
        </div>

      </div>
    </div>
  )
}
