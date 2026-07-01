"use client"

import { useState, useRef } from "react"
import {
  Upload, Search, Grid3X3, List, FolderOpen, File, Image, Film, FileText,
  Music, Archive, Download, Trash2, Eye, MoreVertical, Link2, Plus, X,
  CheckCircle, Clock, Tag, Star, Filter
} from "lucide-react"

// ─── Types ───────────────────────────────────────────────────────────────────

type AssetType = "IMAGE" | "VIDEO" | "DOCUMENT" | "AUDIO" | "ARCHIVE" | "OTHER"

interface Asset {
  id: string
  name: string
  type: AssetType
  size: string
  uploadedBy: string
  uploadedAt: string
  tags: string[]
  projectId: string
  projectName: string
  starred: boolean
  previewColor: string // used as CSS gradient placeholder for images
  url?: string
}

// ─── Config ──────────────────────────────────────────────────────────────────

const TYPE_CONFIG: Record<AssetType, { icon: React.ElementType; color: string; bg: string }> = {
  IMAGE:    { icon: Image,    color: "text-violet-400", bg: "bg-violet-400/10 border-violet-400/20" },
  VIDEO:    { icon: Film,     color: "text-blue-400",   bg: "bg-blue-400/10 border-blue-400/20" },
  DOCUMENT: { icon: FileText, color: "text-amber-400",  bg: "bg-amber-400/10 border-amber-400/20" },
  AUDIO:    { icon: Music,    color: "text-emerald-400",bg: "bg-emerald-400/10 border-emerald-400/20" },
  ARCHIVE:  { icon: Archive,  color: "text-slate-400",  bg: "bg-slate-400/10 border-slate-400/20" },
  OTHER:    { icon: File,     color: "text-muted-foreground", bg: "bg-muted/50 border-border/40" },
}

const PREVIEW_GRADIENTS = [
  "from-violet-600 to-blue-600",
  "from-rose-500 to-orange-500",
  "from-emerald-500 to-teal-500",
  "from-amber-500 to-yellow-400",
  "from-blue-600 to-cyan-500",
  "from-fuchsia-600 to-pink-500",
]

// ─── Seed Data ────────────────────────────────────────────────────────────────

