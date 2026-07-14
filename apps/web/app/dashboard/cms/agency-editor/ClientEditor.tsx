"use client"

import { useState } from "react"
import { Save, AlertCircle, CheckCircle2, Plus, Trash2, ChevronUp, ChevronDown, Image as ImageIcon } from "lucide-react"
import { saveAgencyData } from "./actions"

type ProjectData = { id: string; title: string; image: string }
type CardData = { id: string; category: string; title: string; subtitle: string; iconName?: string; colorHex: string; cta?: string; projects?: ProjectData[]; isContactForm?: boolean; isProducts?: boolean; isPortfolio?: boolean; isAcademy?: boolean; isCrm?: boolean; isHrm?: boolean; }

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
      setTimeout(() => setSuccess(false), 3000)
    } else {
      setError(result.error || "Failed to save")
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
      id: `new-${Date.now()}`,
      category: "New Category",
      title: "New Section",
      subtitle: "Add some descriptive text here.",
      iconName: "Sparkles",
      colorHex: "#3b82f6",
      cta: "Click Here"
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
    newCards[cardIndex].projects!.push({ id: `p-${Date.now()}`, title: 'New Project', image: '' })
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
                    <input value={card.iconName || ''} onChange={e => updateCard(idx, { iconName: e.target.value })} className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-purple-500 outline-none" placeholder="e.g. Sparkles" />
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

              {/* Projects List */}
              <div className="mt-6 pt-4 border-t border-white/10">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-bold text-white/80">Projects (Images)</h3>
                  <button onClick={() => addProject(idx)} className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg flex items-center gap-1">
                    <Plus className="w-3 h-3" /> Add Project
                  </button>
                </div>
                
                {card.projects && card.projects.length > 0 ? (
                  <div className="space-y-3">
                    {card.projects.map((proj, pIdx) => (
                      <div key={proj.id} className="flex gap-3 bg-black/50 p-3 rounded-xl border border-white/5 items-center">
                        {proj.image ? (
                          <img src={proj.image} alt="" className="w-12 h-12 rounded object-cover shrink-0 bg-white/10" />
                        ) : (
                          <div className="w-12 h-12 rounded bg-white/10 shrink-0 flex items-center justify-center text-white/30"><ImageIcon className="w-5 h-5"/></div>
                        )}
                        <div className="flex-1 space-y-2">
                          <input value={proj.title} onChange={e => updateProject(idx, pIdx, { title: e.target.value })} className="w-full bg-transparent border-b border-white/10 px-1 py-1 text-sm focus:border-purple-500 outline-none" placeholder="Project Title" />
                          <input value={proj.image} onChange={e => updateProject(idx, pIdx, { image: e.target.value })} className="w-full bg-transparent border-b border-white/10 px-1 py-1 text-xs text-white/50 focus:border-purple-500 outline-none" placeholder="Image URL (https://...)" />
                        </div>
                        <button onClick={() => removeProject(idx, pIdx)} className="p-2 text-white/30 hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4"/></button>
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
