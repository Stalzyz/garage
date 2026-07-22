"use client"

import { useState } from "react"
import { Mail, Send, Save, Eye, Users, Search, Type, Image as ImageIcon, Layout, Type as TypeIcon, Sparkles, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { fetchApi, useApi } from "@/lib/useApi"

export default function EmailCampaignBuilder() {
  const [subject, setSubject] = useState("")
  const [audience, setAudience] = useState("all")
  const [content, setContent] = useState("<h1 style='color: white; text-align: center;'>Welcome to Grekam</h1>\n<p style='color: #aaa; text-align: center;'>We have exciting news...</p>")
  const [isGenerating, setIsGenerating] = useState(false)

  const handleSend = async () => {
    try {
      await fetchApi("/marketing/campaigns", {
        method: "POST",
        body: JSON.stringify({
          title: subject || "Untitled Campaign",
          type: "EMAIL",
          status: "SCHEDULED",
          targetAudience: audience,
          content: content
        })
      })
      toast.success("Campaign Scheduled successfully!")
    } catch (err: any) {
      toast.error("Failed to schedule campaign")
    }
  }

  const handleAiGenerate = async () => {
    if (!subject) {
      toast.error("Please enter a subject line first")
      return
    }
    setIsGenerating(true)
    try {
      const res = await fetchApi<any>("/ai/generate", {
        method: "POST",
        body: JSON.stringify({
          prompt: `Write an engaging email for this subject: "${subject}".`,
          format: "html"
        })
      })
      setContent(res.content)
      toast.success("AI content generated!")
    } catch (err: any) {
      toast.error(err.message || "Failed to generate AI content")
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="flex flex-col h-full bg-[#050505] text-white overflow-hidden">
      {/* Header */}
      <div className="flex-none px-8 py-6 border-b border-white/10 flex items-center justify-between bg-black/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Email Campaign Builder</h1>
            <p className="text-xs text-white/50 mt-1 font-mono">Marketing &rsaquo; Email</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-5 py-2.5 bg-white/5 text-white font-medium rounded-xl hover:bg-white/10 transition-all border border-white/10">
            <Save className="w-4 h-4" /> Save Draft
          </button>
          <button onClick={handleSend} className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-500 transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)]">
            <Send className="w-4 h-4" /> Send Campaign
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Col - Editor */}
        <div className="w-1/2 flex flex-col border-r border-white/10 bg-black/20">
          
          {/* Settings */}
          <div className="p-6 border-b border-white/10 space-y-4 bg-white/[0.01]">
            <div>
              <label className="text-[10px] text-white/50 uppercase tracking-widest font-bold mb-2 block">Campaign Subject Line</label>
              <input 
                value={subject}
                onChange={e => setSubject(e.target.value)}
                placeholder="e.g. 50% Off Summer Bootcamp!"
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500/50" 
              />
            </div>
            
            <div>
              <label className="text-[10px] text-white/50 uppercase tracking-widest font-bold mb-2 block">Target Audience Segment</label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <select 
                  value={audience}
                  onChange={e => setAudience(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-blue-500/50 appearance-none"
                >
                  <option value="all">All Contacts</option>
                  <option value="leads">Active Leads Only</option>
                  <option value="students">Current Students</option>
                  <option value="alumni">Alumni</option>
                </select>
              </div>
            </div>
          </div>

          {/* HTML Editor (Simplified) */}
          <div className="flex-1 flex flex-col p-6">
            <div className="flex items-center justify-between mb-4">
              <label className="text-[10px] text-white/50 uppercase tracking-widest font-bold">HTML Content</label>
              <div className="flex items-center gap-2">
                <button 
                  onClick={handleAiGenerate}
                  disabled={isGenerating || !subject}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 rounded text-xs font-bold transition-colors disabled:opacity-50 border border-blue-500/30"
                >
                  {isGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                  AI Generate
                </button>
                <div className="w-px h-4 bg-white/10 mx-1"></div>
                <button className="p-1.5 bg-white/5 hover:bg-white/10 rounded text-white/50 hover:text-white"><TypeIcon className="w-3.5 h-3.5" /></button>
                <button className="p-1.5 bg-white/5 hover:bg-white/10 rounded text-white/50 hover:text-white"><ImageIcon className="w-3.5 h-3.5" /></button>
                <button className="p-1.5 bg-white/5 hover:bg-white/10 rounded text-white/50 hover:text-white"><Layout className="w-3.5 h-3.5" /></button>
              </div>
            </div>
            <textarea 
              value={content}
              onChange={e => setContent(e.target.value)}
              className="flex-1 w-full bg-black/60 border border-white/10 rounded-xl p-4 font-mono text-xs text-blue-300 focus:outline-none focus:border-blue-500/50 custom-scrollbar"
              placeholder="<html><body>...</body></html>"
            />
          </div>
        </div>

        {/* Right Col - Live Preview */}
        <div className="w-1/2 flex flex-col bg-[#111]">
          <div className="p-4 border-b border-white/10 flex items-center justify-between bg-black/40">
            <h2 className="text-xs font-bold uppercase tracking-widest text-white/50 flex items-center gap-2">
              <Eye className="w-4 h-4" /> Live Preview
            </h2>
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
              <div className="w-3 h-3 rounded-full bg-amber-500/20 border border-amber-500/50" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500/50" />
            </div>
          </div>
          
          <div className="flex-1 p-8 overflow-auto custom-scrollbar flex justify-center">
            {/* Mock Email Client Window */}
            <div className="w-full max-w-lg bg-white rounded-lg shadow-2xl overflow-hidden flex flex-col h-[600px]">
              <div className="bg-gray-100 border-b border-gray-200 p-4">
                <div className="text-gray-500 text-xs mb-1">From: <span className="text-gray-800 font-medium">Grekam Notifications &lt;noreply@grekam.com&gt;</span></div>
                <div className="text-gray-500 text-xs mb-2">To: <span className="text-gray-800 font-medium">{audience === 'all' ? 'All Contacts' : audience}</span></div>
                <div className="text-gray-800 font-bold text-sm">{subject || "No Subject"}</div>
              </div>
              <div 
                className="flex-1 p-6 overflow-auto bg-black text-white"
                dangerouslySetInnerHTML={{ __html: content }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
