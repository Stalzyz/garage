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
    logoUrl: "",
    topRightDecorUrl: "",
    bottomRightDecorUrl: "",
    collaborationLogosStr: "",
    courseDuration: "September 2023 to December 2023",
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
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
            body { margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; width: 297mm; height: 210mm; font-family: 'Inter', sans-serif; background: #fff; color: #333; }
            .certificate { position: relative; width: 100%; height: 100%; box-sizing: border-box; background: #fff; overflow: hidden; display: flex; flex-direction: column; }
            
            /* Top Banner & Logo */
            .header { position: absolute; top: 0; left: 0; width: 100%; display: flex; justify-content: space-between; align-items: flex-start; padding: 40px 60px; height: 180px; box-sizing: border-box; }
            .logo-area { display: flex; flex-direction: column; }
            .logo-text { font-size: 28px; font-weight: 700; color: #2c93b6; }
            .logo-text span { color: #555; }
            .logo-sub { font-size: 10px; color: #555; margin-top: 4px; letter-spacing: 1px; margin-left: 20px; }
            
            /* Center Content Container - ensures perfect centering */
            .main-content { flex: 1; display: flex; flex-direction: column; justify-content: center; align-items: center; width: 100%; padding-top: 40px; box-sizing: border-box; }

            /* Center Elements */
            .center-area { display: flex; justify-content: center; align-items: center; margin-bottom: 50px; }
            .center-left { text-align: right; padding-right: 30px; border-right: 2px solid #5a8ea3; }
            .cert-title { font-size: 46px; font-weight: 600; color: #222; letter-spacing: 2px; line-height: 1; }
            .cert-subtitle { font-size: 22px; color: #444; margin-top: 8px; letter-spacing: 1px; }
            .center-right { text-align: left; padding-left: 30px; }
            .presented-to { font-size: 18px; color: #333; letter-spacing: 1px; margin-bottom: 15px; }
            .student-name { font-size: 42px; font-weight: 400; color: #4b8ba3; }
            
            /* Description */
            .desc-area { text-align: center; padding: 0 100px; margin-bottom: 70px; }
            .desc-text { font-size: 18px; color: #333; line-height: 1.6; letter-spacing: 1px; }
            .desc-course { font-weight: 700; color: #2c6e86; font-size: 22px; }
            .desc-date { font-size: 16px; font-weight: 700; color: #333; margin-top: 20px; letter-spacing: 1px; }
            
            /* Signatures */
            .signatures { display: flex; justify-content: space-between; align-items: flex-end; width: 100%; padding: 0 120px; box-sizing: border-box; }
            .sig-block { display: flex; flex-direction: column; align-items: center; width: 220px; }
            .sig-img { height: 60px; object-fit: contain; margin-bottom: 10px; }
            .sig-line { width: 100%; height: 1px; background: #333; margin-bottom: 10px; }
            .sig-title { font-size: 14px; color: #222; font-weight: 600; }
            .seal-block { display: flex; align-items: center; justify-content: center; width: 100px; }
            
            /* Footer */
            .footer { position: absolute; bottom: 40px; left: 0; width: 100%; text-align: center; font-size: 12px; color: #666; font-style: italic; }
            .collab-logos { position: absolute; bottom: 80px; left: 50%; transform: translateX(-50%); display: flex; gap: 20px; justify-content: center; align-items: center; }
          </style>
        </head>
        <body>
          <div class="certificate">
            
            <div class="header">
              {{LOGO_URL_HTML}}
            </div>
            
            {{TOP_RIGHT_DECOR_HTML}}
            
            <div class="main-content">
              <div class="center-area">
                <div class="center-left">
                  <div class="cert-title">CERTIFICATE</div>
                  <div class="cert-subtitle">OF COMPLETION</div>
                </div>
                <div class="center-right">
                  <div class="presented-to">THIS IS PROUDLY PRESENTED TO</div>
                  <div class="student-name">{{STUDENT_NAME}}</div>
                </div>
              </div>
              
              <div class="desc-area">
                <div class="desc-text">The certificate is presented for completing <span class="desc-course">{{COURSE_NAME}}</span> Course during the period</div>
                <div class="desc-date">${builderData.courseDuration}</div>
              </div>
              
              <div class="signatures">
                <div class="sig-block">
                  {{EDUCATOR_SIGNATURE_HTML}}
                  <div class="sig-line"></div>
                  <div class="sig-title">Mentor</div>
                </div>
                <div class="seal-block">
                  <div style="width: 80px; height: 80px; border-radius: 50%; border: 2px dashed #444; display: flex; align-items: center; justify-content: center; font-size: 8px; color: #444; text-align: center;">GREEKS ACADEMY<br/>Coimbatore</div>
                </div>
                <div class="sig-block">
                  {{ACADEMY_HEAD_SIGNATURE_HTML}}
                  <div class="sig-line"></div>
                  <div class="sig-title">Authorized Signature</div>
                </div>
              </div>
            </div>
            
            <div class="collab-logos">
              {{COLLAB_LOGOS_HTML}}
            </div>
            
            <div class="footer">
              96/53A, 2nd Cross Street Bharathi Colony, Peelamedu, Coimbatore, Tamil Nadu 641004 : Ph: 9843199556
            </div>
            
            {{BOTTOM_RIGHT_DECOR_HTML}}
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
    
    // Inject Custom Logos/Decors
    processedHtml = processedHtml.replace('{{LOGO_URL_HTML}}', builderData.logoUrl ? `<img src="${builderData.logoUrl}" style="height: 80px; object-fit: contain;" />` : '<div class="logo-area"><div class="logo-text">Greeks<span>Academy.com</span></div><div class="logo-sub">Art | Design | Animation | Programming</div></div>');
    processedHtml = processedHtml.replace('{{TOP_RIGHT_DECOR_HTML}}', builderData.topRightDecorUrl ? `<img src="${builderData.topRightDecorUrl}" style="position: absolute; top: 0; right: 0; width: 140px; object-fit: contain;" />` : '<div style="position: absolute; top: 0; right: 40px; width: 140px; height: 180px; background: linear-gradient(180deg, #4da4bc, #2c6e86); border-bottom-left-radius: 40px; border-bottom-right-radius: 40px; display: flex; justify-content: center; align-items: center;"><svg width="80" height="80" viewBox="0 0 100 100" fill="white" xmlns="http://www.w3.org/2000/svg"><path d="M50 20 L80 35 L50 50 L20 35 Z" fill="white"/><path d="M25 45 V70 L50 85 L75 70 V45 L50 60 Z" fill="white"/><circle cx="50" cy="50" r="25" fill="#2c6e86"/><text x="50" y="65" font-family="Arial" font-weight="bold" font-size="40" fill="white" text-anchor="middle">G</text></svg></div>');
    processedHtml = processedHtml.replace('{{BOTTOM_RIGHT_DECOR_HTML}}', builderData.bottomRightDecorUrl ? `<img src="${builderData.bottomRightDecorUrl}" style="position: absolute; bottom: 0; right: 0; width: 150px; object-fit: contain;" />` : '<div style="position: absolute; bottom: 0; right: 0; width: 100px; height: 100px; background: radial-gradient(circle at bottom right, #4da4bc 40%, transparent 41%);"></div>');
    
    // Inject Collab Logos
    const collabHtml = (builderData.collaborationLogosStr || "").split(',').filter(s=>s.trim()).map(url => `<img src="${url.trim()}" style="height: 40px; object-fit: contain;" />`).join('');
    processedHtml = processedHtml.replace('{{COLLAB_LOGOS_HTML}}', collabHtml);

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
            
            <div>
              <label className="text-xs text-white/50 mb-1 block">Main Logo URL</label>
              <input type="text" placeholder="https://..." value={builderData.logoUrl} onChange={e => setBuilderData({...builderData, logoUrl: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-sm focus:border-purple-500 outline-none" />
            </div>

            <div>
              <label className="text-xs text-white/50 mb-1 block">Course Duration</label>
              <input type="text" value={builderData.courseDuration} onChange={e => setBuilderData({...builderData, courseDuration: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-sm focus:border-purple-500 outline-none" />
            </div>
            
            <div className="pt-4 border-t border-white/10">
              <label className="text-xs font-bold text-white mb-2 block">Custom Decor</label>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-white/50 mb-1 block">Top Right Decor URL</label>
                  <input type="text" placeholder="https://..." value={builderData.topRightDecorUrl} onChange={e => setBuilderData({...builderData, topRightDecorUrl: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-sm focus:border-purple-500 outline-none" />
                </div>
                <div>
                  <label className="text-xs text-white/50 mb-1 block">Bottom Right Decor URL</label>
                  <input type="text" placeholder="https://..." value={builderData.bottomRightDecorUrl} onChange={e => setBuilderData({...builderData, bottomRightDecorUrl: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-sm focus:border-purple-500 outline-none" />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10">
              <label className="text-xs font-bold text-white mb-2 block">Collaboration Logos</label>
              <label className="text-xs text-white/50 mb-1 block">Comma separated URLs</label>
              <textarea rows={3} placeholder="https://logo1.png, https://logo2.png" value={builderData.collaborationLogosStr} onChange={e => setBuilderData({...builderData, collaborationLogosStr: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-sm focus:border-purple-500 outline-none" />
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
          <div className="bg-white relative shadow-2xl flex flex-col" style={{ width: '1056px', height: '816px', transform: 'scale(0.8)', transformOrigin: 'center', fontFamily: 'sans-serif' }}>
            
            {/* Header */}
            <div className="absolute top-0 left-0 w-full flex justify-between items-start pt-10 px-16 h-[180px]">
              {builderData.logoUrl ? (
                <img src={builderData.logoUrl} alt="Logo" className="h-[80px] object-contain" />
              ) : (
                <div className="flex flex-col">
                  <div className="text-3xl font-bold text-[#2c93b6]">Greeks<span className="text-[#555]">Academy.com</span></div>
                  <div className="text-[11px] text-[#555] mt-1 tracking-widest ml-4">Art | Design | Animation | Programming</div>
                </div>
              )}
            </div>

            {/* Top Right Banner */}
            {builderData.topRightDecorUrl ? (
              <img src={builderData.topRightDecorUrl} alt="Decor" className="absolute top-0 right-0 w-[140px] object-contain" />
            ) : (
              <div className="absolute top-0 right-10 w-[140px] h-[180px] bg-gradient-to-b from-[#4da4bc] to-[#2c6e86] rounded-b-[40px] flex items-center justify-center">
                <svg width="80" height="80" viewBox="0 0 100 100" fill="white" xmlns="http://www.w3.org/2000/svg">
                  <path d="M50 20 L80 35 L50 50 L20 35 Z" fill="white"/>
                  <path d="M25 45 V70 L50 85 L75 70 V45 L50 60 Z" fill="white"/>
                  <circle cx="50" cy="50" r="25" fill="#2c6e86"/>
                  <text x="50" y="65" fontFamily="Arial" fontWeight="bold" fontSize="40" fill="white" textAnchor="middle">G</text>
                </svg>
              </div>
            )}

            {/* Centered Main Content Wrapper */}
            <div className="flex-1 flex flex-col justify-center items-center w-full pt-10">
              
              {/* Center Title Block */}
              <div className="flex justify-center items-center mb-12">
                <div className="text-right pr-8 border-r-2 border-[#5a8ea3]">
                  <div className="text-[46px] font-semibold text-[#222] tracking-[2px] leading-none mb-2">{builderData.title}</div>
                  <div className="text-[22px] text-[#444] tracking-widest">{builderData.subtitle}</div>
                </div>
                <div className="text-left pl-8">
                  <div className="text-lg text-[#333] tracking-widest mb-4">THIS IS PROUDLY PRESENTED TO</div>
                  <div className="text-[42px] font-normal text-[#4b8ba3]">{"{Student Name}"}</div>
                </div>
              </div>

              {/* Description */}
              <div className="text-center px-[100px] mb-[70px]">
                <div className="text-lg text-[#333] leading-relaxed tracking-wide">
                  {builderData.description} <span className="font-bold text-[#2c6e86] text-[22px]">{"{Course Name}"}</span> Course during the period
                </div>
                <div className="text-base font-bold text-[#333] mt-6 tracking-wide">
                  {builderData.courseDuration}
                </div>
              </div>

              {/* Signatures */}
              <div className="flex justify-between items-end w-full px-[120px]">
                <div className="flex flex-col items-center w-[220px]">
                  {builderData.educatorSignatureUrl ? (
                    <img src={builderData.educatorSignatureUrl} alt="Mentor Signature" className="h-[60px] object-contain mb-3" />
                  ) : (
                    <div className="h-[60px] w-full flex items-center justify-center text-gray-400 text-xs mb-3">Mentor Signature Placeholder</div>
                  )}
                  <div className="w-full h-[1px] bg-[#333] mb-3"></div>
                  <div className="text-[14px] text-[#222] font-semibold">Mentor</div>
                </div>
                
                <div className="flex items-center justify-center w-[100px]">
                  {/* Seal Placeholder */}
                  <div className="w-[80px] h-[80px] rounded-full border-2 border-dashed border-[#444] flex items-center justify-center text-[8px] text-[#444] text-center">
                    GREEKS ACADEMY<br/>Coimbatore
                  </div>
                </div>
                
                <div className="flex flex-col items-center w-[220px]">
                  {builderData.academyHeadSignatureUrl ? (
                    <img src={builderData.academyHeadSignatureUrl} alt="Authorized Signature" className="h-[60px] object-contain mb-3" />
                  ) : (
                    <div className="h-[60px] w-full flex items-center justify-center text-gray-400 text-xs mb-3">Auth Signature Placeholder</div>
                  )}
                  <div className="w-full h-[1px] bg-[#333] mb-3"></div>
                  <div className="text-[14px] text-[#222] font-semibold">Authorized Signature</div>
                </div>
              </div>
            </div>

            {/* Collaboration Logos */}
            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-4 items-center justify-center">
              {(builderData.collaborationLogosStr || "").split(',').filter(s=>s.trim()).map((url, i) => (
                <img key={i} src={url.trim()} alt="Collab" className="h-10 object-contain" />
              ))}
            </div>

            {/* Footer */}
            <div className="absolute bottom-10 left-0 w-full text-center text-[12px] text-[#666] italic">
              96/53A, 2nd Cross Street Bharathi Colony, Peelamedu, Coimbatore, Tamil Nadu 641004 : Ph: 9843199556
            </div>

            {/* Bottom Right Decor */}
            {builderData.bottomRightDecorUrl ? (
              <img src={builderData.bottomRightDecorUrl} alt="Decor" className="absolute bottom-0 right-0 w-[150px] object-contain" />
            ) : (
              <div className="absolute bottom-0 right-0 w-[100px] h-[100px]" style={{ background: 'radial-gradient(circle at bottom right, #4da4bc 40%, transparent 41%)' }}></div>
            )}

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
