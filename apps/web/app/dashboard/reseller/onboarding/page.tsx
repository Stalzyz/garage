"use client"

import { useState } from "react"
import { 
  Building2, User, Mail, Phone, Globe, DollarSign, Check, ArrowRight, ArrowLeft, ShieldCheck, Sparkles, Send, Download
} from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export default function ResellerOnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [isProvisioning, setIsProvisioning] = useState(false)

  const [formData, setFormData] = useState({
    // Step 1: Garage Details
    garageName: "",
    ownerFirstName: "",
    ownerLastName: "",
    email: "",
    phone: "",
    subdomain: "",
    address: "",
    password: "",

    // Step 2: Plan Selection
    selectedPlan: "Growth Garage",
    billingCycle: "Yearly",
    price: 29999,
    resellerCommissionRate: 25, // 25%

    // Step 3: White Label Setup
    customLogoUrl: "",
    brandColor: "#2563eb",
    customDomain: "",

    // Provisioned Output
    tempPassword: "",
    tenantId: "",
  })

  const plans = [
    {
      name: "Basic Garage",
      price: 14999,
      commissionPct: 20,
      commissionAmount: 3000,
      features: ["500 Customers", "3 Staff Seats", "5 GB Storage", "Standard Reports"],
    },
    {
      name: "Growth Garage",
      price: 29999,
      commissionPct: 25,
      commissionAmount: 7500,
      popular: true,
      features: ["2,500 Customers", "10 Staff Seats", "15 GB Storage", "WhatsApp Automation", "Advanced Reports"],
    },
    {
      name: "Enterprise Garage",
      price: 49999,
      commissionPct: 30,
      commissionAmount: 15000,
      features: ["Unlimited Customers", "25 Staff Seats", "50 GB Storage", "WhatsApp Automation", "Full Whitelabel & Custom Domain"],
    },
  ]

  const handleNextStep = () => {
    if (step === 1) {
      if (!formData.garageName || !formData.ownerFirstName || !formData.email) {
        return toast.error("Please fill in Garage Name, Owner Name, and Email")
      }
    }
    setStep(prev => prev + 1)
  }

  const handlePrevStep = () => {
    setStep(prev => prev - 1)
  }

  const handleProvisionTenant = async () => {
    setIsProvisioning(true)
    toast.loading("Provisioning new garage workspace in PostgreSQL database...")

    try {
      const res = await fetch("/api/tenants/provision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          garageName: formData.garageName,
          ownerFirstName: formData.ownerFirstName,
          ownerLastName: formData.ownerLastName,
          email: formData.email,
          phone: formData.phone,
          subdomain: formData.subdomain,
          plan: formData.selectedPlan,
          password: formData.password,
          customDomain: formData.customDomain,
          customLogoUrl: formData.customLogoUrl,
          brandColor: formData.brandColor,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to provision tenant")

      // Dispatch automated welcome email via API
      await fetch("/api/notifications/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientEmail: formData.email,
          recipientName: `${formData.ownerFirstName} ${formData.ownerLastName}`,
          subject: `Welcome to ${formData.garageName} — Your Workspace Access Credentials`,
          type: "WELCOME_GARAGE",
          details: {
            garageName: formData.garageName,
            loginUrl: data.loginUrl || `https://${formData.subdomain || "garage"}.grekam.in/login`,
            tempPassword: data.user?.tempPassword || "Garage@2026!",
            plan: formData.selectedPlan,
          },
        }),
      })

      setFormData(prev => ({
        ...prev,
        tempPassword: data.user?.tempPassword || "Garage@2026!",
        tenantId: data.tenant?.id || `gar-${Math.floor(100 + Math.random() * 900)}`,
      }))

      setIsProvisioning(false)
      toast.dismiss()
      toast.success(`Garage "${formData.garageName}" saved to database! Login credentials generated.`)
      setStep(4)
    } catch (error: any) {
      setIsProvisioning(false)
      toast.dismiss()
      toast.error(`Provisioning failed: ${error.message}`)
    }
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 bg-dash-bg-base text-white min-h-screen font-sans">
      
      {/* Header */}
      <div className="border-b border-white/10 pb-6 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full">
              Reseller Partner Portal
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight mt-2">Client Garage Onboarding Wizard</h1>
          <p className="text-xs text-zinc-400 mt-1">Provision a new garage workspace under your reseller account in 4 simple steps.</p>
        </div>

        <button 
          onClick={() => router.push("/dashboard/reseller/garages")}
          className="text-xs bg-white/5 hover:bg-white/10 text-zinc-300 px-4 py-2 rounded-xl font-medium border border-white/10"
        >
          View All Garages
        </button>
      </div>

      {/* Progress Stepper */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { num: 1, title: "Garage Details" },
          { num: 2, title: "Plan & Commission" },
          { num: 3, title: "White Label Setup" },
          { num: 4, title: "Deployment" },
        ].map((s) => (
          <div 
            key={s.num} 
            className={`p-3.5 rounded-2xl border transition-all ${
              step === s.num 
                ? "bg-purple-600/10 border-purple-500/40 text-purple-300 shadow-lg shadow-purple-600/10"
                : step > s.num
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                : "bg-white/5 border-white/10 text-zinc-500"
            }`}
          >
            <div className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                step === s.num ? "bg-purple-600 text-white" : step > s.num ? "bg-emerald-500 text-white" : "bg-white/10 text-zinc-400"
              }`}>
                {step > s.num ? <Check className="w-3.5 h-3.5" /> : s.num}
              </div>
              <span className="text-xs font-semibold">{s.title}</span>
            </div>
          </div>
        ))}
      </div>

      {/* STEP 1: GARAGE & OWNER DETAILS */}
      {step === 1 && (
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 space-y-6">
          <div className="border-b border-white/10 pb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-purple-400" /> Step 1: Garage & Owner Information
            </h2>
            <p className="text-xs text-zinc-400 mt-1">Enter the primary garage details and owner contact credentials.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="space-y-1 md:col-span-2">
              <label className="text-zinc-300 font-medium">Garage / Workshop Name *</label>
              <input
                type="text"
                placeholder="e.g. Apex Auto Care & Performance"
                value={formData.garageName}
                onChange={(e) => {
                  const val = e.target.value
                  const autoSub = val.toLowerCase().replace(/[^a-z0-9]/g, "")
                  setFormData({ ...formData, garageName: val, subdomain: autoSub })
                }}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-purple-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-zinc-300 font-medium">Owner First Name *</label>
              <input
                type="text"
                placeholder="e.g. Rajesh"
                value={formData.ownerFirstName}
                onChange={(e) => setFormData({ ...formData, ownerFirstName: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-purple-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-zinc-300 font-medium">Owner Last Name</label>
              <input
                type="text"
                placeholder="e.g. Kumar"
                value={formData.ownerLastName}
                onChange={(e) => setFormData({ ...formData, ownerLastName: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-purple-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-zinc-300 font-medium">Owner Email Address (Login Username) *</label>
              <input
                type="email"
                placeholder="rajesh@apexautocare.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-purple-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-zinc-300 font-medium">Initial Login Password *</label>
              <input
                type="text"
                placeholder="e.g. Garage@2026! (or leave blank to auto-generate)"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white font-mono focus:border-purple-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1 md:col-span-2">
              <label className="text-zinc-300 font-medium">Phone Number</label>
              <input
                type="tel"
                placeholder="+91 98765 43210"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-purple-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1 md:col-span-2">
              <label className="text-zinc-300 font-medium">Tenant Workspace Subdomain</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="apexautocare"
                  value={formData.subdomain}
                  onChange={(e) => setFormData({ ...formData, subdomain: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-purple-500 focus:outline-none"
                />
                <span className="text-zinc-400 font-mono text-xs whitespace-nowrap">.grekam.in</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-white/10">
            <button
              onClick={handleNextStep}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs px-6 py-3 rounded-xl shadow-lg shadow-purple-600/30"
            >
              Continue to Step 2 <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: SUBSCRIPTION PLAN & COMMISSION */}
      {step === 2 && (
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 space-y-6">
          <div className="border-b border-white/10 pb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-purple-400" /> Step 2: Select Subscription Plan & Commission
            </h2>
            <p className="text-xs text-zinc-400 mt-1">Choose the plan for the garage and view your calculated reseller partner payout.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((p) => {
              const isSelected = formData.selectedPlan === p.name
              return (
                <div 
                  key={p.name}
                  onClick={() => setFormData({
                    ...formData,
                    selectedPlan: p.name,
                    price: p.price,
                    resellerCommissionRate: p.commissionPct,
                  })}
                  className={`p-6 rounded-2xl border transition-all cursor-pointer relative space-y-4 ${
                    isSelected 
                      ? "bg-purple-600/10 border-purple-500 text-white shadow-xl shadow-purple-600/20" 
                      : "bg-white/5 border-white/10 hover:border-white/20 text-zinc-300"
                  }`}
                >
                  {p.popular && (
                    <span className="absolute -top-3 right-4 bg-purple-600 text-white text-[9px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                      Most Popular
                    </span>
                  )}

                  <div>
                    <h3 className="text-base font-bold">{p.name}</h3>
                    <p className="text-2xl font-black text-purple-400 mt-2">
                      ₹{p.price.toLocaleString("en-IN")} <span className="text-xs font-normal text-zinc-400">/ yr</span>
                    </p>
                  </div>

                  {/* Reseller Payout Badge */}
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl space-y-1">
                    <span className="text-[10px] uppercase font-bold text-emerald-400 block">Your Partner Commission ({p.commissionPct}%)</span>
                    <p className="text-base font-extrabold text-emerald-400">₹{p.commissionAmount.toLocaleString("en-IN")}</p>
                  </div>

                  <div className="space-y-1.5 text-xs pt-2 border-t border-white/5">
                    {p.features.map((f, i) => (
                      <div key={i} className="flex items-center gap-2 text-zinc-300">
                        <Check className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>

          <div className="flex justify-between pt-4 border-t border-white/10">
            <button
              onClick={handlePrevStep}
              className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white font-semibold text-xs px-6 py-3 rounded-xl"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>

            <button
              onClick={handleNextStep}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs px-6 py-3 rounded-xl shadow-lg shadow-purple-600/30"
            >
              Continue to White Label Setup <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: WHITE LABEL BRANDING */}
      {step === 3 && (
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 space-y-6">
          <div className="border-b border-white/10 pb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Globe className="w-5 h-5 text-purple-400" /> Step 3: White Label Branding Setup
            </h2>
            <p className="text-xs text-zinc-400 mt-1">Configure custom branding so the client sees your brand identity.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="space-y-1">
              <label className="text-zinc-300 font-medium">Custom Logo Image URL</label>
              <input
                type="text"
                placeholder="https://example.com/logo.png"
                value={formData.customLogoUrl}
                onChange={(e) => setFormData({ ...formData, customLogoUrl: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-purple-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-zinc-300 font-medium">Brand Theme Accent Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={formData.brandColor}
                  onChange={(e) => setFormData({ ...formData, brandColor: e.target.value })}
                  className="w-10 h-10 rounded-xl bg-transparent border-none cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.brandColor}
                  onChange={(e) => setFormData({ ...formData, brandColor: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white font-mono"
                />
              </div>
            </div>

            <div className="space-y-1 md:col-span-2">
              <label className="text-zinc-300 font-medium">Custom Domain CNAME (Optional)</label>
              <input
                type="text"
                placeholder="garage.apexautocare.com"
                value={formData.customDomain}
                onChange={(e) => setFormData({ ...formData, customDomain: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-purple-500 focus:outline-none"
              />
              <p className="text-[11px] text-zinc-400 mt-1">Point your client CNAME DNS record to <code className="text-purple-400">agency.grekam.in</code></p>
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t border-white/10">
            <button
              onClick={handlePrevStep}
              className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white font-semibold text-xs px-6 py-3 rounded-xl"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>

            <button
              onClick={handleProvisionTenant}
              disabled={isProvisioning}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-8 py-3 rounded-xl shadow-lg shadow-emerald-600/30"
            >
              <Sparkles className="w-4 h-4" /> Provision & Deploy Workspace
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: DEPLOYMENT SUCCESS */}
      {step === 4 && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-3xl p-8 space-y-6 text-center">
          <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/40">
            <Check className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white">Garage Workspace Successfully Provisioned!</h2>
            <p className="text-xs text-zinc-300 max-w-md mx-auto">
              Automated onboarding welcome email dispatched to <strong className="text-emerald-400">{formData.email}</strong>.
            </p>
          </div>

          <div className="bg-black/40 border border-white/10 rounded-2xl p-6 text-left max-w-lg mx-auto space-y-3 text-xs">
            <div className="flex justify-between border-b border-white/10 pb-2">
              <span className="text-zinc-400">Garage Name:</span>
              <span className="font-bold text-white">{formData.garageName}</span>
            </div>
            <div className="flex justify-between border-b border-white/10 pb-2">
              <span className="text-zinc-400">Tenant ID:</span>
              <span className="font-mono text-purple-400">{formData.tenantId}</span>
            </div>
            <div className="flex justify-between border-b border-white/10 pb-2">
              <span className="text-zinc-400">Assigned Plan:</span>
              <span className="font-bold text-blue-400">{formData.selectedPlan}</span>
            </div>
            <div className="flex justify-between border-b border-white/10 pb-2">
              <span className="text-zinc-400">Temporary Password:</span>
              <span className="font-mono text-amber-400 font-bold">{formData.tempPassword}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Partner Commission (Earned):</span>
              <span className="font-bold text-emerald-400">
                ₹{((formData.price * formData.resellerCommissionRate) / 100).toLocaleString("en-IN")}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 pt-4">
            <button
              onClick={() => router.push("/dashboard/reseller/garages")}
              className="bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs px-6 py-3 rounded-xl shadow-lg shadow-purple-600/30"
            >
              Go to Reseller Garages
            </button>
            <button
              onClick={() => {
                setStep(1)
                setFormData({
                  garageName: "", ownerFirstName: "", ownerLastName: "", email: "", phone: "", password: "", subdomain: "", address: "",
                  selectedPlan: "Growth Garage", billingCycle: "Yearly", price: 29999, resellerCommissionRate: 25,
                  customLogoUrl: "", brandColor: "#2563eb", customDomain: "", tempPassword: "", tenantId: ""
                })
              }}
              className="bg-white/5 hover:bg-white/10 text-white font-semibold text-xs px-6 py-3 rounded-xl border border-white/10"
            >
              Onboard Another Garage
            </button>
          </div>
        </div>
      )}

    </div>
  )
}
