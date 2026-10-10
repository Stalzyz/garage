"use client"

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { 
  Bold, 
  Italic, 
  Strikethrough, 
  Heading1, 
  Heading2, 
  Heading3, 
  List, 
  ListOrdered, 
  Quote, 
  Undo, 
  Redo, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  AlignJustify,
  Type,
  Baseline
} from 'lucide-react'
import { useEffect, useState, useRef, useCallback } from 'react'
import { AIAssistButton } from './ai-assist-button'

const FONT_FAMILIES = [
  { label: 'Default Font', value: '' },
  { label: 'Inter (Modern Sans)', value: 'Inter, sans-serif' },
  { label: 'Outfit (Clean Geometric)', value: 'Outfit, sans-serif' },
  { label: 'Poppins (Bold Modern)', value: 'Poppins, sans-serif' },
  { label: 'Playfair Display (Executive Serif)', value: '"Playfair Display", Georgia, serif' },
  { label: 'JetBrains Mono (Technical / Code)', value: '"JetBrains Mono", monospace' },
  { label: 'Roboto (Neutral Sans)', value: 'Roboto, sans-serif' },
  { label: 'Georgia (Classic Editorial)', value: 'Georgia, serif' },
]

const FONT_SIZES = [
  { label: 'Default Size (15px)', value: '' },
  { label: '12px Small Note', value: '12px' },
  { label: '14px Standard', value: '14px' },
  { label: '16px Medium Body', value: '16px' },
  { label: '18px Large Body', value: '18px' },
  { label: '20px Subtitle', value: '20px' },
  { label: '24px Section Header', value: '24px' },
  { label: '30px Large Heading', value: '30px' },
]

const LINE_SPACINGS = [
  { label: 'Normal Line Height (1.5)', value: '1.5' },
  { label: 'Tight Spacing (1.25)', value: '1.25' },
  { label: 'Comfortable (1.75)', value: '1.75' },
  { label: 'Double Spacing (2.0)', value: '2.0' },
  { label: 'Spacious Presentation (2.25)', value: '2.25' },
]

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

// Helper to extract styled wrapper if present
function parseWrapperStyles(html: string) {
  const match = html.match(/^<div\s+style="([^"]+)">([\s\S]*)<\/div>$/i)
  if (!match) return { font: '', size: '', line: '1.5', align: 'left', innerHtml: html }

  const styleStr = match[1]
  const innerHtml = match[2]

  const fontMatch = styleStr.match(/font-family:\s*([^;]+)/i)
  const sizeMatch = styleStr.match(/font-size:\s*([^;]+)/i)
  const lineMatch = styleStr.match(/line-height:\s*([^;]+)/i)
  const alignMatch = styleStr.match(/text-align:\s*([^;]+)/i)

  return {
    font: fontMatch ? fontMatch[1].trim() : '',
    size: sizeMatch ? sizeMatch[1].trim() : '',
    line: lineMatch ? lineMatch[1].trim() : '1.5',
    align: alignMatch ? alignMatch[1].trim() : 'left',
    innerHtml
  }
}

