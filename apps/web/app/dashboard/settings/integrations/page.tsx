"use client"

import { useState, useEffect, useCallback } from "react"
import { Plug, Zap, Video, Mail, CreditCard, Save, CheckCircle2, Webhook, Plus, Trash2, Loader2, Eye, EyeOff, X, KeyRound } from "lucide-react"
import { fetchApi } from "@/lib/useApi"

type Service = "RAZORPAY" | "PHONEPE" | "STRIPE" | "SMTP" | "WHATSAPP" | "GOOGLE"

interface IntegrationKey {
  id: string
  service: Service
  keyName: string
  encryptedValue: string // masked from server
  isActive: boolean
  updatedAt: string
}

const SERVICE_META: Record<Service, { label: string; icon: any; color: string; bg: string; border: string; desc: string }> = {
  RAZORPAY:  { label: "Razorpay",  icon: CreditCard, color: "text-indigo-400", bg: "bg-indigo-500/10",  border: "border-indigo-500/20",  desc: "Payment gateway for Invoices & SaaS" },
  PHONEPE:   { label: "PhonePe",   icon: CreditCard, color: "text-violet-400", bg: "bg-violet-500/10",  border: "border-violet-500/20",  desc: "UPI payment collection" },
  STRIPE:    { label: "Stripe",    icon: CreditCard, color: "text-blue-400",   bg: "bg-blue-500/10",    border: "border-blue-500/20",    desc: "International card payments" },
  SMTP:      { label: "SMTP",      icon: Mail,       color: "text-cyan-400",   bg: "bg-cyan-500/10",    border: "border-cyan-500/20",    desc: "Transactional email delivery" },
  WHATSAPP:  { label: "WhatsApp",  icon: Zap,        color: "text-emerald-400",bg: "bg-emerald-500/10", border: "border-emerald-500/20", desc: "WhatsApp Business Autopilot messages" },
  GOOGLE:    { label: "Google",    icon: Video,      color: "text-red-400",    bg: "bg-red-500/10",     border: "border-red-500/20",     desc: "OAuth, Meet & Calendar integrations" },
}

const SERVICES: Service[] = ["RAZORPAY", "PHONEPE", "STRIPE", "SMTP", "WHATSAPP", "GOOGLE"]

const API = process.env.NEXT_PUBLIC_API_URL || "/api/v1"

async function apiGet(path: string) {
  const r = await fetch(`${API}${path}`, { credentials: "include" })
  if (!r.ok) throw new Error(`API ${r.status}`)
  return r.json()
}

