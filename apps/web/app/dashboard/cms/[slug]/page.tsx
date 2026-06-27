"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Save, Plus, Bot, Sparkles, Code, Braces, Layout, Trash, GripVertical, Globe, ArrowUp, ArrowDown } from "lucide-react"
import { ComponentRegistry } from "@/components/cms/registry"

export default function CMSPageEditor() {
  const { slug } = useParams()
  const router = useRouter()
  
  const [page, setPage] = useState<any>(null)
  const [sections, setSections] = useState<any[]>([])
  const [activeSection, setActiveSection] = useState<any>(null)
  const [content, setContent] = useState<any>("")
  const [mode, setMode] = useState<'visual' | 'json' | 'html' | 'preview'>('visual')
  
  const [isSaving, setIsSaving] = useState(false)
  const [newSectionId, setNewSectionId] = useState("")
  
  // AI State
  const [aiPrompt, setAiPrompt] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)

  // Pro Builder State
  const [selectedNodeIdx, setSelectedNodeIdx] = useState<number | null>(null)

  useEffect(() => {
    fetchPage()
  }, [slug])

  const fetchPage = () => {
    fetch(`/api/v1/cms/pages/${slug}`)
      .then(res => res.json())
      .then(data => {
        if (!data.data) {
          setPage({ notFound: true })
          return
        }
        setPage(data.data)
        setSections(data.data?.sections || [])
        if (data.data?.sections?.length > 0 && !activeSection) {
          selectSection(data.data.sections[0])
        }
      })
      .catch(err => {
        console.error(err)
        setPage({ notFound: true })
      })
  }

  const selectSection = (section: any) => {
    setActiveSection(section)
    
    if (section.sectionId === 'canvas' && Array.isArray(section.content)) {
      setMode('visual')
      setContent(section.content)
    } else if (section.content?.type === 'html' && section.content?.html) {
      setMode('html')
      setContent(section.content.html)
    } else if (section.sectionId === 'cards' && Array.isArray(section.content)) {
      setMode('visual')
      setContent(section.content)
    } else {
      setMode('json')
      setContent(JSON.stringify(section.content, null, 2))
    }
  }

  const handleSave = async () => {
    if (!activeSection) return
    setIsSaving(true)
    
    let finalContent;
    try {
      if (mode === 'json') {
        finalContent = JSON.parse(content)
      } else if (mode === 'html') {
        finalContent = { type: 'html', html: content }
      } else {
        finalContent = content // Array of cards from visual builder
      }
    } catch (parseErr: any) {
      alert("JSON Syntax Error: " + parseErr.message + "\n\nPlease fix your JSON format before saving.")
      setIsSaving(false)
      return
    }

    try {
      const res = await fetch(`/api/v1/cms/pages/${slug}/sections/${activeSection.sectionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: finalContent })
      })
      if (!res.ok) {
        throw new Error(`Server responded with status: ${res.status}`)
      }
      alert("Saved successfully!")
      fetchPage()
    } catch (err: any) {
      console.error("Save Error:", err)
      alert("Failed to save: " + err.message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCreateSection = async () => {
    if (!newSectionId) {
      alert("Please type a section name (e.g. 'cards') before clicking the plus button.");
      return;
    }
    try {
      // If it's named 'cards' or 'canvas', default it to an array for the visual builder
      const initContent = (newSectionId === 'cards' || newSectionId === 'canvas') ? [] : { type: 'html', html: '<div></div>' };
      
      await fetch(`/api/v1/cms/pages/${slug}/sections`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sectionId: newSectionId, content: initContent })
      })
      setNewSectionId("")
      fetchPage()
    } catch (err) {
      console.error(err)
    }
  }

  const generateWithAI = async () => {
    if (!aiPrompt) return
    setIsGenerating(true)
    try {
      const res = await fetch(`/api/v1/cms/ai-generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiPrompt })
      })
      const { data } = await res.json()
      
      setMode('html')
      setContent(data.html)
      setAiPrompt("")
    } catch (err) {
      alert("AI Generation failed.")
    } finally {
      setIsGenerating(false)
    }
  }

  // Visual Builder Helpers
  const updateCard = (index: number, field: string, value: string) => {
    const newContent = [...content];
    newContent[index] = { ...newContent[index], [field]: value };
    setContent(newContent);
  }

  const addCard = () => {
    setContent([...content, { 
      id: `c_${Date.now()}`, 
      category: "New Service", 
      title: "Untitled", 
      subtitle: "Description goes here.", 
      iconName: "Sparkles", 
      colorHex: "#4ade80",
      cta: "Learn More",
      isContactForm: false
    }]);
  }

  const removeCard = (index: number) => {
    setContent(content.filter((_: any, i: number) => i !== index));
  }

  // Pro Builder Helpers
  const addComponent = (componentId: string) => {
    const CompDef = ComponentRegistry[componentId]
    if (!CompDef) return
    const defaultProps: any = {}
    CompDef.props.forEach(p => { defaultProps[p.name] = p.defaultValue })
    
    setContent([...(Array.isArray(content) ? content : []), {
      id: `node_${Date.now()}`,
      componentId,
      props: defaultProps
    }])
  }

  const updateComponentProp = (idx: number, propName: string, value: any) => {
    const newContent = [...content]
    newContent[idx] = {
      ...newContent[idx],
      props: {
        ...newContent[idx].props,
        [propName]: value
      }
    }
    setContent(newContent)
  }

  const removeComponent = (idx: number) => {
    const newContent = [...content]
    newContent.splice(idx, 1)
    setContent(newContent)
    if (selectedNodeIdx === idx) setSelectedNodeIdx(null)
  }

  const moveComponent = (idx: number, dir: -1 | 1) => {
    if (idx + dir < 0 || idx + dir >= content.length) return
    const newContent = [...content]
    const temp = newContent[idx]
    newContent[idx] = newContent[idx + dir]
    newContent[idx + dir] = temp
    setContent(newContent)
    if (selectedNodeIdx === idx) setSelectedNodeIdx(idx + dir)
    else if (selectedNodeIdx === idx + dir) setSelectedNodeIdx(idx)
  }

  if (page?.notFound) return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)] bg-slate-50 text-slate-500">
      <Globe className="w-16 h-16 mb-4 text-slate-300" />
      <h2 className="text-xl font-bold text-slate-900 mb-2">Page Not Found</h2>
      <p className="mb-4">The CMS page '{slug}' does not exist.</p>
      <button onClick={() => router.push('/dashboard/cms')} className="px-6 py-2 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800">Return to Pages Builder</button>
    </div>
  )

  if (!page) return <div className="p-12 text-center text-slate-500 animate-pulse">Loading CMS Engine...</div>

  const isCardsSection = activeSection?.sectionId === 'cards';
  const isCanvasSection = activeSection?.sectionId === 'canvas';

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-slate-100 rounded-lg">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Editing: {page.title}</h1>
            <p className="text-xs text-slate-500">/{page.slug}</p>
          </div>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-2 bg-slate-900 text-white rounded-lg text-sm font-bold shadow-md hover:bg-slate-800 disabled:opacity-50 flex items-center gap-2"
        >
          <Save className="w-4 h-4" /> {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r border-slate-200 flex flex-col">
          <div className="p-4 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Sections</h3>
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="new_section"
                value={newSectionId}
                onChange={(e) => setNewSectionId(e.target.value)}
                className="flex-1 text-sm border border-slate-200 rounded px-2 py-1 outline-none focus:border-slate-900"
              />
              <button onClick={handleCreateSection} className="p-1.5 bg-slate-100 rounded hover:bg-slate-200">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[10px] text-slate-400 mt-2 italic flex flex-col gap-1">
              <span>Name section 'cards' for legacy cards.</span>
              <span className="text-blue-500 font-bold">Name section 'canvas' to use the new Pro Builder!</span>
            </p>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {sections.map(section => (
              <button 
                key={section.id}
                onClick={() => selectSection(section)}
                className={`w-full text-left px-4 py-2.5 rounded-lg text-sm mb-1 transition-colors ${activeSection?.id === section.id ? 'bg-[#49ABC9]/10 text-[#49ABC9] font-bold' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                {section.sectionId}
              </button>
            ))}
            {sections.length === 0 && <div className="p-4 text-sm text-slate-400 text-center">No sections created yet.</div>}
          </div>
        </div>

        {/* Editor Area */}
        <div className="flex-1 flex flex-col bg-slate-50 p-6 min-h-0 overflow-hidden gap-4">
          
          {/* AI Generator Box (Hidden in Visual Mode) */}
          {mode !== 'visual' && (
            <div className="bg-white rounded-2xl shadow-sm border border-purple-200 p-2 pl-4 flex items-center gap-4 shrink-0">
              <Bot className="w-6 h-6 text-purple-500 shrink-0" />
              <input 
                type="text" 
                placeholder="Describe what you want to build (e.g. 'Generate a modern pricing table with 3 tiers')..."
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none text-slate-700 text-sm"
                onKeyDown={e => e.key === 'Enter' && generateWithAI()}
              />
              <button 
                onClick={generateWithAI}
                disabled={isGenerating || !aiPrompt}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold rounded-xl flex items-center gap-2 disabled:opacity-50 transition-colors shrink-0"
              >
                {isGenerating ? <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" /> : <Sparkles className="w-4 h-4" />}
                Generate HTML
              </button>
            </div>
          )}

          {activeSection ? (
            <div className="flex-1 min-h-0 flex flex-col bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              
              {/* Editor Toolbar */}
              <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-4">
                  <span className="font-mono text-sm font-bold text-slate-700">{activeSection.sectionId}</span>
                  <div className="flex items-center bg-slate-200 rounded-lg p-0.5">
                    {(isCardsSection || isCanvasSection) && (
                      <button 
                        onClick={() => { setMode('visual'); setContent(typeof content === 'string' ? JSON.parse(content || '[]') : content); }}
                        className={`px-3 py-1 rounded-md text-xs font-bold flex items-center gap-1.5 transition-colors ${mode === 'visual' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                      >
                        <Layout className="w-3 h-3" /> Visual Builder
                      </button>
                    )}
                    <button 
                      onClick={() => { setMode('json'); setContent(typeof content !== 'string' ? JSON.stringify(content, null, 2) : content); }}
                      className={`px-3 py-1 rounded-md text-xs font-bold flex items-center gap-1.5 transition-colors ${mode === 'json' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      <Braces className="w-3 h-3" /> JSON Data
                    </button>
                    <button 
                      onClick={() => { setMode('html'); setContent(typeof content !== 'string' ? '' : content); }}
                      className={`px-3 py-1 rounded-md text-xs font-bold flex items-center gap-1.5 transition-colors ${mode === 'html' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      <Code className="w-3 h-3" /> Raw HTML
                    </button>
                    <button 
                      onClick={() => { setMode('preview'); setContent(typeof content !== 'string' ? '' : content); }}
                      className={`px-3 py-1 rounded-md text-xs font-bold flex items-center gap-1.5 transition-colors ${mode === 'preview' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      <Layout className="w-3 h-3" /> Preview
                    </button>
                  </div>
                </div>
              </div>

              {/* Editor Content Area */}
              {mode === 'visual' ? (
                isCanvasSection ? (
                  <div className="flex-1 min-h-0 flex bg-slate-100 relative overflow-hidden">
                    {/* Component Palette */}
                    <div className="w-64 bg-white border-r border-slate-200 p-4 overflow-y-auto flex flex-col gap-2 shrink-0">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Add Component</h4>
                      {Object.keys(ComponentRegistry).map(compKey => (
                        <button key={compKey} onClick={() => addComponent(compKey)} className="text-left p-3 rounded-lg border border-slate-200 hover:border-[#49ABC9] hover:bg-[#49ABC9]/5 transition-all">
                          <div className="font-bold text-sm text-slate-800">{ComponentRegistry[compKey].name}</div>
                          <div className="text-[10px] text-slate-500 mt-1">{ComponentRegistry[compKey].description}</div>
                        </button>
                      ))}
                    </div>

                    {/* Canvas & Inspector */}
                    <div className="flex-1 flex overflow-hidden">
                       <div className="flex-1 overflow-y-auto p-0 md:p-8 relative">
                          <div className="mx-auto flex flex-col w-full bg-white shadow-sm border border-slate-200 min-h-full">
                            {Array.isArray(content) && content.length === 0 && (
                               <div className="text-center p-12 text-slate-400">
                                  Drag or click components from the sidebar to build your page.
                               </div>
                            )}
                            {Array.isArray(content) && content.map((node, idx) => {
                               const CompDef = ComponentRegistry[node.componentId];
                               if (!CompDef) return null;
                               return (
                                 <div key={node.id} className={`relative group border-2 transition-colors ${selectedNodeIdx === idx ? 'border-blue-500' : 'border-transparent hover:border-blue-300'}`}>
                                    <div className="absolute top-2 right-2 hidden group-hover:flex items-center gap-1 bg-white shadow-md border border-slate-200 rounded-lg p-1 z-20">
                                       <button onClick={() => moveComponent(idx, -1)} className="p-1.5 hover:bg-slate-100 rounded text-slate-500"><ArrowUp className="w-4 h-4" /></button>
                                       <button onClick={() => moveComponent(idx, 1)} className="p-1.5 hover:bg-slate-100 rounded text-slate-500"><ArrowDown className="w-4 h-4" /></button>
                                       <button onClick={() => removeComponent(idx)} className="p-1.5 hover:bg-red-50 rounded text-red-500"><Trash className="w-4 h-4" /></button>
                                    </div>
                                    <div onClick={() => setSelectedNodeIdx(idx)} className="cursor-pointer w-full pointer-events-none">
                                        <CompDef.component {...node.props} />
                                    </div>
                                 </div>
                               )
                            })}
                          </div>
                       </div>
                       
                       {/* Property Inspector */}
                       <div className="w-80 bg-white border-l border-slate-200 p-4 overflow-y-auto shrink-0 flex flex-col gap-4">
                          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Properties</h4>
                          {selectedNodeIdx !== null && content[selectedNodeIdx] ? (
                             (() => {
                               const node = content[selectedNodeIdx];
                               const CompDef = ComponentRegistry[node.componentId];
                               if (!CompDef) return <div className="text-sm text-slate-500">Unknown component</div>;
                               return (
                                 <div className="flex flex-col gap-4">
                                   <div className="font-bold text-sm bg-slate-50 p-2 rounded border border-slate-200">{CompDef.name}</div>
                                   {CompDef.props.map(prop => (
                                     <div key={prop.name}>
                                       <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">{prop.label}</label>
                                       {prop.type === 'textarea' ? (
                                         <textarea 
                                           value={node.props[prop.name] || ''} 
                                           onChange={(e) => updateComponentProp(selectedNodeIdx, prop.name, e.target.value)}
                                           className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 min-h-[80px]"
                                         />
                                       ) : prop.type === 'color' ? (
                                         <div className="flex gap-2">
                                           <input type="color" value={node.props[prop.name] || '#ffffff'} onChange={(e) => updateComponentProp(selectedNodeIdx, prop.name, e.target.value)} className="w-10 h-10 p-1 border border-slate-200 rounded" />
                                           <input type="text" value={node.props[prop.name] || ''} onChange={(e) => updateComponentProp(selectedNodeIdx, prop.name, e.target.value)} className="flex-1 min-w-0 px-3 py-2 border border-slate-200 rounded outline-none focus:border-blue-500" />
                                         </div>
                                       ) : (
                                         <input 
                                           type="text" 
                                           value={node.props[prop.name] || ''} 
                                           onChange={(e) => updateComponentProp(selectedNodeIdx, prop.name, e.target.value)}
                                           className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500"
                                         />
                                       )}
                                     </div>
                                   ))}
                                 </div>
                               )
                             })()
                          ) : (
                             <div className="text-sm text-slate-500 italic">Select a component on the canvas to edit its properties.</div>
                          )}
                       </div>
                    </div>
                  </div>
                ) : (
                <div className="flex-1 min-h-0 overflow-y-auto p-6 bg-slate-100 relative">
                  <div className="max-w-4xl mx-auto space-y-6">
                    {Array.isArray(content) && content.map((card: any, idx: number) => (
                      <div key={idx} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex">
                        {/* Drag Handle */}
                        <div className="w-8 bg-slate-50 border-r border-slate-100 flex flex-col items-center py-4 text-slate-400 cursor-move shrink-0">
                          <GripVertical className="w-4 h-4" />
                        </div>

                        {/* Card Fields */}
                        <div className="p-6 flex-1 min-w-0 flex flex-col gap-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Category / Tag</label>
                              <input type="text" value={card.category || ''} onChange={e => updateCard(idx, 'category', e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" placeholder="e.g. Manifesto" />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Card Title</label>
                              <input type="text" value={card.title || ''} onChange={e => updateCard(idx, 'title', e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 font-bold" placeholder="e.g. The Digital Ecosystem" />
                            </div>
                            <div className="col-span-1 md:col-span-2">
                              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Subtitle / Description</label>
                              <textarea value={card.subtitle || ''} onChange={e => updateCard(idx, 'subtitle', e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 min-h-[80px]" placeholder="Detailed description..." />
                            </div>
                            <div>
                              <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Hex Color</label>
                              <div className="flex gap-2">
                                <input type="color" value={card.colorHex || "#ffffff"} onChange={(e) => updateCard(idx, 'colorHex', e.target.value)} className="w-10 h-10 p-1 border border-slate-200 rounded" />
                                <input type="text" value={card.colorHex || ""} onChange={(e) => updateCard(idx, 'colorHex', e.target.value)} className="flex-1 min-w-0 px-3 py-2 border border-slate-200 rounded outline-none focus:border-[#49ABC9]" />
                              </div>
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Lucide Icon Name</label>
                              <input type="text" value={card.iconName || ''} onChange={e => updateCard(idx, 'iconName', e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" placeholder="e.g. Sparkles, Code2" />
                            </div>
                            <div className="col-span-1 md:col-span-2">
                              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Button CTA Text</label>
                              <input type="text" value={card.cta || ''} onChange={e => updateCard(idx, 'cta', e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" placeholder="e.g. Enter the Ecosystem" />
                            </div>
                          </div>

                          {/* Contact Form Toggle */}
                          <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                            <input
                              type="checkbox"
                              id={`contact-form-${idx}`}
                              checked={card.isContactForm || false}
                              onChange={(e) => updateCard(idx, 'isContactForm', e.target.checked as any)}
                              className="w-4 h-4 text-[#49ABC9] border-slate-300 rounded focus:ring-[#49ABC9]"
                            />
                            <label htmlFor={`contact-form-${idx}`} className="text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer select-none">
                              Render Contact Form instead of Icon
                            </label>
                          </div>
                        </div>

                        {/* Delete Button */}
                        <div className="border-l border-slate-100 p-4 flex items-start bg-slate-50 shrink-0">
                          <button onClick={() => removeCard(idx)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                    
                    <button 
                      onClick={addCard}
                      className="w-full py-4 border-2 border-dashed border-slate-300 rounded-2xl text-slate-500 font-bold hover:border-[#49ABC9] hover:text-[#49ABC9] hover:bg-[#49ABC9]/5 transition-all flex items-center justify-center gap-2"
                    >
                      <Plus className="w-5 h-5" /> Add New Section Card
                    </button>
                  </div>
                </div>
                )
              ) : mode === 'preview' ? (
                <div 
                  className="flex-1 min-h-0 overflow-y-auto p-6 bg-white border-2 border-dashed border-slate-200 relative"
                  dangerouslySetInnerHTML={{ __html: content }}
                />
              ) : (
                <textarea 
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className={`flex-1 min-h-0 w-full p-6 font-mono text-[13px] outline-none resize-none leading-relaxed ${
                    mode === 'html' ? 'bg-[#1E1E1E] text-sky-300' : 'bg-[#1E1E1E] text-green-400'
                  }`}
                  spellCheck="false"
                />
              )}
            </div>
          ) : (
            <div className="flex-1 min-h-0 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl bg-white/50">
              <Code className="w-12 h-12 mb-4 text-slate-300" />
              Select or create a section to start editing.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
