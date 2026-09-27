"use client"

import { useState, useEffect } from "react"
import { 
  Mail, 
  Send, 
  Save, 
  Eye, 
  Code, 
  CheckCircle, 
  Building2, 
  Users, 
  Loader2, 
  ChevronRight,
  ToggleLeft,
  ToggleRight,
  Info,
  Monitor,
  Smartphone,
  Check,
  Server,
  Key,
  Lock,
  Clock,
  Play,
  Sparkles,
  ShieldCheck,
  RefreshCw,
  Sliders
} from "lucide-react"
import { useApi, fetchApi } from "@/lib/useApi"
import { useOrganization } from "@/context/OrganizationContext"
import { toast } from "sonner"

const CATEGORY_MAP: Record<string, { label: string; icon: any; color: string }> = {
  CLIENT: { label: "Client Notifications", icon: Building2, color: "text-blue-400 bg-blue-400/10 border-blue-400/20" },
  STAFF: { label: "Staff & Operations", icon: Users, color: "text-amber-400 bg-amber-400/10 border-amber-400/20" },
  SYSTEM: { label: "System & Security", icon: ShieldCheck, color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" },
}

const SAMPLE_VARIABLES: Record<string, string> = {
  clientName: "Jane Doe",
  companyName: "City Central Auto Care",
  portalLink: "https://garage.grekam.in/portal/dashboard",
  accountManager: "Stalin Kumar",
  invoiceNumber: "INV-2026-089",
  projectName: "Major Engine Overhaul & Servicing",
  amount: "45,000",
  dueDate: "Oct 05, 2026",
  invoiceUrl: "https://garage.grekam.in/portal/invoices",
  proposalTitle: "Complete Fleet Maintenance Agreement",
  estimatedAmount: "1,20,000",
  proposalLink: "https://garage.grekam.in/portal/proposals",
  staffName: "Service Advisor",
  leadName: "Rahul Sharma",
  phone: "+91 98765 43210",
  email: "rahul@example.com",
  leadSource: "Google Ads",
  interestTier: "High (Periodic Service & Denting)",
  crmLink: "https://garage.grekam.in/dashboard/crm",
  taskTitle: "Brake Pad Replacement & Rotor Truing",
  priority: "HIGH",
  taskUrl: "https://garage.grekam.in/dashboard/projects",
  todayDate: "Sep 27, 2026",
  pendingTasksCount: "4",
  leadsToCallCount: "7",
  highPriorityTickets: "2",
  dashboardLink: "https://garage.grekam.in/dashboard",
}

function buildPreviewEmailHtml(bodyHtml: string, subject: string, org?: any) {
  let content = bodyHtml || ""
  Object.keys(SAMPLE_VARIABLES).forEach(k => {
    content = content.replace(new RegExp(`{{\\s*${k}\\s*}}`, "gi"), SAMPLE_VARIABLES[k])
  })

  const primary = org?.primaryColor || "#2563eb"
  const secondary = org?.secondaryColor || "#1e293b"
  const companyName = org?.companyName || org?.name || "Grekam Garage OS"
  const logoUrl = org?.logoUrl
  const initial = (companyName.trim()[0] || "G").toUpperCase()

  content = content.replace(
    /class=["']btn-primary["']/gi,
    `style="display:inline-block;background-color:${primary};color:#ffffff !important;text-decoration:none !important;font-weight:600;font-size:14px;padding:13px 26px;border-radius:8px;text-align:center;box-shadow:0 2px 4px rgba(0,0,0,0.1);"`
  )
  content = content.replace(
    /class=["']button-container["']/gi,
    `style="margin:26px 0;text-align:center;"`
  )

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;color:#334155;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f1f5f9;padding:24px 8px;">
    <tr>
      <td align="center" valign="top">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background-color:#ffffff;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;box-shadow:0 4px 16px rgba(15,23,42,0.06);">
          <tr>
            <td style="background-color:${primary};background:linear-gradient(135deg,${primary} 0%,${secondary} 100%);padding:24px 30px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td valign="middle">
                    ${logoUrl ? `
                      <img src="${logoUrl}" alt="${companyName}" style="max-height:36px;max-width:180px;display:block;border:0;" />
                    ` : `
                      <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                        <tr>
                          <td style="background-color:rgba(255,255,255,0.22);width:34px;height:34px;border-radius:8px;text-align:center;vertical-align:middle;">
                            <span style="color:#ffffff;font-size:17px;font-weight:800;line-height:34px;display:inline-block;">${initial}</span>
                          </td>
                          <td style="padding-left:12px;vertical-align:middle;">
                            <div style="color:#ffffff;font-size:15px;font-weight:800;letter-spacing:0.5px;text-transform:uppercase;">${companyName}</div>
                            <div style="color:#e0e7ff;font-size:10px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;margin-top:2px;">Workshop Notification</div>
                          </td>
                        </tr>
                      </table>
                    `}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 30px 28px;background-color:#ffffff;color:#334155;font-size:15px;line-height:1.65;">
              ${content}
            </td>
          </tr>
          <tr>
            <td style="background-color:#f8fafc;border-top:1px solid #e2e8f0;padding:20px 30px;text-align:center;font-size:12px;line-height:1.6;color:#64748b;">
              <p style="margin:0 0 4px 0;font-weight:600;color:#475569;">${companyName}</p>
              <p style="margin:0;color:#64748b;">Official notification sent from <a href="https://garage.grekam.in" style="color:${primary};text-decoration:underline;font-weight:600;">garage.grekam.in</a></p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

export default function EmailTemplatesSettingsPage() {
  const org = useOrganization()
  const [mainTab, setMainTab] = useState<"SMTP" | "TEMPLATES" | "CRONS">("SMTP")

  // =====================
  // 1. SMTP STATE
  // =====================
  const [smtpForm, setSmtpForm] = useState({
    host: "smtp.gmail.com",
    port: "587",
    secure: false,
    user: "notifications@grekam.in",
    pass: "",
    senderName: "Grekam Garage OS",
    senderEmail: "notifications@garage.grekam.in",
  })
  const [smtpLoading, setSmtpLoading] = useState(false)
  const [smtpTesting, setSmtpTesting] = useState(false)
  const [testRecipient, setTestRecipient] = useState("")

  const fetchSmtpSettings = async () => {
    try {
      setSmtpLoading(true)
      const res = await fetch("/api/settings/smtp")
      const json = await res.json()
      if (json.success && json.config) {
        setSmtpForm(prev => ({
          ...prev,
          host: json.config.host || prev.host,
          port: String(json.config.port || prev.port),
          secure: json.config.secure || false,
          user: json.config.user || prev.user,
          senderName: json.config.senderName || prev.senderName,
          senderEmail: json.config.senderEmail || prev.senderEmail,
        }))
      }
    } catch {
      toast.error("Failed to load SMTP configuration")
    } finally {
      setSmtpLoading(false)
    }
  }

  const handleSaveSmtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setSmtpLoading(true)
    try {
      const res = await fetch("/api/settings/smtp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(smtpForm),
      })
      const json = await res.json()
      if (json.success) {
        toast.success(json.message || "SMTP Settings saved successfully!")
      } else {
        toast.error(json.error || "Failed to save SMTP settings")
      }
    } catch {
      toast.error("Network error while saving SMTP settings")
    } finally {
      setSmtpLoading(false)
    }
  }

  const handleSendSmtpVerification = async () => {
    if (!testRecipient || !testRecipient.includes("@")) {
      toast.error("Please enter a valid recipient email address")
      return
    }
    setSmtpTesting(true)
    toast.loading(`Sending verification email to ${testRecipient}...`)
    try {
      const res = await fetch("/api/settings/smtp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...smtpForm,
          sendTest: true,
          testRecipient: testRecipient.trim(),
        }),
      })
      const json = await res.json()
      toast.dismiss()
      if (json.success) {
        toast.success(json.message || `Test email dispatched to ${testRecipient}!`)
      } else {
        toast.error(json.error || "SMTP test failed. Check host, port and credentials.")
      }
    } catch {
      toast.dismiss()
      toast.error("Failed to reach email verification endpoint")
    } finally {
      setSmtpTesting(false)
    }
  }

  // =====================
  // 2. TEMPLATES STATE
  // =====================
  const { data: response, isLoading: templatesLoading, mutate } = useApi<any>("/settings/templates")
  const templates: any[] = response?.data || []

  const [selectedCode, setSelectedCode] = useState<string>("")
  const [activeCategory, setActiveCategory] = useState<string>("ALL")
  const [activeTemplateTab, setActiveTemplateTab] = useState<"edit" | "preview">("edit")
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop")

  const [formData, setFormData] = useState({
    subject: "",
    bodyHtml: "",
    isActive: true
  })
  const [isSavingTemplate, setIsSavingTemplate] = useState(false)
  const [isDispatchingEmail, setIsDispatchingEmail] = useState(false)
  const [templateTestRecipient, setTemplateTestRecipient] = useState("")

  const filteredTemplates = templates.filter(t => {
    if (t.category === "STUDENT") return false
    if (activeCategory === "ALL") return true
    return t.category === activeCategory
  })

  const currentTemplate = filteredTemplates.find(t => t.code === selectedCode) || filteredTemplates[0]

  useEffect(() => {
    if (filteredTemplates.length > 0) {
      const existsInFiltered = filteredTemplates.some(t => t.code === selectedCode)
      if (!existsInFiltered) {
        setSelectedCode(filteredTemplates[0].code)
      }
    }
  }, [activeCategory, templates])

  useEffect(() => {
    if (currentTemplate) {
      setFormData({
        subject: currentTemplate.subject || "",
        bodyHtml: currentTemplate.bodyHtml || "",
        isActive: currentTemplate.isActive ?? true
      })
    }
  }, [selectedCode, activeCategory, response])

  const handleInsertVariable = (varName: string) => {
    const placeholder = `{{${varName}}}`
    setFormData(prev => ({
      ...prev,
      bodyHtml: prev.bodyHtml + " " + placeholder
    }))
    toast.success(`Inserted ${placeholder}`)
  }

  const handleSaveTemplate = async () => {
    if (!currentTemplate) return
    setIsSavingTemplate(true)
    try {
      await fetchApi(`/settings/templates/${currentTemplate.code}`, {
        method: "PUT",
        body: JSON.stringify(formData)
      })
      toast.success("Email template saved successfully!")
      mutate()
    } catch (err: any) {
      toast.error(err.message || "Failed to save template")
    } finally {
      setIsSavingTemplate(false)
    }
  }

  const handleDispatchTemplateTest = async () => {
    if (!currentTemplate || !templateTestRecipient.trim()) {
      toast.error("Please provide a valid recipient email address")
      return
    }
    setIsDispatchingEmail(true)
    toast.loading(`Dispatching template email to ${templateTestRecipient.trim()}...`)
    try {
      const res = await fetchApi<any>(`/settings/templates/${currentTemplate.code}/test`, {
        method: "POST",
        body: JSON.stringify({ sendToEmail: templateTestRecipient.trim() })
      })
      toast.dismiss()
      if (res.sent) {
        toast.success(`Live template email dispatched to ${templateTestRecipient.trim()}!`)
      } else {
        toast.success(`Preview generated for ${templateTestRecipient.trim()}`)
      }
    } catch (err: any) {
      toast.dismiss()
      toast.error(err.message || "Failed to dispatch test email")
    } finally {
      setIsDispatchingEmail(false)
    }
  }

  // =====================
  // 3. AUTOMATED CRONS STATE
  // =====================
  const [crons, setCrons] = useState<any[]>([])
  const [cronsLoading, setCronsLoading] = useState(false)
  const [triggeringCronId, setTriggeringCronId] = useState<string | null>(null)

  const fetchCrons = async () => {
    try {
      setCronsLoading(true)
      const res = await fetch("/api/settings/email-crons")
      const json = await res.json()
      if (json.success && json.crons) {
        setCrons(json.crons)
      }
    } catch {
      toast.error("Failed to load automated email crons")
    } finally {
      setCronsLoading(false)
    }
  }

  const handleToggleCron = (cronId: string) => {
    setCrons(prev => prev.map(c => {
      if (c.id === cronId) {
        const nextActive = !c.active
        toast.success(`Cron "${c.name}" is now ${nextActive ? "ENABLED" : "PAUSED"}`)
        return { ...c, active: nextActive }
      }
      return c
    }))
  }

  const handleTriggerCronNow = async (cron: any) => {
    setTriggeringCronId(cron.id)
    toast.loading(`Triggering automated cron: ${cron.name}...`)
    try {
      const res = await fetch("/api/settings/email-crons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "trigger-now", cronId: cron.id }),
      })
      const json = await res.json()
      toast.dismiss()
      if (json.success) {
        toast.success(json.message || `Cron job "${cron.name}" executed successfully!`)
        setCrons(prev => prev.map(c => c.id === cron.id ? { ...c, lastRunAt: new Date().toISOString(), lastStatus: "SUCCESS" } : c))
      } else {
        toast.error(json.error || "Failed to execute cron")
      }
    } catch {
      toast.dismiss()
      toast.error("Network error triggering cron")
    } finally {
      setTriggeringCronId(null)
    }
  }

  useEffect(() => {
    fetchSmtpSettings()
    fetchCrons()
  }, [])

  return (
    <div className="flex flex-col h-full min-h-screen bg-dash-bg-base text-foreground font-sans">
      
      {/* Top Main Navigation Header */}
      <div className="flex-none px-8 pt-6 pb-4 border-b border-white/10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400">
              <Mail className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white">Email Delivery, SMTP & Automated Triggers</h1>
          </div>
          <p className="text-xs text-zinc-400 mt-1">Configure SMTP credentials, customize branded templates, and automate scheduled email notifications across the platform.</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 bg-white/5 p-1 rounded-2xl border border-white/10">
          <button
            onClick={() => setMainTab("SMTP")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              mainTab === "SMTP"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                : "text-zinc-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            SMTP Settings
          </button>
          <button
            onClick={() => setMainTab("TEMPLATES")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              mainTab === "TEMPLATES"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                : "text-zinc-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            Email Templates
          </button>
          <button
            onClick={() => setMainTab("CRONS")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              mainTab === "CRONS"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                : "text-zinc-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Automated Crons
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: SMTP CONFIGURATION */}
      {/* ========================================================= */}
      {mainTab === "SMTP" && (
        <div className="p-8 max-w-5xl space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left: Form */}
            <div className="lg:col-span-2 bg-[#0a0f1d] border border-white/10 rounded-2xl p-6 shadow-xl space-y-5">
              <div className="border-b border-white/10 pb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-white">SMTP Server Credentials</h2>
                  <p className="text-xs text-zinc-400 mt-0.5">Connect any SMTP service (Gmail App Passwords, Resend, SendGrid, Amazon SES, or Hostinger).</p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Ready to Transmit
                </span>
              </div>

              <form onSubmit={handleSaveSmtp} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-zinc-300 font-semibold mb-1">SMTP Host *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. smtp.gmail.com or smtp.resend.com"
                      value={smtpForm.host}
                      onChange={(e) => setSmtpForm({ ...smtpForm, host: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-300 font-semibold mb-1">Port *</label>
                    <input
                      type="number"
                      required
                      placeholder="587"
                      value={smtpForm.port}
                      onChange={(e) => setSmtpForm({ ...smtpForm, port: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-zinc-300 font-semibold mb-1">SMTP Username / Email *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. info@grekam.in"
                      value={smtpForm.user}
                      onChange={(e) => setSmtpForm({ ...smtpForm, user: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-300 font-semibold mb-1">SMTP Password / App Key *</label>
                    <input
                      type="password"
                      placeholder="••••••••••••••••"
                      value={smtpForm.pass}
                      onChange={(e) => setSmtpForm({ ...smtpForm, pass: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-white/5">
                  <div>
                    <label className="block text-zinc-300 font-semibold mb-1">Sender Brand Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Grekam Garage OS"
                      value={smtpForm.senderName}
                      onChange={(e) => setSmtpForm({ ...smtpForm, senderName: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-300 font-semibold mb-1">From Email Address</label>
                    <input
                      type="email"
                      placeholder="e.g. notifications@garage.grekam.in"
                      value={smtpForm.senderEmail}
                      onChange={(e) => setSmtpForm({ ...smtpForm, senderEmail: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={smtpForm.secure}
                      onChange={(e) => setSmtpForm({ ...smtpForm, secure: e.target.checked })}
                      className="rounded border-white/10 bg-white/5 text-blue-600 w-4 h-4"
                    />
                    <span className="text-zinc-300 text-xs font-medium">Use SSL/TLS Security (Port 465)</span>
                  </label>

                  <button
                    type="submit"
                    disabled={smtpLoading}
                    className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-lg shadow-blue-600/30 transition flex items-center gap-2"
                  >
                    {smtpLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    Save SMTP Settings
                  </button>
                </div>
              </form>
            </div>

            {/* Right: Test Verification Card */}
            <div className="space-y-6">
              <div className="bg-[#0a0f1d] border border-blue-500/30 rounded-2xl p-6 shadow-xl space-y-4">
                <div className="flex items-center gap-2 text-blue-400">
                  <Send className="w-4 h-4" />
                  <h3 className="text-sm font-bold text-white">Live Email Verification</h3>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Verify your SMTP connection immediately by sending a test transaction payload to any email inbox.
                </p>

                <div className="space-y-2">
                  <label className="block text-zinc-300 text-xs font-medium">Recipient Test Email</label>
                  <input
                    type="email"
                    placeholder="your-email@example.com"
                    value={testRecipient}
                    onChange={(e) => setTestRecipient(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleSendSmtpVerification}
                  disabled={smtpTesting}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-600/20 transition flex items-center justify-center gap-2"
                >
                  {smtpTesting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  Dispatch Test Email Now
                </button>
              </div>

              {/* Info Box */}
              <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-5 text-xs text-zinc-400 space-y-2">
                <div className="flex items-center gap-1.5 text-zinc-200 font-semibold">
                  <Info className="w-3.5 h-3.5 text-blue-400" />
                  Recommended Providers
                </div>
                <ul className="list-disc list-inside space-y-1 text-[11px] text-zinc-400">
                  <li><strong>Gmail / Google Workspace:</strong> Host `smtp.gmail.com`, Port 587 (Requires 2FA App Password).</li>
                  <li><strong>Resend:</strong> Host `smtp.resend.com`, Port 465, User `resend`, Pass `re_...`</li>
                  <li><strong>SendGrid:</strong> Host `smtp.sendgrid.net`, Port 587, User `apikey`</li>
                </ul>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: EMAIL TEMPLATES */}
      {/* ========================================================= */}
      {mainTab === "TEMPLATES" && (
        <div className="flex-1 flex min-h-0 overflow-hidden">
          {/* Left Sidebar: Template list */}
          <div className="w-80 flex-none border-r border-white/10 flex flex-col bg-[#070b16]">
            {/* Category Filter */}
            <div className="p-4 border-b border-white/10 space-y-2">
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Template Categories</span>
              <div className="flex flex-wrap gap-1">
                <button
                  onClick={() => setActiveCategory("ALL")}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                    activeCategory === "ALL" ? "bg-blue-600 text-white" : "text-zinc-400 hover:text-white bg-white/5"
                  }`}
                >
                  All ({templates.length})
                </button>
                {Object.keys(CATEGORY_MAP).map(catKey => (
                  <button
                    key={catKey}
                    onClick={() => setActiveCategory(catKey)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                      activeCategory === catKey ? "bg-blue-600 text-white" : "text-zinc-400 hover:text-white bg-white/5"
                    }`}
                  >
                    {CATEGORY_MAP[catKey].label.split(" ")[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Template items */}
            <div className="flex-1 overflow-y-auto divide-y divide-white/5">
              {filteredTemplates.map(t => {
                const isSelected = (currentTemplate?.code === t.code)
                return (
                  <button
                    key={t.code}
                    onClick={() => setSelectedCode(t.code)}
                    className={`w-full text-left p-3.5 transition flex items-start justify-between gap-2 ${
                      isSelected ? "bg-blue-600/15 border-l-4 border-blue-500" : "hover:bg-white/[0.02]"
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-xs text-white truncate">{t.name}</div>
                      <div className="text-[11px] text-zinc-400 truncate mt-0.5">{t.subject}</div>
                      <div className="text-[10px] font-mono text-zinc-500 mt-1">{t.code}</div>
                    </div>
                    <ChevronRight className={`w-4 h-4 shrink-0 mt-1 ${isSelected ? "text-blue-400" : "text-zinc-600"}`} />
                  </button>
                )
              })}
            </div>
          </div>

          {/* Center: Editor & Preview */}
          <div className="flex-1 flex flex-col min-h-0 bg-[#0a0f1d] overflow-y-auto p-6 space-y-6">
            {currentTemplate ? (
              <>
                {/* Template Toolbar */}
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div>
                    <h2 className="text-base font-bold text-white">{currentTemplate.name}</h2>
                    <p className="text-xs text-zinc-400 font-mono mt-0.5">{currentTemplate.code}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
                      <button
                        onClick={() => setActiveTemplateTab("edit")}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 ${
                          activeTemplateTab === "edit" ? "bg-blue-600 text-white" : "text-zinc-400 hover:text-white"
                        }`}
                      >
                        <Code className="w-3.5 h-3.5" /> Edit Template
                      </button>
                      <button
                        onClick={() => setActiveTemplateTab("preview")}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 ${
                          activeTemplateTab === "preview" ? "bg-blue-600 text-white" : "text-zinc-400 hover:text-white"
                        }`}
                      >
                        <Eye className="w-3.5 h-3.5" /> HTML Preview
                      </button>
                    </div>

                    <button
                      onClick={handleSaveTemplate}
                      disabled={isSavingTemplate}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center gap-2"
                    >
                      {isSavingTemplate ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                      Save
                    </button>
                  </div>
                </div>

                {activeTemplateTab === "edit" ? (
                  <div className="space-y-4">
                    {/* Subject */}
                    <div>
                      <label className="block text-zinc-300 text-xs font-semibold mb-1">Email Subject Line</label>
                      <input
                        type="text"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    {/* Merge Variables */}
                    <div>
                      <span className="block text-zinc-400 text-[11px] font-semibold uppercase mb-1.5">Available Dynamic Variables (Click to Insert)</span>
                      <div className="flex flex-wrap gap-1.5">
                        {Object.keys(SAMPLE_VARIABLES).slice(0, 10).map((v) => (
                          <button
                            key={v}
                            type="button"
                            onClick={() => handleInsertVariable(v)}
                            className="px-2.5 py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/20 text-[11px] font-mono transition"
                          >
                            +{`{{${v}}}`}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* HTML Body */}
                    <div>
                      <label className="block text-zinc-300 text-xs font-semibold mb-1">HTML Email Content</label>
                      <textarea
                        rows={12}
                        value={formData.bodyHtml}
                        onChange={(e) => setFormData({ ...formData, bodyHtml: e.target.value })}
                        className="w-full p-4 rounded-xl bg-[#050811] border border-white/10 text-zinc-200 font-mono text-xs focus:outline-none focus:border-blue-500 leading-relaxed"
                      />
                    </div>

                    {/* Test Dispatch */}
                    <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between gap-4">
                      <div className="flex-1">
                        <label className="block text-zinc-300 text-xs font-semibold mb-1">Send Template Test Preview</label>
                        <input
                          type="email"
                          placeholder="recipient@example.com"
                          value={templateTestRecipient}
                          onChange={(e) => setTemplateTestRecipient(e.target.value)}
                          className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleDispatchTemplateTest}
                        disabled={isDispatchingEmail}
                        className="px-4 py-2 mt-5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-2"
                      >
                        {isDispatchingEmail ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                        Send Test
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="border border-white/10 rounded-2xl p-4 bg-white overflow-hidden shadow-2xl">
                    <iframe
                      title="Email Preview"
                      srcDoc={buildPreviewEmailHtml(formData.bodyHtml, formData.subject, org)}
                      className="w-full h-[520px] rounded-xl border-0"
                    />
                  </div>
                )}
              </>
            ) : (
              <div className="py-12 text-center text-zinc-500">No template selected.</div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: AUTOMATED CRONS & TRIGGERS */}
      {/* ========================================================= */}
      {mainTab === "CRONS" && (
        <div className="p-8 max-w-6xl space-y-6">
          <div className="border-b border-white/10 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-white">Automated Notification Crons & Triggers</h2>
              <p className="text-xs text-zinc-400 mt-0.5">Control recurring schedules and background event triggers that automatically dispatch emails to clients, staff, and partners.</p>
            </div>
            <button
              onClick={fetchCrons}
              className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-400 hover:text-white transition"
              title="Refresh Crons"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {crons.map((cron) => (
              <div
                key={cron.id}
                className="bg-[#0a0f1d] border border-white/10 hover:border-white/20 rounded-2xl p-5 shadow-xl transition space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-white">{cron.name}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        cron.active ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-zinc-800 text-zinc-400 border border-zinc-700"
                      }`}>
                        {cron.active ? "Active" : "Paused"}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{cron.description}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] p-3 rounded-xl bg-white/[0.02] border border-white/5 text-zinc-400 font-mono">
                  <div>
                    <span className="text-zinc-500 block">Schedule:</span>
                    <span className="text-zinc-300 font-semibold">{cron.scheduleDescription}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block">Recipient Target:</span>
                    <span className="text-blue-300">{cron.recipientTarget}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => handleToggleCron(cron.id)}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-xl border transition ${
                      cron.active 
                        ? "bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border-amber-500/20" 
                        : "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/20"
                    }`}
                  >
                    {cron.active ? "Pause Automation" : "Enable Automation"}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleTriggerCronNow(cron)}
                    disabled={triggeringCronId === cron.id}
                    className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md shadow-blue-600/20 transition flex items-center gap-1.5"
                  >
                    {triggeringCronId === cron.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                    Trigger Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  )
}
