"use client"

import { useState, useEffect } from "react"
import { Search, Plus, Star, Briefcase, Users, Mail, Phone, Tag, X, CheckCircle, Clock, ToggleLeft, ToggleRight, TrendingUp, Sparkles, Network, Loader2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useApi, fetchApi } from "@/lib/useApi"
import { toast } from "sonner"
import { SlideOver } from "@/components/SlideOver"

const TYPE_COLORS: Record<string, string> = {
  CREATIVE:    "text-violet-400 border-violet-500/20 bg-violet-500/10 shadow-[0_0_10px_rgba(139,92,246,0.2)]",
  TECHNICAL:   "text-blue-400 border-blue-500/20 bg-blue-500/10 shadow-[0_0_10px_rgba(59,130,246,0.2)]",
  OPERATIONAL: "text-amber-400 border-amber-500/20 bg-amber-500/10 shadow-[0_0_10px_rgba(251,191,36,0.2)]",
  SUPPLIER:    "text-slate-300 border-slate-500/20 bg-slate-500/10 shadow-[0_0_10px_rgba(148,163,184,0.2)]",
}

const AVAIL_CONFIG = {
  AVAILABLE:   { label: "Available",    color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", dot: "bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.8)]" },
  BUSY:        { label: "Busy",         color: "text-amber-400 bg-amber-500/10 border-amber-500/20",      dot: "bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.8)]" },
  UNAVAILABLE: { label: "Unavailable",  color: "text-red-400 bg-red-500/10 border-red-500/20",            dot: "bg-red-400 shadow-[0_0_10px_rgba(239,68,68,0.8)]" },
}

type Availability = keyof typeof AVAIL_CONFIG

function StarRating({ value, interactive = false, onRate }: { value: number; interactive?: boolean; onRate?: (r: number) => void }) {
  const [hover, setHover] = useState(0)
  return (
    <div className="flex items-center gap-1">
      {[1,2,3,4,5].map(i => (
        <button
          key={i}
          disabled={!interactive}
          onClick={() => interactive && onRate?.(i)}
          onMouseEnter={() => interactive && setHover(i)}
          onMouseLeave={() => interactive && setHover(0)}
          className={interactive ? "cursor-pointer" : "cursor-default"}
        >
          <Star className={`w-3.5 h-3.5 transition-colors ${
            i <= (hover || Math.round(value))
              ? "text-amber-400 fill-amber-400 drop-shadow-[0_0_5px_rgba(251,191,36,0.8)]"
              : "text-white/20"
          }`} />
        </button>
      ))}
      <span className="text-[10px] font-mono text-amber-400 ml-1 drop-shadow-[0_0_5px_rgba(251,191,36,0.5)]">{value.toFixed(1)}</span>
    </div>
  )
}

