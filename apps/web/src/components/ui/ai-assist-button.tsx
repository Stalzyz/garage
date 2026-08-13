"use client"

import { useState } from "react"
import { Sparkles, Loader2 } from "lucide-react"
import { fetchApi } from "@/lib/useApi"
import { toast } from "sonner"
import { Modal } from "./modal"

interface AIAssistButtonProps {
  onGenerate: (content: string) => void;
  format?: "text" | "html";
  context?: string;
  buttonClassName?: string;
  buttonLabel?: string;
}

export function AIAssistButton({ 
  onGenerate, 
  format = "text", 
  context = "", 
  buttonClassName = "flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 rounded text-xs font-bold transition-colors disabled:opacity-50 border border-emerald-500/30",
  buttonLabel = "AI Assist"
}: AIAssistButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [prompt, setPrompt] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!prompt.trim()) return

    setIsGenerating(true)
    try {
      const fullPrompt = context ? `Context: ${context}\n\nTask: ${prompt}` : prompt
      const res = await fetchApi<any>("/ai/generate", {
        method: "POST",
        body: JSON.stringify({
          prompt: fullPrompt,
          format
        })
      })
      onGenerate(res.content)
      toast.success("AI content generated successfully!")
      setIsOpen(false)
      setPrompt("")
    } catch (err: any) {
      toast.error(err.message || "Failed to generate content. Have you set your OpenAI API Key?")
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <>
      <button 
        type="button"
        onClick={() => setIsOpen(true)}
        className={buttonClassName}
      >
        <Sparkles className="w-3.5 h-3.5" />
        {buttonLabel}
      </button>

      {isOpen && (
        <Modal onClose={() => !isGenerating && setIsOpen(false)}>
          <div className="w-[500px] p-6 text-left">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">AI Assistant</h2>
                <p className="text-xs text-white/50">What would you like me to write?</p>
              </div>
            </div>

            <form onSubmit={handleGenerate} className="space-y-4">
              <div>
                <textarea
                  autoFocus
                  required
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g. Write an exciting intro for our new summer bootcamp..."
                  className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500 min-h-[120px] resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  disabled={isGenerating}
                  className="px-4 py-2 text-white/70 font-bold rounded-lg hover:bg-white/5 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isGenerating || !prompt.trim()}
                  className="px-5 py-2 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-500 transition-colors text-sm flex items-center shadow-[0_0_15px_rgba(16,185,129,0.3)] disabled:opacity-50"
                >
                  {isGenerating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
                  Generate
                </button>
              </div>
            </form>
          </div>
        </Modal>
      )}
    </>
  )
}
