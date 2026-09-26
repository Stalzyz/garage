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
  GraduationCap, 
  Loader2, 
  ChevronRight,
  ToggleLeft,
  ToggleRight,
  Info,
  Monitor,
  Smartphone,
  Check
} from "lucide-react"
import { useApi, fetchApi } from "@/lib/useApi"
import { useOrganization } from "@/context/OrganizationContext"
import { toast } from "sonner"

const CATEGORY_MAP: Record<string, { label: string; icon: any; color: string }> = {
  CLIENT: { label: "Client Notifications", icon: Building2, color: "text-blue-400 bg-blue-400/10 border-blue-400/20" },
  STAFF: { label: "Staff & Operations", icon: Users, color: "text-amber-400 bg-amber-400/10 border-amber-400/20" },
  STUDENT: { label: "Student & Academy", icon: GraduationCap, color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" }
}

const SAMPLE_VARIABLES: Record<string, string> = {
  clientName: "Jane Doe",
  companyName: "Acme Visuals Corp",
  portalLink: "https://dashboard.grekam.in/portal/dashboard",
  accountManager: "Stalin Kumar",
  invoiceNumber: "INV-2026-089",
  projectName: "Website & Brand Refresh",
  amount: "45,000",
  dueDate: "Sep 25, 2026",
  invoiceUrl: "https://dashboard.grekam.in/portal/invoices",
  proposalTitle: "Ecommerce Platform Redesign",
  estimatedAmount: "1,20,000",
  proposalLink: "https://dashboard.grekam.in/portal/proposals",
  staffName: "Sales Officer",
  leadName: "Rahul Sharma",
  phone: "+91 98765 43210",
  email: "rahul@example.com",
  leadSource: "Google Ads",
  interestTier: "High (Website & App)",
  crmLink: "https://dashboard.grekam.in/dashboard/crm",
  taskTitle: "Design System Figma Components",
  priority: "HIGH",
  taskUrl: "https://dashboard.grekam.in/dashboard/projects",
  studentName: "Aarav Patel",
  courseName: "UI/UX Design Masterclass",
  batchName: "Batch 2026-A",
  rollNo: "GK-2026-042",
  startDate: "Sep 15, 2026",
  lmsLink: "https://academy.grekam.in",
  certificateUrl: "https://academy.grekam.in/verify/CERT-99201",
  completionDate: "Sep 12, 2026",
  todayDate: "Sep 12, 2026",
  pendingTasksCount: "4",
  leadsToCallCount: "7",
  highPriorityTickets: "2",
  dashboardLink: "https://dashboard.grekam.in/dashboard",
  leaveType: "Casual Leave",
  endDate: "Sep 20, 2026",
  leaveStatus: "APPROVED",
  approverNotes: "Approved by Operations Manager",
  hrLink: "https://dashboard.grekam.in/dashboard/hr",
  monthYear: "August 2026",
  netPay: "65,000",
  paymentDate: "Aug 31, 2026",
  payslipUrl: "https://dashboard.grekam.in/dashboard/hr/payslips",
  feePortalLink: "https://academy.grekam.in/dashboard/fees",
  attendancePercentage: "68",
  attendedClasses: "17",
  totalClasses: "25",
  attendanceLink: "https://academy.grekam.in/dashboard/attendance",
}

function buildPreviewEmailHtml(bodyHtml: string, subject: string, org?: any) {
  let content = bodyHtml || ""
  Object.keys(SAMPLE_VARIABLES).forEach(k => {
    content = content.replace(new RegExp(`{{\\s*${k}\\s*}}`, "gi"), SAMPLE_VARIABLES[k])
  })

  const primary = org?.primaryColor || "#2563eb"
  const secondary = org?.secondaryColor || "#1e293b"
  const companyName = org?.companyName || org?.name || "Grekam Visuals"
  const logoUrl = org?.logoUrl
  const initial = (companyName.trim()[0] || "G").toUpperCase()

  // Inline buttons with organization primary color
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
                            <div style="color:#e0e7ff;font-size:10px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;margin-top:2px;">Workspace Notification</div>
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
              <p style="margin:0;color:#64748b;">Official notification sent from <a href="https://dashboard.grekam.in" style="color:${primary};text-decoration:underline;font-weight:600;">dashboard.grekam.in</a></p>
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
  const { data: response, isLoading, mutate } = useApi<any>("/settings/templates")
  const templates: any[] = response?.data || []

  const [selectedCode, setSelectedCode] = useState<string>("")
  const [activeCategory, setActiveCategory] = useState<string>("ALL")
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit")
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop")

  // Form State
  const [formData, setFormData] = useState({
    subject: "",
    bodyHtml: "",
    isActive: true
  })
  const [isSaving, setIsSaving] = useState(false)
  const [isSendingTest, setIsSendingTest] = useState(false)
  const [isDispatchingEmail, setIsDispatchingEmail] = useState(false)
  const [testRecipientInput, setTestRecipientInput] = useState("")
  const [testResult, setTestResult] = useState<any>(null)
  const [isTestModalOpen, setIsTestModalOpen] = useState(false)

  const filteredTemplates = templates.filter(t => {
    if (activeCategory === "ALL") return true
    return t.category === activeCategory
  })

  // Currently selected template (fallback to first filtered template)
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

  const handleSave = async () => {
    if (!currentTemplate) return
    setIsSaving(true)
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
      setIsSaving(false)
    }
  }

  const handleSendTest = async () => {
    if (!currentTemplate) return
    setIsSendingTest(true)
    try {
      const res = await fetchApi<any>(`/settings/templates/${currentTemplate.code}/test`, {
        method: "POST",
        body: JSON.stringify({})
      })
      setTestResult(res)
      setTestRecipientInput(res.recipient || "")
      setIsTestModalOpen(true)
      toast.success(`Test preview generated`)
    } catch (err: any) {
      toast.error(err.message || "Failed to generate test preview")
    } finally {
      setIsSendingTest(false)
    }
  }

  const handleDispatchLiveEmail = async () => {
    if (!currentTemplate || !testRecipientInput.trim()) {
      toast.error("Please provide a valid recipient email address")
      return
    }
    setIsDispatchingEmail(true)
    try {
      const res = await fetchApi<any>(`/settings/templates/${currentTemplate.code}/test`, {
        method: "POST",
        body: JSON.stringify({ sendToEmail: testRecipientInput.trim() })
      })
      if (res.sent) {
        toast.success(`Live test email successfully dispatched to ${testRecipientInput.trim()}!`)
      } else {
        toast.success(`Preview updated for ${testRecipientInput.trim()}`)
      }
      setTestResult(res)
    } catch (err: any) {
      toast.error(err.message || "Failed to dispatch test email")
    } finally {
      setIsDispatchingEmail(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col h-full items-center justify-center bg-background text-muted-foreground p-12">
        <Loader2 className="w-8 h-8 animate-spin mb-4 text-primary" />
        <p className="text-sm font-medium">Loading Email Templates...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full min-h-0 bg-background text-foreground overflow-hidden">
      {/* Header */}
      <div className="flex-none px-6 pt-5 pb-4 border-b border-border/50 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Mail className="w-5 h-5 text-primary" />
            <h1 className="text-xl font-bold text-foreground">Email Template Manager</h1>
          </div>
          <p className="text-xs text-muted-foreground">Customize branding, subject lines, and dynamic placeholders for Client, Staff, and Student email notifications.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSendTest}
            disabled={isSendingTest || !currentTemplate}
            className="px-4 py-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 text-xs font-bold rounded-xl border border-border/60 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {isSendingTest ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            Preview & Send Test
          </button>

          <button
            onClick={handleSave}
            disabled={isSaving || !currentTemplate}
            className="px-5 py-2 bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            Save Template
          </button>
        </div>
      </div>

      {/* Main Content split layout */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-80 flex-none border-r border-border/50 flex flex-col bg-card/40">
          {/* Category Filter Tabs */}
          <div className="p-3 border-b border-border/50 flex gap-1 overflow-x-auto no-scrollbar">
            {["ALL", "CLIENT", "STAFF", "STUDENT"].map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${activeCategory === cat ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted/30"}`}
              >
                {cat === "ALL" ? "All" : cat}
              </button>
            ))}
          </div>

          {/* Templates List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {filteredTemplates.map(t => {
              const isSelected = t.code === currentTemplate?.code
              const catInfo = CATEGORY_MAP[t.category] || CATEGORY_MAP.CLIENT

              return (
                <button
                  key={t.code}
                  onClick={() => setSelectedCode(t.code)}
                  className={`w-full text-left p-3 rounded-xl border transition-all ${isSelected ? "bg-primary/10 border-primary/40 shadow-sm" : "bg-card/60 border-border/40 hover:border-border hover:bg-muted/20"}`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${catInfo.color}`}>
                      {t.category}
                    </span>
                    <span className={`text-[10px] font-mono font-medium ${t.isActive ? "text-emerald-400" : "text-muted-foreground"}`}>
                      {t.isActive ? "Active" : "Disabled"}
                    </span>
                  </div>
                  <h3 className="text-xs font-bold text-foreground leading-snug mb-1">{t.name}</h3>
                  <p className="text-[11px] font-mono text-muted-foreground truncate">{t.code}</p>
                </button>
              )
            })}
          </div>
        </div>

        {/* Right Content Pane */}
        {currentTemplate ? (
          <div className="flex-1 flex flex-col min-h-0 bg-background overflow-y-auto p-6 space-y-6">
            {/* Template Header Info */}
            <div className="flex items-center justify-between pb-4 border-b border-border/50">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-lg font-bold text-foreground">{currentTemplate.name}</h2>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-muted text-muted-foreground border border-border/50">
                    {currentTemplate.code}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">Category: {currentTemplate.category} Notification</p>
              </div>

              {/* Active Toggle */}
              <button
                onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${formData.isActive ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-muted text-muted-foreground border-border/50"}`}
              >
                {formData.isActive ? <ToggleRight className="w-4 h-4 text-emerald-400" /> : <ToggleLeft className="w-4 h-4 text-muted-foreground" />}
                {formData.isActive ? "Template Active" : "Template Disabled"}
              </button>
            </div>

            {/* Subject Input */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">Subject Line *</label>
              <input
                type="text"
                value={formData.subject}
                onChange={e => setFormData({ ...formData, subject: e.target.value })}
                className="w-full bg-muted/30 border border-border/50 rounded-xl px-4 py-3 text-sm text-foreground focus:border-primary outline-none font-medium"
                placeholder="e.g. Welcome to Grekam, {{clientName}}!"
              />
            </div>

            {/* Dynamic Variables Selector Chips */}
            {currentTemplate.variables && Array.isArray(currentTemplate.variables) && (
              <div className="bg-card/60 border border-border/50 rounded-xl p-4">
                <div className="flex items-center gap-1.5 mb-2 text-xs font-semibold text-muted-foreground">
                  <Code className="w-3.5 h-3.5 text-indigo-400" /> Click to Insert Dynamic Variable Placeholders:
                </div>
                <div className="flex flex-wrap gap-2">
                  {currentTemplate.variables.map((v: string) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => handleInsertVariable(v)}
                      className="px-2.5 py-1 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 rounded-lg text-xs font-mono font-medium transition-all hover:scale-105"
                    >
                      {`{{${v}}}`}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* View Mode Tabs (Edit HTML vs Live Preview) */}
            <div className="flex items-center justify-between border-b border-border/50 pb-2">
              <div className="flex gap-4">
                <button
                  onClick={() => setActiveTab("edit")}
                  className={`flex items-center gap-2 pb-2 text-xs font-bold border-b-2 transition-all ${activeTab === "edit" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
                >
                  <Code className="w-3.5 h-3.5" /> Edit Template HTML
                </button>
                <button
                  onClick={() => setActiveTab("preview")}
                  className={`flex items-center gap-2 pb-2 text-xs font-bold border-b-2 transition-all ${activeTab === "preview" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
                >
                  <Eye className="w-3.5 h-3.5" /> Live Render Preview
                </button>
              </div>

              {activeTab === "preview" && (
                <div className="flex items-center gap-3">
                  <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/[0.04] border border-white/[0.08] text-[11px] text-slate-300">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: org?.primaryColor || '#2563eb' }} />
                    <span>Branded with Org Theme:</span>
                    <span className="font-mono text-slate-400">{org?.primaryColor || '#2563eb'}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-muted/40 p-1 rounded-lg border border-border/50">
                    <button
                      onClick={() => setPreviewDevice("desktop")}
                      className={`px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1.5 transition-all ${previewDevice === "desktop" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                    >
                      <Monitor className="w-3.5 h-3.5" /> Desktop
                    </button>
                    <button
                      onClick={() => setPreviewDevice("mobile")}
                      className={`px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1.5 transition-all ${previewDevice === "mobile" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                    >
                      <Smartphone className="w-3.5 h-3.5" /> Mobile
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Tab Editor / Preview Content */}
            {activeTab === "edit" ? (
              <div>
                <textarea
                  rows={14}
                  value={formData.bodyHtml}
                  onChange={e => setFormData({ ...formData, bodyHtml: e.target.value })}
                  className="w-full bg-card border border-border/60 rounded-xl p-4 font-mono text-xs text-foreground focus:border-primary outline-none leading-relaxed resize-y"
                  placeholder="<p>Enter HTML email content here...</p>"
                />
              </div>
            ) : (
              <div className="border border-border/60 rounded-xl overflow-hidden bg-slate-950/60 p-6 flex flex-col items-center justify-center min-h-[480px]">
                <div className={`transition-all duration-300 w-full ${previewDevice === "mobile" ? "max-w-[390px]" : "max-w-[640px]"}`}>
                  <div className="bg-muted/40 px-4 py-2 border-t border-x border-border/60 rounded-t-xl text-[11px] font-mono text-muted-foreground flex items-center justify-between">
                    <span>Subject: {formData.subject || "(No Subject)"}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-card/80 border border-border/40 font-bold uppercase">{previewDevice}</span>
                  </div>
                  <div className="border border-border/60 rounded-b-xl overflow-hidden shadow-2xl bg-[#f1f5f9] h-[520px]">
                    <iframe
                      srcDoc={buildPreviewEmailHtml(formData.bodyHtml, formData.subject, org)}
                      className="w-full h-full border-0"
                      title="Email Live Preview"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>

      {/* Test Preview & Delivery Modal */}
      {isTestModalOpen && testResult && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border/60 rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border/50 pb-3">
              <div>
                <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
                  <Mail className="w-4 h-4 text-primary" /> Test Email Preview &amp; Delivery
                </h3>
                <p className="text-xs text-muted-foreground">Send a live test email directly to your inbox to verify styling.</p>
              </div>
              <button
                onClick={() => setIsTestModalOpen(false)}
                className="text-muted-foreground hover:text-foreground text-xs font-bold px-3 py-1 rounded-lg bg-muted/40"
              >
                Close
              </button>
            </div>

            {/* Recipient Address & Dispatch Input */}
            <div className="bg-muted/30 border border-border/50 rounded-xl p-3 flex flex-col sm:flex-row gap-2.5 items-center">
              <div className="flex-1 w-full">
                <label className="block text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-1">Recipient Email Address:</label>
                <input
                  type="email"
                  value={testRecipientInput}
                  onChange={e => setTestRecipientInput(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-card border border-border/60 rounded-lg px-3 py-2 text-xs font-medium text-foreground outline-none focus:border-primary"
                />
              </div>
              <button
                onClick={handleDispatchLiveEmail}
                disabled={isDispatchingEmail || !testRecipientInput.trim()}
                className="w-full sm:w-auto mt-auto px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 whitespace-nowrap h-[35px]"
              >
                {isDispatchingEmail ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                Send Live Test
              </button>
            </div>

            <div>
              <p className="text-xs font-mono text-muted-foreground mb-1">Subject Line:</p>
              <p className="text-xs font-bold text-foreground bg-muted/30 p-2.5 rounded-lg border border-border/50">{testResult.rendered?.subject}</p>
            </div>

            <div>
              <p className="text-xs font-mono text-muted-foreground mb-1">Rendered Email Output:</p>
              <div className="h-80 overflow-hidden border border-border/50 rounded-lg bg-[#f1f5f9]">
                <iframe
                  srcDoc={testResult.rendered?.html}
                  className="w-full h-full border-0"
                  title="Email Test Preview"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
