"use client"

import { useState, useEffect } from "react"
import { 
  Mail, 
  Send, 
  Save, 
  Eye, 
  Code, 
  Sparkles, 
  CheckCircle, 
  Building2, 
  Users, 
  GraduationCap, 
  Loader2, 
  ChevronRight,
  ToggleLeft,
  ToggleRight,
  Info
} from "lucide-react"
import { useApi, fetchApi } from "@/lib/useApi"
import { toast } from "sonner"

const CATEGORY_MAP: Record<string, { label: string; icon: any; color: string }> = {
  CLIENT: { label: "Client Notifications", icon: Building2, color: "text-blue-400 bg-blue-400/10 border-blue-400/20" },
  STAFF: { label: "Staff & Operations", icon: Users, color: "text-amber-400 bg-amber-400/10 border-amber-400/20" },
  STUDENT: { label: "Student & Academy", icon: GraduationCap, color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" }
}

export default function EmailTemplatesSettingsPage() {
  const { data: response, isLoading, mutate } = useApi<any>("/settings/templates")
  const templates: any[] = response?.data || []

  const [selectedCode, setSelectedCode] = useState<string>("")
  const [activeCategory, setActiveCategory] = useState<string>("ALL")
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit")

  // Form State
  const [formData, setFormData] = useState({
    subject: "",
    bodyHtml: "",
    isActive: true
  })
  const [isSaving, setIsSaving] = useState(false)
  const [isSendingTest, setIsSendingTest] = useState(false)
  const [testResult, setTestResult] = useState<any>(null)
  const [isTestModalOpen, setIsTestModalOpen] = useState(false)

  // Currently selected template
  const currentTemplate = templates.find(t => t.code === selectedCode) || templates[0]

  useEffect(() => {
    if (templates.length > 0 && !selectedCode) {
      setSelectedCode(templates[0].code)
    }
  }, [templates, selectedCode])

  useEffect(() => {
    if (currentTemplate) {
      setFormData({
        subject: currentTemplate.subject || "",
        bodyHtml: currentTemplate.bodyHtml || "",
        isActive: currentTemplate.isActive ?? true
      })
    }
  }, [selectedCode, response])

  const filteredTemplates = templates.filter(t => {
    if (activeCategory === "ALL") return true
    return t.category === activeCategory
  })

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
        method: "POST"
      })
      setTestResult(res)
      setIsTestModalOpen(true)
      toast.success(`Test preview generated for ${res.recipient}`)
    } catch (err: any) {
      toast.error(err.message || "Failed to generate test email")
    } finally {
      setIsSendingTest(false)
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
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Click to Insert Dynamic Variable Placeholders:
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

              <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                <Info className="w-3.5 h-3.5" /> Standard Grekam header & footer are attached automatically.
              </div>
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
              <div className="border border-border/60 rounded-xl overflow-hidden bg-[#0b0f17] p-6 min-h-[400px]">
                <div 
                  className="max-w-xl mx-auto bg-[#161e2e] border border-[#2a364f] rounded-2xl overflow-hidden shadow-2xl p-6 text-slate-200 text-sm leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: formData.bodyHtml }}
                />
              </div>
            )}
          </div>
        ) : null}
      </div>

      {/* Test Preview Modal */}
      {isTestModalOpen && testResult && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border/60 rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border/50 pb-3">
              <div>
                <h3 className="font-bold text-foreground text-sm">Test Email Preview</h3>
                <p className="text-xs text-muted-foreground">Recipient: {testResult.recipient}</p>
              </div>
              <button
                onClick={() => setIsTestModalOpen(false)}
                className="text-muted-foreground hover:text-foreground text-xs font-bold px-3 py-1 rounded-lg bg-muted/40"
              >
                Close
              </button>
            </div>

            <div>
              <p className="text-xs font-mono text-muted-foreground mb-1">Subject:</p>
              <p className="text-sm font-bold text-foreground bg-muted/30 p-2.5 rounded-lg border border-border/50">{testResult.rendered.subject}</p>
            </div>

            <div>
              <p className="text-xs font-mono text-muted-foreground mb-1">Rendered HTML Output:</p>
              <div className="h-80 overflow-y-auto border border-border/50 rounded-lg p-2 bg-[#0b0f17]">
                <iframe
                  srcDoc={testResult.rendered.html}
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
