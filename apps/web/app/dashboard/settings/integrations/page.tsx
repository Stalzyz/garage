"use client"

import { useState, useEffect, useCallback } from "react"
import { Plug, Zap, Video, Mail, CreditCard, Save, CheckCircle2, Webhook, Plus, Trash2, Loader2, Eye, EyeOff, X, KeyRound, Copy, Check, Share2, ArrowDownLeft, ExternalLink, ShieldCheck } from "lucide-react"

type Service = "META" | "RAZORPAY" | "PHONEPE" | "STRIPE" | "SMTP" | "WHATSAPP" | "GOOGLE" | "OPENAI" | "GEMINI"

interface IntegrationKey {
  id: string
  service: Service
  keyName: string
  encryptedValue: string // masked from server
  isActive: boolean
  updatedAt: string
}

interface WebhookItem {
  id: string
  event: string
  url: string
  description?: string
  secret?: string
  isActive: boolean
  createdAt: string
}

const SERVICE_META: Record<Service, { label: string; icon: any; color: string; bg: string; border: string; desc: string }> = {
  META:      { label: "Meta (FB & WhatsApp Flows)", icon: Share2,    color: "text-blue-400",   bg: "bg-blue-500/10",    border: "border-blue-500/20",    desc: "Meta Lead Ads & WhatsApp Flows webhook verification and Graph API access" },
  RAZORPAY:  { label: "Razorpay",  icon: CreditCard, color: "text-indigo-400", bg: "bg-indigo-500/10",  border: "border-indigo-500/20",  desc: "Payment gateway for Invoices & SaaS" },
  PHONEPE:   { label: "PhonePe",   icon: CreditCard, color: "text-violet-400", bg: "bg-violet-500/10",  border: "border-violet-500/20",  desc: "UPI payment collection" },
  STRIPE:    { label: "Stripe",    icon: CreditCard, color: "text-blue-400",   bg: "bg-blue-500/10",    border: "border-blue-500/20",    desc: "International card payments" },
  SMTP:      { label: "SMTP",      icon: Mail,       color: "text-cyan-400",   bg: "bg-cyan-500/10",    border: "border-cyan-500/20",    desc: "Transactional email delivery" },
  WHATSAPP:  { label: "WhatsApp",  icon: Zap,        color: "text-emerald-400",bg: "bg-emerald-500/10", border: "border-emerald-500/20", desc: "WhatsApp Business Autopilot messages" },
  GOOGLE:    { label: "Google",    icon: Video,      color: "text-red-400",    bg: "bg-red-500/10",     border: "border-red-500/20",     desc: "OAuth, Meet & Calendar integrations" },
  OPENAI:    { label: "OpenAI",    icon: Zap,        color: "text-emerald-400",bg: "bg-emerald-500/10", border: "border-emerald-500/20", desc: "AI integrations for generating proposals, CRM notes, and email copy" },
  GEMINI:    { label: "Google Gemini (AI)", icon: Zap, color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20", desc: "Gemini 2.0 Flash — Free AI for proposals, curriculum generation & executive assistant. Get your free key at aistudio.google.com" },
}

const SERVICES: Service[] = ["META", "RAZORPAY", "PHONEPE", "STRIPE", "SMTP", "WHATSAPP", "GOOGLE", "GEMINI", "OPENAI"]

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
  const [selectedService, setSelectedService] = useState<Service>("META")
  const [formValues, setFormValues] = useState<Record<string, string>>({})
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Webhooks State
  const [webhooks, setWebhooks] = useState<WebhookItem[]>([
    { id: "1", event: "crm.lead_created", url: "https://hooks.zapier.com/hooks/catch/12345/abcde", description: "Sync new leads to Google Sheets", isActive: true, createdAt: new Date().toISOString() },
    { id: "2", event: "finance.invoice_paid", url: "https://api.myapp.com/webhooks/payment", description: "Trigger accounting system update", isActive: true, createdAt: new Date().toISOString() },
  ])
  const [showAddWebhook, setShowAddWebhook] = useState(false)
  const [newWebhookEvent, setNewWebhookEvent] = useState("crm.lead_created")
  const [newWebhookUrl, setNewWebhookUrl] = useState("")
  const [newWebhookDesc, setNewWebhookDesc] = useState("")
  const [newWebhookSecret, setNewWebhookSecret] = useState("")
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null)

  const [origin, setOrigin] = useState("")

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin)
    }
  }, [])

  const KEY_SUGGESTIONS: Record<Service, string[]> = {
    META: ["META_APP_ID", "META_APP_SECRET", "META_ACCESS_TOKEN", "META_VERIFY_TOKEN", "META_ACADEMY_FORM_IDS"],
    SMTP: ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS", "SMTP_FROM"],
    WHATSAPP: ["GRAFTY_API_KEY", "GRAFTY_INSTANCE_ID", "WEBHOOK_VERIFY_TOKEN"],
    RAZORPAY: ["RAZORPAY_KEY_ID", "RAZORPAY_KEY_SECRET", "RAZORPAY_WEBHOOK_SECRET"],
    PHONEPE: ["PHONEPE_MERCHANT_ID", "PHONEPE_SALT_KEY", "PHONEPE_SALT_INDEX"],
    STRIPE: ["STRIPE_PUBLISHABLE_KEY", "STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET"],
    GOOGLE: ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET", "GOOGLE_REDIRECT_URI"],
    OPENAI: ["OPENAI_API_KEY"],
    GEMINI: ["GEMINI_API_KEY"],
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

  async function handleSaveKeys() {
    const keysToSave = Object.entries(formValues).filter(([_, v]) => v.trim() !== "")
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
      setSelectedService("META")
      setFormValues({})
      await load()
      setTimeout(() => setSuccess(""), 3000)
    } catch { setError("Failed to save keys. Please try again.") }
    finally { setSaving(false) }
  }

  async function handleDeleteKey(id: string) {
    if (!confirm("Delete this integration key? This cannot be undone.")) return
    try {
      await apiDelete(`/settings/integrations/${id}`)
      setKeys(prev => prev.filter(k => k.id !== id))
    } catch { setError("Failed to delete key.") }
  }

  function handleCreateWebhook() {
    if (!newWebhookUrl.trim()) {
      setError("Please enter a target Webhook URL.")
      return
    }
    try {
      new URL(newWebhookUrl.trim())
    } catch {
      setError("Please enter a valid URL (starting with http:// or https://).")
      return
    }

    const newHook: WebhookItem = {
      id: Date.now().toString(),
      event: newWebhookEvent,
      url: newWebhookUrl.trim(),
      description: newWebhookDesc.trim() || undefined,
      secret: newWebhookSecret.trim() || undefined,
      isActive: true,
      createdAt: new Date().toISOString()
    }

    setWebhooks(prev => [...prev, newHook])
    setShowAddWebhook(false)
    setNewWebhookUrl("")
    setNewWebhookDesc("")
    setNewWebhookSecret("")
    setError("")
    setSuccess("New outgoing webhook registered successfully!")
    setTimeout(() => setSuccess(""), 3000)
  }

  function handleDeleteWebhook(id: string) {
    setWebhooks(prev => prev.filter(w => w.id !== id))
    setSuccess("Webhook deleted successfully.")
    setTimeout(() => setSuccess(""), 3000)
  }

  function copyToClipboard(text: string, id: string) {
    navigator.clipboard.writeText(text)
    setCopiedUrl(id)
    setTimeout(() => setCopiedUrl(null), 2000)
  }

  // Group keys by service
  const grouped = SERVICES.reduce<Record<Service, IntegrationKey[]>>((acc, s) => {
    acc[s] = keys.filter(k => k.service === s)
    return acc
  }, {} as any)

  const metaWebhookUrl = `${origin || "https://your-domain.com"}/api/v1/webhooks/meta`
  const razorpayWebhookUrl = `${origin || "https://your-domain.com"}/api/v1/webhooks/razorpay`

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">
      {/* Header */}
      <div className="flex-none px-6 py-5 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <KeyRound className="w-6 h-6 text-primary" /> Integrations & Webhooks Hub
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Manage API secrets and incoming/outgoing webhooks. All secrets are AES-256 encrypted at rest.</p>
          </div>
          {activeTab === "api" ? (
            <button
              id="add-integration-btn"
              onClick={() => { setShowAdd(true); setError("") }}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-all shadow-sm"
            >
              <Plus className="w-4 h-4" /> Add Key
            </button>
          ) : (
            <button
              id="add-webhook-btn"
              onClick={() => { setShowAddWebhook(true); setError("") }}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-all shadow-sm"
            >
              <Plus className="w-4 h-4" /> Add New Webhook
            </button>
          )}
        </div>
      </div>

      {/* Toast notifications */}
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

      {/* Add API Key Modal */}
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
                    setFormValues({})
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
                      type={keyName.includes("PASS") || keyName.includes("SECRET") || keyName.includes("KEY") || keyName.includes("TOKEN") ? "password" : "text"}
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
                  onClick={handleSaveKeys}
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

      {/* Add Outgoing Webhook Modal */}
      {showAddWebhook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowAddWebhook(false)}>
          <div className="bg-card border border-border/60 rounded-2xl p-6 w-full max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Webhook className="w-5 h-5 text-primary" /> Register Outgoing Webhook
              </h2>
              <button onClick={() => setShowAddWebhook(false)} className="text-muted-foreground hover:text-foreground transition-colors"><X className="w-5 h-5"/></button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Trigger Event</label>
                <select
                  id="webhook-event-select"
                  value={newWebhookEvent}
                  onChange={e => setNewWebhookEvent(e.target.value)}
                  className="w-full bg-background border border-border/60 rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="crm.lead_created">CRM — New Lead Created (crm.lead_created)</option>
                  <option value="crm.lead_won">CRM — Lead Deal Won (crm.lead_won)</option>
                  <option value="finance.invoice_paid">Finance — Invoice Paid (finance.invoice_paid)</option>
                  <option value="academy.student_enrolled">Academy — New Student Enrolled (academy.student_enrolled)</option>
                  <option value="support.ticket_created">Support — New Ticket Created (support.ticket_created)</option>
                  <option value="custom.event">Custom Event (custom.event)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Target Webhook URL</label>
                <input
                  id="webhook-url-input"
                  type="url"
                  placeholder="https://hooks.zapier.com/hooks/catch/..."
                  value={newWebhookUrl}
                  onChange={e => setNewWebhookUrl(e.target.value)}
                  className="w-full bg-background border border-border/60 rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Description / Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Sync leads to Google Sheets via Zapier"
                  value={newWebhookDesc}
                  onChange={e => setNewWebhookDesc(e.target.value)}
                  className="w-full bg-background border border-border/60 rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">HMAC Secret Key (Optional)</label>
                <input
                  type="password"
                  placeholder="Secret key to sign X-Hub-Signature payloads"
                  value={newWebhookSecret}
                  onChange={e => setNewWebhookSecret(e.target.value)}
                  className="w-full bg-background border border-border/60 rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              {error && <p className="text-red-400 text-xs">{error}</p>}

              <div className="flex gap-3 pt-3">
                <button
                  id="webhook-save-btn"
                  onClick={handleCreateWebhook}
                  className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-all"
                >
                  <Save className="w-4 h-4" /> Save Webhook
                </button>
                <button onClick={() => setShowAddWebhook(false)} className="px-4 py-2.5 rounded-lg text-sm font-semibold text-muted-foreground border border-border/60 hover:bg-muted/50 transition-all">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="flex-1 overflow-y-auto p-6 max-w-5xl">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-4 border-b border-border/50 mb-6">
          <button
            id="tab-api-connections"
            onClick={() => setActiveTab("api")}
            className={`px-4 py-2 font-medium text-sm transition-all border-b-2 ${activeTab === 'api' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
          >
            API Connections & Secrets
          </button>
          <button
            id="tab-webhooks"
            onClick={() => setActiveTab("webhooks")}
            className={`px-4 py-2 font-medium text-sm transition-all border-b-2 ${activeTab === 'webhooks' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
          >
            Incoming & Outgoing Webhooks
          </button>
        </div>

        {/* API CONNECTIONS TAB */}
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
                                <span className="text-xs font-mono text-muted-foreground w-44 shrink-0 truncate">{k.keyName}</span>
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
                                  onClick={() => handleDeleteKey(k.id)}
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

        {/* WEBHOOKS TAB */}
        {activeTab === "webhooks" && (
          <div className="space-y-8">
            {/* INCOMING WEBHOOKS SECTION */}
            <div className="bg-card border border-border/60 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
                  <ArrowDownLeft className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground text-base">Incoming Webhook Endpoints</h3>
                  <p className="text-xs text-muted-foreground">Receive automated lead submissions & webhook events from third-party platforms.</p>
                </div>
              </div>

              <div className="space-y-4 mt-5">
                {/* Meta Flow Webhook */}
                <div className="bg-muted/40 border border-border/60 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Share2 className="w-4 h-4 text-blue-400" />
                      <span className="text-sm font-bold text-foreground">Meta Lead Ads & WhatsApp Flows Incoming Webhook</span>
                    </div>
                    <span className="text-xs font-semibold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">Active</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">Copy this callback URL into Meta Developer Dashboard &gt; Webhooks for WhatsApp Flows &amp; Facebook Lead Ads.</p>
                  
                  <div className="flex items-center gap-2 bg-background border border-border/60 rounded-lg p-2">
                    <code className="flex-1 font-mono text-xs text-foreground truncate">{metaWebhookUrl}</code>
                    <button
                      onClick={() => copyToClipboard(metaWebhookUrl, "meta")}
                      className="flex items-center gap-1.5 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 text-xs font-semibold px-3 py-1.5 rounded-md transition-all shrink-0"
                    >
                      {copiedUrl === "meta" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedUrl === "meta" ? "Copied!" : "Copy URL"}
                    </button>
                  </div>
                </div>

                {/* Razorpay Webhook */}
                <div className="bg-muted/40 border border-border/60 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-indigo-400" />
                      <span className="text-sm font-bold text-foreground">Razorpay Payments Incoming Webhook</span>
                    </div>
                    <span className="text-xs font-semibold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">Active</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">Paste this callback URL into Razorpay Dashboard &gt; Settings &gt; Webhooks.</p>
                  
                  <div className="flex items-center gap-2 bg-background border border-border/60 rounded-lg p-2">
                    <code className="flex-1 font-mono text-xs text-foreground truncate">{razorpayWebhookUrl}</code>
                    <button
                      onClick={() => copyToClipboard(razorpayWebhookUrl, "razorpay")}
                      className="flex items-center gap-1.5 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 text-xs font-semibold px-3 py-1.5 rounded-md transition-all shrink-0"
                    >
                      {copiedUrl === "razorpay" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedUrl === "razorpay" ? "Copied!" : "Copy URL"}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* OUTGOING WEBHOOKS SECTION */}
            <div className="bg-card border border-border/60 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <Webhook className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground text-base">Outgoing Event Webhooks</h3>
                    <p className="text-xs text-muted-foreground">Trigger external applications (Zapier, Make, custom APIs) when CRM/Finance events occur.</p>
                  </div>
                </div>

                <button
                  onClick={() => { setShowAddWebhook(true); setError("") }}
                  className="flex items-center gap-1.5 bg-primary text-primary-foreground text-xs font-bold px-3 py-2 rounded-lg hover:bg-primary/90 transition-all"
                >
                  <Plus className="w-4 h-4" /> Add Webhook
                </button>
              </div>

              {webhooks.length === 0 ? (
                <div className="text-center py-10 border border-dashed border-border/60 rounded-xl">
                  <Webhook className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                  <p className="text-sm font-medium text-foreground">No outgoing webhooks configured</p>
                  <p className="text-xs text-muted-foreground mt-1">Click "Add Webhook" above to forward live CRM events to external apps.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {webhooks.map((w) => (
                    <div key={w.id} className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-muted/40 border border-border/50 p-4 rounded-xl">
                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded">
                            {w.event}
                          </span>
                          {w.description && <span className="text-xs text-muted-foreground">— {w.description}</span>}
                        </div>
                        <p className="font-mono text-xs text-foreground truncate">{w.url}</p>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-xs font-semibold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                          Active
                        </span>
                        <button
                          onClick={() => handleDeleteWebhook(w.id)}
                          className="text-muted-foreground hover:text-red-400 p-1.5 rounded-md hover:bg-red-500/10 transition-colors"
                          title="Delete webhook"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
