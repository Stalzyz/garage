"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, BookOpen, Loader2, AlertCircle, ExternalLink } from "lucide-react"

// ─── Lightweight Markdown Renderer ───────────────────────────────────────────
function renderMarkdown(md: string): string {
  return md
    // Horizontal rules
    .replace(/^---$/gm, '<hr class="border-white/10 my-6" />')
    // H1
    .replace(/^# (.+)$/gm, '<h1 class="text-3xl font-black text-white mt-8 mb-4 leading-tight">$1</h1>')
    // H2
    .replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold text-blue-400 mt-8 mb-3 uppercase tracking-widest border-b border-white/10 pb-2">$1</h2>')
    // H3
    .replace(/^### (.+)$/gm, '<h3 class="text-lg font-bold text-white/90 mt-6 mb-2">$1</h3>')
    // H4
    .replace(/^#### (.+)$/gm, '<h4 class="text-base font-bold text-white/80 mt-4 mb-1">$1</h4>')
    // Blockquote
    .replace(/^> (.+)$/gm, '<blockquote class="border-l-4 border-blue-500/50 pl-4 py-1 my-3 bg-blue-500/5 rounded-r-xl italic text-white/70">$1</blockquote>')
    // Code blocks (``` ... ```)
    .replace(/```[\w]*\n([\s\S]*?)```/g, '<pre class="bg-black/60 border border-white/10 rounded-2xl p-4 my-4 overflow-x-auto text-xs font-mono text-emerald-300/90 leading-relaxed whitespace-pre">$1</pre>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code class="bg-white/10 text-emerald-400 px-1.5 py-0.5 rounded text-sm font-mono">$1</code>')
    // Bold
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-white font-bold">$1</strong>')
    // Italic
    .replace(/\*(.+?)\*/g, '<em class="text-white/80 italic">$1</em>')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-400 underline underline-offset-2 hover:text-blue-300 transition-colors">$1</a>')
    // Checkboxes
    .replace(/^- \[x\] (.+)$/gm, '<li class="flex items-start gap-2 text-white/80 mb-1"><span class="mt-1 w-4 h-4 rounded bg-emerald-600/30 border border-emerald-500/50 flex items-center justify-center flex-shrink-0 text-emerald-400 text-[10px]">✓</span>$1</li>')
    .replace(/^- \[ \] (.+)$/gm, '<li class="flex items-start gap-2 text-white/60 mb-1"><span class="mt-1 w-4 h-4 rounded bg-white/5 border border-white/20 flex-shrink-0"></span>$1</li>')
    // Unordered list items
    .replace(/^[-*] (.+)$/gm, '<li class="text-white/80 mb-1 pl-1">• $1</li>')
    // Ordered list items
    .replace(/^\d+\. (.+)$/gm, '<li class="text-white/80 mb-1 pl-1 list-decimal list-inside">$1</li>')
    // Paragraphs (lines with content not starting with a tag)
    .replace(/^(?!<[hbplicu]|#{1,4} |---|\s*$)(.+)$/gm, '<p class="text-white/70 leading-relaxed mb-2">$1</p>')
    // Clean up li orphans — wrap consecutive <li> in <ul>
    .replace(/(<li[^>]*>[\s\S]*?<\/li>\n?)+/g, (match) => `<ul class="my-3 space-y-0.5">${match}</ul>`)
    // Double newlines → spacing
    .replace(/\n\n/g, '\n')
}

const DOC_TITLES: Record<string, string> = {
  "MASTER_INDEX": "Master Index — Full Document Library",
  "culture_deck": "Culture Deck",
  "bdm_hiring_process": "BDM Hiring & Interview Playbook",
  "bdm_90day_playbook": "BDM 90-Day Onboarding Playbook",
  "developer_90day_playbook": "Developer 90-Day Playbook",
  "designer_90day_playbook": "Designer 90-Day Playbook",
  "support_90day_playbook": "Support 90-Day Playbook",
  "grafty_training_playbook": "Grafty Training Playbook",
  "atlas_training_playbook": "Atlas Training Playbook",
  "web_dev_sales_guide": "Web Dev Sales Guide",
  "calling_script": "Calling Script",
  "whatsapp_scripts": "WhatsApp Scripts",
  "lead_qualification_form": "Lead Qualification Form",
  "objection_handbook": "Objection Handbook",
  "proposal_templates": "Proposal Templates",
  "customer_onboarding_sop": "Customer Onboarding SOP",
  "sales_dev_handoff_sop": "Sales-to-Dev Handoff SOP",
  "escalation_sop": "Escalation SOP",
  "kpi_dashboard": "KPI Dashboard Guide",
  "financial_model": "Financial Model & Growth Targets",
  "grafty_landing_page_copy": "Grafty Landing Page Copy Specs",
  "atlas_landing_page_copy": "Atlas Landing Page Copy Specs",
  "role_checklists": "Role Checklists",
  "evaluation_tests": "Evaluation & Certification Tests",
  "grekam_os_bible": "Grekam OS Bible",
}

export default function DocViewerPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string

  const [content, setContent] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!slug) return
    setLoading(true)
    setError(null)
    fetch(`/api/docs/${slug}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) setError(data.error)
        else setContent(data.content)
      })
      .catch(() => setError("Failed to load document."))
      .finally(() => setLoading(false))
  }, [slug])

  const title = DOC_TITLES[slug] || slug.replace(/_/g, " ").replace(/-/g, " ")

  return (
    <div className="flex flex-col h-full bg-[#050505] text-white overflow-hidden">
      {/* Header */}
      <div className="flex-none px-6 py-4 border-b border-white/10 flex items-center justify-between gap-4 bg-black/30">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => router.push("/dashboard/kb")}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all text-sm font-medium shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to KB
          </button>
          <div className="h-6 w-px bg-white/10 shrink-0" />
          <div className="flex items-center gap-2 min-w-0">
            <BookOpen className="w-4 h-4 text-blue-400 shrink-0" />
            <h1 className="text-sm font-bold text-white truncate">{title}</h1>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest hidden md:block">
            Company Playbooks & SOPs
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {loading && (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            <p className="text-white/40 text-sm">Loading document...</p>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <AlertCircle className="w-10 h-10 text-red-400" />
            <p className="text-white/60 text-sm">{error}</p>
            <button
              onClick={() => router.push("/dashboard/kb")}
              className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white/70 hover:bg-white/10 transition-all"
            >
              Return to Knowledge Base
            </button>
          </div>
        )}

        {!loading && !error && content && (
          <div className="max-w-4xl mx-auto px-6 md:px-10 py-8 md:py-12">
            {/* Document badge */}
            <div className="flex items-center gap-2 mb-8">
              <span className="text-[10px] font-black uppercase tracking-widest text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full">
                Grekam OS Internal Document
              </span>
            </div>

            {/* Rendered markdown */}
            <div
              className="prose-grekam"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
            />

            {/* Footer */}
            <div className="mt-16 pt-8 border-t border-white/10 flex items-center justify-between">
              <button
                onClick={() => router.push("/dashboard/kb")}
                className="flex items-center gap-2 text-white/40 hover:text-white/70 transition-colors text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Knowledge Base
              </button>
              <p className="text-[10px] font-mono text-white/20 uppercase tracking-widest">
                {slug}.md
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
