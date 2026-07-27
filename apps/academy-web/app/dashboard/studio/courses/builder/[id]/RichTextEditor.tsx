"use client"

import { useState, useEffect, useRef } from "react"
import { Bold, Italic, Underline, List, ListOrdered, Heading1, Heading2, Loader2, Wand2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface RichTextEditorProps {
  initialContent: string
  onChange: (content: string) => void
  isSaving?: boolean
}

export function RichTextEditor({ initialContent, onChange, isSaving }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const contentInitialized = useRef(false)

  const debounceTimeout = useRef<NodeJS.Timeout | null>(null)

  // Initialize content only once when component mounts
  useEffect(() => {
    if (editorRef.current && !contentInitialized.current) {
      editorRef.current.innerHTML = initialContent || "<p><br/></p>"
      contentInitialized.current = true
    }
  }, [initialContent])

  const handleInput = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current)
      debounceTimeout.current = setTimeout(() => {
        onChange(html)
      }, 1000)
    }
  }

  const execCommand = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value)
    editorRef.current?.focus()
    handleInput()
  }

  const handleGenerateAI = async () => {
    setIsGenerating(true)
    try {
      // Simulate an AI generation call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const newHtml = `
        <h2>Introduction to the Module</h2>
        <p>This is generated AI content designed to give your students a solid foundation. You can edit this text however you like!</p>
        <ul>
          <li><strong>Point 1:</strong> Understanding the basics.</li>
          <li><strong>Point 2:</strong> Applying the concepts in real-world scenarios.</li>
        </ul>
      `
      
      if (editorRef.current) {
        editorRef.current.innerHTML = newHtml
        onChange(newHtml)
      }
      toast.success("AI Content Generated!")
    } catch (error) {
      toast.error("Failed to generate content.")
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="w-full border border-white/10 rounded-xl bg-white/5 overflow-hidden flex flex-col group focus-within:border-purple-500/50 transition-colors">
      
      {/* Toolbar */}
      <div className="h-12 border-b border-white/10 bg-black/40 flex items-center justify-between px-2 shrink-0">
        <div className="flex items-center gap-1">
          <ToolbarButton icon={<Bold className="w-4 h-4" />} onClick={() => execCommand("bold")} title="Bold" />
          <ToolbarButton icon={<Italic className="w-4 h-4" />} onClick={() => execCommand("italic")} title="Italic" />
          <ToolbarButton icon={<Underline className="w-4 h-4" />} onClick={() => execCommand("underline")} title="Underline" />
          <div className="w-px h-4 bg-white/10 mx-1" />
          <ToolbarButton icon={<Heading1 className="w-4 h-4" />} onClick={() => execCommand("formatBlock", "H1")} title="Heading 1" />
          <ToolbarButton icon={<Heading2 className="w-4 h-4" />} onClick={() => execCommand("formatBlock", "H2")} title="Heading 2" />
          <div className="w-px h-4 bg-white/10 mx-1" />
          <ToolbarButton icon={<List className="w-4 h-4" />} onClick={() => execCommand("insertUnorderedList")} title="Bullet List" />
          <ToolbarButton icon={<ListOrdered className="w-4 h-4" />} onClick={() => execCommand("insertOrderedList")} title="Numbered List" />
        </div>

        <div className="flex items-center gap-2">
          {isSaving && <Loader2 className="w-4 h-4 animate-spin text-white/50" />}
          
          <button 
            onClick={handleGenerateAI}
            disabled={isGenerating}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30 text-xs font-bold transition-colors border border-indigo-500/30 disabled:opacity-50"
          >
            {isGenerating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
            AI Write
          </button>
        </div>
      </div>

      {/* Editor Area */}
      <div 
        ref={editorRef}
        onInput={handleInput}
        className="min-h-[300px] max-h-[500px] overflow-y-auto p-6 text-white/80 focus:outline-none custom-scrollbar prose prose-invert prose-p:leading-relaxed prose-headings:font-bold prose-a:text-purple-400"
        contentEditable
        suppressContentEditableWarning
      />
    </div>
  )
}

function ToolbarButton({ icon, onClick, title }: { icon: React.ReactNode, onClick: () => void, title: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center text-white/70 hover:text-white transition-colors"
    >
      {icon}
    </button>
  )
}
