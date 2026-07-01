"use client"

import { PieChart, Users, DollarSign, Activity, Target, TrendingUp, TrendingDown, Layers, Link as LinkIcon } from "lucide-react"
import { useApi, fetchApi } from "@/lib/useApi"
import { useCurrency } from "@/hooks/useCurrency"
import { useState } from "react"
import { toast } from "sonner"

export default function HRAnalyticsDashboard() {
  const { data: analyticsData } = useApi<any>("/hr/analytics/overview")
  const overview = analyticsData?.overview || { totalEmployees: 0, totalDepartments: 0, totalPayrollOutflow: 0, goalCompletionRate: 0, turnoverRate: 0 }
  const trends = analyticsData?.trends || []
  const { symbol } = useCurrency()

  const [webhookUrl, setWebhookUrl] = useState("")
  const [isSubscribing, setIsSubscribing] = useState(false)

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubscribing(true)
    try {
      await fetchApi("/hr/webhooks/subscribe", {
        method: "POST",
        body: JSON.stringify({ url: webhookUrl, events: ["employee.created", "payroll.processed"] })
      })
      toast.success("Webhook configured successfully!")
      setWebhookUrl("")
    } catch (err: any) {
      toast.error("Failed to configure webhook")
    } finally {
      setIsSubscribing(false)
    }
  }

  // Find max hires to scale the bar chart
  const maxHires = Math.max(...trends.map((t: any) => t.hires), 10)

  return (
    <div className="flex flex-col h-full bg-[#050505] text-white overflow-hidden">
      
      {/* Header */}
      <div className="flex-none px-8 py-6 border-b border-white/10 bg-black/20 backdrop-blur-md z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shadow-[0_0_20px_rgba(249,115,22,0.15)] relative overflow-hidden">
              <PieChart className="w-6 h-6 text-orange-400 relative z-10" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Analytics & Integrations</h1>
              <p className="text-xs font-mono tracking-widest uppercase text-white/40 mt-1">Global HR Insights & Webhooks</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
        
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/5 border border-white/10 p-6 rounded-2xl flex flex-col justify-between relative overflow-hidden group hover:border-white/20 transition-colors">
            <div className="flex items-center gap-2 text-white/50 mb-4">
              <Users className="w-4 h-4" />
              <span className="text-xs font-mono tracking-widest uppercase font-bold text-white/70">Total Headcount</span>
            </div>
            <div className="text-4xl font-bold">{overview.totalEmployees}</div>
            <div className="absolute right-4 bottom-4 w-16 h-16 bg-blue-500/10 rounded-full blur-[20px] pointer-events-none" />
          </div>

          <div className="bg-white/5 border border-white/10 p-6 rounded-2xl flex flex-col justify-between relative overflow-hidden group hover:border-white/20 transition-colors">
            <div className="flex items-center gap-2 text-white/50 mb-4">
              <DollarSign className="w-4 h-4" />
              <span className="text-xs font-mono tracking-widest uppercase font-bold text-white/70">Payroll Outflow</span>
            </div>
            <div className="text-3xl font-bold font-mono tracking-tight">{symbol}{overview.totalPayrollOutflow.toLocaleString('en-IN')}</div>
            <div className="absolute right-4 bottom-4 w-16 h-16 bg-emerald-500/10 rounded-full blur-[20px] pointer-events-none" />
          </div>

          <div className="bg-white/5 border border-white/10 p-6 rounded-2xl flex flex-col justify-between relative overflow-hidden group hover:border-white/20 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-white/50">
                <Target className="w-4 h-4" />
                <span className="text-xs font-mono tracking-widest uppercase font-bold text-white/70">Goal Completion</span>
              </div>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-mono">+12%</span>
            </div>
            <div className="text-4xl font-bold">{overview.goalCompletionRate}%</div>
            <div className="absolute right-4 bottom-4 w-16 h-16 bg-pink-500/10 rounded-full blur-[20px] pointer-events-none" />
          </div>

          <div className="bg-white/5 border border-white/10 p-6 rounded-2xl flex flex-col justify-between relative overflow-hidden group hover:border-white/20 transition-colors">
            <div className="flex items-center gap-2 text-white/50 mb-4">
              <Activity className="w-4 h-4" />
              <span className="text-xs font-mono tracking-widest uppercase font-bold text-white/70">Turnover Rate</span>
            </div>
            <div className="flex items-end gap-2">
              <div className="text-4xl font-bold text-red-400">{overview.turnoverRate}%</div>
              <span className="text-xs text-white/40 mb-1">YTD</span>
            </div>
            <div className="absolute right-4 bottom-4 w-16 h-16 bg-red-500/10 rounded-full blur-[20px] pointer-events-none" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Chart */}
          <div className="col-span-1 lg:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-6">
            <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-orange-400" /> Headcount Growth Trend (6 Mo)
            </h3>
            
            <div className="h-64 flex items-end justify-between gap-4 mt-8 px-4 border-b border-white/10 pb-4 relative">
              {/* Y-axis labels mock */}
              <div className="absolute -left-2 top-0 bottom-4 flex flex-col justify-between text-[10px] font-mono text-white/30 text-right pr-2">
                <span>{maxHires}</span>
                <span>{Math.floor(maxHires/2)}</span>
                <span>0</span>
              </div>

              {trends.map((t: any, i: number) => {
                const heightPct = Math.max((t.hires / maxHires) * 100, 5);
                const attrPct = Math.max((t.attrition / maxHires) * 100, 2);
                
                return (
                  <div key={i} className="flex-1 flex flex-col items-center justify-end gap-2 relative group">
                    {/* Tooltip on hover */}
                    <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-black border border-white/10 px-3 py-1.5 rounded text-[10px] font-mono whitespace-nowrap z-10 pointer-events-none">
                      <span className="text-emerald-400">+{t.hires} Hired</span> · <span className="text-red-400">-{t.attrition} Left</span>
                    </div>

                    <div className="w-full max-w-[40px] flex items-end gap-1 mx-auto relative h-full">
                      {/* Attrition Bar */}
                      <div className="w-full bg-red-500/30 rounded-t-sm transition-all duration-1000 ease-out border-t border-red-500/50" style={{ height: `${attrPct}%` }} />
                      {/* Hire Bar */}
                      <div className="absolute bottom-0 w-full bg-gradient-to-t from-orange-600 to-orange-400 rounded-t-sm transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(249,115,22,0.3)]" style={{ height: `${heightPct}%` }} />
                    </div>
                    
                    <span className="text-[10px] font-mono uppercase text-white/50">{t.month}</span>
                  </div>
                )
              })}
            </div>
            <div className="flex items-center justify-center gap-6 mt-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-orange-400 rounded-sm" />
                <span className="text-xs font-mono uppercase text-white/60">New Hires</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500/50 rounded-sm" />
                <span className="text-xs font-mono uppercase text-white/60">Attrition</span>
              </div>
            </div>
          </div>

          {/* Webhooks Config */}
          <div className="col-span-1 space-y-6">
            <div className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-2xl p-6">
              <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                <LinkIcon className="w-5 h-5 text-blue-400" /> API Webhooks
              </h3>
              <p className="text-xs text-white/50 mb-6 leading-relaxed">
                Stream real-time HR events (e.g. payroll processed, new hire) to your external tools like Slack or Zapier.
              </p>

              <form onSubmit={handleSubscribe} className="space-y-4">
                <div>
                  <label className="text-[10px] font-mono uppercase text-white/50 mb-1.5 block">Endpoint URL</label>
                  <input 
                    type="url" 
                    required 
                    placeholder="https://hooks.zapier.com/..."
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500/50 font-mono text-white/90 placeholder:text-white/20"
                  />
                </div>
                <div className="bg-black/20 rounded-xl p-3 border border-white/5">
                  <span className="text-[10px] font-mono uppercase text-white/50 mb-2 block">Events to stream</span>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded text-[10px] font-mono">employee.created</span>
                    <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded text-[10px] font-mono">payroll.processed</span>
                  </div>
                </div>
                
                <button 
                  type="submit" 
                  disabled={isSubscribing}
                  className="w-full py-2.5 bg-white text-black font-medium rounded-xl hover:bg-white/90 transition-all text-sm mt-2 flex items-center justify-center gap-2"
                >
                  {isSubscribing ? "Registering..." : "Add Webhook"}
                </button>
              </form>
            </div>
          </div>

        </div>

      </div>
    </div>
  )
}
