"use client"

import { DollarSign, TrendingUp, TrendingDown, Download, BarChart2 } from "lucide-react"
import { useCurrency } from "@/hooks/useCurrency"

export default function PNLPage() {
  const { symbol } = useCurrency()
  // Mock P&L Data
  const income = [
    { category: "Web Projects", amount: 85000 },
    { class: "LMS Subscriptions", amount: 24000 },
    { class: "Consulting", amount: 15500 }
  ]
  
  const expenses = [
    { category: "Payroll", amount: 45000 },
    { category: "Software Licenses", amount: 8500 },
    { category: "Cloud Hosting", amount: 4200 },
    { category: "Marketing Ads", amount: 12000 }
  ]

  const totalIncome = income.reduce((sum, item) => sum + item.amount, 0)
  const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0)
  const netProfit = totalIncome - totalExpenses
  const margin = (netProfit / totalIncome) * 100

  return (
    <div className="flex flex-col h-full bg-[#050505] text-white overflow-hidden">
      {/* Header */}
      <div className="flex-none px-8 py-8 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Profit & Loss</h1>
            <p className="text-sm text-white/50 mt-2">Financial overview for the current fiscal year</p>
          </div>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-white/5 text-white font-medium rounded-xl hover:bg-white/10 transition-all border border-white/10">
            <Download className="w-4 h-4" /> Export Report
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto custom-scrollbar p-8">
        <div className="max-w-5xl mx-auto space-y-8">
          
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-3xl p-6 relative overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-emerald-400/80 uppercase tracking-widest">Total Income</h3>
                <TrendingUp className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="text-4xl font-bold font-mono text-emerald-400">{symbol}{totalIncome.toLocaleString()}</div>
            </div>
            
            <div className="bg-red-500/10 border border-red-500/20 rounded-3xl p-6 relative overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-red-400/80 uppercase tracking-widest">Total Expenses</h3>
                <TrendingDown className="w-5 h-5 text-red-400" />
              </div>
              <div className="text-4xl font-bold font-mono text-red-400">{symbol}{totalExpenses.toLocaleString()}</div>
            </div>
            
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-3xl p-6 relative overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-blue-400/80 uppercase tracking-widest">Net Profit</h3>
                <BarChart2 className="w-5 h-5 text-blue-400" />
              </div>
              <div className="flex items-end gap-3">
                <div className="text-4xl font-bold font-mono text-blue-400">{symbol}{netProfit.toLocaleString()}</div>
                <div className="text-sm font-bold text-blue-400/80 mb-1">{margin.toFixed(1)}% Margin</div>
              </div>
            </div>
          </div>

          {/* Detailed Statement */}
          <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
            <div className="p-6 border-b border-white/10 bg-white/[0.02]">
              <h2 className="text-lg font-bold">Income Statement</h2>
            </div>
            
            <div className="p-6 space-y-8">
              {/* Income Section */}
              <div>
                <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-widest mb-4 border-b border-white/10 pb-2">Revenue</h3>
                <div className="space-y-3">
                  {income.map((item: any, i: number) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span className="text-white/70">{item.category || item.class}</span>
                  <span className="font-mono text-white">{symbol}{item.amount.toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between text-sm font-bold pt-3 border-t border-white/10 mt-3">
                    <span className="text-white">Total Revenue</span>
                    <span className="font-mono text-emerald-400">{symbol}{totalIncome.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Expense Section */}
              <div>
                <h3 className="text-sm font-bold text-red-400 uppercase tracking-widest mb-4 border-b border-white/10 pb-2">Operating Expenses</h3>
                <div className="space-y-3">
                  {expenses.map((item: any, i: number) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span className="text-white/70">{item.category}</span>
                      <span className="font-mono text-white">{symbol}{item.amount.toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between text-sm font-bold pt-3 border-t border-white/10 mt-3">
                    <span className="text-white">Total Expenses</span>
                    <span className="font-mono text-red-400">{symbol}{totalExpenses.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Net Profit Section */}
              <div className="pt-6 border-t-2 border-white/20">
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-white">Net Income</span>
                  <span className="text-2xl font-bold font-mono text-blue-400">{symbol}{netProfit.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
