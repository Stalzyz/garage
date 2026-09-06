"use client"

import { useState } from "react"
import { Plus, GripVertical, Settings2, Image as ImageIcon, Trash2, Save, AlertCircle, CheckCircle2, ChevronUp, ChevronDown } from "lucide-react"
import { toast } from "sonner"
import { saveAgencyData } from "./actions"

type ProjectData = { 
  id: string; 
  title: string; 
  image: string; 
  url?: string; 
  category?: string; 
  techStack?: string[]; 
  description?: string; 
}

type PosterCardItem = { text: string; sub: string; icon: string }

type CardData = { 
  id: string; 
  category: string; 
  title: string; 
  subtitle: string; 
  iconName?: string; 
  colorHex: string; 
  cta?: string; 
  projects?: ProjectData[]; 
  isContactForm?: boolean; 
  isProducts?: boolean; 
  isPortfolio?: boolean; 
  isAcademy?: boolean; 
  isCrm?: boolean; 
  isHrm?: boolean;
  isServices?: boolean;
  isPricing?: boolean;
  isLegal?: boolean;
  // Cinematic Poster Control Fields
  posterTitle1?: string;
  posterTitle2?: string;
  growth?: string;
  gets?: string;
  portalText?: string;
  topTagLeft?: string;
  topTagRight?: string;
  gradient?: string;
  posterCards?: PosterCardItem[];
}

