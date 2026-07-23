"use client"

import { useState } from "react"
import { Sparkles, Loader2, X } from "lucide-react"
import { toast } from "sonner"
import { ApiClient } from "@/lib/api"

interface AIAssistantButtonProps {
  onGenerate: (content: string) => void
  contextPrompt?: string
  format?: 'text' | 'html'
  className?: string
  label?: string
}

export function AIAssistantButton({ 
  onGenerate, 
  contextPrompt = "Generate some text based on the user's input.",
  format = 'text',
  className = "",
  label = "Generate with AI"
}: AIAssistantButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [prompt, setPrompt] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerate = async () => {
    if (!prompt.trim()) return toast.error("Please enter a prompt for the AI.")
    
    setIsGenerating(true)
    try {
      const response = await ApiClient.post("/ai/generate", {
        prompt,
        systemPrompt: contextPrompt,
        format
      })
      
      onGenerate(response.content)
      setIsOpen(false)
      setPrompt("")
      toast.success("AI Content Generated!")
    } catch (error: any) {
      toast.error(error.message || "Failed to generate AI content. Make sure OpenAI Key is configured.")
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <>
      <button 
        type="button"
        onClick={() => setIsOpen(true)}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-xs font-bold rounded-lg transition-colors border border-indigo-500/20 ${className}`}
      >
        <Sparkles className="w-3.5 h-3.5" />
        {label}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#111] border border-[#222] w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl">
            <div className="flex justify-between items-center p-4 border-b border-[#222]">
              <h3 className="font-bold flex items-center gap-2 text-white">
                <Sparkles className="w-4 h-4 text-indigo-400" /> AI Generator
              </h3>
              <button onClick={() => setIsOpen(false)} className="text-[#666] hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="What would you like the AI to write about?"
                rows={4}
                className="w-full bg-black border border-[#333] rounded-xl p-3 text-white placeholder-[#555] focus:outline-none focus:border-indigo-500 resize-none"
              />
              <div className="mt-4 flex justify-end gap-3">
                <button 
                  onClick={() => setIsOpen(false)} 
                  className="px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/5 transition-colors text-white"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-bold flex items-center gap-2 transition-colors disabled:opacity-50"
                >
                  {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  Generate
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
