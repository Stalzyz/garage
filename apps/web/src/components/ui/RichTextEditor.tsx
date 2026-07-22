"use client"

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Bold, Italic, List, ListOrdered, Heading1, Heading2, Quote, Undo, Redo, Strikethrough } from 'lucide-react'
import { useEffect } from 'react'
import { AIAssistButton } from './ai-assist-button'

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

export function RichTextEditor({ content, onChange, placeholder = "Start typing your proposal content..." }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-invert prose-violet max-w-none focus:outline-none min-h-[300px] w-full p-4',
      },
    },
  })

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content)
    }
  }, [content, editor])

  if (!editor) {
    return null
  }

  const toggleBold = () => editor.chain().focus().toggleBold().run()
  const toggleItalic = () => editor.chain().focus().toggleItalic().run()
  const toggleStrike = () => editor.chain().focus().toggleStrike().run()
  const toggleH1 = () => editor.chain().focus().toggleHeading({ level: 1 }).run()
  const toggleH2 = () => editor.chain().focus().toggleHeading({ level: 2 }).run()
  const toggleBulletList = () => editor.chain().focus().toggleBulletList().run()
  const toggleOrderedList = () => editor.chain().focus().toggleOrderedList().run()
  const toggleBlockquote = () => editor.chain().focus().toggleBlockquote().run()

  const ToolbarButton = ({ onClick, isActive = false, icon: Icon, disabled = false }: any) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`p-2 rounded-lg transition-colors flex items-center justify-center ${
        isActive 
          ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30' 
          : 'text-white/50 hover:bg-white/10 hover:text-white border border-transparent'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <Icon className="w-4 h-4" />
    </button>
  )

  return (
    <div className="w-full bg-white/5 border border-white/10 rounded-xl overflow-hidden flex flex-col focus-within:border-violet-500/50 transition-colors">
      
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 bg-[#0a0a0f] border-b border-white/10">
        <ToolbarButton 
          onClick={toggleBold} 
          isActive={editor.isActive('bold')} 
          icon={Bold} 
        />
        <ToolbarButton 
          onClick={toggleItalic} 
          isActive={editor.isActive('italic')} 
          icon={Italic} 
        />
        <ToolbarButton 
          onClick={toggleStrike} 
          isActive={editor.isActive('strike')} 
          icon={Strikethrough} 
        />
        
        <div className="w-[1px] h-6 bg-white/10 mx-1" />
        
        <ToolbarButton 
          onClick={toggleH1} 
          isActive={editor.isActive('heading', { level: 1 })} 
          icon={Heading1} 
        />
        <ToolbarButton 
          onClick={toggleH2} 
          isActive={editor.isActive('heading', { level: 2 })} 
          icon={Heading2} 
        />
        
        <div className="w-[1px] h-6 bg-white/10 mx-1" />
        
        <ToolbarButton 
          onClick={toggleBulletList} 
          isActive={editor.isActive('bulletList')} 
          icon={List} 
        />
        <ToolbarButton 
          onClick={toggleOrderedList} 
          isActive={editor.isActive('orderedList')} 
          icon={ListOrdered} 
        />
        <ToolbarButton 
          onClick={toggleBlockquote} 
          isActive={editor.isActive('blockquote')} 
          icon={Quote} 
        />
        
        <div className="w-[1px] h-6 bg-white/10 mx-1" />
        
        <ToolbarButton 
          onClick={() => editor.chain().focus().undo().run()} 
          disabled={!editor.can().undo()} 
          icon={Undo} 
        />
        <ToolbarButton 
          onClick={() => editor.chain().focus().redo().run()} 
          disabled={!editor.can().redo()} 
          icon={Redo} 
        />

        <div className="flex-1" />
        
        <AIAssistButton 
          format="html"
          onGenerate={(generatedHtml) => {
            // Append the generated HTML to the current content, or you could insert at cursor
            editor.commands.insertContent(generatedHtml)
          }}
          buttonLabel="AI Assist"
        />
      </div>

      {/* Editor Content */}
      <div className="flex-1 max-h-[500px] overflow-y-auto custom-scrollbar bg-black/20">
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}
