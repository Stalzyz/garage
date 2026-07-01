"use client"

import { useState, useEffect } from "react"
import { Search, Folder, File, FileText, Image as ImageIcon, Video, CheckCircle2, MessageSquare, Download, AlertCircle, Clock, Check, X, ShieldAlert, History } from "lucide-react"

export default function AssetVault() {
  const [selectedFile, setSelectedFile] = useState<any>(null)
  
  const folders = [
    { id: 1, name: "Brand Assets", count: 12, size: "45 MB" },
    { id: 2, name: "Website Designs", count: 5, size: "120 MB" },
    { id: 3, name: "Source Files", count: 3, size: "850 MB" },
    { id: 4, name: "Contracts & Invoices", count: 8, size: "2 MB" }
  ]

  const [files, setFiles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/v1/workspace/assets')
      .then(res => res.json())
      .then(json => {
        setFiles(json.data || [])
        setLoading(false)
      })
      .catch(console.error)
  }, [])

  const handleApprove = async (id: string) => {
    try {
      const res = await fetch(`/api/v1/workspace/assets/${id}/approve`, { method: 'POST' })
      if (res.ok) {
        setFiles(prev => prev.map(f => f.id === id ? { ...f, approvedAt: new Date().toISOString() } : f))
        setSelectedFile((prev: any) => ({ ...prev, approvedAt: new Date().toISOString() }))
      }
    } catch (e) {
      console.error(e)
    }
  }

  const getIcon = (type: string) => {
    switch(type) {
      case 'figma': return <div className="w-10 h-10 rounded-xl bg-[#F24E1E]/20 flex items-center justify-center"><File className="w-5 h-5 text-[#F24E1E]" /></div>
      case 'pdf': return <div className="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center"><FileText className="w-5 h-5 text-rose-500" /></div>
      case 'video': return <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center"><Video className="w-5 h-5 text-blue-500" /></div>
      default: return <div className="w-10 h-10 rounded-xl bg-slate-500/20 flex items-center justify-center"><File className="w-5 h-5 text-slate-400" /></div>
    }
  }

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'approved': return <span className="flex items-center gap-1 px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg text-xs font-bold uppercase tracking-wider"><CheckCircle2 className="w-3 h-3" /> Approved</span>
      case 'rejected': return <span className="flex items-center gap-1 px-2.5 py-1 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-lg text-xs font-bold uppercase tracking-wider"><ShieldAlert className="w-3 h-3" /> Changes Req</span>
      default: return <span className="flex items-center gap-1 px-2.5 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-lg text-xs font-bold uppercase tracking-wider"><Clock className="w-3 h-3" /> Pending Review</span>
    }
  }

  return (
    <div className="flex h-full overflow-hidden">
      
      {/* Main Vault Area */}
      <div className="flex-1 p-8 overflow-y-auto custom-scrollbar flex flex-col h-full">
        <div className="flex justify-between items-end mb-8 shrink-0">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Asset Vault</h1>
            <p className="text-slate-400">Securely view, download, and approve project deliverables.</p>
          </div>
          <div className="flex gap-4">
            <div className="relative">
              <Search className="w-5 h-5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input type="text" placeholder="Search files..." className="w-64 pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-violet-500 transition-colors" />
            </div>
            <button className="px-6 py-2 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl shadow-lg shadow-violet-500/20 transition-all flex items-center gap-2">
              Upload Files
            </button>
          </div>
        </div>

        {/* Folders */}
        <h3 className="text-sm font-bold text-white/50 uppercase tracking-widest mb-4 shrink-0">Folders</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 shrink-0">
          {folders.map(f => (
            <div key={f.id} className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 cursor-pointer transition-colors group">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Folder className="w-5 h-5 text-violet-400" />
                </div>
              </div>
              <h4 className="text-white font-semibold mb-1">{f.name}</h4>
              <p className="text-xs text-slate-500">{f.count} files • {f.size}</p>
            </div>
          ))}
        </div>

        {/* Recent Deliverables */}
        <h3 className="text-sm font-bold text-white/50 uppercase tracking-widest mb-4 shrink-0">Recent Deliverables</h3>
        <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl overflow-hidden flex flex-col">
          <div className="grid grid-cols-12 gap-4 p-4 border-b border-white/5 text-xs font-bold text-white/50 uppercase tracking-widest bg-black/20">
            <div className="col-span-5">File Name</div>
            <div className="col-span-2">Date</div>
            <div className="col-span-3">Uploaded By</div>
            <div className="col-span-2">Status</div>
          </div>
          
          <div className="overflow-y-auto custom-scrollbar flex-1">
            {files.map(f => (
              <div 
                key={f.id} 
                onClick={() => setSelectedFile(f)}
                className={`grid grid-cols-12 gap-4 p-4 border-b border-white/5 cursor-pointer items-center transition-colors hover:bg-white/5 ${selectedFile?.id === f.id ? 'bg-violet-500/10' : ''}`}
              >
                <div className="col-span-5 flex items-center gap-3">
                  {getIcon(f.mimeType)}
                  <div>
                    <p className="text-sm font-medium text-white">{f.name}</p>
                    <p className="text-xs text-slate-500">{(f.fileSize / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                <div className="col-span-2 text-sm text-slate-400">{new Date(f.createdAt).toLocaleDateString()}</div>
                <div className="col-span-3 text-sm text-slate-400">{f.uploadedBy || 'System'}</div>
                <div className="col-span-2">{getStatusBadge(f.approvedAt ? 'approved' : 'pending')}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* File Inspector Side Panel */}
      {selectedFile && (
        <div className="w-96 bg-[#0a0a0f] border-l border-white/5 flex flex-col shrink-0">
          <div className="p-6 border-b border-white/5 flex justify-between items-center">
            <h3 className="text-white font-bold">File Inspector</h3>
            <button onClick={() => setSelectedFile(null)} className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
            {/* Preview Box */}
            <div className="w-full aspect-video bg-black/50 rounded-xl border border-white/10 flex flex-col items-center justify-center gap-3 shadow-inner">
              {getIcon(selectedFile.type)}
              <span className="text-sm font-medium text-white/50">No visual preview available</span>
            </div>

            {/* Details */}
            <div>
              <h2 className="text-lg font-bold text-white mb-2 break-words">{selectedFile.name}</h2>
              <div className="flex items-center gap-2 mb-6">
                {getStatusBadge(selectedFile.approvedAt ? 'approved' : 'pending')}
                <span className="text-xs text-slate-500">Version {selectedFile.version || '1.0'}</span>
              </div>
              
              <div className="space-y-3 p-4 bg-white/5 rounded-xl border border-white/5 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Size</span>
                  <span className="text-white font-medium">{(selectedFile.fileSize / 1024 / 1024).toFixed(2)} MB</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Uploaded</span>
                  <span className="text-white font-medium">{new Date(selectedFile.createdAt).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">By</span>
                  <span className="text-white font-medium">{selectedFile.uploadedBy || 'System'}</span>
                </div>
              </div>
            </div>

            {/* Approval Actions */}
            {!selectedFile.approvedAt && (
              <div className="space-y-3 border-t border-white/5 pt-8">
                <h3 className="text-sm font-bold text-white/50 uppercase tracking-widest mb-4">Client Action Required</h3>
                <button onClick={() => handleApprove(selectedFile.id)} className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-colors shadow-[0_0_15px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2">
                  <Check className="w-5 h-5" /> Approve Deliverable
                </button>
                <button className="w-full py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl transition-colors border border-white/10 flex items-center justify-center gap-2">
                  <MessageSquare className="w-5 h-5" /> Request Changes
                </button>
              </div>
            )}

            {/* Activity Trail */}
            <div className="border-t border-white/5 pt-8">
              <h3 className="flex items-center gap-2 text-sm font-bold text-white/50 uppercase tracking-widest mb-6">
                <History className="w-4 h-4" /> Audit Trail
              </h3>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center shrink-0 border border-violet-500/30">
                    <CheckCircle2 className="w-4 h-4 text-violet-400" />
                  </div>
                  <div>
                    <p className="text-sm text-white">Manager internally approved</p>
                    <p className="text-xs text-slate-500">Today, 10:45 AM</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
                    <File className="w-4 h-4 text-slate-400" />
                  </div>
                  <div>
                    <p className="text-sm text-white">Sarah uploaded file</p>
                    <p className="text-xs text-slate-500">Today, 10:30 AM</p>
                  </div>
                </div>
              </div>
            </div>
            
            <button className="w-full py-3 mt-8 bg-transparent hover:bg-white/5 text-slate-400 hover:text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2">
              <Download className="w-4 h-4" /> Download File
            </button>
          </div>
        </div>
      )}

    </div>
  )
}