export function RichTextEditor({ content, onChange, placeholder = "Start typing your proposal content..." }: RichTextEditorProps) {
  const parsed = parseWrapperStyles(content || '')
  
  const [selectedFont, setSelectedFont] = useState(parsed.font)
  const [selectedSize, setSelectedSize] = useState(parsed.size)
  const [selectedLineHeight, setSelectedLineHeight] = useState(parsed.line || '1.5')
  const [selectedAlign, setSelectedAlign] = useState(parsed.align || 'left')

  const emitWrappedContent = useCallback((rawHtml: string, font: string, size: string, line: string, align: string) => {
    if (!rawHtml || rawHtml === '<p></p>') {
      onChange('')
      return
    }
    const styles: string[] = []
    if (font) styles.push(`font-family: ${font}`)
    if (size) styles.push(`font-size: ${size}`)
    if (line) styles.push(`line-height: ${line}`)
    if (align) styles.push(`text-align: ${align}`)

    if (styles.length === 0) {
      onChange(rawHtml)
    } else {
      onChange(`<div style="${styles.join('; ')}">${rawHtml}</div>`)
    }
  }, [onChange])

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
    ],
    content: parsed.innerHtml,
    onUpdate: ({ editor }) => {
      emitWrappedContent(editor.getHTML(), selectedFont, selectedSize, selectedLineHeight, selectedAlign)
    },
    editorProps: {
      attributes: {
        class: 'prose prose-invert prose-violet max-w-none focus:outline-none min-h-[300px] w-full p-4',
      },
    },
  })

  useEffect(() => {
    if (editor) {
      const currentParsed = parseWrapperStyles(content || '')
      if (currentParsed.innerHtml !== editor.getHTML() && content !== editor.getHTML()) {
        editor.commands.setContent(currentParsed.innerHtml)
      }
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
  const toggleH3 = () => editor.chain().focus().toggleHeading({ level: 3 }).run()
  const toggleBulletList = () => editor.chain().focus().toggleBulletList().run()
  const toggleOrderedList = () => editor.chain().focus().toggleOrderedList().run()
  const toggleBlockquote = () => editor.chain().focus().toggleBlockquote().run()

  const handleFontChange = (font: string) => {
    setSelectedFont(font)
    emitWrappedContent(editor.getHTML(), font, selectedSize, selectedLineHeight, selectedAlign)
  }

  const handleSizeChange = (size: string) => {
    setSelectedSize(size)
    emitWrappedContent(editor.getHTML(), selectedFont, size, selectedLineHeight, selectedAlign)
  }

  const handleLineHeightChange = (height: string) => {
    setSelectedLineHeight(height)
    emitWrappedContent(editor.getHTML(), selectedFont, selectedSize, height, selectedAlign)
  }

  const handleAlignChange = (align: string) => {
    setSelectedAlign(align)
    emitWrappedContent(editor.getHTML(), selectedFont, selectedSize, selectedLineHeight, align)
  }

  const ToolbarButton = ({ onClick, isActive = false, icon: Icon, disabled = false, title }: any) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-2 rounded-lg transition-colors flex items-center justify-center ${
        isActive 
          ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30' 
          : 'text-white/60 hover:bg-white/10 hover:text-white border border-transparent'
      } ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
    >
      <Icon className="w-4 h-4" />
    </button>
  )

  return (
    <div className="w-full bg-[#0d0d12] border border-white/10 rounded-xl overflow-hidden flex flex-col focus-within:border-violet-500/50 transition-colors shadow-lg shadow-black/40">
      
      {/* Top Toolbar: Font Selection, Font Size, Line Spacing */}
      <div className="flex flex-wrap items-center gap-2 p-2 bg-[#09090d] border-b border-white/10 text-xs">
        
        {/* Font Family Selector */}
        <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 hover:border-violet-500/30 transition-colors">
          <Type className="w-3.5 h-3.5 text-violet-400 shrink-0" />
          <select
            value={selectedFont}
            onChange={(e) => handleFontChange(e.target.value)}
            className="bg-transparent text-white text-xs focus:outline-none cursor-pointer pr-1"
            title="Font Selection"
          >
            {FONT_FAMILIES.map(f => (
              <option key={f.label} value={f.value} className="bg-[#121218] text-white">
                {f.label}
              </option>
            ))}
          </select>
        </div>

        {/* Font Size Selector */}
        <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 hover:border-violet-500/30 transition-colors">
          <Baseline className="w-3.5 h-3.5 text-violet-400 shrink-0" />
          <select
            value={selectedSize}
            onChange={(e) => handleSizeChange(e.target.value)}
            className="bg-transparent text-white text-xs focus:outline-none cursor-pointer pr-1"
            title="Font Size"
          >
            {FONT_SIZES.map(s => (
              <option key={s.label} value={s.value} className="bg-[#121218] text-white">
                {s.label}
              </option>
            ))}
          </select>
        </div>

        {/* Line Spacing Selector */}
        <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 hover:border-violet-500/30 transition-colors">
          <span className="text-[10px] uppercase font-bold text-violet-400 tracking-wider">Line:</span>
          <select
            value={selectedLineHeight}
            onChange={(e) => handleLineHeightChange(e.target.value)}
            className="bg-transparent text-white text-xs focus:outline-none cursor-pointer pr-1"
            title="Line Spacing"
          >
            {LINE_SPACINGS.map(l => (
              <option key={l.label} value={l.value} className="bg-[#121218] text-white">
                {l.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1" />

        <AIAssistButton 
          format="html"
          onGenerate={(generatedHtml) => {
            editor.commands.insertContent(generatedHtml)
          }}
          buttonLabel="AI Assist"
        />
      </div>

      {/* Formatting & Alignment Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 bg-[#0d0d14] border-b border-white/10">
        <ToolbarButton 
          onClick={toggleBold} 
          isActive={editor.isActive('bold')} 
          icon={Bold} 
          title="Bold (Ctrl+B)"
        />
        <ToolbarButton 
          onClick={toggleItalic} 
          isActive={editor.isActive('italic')} 
          icon={Italic} 
          title="Italic (Ctrl+I)"
        />
        <ToolbarButton 
          onClick={toggleStrike} 
          isActive={editor.isActive('strike')} 
          icon={Strikethrough} 
          title="Strikethrough"
        />
        
        <div className="w-[1px] h-6 bg-white/10 mx-1" />
        
        <ToolbarButton 
          onClick={toggleH1} 
          isActive={editor.isActive('heading', { level: 1 })} 
          icon={Heading1} 
          title="Heading 1"
        />
        <ToolbarButton 
          onClick={toggleH2} 
          isActive={editor.isActive('heading', { level: 2 })} 
          icon={Heading2} 
          title="Heading 2"
        />
        <ToolbarButton 
          onClick={toggleH3} 
          isActive={editor.isActive('heading', { level: 3 })} 
          icon={Heading3} 
          title="Heading 3"
        />
        
        <div className="w-[1px] h-6 bg-white/10 mx-1" />

        {/* Text Alignment */}
        <ToolbarButton 
          onClick={() => handleAlignChange('left')} 
          isActive={selectedAlign === 'left'} 
          icon={AlignLeft} 
          title="Align Left"
        />
        <ToolbarButton 
          onClick={() => handleAlignChange('center')} 
          isActive={selectedAlign === 'center'} 
          icon={AlignCenter} 
          title="Align Center"
        />
        <ToolbarButton 
          onClick={() => handleAlignChange('right')} 
          isActive={selectedAlign === 'right'} 
          icon={AlignRight} 
          title="Align Right"
        />
        <ToolbarButton 
          onClick={() => handleAlignChange('justify')} 
          isActive={selectedAlign === 'justify'} 
          icon={AlignJustify} 
          title="Justify"
        />
        
        <div className="w-[1px] h-6 bg-white/10 mx-1" />
        
        <ToolbarButton 
          onClick={toggleBulletList} 
          isActive={editor.isActive('bulletList')} 
          icon={List} 
          title="Bullet List"
        />
        <ToolbarButton 
          onClick={toggleOrderedList} 
          isActive={editor.isActive('orderedList')} 
          icon={ListOrdered} 
          title="Numbered List"
        />
        <ToolbarButton 
          onClick={toggleBlockquote} 
          isActive={editor.isActive('blockquote')} 
          icon={Quote} 
          title="Blockquote"
        />
        
        <div className="w-[1px] h-6 bg-white/10 mx-1" />
        
        <ToolbarButton 
          onClick={() => editor.chain().focus().undo().run()} 
          disabled={!editor.can().undo()} 
          icon={Undo} 
          title="Undo"
        />
        <ToolbarButton 
          onClick={() => editor.chain().focus().redo().run()} 
          disabled={!editor.can().redo()} 
          icon={Redo} 
          title="Redo"
        />
      </div>

      {/* Editor Content Area */}
      <div 
        className="flex-1 min-h-[300px] max-h-[550px] overflow-y-auto custom-scrollbar bg-black/25 transition-all"
        style={{
          fontFamily: selectedFont || undefined,
          lineHeight: selectedLineHeight || '1.5',
          fontSize: selectedSize || undefined,
          textAlign: (selectedAlign as any) || 'left',
        }}
      >
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}
