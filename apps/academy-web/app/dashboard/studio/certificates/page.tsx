"use client"

import { useState, useEffect, useRef } from "react"
import { Award, Plus, FileText, Image as ImageIcon, Settings, Download, Send, CheckCircle, Edit3, Trash2, AlignLeft, AlignCenter, AlignRight, Move, Type } from "lucide-react"
import { useApi, fetchApi } from "@/lib/useApi"
import { toast } from "sonner"

export interface CertElement {
  id: string
  type: 'text' | 'image' | 'divider' | 'signature' | 'seal'
  name: string
  x: number // percentage 0-100
  y: number // percentage 0-100
  width?: number // px or %
  height?: number // px or %
  text?: string
  fontSize?: number // px
  fontWeight?: 'normal' | 'bold' | '600' | '700'
  color?: string
  textAlign?: 'left' | 'center' | 'right'
  src?: string
  placeholder?: string
}

const DEFAULT_ELEMENTS: CertElement[] = [
  { id: 'logo', type: 'image', name: 'Main Logo', x: 6, y: 5, width: 220, height: 70, src: '', placeholder: 'GreeksAcademy.com' },
  { id: 'top_right_decor', type: 'image', name: 'Top Right Decor', x: 84, y: 0, width: 140, height: 180, src: '' },
  { id: 'cert_title', type: 'text', name: 'Certificate Title', x: 10, y: 26, fontSize: 44, fontWeight: 'bold', color: '#222222', textAlign: 'right', text: 'CERTIFICATE', width: 36 },
  { id: 'cert_subtitle', type: 'text', name: 'Subtitle', x: 10, y: 34, fontSize: 22, fontWeight: 'normal', color: '#444444', textAlign: 'right', text: 'OF COMPLETION', width: 36 },
  { id: 'divider', type: 'divider', name: 'Center Divider', x: 48, y: 25, width: 2, height: 90, color: '#5a8ea3' },
  { id: 'presented_label', type: 'text', name: 'Presented Label', x: 51, y: 27, fontSize: 16, fontWeight: 'normal', color: '#333333', textAlign: 'left', text: 'THIS IS PROUDLY PRESENTED TO', width: 45 },
  { id: 'student_name', type: 'text', name: 'Student Name', x: 51, y: 33, fontSize: 40, fontWeight: 'normal', color: '#4b8ba3', textAlign: 'left', text: '{{STUDENT_NAME}}', width: 45 },
  { id: 'desc_text', type: 'text', name: 'Course Description', x: 10, y: 50, fontSize: 18, fontWeight: 'normal', color: '#333333', textAlign: 'center', text: 'The certificate is presented for completing {{COURSE_NAME}} Course during the period', width: 80 },
  { id: 'course_duration', type: 'text', name: 'Course Duration', x: 10, y: 58, fontSize: 16, fontWeight: 'bold', color: '#333333', textAlign: 'center', text: 'September 2023 to December 2023', width: 80 },
  { id: 'mentor_sig', type: 'signature', name: 'Mentor Signature', x: 12, y: 70, width: 200, height: 60, text: 'Mentor', src: '' },
  { id: 'seal', type: 'seal', name: 'Official Seal', x: 46, y: 70, width: 80, height: 80, text: 'GREEKS ACADEMY\nCoimbatore' },
  { id: 'auth_sig', type: 'signature', name: 'Authorized Signature', x: 68, y: 70, width: 200, height: 60, text: 'Authorized Signature', src: '' },
  { id: 'collab_logos', type: 'text', name: 'Collaboration Logos (URLs)', x: 30, y: 86, fontSize: 12, fontWeight: 'normal', color: '#888888', textAlign: 'center', text: '', width: 40 },
  { id: 'bottom_right_decor', type: 'image', name: 'Bottom Right Decor', x: 88, y: 84, width: 100, height: 100, src: '' },
  { id: 'footer_address', type: 'text', name: 'Footer Address', x: 10, y: 94, fontSize: 11, fontWeight: 'normal', color: '#666666', textAlign: 'center', text: '96/53A, 2nd Cross Street Bharathi Colony, Peelamedu, Coimbatore, Tamil Nadu 641004 : Ph: 9843199556', width: 80 }
]

