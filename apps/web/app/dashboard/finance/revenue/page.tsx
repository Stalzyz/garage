"use client"

import { useState } from "react"
import { BarChart3, TrendingUp, TrendingDown, DollarSign, PieChart, Activity, Download, ChevronDown, Filter } from "lucide-react"
import { useCurrency } from "@/hooks/useCurrency"

import { useApi } from "@/lib/useApi"
import { useCurrency } from "@/hooks/useCurrency"

export default function RevenueDashboard() {
  const { symbol } = useCurrency()
  const [timeframe, setTimeframe] = useState("This Year")
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  
  const { data, isLoading } = useApi<any>("/finance/revenue/stats")
  const stats = data || { total: 0, streams: [], monthlyData: [] }
  const REVENUE_STREAMS = stats.streams || []
  const MONTHLY_DATA = stats.monthlyData || []

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">
      {/* Header */}
      <div className="flex-none px-6 py-5 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Multi-Stream Revenue</h1>
            <p className="text-sm text-muted-foreground mt-1">Track and compare income across Agency, SaaS, and Academy.</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 bg-muted text-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-muted/80 transition-all border border-border/50">
              <Download className="w-4 h-4" />
              Export CSV
            </button>
            <div className="relative">
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-lg text-sm font-bold border border-primary/20 hover:bg-primary/20 transition-all"
              >
                <Filter className="w-4 h-4" />
                {timeframe}
                <ChevronDown className="w-3 h-3 ml-1" />
              </button>
              
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-card border border-border/50 rounded-xl shadow-xl overflow-hidden z-50">
                  {["This Month", "This Quarter", "This Year", "All Time"].map(t => (
                    <button
                      key={t}
                      onClick={() => {
                        setTimeframe(t);
                        setIsDropdownOpen(false);
                      }}
                      className="block w-full text-left px-4 py-3 text-sm text-foreground hover:bg-muted/50 transition-colors"
                    >
                      {t}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        
        {/* Total Revenue KPI */}
        <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-2">Total Net Revenue (YTD)</p>
            <div className="flex items-end gap-4">
              <h2 className="text-5xl font-black text-foreground">{symbol}{(stats.total || 0).toLocaleString()}</h2>
              <div className="flex items-center gap-1.5 text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full mb-1 border border-emerald-500/20">
                <TrendingUp className="w-4 h-4" />
                <span className="font-bold text-sm">+18.5% YoY</span>
              </div>
            </div>
          </div>
          
          <div className="flex-1 w-full max-w-md">
            <div className="flex justify-between text-xs font-bold text-muted-foreground mb-2 px-1">
              <span>Goal: {symbol}12M</span>
              <span>83%</span>
            </div>
            <div className="h-4 w-full bg-muted rounded-full overflow-hidden flex">
              <div className="h-full bg-primary" style={{ width: '83%' }}></div>
            </div>
          </div>
        </div>

        {/* Revenue Streams Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {REVENUE_STREAMS.map(stream => (
            <div key={stream.id} className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm relative overflow-hidden group hover:border-primary/50 transition-colors">
              <div className={`absolute top-0 right-0 w-24 h-24 ${stream.color} opacity-5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110`}></div>
              
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-foreground">{stream.name}</h3>
                  <p className="text-sm text-muted-foreground">{stream.percentage}% of total</p>
                </div>
                <div className={`p-2 rounded-lg ${stream.color}/10 ${stream.color.replace('bg-', 'text-')}`}>
                  {stream.id === 'agency' ? <BarChart3 className="w-5 h-5" /> : stream.id === 'saas' ? <Activity className="w-5 h-5" /> : <PieChart className="w-5 h-5" />}
                </div>
              </div>
              
              <div className="flex items-end justify-between mt-6">
                <h4 className="text-3xl font-bold text-foreground">{symbol}{(stream.amount || 0).toLocaleString()}</h4>
                <div className={`flex items-center gap-1 text-sm font-bold ${stream.trendUp ? 'text-emerald-500' : 'text-amber-500'}`}>
                  {stream.trendUp ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  {stream.trend}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Monthly Trend Chart (Mock Visualization) */}
        <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-lg text-foreground">Monthly Growth Trend</h3>
            <div className="flex gap-4 text-sm font-medium">
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500"></div>Agency</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500"></div>SaaS</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-amber-500"></div>Academy</div>
            </div>
          </div>
          
          <div className="h-64 flex items-end gap-2 px-2 pb-6 border-b border-border/50 relative">
            {/* Y-axis markers */}
            <div className="absolute left-0 top-0 bottom-6 w-full flex flex-col justify-between text-xs text-muted-foreground pointer-events-none z-0">
              <div className="flex items-center gap-4 w-full border-t border-border/30 pt-1"><span>{symbol}500k</span></div>
              <div className="flex items-center gap-4 w-full border-t border-border/30 pt-1"><span>{symbol}250k</span></div>
              <div className="flex items-center gap-4 w-full border-t border-border/30 pt-1"><span>{symbol}0</span></div>
            </div>

            {/* Bars */}
            {MONTHLY_DATA.map((data: any, idx: number) => {
              const maxVal = Math.max(...MONTHLY_DATA.map((d: any) => d.agency + d.saas + d.academy), 1000); // Dynamic max value
              return (
              <div key={idx} className="flex-1 flex justify-center items-end gap-1 z-10 group relative">
                {/* Tooltip */}
                <div className="absolute -top-12 opacity-0 group-hover:opacity-100 bg-foreground text-background text-xs font-bold py-1 px-2 rounded transition-opacity pointer-events-none whitespace-nowrap z-20 shadow-lg">
                  Total: {symbol}{(data.agency + data.saas + data.academy).toLocaleString()}
                </div>
                <div className="w-1/3 max-w-[24px] bg-blue-500 rounded-t-sm hover:opacity-80 transition-opacity" style={{ height: `${(data.agency / maxVal) * 100}%` }}></div>
                <div className="w-1/3 max-w-[24px] bg-emerald-500 rounded-t-sm hover:opacity-80 transition-opacity" style={{ height: `${(data.saas / maxVal) * 100}%` }}></div>
                <div className="w-1/3 max-w-[24px] bg-amber-500 rounded-t-sm hover:opacity-80 transition-opacity" style={{ height: `${(data.academy / maxVal) * 100}%` }}></div>
                <div className="absolute -bottom-8 text-xs font-bold text-muted-foreground">{data.month}</div>
              </div>
            )})}
          </div>
        </div>

      </div>
    </div>
  )
}
