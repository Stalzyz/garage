"use client"

import React, { useEffect, useState, useRef } from "react"
import grapesjs, { Editor } from "grapesjs"
import GjsEditor, { Canvas } from "@grapesjs/react"
import { Monitor, Tablet, Smartphone, Save, Eye, Undo, Redo, Layout, Box, Type, Image as ImageIcon, Layers, Sparkles, Code, X } from "lucide-react"
import { fetchApi } from "@/lib/useApi"
import { toast } from "sonner"
import "grapesjs/dist/css/grapes.min.css"

interface ProBuilderProps {
  initialHtml?: string
  initialCss?: string
  onSave: (html: string, css: string) => void
}

export function ProBuilder({ initialHtml = "", initialCss = "", onSave }: ProBuilderProps) {
  const [editor, setEditor] = useState<Editor | null>(null)
  const [activeTab, setActiveTab] = useState<"design" | "settings">("design")
  const [leftTab, setLeftTab] = useState<"add" | "layers">("add")
  
  const [isAiModalOpen, setIsAiModalOpen] = useState(false)
  const [aiPrompt, setAiPrompt] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [hasTextSelection, setHasTextSelection] = useState(false)

  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false)
  const [rawHtml, setRawHtml] = useState("")
  const [rawCss, setRawCss] = useState("")
  
  const onEditor = (editor: Editor) => {
    setEditor(editor)
    
    // Set initial components if present
    if (initialHtml) {
      editor.setComponents(initialHtml)
    }
    if (initialCss) {
      editor.setStyle(initialCss)
    }

    // Add basic blocks
    const bm = editor.BlockManager
    
    bm.add("section", {
      label: "Section",
      category: "Layout",
      content: {
        tagName: "section",
        style: {
          padding: "50px 20px",
          minHeight: "100px",
          display: "flex",
          width: "100%",
          backgroundColor: "#ffffff"
        }
      }
    })

    bm.add("container", {
      label: "Container",
      category: "Layout",
      content: {
        tagName: "div",
        style: {
          maxWidth: "1200px",
          margin: "0 auto",
          width: "100%",
          minHeight: "50px"
        }
      }
    })

    bm.add("text", {
      label: "Text",
      category: "Basic",
      content: {
        type: "text",
        content: "Insert your text here",
        style: { padding: "10px" }
      }
    })

    bm.add("image", {
      label: "Image",
      category: "Basic",
      content: {
        type: "image",
        style: { color: "black", width: "100%", height: "auto" },
        activeOnRender: 1
      }
    })

    // Domain Components (Agency & Academy)
    bm.add("hero", {
      label: "Hero Section",
      category: "Agency & Academy",
      content: `
        <section style="padding: 100px 20px; text-align: center; background: linear-gradient(135deg, #050505 0%, #1a1a2e 100%); color: white; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 60vh;">
          <h1 style="font-size: 48px; font-weight: 800; margin-bottom: 20px; line-height: 1.2;">Elevate Your Digital Presence</h1>
          <p style="font-size: 18px; color: #a0a0b0; max-width: 600px; margin-bottom: 40px;">We craft stunning websites and robust learning management systems for the modern web.</p>
          <div style="display: flex; gap: 20px;">
            <a href="#" style="padding: 15px 30px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; font-family: sans-serif;">Get Started</a>
            <a href="#" style="padding: 15px 30px; background-color: transparent; border: 1px solid #3b82f6; color: #3b82f6; text-decoration: none; border-radius: 8px; font-weight: bold; font-family: sans-serif;">View Portfolio</a>
          </div>
        </section>
      `
    })

    bm.add("features-grid", {
      label: "Features Grid",
      category: "Agency & Academy",
      content: `
        <section style="padding: 80px 20px; background-color: #050505;">
          <div style="max-width: 1200px; margin: 0 auto;">
            <h2 style="font-size: 32px; font-weight: bold; color: white; text-align: center; margin-bottom: 60px;">Our Services</h2>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 30px;">
              <div style="background-color: rgba(255,255,255,0.05); padding: 40px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1);">
                <h3 style="color: white; font-size: 20px; margin-bottom: 15px; margin-top: 0;">Web Design</h3>
                <p style="color: #888; line-height: 1.6; margin: 0;">Beautiful, responsive websites tailored to your brand.</p>
              </div>
              <div style="background-color: rgba(255,255,255,0.05); padding: 40px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1);">
                <h3 style="color: white; font-size: 20px; margin-bottom: 15px; margin-top: 0;">SEO Optimization</h3>
                <p style="color: #888; line-height: 1.6; margin: 0;">Rank higher and drive organic traffic consistently.</p>
              </div>
              <div style="background-color: rgba(255,255,255,0.05); padding: 40px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1);">
                <h3 style="color: white; font-size: 20px; margin-bottom: 15px; margin-top: 0;">LMS Development</h3>
                <p style="color: #888; line-height: 1.6; margin: 0;">Custom platforms to host and sell your courses.</p>
              </div>
            </div>
          </div>
        </section>
      `
    })

    bm.add("course-card", {
      label: "Course Card",
      category: "Agency & Academy",
      content: `
        <div style="background-color: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); border-radius: 20px; overflow: hidden; width: 350px; font-family: sans-serif; backdrop-filter: blur(10px);">
          <div style="height: 200px; background-color: #2a2a3a; display: flex; align-items: center; justify-content: center;">
            <span style="color: #666;">Course Image Placeholder</span>
          </div>
          <div style="padding: 24px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
              <span style="background-color: rgba(59,130,246,0.1); color: #3b82f6; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: bold; text-transform: uppercase;">Development</span>
              <span style="color: white; font-weight: bold; font-size: 18px;">$99</span>
            </div>
            <h3 style="color: white; font-size: 20px; margin: 0 0 10px 0; line-height: 1.3;">Advanced React Patterns & Next.js</h3>
            <p style="color: #888; font-size: 14px; margin: 0 0 24px 0; line-height: 1.5;">Master server components, caching, and edge computing.</p>
            <button style="width: 100%; padding: 12px; background-color: #3b82f6; color: white; border: none; border-radius: 8px; font-weight: bold; cursor: pointer;">Enroll Now</button>
          </div>
        </div>
      `
    })

    bm.add("testimonial", {
      label: "Testimonial",
      category: "Agency & Academy",
      content: `
        <div style="background-color: rgba(255,255,255,0.05); padding: 40px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1); max-width: 600px; margin: 20px auto; font-family: sans-serif;">
          <p style="color: white; font-size: 18px; font-style: italic; line-height: 1.6; margin-bottom: 24px;">"This agency completely transformed our online presence. Our conversion rates have doubled since launching the new site."</p>
          <div style="display: flex; align-items: center; gap: 15px;">
            <div style="width: 50px; height: 50px; border-radius: 25px; background-color: #444;"></div>
            <div>
              <h4 style="color: white; margin: 0 0 4px 0; font-size: 16px;">Sarah Jenkins</h4>
              <p style="color: #3b82f6; margin: 0; font-size: 14px;">CEO, TechStart Inc.</p>
            </div>
          </div>
        </div>
      `
    })

    bm.add("pricing-table", {
      label: "Pricing Table",
      category: "Agency & Academy",
      content: `
        <section style="padding: 80px 20px; background-color: #050505; font-family: sans-serif;">
          <div style="max-width: 1000px; margin: 0 auto;">
            <div style="display: flex; flex-wrap: wrap; gap: 30px; justify-content: center;">
              
              <div style="flex: 1; min-width: 250px; background-color: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 40px;">
                <h3 style="color: white; font-size: 24px; margin: 0 0 15px 0;">Basic</h3>
                <div style="font-size: 40px; font-weight: bold; color: white; margin-bottom: 20px;">$29<span style="font-size: 16px; color: #666; font-weight: normal;">/mo</span></div>
                <ul style="list-style: none; padding: 0; margin: 0 0 30px 0; color: #888; line-height: 2;">
                  <li>1 Website</li>
                  <li>Basic Analytics</li>
                  <li>Email Support</li>
                </ul>
                <button style="width: 100%; padding: 12px; background-color: transparent; border: 1px solid #333; color: white; border-radius: 8px; font-weight: bold;">Choose Basic</button>
              </div>

              <div style="flex: 1; min-width: 250px; background-color: rgba(59,130,246,0.1); border: 1px solid #3b82f6; border-radius: 16px; padding: 40px; transform: scale(1.05);">
                <div style="background-color: #3b82f6; color: white; font-size: 12px; font-weight: bold; padding: 4px 10px; border-radius: 20px; display: inline-block; margin-bottom: 15px; text-transform: uppercase;">Most Popular</div>
                <h3 style="color: white; font-size: 24px; margin: 0 0 15px 0;">Pro</h3>
                <div style="font-size: 40px; font-weight: bold; color: white; margin-bottom: 20px;">$99<span style="font-size: 16px; color: #666; font-weight: normal;">/mo</span></div>
                <ul style="list-style: none; padding: 0; margin: 0 0 30px 0; color: #e2e8f0; line-height: 2;">
                  <li>Unlimited Websites</li>
                  <li>Advanced Analytics</li>
                  <li>Priority Support</li>
                  <li>Custom Domains</li>
                </ul>
                <button style="width: 100%; padding: 12px; background-color: #3b82f6; border: none; color: white; border-radius: 8px; font-weight: bold;">Choose Pro</button>
              </div>

            </div>
          </div>
        </section>
      `
    })

    // Track text selection
    editor.on('component:selected', () => {
      const selected = editor.getSelected()
      if (selected && (selected.is('text') || selected.is('textnode'))) {
        setHasTextSelection(true)
      } else {
        setHasTextSelection(false)
      }
    })
    
    editor.on('component:deselected', () => {
      setHasTextSelection(false)
    })
  }

  const handleSave = () => {
    if (editor) {
      const html = editor.getHtml()
      const css = editor.getCss()
      onSave(html || '', css || '')
    }
  }

  const handleAiGenerate = async () => {
    if (!editor || !aiPrompt) return
    const selected = editor.getSelected()
    if (!selected) return

    setIsGenerating(true)
    try {
      const res = await fetchApi<any>("/cms/ai/generate", {
        method: "POST",
        body: JSON.stringify({ prompt: aiPrompt, context: selected.components().models[0]?.get('content') || '' })
      })
      if (res.content) {
        selected.components(res.content)
        toast.success("AI Content Generated!")
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to generate AI content")
    } finally {
      setIsGenerating(false)
      setIsAiModalOpen(false)
      setAiPrompt("")
    }
  }

  const openCodeModal = () => {
    if (editor) {
      setRawHtml(editor.getHtml() || '')
      setRawCss(editor.getCss() || '')
      setIsCodeModalOpen(true)
    }
  }

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden bg-[#1e1e1e] text-white font-sans text-sm">
      {/* Top Toolbar */}
      <div className="h-12 border-b border-[#333] flex items-center justify-between px-4 bg-[#252526] shrink-0">
        <div className="flex items-center gap-2">
          <div className="font-bold tracking-widest text-xs uppercase mr-4">Pro Builder</div>
          
          <div className="flex bg-[#1e1e1e] rounded border border-[#333] overflow-hidden">
            <button onClick={() => editor?.setDevice('Desktop')} className="p-1.5 hover:bg-[#333] transition-colors"><Monitor className="w-4 h-4" /></button>
            <button onClick={() => editor?.setDevice('Tablet')} className="p-1.5 hover:bg-[#333] transition-colors"><Tablet className="w-4 h-4" /></button>
            <button onClick={() => editor?.setDevice('Mobile portrait')} className="p-1.5 hover:bg-[#333] transition-colors"><Smartphone className="w-4 h-4" /></button>
          </div>
          
          <div className="w-px h-4 bg-[#333] mx-2" />
          
          <button 
            onClick={() => hasTextSelection && setIsAiModalOpen(true)}
            disabled={!hasTextSelection}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold transition-colors ${hasTextSelection ? 'bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600/30 border border-indigo-500/30' : 'bg-[#1e1e1e] text-gray-500 cursor-not-allowed border border-[#333]'}`}
          >
            <Sparkles className="w-3.5 h-3.5" /> AI Magic
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => editor?.UndoManager.undo()} className="p-1.5 hover:bg-[#333] rounded transition-colors text-gray-400 hover:text-white"><Undo className="w-4 h-4" /></button>
          <button onClick={() => editor?.UndoManager.redo()} className="p-1.5 hover:bg-[#333] rounded transition-colors text-gray-400 hover:text-white"><Redo className="w-4 h-4" /></button>
          <div className="w-px h-4 bg-[#333] mx-2" />
          <button onClick={openCodeModal} className="flex items-center gap-1.5 px-3 py-1.5 rounded hover:bg-[#333] transition-colors text-gray-300">
            <Code className="w-4 h-4" /> Code
          </button>
          <button onClick={handleSave} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded text-white font-medium transition-colors">
            <Save className="w-4 h-4" /> Save
          </button>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Sidebar (Blocks & Layers) */}
        <div className="w-64 border-r border-[#333] bg-[#252526] flex flex-col z-10">
          <div className="flex border-b border-[#333]">
            <button onClick={() => setLeftTab("add")} className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-widest ${leftTab === "add" ? "bg-[#1e1e1e] border-t-2 border-blue-500 text-white" : "hover:bg-[#1e1e1e] border-t-2 border-transparent text-gray-400"}`}>Add</button>
            <button onClick={() => setLeftTab("layers")} className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-widest ${leftTab === "layers" ? "bg-[#1e1e1e] border-t-2 border-blue-500 text-white" : "hover:bg-[#1e1e1e] border-t-2 border-transparent text-gray-400"}`}>Layers</button>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar relative">
            <div id="gjs-blocks" className={`absolute inset-0 p-4 ${leftTab === "add" ? "block" : "hidden"}`}></div>
            <div id="gjs-layers" className={`absolute inset-0 ${leftTab === "layers" ? "block" : "hidden"}`}></div>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 relative bg-[#151515] overflow-hidden flex flex-col">
          <GjsEditor
            grapesjs={grapesjs}
            options={{
              height: '100%',
              storageManager: false,
              panels: { defaults: [] },
              blockManager: {
                appendTo: '#gjs-blocks'
              },
              layerManager: {
                appendTo: '#gjs-layers'
              },
              styleManager: {
                appendTo: '#gjs-styles',
                sectors: [
                  {
                    name: 'Layout',
                    open: true,
                    buildProps: ['display', 'flex-direction', 'justify-content', 'align-items', 'flex-wrap', 'width', 'height', 'max-width', 'min-height']
                  },
                  {
                    name: 'Spacing',
                    open: false,
                    buildProps: ['margin', 'padding']
                  },
                  {
                    name: 'Typography',
                    open: false,
                    buildProps: ['font-family', 'font-size', 'font-weight', 'letter-spacing', 'color', 'line-height', 'text-align', 'text-transform']
                  },
                  {
                    name: 'Decorations',
                    open: false,
                    buildProps: ['background-color', 'border-radius', 'border', 'box-shadow', 'background']
                  }
                ]
              },
              traitManager: {
                appendTo: '#gjs-settings'
              }
            }}
            onEditor={onEditor}
          >
            <Canvas className="w-full h-full" />
          </GjsEditor>
        </div>

        {/* Right Sidebar (Styles) */}
        <div className="w-72 border-l border-[#333] bg-[#252526] flex flex-col z-10">
          <div className="flex border-b border-[#333]">
            <button onClick={() => setActiveTab("design")} className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-widest ${activeTab === "design" ? "bg-[#1e1e1e] border-t-2 border-blue-500 text-white" : "hover:bg-[#1e1e1e] border-t-2 border-transparent text-gray-400"}`}>Design</button>
            <button onClick={() => setActiveTab("settings")} className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-widest ${activeTab === "settings" ? "bg-[#1e1e1e] border-t-2 border-blue-500 text-white" : "hover:bg-[#1e1e1e] border-t-2 border-transparent text-gray-400"}`}>Settings</button>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar relative">
            <div id="gjs-styles" className={`absolute inset-0 p-2 ${activeTab === "design" ? "block" : "hidden"}`}></div>
            <div id="gjs-settings" className={`absolute inset-0 p-2 ${activeTab === "settings" ? "block" : "hidden"}`}></div>
          </div>
        </div>

      </div>

      {/* Global CSS Overrides for Dark Theme Integration */}
      <style dangerouslySetInnerHTML={{__html: `
        .gjs-cv-canvas {
          background-color: #151515 !important;
        }
        .gjs-one-bg {
          background-color: #252526 !important;
        }
        .gjs-two-color {
          color: #cccccc !important;
        }
        .gjs-three-bg {
          background-color: #333333 !important;
          color: white !important;
        }
        .gjs-four-color, .gjs-four-color-h:hover {
          color: #3b82f6 !important;
        }
        .gjs-sm-sector .gjs-sm-title {
          background-color: #1e1e1e !important;
          border-bottom: 1px solid #333 !important;
          border-top: 1px solid #333 !important;
          color: #aaaaaa !important;
          text-transform: uppercase !important;
          font-size: 10px !important;
          letter-spacing: 1px !important;
        }
        .gjs-sm-property {
          background-color: transparent !important;
        }
        .gjs-field {
          background-color: #1e1e1e !important;
          border-color: #333 !important;
          color: #fff !important;
        }
        .gjs-radio-item {
          border-color: #333 !important;
        }
        .gjs-radio-item.gjs-active {
          background-color: #3b82f6 !important;
          color: white !important;
          border-color: #3b82f6 !important;
        }
        .gjs-block {
          border-color: #333 !important;
          border-radius: 8px !important;
          color: #aaa !important;
          padding: 15px !important;
        }
        .gjs-block:hover {
          color: #fff !important;
          border-color: #3b82f6 !important;
        }
        .gjs-traits-c {
          padding: 10px !important;
        }
        .gjs-layer {
          border-bottom: 1px solid #333 !important;
        }
        .gjs-layer.gjs-active {
          background-color: rgba(59, 130, 246, 0.1) !important;
        }
      `}} />

      {/* AI Modal */}
      {isAiModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-[#252526] border border-[#333] rounded-xl shadow-2xl p-6 flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              <h3 className="text-lg font-bold">AI Magic Write</h3>
            </div>
            <textarea
              value={aiPrompt}
              onChange={e => setAiPrompt(e.target.value)}
              placeholder="e.g. Write a catchy 2 sentence description for our SEO services..."
              className="w-full h-32 bg-[#1e1e1e] border border-[#333] rounded-lg p-3 text-sm focus:outline-none focus:border-indigo-500 mb-4 resize-none"
            />
            <div className="flex justify-end gap-3">
              <button onClick={() => setIsAiModalOpen(false)} className="px-4 py-2 hover:bg-[#333] rounded-lg text-sm text-gray-400">Cancel</button>
              <button 
                onClick={handleAiGenerate} 
                disabled={!aiPrompt || isGenerating}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors"
              >
                {isGenerating ? "Generating..." : "Generate ✨"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Code Modal */}
      {isCodeModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-4xl bg-[#252526] border border-[#333] rounded-xl shadow-2xl p-6 flex flex-col h-[80vh]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Code className="w-5 h-5 text-blue-400" />
                <h3 className="text-lg font-bold">Export Code</h3>
              </div>
              <button onClick={() => setIsCodeModalOpen(false)} className="p-1 hover:bg-[#333] rounded"><X className="w-5 h-5" /></button>
            </div>
            
            <div className="flex-1 flex flex-col gap-4 overflow-hidden">
              <div className="flex-1 flex flex-col min-h-0">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">HTML</label>
                <textarea readOnly value={rawHtml} className="w-full flex-1 bg-[#1e1e1e] border border-[#333] rounded-lg p-3 text-xs font-mono text-gray-300 focus:outline-none resize-none custom-scrollbar" />
              </div>
              <div className="flex-1 flex flex-col min-h-0">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">CSS</label>
                <textarea readOnly value={rawCss} className="w-full flex-1 bg-[#1e1e1e] border border-[#333] rounded-lg p-3 text-xs font-mono text-gray-300 focus:outline-none resize-none custom-scrollbar" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
