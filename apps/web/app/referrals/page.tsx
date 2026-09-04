"use client"

import React, { useState, useMemo } from 'react'
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
  Percent
} from 'lucide-react'
import { useOrganization } from '@/context/OrganizationContext'
import { useCurrency } from '@/hooks/useCurrency'
import { fetchApi } from '@/lib/useApi'

export default function ReferralsLandingPage() {
  const org = useOrganization()
  const { symbol } = useCurrency()

  // Calculator State
  const [projectValue, setProjectValue] = useState<number>(150000)
  const [dealsCount, setDealsCount] = useState<number>(3)

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [generatedRefCode, setGeneratedRefCode] = useState('')
  const [copied, setCopied] = useState(false)

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    specialty: 'UI/UX Designer',
    portfolio: '',
  })

  // Tiered Commission Rate (10%, 12.5%, 15%)
  const commissionRate = useMemo(() => {
    if (dealsCount >= 10) return 15
    if (dealsCount >= 4) return 12.5
    return 10
  }, [dealsCount])

  const totalEarnings = useMemo(() => {
    return Math.round(projectValue * dealsCount * (commissionRate / 100))
  }, [projectValue, dealsCount, commissionRate])

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
          notes: `Referral Partner Application [Code: ${refCode}]. Portfolio: ${formData.portfolio || 'N/A'}`,
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
      
      {/* Editorial Navigation */}
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
              onClick={() => setIsModalOpen(true)}
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
          <Percent className="w-3.5 h-3.5" /> 10% – 15% Referral Revenue Share
        </div>

        <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-[1.1]">
          Focus on your craft. <br />
          <span className="text-emerald-400">Earn when you pass along client projects.</span>
        </h1>

        <p className="text-slate-400 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
          When clients ask for fullstack web apps, mobile products, or complex engineering outside your bandwidth, introduce them to <strong className="text-white">{org.name || 'Grekam'}</strong>. We build the project, and you receive direct cash payouts on every milestone.
        </p>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-sm px-6 py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            Get Partner Referral Link <ArrowRight className="w-4 h-4" />
          </button>
          <a
            href="#calculator"
            className="w-full sm:w-auto bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 font-medium text-sm px-6 py-3.5 rounded-xl transition-colors text-center"
          >
            View Earnings Calculator
          </a>
        </div>
      </section>

      {/* HUMAN CASE EXAMPLES / REAL DEAL LOGS */}
      <section className="py-12 px-6 max-w-5xl mx-auto w-full">
        <div className="text-center mb-8">
          <p className="text-xs font-mono font-bold uppercase tracking-widest text-slate-500">Real Deal Examples</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
              <span>Freelance UX Designer</span>
              <span className="text-emerald-400 font-bold">10% Share</span>
            </div>
            <p className="font-bold text-white text-sm">Fullstack Next.js Web App</p>
            <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-xs">
              <span className="text-slate-500">Invoice: {symbol}2,50,000</span>
              <span className="font-mono font-bold text-emerald-400">Payout: {symbol}25,000</span>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
              <span>Agency Consultant</span>
              <span className="text-emerald-400 font-bold">12.5% Share</span>
            </div>
            <p className="font-bold text-white text-sm">Monthly Retainer & Maintenance</p>
            <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-xs">
              <span className="text-slate-500">Retainer: {symbol}1,00,000/mo</span>
              <span className="font-mono font-bold text-emerald-400">Payout: {symbol}12,500/mo</span>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
              <span>Frontend Developer</span>
              <span className="text-emerald-400 font-bold">15% Share</span>
            </div>
            <p className="font-bold text-white text-sm">Custom Enterprise SaaS Build</p>
            <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-xs">
              <span className="text-slate-500">Invoice: {symbol}5,00,000</span>
              <span className="font-mono font-bold text-emerald-400">Payout: {symbol}75,000</span>
            </div>
          </div>
        </div>
      </section>

      {/* TIERED STRUCTURE */}
      <section className="py-16 px-6 max-w-5xl mx-auto w-full border-t border-slate-800/80">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <p className="text-xs font-mono font-bold uppercase tracking-widest text-slate-500">Tiered Revenue Share</p>
          <h2 className="text-3xl md:text-4xl font-black text-white">Transparent Partner Tiers</h2>
          <p className="text-slate-400 text-sm">Higher project volume automatically increases your commission percentage.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl space-y-4">
            <div className="text-xs font-mono text-slate-400">TIER 1 (STARTER)</div>
            <div className="text-4xl font-black text-white">10%</div>
            <p className="text-xs text-slate-400">For 1 to 3 referred client projects.</p>
            <ul className="text-xs text-slate-300 space-y-2 pt-2 border-t border-slate-800">
              <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> Milestone invoice payouts</li>
              <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> Direct UPI / Bank Transfer</li>
            </ul>
          </div>

          <div className="bg-slate-900 border border-emerald-500/40 p-6 rounded-2xl space-y-4 relative">
            <div className="absolute -top-3 right-4 bg-emerald-500 text-black text-[10px] font-bold px-2.5 py-0.5 rounded-full">
              POPULAR
            </div>
            <div className="text-xs font-mono text-emerald-400 font-bold">TIER 2 (GROWTH)</div>
            <div className="text-4xl font-black text-emerald-400">12.5%</div>
            <p className="text-xs text-slate-400">For 4 to 9 referred client projects.</p>
            <ul className="text-xs text-slate-300 space-y-2 pt-2 border-t border-slate-800">
              <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> Accelerated 24-hr payout</li>
              <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> Joint client scoping support</li>
            </ul>
          </div>

          <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl space-y-4">
            <div className="text-xs font-mono text-slate-400">TIER 3 (VIP PARTNER)</div>
            <div className="text-4xl font-black text-white">15%</div>
            <p className="text-xs text-slate-400">For 10+ projects or monthly retainers.</p>
            <ul className="text-xs text-slate-300 space-y-2 pt-2 border-t border-slate-800">
              <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> Lifetime retainer revenue share</li>
              <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> Dedicated partner manager</li>
            </ul>
          </div>
        </div>
      </section>

      {/* CALCULATOR SECTION */}
      <section id="calculator" className="py-16 px-6 max-w-5xl mx-auto w-full border-t border-slate-800/80">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-8 md:p-12 space-y-8">
          <div className="space-y-1">
            <p className="text-xs font-mono font-bold uppercase tracking-widest text-slate-500">Interactive Calculator</p>
            <h3 className="text-2xl font-bold text-white">Estimate Your Partner Payout</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-7 space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400 font-medium">Average Client Project Value</span>
                  <span className="font-mono font-bold text-white text-sm">{symbol}{projectValue.toLocaleString()}</span>
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
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400 font-medium">Referred Projects per Quarter</span>
                  <span className="font-mono font-bold text-white text-sm">{dealsCount} Projects</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="15"
                  step="1"
                  value={dealsCount}
                  onChange={(e) => setDealsCount(Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
              </div>
            </div>

            <div className="md:col-span-5 bg-slate-950 border border-slate-800 p-6 rounded-xl text-center space-y-3">
              <span className="text-xs text-slate-400 uppercase font-medium tracking-wider">Estimated Total Payout</span>
              <div className="text-4xl font-black font-mono text-emerald-400">
                {symbol}{totalEarnings.toLocaleString()}
              </div>
              <p className="text-[11px] text-slate-500">Based on {commissionRate}% share tier for {dealsCount} project(s).</p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="w-full mt-2 py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs uppercase tracking-wider rounded-lg transition-colors"
              >
                Get Partner Code
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CORE PRINCIPLES */}
      <section className="py-16 px-6 max-w-5xl mx-auto w-full border-t border-slate-800/80">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-2">
            <div className="w-8 h-8 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center mb-4">
              <Shield className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-white text-sm">Protected Relationship</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              We sign non-compete agreements. Your client remains yours, and we only execute the requested technical scope.
            </p>
          </div>

          <div className="space-y-2">
            <div className="w-8 h-8 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center mb-4">
              <Wallet className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-white text-sm">Prompt 48-Hour Payouts</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              No waiting for monthly accounting cycles. When the client settles their invoice milestone, your payout is transferred immediately.
            </p>
          </div>

          <div className="space-y-2">
            <div className="w-8 h-8 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center mb-4">
              <Briefcase className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-white text-sm">Full Execution Team</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Our in-house design and engineering team handles PM, architecture, QA, and launch support from end to end.
            </p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-8 px-6 border-t border-slate-800/80 text-xs text-slate-500 mt-auto">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>© {new Date().getFullYear()} {org.name || 'Grekam'}. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="/legal/terms" className="hover:text-white transition-colors">Terms</a>
            <a href="/legal/privacy" className="hover:text-white transition-colors">Privacy</a>
            <a href="/contact" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </footer>

      {/* APPLICATION MODAL */}
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
                    <h3 className="text-xl font-bold text-white">Partner Application</h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Enter your details to generate your partner referral code.
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
                          <option value="UI/UX Designer">UI/UX Designer</option>
                          <option value="Developer">Developer</option>
                          <option value="Consultant">Sales / Consultant</option>
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
                      {isSubmitting ? 'Generating...' : 'Generate Referral Link'}
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
