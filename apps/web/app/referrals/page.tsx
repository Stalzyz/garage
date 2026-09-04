"use client"

import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Zap,
  TrendingUp,
  DollarSign,
  Share2,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Award,
  Copy,
  Check,
  X,
  Users,
  ChevronRight,
  Gift,
  Layers,
  Clock
} from 'lucide-react'
import { useOrganization } from '@/context/OrganizationContext'
import { useCurrency } from '@/hooks/useCurrency'
import { fetchApi } from '@/lib/useApi'

export default function ReferralsLandingPage() {
  const org = useOrganization()
  const { symbol } = useCurrency()

  // State for Calculator
  const [projectValue, setProjectValue] = useState<number>(100000)
  const [dealsCount, setDealsCount] = useState<number>(3)

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [generatedRefCode, setGeneratedRefCode] = useState('')
  const [copied, setCopied] = useState(false)

  // Form inputs
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'Freelance Designer',
    linkedin: '',
  })

  // Dynamic Commission Rate Logic based on deal volume (Tiered: 10%, 12.5%, 15%)
  const commissionRate = useMemo(() => {
    if (dealsCount >= 10) return 15
    if (dealsCount >= 4) return 12.5
    return 10
  }, [dealsCount])

  const totalEarnings = useMemo(() => {
    return Math.round((projectValue * dealsCount * (commissionRate / 100)))
  }, [projectValue, dealsCount, commissionRate])

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.email || !formData.phone) {
      return alert('Please fill in your name, email, and phone number.')
    }

    setIsSubmitting(true)
    const refCode = `REF-${Math.floor(1000 + Math.random() * 9000)}`

    try {
      // Register lead/partner into CRM database
      await fetchApi('/crm/leads', {
        method: 'POST',
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          company: `Freelancer (${formData.role})`,
          notes: `Referral Partner Application [Code: ${refCode}]. LinkedIn: ${formData.linkedin || 'N/A'}`,
          status: 'WON',
        })
      }).catch(() => {
        // Fallback gracefully if endpoint returns mock/error in client mode
      })

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
    <div className="min-h-screen bg-[#050508] text-white flex flex-col font-sans relative overflow-x-hidden selection:bg-emerald-500 selection:text-black">
      
      {/* Dynamic Background Glow Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-600/15 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute top-[40%] right-[-10%] w-[45%] h-[45%] bg-blue-600/15 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[20%] w-[40%] h-[40%] bg-indigo-600/15 blur-[140px] rounded-full pointer-events-none" />

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Navigation Header */}
      <nav className="relative z-20 flex items-center justify-between px-6 md:px-12 py-6 border-b border-white/5 backdrop-blur-xl bg-black/40">
        <a href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.4)] group-hover:scale-105 transition-all">
            <Zap className="w-5 h-5 text-black font-bold" />
          </div>
          <div className="flex flex-col">
            <span className="font-black tracking-widest uppercase text-sm md:text-base text-white">{org.name || 'Grekam'}</span>
            <span className="text-[9px] font-mono tracking-widest text-emerald-400 uppercase -mt-1">Partner Network</span>
          </div>
        </a>

        <div className="flex items-center gap-4">
          <a href="/agency" className="hidden md:block text-xs uppercase tracking-widest text-white/50 hover:text-white transition-colors font-medium">
            Agency Services
          </a>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs px-5 py-2.5 rounded-xl uppercase tracking-wider transition-all shadow-[0_0_25px_rgba(16,185,129,0.3)] hover:shadow-[0_0_35px_rgba(16,185,129,0.5)]"
          >
            <Gift className="w-4 h-4" /> Join Program
          </button>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative z-10 pt-16 md:pt-24 pb-20 px-6 md:px-12 max-w-7xl mx-auto text-center flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-xs font-bold uppercase tracking-widest text-emerald-400 mb-8 backdrop-blur-md"
        >
          <Sparkles className="w-3.5 h-3.5" /> Official Freelancer & Agency Affiliate Hub
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl md:text-7xl lg:text-8xl font-black uppercase tracking-tight leading-[0.95] max-w-5xl mb-8"
        >
          Turn Client Leads Into <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
            Up To 15% Cash Commission
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-slate-400 text-base md:text-xl max-w-3xl leading-relaxed mb-12"
        >
          Have clients asking for custom web applications, mobile apps, or brand design that you don't have time to execute? 
          Refer them to <strong className="text-white">{org.name || 'Grekam'}</strong>. We build the project, and you earn direct payout commissions on every invoice paid.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
        >
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-3 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-sm px-8 py-4 rounded-xl uppercase tracking-widest transition-all shadow-[0_0_30px_rgba(16,185,129,0.4)]"
          >
            Get Your Partner Link <ArrowRight className="w-4 h-4" />
          </button>
          <a
            href="#calculator"
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold text-sm px-8 py-4 rounded-xl uppercase tracking-widest transition-all"
          >
            Calculate Earnings
          </a>
        </motion.div>

        {/* Live Quick Highlights Badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-4xl mt-16 pt-12 border-t border-white/10">
          <div className="p-4 bg-white/5 border border-white/10 rounded-2xl text-center">
            <span className="block text-2xl font-black text-emerald-400">10% - 15%</span>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Tiered Commission</span>
          </div>
          <div className="p-4 bg-white/5 border border-white/10 rounded-2xl text-center">
            <span className="block text-2xl font-black text-teal-400">48 Hours</span>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Fast Payouts</span>
          </div>
          <div className="p-4 bg-white/5 border border-white/10 rounded-2xl text-center">
            <span className="block text-2xl font-black text-cyan-400">0 Risk</span>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">We Deliver 100%</span>
          </div>
          <div className="p-4 bg-white/5 border border-white/10 rounded-2xl text-center">
            <span className="block text-2xl font-black text-indigo-400">Transparent</span>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Realtime Dashboard</span>
          </div>
        </div>
      </section>

      {/* TIERED COMMISSION SCALE */}
      <section className="relative z-10 py-20 px-6 md:px-12 bg-white/[0.02] border-y border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-2 block font-mono">Commission Scale</span>
            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight">
              The More Deals You Refer, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
                The Higher Your Share
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Tier 1 */}
            <div className="bg-white/5 border border-white/10 p-8 rounded-3xl relative hover:border-emerald-500/50 transition-all group">
              <div className="inline-flex items-center gap-2 text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full mb-6">
                <Award className="w-3.5 h-3.5" /> Tier 1: Starter
              </div>
              <h3 className="text-5xl font-black mb-2">10%</h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">First 1 – 3 Referred Projects</p>
              <ul className="space-y-3 text-sm text-slate-300 border-t border-white/10 pt-6">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> Payout on every paid milestone
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> Direct bank transfer or UPI
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> Dedicated partner link
                </li>
              </ul>
            </div>

            {/* Tier 2 */}
            <div className="bg-gradient-to-b from-emerald-500/10 to-transparent border border-emerald-500/40 p-8 rounded-3xl relative transform md:-translate-y-4 shadow-[0_0_40px_rgba(16,185,129,0.15)]">
              <div className="absolute -top-4 right-8 bg-emerald-500 text-black text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-lg">
                Most Popular
              </div>
              <div className="inline-flex items-center gap-2 text-xs font-mono font-bold text-teal-300 bg-teal-500/10 px-3 py-1 rounded-full mb-6">
                <Award className="w-3.5 h-3.5" /> Tier 2: Growth
              </div>
              <h3 className="text-5xl font-black mb-2 text-emerald-400">12.5%</h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">4 – 9 Referred Projects</p>
              <ul className="space-y-3 text-sm text-slate-300 border-t border-white/10 pt-6">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> Elevated 12.5% commission rate
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> Priority 24-hr payout processing
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> Joint client pitch support
                </li>
              </ul>
            </div>

            {/* Tier 3 */}
            <div className="bg-white/5 border border-white/10 p-8 rounded-3xl relative hover:border-indigo-500/50 transition-all group">
              <div className="inline-flex items-center gap-2 text-xs font-mono font-bold text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full mb-6">
                <Award className="w-3.5 h-3.5" /> Tier 3: VIP Partner
              </div>
              <h3 className="text-5xl font-black mb-2 text-indigo-400">15%</h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">10+ Projects or Retainers</p>
              <ul className="space-y-3 text-sm text-slate-300 border-t border-white/10 pt-6">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" /> Maximum 15% lifetime share
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" /> Monthly recurring retainer cuts
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" /> Custom co-branded landing page
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* INTERACTIVE EARNINGS CALCULATOR */}
      <section id="calculator" className="relative z-10 py-24 px-6 md:px-12 max-w-7xl mx-auto w-full">
        <div className="bg-gradient-to-br from-slate-900 via-black to-slate-950 border border-white/10 rounded-3xl p-8 md:p-14 shadow-2xl relative overflow-hidden">
          
          <div className="max-w-2xl mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 font-mono block mb-2">Earnings Simulator</span>
            <h2 className="text-4xl md:text-5xl font-black uppercase">Calculate Your Potential Income</h2>
            <p className="text-slate-400 text-sm mt-3">Adjust average project value and volume of deals to see how much you could earn effortlessly.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Sliders Area */}
            <div className="lg:col-span-7 space-y-8">
              
              {/* Slider 1: Average Deal Size */}
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <label className="font-bold text-slate-300">Average Project Value</label>
                  <span className="font-mono font-bold text-emerald-400 text-base">{symbol}{projectValue.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min="25000"
                  max="500000"
                  step="25000"
                  value={projectValue}
                  onChange={(e) => setProjectValue(Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>{symbol}25,000</span>
                  <span>{symbol}2,500,000</span>
                  <span>{symbol}5,000,000</span>
                </div>
              </div>

              {/* Slider 2: Number of Deals */}
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <label className="font-bold text-slate-300">Referred Projects per Quarter</label>
                  <span className="font-mono font-bold text-teal-400 text-base">{dealsCount} Projects</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="15"
                  step="1"
                  value={dealsCount}
                  onChange={(e) => setDealsCount(Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-500"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>1 Project</span>
                  <span>5 Projects</span>
                  <span>15+ Projects</span>
                </div>
              </div>

              {/* Active Tier Summary */}
              <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between text-xs">
                <span className="text-slate-400">Unlocked Commission Tier:</span>
                <span className="font-bold text-emerald-400 font-mono text-sm">{commissionRate}% Share Rate</span>
              </div>
            </div>

            {/* Total Earnings Display Box */}
            <div className="lg:col-span-5 bg-gradient-to-br from-emerald-500/20 via-emerald-600/10 to-transparent border border-emerald-500/30 p-8 rounded-3xl text-center space-y-6">
              <span className="text-xs uppercase font-bold tracking-widest text-slate-400">Estimated Total Cash Payout</span>
              <div className="text-5xl md:text-6xl font-black font-mono text-emerald-400">
                {symbol}{totalEarnings.toLocaleString()}
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Calculated on {dealsCount} deal(s) @ {symbol}{projectValue.toLocaleString()} with {commissionRate}% partner rate.
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-[0_0_25px_rgba(16,185,129,0.3)]"
              >
                Claim This Rate Now
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS (3 SIMPLE STEPS) */}
      <section className="relative z-10 py-20 px-6 md:px-12 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-2 block font-mono">Simple Workflow</span>
          <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight">How It Works</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white/5 border border-white/10 p-8 rounded-3xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-mono font-bold text-lg">
              01
            </div>
            <h3 className="text-xl font-bold uppercase">Generate Link</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Sign up in 30 seconds to generate your unique partner code and custom referral URL.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 p-8 rounded-3xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 font-mono font-bold text-lg">
              02
            </div>
            <h3 className="text-xl font-bold uppercase">Connect The Client</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Share your link or introduce your client for web apps, brand designs, or software development.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 p-8 rounded-3xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-mono font-bold text-lg">
              03
            </div>
            <h3 className="text-xl font-bold uppercase">Get Paid Automatically</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              When the client pays their milestone invoice, your commission is transferred directly to your account within 48 hours.
            </p>
          </div>
        </div>
      </section>

      {/* WHY PARTNER WITH GREKAM */}
      <section className="relative z-10 py-20 px-6 md:px-12 bg-white/[0.02] border-y border-white/5">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-2 block font-mono">Why Freelancers Love Us</span>
            <h2 className="text-4xl md:text-5xl font-black uppercase leading-tight mb-6">
              You Own The Relationship. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">We Do The Heavy Lifting.</span>
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed mb-8">
              Don't turn down clients because of full bandwidth or scope out of your stack. Pass the deal to Grekam and earn guaranteed income without taking on project risk.
            </p>

            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mt-1">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">Non-Compete & Client Protection</h4>
                  <p className="text-xs text-slate-400">We respect your relationship. We never pitch services outside the agreed scope.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mt-1">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">Rapid 48-Hour Payouts</h4>
                  <p className="text-xs text-slate-400">No waiting until the end of the month. Payouts trigger immediately on invoice payment.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-900 to-black p-8 rounded-3xl border border-white/10 space-y-6">
            <h3 className="font-black text-xl uppercase text-white">Example Earnings Real Scenario</h3>

            <div className="space-y-4 text-xs text-slate-300">
              <div className="p-4 bg-white/5 rounded-2xl flex justify-between items-center border border-white/5">
                <div>
                  <p className="font-bold text-white">Fullstack Web App Referral</p>
                  <p className="text-slate-500">Client Invoice: {symbol}200,000</p>
                </div>
                <span className="font-mono font-bold text-emerald-400 text-base">+{symbol}20,000</span>
              </div>

              <div className="p-4 bg-white/5 rounded-2xl flex justify-between items-center border border-white/5">
                <div>
                  <p className="font-bold text-white">Brand & UI/UX Retainer</p>
                  <p className="text-slate-500">Monthly Retainer: {symbol}80,000/mo</p>
                </div>
                <span className="font-mono font-bold text-teal-400 text-base">+{symbol}12,000/mo</span>
              </div>

              <div className="p-4 bg-white/5 rounded-2xl flex justify-between items-center border border-white/5">
                <div>
                  <p className="font-bold text-white">Enterprise AI Bot Workflow</p>
                  <p className="text-slate-500">Client Invoice: {symbol}350,000</p>
                </div>
                <span className="font-mono font-bold text-indigo-400 text-base">+{symbol}52,500</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 py-12 px-6 md:px-12 border-t border-white/5 bg-black/60 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>© {new Date().getFullYear()} {org.name || 'Grekam'}. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="/legal/terms" className="hover:text-white transition-colors">Terms</a>
            <a href="/legal/privacy" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="/contact" className="hover:text-white transition-colors">Support</a>
          </div>
        </div>
      </footer>

      {/* INTERACTIVE APPLICATION MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-[#0f0f13] border border-white/10 rounded-3xl p-8 shadow-2xl relative text-white"
            >
              <button
                onClick={() => {
                  setIsModalOpen(false)
                  setIsSubmitted(false)
                }}
                className="absolute top-6 right-6 text-slate-400 hover:text-white p-2 rounded-full hover:bg-white/5 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {!isSubmitted ? (
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-[10px] font-bold uppercase tracking-widest mb-4">
                    <Sparkles className="w-3 h-3" /> 1-Minute Partner Join
                  </div>
                  <h3 className="text-2xl font-black uppercase mb-2">Join Partner Network</h3>
                  <p className="text-xs text-slate-400 mb-6">
                    Enter your details to generate your personal referral code and link instantly.
                  </p>

                  <form onSubmit={handleApply} className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-emerald-500 transition-colors"
                        placeholder="e.g. Stalin Kumar"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-emerald-500 transition-colors"
                        placeholder="stalin@example.com"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                        Phone / WhatsApp *
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-emerald-500 transition-colors"
                        placeholder="+91 98400 12345"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                          Primary Skill
                        </label>
                        <select
                          value={formData.role}
                          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                          className="w-full bg-[#18181f] border border-white/10 rounded-xl px-3 py-2.5 text-xs outline-none focus:border-emerald-500"
                        >
                          <option value="Freelance Designer">UI/UX Designer</option>
                          <option value="Developer">Developer</option>
                          <option value="Sales Consultant">Sales / Consultant</option>
                          <option value="Agency Owner">Agency Partner</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                          LinkedIn / Portfolio
                        </label>
                        <input
                          type="text"
                          value={formData.linkedin}
                          onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs outline-none focus:border-emerald-500"
                          placeholder="Optional"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] disabled:opacity-50 mt-4"
                    >
                      {isSubmitting ? 'Generating...' : 'Generate My Referral Link'}
                    </button>
                  </form>
                </div>
              ) : (
                <div className="text-center space-y-6 py-4">
                  <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500/40 rounded-full flex items-center justify-center mx-auto text-emerald-400">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>

                  <div>
                    <h3 className="text-2xl font-black uppercase text-white">You're Approved!</h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Your referral code <strong className="text-emerald-400 font-mono">{generatedRefCode}</strong> is now active.
                    </p>
                  </div>

                  <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-2">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block">Your Custom Link</span>
                    <p className="text-xs font-mono text-emerald-400 truncate">
                      https://grekam.in/referrals?ref={generatedRefCode}
                    </p>
                    <button
                      onClick={handleCopyLink}
                      className="w-full flex items-center justify-center gap-2 py-2 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-bold rounded-xl hover:bg-emerald-500/30 transition-all mt-2"
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      {copied ? 'Link Copied!' : 'Copy Referral Link'}
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Share this link with your clients or team. Whenever a client submits an inquiry through your link, it is tagged directly to your partner ID.
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  )
}
