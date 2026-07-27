"use client"

import { useState, useEffect } from "react"
import { Award, Plus, FileText, Image as ImageIcon, Settings, Download, Send, CheckCircle, Edit3 } from "lucide-react"
import { useApi, fetchApi } from "@/lib/useApi"
import { toast } from "sonner"
import Image from "next/image"

export default function CertificatesPage() {
  const [activeTab, setActiveTab] = useState<"TEMPLATES" | "ISSUED">("TEMPLATES")
  const [templates, setTemplates] = useState<any[]>([])
  const [issued, setIssued] = useState<any[]>([])
  
  const [showBuilder, setShowBuilder] = useState(false)
  
  const [builderData, setBuilderData] = useState({
    name: "New Certificate Template",
    backgroundUrl: "",
    watermarkUrl: "",
    educatorSignatureUrl: "",
    academyHeadSignatureUrl: "",
    primaryColor: "#9333ea",
    title: "CERTIFICATE OF COMPLETION",
    subtitle: "This is to certify that",
    description: "has successfully completed the comprehensive course on",
    dateText: "Date of Issue: {{ISSUE_DATE}}"
  })

  useEffect(() => {
    loadTemplates()
  }, [])

  const loadTemplates = async () => {
    try {
      const data = await fetchApi<any[]>('/academy/certificates/templates')
      setTemplates(data)
    } catch (err) {
      console.error(err)
    }
  }

  const handleSaveTemplate = async () => {
    // Generate HTML from builder data
    const htmlContent = `
      <html>
        <head>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700&family=Inter:wght@400;600&display=swap');
            body { margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; width: 297mm; height: 210mm; font-family: 'Inter', sans-serif; background: #fff; }
            .certificate { position: relative; width: 100%; height: 100%; box-sizing: border-box; padding: 40px; text-align: center; overflow: hidden; }
            .bg-image { position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; z-index: 1; opacity: 0.15; }
            .watermark { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 400px; opacity: 0.05; z-index: 1; pointer-events: none; }
            .border { position: absolute; top: 20px; left: 20px; right: 20px; bottom: 20px; border: 4px solid ${builderData.primaryColor}; z-index: 2; }
            .content { position: relative; z-index: 3; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; }
            .title { font-family: 'Cinzel', serif; font-size: 48px; color: ${builderData.primaryColor}; margin-bottom: 20px; letter-spacing: 4px; }
            .subtitle { font-size: 20px; color: #555; margin-bottom: 30px; }
            .student-name { font-size: 56px; font-weight: 600; color: #111; margin-bottom: 20px; font-style: italic; }
            .desc { font-size: 18px; color: #666; max-width: 700px; margin-bottom: 20px; line-height: 1.6; }
            .course-name { font-size: 28px; font-weight: 600; color: ${builderData.primaryColor}; margin-bottom: 50px; }
            .footer { display: flex; justify-content: space-between; width: 80%; margin-top: 40px; }
            .signature-box { text-align: center; }
            .signature-img { height: 60px; object-fit: contain; margin-bottom: 10px; }
            .signature-line { width: 200px; height: 2px; background: #333; margin-bottom: 10px; }
            .signature-title { font-size: 14px; font-weight: 600; color: #333; text-transform: uppercase; }
            .verify-code { position: absolute; bottom: 40px; right: 40px; font-size: 10px; color: #999; z-index: 3; }
          </style>
        </head>
        <body>
          <div class="certificate">
            {{BACKGROUND_URL_HTML}}
            {{WATERMARK_URL_HTML}}
            <div class="border"></div>
            <div class="content">
              <div class="title">${builderData.title}</div>
              <div class="subtitle">${builderData.subtitle}</div>
              <div class="student-name">{{STUDENT_NAME}}</div>
              <div class="desc">${builderData.description}</div>
              <div class="course-name">{{COURSE_NAME}}</div>
              <div class="footer">
                <div class="signature-box">
                  {{EDUCATOR_SIGNATURE_HTML}}
                  <div class="signature-line"></div>
                  <div class="signature-title">Course Educator</div>
                </div>
                <div class="signature-box">
                  <div style="font-size: 16px; margin-bottom: 20px; font-weight: 600;">${builderData.dateText}</div>
                </div>
                <div class="signature-box">
                  {{ACADEMY_HEAD_SIGNATURE_HTML}}
                  <div class="signature-line"></div>
                  <div class="signature-title">Academy Head</div>
                </div>
              </div>
            </div>
            <div class="verify-code">Verify at grekam.in/verify<br/>ID: {{VERIFICATION_CODE}}</div>
          </div>
        </body>
      </html>
    `

    // We do simple replaces to inject image tags conditionally
    let processedHtml = htmlContent;
    processedHtml = processedHtml.replace('{{BACKGROUND_URL_HTML}}', builderData.backgroundUrl ? `<img src="${builderData.backgroundUrl}" class="bg-image" />` : '');
    processedHtml = processedHtml.replace('{{WATERMARK_URL_HTML}}', builderData.watermarkUrl ? `<img src="${builderData.watermarkUrl}" class="watermark" />` : '');
    processedHtml = processedHtml.replace('{{EDUCATOR_SIGNATURE_HTML}}', builderData.educatorSignatureUrl ? `<img src="${builderData.educatorSignatureUrl}" class="signature-img" />` : '<div style="height: 60px; margin-bottom: 10px;"></div>');
    processedHtml = processedHtml.replace('{{ACADEMY_HEAD_SIGNATURE_HTML}}', builderData.academyHeadSignatureUrl ? `<img src="${builderData.academyHeadSignatureUrl}" class="signature-img" />` : '<div style="height: 60px; margin-bottom: 10px;"></div>');

    try {
      await fetchApi('/academy/certificates/templates', {
        method: 'POST',
        body: JSON.stringify({
          name: builderData.name,
          htmlContent: processedHtml,
          backgroundUrl: builderData.backgroundUrl,
          watermarkUrl: builderData.watermarkUrl,
          educatorSignatureUrl: builderData.educatorSignatureUrl,
          academyHeadSignatureUrl: builderData.academyHeadSignatureUrl
        })
      })
      toast.success("Template saved successfully!")
      setShowBuilder(false)
      loadTemplates()
    } catch (err) {
      toast.error("Failed to save template")
    }
  }

  // --- UI Components ---
  
  if (showBuilder) {
    return (
      <div className="flex h-full bg-[#050505] text-white overflow-hidden">
        {/* Sidebar Controls */}
        <div className="w-80 border-r border-white/10 flex flex-col p-6 overflow-y-auto space-y-6">
          <div>
            <h2 className="text-xl font-bold">Certificate Builder</h2>
            <p className="text-sm text-white/50">Design your certificate template</p>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="text-xs text-white/50 mb-1 block">Template Name</label>
              <input type="text" value={builderData.name} onChange={e => setBuilderData({...builderData, name: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-sm focus:border-purple-500 outline-none" />
            </div>
            
            <div>
              <label className="text-xs text-white/50 mb-1 block">Primary Color</label>
              <div className="flex gap-2">
                <input type="color" value={builderData.primaryColor} onChange={e => setBuilderData({...builderData, primaryColor: e.target.value})} className="w-8 h-8 rounded cursor-pointer bg-transparent border-0 p-0" />
                <input type="text" value={builderData.primaryColor} onChange={e => setBuilderData({...builderData, primaryColor: e.target.value})} className="flex-1 bg-white/5 border border-white/10 rounded-lg p-2 text-sm focus:border-purple-500 outline-none" />
              </div>
            </div>

            <div>
              <label className="text-xs text-white/50 mb-1 block">Certificate Title</label>
              <input type="text" value={builderData.title} onChange={e => setBuilderData({...builderData, title: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-sm focus:border-purple-500 outline-none" />
            </div>

            <div>
              <label className="text-xs text-white/50 mb-1 block">Watermark Image URL</label>
              <input type="text" placeholder="https://..." value={builderData.watermarkUrl} onChange={e => setBuilderData({...builderData, watermarkUrl: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-sm focus:border-purple-500 outline-none" />
            </div>
            
            <div className="pt-4 border-t border-white/10">
              <label className="text-xs font-bold text-white mb-2 block">Signatures</label>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-white/50 mb-1 block">Educator Signature URL</label>
                  <input type="text" placeholder="https://..." value={builderData.educatorSignatureUrl} onChange={e => setBuilderData({...builderData, educatorSignatureUrl: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-sm focus:border-purple-500 outline-none" />
                </div>
                <div>
                  <label className="text-xs text-white/50 mb-1 block">Academy Head Signature URL</label>
                  <input type="text" placeholder="https://..." value={builderData.academyHeadSignatureUrl} onChange={e => setBuilderData({...builderData, academyHeadSignatureUrl: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-sm focus:border-purple-500 outline-none" />
                </div>
              </div>
            </div>
            
          </div>
          
          <div className="mt-auto pt-6 flex gap-2">
            <button onClick={() => setShowBuilder(false)} className="flex-1 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-sm font-semibold">Cancel</button>
            <button onClick={handleSaveTemplate} className="flex-1 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 transition-colors text-sm font-semibold">Save Template</button>
          </div>
        </div>
        
        {/* Preview Area */}
        <div className="flex-1 bg-[#111] flex items-center justify-center p-8">
          {/* A4 Landscape Box for Preview */}
          <div className="bg-white text-black relative shadow-2xl flex flex-col items-center justify-center" style={{ width: '1056px', height: '816px', transform: 'scale(0.8)', transformOrigin: 'center' }}>
            {builderData.backgroundUrl && <img src={builderData.backgroundUrl} alt="bg" className="absolute top-0 left-0 w-full h-full object-cover opacity-15 pointer-events-none" />}
            {builderData.watermarkUrl && <img src={builderData.watermarkUrl} alt="watermark" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 opacity-5 pointer-events-none" />}
            
            <div className="absolute inset-5 border-4" style={{ borderColor: builderData.primaryColor }}></div>
            
            <div className="z-10 text-center flex flex-col items-center">
              <h1 className="text-6xl font-serif mb-6 tracking-widest" style={{ color: builderData.primaryColor }}>{builderData.title}</h1>
              <p className="text-2xl text-gray-600 mb-8">{builderData.subtitle}</p>
              
              <h2 className="text-6xl font-bold italic mb-6 text-gray-900 border-b-2 border-gray-300 pb-2 px-12">{"{Student Name}"}</h2>
              
              <p className="text-xl text-gray-600 max-w-3xl mb-8">{builderData.description}</p>
              
              <h3 className="text-4xl font-semibold mb-16" style={{ color: builderData.primaryColor }}>{"{Course Name}"}</h3>
              
              <div className="flex justify-between w-full max-w-4xl mt-8">
                <div className="flex flex-col items-center justify-end w-64">
                  {builderData.educatorSignatureUrl ? (
                    <img src={builderData.educatorSignatureUrl} alt="Educator Signature" className="h-16 object-contain mb-2" />
                  ) : (
                    <div className="h-16 w-full flex items-center justify-center border border-dashed border-gray-300 bg-gray-50 text-gray-400 text-xs mb-2 rounded">Educator Signature</div>
                  )}
                  <div className="w-full h-0.5 bg-black mb-2"></div>
                  <span className="font-semibold uppercase text-sm">Course Educator</span>
                </div>
                
                <div className="flex flex-col items-center justify-end">
                  <span className="font-semibold text-lg mb-8">Date: {"{Issue Date}"}</span>
                  <div className="w-16 h-16 rounded-full border-4 flex items-center justify-center opacity-20" style={{ borderColor: builderData.primaryColor }}>SEAL</div>
                </div>
                
                <div className="flex flex-col items-center justify-end w-64">
                  {builderData.academyHeadSignatureUrl ? (
                    <img src={builderData.academyHeadSignatureUrl} alt="Academy Head Signature" className="h-16 object-contain mb-2" />
                  ) : (
                    <div className="h-16 w-full flex items-center justify-center border border-dashed border-gray-300 bg-gray-50 text-gray-400 text-xs mb-2 rounded">Academy Head Signature</div>
                  )}
                  <div className="w-full h-0.5 bg-black mb-2"></div>
                  <span className="font-semibold uppercase text-sm">Academy Head</span>
                </div>
              </div>
            </div>
            
            <div className="absolute bottom-10 right-10 text-xs text-gray-400 text-right">
              Verify at grekam.in/verify<br/>
              ID: {"{Verify Code}"}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 h-full overflow-y-auto">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Certificates</h1>
          <p className="text-white/50">Manage certificate templates and issuance</p>
        </div>
        <button 
          onClick={() => setShowBuilder(true)}
          className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-colors">
          <Plus className="w-4 h-4" /> Create Template
        </button>
      </div>

      <div className="flex gap-4 border-b border-white/10 mb-8">
        <button 
          onClick={() => setActiveTab("TEMPLATES")}
          className={`pb-4 px-2 text-sm font-semibold transition-colors border-b-2 ${activeTab === "TEMPLATES" ? "border-purple-500 text-purple-400" : "border-transparent text-white/50 hover:text-white"}`}>
          Templates
        </button>
        <button 
          onClick={() => setActiveTab("ISSUED")}
          className={`pb-4 px-2 text-sm font-semibold transition-colors border-b-2 ${activeTab === "ISSUED" ? "border-purple-500 text-purple-400" : "border-transparent text-white/50 hover:text-white"}`}>
          Issued Certificates
        </button>
      </div>

      {activeTab === "TEMPLATES" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.length === 0 ? (
            <div className="col-span-full py-20 text-center border border-dashed border-white/10 rounded-3xl">
              <Award className="w-12 h-12 text-white/20 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No templates found</h3>
              <p className="text-white/50 mb-6">Create your first certificate template to start issuing them to students.</p>
              <button onClick={() => setShowBuilder(true)} className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg font-semibold transition-colors">
                Create Template
              </button>
            </div>
          ) : (
            templates.map(template => (
              <div key={template.id} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden group">
                <div className="h-40 bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center relative">
                  <Award className="w-12 h-12 text-white/30" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button className="bg-white text-black px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2">
                      <Edit3 className="w-4 h-4" /> Edit Template
                    </button>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-bold mb-1">{template.name}</h3>
                  <p className="text-xs text-white/50 flex items-center justify-between mt-4">
                    <span>{new Date(template.createdAt).toLocaleDateString()}</span>
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      )}
      
      {activeTab === "ISSUED" && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
           <FileText className="w-12 h-12 text-white/20 mx-auto mb-4" />
           <h3 className="text-lg font-semibold mb-2">Issued Certificates</h3>
           <p className="text-white/50">Certificates you issue to students will appear here.</p>
        </div>
      )}
    </div>
  )
}
