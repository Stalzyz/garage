"use client"

import { useState, useEffect } from "react"
import { GraduationCap, Briefcase, MapPin, Search, MessageCircle, ExternalLink } from "lucide-react"

export default function AlumniDirectoryPage() {
  const [alumni, setAlumni] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => {
    fetch('http://localhost:4000/api/v1/academy/alumni')
      .then(res => res.json())
      .then(data => {
        setAlumni(data.data || [])
        setIsLoading(false)
      })
      .catch(() => setIsLoading(false))
  }, [])

  const filteredAlumni = alumni.filter(a => 
    `${a.user?.firstName} ${a.user?.lastName}`.toLowerCase().includes(search.toLowerCase())
  )

  if (isLoading) {
    return <div className="p-8 flex justify-center"><div className="animate-pulse w-8 h-8 rounded-full border-4 border-slate-200 border-t-[#49ABC9]" /></div>
  }

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="bg-slate-900 text-white pt-16 pb-24 px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#49ABC9] opacity-10 blur-[120px] rounded-full pointer-events-none translate-x-1/3 -translate-y-1/3" />
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 rounded-full text-sm font-bold text-white mb-6">
            <GraduationCap className="w-4 h-4" /> Grekam Global Network
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4">Alumni Directory</h1>
          <p className="text-white/60 max-w-xl text-lg mb-8">Connect with past graduates, view their portfolios, and expand your professional network.</p>
          
          <div className="relative max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input 
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, role, or cohort..." 
              className="w-full bg-white/10 border border-white/20 rounded-2xl pl-12 pr-4 py-4 text-white placeholder:text-white/40 outline-none focus:border-[#49ABC9]/50 focus:bg-white/15 transition-all"
            />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 -mt-10 relative z-20 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAlumni.map(person => (
            <div key={person.id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-xl transition-all group flex flex-col">
              <div className="relative mb-6">
                <div className="w-20 h-20 rounded-full bg-slate-100 border-4 border-white shadow-md mx-auto overflow-hidden flex items-center justify-center text-2xl font-bold text-slate-400">
                  {person.user?.avatarUrl ? (
                    <img src={person.user.avatarUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    `${person.user?.firstName?.charAt(0)}${person.user?.lastName?.charAt(0)}`
                  )}
                </div>
                <div className="absolute top-0 right-1/2 translate-x-10 translate-y-14 bg-green-500 w-4 h-4 rounded-full border-2 border-white shadow-sm" title="Available to connect" />
              </div>
              
              <div className="text-center mb-6">
                <h3 className="text-lg font-bold text-slate-900 leading-tight mb-1">{person.user?.firstName} {person.user?.lastName}</h3>
                <div className="text-sm font-bold text-[#49ABC9] mb-3">UI/UX Designer @ TechCorp</div>
                <div className="flex flex-wrap justify-center gap-2 text-xs font-bold text-slate-500">
                  <span className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-md border border-slate-100"><MapPin className="w-3 h-3" /> New York, NY</span>
                </div>
              </div>
              
              <div className="mt-auto pt-6 border-t border-slate-100 flex items-center gap-3">
                <button className="flex-1 bg-slate-900 text-white font-bold text-sm py-2.5 rounded-xl hover:bg-slate-800 transition-colors flex items-center justify-center gap-2">
                  <MessageCircle className="w-4 h-4" /> Connect
                </button>
                {person.portfolio && (
                  <a href={person.portfolio} target="_blank" className="w-10 h-10 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center text-slate-500 hover:text-[#49ABC9] hover:bg-[#E5F4F8] transition-colors shrink-0">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredAlumni.length === 0 && (
          <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center shadow-sm">
            <GraduationCap className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-slate-900 mb-2">No Alumni Found</h3>
            <p className="text-slate-500 max-w-md mx-auto">Try adjusting your search filters.</p>
          </div>
        )}
      </div>
    </div>
  )
}