export default function ClientEditor({ initialJson }: { initialJson: string }) {
  const [cards, setCards] = useState<CardData[]>(() => {
    try { return JSON.parse(initialJson) } catch (e) { return [] }
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    setSuccess(false)
    const result = await saveAgencyData(JSON.stringify(cards, null, 2))
    if (result.success) {
      setSuccess(true)
      toast.success("Agency page updated successfully!")
      setTimeout(() => setSuccess(false), 3000)
    } else {
      setError(result.error || "Failed to save")
      toast.error("Failed to save changes")
    }
    setSaving(false)
  }

  const updateCard = (index: number, updates: Partial<CardData>) => {
    const newCards = [...cards]
    newCards[index] = { ...newCards[index], ...updates }
    setCards(newCards)
  }

  const addCard = () => {
    setCards([...cards, {
      id: `service-${Date.now()}`,
      category: "Service",
      title: "New Agency Solution",
      subtitle: "Accelerate your business with bespoke technical execution.",
      iconName: "Zap",
      colorHex: "#10b981",
      cta: "Get Started",
      posterTitle1: "NEW",
      posterTitle2: "SOLUTION",
      growth: "Turns casual visitors into long-term loyal clients.",
      gets: "Ready-to-use production assets & technical support.",
      portalText: "ONLINE SCALE",
      topTagLeft: "IDEAS INTO REALITY",
      topTagRight: "STRATEGY // CODE // LAUNCH",
      gradient: "from-emerald-400 via-teal-400 to-cyan-500",
      posterCards: [
        { text: "ENTERPRISE SPEED", sub: "Sub-800ms loading performance", icon: "fa-solid fa-bolt" },
        { text: "HIGH CONVERSION", sub: "Built for maximum trust & sales", icon: "fa-solid fa-gem" }
      ]
    }])
  }

  const removeCard = (index: number) => {
    setCards(cards.filter((_, i) => i !== index))
  }

  const moveCard = (index: number, direction: -1 | 1) => {
    if (index + direction < 0 || index + direction >= cards.length) return
    const newCards = [...cards]
    const temp = newCards[index]
    newCards[index] = newCards[index + direction]
    newCards[index + direction] = temp
    setCards(newCards)
  }

  const addProject = (cardIndex: number) => {
    const newCards = [...cards]
    if (!newCards[cardIndex].projects) newCards[cardIndex].projects = []
    newCards[cardIndex].projects!.push({ 
      id: `p-${Date.now()}`, 
      title: 'New Showcase Project', 
      image: '', 
      url: 'https://', 
      category: 'Web Experience', 
      techStack: ['Next.js', 'TailwindCSS'] 
    })
    setCards(newCards)
  }

  const updateProject = (cardIndex: number, projectIndex: number, updates: Partial<ProjectData>) => {
    const newCards = [...cards]
    newCards[cardIndex].projects![projectIndex] = { ...newCards[cardIndex].projects![projectIndex], ...updates }
    setCards(newCards)
  }

  const removeProject = (cardIndex: number, projectIndex: number) => {
    const newCards = [...cards]
    newCards[cardIndex].projects!.splice(projectIndex, 1)
    setCards(newCards)
  }

  const addPosterCard = (cardIndex: number) => {
    const newCards = [...cards]
    if (!newCards[cardIndex].posterCards) newCards[cardIndex].posterCards = []
    newCards[cardIndex].posterCards!.push({
      text: 'NEW FEATURE TAG',
      sub: 'Short detail or benefit',
      icon: 'fa-solid fa-gem'
    })
    setCards(newCards)
  }

  const updatePosterCard = (cardIndex: number, posterIndex: number, updates: Partial<PosterCardItem>) => {
    const newCards = [...cards]
    newCards[cardIndex].posterCards![posterIndex] = { ...newCards[cardIndex].posterCards![posterIndex], ...updates }
    setCards(newCards)
  }

  const removePosterCard = (cardIndex: number, posterIndex: number) => {
    const newCards = [...cards]
    newCards[cardIndex].posterCards!.splice(posterIndex, 1)
    setCards(newCards)
  }

  return (
    <div className="flex flex-col h-full bg-[#050505] text-white overflow-hidden pb-12">
      <div className="flex justify-between items-center p-6 border-b border-white/10 shrink-0">
        <div>
          <h1 className="text-2xl font-bold">Agency Visual Editor</h1>
          <p className="text-white/50 text-sm">Manage the sections and portfolio projects on your Agency homepage.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white px-6 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors shadow-[0_0_15px_rgba(168,85,247,0.3)]"
        >
          {saving ? <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"/> : <Save className="w-4 h-4" />}
          Publish Changes
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-lg mb-6 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-500/10 border border-green-500/50 text-green-400 p-4 rounded-lg mb-6 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <p>Saved successfully! The live Agency site has been updated.</p>
          </div>
        )}

        <div className="max-w-4xl mx-auto space-y-6">
          {cards.map((card, idx) => (
            <div key={card.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 relative group">
              <div className="absolute right-4 top-4 flex items-center gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                <button onClick={() => moveCard(idx, -1)} disabled={idx === 0} className="p-2 hover:bg-white/10 rounded-lg disabled:opacity-30"><ChevronUp className="w-4 h-4"/></button>
                <button onClick={() => moveCard(idx, 1)} disabled={idx === cards.length - 1} className="p-2 hover:bg-white/10 rounded-lg disabled:opacity-30"><ChevronDown className="w-4 h-4"/></button>
                <button onClick={() => removeCard(idx)} className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg"><Trash2 className="w-4 h-4"/></button>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4 pr-32">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold text-white/50 uppercase mb-1">Category</label>
                  <input value={card.category} onChange={e => updateCard(idx, { category: e.target.value })} className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-purple-500 outline-none" />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold text-white/50 uppercase mb-1">Title</label>
                  <input value={card.title} onChange={e => updateCard(idx, { title: e.target.value })} className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-purple-500 outline-none" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-white/50 uppercase mb-1">Subtitle</label>
                  <textarea value={card.subtitle} onChange={e => updateCard(idx, { subtitle: e.target.value })} className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-purple-500 outline-none h-20 resize-none" />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold text-white/50 uppercase mb-1">CTA Button Text</label>
                  <input value={card.cta || ''} onChange={e => updateCard(idx, { cta: e.target.value })} className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-purple-500 outline-none" placeholder="e.g. Learn More" />
                </div>
                <div className="col-span-2 sm:col-span-1 flex gap-4">
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-white/50 uppercase mb-1">Color (Hex)</label>
                    <div className="flex gap-2 items-center">
                      <div className="w-6 h-6 rounded-full border border-white/20 shrink-0" style={{ backgroundColor: card.colorHex }} />
                      <input value={card.colorHex} onChange={e => updateCard(idx, { colorHex: e.target.value })} className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-purple-500 outline-none font-mono" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-white/50 uppercase mb-1">Lucide Icon</label>
                    <input value={card.iconName || ''} onChange={e => updateCard(idx, { iconName: e.target.value })} className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-purple-500 outline-none" placeholder="e.g. Zap" />
                  </div>
                </div>
              </div>

              {/* Special Flags */}
              <div className="flex flex-wrap gap-4 mt-6 pt-4 border-t border-white/10">
                <label className="flex items-center gap-2 text-sm text-white/70 cursor-pointer hover:text-white">
                  <input type="checkbox" checked={!!card.isContactForm} onChange={e => updateCard(idx, { isContactForm: e.target.checked })} className="rounded bg-black border-white/20 text-purple-500 focus:ring-purple-500 focus:ring-offset-black" />
                  Is Contact Form
                </label>
                <label className="flex items-center gap-2 text-sm text-white/70 cursor-pointer hover:text-white">
                  <input type="checkbox" checked={!!card.isProducts} onChange={e => updateCard(idx, { isProducts: e.target.checked })} className="rounded bg-black border-white/20 text-purple-500 focus:ring-purple-500 focus:ring-offset-black" />
                  Shows Products
                </label>
                <label className="flex items-center gap-2 text-sm text-white/70 cursor-pointer hover:text-white">
                  <input type="checkbox" checked={!!card.isPortfolio} onChange={e => updateCard(idx, { isPortfolio: e.target.checked })} className="rounded bg-black border-white/20 text-purple-500 focus:ring-purple-500 focus:ring-offset-black" />
                  Shows Portfolio
                </label>
              </div>

              {/* Cinematic Movie Poster Controls */}
              <div className="mt-6 pt-4 border-t border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                    <span>🎬 Cinematic Movie Poster Controls</span>
                  </h3>
                  <span className="text-[10px] font-mono text-white/40">Visual Showcase Options</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-white/40 uppercase mb-1">Poster Title Line 1</label>
                    <input 
                      value={card.posterTitle1 || ''} 
                      onChange={e => updateCard(idx, { posterTitle1: e.target.value })} 
                      className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-emerald-500 font-bold uppercase" 
                      placeholder="e.g. WEB (Defaults to 1st word)"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-white/40 uppercase mb-1">Poster Title Line 2</label>
                    <input 
                      value={card.posterTitle2 || ''} 
                      onChange={e => updateCard(idx, { posterTitle2: e.target.value })} 
                      className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-emerald-500 font-bold uppercase" 
                      placeholder="e.g. DESIGNING (Defaults to 2nd word)"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-[10px] font-bold text-white/40 uppercase mb-1">How It Scales Business</label>
                    <input 
                      value={card.growth || ''} 
                      onChange={e => updateCard(idx, { growth: e.target.value })} 
                      className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-emerald-300 outline-none focus:border-emerald-500" 
                      placeholder="e.g. Turns casual visitors into paying customers..."
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-white/40 uppercase mb-1">What You Get (Deliverables summary)</label>
                    <input 
                      value={card.gets || ''} 
                      onChange={e => updateCard(idx, { gets: e.target.value })} 
                      className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-cyan-300 outline-none focus:border-cyan-500" 
                      placeholder="e.g. Modern mobile-friendly page designs & prototypes."
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-white/40 uppercase mb-1">Doorway Portal Text Banner</label>
                    <input 
                      value={card.portalText || ''} 
                      onChange={e => updateCard(idx, { portalText: e.target.value })} 
                      className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-amber-300 outline-none focus:border-amber-500 font-mono uppercase" 
                      placeholder="e.g. A BIGGER TOMORROW ONLINE"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-white/40 uppercase mb-1">Gradient Preset / Tailwind Classes</label>
                    <input 
                      value={card.gradient || ''} 
                      onChange={e => updateCard(idx, { gradient: e.target.value })} 
                      className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-purple-300 outline-none focus:border-purple-500 font-mono" 
                      placeholder="e.g. from-orange-500 via-amber-500 to-red-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-white/40 uppercase mb-1">Top Micro-Tag Left</label>
                    <input 
                      value={card.topTagLeft || ''} 
                      onChange={e => updateCard(idx, { topTagLeft: e.target.value })} 
                      className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white/70 outline-none focus:border-emerald-500 uppercase font-mono" 
                      placeholder="e.g. IDEAS INTO DIGITAL REALITY"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-white/40 uppercase mb-1">Top Micro-Tag Right</label>
                    <input 
                      value={card.topTagRight || ''} 
                      onChange={e => updateCard(idx, { topTagRight: e.target.value })} 
                      className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white/70 outline-none focus:border-emerald-500 uppercase font-mono" 
                      placeholder="e.g. DESIGN // DEVELOP // LAUNCH"
                    />
                  </div>
                </div>

                {/* Sub-cards Feature Tags */}
                <div className="mt-3 pt-3 border-t border-white/5">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-[10px] font-bold text-white/50 uppercase">Poster Sub-Feature Cards (2 Highlights)</label>
                    <button type="button" onClick={() => addPosterCard(idx)} className="text-[10px] bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded flex items-center gap-1">
                      <Plus className="w-3 h-3" /> Add Feature Card
                    </button>
                  </div>

                  {card.posterCards && card.posterCards.length > 0 ? (
                    <div className="space-y-2">
                      {card.posterCards.map((pc, pcIdx) => (
                        <div key={pcIdx} className="bg-black/70 p-2.5 rounded-lg border border-white/10 flex flex-col sm:flex-row items-center gap-2">
                          <input 
                            value={pc.text} 
                            onChange={e => updatePosterCard(idx, pcIdx, { text: e.target.value })} 
                            className="flex-1 bg-black border border-white/10 rounded px-2 py-1 text-xs text-white font-bold uppercase" 
                            placeholder="Heading (e.g. BRANDS GROW HERE)" 
                          />
                          <input 
                            value={pc.sub} 
                            onChange={e => updatePosterCard(idx, pcIdx, { sub: e.target.value })} 
                            className="flex-1 bg-black border border-white/10 rounded px-2 py-1 text-xs text-white/60" 
                            placeholder="Sub-label (e.g. Good design builds trust)" 
                          />
                          <input 
                            value={pc.icon} 
                            onChange={e => updatePosterCard(idx, pcIdx, { icon: e.target.value })} 
                            className="w-28 bg-black border border-white/10 rounded px-2 py-1 text-xs font-mono text-amber-400" 
                            placeholder="FontAwesome Icon" 
                          />
                          <button type="button" onClick={() => removePosterCard(idx, pcIdx)} className="p-1 text-red-400 hover:bg-red-500/20 rounded">
                            <Trash2 className="w-3.5 h-3.5"/>
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[10px] text-white/30 italic">Using default feature tags.</p>
                  )}
                </div>
              </div>

              {/* Projects List */}
              <div className="mt-6 pt-4 border-t border-white/10">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-bold text-white/80">Projects (Images)</h3>
                  <button onClick={() => addProject(idx)} className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg flex items-center gap-1">
                    <Plus className="w-3 h-3" /> Add Project
                  </button>
                </div>
                
                {card.projects && card.projects.length > 0 ? (
                  <div className="space-y-4">
                    {card.projects.map((proj, pIdx) => (
                      <div key={proj.id} className="bg-black/60 p-4 rounded-xl border border-white/10 space-y-3">
                        <div className="flex gap-3 items-start">
                          {proj.image ? (
                            <img src={proj.image} alt="" className="w-16 h-16 rounded-lg object-cover shrink-0 bg-white/10 border border-white/10" />
                          ) : (
                            <div className="w-16 h-16 rounded-lg bg-white/10 shrink-0 flex items-center justify-center text-white/30 border border-white/10"><ImageIcon className="w-6 h-6"/></div>
                          )}
                          <div className="flex-1 space-y-2">
                            <div className="flex gap-2">
                              <input 
                                value={proj.title} 
                                onChange={e => updateProject(idx, pIdx, { title: e.target.value })} 
                                className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-sm font-semibold focus:border-purple-500 outline-none text-white" 
                                placeholder="Project / Website Title (e.g. Aura SaaS)" 
                              />
                              <button onClick={() => removeProject(idx, pIdx)} className="p-2 text-white/30 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors" title="Delete Project">
                                <Trash2 className="w-4 h-4"/>
                              </button>
                            </div>
                            <div className="flex gap-2">
                              <input 
                                value={proj.url || ''} 
                                onChange={e => updateProject(idx, pIdx, { url: e.target.value })} 
                                className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-emerald-400 focus:border-emerald-500 outline-none font-mono" 
                                placeholder="Live Website URL for Iframe Preview (e.g. https://myclient.com)" 
                              />
                            </div>
                          </div>
                        </div>

                        {/* Additional project metadata */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-white/5">
                          <div>
                            <label className="block text-[10px] font-bold text-white/40 uppercase mb-1">Category / Tag</label>
                            <input 
                              value={proj.category || ''} 
                              onChange={e => updateProject(idx, pIdx, { category: e.target.value })} 
                              className="w-full bg-black/40 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white/80 focus:border-purple-500 outline-none" 
                              placeholder="e.g. Enterprise SaaS, E-Commerce" 
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-white/40 uppercase mb-1">Tech Stack (comma separated)</label>
                            <input 
                              value={Array.isArray(proj.techStack) ? proj.techStack.join(', ') : (proj.techStack || '')} 
                              onChange={e => updateProject(idx, pIdx, { techStack: e.target.value.split(',').map(s => s.trim()).filter(Boolean) as any })} 
                              className="w-full bg-black/40 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white/80 focus:border-purple-500 outline-none" 
                              placeholder="e.g. Next.js, TailwindCSS, Framer Motion" 
                            />
                          </div>
                          <div className="sm:col-span-2">
                            <label className="block text-[10px] font-bold text-white/40 uppercase mb-1">Thumbnail Image (URL or Upload)</label>
                            <div className="flex gap-2">
                              <input 
                                value={proj.image} 
                                onChange={e => updateProject(idx, pIdx, { image: e.target.value })} 
                                className="flex-1 bg-black/40 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white/60 focus:border-purple-500 outline-none" 
                                placeholder="Image URL (https://...)" 
                              />
                              <label className="cursor-pointer shrink-0 text-xs bg-white/10 hover:bg-white/20 px-3 py-1 rounded-lg flex items-center justify-center transition-colors">
                                Upload File
                                <input 
                                  type="file" 
                                  accept="image/*" 
                                  className="hidden" 
                                  onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    try {
                                      const res = await fetch("/api/v1/storage/upload-url", {
                                        method: "POST",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify({ filename: file.name, contentType: file.type, prefix: "cms/agency" }),
                                      });
                                      if (!res.ok) throw new Error("Upload URL failed");
                                      const { uploadUrl, downloadUrl } = await res.json();
                                      await fetch(uploadUrl, { method: "PUT", headers: { "Content-Type": file.type }, body: file });
                                      updateProject(idx, pIdx, { image: downloadUrl });
                                    } catch (err) {
                                      alert("Upload failed.");
                                    }
                                  }}
                                />
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-white/30 italic">No projects added to this section.</p>
                )}
              </div>
              
            </div>
          ))}

          <button 
            onClick={addCard}
            className="w-full p-4 border-2 border-dashed border-white/10 hover:border-purple-500/50 hover:bg-purple-500/5 rounded-2xl flex flex-col items-center justify-center text-white/50 hover:text-purple-400 transition-all gap-2"
          >
            <Plus className="w-6 h-6" />
            <span className="font-semibold text-sm">Add New Section Card</span>
          </button>
        </div>
      </div>
    </div>
  )
}
