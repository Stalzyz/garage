"use client"

import { FileText, Download, Clock, CheckCircle2, Image as ImageIcon, Video, File } from "lucide-react"
import { useApi, fetchApi } from "@/lib/useApi"
import { toast } from "sonner"
import { useSession } from "next-auth/react"

export default function ClientFilesPage() {
  const { data: session } = useSession()
  const { data: projectsData, isLoading, mutate } = useApi<any>("/projects?includeFiles=true")

  const projects = projectsData?.data || []

  // Aggregate all files across all projects
  const allFiles = projects.reduce((acc: any[], project: any) => {
    const projectFiles = project.files || [];
    return [...acc, ...projectFiles.map((f: any) => ({ ...f, projectName: project.name, projectId: project.id }))];
  }, []).sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <ImageIcon className="w-8 h-8 text-blue-400" />
    if (type.startsWith('video/')) return <Video className="w-8 h-8 text-purple-400" />
    return <FileText className="w-8 h-8 text-emerald-400" />
  }

  const handleApprove = async (projectId: string, fileId: string) => {
    try {
      await fetchApi(`/projects/${projectId}/files/${fileId}/approve`, {
        method: "POST",
        body: JSON.stringify({
          approvedBy: session?.user?.name || "Client"
        })
      });
      toast.success("File approved successfully!");
      mutate();
    } catch (err: any) {
      toast.error("Failed to approve file");
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Project Deliverables</h1>
        <p className="text-white/50 mt-2">All files, assets, and documents uploaded by the agency for your review.</p>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : allFiles.length === 0 ? (
          <div className="text-center py-20 text-white/40 font-mono text-xs uppercase border border-dashed border-white/10 rounded-2xl">
            No files have been uploaded yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allFiles.map((file: any) => (
              <div key={file.id} className="bg-black/40 border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-colors group">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                    {getFileIcon(file.type)}
                  </div>
                  {file.approvedAt ? (
                    <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded text-[10px] font-mono font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> APPROVED
                    </span>
                  ) : (
                    <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded text-[10px] font-mono font-bold flex items-center gap-1">
                      <Clock className="w-3 h-3" /> PENDING REVIEW
                    </span>
                  )}
                </div>
                
                <div>
                  <h3 className="font-bold text-sm text-white truncate" title={file.name}>{file.name}</h3>
                  <p className="text-[10px] text-white/40 mt-1 uppercase tracking-wider">{file.projectName}</p>
                </div>

                <div className="mt-6 flex gap-2">
                  <a 
                    href={file.url} 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex-1 py-2 bg-white/10 hover:bg-white/15 border border-white/10 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors text-white"
                  >
                    <Download className="w-3.5 h-3.5" /> Download
                  </a>
                  {!file.approvedAt && (
                    <button 
                      onClick={() => handleApprove(file.projectId, file.id)}
                      className="flex-1 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}
