"use client"

import { useState } from "react"
import { Calculator, Download, Landmark, FileText, AlertTriangle, ArrowRight, CheckCircle2, TrendingUp, TrendingDown } from "lucide-react"
import { useCurrency } from "@/hooks/useCurrency"

// Mock Data
const TAX_YEAR = "2024-2025"
const INCOME = 4650000
const EXPENSES = 2592000
const PROFIT = INCOME - EXPENSES

// Simplified Indian Tax Brackets (Old Regime Mock)
const CORPORATE_TAX_RATE = 0.25 // 25% base for small domestic companies
const SURCHARGE = 0 // Under 1Cr
const CESS = 0.04 // 4% Health & Education Cess
const BASE_TAX = PROFIT * CORPORATE_TAX_RATE
const TOTAL_CORP_TAX = BASE_TAX + (BASE_TAX * SURCHARGE) + (BASE_TAX * CESS)

const GST_COLLECTED = 837000 // 18% on 46.5L
const GST_PAID = 466560 // 18% on 25.9L expenses
const GST_LIABILITY = GST_COLLECTED - GST_PAID

export default function TaxHubDashboard() {
  const { symbol } = useCurrency()
  
  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">
      {/* Header */}
      <div className="flex-none px-6 py-5 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Tax Hub & Compliance</h1>
            <p className="text-sm text-muted-foreground mt-1">Estimations for GST liability and Corporate Tax ({TAX_YEAR}).</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 bg-muted text-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-muted/80 transition-all border border-border/50">
              <Download className="w-4 h-4" />
              Export Tax Report
            </button>
            <button className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-all shadow-sm">
              <FileText className="w-4 h-4" /> File GST Return
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 flex flex-col xl:flex-row gap-6">
        
        {/* Left Column: Corporate Tax */}
        <div className="flex-1 space-y-6">
          <div className="bg-card border border-border/50 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-5 border-b border-border/50 flex items-center justify-between bg-muted/20">
              <div className="flex items-center gap-2 text-foreground font-bold">
                <Landmark className="w-5 h-5 text-primary" /> Corporate Income Tax Estimate
              </div>
              <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded border border-primary/20">
                FY {TAX_YEAR}
              </span>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted/30 p-4 rounded-xl border border-border/50">
                  <div className="text-sm text-muted-foreground mb-1">Gross Income</div>
                  <div className="text-xl font-bold text-foreground">{symbol}{INCOME.toLocaleString()}</div>
                </div>
                <div className="bg-muted/30 p-4 rounded-xl border border-border/50">
                  <div className="text-sm text-muted-foreground mb-1">Deductible Expenses</div>
                  <div className="text-xl font-bold text-foreground">{symbol}{EXPENSES.toLocaleString()}</div>
                </div>
              </div>

              <div className="bg-primary/5 p-5 rounded-xl border border-primary/20 flex items-center justify-between">
                <div>
                  <div className="text-sm text-primary font-bold mb-1">Taxable Profit</div>
                  <div className="text-3xl font-black text-primary">{symbol}{PROFIT.toLocaleString()}</div>
                </div>
                <Calculator className="w-8 h-8 text-primary opacity-20" />
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Base Tax (25%)</span>
                  <span className="font-medium text-foreground">{symbol}{BASE_TAX.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Surcharge</span>
                  <span className="font-medium text-foreground">{symbol}0</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Health & Education Cess (4%)</span>
                  <span className="font-medium text-foreground">{symbol}{(BASE_TAX * CESS).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-base font-bold pt-3 border-t border-border/50">
                  <span className="text-foreground">Estimated Tax Liability</span>
                  <span className="text-amber-500 text-xl">{symbol}{TOTAL_CORP_TAX.toLocaleString()}</span>
                </div>
              </div>

              <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl flex items-start gap-3 mt-4">
                <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                <div className="text-sm text-amber-600 font-medium">
                  Advance tax payment of {symbol}{(TOTAL_CORP_TAX * 0.15).toLocaleString()} is due by June 15th to avoid penalties under Section 234C.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: GST */}
        <div className="flex-1 space-y-6">
          <div className="bg-card border border-border/50 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-5 border-b border-border/50 flex items-center justify-between bg-muted/20">
              <div className="flex items-center gap-2 text-foreground font-bold">
                <FileText className="w-5 h-5 text-blue-500" /> GST Compliance
              </div>
              <span className="text-xs font-bold text-blue-500 bg-blue-500/10 px-2 py-1 rounded border border-blue-500/20">
                Current Quarter (Q1)
              </span>
            </div>

            <div className="p-6 space-y-6">
              
              <div className="relative">
                <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-border/50"></div>
                
                <div className="relative flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0 border-4 border-card z-10">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div className="flex-1 bg-muted/30 p-4 rounded-xl border border-border/50 flex justify-between items-center">
                    <div>
                      <div className="text-sm font-bold text-emerald-500">Output GST (Collected)</div>
                      <div className="text-xs text-muted-foreground">From sales & services</div>
                    </div>
                    <div className="text-xl font-bold text-foreground">{symbol}{GST_COLLECTED.toLocaleString()}</div>
                  </div>
                </div>

                <div className="relative flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center shrink-0 border-4 border-card z-10">
                    <TrendingDown className="w-5 h-5" />
                  </div>
                  <div className="flex-1 bg-muted/30 p-4 rounded-xl border border-border/50 flex justify-between items-center">
                    <div>
                      <div className="text-sm font-bold text-red-500">Input Tax Credit (ITC)</div>
                      <div className="text-xs text-muted-foreground">From business expenses</div>
                    </div>
                    <div className="text-xl font-bold text-foreground">{symbol}{GST_PAID.toLocaleString()}</div>
                  </div>
                </div>

                <div className="relative flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0 border-4 border-card z-10">
                    <Landmark className="w-5 h-5" />
                  </div>
                  <div className="flex-1 bg-blue-500/5 p-4 rounded-xl border border-blue-500/20 flex justify-between items-center shadow-sm">
                    <div>
                      <div className="text-sm font-bold text-blue-500">Net GST Liability</div>
                      <div className="text-xs text-blue-500/70">To be paid to government</div>
                    </div>
                    <div className="text-2xl font-black text-blue-500">{symbol}{GST_LIABILITY.toLocaleString()}</div>
                  </div>
                </div>
              </div>

              <div className="border-t border-border/50 pt-4">
                <h4 className="text-sm font-bold text-foreground mb-3">Recent Filings</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm p-2 hover:bg-muted/30 rounded-lg transition-colors cursor-pointer">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span className="font-medium text-foreground">GSTR-3B (April)</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-muted-foreground">Filed May 20</span>
                      <ArrowRight className="w-3 h-3 text-muted-foreground" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm p-2 hover:bg-muted/30 rounded-lg transition-colors cursor-pointer">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span className="font-medium text-foreground">GSTR-1 (April)</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-muted-foreground">Filed May 11</span>
                      <ArrowRight className="w-3 h-3 text-muted-foreground" />
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