export default function CertificatesPage() {
  const [activeTab, setActiveTab] = useState<"TEMPLATES" | "ISSUED">("TEMPLATES")
  const [templates, setTemplates] = useState<any[]>([])
  const [issued, setIssued] = useState<any[]>([])
  
  const [showBuilder, setShowBuilder] = useState(false)
  const [templateName, setTemplateName] = useState("New Certificate Template")
  const [elements, setElements] = useState<CertElement[]>(DEFAULT_ELEMENTS)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  
  const canvasRef = useRef<HTMLDivElement>(null)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState<{ startX: number; startY: number; elemX: number; elemY: number }>({ startX: 0, startY: 0, elemX: 0, elemY: 0 })

  useEffect(() => {
    loadTemplates()
  }, [])

  const loadTemplates = async () => {
    try {
      const data = await fetchApi<any[]>('/academy/certificates/templates')
      setTemplates(data)
    } catch (err) {
      console.error(err)
    }
  }

  // Drag logic
  const handleMouseDown = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    setSelectedId(id)
    setDraggingId(id)
    const elem = elements.find(el => el.id === id)
    if (!elem) return
    setDragOffset({
      startX: e.clientX,
      startY: e.clientY,
      elemX: elem.x,
      elemY: elem.y
    })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingId || !canvasRef.current) return
    const rect = canvasRef.current.getBoundingClientRect()
    const dx = ((e.clientX - dragOffset.startX) / rect.width) * 100
    const dy = ((e.clientY - dragOffset.startY) / rect.height) * 100
    
    setElements(prev => prev.map(el => {
      if (el.id === draggingId) {
        return {
          ...el,
          x: Math.max(0, Math.min(95, Math.round(dragOffset.elemX + dx))),
          y: Math.max(0, Math.min(95, Math.round(dragOffset.elemY + dy)))
        }
      }
      return el
    }))
  }

  const handleMouseUp = () => {
    setDraggingId(null)
  }

  const updateSelectedElement = (updates: Partial<CertElement>) => {
    if (!selectedId) return
    setElements(prev => prev.map(el => el.id === selectedId ? { ...el, ...updates } : el))
  }

  const addNewTextElement = () => {
    const newEl: CertElement = {
      id: `text_${Date.now()}`,
      type: 'text',
      name: 'Custom Text',
      x: 40,
      y: 40,
      fontSize: 18,
      fontWeight: 'normal',
      color: '#222222',
      textAlign: 'center',
      text: 'Double click or edit in sidebar',
      width: 30
    }
    setElements(prev => [...prev, newEl])
    setSelectedId(newEl.id)
  }

  const addNewImageElement = () => {
    const newEl: CertElement = {
      id: `img_${Date.now()}`,
      type: 'image',
      name: 'Custom Image',
      x: 40,
      y: 40,
      width: 100,
      height: 100,
      src: ''
    }
    setElements(prev => [...prev, newEl])
    setSelectedId(newEl.id)
  }

  const deleteSelectedElement = () => {
    if (!selectedId) return
    setElements(prev => prev.filter(el => el.id !== selectedId))
    setSelectedId(null)
  }

  const handleSaveTemplate = async () => {
    // Generate clean HTML based on element coordinates and styles
    const elementsHtml = elements.map(el => {
      const posStyle = `position: absolute; left: ${el.x}%; top: ${el.y}%;`
      
      if (el.type === 'text') {
        const style = `${posStyle} font-size: ${el.fontSize || 16}px; font-weight: ${el.fontWeight || 'normal'}; color: ${el.color || '#333'}; text-align: ${el.textAlign || 'left'}; width: ${el.width ? el.width + '%' : 'auto'};`
        return `<div style="${style}">${el.text || ''}</div>`
      }
      
      if (el.type === 'image') {
        if (el.src) {
          return `<img src="${el.src}" style="${posStyle} width: ${el.width}px; height: ${el.height ? el.height + 'px' : 'auto'}; object-fit: contain;" />`
        }
        if (el.id === 'logo') {
          return `<div style="${posStyle} font-size: 28px; font-weight: 700; color: #2c93b6;">Greeks<span style="color:#555">Academy.com</span><div style="font-size: 10px; color: #555; margin-top: 4px; letter-spacing: 1px;">Art | Design | Animation | Programming</div></div>`
        }
        if (el.id === 'top_right_decor') {
          return `<div style="${posStyle} width: 140px; height: 180px; background: linear-gradient(180deg, #4da4bc, #2c6e86); border-bottom-left-radius: 40px; border-bottom-right-radius: 40px; display: flex; justify-content: center; align-items: center;"><svg width="80" height="80" viewBox="0 0 100 100" fill="white" xmlns="http://www.w3.org/2000/svg"><path d="M50 20 L80 35 L50 50 L20 35 Z" fill="white"/><path d="M25 45 V70 L50 85 L75 70 V45 L50 60 Z" fill="white"/><circle cx="50" cy="50" r="25" fill="#2c6e86"/><text x="50" y="65" font-family="Arial" font-weight="bold" font-size="40" fill="white" text-anchor="middle">G</text></svg></div>`
        }
        if (el.id === 'bottom_right_decor') {
          return `<div style="${posStyle} width: 100px; height: 100px; background: radial-gradient(circle at bottom right, #4da4bc 40%, transparent 41%);"></div>`
        }
        return ''
      }

      if (el.type === 'divider') {
        return `<div style="${posStyle} width: ${el.width}px; height: ${el.height}px; background-color: ${el.color};"></div>`
      }

      if (el.type === 'signature') {
        const sigTag = el.id === 'mentor_sig' ? '{{EDUCATOR_SIGNATURE_HTML}}' : '{{ACADEMY_HEAD_SIGNATURE_HTML}}'
        return `
          <div style="${posStyle} width: ${el.width}px; display: flex; flex-direction: column; align-items: center;">
            ${sigTag}
            <div style="width: 100%; height: 1px; background: #333; margin: 8px 0;"></div>
            <div style="font-size: 14px; font-weight: 600; color: #222;">${el.text}</div>
          </div>
        `
      }

      if (el.type === 'seal') {
        return `
          <div style="${posStyle} width: ${el.width}px; height: ${el.height}px; border-radius: 50%; border: 2px dashed #444; display: flex; align-items: center; justify-content: center; font-size: 8px; color: #444; text-align: center; font-weight: bold;">
            GREEKS ACADEMY<br/>Coimbatore
          </div>
        `
      }

      return ''
    }).join('\n')

    const fullHtml = `
      <html>
        <head>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
            body { margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; width: 297mm; height: 210mm; font-family: 'Inter', sans-serif; background: #fff; color: #333; }
            .certificate { position: relative; width: 100%; height: 100%; box-sizing: border-box; background: #fff; overflow: hidden; }
          </style>
        </head>
        <body>
          <div class="certificate">
            ${elementsHtml}
          </div>
        </body>
      </html>
    `

    try {
      await fetchApi('/academy/certificates/templates', {
        method: 'POST',
        body: JSON.stringify({
          name: templateName,
          htmlContent: fullHtml
        })
      })
      toast.success("Template saved successfully!")
      setShowBuilder(false)
      loadTemplates()
    } catch (err) {
      toast.error("Failed to save template")
    }
  }

  const selectedElement = elements.find(el => el.id === selectedId)

  // --- UI Render ---
  if (showBuilder) {
    return (
      <div className="flex h-full bg-[#050505] text-white overflow-hidden select-none">
        {/* Sidebar Controls & Inspector */}
        <div className="w-80 border-r border-white/10 flex flex-col p-6 overflow-y-auto space-y-6">
          <div>
            <h2 className="text-xl font-bold">Visual Certificate Builder</h2>
            <p className="text-sm text-white/50">Drag elements to move & edit properties</p>
          </div>

          <div>
            <label className="text-xs text-white/50 mb-1 block">Template Name</label>
            <input type="text" value={templateName} onChange={e => setTemplateName(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-sm focus:border-purple-500 outline-none" />
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2">
            <button onClick={addNewTextElement} className="flex-1 py-2 px-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-semibold flex items-center justify-center gap-1">
              <Type className="w-3.5 h-3.5" /> Add Text
            </button>
            <button onClick={addNewImageElement} className="flex-1 py-2 px-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-semibold flex items-center justify-center gap-1">
              <ImageIcon className="w-3.5 h-3.5" /> Add Image
            </button>
          </div>

          {/* Inspector Panel */}
          {selectedElement ? (
            <div className="pt-4 border-t border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">{selectedElement.name}</span>
                <button onClick={deleteSelectedElement} className="p-1 text-red-400 hover:bg-red-500/10 rounded">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Text editing */}
              {(selectedElement.type === 'text' || selectedElement.type === 'signature') && (
                <div>
                  <label className="text-xs text-white/50 mb-1 block">Text Content</label>
                  <textarea rows={2} value={selectedElement.text || ''} onChange={e => updateSelectedElement({ text: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-sm focus:border-purple-500 outline-none" />
                </div>
              )}

              {/* Image URL */}
              {(selectedElement.type === 'image' || selectedElement.type === 'signature') && (
                <div>
                  <label className="text-xs text-white/50 mb-1 block">Image URL</label>
                  <input type="text" placeholder="https://..." value={selectedElement.src || ''} onChange={e => updateSelectedElement({ src: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-sm focus:border-purple-500 outline-none" />
                </div>
              )}

              {/* Font Size & Weight */}
              {selectedElement.type === 'text' && (
                <>
                  <div>
                    <div className="flex justify-between text-xs text-white/50 mb-1">
                      <span>Font Size</span>
                      <span>{selectedElement.fontSize || 16}px</span>
                    </div>
                    <input type="range" min={10} max={72} value={selectedElement.fontSize || 16} onChange={e => updateSelectedElement({ fontSize: parseInt(e.target.value) })} className="w-full accent-purple-500" />
                  </div>

                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="text-xs text-white/50 mb-1 block">Color</label>
                      <input type="color" value={selectedElement.color || '#333333'} onChange={e => updateSelectedElement({ color: e.target.value })} className="w-full h-8 rounded bg-transparent cursor-pointer border-0" />
                    </div>
                    <div className="flex-1">
                      <label className="text-xs text-white/50 mb-1 block">Weight</label>
                      <select value={selectedElement.fontWeight || 'normal'} onChange={e => updateSelectedElement({ fontWeight: e.target.value as any })} className="w-full bg-white/5 border border-white/10 rounded-lg p-1.5 text-xs focus:border-purple-500 outline-none">
                        <option value="normal" className="bg-gray-900">Normal</option>
                        <option value="bold" className="bg-gray-900">Bold</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-white/50 mb-1 block">Alignment</label>
                    <div className="flex gap-1 bg-white/5 p-1 rounded-lg border border-white/10">
                      <button onClick={() => updateSelectedElement({ textAlign: 'left' })} className={`flex-1 py-1 flex justify-center rounded ${selectedElement.textAlign === 'left' ? 'bg-purple-600' : 'hover:bg-white/10'}`}>
                        <AlignLeft className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => updateSelectedElement({ textAlign: 'center' })} className={`flex-1 py-1 flex justify-center rounded ${selectedElement.textAlign === 'center' ? 'bg-purple-600' : 'hover:bg-white/10'}`}>
                        <AlignCenter className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => updateSelectedElement({ textAlign: 'right' })} className={`flex-1 py-1 flex justify-center rounded ${selectedElement.textAlign === 'right' ? 'bg-purple-600' : 'hover:bg-white/10'}`}>
                        <AlignRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* Element Width */}
              <div>
                <div className="flex justify-between text-xs text-white/50 mb-1">
                  <span>Width</span>
                  <span>{selectedElement.width || 100}</span>
                </div>
                <input type="range" min={10} max={600} value={selectedElement.width || 100} onChange={e => updateSelectedElement({ width: parseInt(e.target.value) })} className="w-full accent-purple-500" />
              </div>
            </div>
          ) : (
            <div className="pt-8 text-center text-xs text-white/30 italic">
              Click any element on the canvas to inspect and edit its properties
            </div>
          )}

          <div className="mt-auto pt-6 flex gap-2">
            <button onClick={() => setShowBuilder(false)} className="flex-1 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-sm font-semibold">Cancel</button>
            <button onClick={handleSaveTemplate} className="flex-1 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 transition-colors text-sm font-semibold">Save Template</button>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 bg-[#111] flex items-center justify-center p-8 overflow-auto" onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}>
          <div ref={canvasRef} className="bg-white relative shadow-2xl overflow-hidden" style={{ width: '1056px', height: '747px', transform: 'scale(0.85)', transformOrigin: 'center', fontFamily: 'sans-serif' }}>
            
            {elements.map(el => {
              const isSelected = selectedId === el.id
              const posStyle: React.CSSProperties = {
                position: 'absolute',
                left: `${el.x}%`,
                top: `${el.y}%`,
                cursor: draggingId === el.id ? 'grabbing' : 'grab',
                userSelect: 'none'
              }

              return (
                <div key={el.id} onMouseDown={e => handleMouseDown(e, el.id)} style={posStyle} className={`transition-shadow ${isSelected ? 'ring-2 ring-purple-500 ring-offset-2' : 'hover:ring-1 hover:ring-purple-300'}`}>
                  
                  {el.type === 'text' && (
                    <div style={{ fontSize: `${el.fontSize}px`, fontWeight: el.fontWeight, color: el.color, textAlign: el.textAlign, width: el.width ? `${el.width}%` : 'auto' }}>
                      {el.text}
                    </div>
                  )}

                  {el.type === 'image' && (
                    <div>
                      {el.src ? (
                        <img src={el.src} alt={el.name} style={{ width: `${el.width}px`, height: el.height ? `${el.height}px` : 'auto', objectFit: 'contain' }} pointerEvents="none" />
                      ) : el.id === 'logo' ? (
                        <div style={{ fontSize: '28px', fontWeight: 700, color: '#2c93b6' }}>
                          Greeks<span style={{ color: '#555' }}>Academy.com</span>
                          <div style={{ fontSize: '10px', color: '#555', marginTop: '4px', letterSpacing: '1px' }}>Art | Design | Animation | Programming</div>
                        </div>
                      ) : el.id === 'top_right_decor' ? (
                        <div style={{ width: '140px', height: '180px', background: 'linear-gradient(180deg, #4da4bc, #2c6e86)', borderBottomLeftRadius: '40px', borderBottomRightRadius: '40px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                          <svg width="80" height="80" viewBox="0 0 100 100" fill="white" xmlns="http://www.w3.org/2000/svg">
                            <path d="M50 20 L80 35 L50 50 L20 35 Z" fill="white"/>
                            <path d="M25 45 V70 L50 85 L75 70 V45 L50 60 Z" fill="white"/>
                            <circle cx="50" cy="50" r="25" fill="#2c6e86"/>
                            <text x="50" y="65" fontFamily="Arial" fontWeight="bold" fontSize="40" fill="white" textAnchor="middle">G</text>
                          </svg>
                        </div>
                      ) : el.id === 'bottom_right_decor' ? (
                        <div style={{ width: '100px', height: '100px', background: 'radial-gradient(circle at bottom right, #4da4bc 40%, transparent 41%)' }}></div>
                      ) : (
                        <div style={{ width: `${el.width || 100}px`, height: `${el.height || 60}px`, border: '1px dashed #ccc', display: 'flex', alignItems: 'center', justifyCenter: 'center', fontSize: '10px', color: '#999' }}>
                          Image Placeholder
                        </div>
                      )}
                    </div>
                  )}

                  {el.type === 'divider' && (
                    <div style={{ width: `${el.width}px`, height: `${el.height}px`, backgroundColor: el.color }} />
                  )}

                  {el.type === 'signature' && (
                    <div style={{ width: `${el.width}px`, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      {el.src ? (
                        <img src={el.src} alt={el.name} style={{ height: '50px', objectFit: 'contain', marginBottom: '6px' }} />
                      ) : (
                        <div style={{ height: '40px', fontSize: '11px', color: '#999', display: 'flex', alignItems: 'center' }}>Signature Placeholder</div>
                      )}
                      <div style={{ width: '100%', height: '1px', backgroundColor: '#333', marginBottom: '6px' }} />
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#222' }}>{el.text}</div>
                    </div>
                  )}

                  {el.type === 'seal' && (
                    <div style={{ width: `${el.width}px`, height: `${el.height}px`, borderRadius: '50%', border: '2px dashed #444', display: 'flex', alignItems: 'center', justifyCenter: 'center', fontSize: '8px', color: '#444', textAlign: 'center', fontWeight: 'bold' }}>
                      GREEKS ACADEMY<br/>Coimbatore
                    </div>
                  )}

                </div>
              )
            })}

          </div>
        </div>
      </div>
    )
  }

  // Main Dashboard View
  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Certificate Management</h1>
          <p className="text-sm text-white/50">Create templates and manage issued student certificates</p>
        </div>
        <button onClick={() => setShowBuilder(true)} className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors">
          <Plus className="w-4 h-4" /> Create Template
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {templates.map(t => (
          <div key={t.id} className="bg-white/5 border border-white/10 rounded-xl p-5 hover:border-purple-500/50 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <Award className="w-8 h-8 text-purple-400" />
              <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full font-medium">Active</span>
            </div>
            <h3 className="text-lg font-bold text-white mb-1">{t.name}</h3>
            <p className="text-xs text-white/40 mb-4">Created: {new Date(t.createdAt).toLocaleDateString()}</p>
            <div className="flex gap-2">
              <button className="flex-1 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-semibold text-white transition-colors">
                Preview
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
