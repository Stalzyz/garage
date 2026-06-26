"use client"

import { useState, useEffect } from "react"
import { Share2, Copy, CheckCircle2, DollarSign, Users, ArrowUpRight } from "lucide-react"
import { toast } from "sonner"

export default function AffiliateDashboardPage() {
  const [data, setData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetch('http://localhost:4000/api/v1/academy/referrals/me')
      .then(res => res.json())
      .then(res => {
        setData(res.data)
        setIsLoading(false)
      })
      .catch(() => setIsLoading(false))
  }, [])

  const copyLink = () => {
    if (!data) return
    const link = `http://localhost:3000/academy?ref=${data.referralCode}`
    navigator.clipboard.writeText(link)
    setCopied(true)
    toast.success("Referral link copied!")
    setTimeout(() => setCopied(false), 2000)
  }

  if (isLoading) {
    return <div className="p-8 flex justify-center"><div className="animate-pulse w-8 h-8 rounded-full border-4 border-slate-200 border-t-purple-500" /></div>
  }

  if (!data) return <div className="p-8 text-center text-slate-500">Failed to load affiliate data.</div>

  const referralLink = `http://localhost:3000/academy?ref=${data.referralCode}`

  return (
    <div className="bg-slate-50 min-h-[calc(100vh-80px)] overflow-y-auto font-sans selection:bg-purple-100 pb-24">
      <div className="bg-[#0f0c29] text-white pt-16 pb-32 px-6 relative overflow-hidden bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e]">
        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 rounded-full text-sm font-bold text-purple-300 mb-6 shadow-[0_0_15px_rgba(168,85,247,0.3)]">
            <Share2 className="w-4 h-4" /> Grekam Partner Program
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-200 to-white">Refer & Earn</h1>
          <p className="text-purple-200/70 max-w-lg mx-auto">Invite your friends to join Grekam Academy. You earn a 15% commission ($75) for every successful enrollment using your unique link.</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 -mt-16 relative z-20 space-y-8">
        
        {/* The Link Box */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl shadow-purple-900/5 text-center">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Your Unique Referral Link</h2>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 max-w-2xl mx-auto">
            <div className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-slate-500 font-mono text-sm w-full truncate select-all">
              {referralLink}
            </div>
            <button 
              onClick={copyLink}
              className={`px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all w-full sm:w-auto ${
                copied 
                  ? 'bg-green-500 text-white' 
                  : 'bg-purple-600 hover:bg-purple-700 text-white shadow-[0_0_20px_rgba(147,51,234,0.3)] hover:shadow-[0_0_25px_rgba(147,51,234,0.5)]'
              }`}
            >
              {copied ? <><CheckCircle2 className="w-5 h-5" /> Copied!</> : <><Copy className="w-5 h-5" /> Copy Link</>}
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <DollarSign className="w-8 h-8" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Total Earned</div>
              <div className="text-4xl font-black text-slate-900">${data.totalEarned.toFixed(2)}</div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Users className="w-8 h-8" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Successful Referrals</div>
              <div className="text-4xl font-black text-slate-900">{data.referrals.length}</div>
            </div>
          </div>
        </div>

        {/* Referrals Table */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900">Recent Referrals</h3>
          </div>
          
          {data.referrals.length === 0 ? (
             <div className="p-12 text-center text-slate-500">
               <Users className="w-12 h-12 text-slate-200 mx-auto mb-4" />
               No successful referrals yet. Share your link to get started!
             </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-bold">
                  <th className="p-4 border-b border-slate-100">Student Signed Up</th>
                  <th className="p-4 border-b border-slate-100">Status</th>
                  <th className="p-4 border-b border-slate-100">Commission</th>
                  <th className="p-4 border-b border-slate-100">Date</th>
                </tr>
              </thead>
              <tbody>
                {data.referrals.map((ref: any) => (
                  <tr key={ref.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 border-b border-slate-100 font-bold text-slate-900">
                      {ref.referredUser?.user?.firstName} {ref.referredUser?.user?.lastName}
                    </td>
                    <td className="p-4 border-b border-slate-100">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                        ref.status === 'PAID' ? 'bg-green-100 text-green-700' : 
                        ref.status === 'CONVERTED' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {ref.status}
                      </span>
                    </td>
                    <td className="p-4 border-b border-slate-100 font-bold text-green-600">
                      +${ref.commissionAmt.toFixed(2)}
                    </td>
                    <td className="p-4 border-b border-slate-100 text-slate-500 text-sm">
                      {new Date(ref.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </div>
  )
}