const SEED_ASSETS: Asset[] = [
  { id: "a1", name: "RedBrick_Logo_Final_v3.ai", type: "IMAGE", size: "4.2 MB", uploadedBy: "Santhosh D.", uploadedAt: "Jun 12, 2025", tags: ["logo", "brand"], projectId: "proj_1", projectName: "RedBrick Brand Identity", starred: true, previewColor: PREVIEW_GRADIENTS[0], url: "https://images.unsplash.com/photo-1558655146-d09347e92766?w=400&q=80" },
  { id: "a2", name: "Brand_Guidelines_v2.pdf",   type: "DOCUMENT", size: "8.6 MB", uploadedBy: "Aisha R.", uploadedAt: "Jun 14, 2025", tags: ["guidelines", "brand"], projectId: "proj_1", projectName: "RedBrick Brand Identity", starred: false, previewColor: PREVIEW_GRADIENTS[3] },
  { id: "a3", name: "Hero_Video_MASTER.mp4",      type: "VIDEO", size: "1.2 GB", uploadedBy: "Priya A.", uploadedAt: "Jun 15, 2025", tags: ["hero", "video", "social"], projectId: "proj_3", projectName: "Fitburst Launch Video", starred: true, previewColor: PREVIEW_GRADIENTS[1] },
  { id: "a4", name: "Techflow_Wireframes_v4.fig", type: "IMAGE", size: "22.1 MB", uploadedBy: "Ravi K.", uploadedAt: "Jun 16, 2025", tags: ["ui", "wireframe"], projectId: "proj_2", projectName: "Techflow SaaS Redesign", starred: false, previewColor: PREVIEW_GRADIENTS[4], url: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=400&q=80" },
  { id: "a5", name: "SocialContent_Q3_Pack.zip",  type: "ARCHIVE", size: "340 MB", uploadedBy: "Maya S.", uploadedAt: "Jun 17, 2025", tags: ["social", "content"], projectId: "proj_4", projectName: "Spice Kitchen Socials Q3", starred: false, previewColor: PREVIEW_GRADIENTS[5] },
  { id: "a6", name: "VO_Draft_1.wav",             type: "AUDIO", size: "18.4 MB", uploadedBy: "Priya A.", uploadedAt: "Jun 18, 2025", tags: ["audio", "voiceover"], projectId: "proj_3", projectName: "Fitburst Launch Video", starred: false, previewColor: PREVIEW_GRADIENTS[2] },
  { id: "a7", name: "Storyboard_v1.pdf",          type: "DOCUMENT", size: "3.1 MB", uploadedBy: "Aisha R.", uploadedAt: "Jun 13, 2025", tags: ["storyboard", "pre-prod"], projectId: "proj_3", projectName: "Fitburst Launch Video", starred: true, previewColor: PREVIEW_GRADIENTS[3] },
  { id: "a8", name: "RedBrick_BusinessCard.png",  type: "IMAGE", size: "2.8 MB", uploadedBy: "Santhosh D.", uploadedAt: "Jun 17, 2025", tags: ["print", "brand"], projectId: "proj_1", projectName: "RedBrick Brand Identity", starred: false, previewColor: PREVIEW_GRADIENTS[0], url: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&q=80" },
  { id: "a9", name: "Packaging_3D_Render.png",    type: "IMAGE", size: "14.3 MB", uploadedBy: "Ravi K.", uploadedAt: "Jun 18, 2025", tags: ["3d", "packaging"], projectId: "proj_5", projectName: "Bloom Studios Packaging", starred: false, previewColor: PREVIEW_GRADIENTS[2], url: "https://images.unsplash.com/photo-1600607686527-6fb886090705?w=400&q=80" },
]

const ALL_PROJECTS = [...new Set(SEED_ASSETS.map(a => a.projectName))]
const ALL_TAGS = [...new Set(SEED_ASSETS.flatMap(a => a.tags))]

// ─── Component ────────────────────────────────────────────────────────────────

export default function AssetHub() {
  const [assets, setAssets] = useState<Asset[]>(SEED_ASSETS)
  const [view, setView] = useState<"GRID" | "LIST">("GRID")
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState<AssetType | "ALL">("ALL")
  const [projectFilter, setProjectFilter] = useState("ALL")
  const [starredOnly, setStarredOnly] = useState(false)
  const [selected, setSelected] = useState<Asset | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const toggleStar = (id: string) => {
    setAssets(prev => prev.map(a => a.id === id ? { ...a, starred: !a.starred } : a))
    if (selected?.id === id) setSelected(prev => prev ? { ...prev, starred: !prev.starred } : prev)
  }

  const handleDelete = (id: string) => {
    setAssets(prev => prev.filter(a => a.id !== id))
    if (selected?.id === id) setSelected(null)
    showToast("Asset deleted")
  }

  const handleFakeUpload = (names: string[]) => {
    const newAssets: Asset[] = names.map((name, i) => ({
      id: `a_new_${Date.now()}_${i}`,
      name,
      type: name.endsWith(".mp4") || name.endsWith(".mov") ? "VIDEO"
            : name.endsWith(".pdf") || name.endsWith(".docx") ? "DOCUMENT"
            : name.endsWith(".zip") || name.endsWith(".rar") ? "ARCHIVE"
            : name.endsWith(".wav") || name.endsWith(".mp3") ? "AUDIO"
            : "IMAGE",
      size: `${(Math.random() * 50 + 1).toFixed(1)} MB`,
      uploadedBy: "You",
      uploadedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      tags: [],
      projectId: "proj_new",
      projectName: "General",
      starred: false,
      previewColor: PREVIEW_GRADIENTS[Math.floor(Math.random() * PREVIEW_GRADIENTS.length)],
    }))
    setAssets(prev => [...newAssets, ...prev])
    showToast(`✅ ${names.length} file${names.length > 1 ? "s" : ""} uploaded!`)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) handleFakeUpload(files.map(f => f.name))
  }

  const filtered = assets.filter(a => {
    const matchSearch = a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
    const matchType = typeFilter === "ALL" || a.type === typeFilter
    const matchProject = projectFilter === "ALL" || a.projectName === projectFilter
    const matchStarred = !starredOnly || a.starred
    return matchSearch && matchType && matchProject && matchStarred
  })

  const totalSize = assets.reduce((s, a) => {
    const num = parseFloat(a.size)
    const unit = a.size.includes("GB") ? 1024 : 1
    return s + num * unit
  }, 0)

  return (
    <div
      className="flex flex-col h-full min-h-0 overflow-hidden bg-background relative"
      onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
      onDragLeave={e => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsDragging(false) }}
      onDrop={handleDrop}
    >
      {/* Drop Overlay */}
      {isDragging && (
        <div className="absolute inset-0 z-50 bg-primary/5 border-4 border-dashed border-primary/40 rounded-none flex items-center justify-center pointer-events-none">
          <div className="bg-card border border-primary/30 rounded-2xl px-10 py-8 text-center shadow-2xl">
            <Upload className="w-12 h-12 text-primary mx-auto mb-3" />
            <p className="text-lg font-bold text-primary">Drop files here</p>
            <p className="text-sm text-muted-foreground mt-1">They'll be added to the asset hub immediately</p>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="absolute top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border bg-emerald-500/10 border-emerald-500/30 text-emerald-300 text-sm font-medium">
          <CheckCircle className="w-4 h-4" /> {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex-none px-6 py-5 border-b border-border/50">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Asset Hub</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {assets.length} files · {totalSize.toFixed(0)} MB total
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setView(view === "GRID" ? "LIST" : "GRID")}
              className="p-2 rounded-lg bg-muted hover:bg-muted/80 text-muted-foreground transition-colors"
            >
              {view === "GRID" ? <List className="w-4 h-4" /> : <Grid3X3 className="w-4 h-4" />}
            </button>
            <input ref={fileInputRef} type="file" multiple className="hidden"
              onChange={e => { if (e.target.files) handleFakeUpload(Array.from(e.target.files).map(f => f.name)) }}
            />
            <button onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 bg-primary text-primary-foreground text-sm font-medium px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Upload className="w-4 h-4" /> Upload Files
            </button>
          </div>
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search files or tags..."
              className="w-full bg-muted/50 border border-border/50 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Type Filters */}
          <div className="flex gap-1.5">
            {(["ALL", "IMAGE", "VIDEO", "DOCUMENT", "AUDIO", "ARCHIVE"] as const).map(t => {
              const count = t === "ALL" ? assets.length : assets.filter(a => a.type === t).length
              return (
                <button key={t} onClick={() => setTypeFilter(t)}
                  className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border font-medium transition-all ${
                    typeFilter === t ? "bg-primary text-primary-foreground border-primary" : "border-border/50 text-muted-foreground hover:text-foreground hover:bg-muted/30"
                  }`}
                >
                  {t !== "ALL" && (() => { const Icon = TYPE_CONFIG[t].icon; return <Icon className="w-3 h-3" /> })()}
                  {t === "ALL" ? "All" : t.charAt(0) + t.slice(1).toLowerCase()} <span className="opacity-60">({count})</span>
                </button>
              )
            })}
          </div>

          {/* Project Filter */}
          <select value={projectFilter} onChange={e => setProjectFilter(e.target.value)}
            className="bg-muted/40 border border-border/50 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
          >
            <option value="ALL">All Projects</option>
            {ALL_PROJECTS.map(p => <option key={p} value={p}>{p}</option>)}
          </select>

          {/* Starred Toggle */}
          <button onClick={() => setStarredOnly(!starredOnly)}
            className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border font-medium transition-all ${
              starredOnly ? "bg-amber-400/10 border-amber-400/30 text-amber-400" : "border-border/50 text-muted-foreground hover:text-foreground"
            }`}
          >
            <Star className={`w-3 h-3 ${starredOnly ? "fill-amber-400" : ""}`} />
            Starred
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* Asset Grid/List */}
        <div className="flex-1 overflow-y-auto p-6">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <FolderOpen className="w-12 h-12 text-muted-foreground/30 mb-3" />
              <h3 className="text-lg font-medium text-foreground">No assets found</h3>
              <p className="text-sm text-muted-foreground mt-1">Try adjusting your filters or drag & drop files here.</p>
            </div>
          ) : view === "GRID" ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {/* Drop Zone Card */}
              <button onClick={() => fileInputRef.current?.click()}
                className="aspect-square border-2 border-dashed border-border/40 rounded-2xl hover:border-primary/50 hover:bg-primary/3 transition-all flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-primary group"
              >
                <Plus className="w-8 h-8 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-medium">Upload</span>
              </button>

              {filtered.map(asset => {
                const cfg = TYPE_CONFIG[asset.type]
                const Icon = cfg.icon
                return (
                  <button key={asset.id} onClick={() => setSelected(asset === selected ? null : asset)}
                    className={`group relative aspect-square rounded-2xl overflow-hidden border-2 transition-all text-left ${
                      selected?.id === asset.id ? "border-primary shadow-lg shadow-primary/20" : "border-border/40 hover:border-primary/40"
                    }`}
                  >
                    {/* Thumbnail / Placeholder */}
                    {asset.type === "IMAGE" && asset.url ? (
                      <div className="w-full h-full bg-muted/20 relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={asset.url} alt={asset.name} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                      </div>
                    ) : asset.type === "IMAGE" || asset.type === "VIDEO" ? (
                      <div className={`w-full h-full bg-gradient-to-br ${asset.previewColor} opacity-80 flex items-center justify-center`}>
                        <Icon className="w-8 h-8 text-white/60" />
                      </div>
                    ) : (
                      <div className={`w-full h-full flex items-center justify-center border ${cfg.bg}`}>
                        <Icon className={`w-10 h-10 ${cfg.color}`} />
                      </div>
                    )}

                    {/* Star */}
                    <button
                      onClick={e => { e.stopPropagation(); toggleStar(asset.id) }}
                      className="absolute top-2 left-2 p-1 rounded-md bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Star className={`w-3.5 h-3.5 ${asset.starred ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}`} />
                    </button>

                    {/* Bottom label */}
                    <div className="absolute bottom-0 left-0 right-0 bg-background/90 backdrop-blur-sm px-2 py-1.5">
                      <p className="text-[10px] font-medium text-foreground truncate">{asset.name}</p>
                      <p className="text-[9px] text-muted-foreground">{asset.size}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          ) : (
            // List View
            <div className="border border-border/50 rounded-2xl overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted/30">
                  <tr>
                    <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Name</th>
                    <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Project</th>
                    <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Tags</th>
                    <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">Size</th>
                    <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">Uploaded</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {filtered.map(asset => {
                    const cfg = TYPE_CONFIG[asset.type]
                    const Icon = cfg.icon
                    return (
                      <tr key={asset.id} onClick={() => setSelected(asset === selected ? null : asset)}
                        className={`cursor-pointer hover:bg-muted/20 transition-colors ${selected?.id === asset.id ? "bg-muted/40" : ""}`}
                      >
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center border flex-none ${cfg.bg}`}>
                              <Icon className={`w-4 h-4 ${cfg.color}`} />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-foreground truncate max-w-[220px]">{asset.name}</p>
                              <p className="text-[10px] text-muted-foreground">{asset.uploadedBy}</p>
                            </div>
                            {asset.starred && <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 flex-none" />}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground max-w-[140px] truncate">{asset.projectName}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1 flex-wrap">
                            {asset.tags.slice(0, 2).map(t => (
                              <span key={t} className="text-[10px] bg-muted/60 border border-border/40 rounded px-1.5 py-0.5 text-muted-foreground">{t}</span>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground text-right whitespace-nowrap">{asset.size}</td>
                        <td className="px-5 py-3 text-xs text-muted-foreground text-right whitespace-nowrap">{asset.uploadedAt}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Asset Detail Sidebar */}
        {selected && (
          <div className="flex-none w-72 border-l border-border/50 bg-card overflow-y-auto flex flex-col">
            <div className="flex-none px-5 py-4 border-b border-border/40 flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground">File Details</p>
              <button onClick={() => setSelected(null)} className="p-1 hover:bg-muted rounded-lg text-muted-foreground transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Preview */}
            <div className={`w-full aspect-video flex items-center justify-center relative overflow-hidden ${
              (selected.type === "IMAGE" || selected.type === "VIDEO")
                ? `bg-gradient-to-br ${selected.previewColor}`
                : "bg-muted/40"
            }`}>
              {selected.type === "IMAGE" && selected.url ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={selected.url} alt={selected.name} className="w-full h-full object-cover" />
              ) : (
                (() => { const Icon = TYPE_CONFIG[selected.type].icon; return <Icon className={`w-12 h-12 ${selected.type === "IMAGE" || selected.type === "VIDEO" ? "text-white/50" : TYPE_CONFIG[selected.type].color}`} /> })()
              )}
            </div>

            <div className="p-5 space-y-4 flex-1">
              <div>
                <p className="text-sm font-bold text-foreground leading-snug break-all">{selected.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{selected.size} · {selected.type}</p>
              </div>

              <div className="grid grid-cols-1 gap-2 text-xs">
                <div className="flex items-center justify-between py-2 border-b border-border/30">
                  <span className="text-muted-foreground">Project</span>
                  <span className="font-medium text-foreground text-right max-w-[140px] truncate">{selected.projectName}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border/30">
                  <span className="text-muted-foreground">Uploaded by</span>
                  <span className="font-medium text-foreground">{selected.uploadedBy}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border/30">
                  <span className="text-muted-foreground">Date</span>
                  <span className="font-medium text-foreground">{selected.uploadedAt}</span>
                </div>
              </div>

              {/* Tags */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Tags</p>
                <div className="flex flex-wrap gap-1.5">
                  {selected.tags.map(t => (
                    <span key={t} className="flex items-center gap-1 text-[10px] bg-muted/60 border border-border/40 rounded-md px-2 py-0.5 text-muted-foreground">
                      <Tag className="w-2.5 h-2.5" /> {t}
                    </span>
                  ))}
                  {selected.tags.length === 0 && <p className="text-xs text-muted-foreground">No tags</p>}
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 space-y-2">
                <button className="w-full flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors">
                  <Download className="w-4 h-4" /> Download
                </button>
                <button onClick={() => { showToast("🔗 Shareable link copied!") }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 bg-muted hover:bg-muted/80 text-foreground rounded-xl text-sm font-medium transition-colors"
                >
                  <Link2 className="w-4 h-4" /> Copy Link
                </button>
                <button onClick={() => toggleStar(selected.id)}
                  className={`w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors border ${
                    selected.starred ? "bg-amber-400/10 border-amber-400/20 text-amber-400" : "bg-muted hover:bg-muted/80 text-foreground border-border/40"
                  }`}
                >
                  <Star className={`w-4 h-4 ${selected.starred ? "fill-amber-400" : ""}`} />
                  {selected.starred ? "Starred" : "Add to Starred"}
                </button>
                <button onClick={() => handleDelete(selected.id)}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-destructive hover:bg-destructive/10 rounded-xl text-sm font-medium transition-colors"
                >
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
