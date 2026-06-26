"use client"

import { useApi, fetchApi } from "@/lib/useApi"
import { useState } from "react"
import { Calendar as CalendarIcon, Sparkles, Send, Loader2, Clock, CheckCircle2 } from "lucide-react"

const Linkedin = (props: any) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
)

const Twitter = (props: any) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
)

const Instagram = (props: any) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
)

export default function ContentSchedulerPage() {
  const { data: postsData, mutate, isLoading: isPostsLoading } = useApi<any>("/marketing/social")
  const posts = postsData?.data || []

  const [topic, setTopic] = useState("")
  const [platform, setPlatform] = useState("LinkedIn")
  const [tone, setTone] = useState("Professional")
  const [generatedContent, setGeneratedContent] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  
  const [scheduledDate, setScheduledDate] = useState("")
  const [isScheduling, setIsScheduling] = useState(false)

  const handleGenerate = async () => {
    if (!topic) return;
    setIsGenerating(true);
    try {
      const res = await fetchApi<any>("/marketing/social/generate", {
        method: "POST",
        body: JSON.stringify({ topic, platform, tone })
      });
      setGeneratedContent(res.content);
    } catch (err) {
      console.error(err);
      alert("Failed to generate content.");
    } finally {
      setIsGenerating(false);
    }
  }

  const handleSchedule = async () => {
    if (!generatedContent || !scheduledDate) return;
    setIsScheduling(true);
    try {
      await fetchApi("/marketing/social/schedule", {
        method: "POST",
        body: JSON.stringify({
          platform,
          content: generatedContent,
          scheduledFor: new Date(scheduledDate).toISOString(),
          status: 'SCHEDULED'
        })
      });
      setGeneratedContent("");
      setTopic("");
      setScheduledDate("");
      mutate();
    } catch (err) {
      console.error(err);
      alert("Failed to schedule post.");
    } finally {
      setIsScheduling(false);
    }
  }

  const getPlatformIcon = (plat: string) => {
    if (plat === 'LinkedIn') return <Linkedin className="w-4 h-4" />
    if (plat === 'Instagram') return <Instagram className="w-4 h-4" />
    return <Twitter className="w-4 h-4" />
  }

  return (
    <div className="max-w-7xl mx-auto flex flex-col h-[calc(100vh-8rem)]">
      <div className="mb-6 flex justify-between items-end shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Content Scheduler</h1>
          <p className="text-white/50 text-sm">Generate and schedule AI-powered social media posts.</p>
        </div>
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Column: AI Generator */}
        <div className="flex flex-col gap-6 overflow-y-auto custom-scrollbar pr-2 pb-8">
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" /> AI Composer
            </h2>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-white/50 mb-2">What is the post about?</label>
                <textarea 
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. 5 reasons why UI/UX is crucial for SaaS startups..."
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all min-h-[100px] resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-white/50 mb-2">Platform</label>
                  <select 
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="LinkedIn">LinkedIn</option>
                    <option value="Instagram">Instagram</option>
                    <option value="Twitter">Twitter</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-white/50 mb-2">Tone</label>
                  <select 
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="Professional">Professional</option>
                    <option value="Casual">Casual</option>
                    <option value="Inspirational">Inspirational</option>
                    <option value="Educational">Educational</option>
                  </select>
                </div>
              </div>

              <button 
                onClick={handleGenerate}
                disabled={!topic || isGenerating}
                className="w-full py-3 bg-white text-black font-bold rounded-xl hover:bg-slate-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {isGenerating ? "Generating Magic..." : "Generate Post"}
              </button>
            </div>

            {/* Generated Output */}
            {generatedContent && (
              <div className="pt-6 border-t border-white/10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <label className="block text-xs font-bold uppercase tracking-widest text-purple-400 mb-2">Generated Output</label>
                <textarea 
                  value={generatedContent}
                  onChange={(e) => setGeneratedContent(e.target.value)}
                  className="w-full bg-purple-500/10 border border-purple-500/30 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all min-h-[150px]"
                />
                
                <div className="mt-4 flex gap-4">
                  <input 
                    type="datetime-local" 
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="flex-1 bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                  <button 
                    onClick={handleSchedule}
                    disabled={!scheduledDate || isScheduling}
                    className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    {isScheduling ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    Schedule
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Scheduled Pipeline */}
        <div className="flex flex-col h-full overflow-hidden bg-white/5 border border-white/10 rounded-3xl">
          <div className="p-6 border-b border-white/10 bg-black/20 shrink-0">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-blue-400" /> Content Pipeline
            </h2>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4">
            {isPostsLoading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="w-6 h-6 animate-spin text-white/50" />
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-10 text-white/40">
                No posts scheduled. Generate one to get started!
              </div>
            ) : (
              posts.map((post: any) => (
                <div key={post.id} className="bg-black/40 border border-white/10 rounded-2xl p-4 hover:border-white/20 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-md ${post.platform === 'LinkedIn' ? 'bg-blue-600' : post.platform === 'Instagram' ? 'bg-pink-600' : 'bg-sky-500'}`}>
                        {getPlatformIcon(post.platform)}
                      </div>
                      <span className="text-xs font-bold uppercase tracking-widest text-white/50">{post.platform}</span>
                    </div>
                    {post.status === 'PUBLISHED' ? (
                      <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full border border-emerald-400/20">
                        <CheckCircle2 className="w-3 h-3" /> Published
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded-full border border-blue-400/20">
                        <Clock className="w-3 h-3" /> Scheduled
                      </span>
                    )}
                  </div>
                  
                  <p className="text-sm text-white/80 whitespace-pre-wrap mb-4">{post.content}</p>
                  
                  <div className="flex items-center justify-between text-xs text-white/40 border-t border-white/5 pt-3">
                    <span>{new Date(post.scheduledFor).toLocaleString()}</span>
                    <button className="hover:text-white transition-colors">Edit</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