async function apiPost(path: string, body: any) {
  const r = await fetch(`${API}${path}`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  if (!r.ok) throw new Error(`API ${r.status}`)
  return r.json()
}

async function apiDelete(path: string) {
  const r = await fetch(`${API}${path}`, { method: "DELETE", credentials: "include" })
  if (!r.ok && r.status !== 204) throw new Error(`API ${r.status}`)
}

export default function IntegrationsDashboard() {
  const [activeTab, setActiveTab]   = useState<"api" | "webhooks">("api")
  const [keys, setKeys]             = useState<IntegrationKey[]>([])
  const [loading, setLoading]       = useState(true)
  const [showAdd, setShowAdd]       = useState(false)
  const [saving, setSaving]         = useState(false)
  const [showValues, setShowValues] = useState<Record<string, boolean>>({})
  const [selectedService, setSelectedService] = useState<Service>("RAZORPAY")
  const [formValues, setFormValues] = useState<Record<string, string>>({})
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const KEY_SUGGESTIONS: Record<Service, string[]> = {
    SMTP: ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS", "SMTP_FROM"],
    WHATSAPP: ["GRAFTY_API_KEY", "GRAFTY_INSTANCE_ID", "WEBHOOK_VERIFY_TOKEN"],
    RAZORPAY: ["RAZORPAY_KEY_ID", "RAZORPAY_KEY_SECRET", "RAZORPAY_WEBHOOK_SECRET"],
    PHONEPE: ["PHONEPE_MERCHANT_ID", "PHONEPE_SALT_KEY", "PHONEPE_SALT_INDEX"],
    STRIPE: ["STRIPE_PUBLISHABLE_KEY", "STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET"],
    GOOGLE: ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET", "GOOGLE_REDIRECT_URI"],
  }

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await apiGet("/settings/integrations")
      setKeys(data)
    } catch { setKeys([]) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  async function handleSave() {
    const keysToSave = Object.entries(formValues).filter(([k, v]) => v.trim() !== "")
    if (keysToSave.length === 0) {
      setError("Please fill in at least one value.")
      return
    }
    setSaving(true)
    setError("")
    try {
      await Promise.all(
        keysToSave.map(([keyName, value]) => 
          apiPost("/settings/integrations", { service: selectedService, keyName, value: value.trim() })
        )
      )
      setSuccess("Integration keys saved successfully!")
      setShowAdd(false)
      setSelectedService("RAZORPAY")
      setFormValues({})
      await load()
      setTimeout(() => setSuccess(""), 3000)
    } catch { setError("Failed to save keys. Please try again.") }
    finally { setSaving(false) }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this integration key? This cannot be undone.")) return
    try {
      await apiDelete(`/settings/integrations/${id}`)
      setKeys(prev => prev.filter(k => k.id !== id))
    } catch { setError("Failed to delete key.") }
  }

  // Group keys by service
  const grouped = SERVICES.reduce<Record<Service, IntegrationKey[]>>((acc, s) => {
    acc[s] = keys.filter(k => k.service === s)
    return acc
  }, {} as any)

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">
      {/* Header */}
      <div className="flex-none px-6 py-5 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <KeyRound className="w-6 h-6 text-primary" /> Integrations Hub
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Manage external API keys and webhooks. All secrets are AES-256 encrypted at rest.</p>
          </div>
          <button
            id="add-integration-btn"
            onClick={() => { setShowAdd(true); setError("") }}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" /> Add Key
          </button>
        </div>
      </div>

      {/* Toast */}
      {success && (
        <div className="mx-6 mt-4 flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm px-4 py-2.5 rounded-lg">
          <CheckCircle2 className="w-4 h-4 shrink-0" /> {success}
        </div>
      )}
      {error && (
        <div className="mx-6 mt-4 flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-2.5 rounded-lg">
          <X className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}

      {/* Add Key Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowAdd(false)}>
          <div className="bg-card border border-border/60 rounded-2xl p-6 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-foreground">Add Integration Key</h2>
              <button onClick={() => setShowAdd(false)} className="text-muted-foreground hover:text-foreground transition-colors"><X className="w-5 h-5"/></button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Service</label>
                <select
                  id="integration-service-select"
                  value={selectedService}
                  onChange={e => {
                    setSelectedService(e.target.value as Service)
                    setFormValues({}) // reset form
                  }}
                  className="w-full bg-background border border-border/60 rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  {SERVICES.map(s => <option key={s} value={s}>{SERVICE_META[s].label}</option>)}
                </select>
              </div>

              <div className="space-y-3 pt-2">
                <div className="text-xs font-medium text-muted-foreground mb-2">Configure {SERVICE_META[selectedService].label} Keys</div>
                {KEY_SUGGESTIONS[selectedService].map(keyName => (
                  <div key={keyName}>
                    <label className="text-xs font-semibold text-muted-foreground mb-1 block">
                      {keyName.replace(/_/g, " ")}
                    </label>
                    <input
                      type={keyName.includes("PASS") || keyName.includes("SECRET") || keyName.includes("KEY") ? "password" : "text"}
                      placeholder={`Enter ${keyName}`}
                      value={formValues[keyName] || ""}
                      onChange={e => setFormValues(prev => ({ ...prev, [keyName]: e.target.value }))}
                      className="w-full bg-background border border-border/60 rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                ))}
              </div>

              {error && <p className="text-red-400 text-xs">{error}</p>}

              <div className="flex gap-3 pt-2">
                <button
                  id="integration-save-btn"
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-all disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {saving ? "Encrypting & Saving…" : "Save Key"}
                </button>
                <button onClick={() => setShowAdd(false)} className="px-4 py-2.5 rounded-lg text-sm font-semibold text-muted-foreground border border-border/60 hover:bg-muted/50 transition-all">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-6 max-w-5xl">
        {/* Tabs */}
        <div className="flex items-center gap-4 border-b border-border/50 mb-6">
          <button
            id="tab-api-connections"
            onClick={() => setActiveTab("api")}
            className={`px-4 py-2 font-medium text-sm transition-all border-b-2 ${activeTab === 'api' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
          >
            API Connections
          </button>
          <button
            id="tab-webhooks"
            onClick={() => setActiveTab("webhooks")}
            className={`px-4 py-2 font-medium text-sm transition-all border-b-2 ${activeTab === 'webhooks' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
          >
            Incoming & Outgoing Webhooks
          </button>
        </div>

        {activeTab === "api" && (
          loading ? (
            <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>
          ) : (
            <div className="space-y-5">
              {SERVICES.map(service => {
                const meta = SERVICE_META[service]
                const Icon = meta.icon
                const serviceKeys = grouped[service]
                return (
                  <div key={service} className={`bg-card border rounded-2xl p-5 shadow-sm transition-all hover:border-primary/30 ${serviceKeys.length > 0 ? 'border-primary/20' : 'border-border/50'}`}>
                    <div className="flex items-start gap-4">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${meta.bg} ${meta.color} ${meta.border}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-bold text-foreground">{meta.label}</h3>
                          {serviceKeys.length > 0 ? (
                            <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                              <CheckCircle2 className="w-3.5 h-3.5" /> {serviceKeys.length} key{serviceKeys.length > 1 ? "s" : ""} configured
                            </span>
                          ) : (
                            <span className="text-xs font-bold text-muted-foreground bg-muted px-2.5 py-1 rounded-full border border-border/50">Not configured</span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mb-3">{meta.desc}</p>

                        {serviceKeys.length > 0 && (
                          <div className="space-y-2">
                            {serviceKeys.map(k => (
                              <div key={k.id} className="flex items-center gap-2 bg-muted/40 border border-border/40 rounded-lg px-3 py-2">
                                <Plug className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                                <span className="text-xs font-mono text-muted-foreground w-36 shrink-0 truncate">{k.keyName}</span>
                                <span className={`flex-1 font-mono text-xs ${showValues[k.id] ? "text-foreground" : "text-muted-foreground"}`}>
                                  {showValues[k.id] ? k.encryptedValue : "••••••••••••"}
                                </span>
                                <button
                                  onClick={() => setShowValues(p => ({ ...p, [k.id]: !p[k.id] }))}
                                  className="text-muted-foreground hover:text-foreground transition-colors p-1"
                                  title={showValues[k.id] ? "Hide" : "Show masked value"}
                                >
                                  {showValues[k.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                </button>
                                <button
                                  onClick={() => handleDelete(k.id)}
                                  className="text-muted-foreground hover:text-red-400 transition-colors p-1"
                                  title="Delete key"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )
        )}

        {activeTab === "webhooks" && (
          <div className="space-y-6">
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-5">
              <h3 className="font-bold text-primary mb-2 flex items-center gap-2"><Webhook className="w-5 h-5"/> Event Webhooks</h3>
              <p className="text-sm text-muted-foreground mb-4">Trigger external services when events occur inside Grekam OS.</p>
              <div className="space-y-3">
                {[
                  { event: "crm.lead_won", url: "https://example.com/webhooks/slack" },
                  { event: "finance.invoice_paid", url: "https://api.myapp.com/webhooks/payment" },
                ].map((hook, i) => (
                  <div key={i} className="flex items-center gap-3 bg-background border border-border/50 p-3 rounded-lg">
                    <div className="w-48 text-sm font-mono text-foreground font-medium">{hook.event}</div>
                    <input type="text" className="flex-1 bg-muted/50 border-transparent rounded px-3 py-1.5 text-sm text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" defaultValue={hook.url} />
                    <button className="text-xs font-bold text-red-500 hover:text-red-400 transition-colors">Remove</button>
                  </div>
                ))}
                <button className="flex items-center gap-2 text-sm font-bold text-primary mt-2 hover:text-primary/80 transition-colors">
                  <Plus className="w-4 h-4" /> Add Webhook
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
