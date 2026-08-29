"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Globe, LayoutTemplate, ArrowRight } from "lucide-react"

export default function CMSDashboard() {
  const [pages, setPages] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [newTitle, setNewTitle] = useState("")
  const [newSlug, setNewSlug] = useState("")
  const [newType, setNewType] = useState("LANDING_PAGE")

  const fetchPages = () => {
    fetch('/api/v1/cms/pages')
      .then(res => res.json())
      .then(data => {
        setPages(data.data || [])
        setIsLoading(false)
      })
      .catch(console.error)
  }

  useEffect(() => {
    fetchPages()
  }, [])

  const handleCreatePage = async () => {
    if (!newTitle || !newSlug) return;
    try {
      await fetch('/api/v1/cms/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle, slug: newSlug, type: newType })
      })
      setIsCreating(false)
      setNewTitle("")
      setNewSlug("")
      fetchPages()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Website Builder</h1>
          <p className="text-slate-500">Manage custom landing pages for your Academy and Agency.</p>
        </div>
        <button 
          onClick={() => setIsCreating(true)}
          className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-md transition-colors"
        >
          + Create New Page
        </button>
      </div>

      {isCreating && (
        <div className="mb-8 p-6 bg-white rounded-2xl border border-purple-200 shadow-sm flex items-end gap-4">
          <div className="flex-1">
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Page Title</label>
            <input type="text" value={newTitle} onChange={e => setNewTitle(e.target.value)} className="w-full border border-slate-200 rounded-lg px-4 py-2 outline-none focus:border-purple-500" placeholder="e.g. Summer Bootcamp Promo" />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">URL Slug</label>
            <input type="text" value={newSlug} onChange={e => setNewSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))} className="w-full border border-slate-200 rounded-lg px-4 py-2 outline-none focus:border-purple-500" placeholder="e.g. summer-bootcamp" />
          </div>
          <div className="w-48">
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Page Type</label>
            <select value={newType} onChange={e => setNewType(e.target.value)} className="w-full border border-slate-200 rounded-lg px-4 py-2 outline-none focus:border-purple-500 bg-white">
              <option value="LANDING_PAGE">Custom Landing Page</option>
              <option value="ACADEMY">Academy Site</option>
              <option value="AGENCY">Agency Portfolio</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setIsCreating(false)} className="px-4 py-2 bg-slate-100 text-slate-600 font-bold rounded-lg hover:bg-slate-200">Cancel</button>
            <button onClick={handleCreatePage} className="px-6 py-2 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 shadow-sm">Save Page</button>
          </div>
        </div>
      )}

      {/* Featured Agency Editor Banner */}
      <div className="mb-8 p-6 bg-gradient-to-r from-purple-900/90 to-indigo-950/90 rounded-2xl border border-purple-500/30 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-300 shrink-0 shadow-[0_0_20px_rgba(168,85,247,0.25)]">
            <Globe className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-xl font-bold">Agency Visual Editor</h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">10 THEMES ACTIVE</span>
            </div>
            <p className="text-sm text-purple-200/70 max-w-xl">
              Customize the interactive agency homepage, live device iframe showcases, services, and engagement models.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Link
            href="/agency"
            target="_blank"
            className="flex-1 md:flex-none px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all text-center border border-white/15"
          >
            Preview Site ↗
          </Link>
          <Link 
            href="/dashboard/cms/agency-editor"
            className="flex-1 md:flex-none px-6 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white rounded-xl text-xs font-bold transition-all shadow-[0_0_20px_rgba(168,85,247,0.4)] flex items-center justify-center gap-1.5"
          >
            Launch Visual Editor <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12"><div className="animate-pulse w-8 h-8 rounded-full border-4 border-slate-200 border-t-[#49ABC9]" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pages.map((page) => (
            <div key={page.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col group hover:shadow-lg transition-all relative overflow-hidden">
              <div className={`absolute top-0 left-0 w-full h-1.5 ${page.type === 'ACADEMY' ? 'bg-[#49ABC9]' : page.type === 'AGENCY' ? 'bg-purple-500' : 'bg-emerald-500'}`} />
              
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${page.type === 'ACADEMY' ? 'bg-blue-50 text-blue-600' : page.type === 'AGENCY' ? 'bg-purple-50 text-purple-600' : 'bg-emerald-50 text-emerald-600'}`}>
                    <Globe className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 truncate max-w-[180px]">{page.title}</h3>
                    <p className="text-xs text-slate-500 truncate max-w-[180px]">/{page.slug}</p>
                  </div>
                </div>
                <div className="px-2 py-1 bg-slate-100 rounded-md text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  {page.type}
                </div>
              </div>
              
              <div className="mt-auto pt-4 flex flex-col gap-3 border-t border-slate-100">
                <div className="flex items-center gap-2 text-sm text-slate-500 font-medium px-1">
                  <LayoutTemplate className="w-4 h-4" />
                  {page.sections?.length || 0} Blocks
                </div>
                <div className="flex gap-2">
                  <Link 
                    href={page.slug === 'agency' ? '/dashboard/cms/agency-editor' : `/dashboard/cms/${page.slug}`}
                    className="flex-1 px-3 py-2 bg-purple-100 text-purple-700 rounded-lg text-xs font-bold hover:bg-purple-200 transition-colors flex justify-center text-center shadow-sm"
                  >
                    {page.slug === 'agency' ? 'Visual Editor' : 'Data Editor'}
                  </Link>
                  <Link 
                    href={page.slug === 'agency' ? '/dashboard/cms/agency-editor' : `/dashboard/builder/${page.id}`}
                    className="flex-1 px-3 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition-colors flex items-center justify-center gap-1 shadow-sm group-hover:scale-[1.02]"
                  >
                    {page.slug === 'agency' ? 'Open Editor' : 'Pro Builder'} <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
