"use client"

import React, { useState, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowRight,
  Shield,
  Copy,
  Check,
  X,
  ArrowUpRight,
  Briefcase,
  CheckCircle2,
  Wallet,
  Clock,
  Layers,
  Users,
  Percent,
  Target,
  Share2,
  FileText,
  ChevronDown,
  Info,
  CheckCircle,
  HelpCircle
} from 'lucide-react'
import { useOrganization } from '@/context/OrganizationContext'
import { useCurrency } from '@/hooks/useCurrency'
import { fetchApi } from '@/lib/useApi'

export default function ReferralsLandingPage() {
  const org = useOrganization()
  const { symbol } = useCurrency()

  // Calculator State
  const [projectValue, setProjectValue] = useState<number>(100000)
  const [isReferralActive, setIsReferralActive] = useState<boolean>(true)
  const [isSalesActive, setIsSalesActive] = useState<boolean>(true)
  const [isPmActive, setIsPmActive] = useState<boolean>(true)

  // Terms Modal & Application Modal State
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false)
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false)
  const [isTermsAccepted, setIsTermsAccepted] = useState(false)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [generatedRefCode, setGeneratedRefCode] = useState('')
  const [copied, setCopied] = useState(false)

  const termsContainerRef = useRef<HTMLDivElement>(null)

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    specialty: 'Referral Partner',
    portfolio: '',
  })

  // Dynamic Commission Rate Evaluation
  const referralRate = 5.0

  const salesRate = useMemo(() => {
    if (projectValue >= 250000) return 10.0
    if (projectValue >= 100000) return 9.0
    if (projectValue >= 50000) return 8.0
    if (projectValue >= 10000) return 7.0
    return 5.0
  }, [projectValue])

  const pmRate = useMemo(() => {
    if (projectValue >= 250000) return 3.0
    if (projectValue >= 50000) return 2.5
    return 2.0
  }, [projectValue])

  // Single person capping calculation
  const { totalCommissionAmount, effectiveRate, isCapped } = useMemo(() => {
    let r = isReferralActive ? referralRate : 0
    let s = isSalesActive ? salesRate : 0
    let p = isPmActive ? pmRate : 0

    let rawRate = r + s + p
    let capped = false

    // Single person cap at 15% if 1 person performs all 3 roles
    if (isReferralActive && isSalesActive && isPmActive && rawRate > 15.0) {
      rawRate = 15.0
      capped = true
    }

    const amount = Math.round(projectValue * (rawRate / 100))
    return { totalCommissionAmount: amount, effectiveRate: rawRate, isCapped: capped }
  }, [projectValue, isReferralActive, isSalesActive, isPmActive, referralRate, salesRate, pmRate])

  const handleStartRegistration = () => {
    if (!isTermsAccepted) {
      setHasScrolledToBottom(false)
      setIsTermsModalOpen(true)
    } else {
      setIsModalOpen(true)
    }
  }

  const handleTermsScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget
    // Check if scrolled within 25px of bottom
    if (scrollHeight - scrollTop - clientHeight <= 25) {
      setHasScrolledToBottom(true)
    }
  }

  const handleAcceptTerms = () => {
    if (!hasScrolledToBottom) return
    setIsTermsAccepted(true)
    setIsTermsModalOpen(false)
    setIsModalOpen(true)
  }

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.email || !formData.phone) {
      return alert('Please enter your name, email, and phone number.')
    }

    setIsSubmitting(true)
    const refCode = `PARTNER-${Math.floor(1000 + Math.random() * 9000)}`

    try {
      await fetchApi('/crm/leads', {
        method: 'POST',
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          company: `Partner (${formData.specialty})`,
          notes: `Referral Partner Application [Code: ${refCode}]. Terms Accepted: Yes. Portfolio: ${formData.portfolio || 'N/A'}`,
          status: 'WON',
        })
      }).catch(() => {})

      setGeneratedRefCode(refCode)
      setIsSubmitted(true)
    } catch (err) {
      console.error(err)
      setGeneratedRefCode(refCode)
      setIsSubmitted(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCopyLink = () => {
    const link = `${typeof window !== 'undefined' ? window.location.origin : 'https://grekam.in'}/referrals?ref=${generatedRefCode}`
    navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-[#08090c] text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-black">
      
      {/* Navigation Header */}
      <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-[#08090c]/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <a href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 text-black flex items-center justify-center font-black text-sm">
              G
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm text-white tracking-tight">{org.name || 'Grekam'}</span>
              <span className="text-[10px] text-slate-400 font-mono tracking-wider uppercase">Partner Program</span>
            </div>
          </a>

          <div className="flex items-center gap-6 text-xs">
            <a href="/agency" className="hidden md:block text-slate-400 hover:text-white transition-colors font-medium">
              Agency Services
            </a>
            <button
              onClick={handleStartRegistration}
              className="bg-white text-slate-900 hover:bg-slate-200 font-bold px-4 py-2.5 rounded-lg transition-colors flex items-center gap-1.5"
            >
              Become a Partner <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="pt-20 pb-16 px-6 max-w-4xl mx-auto text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-800/80 border border-slate-700/60 rounded-full text-xs font-mono font-medium text-emerald-400">
          <Percent className="w-3.5 h-3.5" /> 5% – 18% Revenue Share Plan
        </div>

        <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-[1.1]">
          Focus on what you do best. <br />
          <span className="text-emerald-400">Earn revenue on client deals & project delivery.</span>
        </h1>

        <p className="text-slate-400 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
          Production is 100% handled by our in-house engineering team. Earn structured commissions for <strong className="text-white">referring clients (5%)</strong>, <strong className="text-white">closing deals (7%–10%)</strong>, or <strong className="text-white">managing projects (2%–3%)</strong>.
        </p>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={handleStartRegistration}
            className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-sm px-6 py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10"
          >
            Register as Partner <ArrowRight className="w-4 h-4" />
          </button>
          <a
            href="#plan-breakdown"
            className="w-full sm:w-auto bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 font-medium text-sm px-6 py-3.5 rounded-xl transition-colors text-center"
          >
            Explore Plan & Examples
          </a>
        </div>
      </section>

      {/* 3-ROLE COMMISSION PLAN BREAKDOWN */}
      <section id="plan-breakdown" className="py-16 px-6 max-w-6xl mx-auto w-full border-t border-slate-800/80">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <p className="text-xs font-mono font-bold uppercase tracking-widest text-slate-500">Commission Structure</p>
          <h2 className="text-3xl md:text-4xl font-black text-white">3 Ways to Earn With Grekam</h2>
          <p className="text-slate-400 text-sm">Clear responsibilities and transparent payouts for every stage of a client project.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* ROLE 1: REFERRAL PARTNER */}
          <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl space-y-4 relative flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center">
                <Share2 className="w-5 h-5" />
              </div>
              <div className="text-xs font-mono font-bold text-blue-400 uppercase tracking-wider">ROLE 01</div>
              <h3 className="text-2xl font-bold text-white">Referral Partner</h3>
              <div className="text-3xl font-black text-blue-400 font-mono">5%</div>
              <p className="text-xs text-slate-400 leading-relaxed">
                For introducing a genuine prospect to Grekam. Share basic requirements & connect the client. No responsibility for closing or delivery.
              </p>
            </div>

            <div className="pt-4 border-t border-slate-800/80 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">Example Payout:</span>
              <div className="p-3 bg-slate-950 rounded-xl flex justify-between items-center text-xs">
                <span className="text-slate-400">₹50,000 Project</span>
                <span className="font-mono font-bold text-blue-400">₹2,500</span>
              </div>
            </div>
          </div>

          {/* ROLE 2: SALES + CLOSING */}
          <div className="bg-slate-900 border border-emerald-500/40 p-6 rounded-2xl space-y-4 relative flex flex-col justify-between shadow-xl shadow-emerald-500/5">
            <div className="absolute -top-3 right-4 bg-emerald-500 text-black text-[10px] font-bold px-2.5 py-0.5 rounded-full">
              HIGHEST EARNING
            </div>
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                <Target className="w-5 h-5" />
              </div>
              <div className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">ROLE 02</div>
              <h3 className="text-2xl font-bold text-white">Sales & Closing</h3>
              <div className="text-3xl font-black text-emerald-400 font-mono">7% – 10%</div>
              <p className="text-xs text-slate-400 leading-relaxed">
                For converting leads into paying clients. Scope requirements, present solutions, follow up on proposals, negotiate, and close deals.
              </p>
            </div>

            <div className="pt-4 border-t border-slate-800/80 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">Deal Tier Breakdown:</span>
              <div className="space-y-1.5 text-xs font-mono">
                <div className="flex justify-between text-slate-400">
                  <span>₹10k – ₹49.9k</span>
                  <span className="text-emerald-400 font-bold">7%</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>₹50k – ₹99.9k</span>
                  <span className="text-emerald-400 font-bold">8%</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>₹1.0L – ₹2.49L</span>
                  <span className="text-emerald-400 font-bold">9%</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>₹2.50L+</span>
                  <span className="text-emerald-400 font-bold">10%</span>
                </div>
              </div>
            </div>
          </div>

          {/* ROLE 3: PROJECT MANAGER */}
          <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl space-y-4 relative flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center">
                <Briefcase className="w-5 h-5" />
              </div>
              <div className="text-xs font-mono font-bold text-purple-400 uppercase tracking-wider">ROLE 03</div>
              <h3 className="text-2xl font-bold text-white">Project Manager</h3>
              <div className="text-3xl font-black text-purple-400 font-mono">2% – 3%</div>
              <p className="text-xs text-slate-400 leading-relaxed">
                For client communication, managing requirements, coordinating in-house developers, tracking deadlines, and driving final client signoff.
              </p>
            </div>

            <div className="pt-4 border-t border-slate-800/80 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">PM Scale Breakdown:</span>
              <div className="space-y-1.5 text-xs font-mono">
                <div className="flex justify-between text-slate-400">
                  <span>Small Project</span>
                  <span className="text-purple-400 font-bold">2.0%</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Standard Project</span>
                  <span className="text-purple-400 font-bold">2.5%</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Large / Complex</span>
                  <span className="text-purple-400 font-bold">3.0%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CONCRETE REAL-WORLD EXAMPLE CASE STUDY */}
      <section className="py-16 px-6 max-w-5xl mx-auto w-full border-t border-slate-800/80">
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-8 md:p-10 space-y-6 relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-emerald-400">Practical Example</span>
              <h3 className="text-2xl md:text-3xl font-bold text-white mt-1">₹1,00,000 Web Project Breakdown</h3>
            </div>
            <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl font-mono text-xs font-bold text-center">
              Total Commission: ₹16,500 (16.5%)
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-950 border border-slate-800/80 rounded-xl space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Referral Partner (5%)</span>
                <span className="font-mono text-blue-400 font-bold">₹5,000</span>
              </div>
              <p className="text-[11px] text-slate-500">Introduced client & requirements</p>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800/80 rounded-xl space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Sales Closer (9%)</span>
                <span className="font-mono text-emerald-400 font-bold">₹9,000</span>
              </div>
              <p className="text-[11px] text-slate-500">Converted deal (₹1L tier = 9%)</p>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800/80 rounded-xl space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Project Manager (2.5%)</span>
                <span className="font-mono text-purple-400 font-bold">₹2,500</span>
              </div>
              <p className="text-[11px] text-slate-500">Managed delivery & client approval</p>
            </div>
          </div>

          <div className="p-4 bg-emerald-950/30 border border-emerald-500/30 rounded-xl flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Grekam retains <strong>₹83,500 (83.5%)</strong> for in-house engineering, design, and deployment.</span>
            </div>
            <button
              onClick={handleStartRegistration}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-lg text-xs tracking-wider transition-colors shrink-0"
            >
              Get Started Now
            </button>
          </div>
        </div>
      </section>

      {/* INTERACTIVE CALCULATOR */}
      <section id="calculator" className="py-16 px-6 max-w-5xl mx-auto w-full border-t border-slate-800/80">
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-8 md:p-12 space-y-8">
          <div className="space-y-1">
            <p className="text-xs font-mono font-bold uppercase tracking-widest text-slate-500 font-mono">Interactive Calculator</p>
            <h3 className="text-2xl font-bold text-white">Estimate Your Project Earnings</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-7 space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400 font-medium">Net Project Value (Ex-GST)</span>
                  <span className="font-mono font-bold text-white text-sm">{symbol}{projectValue.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min="20000"
                  max="500000"
                  step="10000"
                  value={projectValue}
                  onChange={(e) => setProjectValue(Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
              </div>

              {/* Roles Checkbox Selection */}
              <div className="space-y-3 pt-2">
                <span className="text-xs text-slate-400 font-medium block">Select Roles Performed:</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <label className={`p-3 rounded-xl border cursor-pointer flex items-center gap-2.5 text-xs transition-colors ${isReferralActive ? 'bg-blue-500/10 border-blue-500/40 text-white' : 'bg-slate-950 border-slate-800 text-slate-500'}`}>
                    <input
                      type="checkbox"
                      checked={isReferralActive}
                      onChange={(e) => setIsReferralActive(e.target.checked)}
                      className="accent-blue-500 rounded"
                    />
                    <div>
                      <span className="font-bold block">Referral</span>
                      <span className="text-[10px] text-blue-400 font-mono">5.0%</span>
                    </div>
                  </label>

                  <label className={`p-3 rounded-xl border cursor-pointer flex items-center gap-2.5 text-xs transition-colors ${isSalesActive ? 'bg-emerald-500/10 border-emerald-500/40 text-white' : 'bg-slate-950 border-slate-800 text-slate-500'}`}>
                    <input
                      type="checkbox"
                      checked={isSalesActive}
                      onChange={(e) => setIsSalesActive(e.target.checked)}
                      className="accent-emerald-500 rounded"
                    />
                    <div>
                      <span className="font-bold block">Sales Closer</span>
                      <span className="text-[10px] text-emerald-400 font-mono">{salesRate}%</span>
                    </div>
                  </label>

                  <label className={`p-3 rounded-xl border cursor-pointer flex items-center gap-2.5 text-xs transition-colors ${isPmActive ? 'bg-purple-500/10 border-purple-500/40 text-white' : 'bg-slate-950 border-slate-800 text-slate-500'}`}>
                    <input
                      type="checkbox"
                      checked={isPmActive}
                      onChange={(e) => setIsPmActive(e.target.checked)}
                      className="accent-purple-500 rounded"
                    />
                    <div>
                      <span className="font-bold block">Project Mgr</span>
                      <span className="text-[10px] text-purple-400 font-mono">{pmRate}%</span>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            <div className="md:col-span-5 bg-slate-950 border border-slate-800 p-6 rounded-2xl text-center space-y-4">
              <span className="text-xs text-slate-400 uppercase font-medium tracking-wider">Estimated Total Payout</span>
              <div className="text-4xl font-black font-mono text-emerald-400">
                {symbol}{totalCommissionAmount.toLocaleString()}
              </div>
              <div className="text-[11px] text-slate-400 font-mono">
                Effective Rate: <strong className="text-white">{effectiveRate}%</strong>
                {isCapped && <span className="block text-amber-400 text-[10px] mt-1">(Single-Person Cap at 15%)</span>}
              </div>
              <button
                onClick={handleStartRegistration}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs uppercase tracking-wider rounded-xl transition-colors"
              >
                Register & Get Code
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CORE COMMISSION RULES */}
      <section className="py-16 px-6 max-w-5xl mx-auto w-full border-t border-slate-800/80">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-1">
          <p className="text-xs font-mono font-bold uppercase tracking-widest text-slate-500">Transparent Policies</p>
          <h3 className="text-2xl font-bold text-white">Important Commission Rules</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-2 bg-slate-900/40 border border-slate-800 p-6 rounded-2xl">
            <div className="w-8 h-8 rounded-lg bg-slate-800 text-emerald-400 flex items-center justify-center mb-3">
              <Shield className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-white text-sm">Calculated on Net Service Value</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Calculated on Net Service Value (Excludes GST 18%, Domain/Hosting, Paid Plugins, APIs, and pass-through costs).
            </p>
          </div>

          <div className="space-y-2 bg-slate-900/40 border border-slate-800 p-6 rounded-2xl">
            <div className="w-8 h-8 rounded-lg bg-slate-800 text-emerald-400 flex items-center justify-center mb-3">
              <Wallet className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-white text-sm">Milestone Payment Trigger</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Referral & Sales commissions are released pro-rata upon client payment. PM commissions are released on final project completion.
            </p>
          </div>

          <div className="space-y-2 bg-slate-900/40 border border-slate-800 p-6 rounded-2xl">
            <div className="w-8 h-8 rounded-lg bg-slate-800 text-emerald-400 flex items-center justify-center mb-3">
              <Briefcase className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-white text-sm">Maximum 18% Combined Cap</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Maximum combined commission is capped at 18% (Referral 5% + Sales 10% + PM 3%). Single-person multi-role is capped at 15%.
            </p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-8 px-6 border-t border-slate-800/80 text-xs text-slate-500 mt-auto">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>© {new Date().getFullYear()} {org.name || 'Grekam'}. All rights reserved.</p>
          <div className="flex gap-6">
            <button onClick={() => setIsTermsModalOpen(true)} className="hover:text-white transition-colors">Terms & Conditions</button>
            <a href="/legal/privacy" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="/contact" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </footer>

      {/* TERMS AND CONDITIONS MODAL (MANDATORY SCROLL TO BOTTOM) */}
      <AnimatePresence>
        {isTermsModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative text-white space-y-4 flex flex-col max-h-[85vh]"
            >
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <FileText className="w-5 h-5 text-emerald-400" />
                    Partner Terms & Conditions
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Please scroll to the bottom of the document to proceed with partner registration.
                  </p>
                </div>
                <button
                  onClick={() => setIsTermsModalOpen(false)}
                  className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Terms Content */}
              <div
                ref={termsContainerRef}
                onScroll={handleTermsScroll}
                className="flex-1 overflow-y-auto pr-3 space-y-4 text-xs text-slate-300 custom-scrollbar border border-slate-800 p-4 rounded-2xl bg-slate-950"
              >
                <div className="space-y-1">
                  <h4 className="font-bold text-white text-sm">1. Introduction & Scope</h4>
                  <p className="leading-relaxed">
                    This Partner Agreement governs participation in the Grekam Web Development Partner Program. By registering as a partner, you agree to comply with all rules, role structures, and payout triggers outlined herein.
                  </p>
                </div>

                <div className="space-y-1">
                  <h4 className="font-bold text-white text-sm">2. Commission Structure & Tiers</h4>
                  <p className="leading-relaxed">
                    Commissions are awarded across three distinct roles:
                  </p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li><strong>Referral Partner (5%)</strong>: Earned upon introducing a genuine prospect and basic requirements.</li>
                    <li><strong>Sales & Closing (7%–10%)</strong>: Tiered based on Net Service Value (₹10k–49k: 7%, ₹50k–99k: 8%, ₹1L–2.49L: 9%, ₹2.5L+: 10%).</li>
                    <li><strong>Project Manager (2%–3%)</strong>: Earned for managing client communication and internal production team coordination (Small: 2%, Standard: 2.5%, Large: 3%).</li>
                  </ul>
                </div>

                <div className="space-y-1">
                  <h4 className="font-bold text-white text-sm">3. Net Service Value Calculation</h4>
                  <p className="leading-relaxed">
                    Commissions are calculated strictly on Net Service Value (Invoice Subtotal excluding 18% GST, domain registrations, hosting fees, paid plugins, API costs, and third-party pass-through expenses).
                  </p>
                </div>

                <div className="space-y-1">
                  <h4 className="font-bold text-white text-sm">4. Payout Triggers & Timing</h4>
                  <p className="leading-relaxed">
                    Referral and Sales commissions are released pro-rata upon receipt of customer payment milestones. Project Manager commissions are released only after final client project completion and full settlement.
                  </p>
                </div>

                <div className="space-y-1">
                  <h4 className="font-bold text-white text-sm">5. Maximum Commission Caps</h4>
                  <p className="leading-relaxed">
                    The combined maximum commission payout across all roles for a single project is 18%. If a single individual performs Referral, Sales, and PM roles on the same deal, their total combined commission is capped at 15.0%.
                  </p>
                </div>

                <div className="space-y-1">
                  <h4 className="font-bold text-white text-sm">6. Relationship & Non-Compete</h4>
                  <p className="leading-relaxed">
                    Partners act as independent contractors. Grekam agrees not to solicit or bypass partners for future referred scopes outside the registered agreement.
                  </p>
                </div>

                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-[11px] text-emerald-400 font-mono">
                  ✓ You have reached the bottom of the Terms & Conditions agreement. You may now accept and proceed.
                </div>
              </div>

              {/* Scroll Status & Action Footer */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                {!hasScrolledToBottom ? (
                  <div className="text-[11px] text-amber-400 font-mono flex items-center gap-1.5 animate-pulse">
                    <ChevronDown className="w-4 h-4" /> Scroll to the bottom to unlock acceptance
                  </div>
                ) : (
                  <div className="text-[11px] text-emerald-400 font-mono flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> Ready to Accept
                  </div>
                )}

                <button
                  onClick={handleAcceptTerms}
                  disabled={!hasScrolledToBottom}
                  className="w-full sm:w-auto px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs uppercase tracking-wider rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  I Accept Terms & Proceed <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* APPLICATION REGISTRATION MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative text-white space-y-4"
            >
              <button
                onClick={() => {
                  setIsModalOpen(false)
                  setIsSubmitted(false)
                }}
                className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {!isSubmitted ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-white">Partner Registration</h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Terms Accepted ✓ Fill out details to generate your partner referral code.
                    </p>
                  </div>

                  <form onSubmit={handleApply} className="space-y-3 pt-2">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-400 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-emerald-500"
                        placeholder="e.g. Stalin Kumar"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-400 mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-emerald-500"
                        placeholder="stalin@example.com"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-400 mb-1">
                        Phone / WhatsApp *
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-emerald-500"
                        placeholder="+91 98400 12345"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-medium text-slate-400 mb-1">
                          Primary Specialty
                        </label>
                        <select
                          value={formData.specialty}
                          onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-2 text-xs text-white outline-none focus:border-emerald-500"
                        >
                          <option value="Referral Partner">Referral Partner</option>
                          <option value="Sales Closer">Sales Closer</option>
                          <option value="Project Manager">Project Manager</option>
                          <option value="UI/UX Designer">UI/UX Designer</option>
                          <option value="Developer">Developer</option>
                          <option value="Agency Owner">Agency Owner</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-slate-400 mb-1">
                          Portfolio / LinkedIn
                        </label>
                        <input
                          type="text"
                          value={formData.portfolio}
                          onChange={(e) => setFormData({ ...formData, portfolio: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-emerald-500"
                          placeholder="Optional"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs uppercase tracking-wider rounded-lg transition-colors disabled:opacity-50 mt-2"
                    >
                      {isSubmitting ? 'Generating...' : 'Complete & Get Referral Link'}
                    </button>
                  </form>
                </div>
              ) : (
                <div className="text-center space-y-4 py-2">
                  <div className="w-12 h-12 bg-emerald-500/20 border border-emerald-500/40 rounded-full flex items-center justify-center mx-auto text-emerald-400">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-white">Partner Code Activated</h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Your referral code <strong className="text-emerald-400 font-mono">{generatedRefCode}</strong> is ready.
                    </p>
                  </div>

                  <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">Your Partner Referral Link</span>
                    <p className="text-xs font-mono text-emerald-400 truncate">
                      https://grekam.in/referrals?ref={generatedRefCode}
                    </p>
                    <button
                      onClick={handleCopyLink}
                      className="w-full flex items-center justify-center gap-2 py-2 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-bold rounded-lg hover:bg-emerald-500/30 transition-colors mt-2"
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      {copied ? 'Link Copied!' : 'Copy Partner Link'}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  )
}
