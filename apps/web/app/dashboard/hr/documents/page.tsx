"use client"

import { useState } from "react"
import { FileText, Printer, Download, Search, Plus } from "lucide-react"
import { useApi, fetchApi } from "@/lib/useApi"
import { toast } from "sonner"
import { format } from "date-fns"

export default function DocumentsPage() {
  const { data, mutate, isLoading } = useApi<any>("/hr/documents")
  const documents = data?.documents || []
  
  const [selectedDoc, setSelectedDoc] = useState<any>(null)
  
  // For creating a quick document
  const [isCreating, setIsCreating] = useState(false)
  const [formData, setFormData] = useState({
    name: "Experience Letter - Jane Doe",
    type: "EXPERIENCE_LETTER",
    content: "This is to certify that Jane Doe has been working with Acme Corp..."
  })

  const handleCreate = async () => {
    try {
      await fetchApi("/hr/documents", {
        method: "POST",
        body: JSON.stringify(formData)
      })
      toast.success("Document template saved")
      setIsCreating(false)
      mutate()
    } catch (err: any) {
      toast.error("Failed to create document")
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await fetchApi(`/hr/documents/${id}`, { method: "DELETE" })
      toast.success("Document deleted")
      if (selectedDoc?.id === id) setSelectedDoc(null)
      mutate()
    } catch (err) {
      toast.error("Failed to delete")
    }
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="flex flex-col md:flex-row h-full bg-[#050505] text-white overflow-hidden">
      
      {/* Sidebar List (hidden when printing) */}
      <div className="w-full md:w-80 border-r border-white/10 flex flex-col bg-black/20 print:hidden shrink-0">
        <div className="p-6 border-b border-white/10 flex-none">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold tracking-tight">Documents</h2>
            <button onClick={() => setIsCreating(true)} className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center hover:bg-blue-500/20 transition-colors">
              <Plus className="w-4 h-4" />
            </button>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input 
              placeholder="Search documents..." 
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-blue-500/50 text-white placeholder:text-white/30"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-1">
          {isLoading ? (
            <div className="text-center py-8 text-white/40 text-sm">Loading...</div>
          ) : documents.length === 0 ? (
            <div className="text-center py-8 text-white/40 text-sm">No documents found</div>
          ) : (
            documents.map((doc: any) => (
              <button 
                key={doc.id}
                onClick={() => { setSelectedDoc(doc); setIsCreating(false); }}
                className={`w-full text-left p-3 rounded-xl transition-all ${selectedDoc?.id === doc.id ? 'bg-blue-500/20 border-blue-500/30 border' : 'hover:bg-white/5 border border-transparent'}`}
              >
                <div className="font-medium text-sm text-white truncate mb-1">{doc.name}</div>
                <div className="flex justify-between items-center text-[10px] font-mono text-white/40">
                  <span>{doc.type.replace('_', ' ')}</span>
                  <span>{format(new Date(doc.createdAt), 'MMM d, yy')}</span>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main Content Area (this will be the printable area) */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#0a0a0a]">
        
        {isCreating ? (
          <div className="p-8 max-w-2xl mx-auto w-full print:hidden">
            <h2 className="text-xl font-bold mb-6">Create Document Template</h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-white/50 mb-1 block">Document Name</label>
                <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none" />
              </div>
              <div>
                <label className="text-xs text-white/50 mb-1 block">Type</label>
                <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none text-white appearance-none">
                  <option value="EXPERIENCE_LETTER">Experience Letter</option>
                  <option value="OFFER_LETTER">Offer Letter</option>
                  <option value="CERTIFICATE">Certificate</option>
                  <option value="CONTRACT">Contract</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-white/50 mb-1 block">Content (HTML/Text)</label>
                <textarea rows={12} value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none font-mono" />
              </div>
              <div className="flex gap-3">
                <button onClick={handleCreate} className="px-6 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-500 transition-colors">Save Document</button>
                <button onClick={() => setIsCreating(false)} className="px-6 py-2.5 bg-white/5 text-white text-sm font-medium rounded-xl hover:bg-white/10 transition-colors">Cancel</button>
              </div>
            </div>
          </div>
        ) : selectedDoc ? (
          <>
            {/* Viewer Toolbar (hidden when printing) */}
            <div className="flex-none px-8 py-4 border-b border-white/10 flex items-center justify-between bg-black/40 print:hidden">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                  <FileText className="w-5 h-5 text-white/60" />
                </div>
                <div>
                  <h3 className="font-bold text-white">{selectedDoc.name}</h3>
                  <p className="text-[10px] font-mono text-white/40">{selectedDoc.type}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleDelete(selectedDoc.id)} className="px-4 py-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 text-sm font-medium rounded-lg transition-colors">
                  Delete
                </button>
                <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-white text-black hover:bg-white/90 text-sm font-medium rounded-lg transition-colors shadow-lg">
                  <Printer className="w-4 h-4" /> Print / PDF
                </button>
              </div>
            </div>

            {/* Document Paper Viewer (this is what prints) */}
            <div className="flex-1 overflow-auto bg-[#0a0a0a] print:bg-white print:overflow-visible">
              <div className="p-8 md:p-12 print:p-0 flex justify-center">
                {/* A4 Paper Container */}
                <div className="w-full max-w-[210mm] min-h-[297mm] bg-white text-black p-[20mm] shadow-2xl print:shadow-none print:w-full print:max-w-none print:min-h-0 print:m-0 print:p-0">
                  <div className="border-b-2 border-black/10 pb-6 mb-8 flex items-center justify-between">
                    <div>
                      <h1 className="text-2xl font-black tracking-tighter">GREKAM CORP</h1>
                      <p className="text-xs text-gray-500 font-mono mt-1">123 Innovation Drive, Tech District</p>
                    </div>
                    <div className="text-right text-xs text-gray-500 font-mono">
                      Date: {format(new Date(), 'dd MMM yyyy')}<br/>
                      Ref: GRK-{selectedDoc.id.slice(-6).toUpperCase()}
                    </div>
                  </div>

                  {/* Document Body rendered safely */}
                  <div className="prose prose-sm max-w-none text-gray-800 leading-relaxed whitespace-pre-wrap"
                       dangerouslySetInnerHTML={{ __html: selectedDoc.content }} />

                  {/* Signature Block */}
                  <div className="mt-24 pt-8 w-48 text-center">
                    <div className="border-b border-black mb-2"></div>
                    <p className="font-bold text-sm">Authorized Signatory</p>
                    <p className="text-xs text-gray-500">Human Resources Dept.</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-white/30 print:hidden">
            <FileText className="w-12 h-12 mb-4 opacity-20" />
            <p>Select a document to preview or print</p>
          </div>
        )}
      </div>

      {/* CSS for printing - hides everything except the .print area and sets margins */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:bg-white, .print\\:bg-white * {
            visibility: visible;
          }
          .print\\:bg-white {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          @page {
            size: auto;
            margin: 20mm;
          }
        }
      `}} />
    </div>
  )
}
