"use client"

import { useState } from "react"
import { FileText, Printer, Download, Search, Plus } from "lucide-react"
import { useApi, fetchApi } from "@/lib/useApi"
import { toast } from "sonner"
import { format } from "date-fns"
import { useOrganization } from "@/context/OrganizationContext"

export default function DocumentsPage() {
  const org = useOrganization()
  const { data, mutate, isLoading } = useApi<any>("/hr/documents")
  const documents = data?.documents || []
  
  const [selectedDoc, setSelectedDoc] = useState<any>(null)
  
  // For emailing directly from templates
  const { data: empData } = useApi<any>("/hr/employees")
  const allEmployees = empData?.employees || []
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false)
  const [selectedEmpId, setSelectedEmpId] = useState("")
  const [isEmailing, setIsEmailing] = useState(false)
  
  // For creating a quick document
  const [isCreating, setIsCreating] = useState(false)
  const [formData, setFormData] = useState({
    name: "Experience Letter - Jane Doe",
    type: "EXPERIENCE_LETTER",
    content: "This is to certify that Jane Doe has been working with Acme Corp..."
  })

  const handleCreate = async () => {
    try {
      // Auto-extract {{VARIABLES}} from content
      const regex = /\{\{([A-Z_]+)\}\}/g;
      const extractedVars = Array.from(formData.content.matchAll(regex)).map(m => m[1]);
      const uniqueVars = Array.from(new Set(extractedVars));

      await fetchApi("/hr/documents", {
        method: "POST",
        body: JSON.stringify({
          ...formData,
          variables: uniqueVars
        })
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

  const handleEmailDocument = async () => {
    if (!selectedDoc || !selectedEmpId) return
    setIsEmailing(true)
    try {
      // Find the employee object to get the email and userId
      const emp = allEmployees.find((e: any) => e.id === selectedEmpId)
      if (!emp) throw new Error("Employee not found")

      // 1. Generate the document to save to history and get ID
      const res = await fetchApi<any>("/documents/generate", {
        method: "POST",
        body: JSON.stringify({
          templateId: selectedDoc.id,
          userId: emp.userId
        })
      })
      
      // 2. Send the email with the document ID
      await fetchApi<any>("/documents/email", {
        method: "POST",
        body: JSON.stringify({
          documentId: res.documentId,
          emailTo: emp.user.email
        })
      })

      toast.success("Document generated and securely emailed!")
      setIsEmailModalOpen(false)
      setSelectedEmpId("")
    } catch (e: any) {
      console.error(e)
      toast.error(e.message || "Failed to email document")
    } finally {
      setIsEmailing(false)
    }
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
                <label className="text-xs text-white/50 mb-1 flex items-center justify-between">
                  <span>Content (HTML/Text)</span>
                  <span className="text-[10px] text-blue-400">Available: {'{{NAME}}, {{EMAIL}}, {{DESIGNATION}}, {{SALARY}}, {{CURRENCY}}, {{JOIN_DATE}}, {{EMPLOYEE_CODE}}, {{EMPLOYMENT_TYPE}}, {{DATE}}'}</span>
                </label>
                <textarea rows={12} value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none font-mono" placeholder="Use {{NAME}} to insert employee name dynamically..." />
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
                <button onClick={() => setIsEmailModalOpen(true)} className="px-4 py-2 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 text-sm font-medium rounded-lg transition-colors">
                  Email to Employee
                </button>
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
                    <div className="flex items-center gap-4">
                      {selectedDoc.type === 'CERTIFICATE' || selectedDoc.type === 'OFFER_LETTER' ? (
                        org.academyLogoUrl ? (
                          <img src={org.academyLogoUrl} alt="Academy Logo" className="w-16 h-16 object-contain" />
                        ) : (
                          <div className="w-16 h-16 bg-black text-white font-black text-2xl flex items-center justify-center rounded-xl">
                            A
                          </div>
                        )
                      ) : (
                        org.logoUrl ? (
                          <img src={org.logoUrl} alt={org.name} className="w-16 h-16 object-contain" />
                        ) : (
                          <div className="w-16 h-16 bg-blue-600 text-white font-black text-2xl flex items-center justify-center rounded-xl">
                            {org.name.charAt(0).toUpperCase()}
                          </div>
                        )
                      )}
                      <div>
                        <h1 className="text-2xl font-black tracking-tighter uppercase">{org.name}</h1>
                        <p className="text-xs text-gray-500 font-mono mt-1 whitespace-pre-wrap">{org.billingAddress ?? '123 Tech Lane, NY 10001'}</p>
                        {(org.website || org.phone) && (
                          <p className="text-xs text-gray-400 font-mono mt-1">
                            {org.website && <span>{org.website}</span>}
                            {org.website && org.phone && <span> | </span>}
                            {org.phone && <span>{org.phone}</span>}
                          </p>
                        )}
                      </div>
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

      {/* Email Modal */}
      {isEmailModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="w-full max-w-md bg-card border border-white/10 rounded-3xl overflow-hidden shadow-2xl relative">
            <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between">
              <h3 className="font-bold text-white text-lg">Email Document</h3>
              <button onClick={() => setIsEmailModalOpen(false)} className="text-white/40 hover:text-white transition-colors text-xs font-medium px-2.5 py-1 rounded-lg border border-white/10">Close</button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono tracking-widest uppercase text-white/50 block">Select Employee</label>
                <select 
                  value={selectedEmpId} 
                  onChange={e => setSelectedEmpId(e.target.value)} 
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500/50"
                >
                  <option value="">Choose an employee...</option>
                  {allEmployees.map((e: any) => (
                    <option key={e.id} value={e.id} className="bg-[#090d16]">{e.user?.firstName} {e.user?.lastName}</option>
                  ))}
                </select>
              </div>

              <div className="pt-4 border-t border-white/10">
                <button 
                  onClick={handleEmailDocument}
                  disabled={isEmailing || !selectedEmpId} 
                  className="w-full bg-blue-500/20 text-blue-400 font-bold border border-blue-500/30 py-3 rounded-xl hover:bg-blue-500/30 transition-all disabled:opacity-50"
                >
                  {isEmailing ? "Sending Email..." : "Send Document"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
