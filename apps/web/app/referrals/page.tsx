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
  ShieldCheck,
  Building2,
  Lock,
  Award,
  Zap,
  Phone,
  Mail
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
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      
      {/* High-Trust Light Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-xs">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <a href="/" className="flex items-center gap-3 group">
            {org.logoUrl ? (
              <img
                src={org.logoUrl}
                alt={org.name || 'Grekam Visuals'}
                className="h-9 w-auto object-contain"
              />
            ) : (
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-base shadow-sm">
                G
              </div>
            )}
            <div className="flex flex-col">
              <span className="font-bold text-sm text-slate-900 tracking-tight group-hover:text-emerald-600 transition-colors">
                {org.name || 'Grekam Visuals'}
              </span>
              <span className="text-[10px] text-slate-500 font-mono tracking-wider uppercase font-semibold">
                Partner & Referral Program
              </span>
            </div>
          </a>

          <div className="flex items-center gap-6 text-xs font-semibold">
            <a href="/agency" className="hidden md:block text-slate-600 hover:text-slate-900 transition-colors">
              Agency Services
            </a>
            <button
              onClick={handleStartRegistration}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-1.5 hover:shadow-md"
            >
              Become a Partner <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* HERO SECTION WITH REAL TEAM MEDIA */}
      <section className="pt-16 pb-16 px-6 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-emerald-50 border border-emerald-200 rounded-full text-xs font-mono font-bold text-emerald-700">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> Guaranteed 5% – 18% Revenue Share
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.12]">
              Focus on your craft. <br />
              <span className="text-emerald-600">Earn when you bring or manage client deals.</span>
            </h1>

            <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
              Production is 100% handled by our in-house design and engineering team. Earn transparent payouts for <strong className="text-slate-900">referring clients (5%)</strong>, <strong className="text-slate-900">closing deals (7%–10%)</strong>, or <strong className="text-slate-900">managing project milestones (2%–3%)</strong>.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <button
                onClick={handleStartRegistration}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm px-7 py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 hover:scale-[1.01]"
              >
                Register & Get Partner Code <ArrowRight className="w-4 h-4" />
              </button>
              <a
                href="#plan-breakdown"
                className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-sm px-6 py-4 rounded-xl transition-colors text-center shadow-xs"
              >
                View Commission Rules & Examples
              </a>
            </div>

            {/* TRUST BADGES */}
            <div className="pt-6 border-t border-slate-200 grid grid-cols-3 gap-4 text-xs font-medium text-slate-600">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>100% In-House Team</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>NDA & Client Protection</span>
              </div>
              <div className="flex items-center gap-2">
                <Wallet className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Immediate Milestone Payouts</span>
              </div>
            </div>
          </div>

          {/* HERO IMAGE SHOWCASE */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-200 bg-white">
              <img
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1000&q=80"
                alt="Grekam Engineering Team Collaboration"
                className="w-full h-80 sm:h-96 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent flex flex-col justify-end p-6 text-white">
                <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold">Grekam Engineering Desk</span>
                <p className="text-sm font-bold mt-1">Fullstack Web & Mobile Product Delivery</p>
                <p className="text-xs text-slate-300 mt-0.5">We build the code. You get paid on every invoice milestone.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3-ROLE COMMISSION PLAN BREAKDOWN */}
      <section id="plan-breakdown" className="py-16 px-6 max-w-6xl mx-auto w-full border-t border-slate-200">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
            Commission Structure
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900">3 Transparent Ways to Earn</h2>
          <p className="text-slate-600 text-sm">Distinct role payouts aligned with your exact involvement in the deal.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* ROLE 1: REFERRAL PARTNER */}
          <div className="bg-white border border-slate-200 p-7 rounded-3xl space-y-5 relative flex flex-col justify-between shadow-xs hover:shadow-md transition-shadow">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center">
                <Share2 className="w-6 h-6" />
              </div>
              <div className="text-xs font-mono font-bold text-blue-600 uppercase tracking-wider">ROLE 01</div>
              <h3 className="text-2xl font-bold text-slate-900">Referral Partner</h3>
              <div className="text-4xl font-black text-blue-600 font-mono">5%</div>
              <p className="text-xs text-slate-600 leading-relaxed">
                For introducing a genuine client to Grekam. Share basic requirements and connect the client. Zero responsibility for closing or project management.
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Example Payout:</span>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex justify-between items-center text-xs">
                <span className="text-slate-600 font-medium">₹50,000 Website</span>
                <span className="font-mono font-bold text-blue-700 text-sm">₹2,500</span>
              </div>
            </div>
          </div>

          {/* ROLE 2: SALES + CLOSING */}
          <div className="bg-white border-2 border-emerald-500 p-7 rounded-3xl space-y-5 relative flex flex-col justify-between shadow-lg shadow-emerald-500/5">
            <div className="absolute -top-3.5 right-6 bg-emerald-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
              HIGHEST EARNING
            </div>
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center">
                <Target className="w-6 h-6" />
              </div>
              <div className="text-xs font-mono font-bold text-emerald-600 uppercase tracking-wider">ROLE 02</div>
              <h3 className="text-2xl font-bold text-slate-900">Sales & Closing</h3>
              <div className="text-4xl font-black text-emerald-600 font-mono">7% – 10%</div>
              <p className="text-xs text-slate-600 leading-relaxed">
                For converting leads into paying clients. Present proposals, handle negotiations, close deals, and coordinate payment confirmation.
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Deal Tier Breakdown:</span>
              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between p-2 bg-slate-50 rounded-lg">
                  <span className="text-slate-600 font-medium">₹10k – ₹49.9k</span>
                  <span className="text-emerald-700 font-bold">7%</span>
                </div>
                <div className="flex justify-between p-2 bg-slate-50 rounded-lg">
                  <span className="text-slate-600 font-medium">₹50k – ₹99.9k</span>
                  <span className="text-emerald-700 font-bold">8%</span>
                </div>
                <div className="flex justify-between p-2 bg-slate-50 rounded-lg">
                  <span className="text-slate-600 font-medium">₹1.0L – ₹2.49L</span>
                  <span className="text-emerald-700 font-bold">9%</span>
                </div>
                <div className="flex justify-between p-2 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <span className="text-emerald-900 font-bold">₹2.50L+ Enterprise</span>
                  <span className="text-emerald-700 font-bold">10%</span>
                </div>
              </div>
            </div>
          </div>

          {/* ROLE 3: PROJECT MANAGER */}
          <div className="bg-white border border-slate-200 p-7 rounded-3xl space-y-5 relative flex flex-col justify-between shadow-xs hover:shadow-md transition-shadow">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-200 text-purple-600 flex items-center justify-center">
                <Briefcase className="w-6 h-6" />
              </div>
              <div className="text-xs font-mono font-bold text-purple-600 uppercase tracking-wider">ROLE 03</div>
              <h3 className="text-2xl font-bold text-slate-900">Project Manager</h3>
              <div className="text-4xl font-black text-purple-600 font-mono">2% – 3%</div>
              <p className="text-xs text-slate-600 leading-relaxed">
                For client communication, requirement gathering, assigning work to internal developers, tracking deadlines, and driving final client signoff.
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">PM Scale Breakdown:</span>
              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between p-2 bg-slate-50 rounded-lg">
                  <span className="text-slate-600 font-medium">Small Project</span>
                  <span className="text-purple-700 font-bold">2.0%</span>
                </div>
                <div className="flex justify-between p-2 bg-slate-50 rounded-lg">
                  <span className="text-slate-600 font-medium">Standard Project</span>
                  <span className="text-purple-700 font-bold">2.5%</span>
                </div>
                <div className="flex justify-between p-2 bg-purple-50 border border-purple-200 rounded-lg">
                  <span className="text-purple-900 font-bold">Large / Complex</span>
                  <span className="text-purple-700 font-bold">3.0%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRACTICAL CASE EXAMPLE STUDY */}
      <section className="py-16 px-6 max-w-5xl mx-auto w-full">
        <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 shadow-lg space-y-8 relative">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                Real-World Calculation
              </span>
              <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2">₹1,00,000 Web Development Project</h3>
            </div>
            <div className="px-5 py-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-2xl font-mono text-sm font-bold text-center shadow-xs">
              Total Commission: ₹16,500 (16.5%)
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-700">Referral Partner (5%)</span>
                <span className="font-mono text-blue-700 text-sm font-bold">₹5,000</span>
              </div>
              <p className="text-xs text-slate-500">Provided client intro & initial brief</p>
            </div>

            <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-700">Sales Closer (9%)</span>
                <span className="font-mono text-emerald-700 text-sm font-bold">₹9,000</span>
              </div>
              <p className="text-xs text-slate-500">Closed ₹1L deal (Tier rate: 9%)</p>
            </div>

            <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-700">Project Manager (2.5%)</span>
                <span className="font-mono text-purple-700 text-sm font-bold">₹2,500</span>
              </div>
              <p className="text-xs text-slate-500">Coordinated delivery & client signoff</p>
            </div>
          </div>

          <div className="p-5 bg-slate-900 text-white rounded-2xl flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>Grekam retains <strong>₹83,500 (83.5%)</strong> to cover in-house developer salaries, design, testing, and cloud deployment.</span>
            </div>
            <button
              onClick={handleStartRegistration}
              className="px-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs tracking-wider transition-colors shrink-0 shadow-sm"
            >
              Start Earning Today
            </button>
          </div>
        </div>
      </section>

      {/* REAL DELIVERABLE PORTFOLIO SHOWCASE */}
      <section className="py-16 px-6 max-w-6xl mx-auto w-full border-t border-slate-200">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-slate-500">Proof of Quality</span>
          <h2 className="text-3xl font-black text-slate-900">What We Build For Your Referred Clients</h2>
          <p className="text-slate-600 text-sm">Your reputation is protected. We build modern, high-converting digital products.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <img
              src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80"
              alt="SaaS Platform Development"
              className="w-full h-48 object-cover"
            />
            <div className="p-6 space-y-2">
              <span className="text-[10px] font-mono font-bold text-emerald-600 uppercase">Custom SaaS & Web Apps</span>
              <h4 className="font-bold text-slate-900 text-base">Fullstack Next.js & Cloud Architectures</h4>
              <p className="text-xs text-slate-600 leading-relaxed">Handling complex database models, authentication, and API integrations.</p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <img
              src="https://images.unsplash.com/photo-1556742049-0a67daf40955?w=800&q=80"
              alt="Enterprise E-Commerce Engine"
              className="w-full h-48 object-cover"
            />
            <div className="p-6 space-y-2">
              <span className="text-[10px] font-mono font-bold text-blue-600 uppercase">E-Commerce Platforms</span>
              <h4 className="font-bold text-slate-900 text-base">Headless Commerce & Payment Systems</h4>
              <p className="text-xs text-slate-600 leading-relaxed">Razorpay, Stripe, inventory sync, and high-converting storefront UI.</p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <img
              src="https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800&q=80"
              alt="Mobile Application Engineering"
              className="w-full h-48 object-cover"
            />
            <div className="p-6 space-y-2">
              <span className="text-[10px] font-mono font-bold text-purple-600 uppercase">Mobile Products</span>
              <h4 className="font-bold text-slate-900 text-base">Cross-Platform iOS & Android Apps</h4>
              <p className="text-xs text-slate-600 leading-relaxed">Native performance, push notifications, and app store deployment.</p>
            </div>
          </div>
        </div>
      </section>

      {/* INTERACTIVE CALCULATOR */}
      <section id="calculator" className="py-16 px-6 max-w-5xl mx-auto w-full border-t border-slate-200">
        <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-12 shadow-lg space-y-8">
          <div className="space-y-1">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-emerald-700">Interactive Estimator</span>
            <h3 className="text-2xl sm:text-3xl font-bold text-slate-900">Calculate Your Potential Earnings</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-7 space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-600">Net Project Value (Ex-GST)</span>
                  <span className="font-mono font-bold text-slate-900 text-base">{symbol}{projectValue.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min="20000"
                  max="500000"
                  step="10000"
                  value={projectValue}
                  onChange={(e) => setProjectValue(Number(e.target.value))}
                  className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
              </div>

              {/* Roles Checkbox Selection */}
              <div className="space-y-3 pt-2">
                <span className="text-xs text-slate-600 font-semibold block">Select Roles You Perform:</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <label className={`p-3.5 rounded-2xl border cursor-pointer flex items-center gap-3 text-xs transition-all ${isReferralActive ? 'bg-blue-50 border-blue-300 text-blue-900 font-bold shadow-xs' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                    <input
                      type="checkbox"
                      checked={isReferralActive}
                      onChange={(e) => setIsReferralActive(e.target.checked)}
                      className="accent-blue-600 w-4 h-4 rounded"
                    />
                    <div>
                      <span className="block">Referral</span>
                      <span className="text-[11px] text-blue-700 font-mono font-bold">5.0%</span>
                    </div>
                  </label>

                  <label className={`p-3.5 rounded-2xl border cursor-pointer flex items-center gap-3 text-xs transition-all ${isSalesActive ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold shadow-xs' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                    <input
                      type="checkbox"
                      checked={isSalesActive}
                      onChange={(e) => setIsSalesActive(e.target.checked)}
                      className="accent-emerald-600 w-4 h-4 rounded"
                    />
                    <div>
                      <span className="block">Sales Closer</span>
                      <span className="text-[11px] text-emerald-700 font-mono font-bold">{salesRate}%</span>
                    </div>
                  </label>

                  <label className={`p-3.5 rounded-2xl border cursor-pointer flex items-center gap-3 text-xs transition-all ${isPmActive ? 'bg-purple-50 border-purple-300 text-purple-900 font-bold shadow-xs' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                    <input
                      type="checkbox"
                      checked={isPmActive}
                      onChange={(e) => setIsPmActive(e.target.checked)}
                      className="accent-purple-600 w-4 h-4 rounded"
                    />
                    <div>
                      <span className="block">Project Mgr</span>
                      <span className="text-[11px] text-purple-700 font-mono font-bold">{pmRate}%</span>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            <div className="md:col-span-5 bg-slate-900 text-white p-7 rounded-3xl text-center space-y-4 shadow-xl">
              <span className="text-xs text-slate-400 uppercase font-mono tracking-wider block font-semibold">Estimated Total Payout</span>
              <div className="text-4xl font-black font-mono text-emerald-400">
                {symbol}{totalCommissionAmount.toLocaleString()}
              </div>
              <div className="text-xs text-slate-300 font-mono">
                Effective Rate: <strong className="text-white font-bold">{effectiveRate}%</strong>
                {isCapped && <span className="block text-amber-400 text-[11px] mt-1 font-semibold">(Single-Person Cap at 15%)</span>}
              </div>
              <button
                onClick={handleStartRegistration}
                className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md"
              >
                Register & Get Code
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CORE COMMISSION RULES */}
      <section className="py-16 px-6 max-w-5xl mx-auto w-full border-t border-slate-200">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-1">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-slate-500">Transparent Governance</span>
          <h3 className="text-2xl font-bold text-slate-900">Important Commission Guidelines</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-2 bg-white border border-slate-200 p-6 rounded-2xl shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
              <Shield className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Calculated on Net Service Value</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Excludes 18% GST, domain registrations, third-party hosting, paid plugin licenses, and pass-through expenses.
            </p>
          </div>

          <div className="space-y-2 bg-white border border-slate-200 p-6 rounded-2xl shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
              <Wallet className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Milestone Payment Releases</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Referral & Sales commissions are released pro-rata upon client payment. PM commissions release on final delivery.
            </p>
          </div>

          <div className="space-y-2 bg-white border border-slate-200 p-6 rounded-2xl shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
              <Award className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Maximum 18% Combined Cap</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Maximum combined commission is 18% (Referral 5% + Sales 10% + PM 3%). Single-person multi-role capped at 15%.
            </p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-10 px-6 border-t border-slate-200 text-xs text-slate-500 bg-white mt-auto">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            {org.logoUrl && <img src={org.logoUrl} alt={org.name} className="h-6 w-auto object-contain" />}
            <span>© {new Date().getFullYear()} {org.name || 'Grekam Visuals'}. All rights reserved.</span>
          </div>
          <div className="flex gap-6 font-semibold text-slate-600">
            <button onClick={() => setIsTermsModalOpen(true)} className="hover:text-slate-900 transition-colors">Terms & Conditions</button>
            <a href="/legal/privacy" className="hover:text-slate-900 transition-colors">Privacy Policy</a>
            <a href="/contact" className="hover:text-slate-900 transition-colors">Contact Support</a>
          </div>
        </div>
      </footer>

      {/* TERMS AND CONDITIONS MODAL (MANDATORY SCROLL TO BOTTOM) */}
      <AnimatePresence>
        {isTermsModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="w-full max-w-xl bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xl relative text-slate-900 space-y-4 flex flex-col max-h-[85vh]"
            >
              <div className="flex justify-between items-center border-b border-slate-200 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-emerald-600" />
                    Partner Terms & Conditions
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Please scroll to the bottom of the agreement to unlock acceptance.
                  </p>
                </div>
                <button
                  onClick={() => setIsTermsModalOpen(false)}
                  className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Terms Content */}
              <div
                ref={termsContainerRef}
                onScroll={handleTermsScroll}
                className="flex-1 overflow-y-auto pr-3 space-y-4 text-xs text-slate-600 custom-scrollbar border border-slate-200 p-5 rounded-2xl bg-slate-50"
              >
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-900 text-sm">1. Program Scope & Registration</h4>
                  <p className="leading-relaxed">
                    This Partner Agreement governs participation in the {org.name || 'Grekam'} Partner Program. By registering, you agree to adhere to all role structures, net service value rules, and payout policies described below.
                  </p>
                </div>

                <div className="space-y-1">
                  <h4 className="font-bold text-slate-900 text-sm">2. 3-Role Commission Rates</h4>
                  <p className="leading-relaxed">
                    Commissions are awarded across three distinct roles:
                  </p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li><strong>Referral Partner (5%)</strong>: Awarded for introducing a genuine client prospect.</li>
                    <li><strong>Sales & Closing (7%–10%)</strong>: Tiered based on Net Service Value (₹10k–49k: 7%, ₹50k–99k: 8%, ₹1L–2.49L: 9%, ₹2.5L+: 10%).</li>
                    <li><strong>Project Manager (2%–3%)</strong>: Awarded for managing client communication and developer coordination (Small: 2%, Standard: 2.5%, Large: 3%).</li>
                  </ul>
                </div>

                <div className="space-y-1">
                  <h4 className="font-bold text-slate-900 text-sm">3. Net Service Value Definition</h4>
                  <p className="leading-relaxed">
                    Commissions are calculated strictly on Net Service Value (Invoice Subtotal excluding 18% GST, domain registrations, hosting fees, paid plugins, API costs, and third-party pass-through expenses).
                  </p>
                </div>

                <div className="space-y-1">
                  <h4 className="font-bold text-slate-900 text-sm">4. Milestone Payout Releases</h4>
                  <p className="leading-relaxed">
                    Referral and Sales commissions release pro-rata upon receipt of customer payment milestones. Project Manager commissions release only after final project completion and full client payment.
                  </p>
                </div>

                <div className="space-y-1">
                  <h4 className="font-bold text-slate-900 text-sm">5. Maximum Combined Caps</h4>
                  <p className="leading-relaxed">
                    The maximum combined commission across all roles for a project is 18%. If a single individual holds Referral, Sales, and PM roles on the same deal, their total combined commission is capped at 15.0%.
                  </p>
                </div>

                <div className="space-y-1">
                  <h4 className="font-bold text-slate-900 text-sm">6. Client Non-Solicitation</h4>
                  <p className="leading-relaxed">
                    Partners act as independent contractors. Grekam agrees not to solicit or bypass registered partners for future referred scopes outside the agreed framework.
                  </p>
                </div>

                <div className="p-3 bg-emerald-100 border border-emerald-300 rounded-xl text-xs text-emerald-900 font-mono font-bold">
                  ✓ You have reached the bottom of the Terms & Conditions agreement. You may now accept and proceed.
                </div>
              </div>

              {/* Scroll Status & Action Footer */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                {!hasScrolledToBottom ? (
                  <div className="text-xs text-amber-700 font-mono font-semibold flex items-center gap-1.5 animate-pulse">
                    <ChevronDown className="w-4 h-4" /> Scroll to the bottom to unlock acceptance
                  </div>
                ) : (
                  <div className="text-xs text-emerald-700 font-mono font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Terms Agreement Scrolled & Ready
                  </div>
                )}

                <button
                  onClick={handleAcceptTerms}
                  disabled={!hasScrolledToBottom}
                  className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xl relative text-slate-900 space-y-4"
            >
              <button
                onClick={() => {
                  setIsModalOpen(false)
                  setIsSubmitted(false)
                }}
                className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {!isSubmitted ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Partner Registration</h3>
                    <p className="text-xs text-emerald-700 font-medium mt-1">
                      Terms Accepted ✓ Fill out details to generate your partner referral link.
                    </p>
                  </div>

                  <form onSubmit={handleApply} className="space-y-3 pt-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-emerald-600 focus:bg-white transition-colors"
                        placeholder="e.g. Stalin Kumar"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-emerald-600 focus:bg-white transition-colors"
                        placeholder="stalin@example.com"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Phone / WhatsApp *
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-emerald-600 focus:bg-white transition-colors"
                        placeholder="+91 98400 12345"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Primary Specialty
                        </label>
                        <select
                          value={formData.specialty}
                          onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-900 outline-none focus:border-emerald-600 focus:bg-white transition-colors"
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
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Portfolio / LinkedIn
                        </label>
                        <input
                          type="text"
                          value={formData.portfolio}
                          onChange={(e) => setFormData({ ...formData, portfolio: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-900 outline-none focus:border-emerald-600 focus:bg-white transition-colors"
                          placeholder="Optional"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all disabled:opacity-50 mt-2 shadow-sm"
                    >
                      {isSubmitting ? 'Generating...' : 'Complete & Get Referral Link'}
                    </button>
                  </form>
                </div>
              ) : (
                <div className="text-center space-y-4 py-2">
                  <div className="w-12 h-12 bg-emerald-100 border border-emerald-300 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Partner Code Activated</h3>
                    <p className="text-xs text-slate-600 mt-1">
                      Your referral code <strong className="text-emerald-700 font-mono font-bold">{generatedRefCode}</strong> is ready.
                    </p>
                  </div>

                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                    <span className="text-[10px] text-slate-500 uppercase font-mono block font-semibold">Your Partner Referral Link</span>
                    <p className="text-xs font-mono text-emerald-700 truncate font-bold">
                      https://grekam.in/referrals?ref={generatedRefCode}
                    </p>
                    <button
                      onClick={handleCopyLink}
                      className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 transition-colors mt-2 shadow-sm"
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
