"use client"

import { useApi } from "@/lib/useApi"
import { Trophy, Star, Shield, ArrowUp, Crown } from "lucide-react"

export default function LeaderboardPage() {
  const { data, isLoading } = useApi<any>("/academy/leaderboard")

  if (isLoading) return <div className="h-full flex items-center justify-center text-white/50 bg-[#050505]">Loading Leaderboard...</div>

  const students = data?.data || []
  const top3 = students.slice(0, 3)
  const rest = students.slice(3)

  return (
    <div className="flex flex-col h-full bg-[#050505] text-white overflow-y-auto">
      
      {/* Header Banner */}
      <div className="relative bg-gradient-to-r from-amber-600 via-orange-500 to-amber-500 p-8 flex items-center justify-between overflow-hidden shrink-0">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 blend-overlay" />
        <div className="z-10">
          <h1 className="text-4xl font-black mb-2 flex items-center gap-3 drop-shadow-xl text-white">
            <Trophy className="w-10 h-10 text-amber-200" /> Global Leaderboard
          </h1>
          <p className="text-amber-100 font-bold tracking-wide drop-shadow-md">Top students ranked by Academy XP.</p>
        </div>
        <div className="z-10 hidden md:block">
          <Shield className="w-24 h-24 text-white/20 stroke-[1px]" />
        </div>
      </div>

      <div className="p-8 flex-1 max-w-6xl mx-auto w-full">
        
        {/* Podium (Top 3) */}
        <div className="flex justify-center items-end gap-6 mb-16 pt-12">
          
          {/* Rank 2 - Silver */}
          {top3[1] && (
            <div className="flex flex-col items-center animate-in slide-in-from-bottom-8 duration-700">
              <div className="relative mb-4">
                <img src={top3[1].user.avatarUrl || `https://ui-avatars.com/api/?name=${top3[1].user.firstName}`} className="w-20 h-20 rounded-full border-4 border-slate-300 object-cover shadow-[0_0_20px_rgba(203,213,225,0.4)]" />
                <div className="absolute -bottom-3 -right-3 w-8 h-8 bg-slate-300 rounded-full flex items-center justify-center font-black text-slate-800 text-sm shadow-xl">2</div>
              </div>
              <div className="text-center">
                <div className="font-black text-lg">{top3[1].user.firstName} {top3[1].user.lastName}</div>
                <div className="text-slate-400 font-bold flex items-center justify-center gap-1 text-sm"><Star className="w-3 h-3 fill-current" /> {top3[1].xp} XP</div>
              </div>
              <div className="w-28 h-32 bg-gradient-to-t from-slate-800 to-slate-700/50 rounded-t-xl mt-6 border border-slate-600/50 border-b-0" />
            </div>
          )}

          {/* Rank 1 - Gold */}
          {top3[0] && (
            <div className="flex flex-col items-center z-10 animate-in slide-in-from-bottom-12 duration-500">
              <Crown className="w-10 h-10 text-amber-400 mb-2 drop-shadow-[0_0_15px_rgba(251,191,36,0.8)] animate-pulse" />
              <div className="relative mb-4">
                <img src={top3[0].user.avatarUrl || `https://ui-avatars.com/api/?name=${top3[0].user.firstName}`} className="w-28 h-28 rounded-full border-4 border-amber-400 object-cover shadow-[0_0_30px_rgba(251,191,36,0.5)]" />
                <div className="absolute -bottom-4 -right-2 w-10 h-10 bg-amber-400 rounded-full flex items-center justify-center font-black text-amber-900 shadow-xl text-lg">1</div>
              </div>
              <div className="text-center">
                <div className="font-black text-2xl text-amber-100">{top3[0].user.firstName} {top3[0].user.lastName}</div>
                <div className="text-amber-400 font-bold flex items-center justify-center gap-1 text-lg"><Star className="w-4 h-4 fill-current" /> {top3[0].xp} XP</div>
              </div>
              <div className="w-32 h-44 bg-gradient-to-t from-amber-900/80 to-amber-600/40 rounded-t-xl mt-6 border border-amber-500/50 border-b-0 shadow-[0_-10px_30px_rgba(251,191,36,0.15)]" />
            </div>
          )}

          {/* Rank 3 - Bronze */}
          {top3[2] && (
            <div className="flex flex-col items-center animate-in slide-in-from-bottom-4 duration-1000">
              <div className="relative mb-4">
                <img src={top3[2].user.avatarUrl || `https://ui-avatars.com/api/?name=${top3[2].user.firstName}`} className="w-20 h-20 rounded-full border-4 border-amber-700 object-cover shadow-[0_0_20px_rgba(180,83,9,0.4)]" />
                <div className="absolute -bottom-3 -right-3 w-8 h-8 bg-amber-700 rounded-full flex items-center justify-center font-black text-white text-sm shadow-xl">3</div>
              </div>
              <div className="text-center">
                <div className="font-black text-lg">{top3[2].user.firstName} {top3[2].user.lastName}</div>
                <div className="text-amber-600 font-bold flex items-center justify-center gap-1 text-sm"><Star className="w-3 h-3 fill-current" /> {top3[2].xp} XP</div>
              </div>
              <div className="w-28 h-24 bg-gradient-to-t from-[#3d1e15] to-[#5a2e20]/50 rounded-t-xl mt-6 border border-[#8a4731]/50 border-b-0" />
            </div>
          )}

        </div>

        {/* The Rest of the List */}
        <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden max-w-4xl mx-auto shadow-2xl">
          <div className="p-6 border-b border-white/10 bg-black/40 font-black text-white/50 tracking-widest uppercase text-xs flex">
            <div className="w-16 text-center">Rank</div>
            <div className="flex-1">Student</div>
            <div className="w-32 text-right">Score</div>
            <div className="w-32 text-right">XP</div>
          </div>
          
          <div className="divide-y divide-white/5">
            {rest.map((student: any, index: number) => (
              <div key={student.id} className="p-4 flex items-center hover:bg-white/5 transition-colors group">
                <div className="w-16 text-center font-black text-xl text-white/20 group-hover:text-white/40 transition-colors">
                  {index + 4}
                </div>
                <div className="flex-1 flex items-center gap-4">
                  <img src={student.user.avatarUrl || `https://ui-avatars.com/api/?name=${student.user.firstName}`} className="w-10 h-10 rounded-full object-cover border border-white/10" />
                  <div>
                    <div className="font-bold text-base">{student.user.firstName} {student.user.lastName}</div>
                  </div>
                </div>
                <div className="w-32 text-right">
                  <div className="font-bold text-sky-400">{(student.careerScore || 0).toFixed(1)}</div>
                  <div className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Career Score</div>
                </div>
                <div className="w-32 text-right">
                  <div className="font-black text-emerald-400 text-lg flex items-center justify-end gap-1">
                    {student.xp}
                  </div>
                  <div className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Points</div>
                </div>
              </div>
            ))}
            
            {rest.length === 0 && (
              <div className="p-12 text-center text-white/40 font-bold">
                No more students ranked yet.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
