"use client"

import { useState } from "react"
import { Folder, FileText, Image as ImageIcon, Video, File, Plus, Upload, Search, Filter, MoreVertical, HardDrive, Share2, Download, Trash2, Sparkles, Loader2 } from "lucide-react"
import { useApi, fetchApi } from "@/lib/useApi"
import { SlideOver } from "@/components/SlideOver"
import { format } from "date-fns"
import { toast } from "sonner"

export default function DrivePage() {
  const [currentFolderId, setCurrentFolderId] = useState<string>("root")
  const { data, mutate, isLoading } = useApi<any>(`/drive/folders/${currentFolderId}/contents`)
  
  const folders = data?.folders || []
  const files = data?.files || []

  const [searchQuery, setSearchQuery] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [aiMatchedIds, setAiMatchedIds] = useState<string[] | null>(null)
  const [isAiSearching, setIsAiSearching] = useState(false)

  const handleSearchChange = (val: string) => {
    setSearchQuery(val)
    if (!val) {
      setAiMatchedIds(null)
    }
  }

  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false)
  const [newFolderName, setNewFolderName] = useState("")
  const [isSubmittingFolder, setIsSubmittingFolder] = useState(false)

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    setIsSubmittingFolder(true);
    try {
      await fetchApi('/drive/folders', {
        method: 'POST',
        body: JSON.stringify({
          name: newFolderName,
          parentId: currentFolderId === 'root' ? null : currentFolderId
        })
      });
      toast.success("Folder created successfully");
      setNewFolderName("");
      setIsCreateFolderOpen(false);
      mutate();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to create folder");
    } finally {
      setIsSubmittingFolder(false);
    }
  }

  const handleAiSearch = async () => {
    if (!searchQuery.trim()) return
    setIsAiSearching(true)
    try {
      const response = await fetch('/api/v1/crm/ai/search-drive', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: searchQuery,
          files: files.map((f: any) => ({ id: f.id, name: f.name, mimeType: f.mimeType }))
        })
      })
      const result = await response.json()
      if (result?.success && Array.isArray(result.matchedIds)) {
        setAiMatchedIds(result.matchedIds)
      } else {
        setAiMatchedIds([])
      }
    } catch (err) {
      console.error("AI Search failed", err)
    } finally {
      setIsAiSearching(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // 1. Get presigned URL from backend
      const { uploadUrl, key, downloadUrl } = await fetchApi<any>('/storage/upload-url', {
        method: 'POST',
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type,
          prefix: currentFolderId === 'root' ? 'drive/root' : `drive/${currentFolderId}`
        })
      });

      // 2. Upload directly to S3
      await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type
        }
      });

      // 3. Save file metadata to backend Drive API
      await fetchApi(`/drive/files`, {
        method: 'POST',
        body: JSON.stringify({
          name: file.name,
          mimeType: file.type,
          sizeBytes: file.size,
          fileUrl: downloadUrl,
          folderId: currentFolderId === 'root' ? null : currentFolderId
        })
      });

      mutate(); // refresh file list
    } catch (err) {
      console.error('Upload failed', err);
    } finally {
      setIsUploading(false);
    }
  };

  const getFilePreview = (file: any) => {
    if (file.mimeType.includes('image') && file.fileUrl) {
      return (
        <img 
          src={file.fileUrl} 
          alt={file.name} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
      );
    }
    if (file.mimeType.includes('image')) return <ImageIcon className="w-8 h-8 text-blue-400" />
    if (file.mimeType.includes('video')) return <Video className="w-8 h-8 text-purple-400" />
    if (file.mimeType.includes('pdf')) return <FileText className="w-8 h-8 text-red-400" />
    return <File className="w-8 h-8 text-white/40" />
  }

  const formatBytes = (bytes: number, decimals = 2) => {
    if (!+bytes) return '0 Bytes'
    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
  }

  const displayedFiles = files.filter((file: any) => {
    if (aiMatchedIds !== null) {
      return aiMatchedIds.includes(file.id)
    }
    return file.name.toLowerCase().includes(searchQuery.toLowerCase())
  })

  return (
    <div className="flex flex-col h-full bg-[#050505] text-white overflow-hidden">
      {/* Header */}
      <div className="flex-none px-8 py-6 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
            <HardDrive className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Asset Drive</h1>
            <p className="text-xs text-white/50 mt-1 font-mono">Storage &rsaquo; {currentFolderId === 'root' ? 'My Drive' : 'Folder'}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button onClick={() => setIsCreateFolderOpen(true)} className="flex items-center gap-2 px-4 py-2.5 bg-white/5 text-white font-medium rounded-xl hover:bg-white/10 transition-all border border-white/10">
            <Plus className="w-4 h-4" /> New Folder
          </button>
          
          <label className={`flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-500 transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] cursor-pointer ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
            <Upload className="w-4 h-4" /> {isUploading ? 'Uploading...' : 'Upload Files'}
            <input type="file" className="hidden" onChange={handleFileUpload} />
          </label>
        </div>
      </div>

      {/* Toolbar */}
      <div className="px-8 py-4 border-b border-white/10 flex items-center justify-between bg-black/20">
        <div className="flex items-center gap-2 text-sm font-bold">
          <button onClick={() => setCurrentFolderId("root")} className="text-white/50 hover:text-white transition-colors">My Drive</button>
          {currentFolderId !== "root" && (
            <>
              <span className="text-white/30">/</span>
              <span>Current Folder</span>
            </>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input 
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search in Drive..." 
              className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-12 py-2 text-sm focus:outline-none focus:border-blue-500/50 text-white placeholder:text-white/30"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAiSearch()
              }}
            />
            <button
              onClick={handleAiSearch}
              disabled={isAiSearching || !searchQuery.trim()}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-0.5 text-blue-400 hover:text-blue-300 transition-colors disabled:opacity-30 flex items-center"
              title="Semantic AI Search"
            >
              {isAiSearching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* File Explorer Content */}
      <div className="flex-1 overflow-auto custom-scrollbar p-8">
        {isLoading ? (
          <div className="text-center text-white/40 py-12">Loading Drive...</div>
        ) : folders.length === 0 && files.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-white/10 rounded-3xl max-w-2xl mx-auto">
            <Upload className="w-12 h-12 text-white/20 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Drop files here</h2>
            <p className="text-white/50 text-sm">or click the Upload button to add assets to this folder.</p>
          </div>
        ) : (
          <div className="space-y-8">
            
            {/* Folders Section */}
            {folders.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-white/50 uppercase tracking-widest mb-4">Folders</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {folders.map((folder: any) => (
                    <div 
                      key={folder.id} 
                      onClick={() => setCurrentFolderId(folder.id)}
                      className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-3 cursor-pointer hover:bg-white/10 transition-colors group"
                    >
                      <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg group-hover:bg-blue-500 flex-shrink-0 transition-colors">
                        <Folder className="w-5 h-5" />
                      </div>
                      <span className="font-bold text-sm truncate">{folder.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Files Section */}
            {displayedFiles.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-white/50 uppercase tracking-widest mb-4">
                  {aiMatchedIds !== null ? "AI Semantic Search Matches" : "Files"}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {displayedFiles.map((file: any) => (
                    <div key={file.id} className="bg-black/40 border border-white/10 rounded-2xl overflow-hidden group hover:border-white/20 transition-all">
                      <div className="aspect-square bg-white/[0.02] border-b border-white/10 flex items-center justify-center relative overflow-hidden group-hover:bg-white/[0.04]">
                        {getFilePreview(file)}
                        
                        {/* Hover Overlay Actions */}
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                          <button className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"><Download className="w-4 h-4" /></button>
                          <button className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"><Share2 className="w-4 h-4" /></button>
                          <button className="p-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-full transition-colors"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-bold text-sm truncate">{file.name}</h4>
                          <button className="text-white/30 hover:text-white"><MoreVertical className="w-4 h-4" /></button>
                        </div>
                        <div className="flex items-center gap-2 mt-2 text-[10px] font-mono text-white/40">
                          <span>{formatBytes(file.sizeBytes)}</span>
                          <span>•</span>
                          <span>{format(new Date(file.createdAt), 'MMM d, yyyy')}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
          </div>
        )}
      </div>
      
      {/* SlideOver for New Folder */}
      <SlideOver
        open={isCreateFolderOpen}
        onClose={() => setIsCreateFolderOpen(false)}
        title="Create New Folder"
        subtitle="Organize your files into logical directories."
      >
        <form onSubmit={handleCreateFolder} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Folder Name *</label>
            <input 
              required
              value={newFolderName}
              onChange={e => setNewFolderName(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500/50 text-white placeholder:text-white/30"
              placeholder="e.g. Brand Assets"
            />
          </div>
          <div className="pt-4 mt-6 border-t border-white/10">
            <button 
              type="submit"
              disabled={isSubmittingFolder}
              className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 transition-all disabled:opacity-50"
            >
              {isSubmittingFolder ? "Creating..." : "Create Folder"}
            </button>
          </div>
        </form>
      </SlideOver>
    </div>
  )
}