export default function VendorDirectory() {
  const { data, isLoading: loading, mutate } = useApi<{ data: any[], total: number }>('/vendors');
  const vendors = data?.data || [];

  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState("ALL")
  const [selected, setSelected] = useState<any | null>(null)
  
  const [isAddNodeOpen, setIsAddNodeOpen] = useState(false)
  const [newNode, setNewNode] = useState({
    company: "",
    vendorCode: "",
    type: "CREATIVE",
    email: "",
    skills: ""
  })

  // Rate handling
  const [isRating, setIsRating] = useState(false)
  const [ratingValue, setRatingValue] = useState(0)
  const [ratingComment, setRatingComment] = useState("")

  // Fetch full details of the selected vendor
  const { data: selectedVendorData, isLoading: selectedLoading, mutate: mutateSelected } = useApi<any>(
    selected ? `/vendors/${selected.id}` : null
  );
  
  const fullSelectedVendor = selectedVendorData || selected;

  const handleSubmitReview = async (vendorId: string) => {
    if (!ratingValue) return
    
    // As per schema, vendors don't natively have reviews stored, they have a generic float `rating`.
    // In a real application we would post a review model. Here we just update their rating via PATCH.
    try {
      await fetchApi(`/vendors/${vendorId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          rating: ratingValue
        })
      });
      toast.success("✅ Review Telemetry Uploaded");
      setIsRating(false);
      setRatingValue(0);
      setRatingComment("");
      mutate();
      if (selected) mutateSelected();
    } catch (err: any) {
      toast.error(err.message || "Failed to submit review.");
    }
  }

  const handleAddNode = async () => {
    if (!newNode.company || !newNode.email) return toast.error("Company and Email are required");
    try {
      await fetchApi("/vendors", {
        method: "POST",
        body: JSON.stringify({
          company: newNode.company,
          vendorCode: newNode.vendorCode,
          type: newNode.type,
          user: { name: newNode.company, email: newNode.email },
          skills: newNode.skills.split(',').map(s => s.trim()).filter(Boolean)
        })
      });
      toast.success("Vendor added to matrix");
      setIsAddNodeOpen(false);
      mutate();
    } catch(err: any) {
      toast.error(err.message || "Failed to add node");
    }
  }

  const filtered = vendors.filter((v: any) => {
    const vName = v.company || v.user?.name || "Unknown Vendor";
    const matchSearch = vName.toLowerCase().includes(search.toLowerCase()) ||
      v.skills.some((s: string) => s.toLowerCase().includes(search.toLowerCase()))
    const matchType = typeFilter === "ALL" || v.type === typeFilter
    return matchSearch && matchType
  })

  return (
    <div className="flex h-full min-h-0 overflow-hidden bg-transparent text-white relative">

      {/* Background Ambience */}
      <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-blue-600/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Left: Main Panel */}
      <div className={`flex flex-col flex-1 min-w-0 overflow-hidden transition-all duration-500 ${selected ? "mr-[400px]" : ""}`}>

        {/* Header */}
        <div className="flex-none px-8 py-6 border-b border-white/10 bg-black/20 backdrop-blur-md relative z-10">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.05)] relative overflow-hidden">
                <div className="absolute inset-0 bg-blue-500/20 animate-pulse mix-blend-overlay" />
                <Network className="w-6 h-6 text-blue-400 relative z-10" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Supply Chain Matrix</h1>
                <p className="text-xs font-mono tracking-widest uppercase text-white/40 mt-1">Vendor & Freelancer Telemetry</p>
              </div>
            </div>
            <button onClick={() => setIsAddNodeOpen(true)} className="group flex items-center gap-2 bg-white text-black font-bold tracking-widest uppercase text-[10px] px-5 py-3 rounded-xl hover:scale-105 transition-all shadow-[0_0_20px_rgba(255,255,255,0.15)] relative overflow-hidden">
              <div className="absolute inset-0 -translate-x-[150%] animate-[shimmer_2.5s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12" />
              <Plus className="w-4 h-4" /> Add Node
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex gap-4 ml-auto">
              <div className="flex gap-2 bg-white/5 p-1 rounded-xl border border-white/10 backdrop-blur-md">
                {["ALL", "CREATIVE", "TECHNICAL", "OPERATIONAL", "SUPPLIER"].map(t => (
                  <button key={t} onClick={() => setTypeFilter(t)}
                    className={`text-[9px] px-3 py-1.5 rounded-lg font-mono tracking-widest uppercase font-bold transition-all ${
                      typeFilter === t
                        ? "bg-white text-black shadow-[0_0_10px_rgba(255,255,255,0.2)]"
                        : "text-white/40 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {t === "ALL" ? "All" : t}
                  </button>
                ))}
              </div>
              <div className="relative w-64">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search network..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-2 text-xs font-mono text-white placeholder:text-white/30 focus:outline-none focus:border-white/30 transition-all backdrop-blur-md"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-8 relative z-10 custom-scrollbar">
          {loading ? (
            <div className="flex justify-center py-20 relative z-10">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                  {filtered.map((v: any, i: number) => {
                    const avail = AVAIL_CONFIG["AVAILABLE"]; // Mocking availability for UI since it's not in DB schema
                    const vName = v.company || v.user?.name || "Unknown";
                    return (
                      <motion.button 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: i * 0.05 }}
                        key={v.id} 
                        onClick={() => setSelected(v === selected ? null : v)}
                        className={`group bg-white/5 backdrop-blur-md border rounded-2xl p-6 transition-all text-left flex flex-col relative overflow-hidden ${
                          selected?.id === v.id
                            ? "border-blue-500/50 shadow-[0_0_30px_rgba(59,130,246,0.1)]"
                            : "border-white/10 hover:border-white/20 hover:-translate-y-1 hover:shadow-2xl"
                        }`}
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                        {/* Top row */}
                        <div className="flex items-start justify-between mb-4 relative z-10">
                          <div className="flex items-center gap-4">
                            <div className="relative">
                              <div className={`w-12 h-12 rounded-xl bg-black/40 flex items-center justify-center text-xl font-bold text-white/70 border border-white/10 shadow-[inset_0_0_10px_rgba(255,255,255,0.05)] ${selected?.id === v.id ? 'border-blue-500/30' : ''}`}>
                                {vName.charAt(0)}
                              </div>
                              <span className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-[#050505] ${avail.dot}`} />
                            </div>
                            <div>
                              <h3 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">{vName}</h3>
                              <p className="text-[10px] font-mono tracking-widest text-white/40 uppercase mt-0.5">{v.vendorCode}</p>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mb-4 relative z-10">
                          <span className={`text-[9px] font-mono font-bold uppercase tracking-widest px-2.5 py-1 rounded-lg border ${TYPE_COLORS[v.type]}`}>
                            {v.type}
                          </span>
                        </div>

                        <div className="relative z-10 mb-4">
                          <StarRating value={v.rating} />
                        </div>

                        {/* Skills */}
                        <div className="flex flex-wrap gap-2 mb-6 relative z-10">
                          {v.skills.slice(0, 3).map((skill: string) => (
                            <span key={skill} className="flex items-center gap-1.5 text-[9px] font-mono tracking-widest uppercase text-white/70 bg-white/5 px-2.5 py-1.5 rounded-lg border border-white/10">
                              <Tag className="w-2.5 h-2.5 text-blue-400" /> {skill}
                            </span>
                          ))}
                          {v.skills.length > 3 && (
                            <span className="text-[9px] font-mono tracking-widest uppercase text-white/40 bg-white/5 px-2.5 py-1.5 rounded-lg border border-white/10">
                              +{v.skills.length - 3}
                            </span>
                          )}
                        </div>

                        {/* Stats */}
                        <div className="mt-auto pt-4 border-t border-white/10 flex items-center justify-between text-[10px] font-mono tracking-widest uppercase relative z-10">
                          <div className="flex items-center gap-3 text-white/50">
                            <div className="flex items-center gap-1.5">
                              <Briefcase className="w-3.5 h-3.5" />
                              <span><span className="font-bold text-white">{v._count?.assignments || 0}</span> Active</span>
                            </div>
                          </div>
                          {v.dayRate && <span className="font-bold text-white bg-white/5 px-2 py-1 rounded-md border border-white/10">₹{v.dayRate.toLocaleString()}</span>}
                        </div>
                      </motion.button>
                    )
                  })}
                </AnimatePresence>
              </div>

              {filtered.length === 0 && (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <div className="w-16 h-16 border border-white/10 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
                    <Network className="w-8 h-8 text-white/20" />
                  </div>
                  <h3 className="text-[10px] font-mono font-bold tracking-widest uppercase text-white/40">No connections found in matrix</h3>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Right: Vendor Detail Drawer */}
      <AnimatePresence>
        {selected && (
          <motion.div 
            initial={{ x: 400 }}
            animate={{ x: 0 }}
            exit={{ x: 400 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="absolute right-0 top-0 h-full w-[400px] border-l border-white/10 bg-[#0a0a0a]/95 backdrop-blur-2xl overflow-y-auto custom-scrollbar flex flex-col z-50 shadow-2xl"
          >
            {/* Drawer Header */}
            <div className="flex-none px-8 py-6 border-b border-white/10 bg-black/40">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-white/5 flex items-center justify-center text-2xl font-bold text-white border border-white/10 shadow-[inset_0_0_20px_rgba(255,255,255,0.05)]">
                    {(fullSelectedVendor?.company || fullSelectedVendor?.user?.name || "?").charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">{fullSelectedVendor?.company || fullSelectedVendor?.user?.name || "Unknown"}</h2>
                    <p className="text-[10px] font-mono tracking-widest uppercase text-white/40 mt-1">{fullSelectedVendor?.vendorCode}</p>
                    <div className="mt-2">
                      <StarRating value={fullSelectedVendor?.rating || 0} />
                    </div>
                  </div>
                </div>
                <button onClick={() => setSelected(null)} className="p-2 hover:bg-white/10 rounded-xl transition-all text-white/50 hover:text-white border border-transparent hover:border-white/10">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Contact & Stats */}
            <div className="px-8 py-6 border-b border-white/10 space-y-4">
              <div className="flex items-center gap-3 text-xs font-mono text-white/70">
                <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center"><Mail className="w-4 h-4 text-blue-400" /></div>
                <a href={`mailto:${fullSelectedVendor?.user?.email}`} className="hover:text-blue-400 transition-colors truncate">{fullSelectedVendor?.user?.email || "N/A"}</a>
              </div>
              
              <div className="grid grid-cols-2 gap-3 pt-4">
                <div className="bg-white/5 rounded-xl p-4 text-center border border-white/10 shadow-[inset_0_0_10px_rgba(255,255,255,0.02)]">
                  <p className="text-2xl font-black text-blue-400">{fullSelectedVendor?.assignments?.length || 0}</p>
                  <p className="text-[9px] font-mono text-white/40 uppercase tracking-widest mt-1">Active</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4 text-center border border-white/10 shadow-[inset_0_0_10px_rgba(255,255,255,0.02)]">
                  <p className="text-2xl font-black text-amber-400">{fullSelectedVendor?.rating?.toFixed(1) || "0.0"}</p>
                  <p className="text-[9px] font-mono text-white/40 uppercase tracking-widest mt-1">Rating</p>
                </div>
              </div>
            </div>

            {/* Skills */}
            <div className="px-8 py-6 border-b border-white/10">
              <p className="text-[9px] font-mono font-bold uppercase tracking-widest text-white/40 mb-4">Capabilities</p>
              <div className="flex flex-wrap gap-2">
                {fullSelectedVendor?.skills?.map((skill: string) => (
                  <span key={skill} className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest font-bold text-white/80 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
                    <Tag className="w-3 h-3 text-blue-400" /> {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Reviews */}
            <div className="px-8 py-6 flex-1">
              <div className="flex items-center justify-between mb-6">
                <p className="text-[9px] font-mono font-bold uppercase tracking-widest text-white/40">Adjust Rating</p>
                <button onClick={() => setIsRating(!isRating)}
                  className="flex items-center gap-1.5 text-[9px] font-mono font-bold uppercase tracking-widest text-blue-400 hover:text-blue-300 transition-colors bg-blue-500/10 px-3 py-1.5 rounded-lg border border-blue-500/20"
                >
                  <Star className="w-3 h-3" /> Update
                </button>
              </div>

              <AnimatePresence>
                {isRating && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-6 p-5 rounded-xl bg-white/5 border border-white/10 space-y-4 overflow-hidden"
                  >
                    <div>
                      <p className="text-[9px] font-mono tracking-widest uppercase text-white/50 mb-2">New Rating Assessment</p>
                      <StarRating value={ratingValue} interactive onRate={setRatingValue} />
                    </div>
                    <div className="flex gap-3 mt-4">
                      <button onClick={() => { setIsRating(false); setRatingValue(0); setRatingComment("") }}
                        className="flex-1 text-[10px] font-mono font-bold tracking-widest uppercase py-2.5 rounded-xl border border-white/10 text-white/50 hover:text-white hover:bg-white/5 transition-colors"
                      >
                        Cancel
                      </button>
                      <button onClick={() => handleSubmitReview(fullSelectedVendor.id)} disabled={!ratingValue}
                        className="flex-1 text-[10px] font-mono font-bold tracking-widest uppercase py-2.5 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30 transition-colors disabled:opacity-50"
                      >
                        Submit
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-4">
                {/* We don't have historical reviews in the schema, just the rating. So we inform the user. */}
                <p className="text-[10px] font-mono tracking-widest uppercase text-white/30 text-center py-8">Historical logs not stored in current schema.</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <SlideOver title="Add New Node" open={isAddNodeOpen} onClose={() => setIsAddNodeOpen(false)}>
        <div className="p-6 space-y-6">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-white/50 mb-2 block">Company / Freelancer Name *</label>
            <input 
              value={newNode.company}
              onChange={e => setNewNode({...newNode, company: e.target.value})}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
              placeholder="E.g. Pixel Perfect Studios"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-white/50 mb-2 block">Contact Email *</label>
              <input 
                type="email"
                value={newNode.email}
                onChange={e => setNewNode({...newNode, email: e.target.value})}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
                placeholder="hello@example.com"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-white/50 mb-2 block">Vendor Code</label>
              <input 
                value={newNode.vendorCode}
                onChange={e => setNewNode({...newNode, vendorCode: e.target.value})}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:border-blue-500"
                placeholder="VND-001"
              />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-white/50 mb-2 block">Category Type</label>
            <select 
              value={newNode.type}
              onChange={e => setNewNode({...newNode, type: e.target.value})}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
            >
              <option value="CREATIVE">Creative</option>
              <option value="TECHNICAL">Technical</option>
              <option value="OPERATIONAL">Operational</option>
              <option value="SUPPLIER">Supplier</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-white/50 mb-2 block">Skills (comma separated)</label>
            <textarea 
              value={newNode.skills}
              onChange={e => setNewNode({...newNode, skills: e.target.value})}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 font-mono"
              placeholder="UI Design, Video Editing, Motion Graphics"
            />
          </div>
          
          <div className="pt-4 mt-6 border-t border-white/10">
            <button onClick={handleAddNode} className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold tracking-widest uppercase text-xs hover:bg-blue-500 transition-all">
              Add Node to Matrix
            </button>
          </div>
        </div>
      </SlideOver>
    </div>
  )
}
