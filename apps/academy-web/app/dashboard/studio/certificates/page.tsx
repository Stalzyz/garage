"use client"

import { useState, useEffect } from "react"
import { Award, Plus, FileText, Image as ImageIcon, Settings, Download, Send, CheckCircle, Edit3, Sparkles, ShieldCheck, QrCode, Palette, Layers, Type } from "lucide-react"
import { useApi, fetchApi } from "@/lib/useApi"
import { toast } from "sonner"

export type ThemeType = 'GREEKS_MODERN' | 'ROYAL_GOLD' | 'CLASSIC_ACADEMIC' | 'CREATIVE_STUDIO'
export type BorderType = 'ORNATE' | 'DOUBLE_LINE' | 'MODERN_CORNERS' | 'NONE'
export type FontType = 'Inter' | 'Playfair Display' | 'Cinzel' | 'Montserrat'

export default function CertificatesPage() {
  const [activeTab, setActiveTab] = useState<"TEMPLATES" | "ISSUED">("TEMPLATES")
  const [templates, setTemplates] = useState<any[]>([])
  const [issued, setIssued] = useState<any[]>([])
  
  const [showBuilder, setShowBuilder] = useState(false)
  const [templateName, setTemplateName] = useState("New Certificate Template")

  // Theme & Design States
  const [theme, setTheme] = useState<ThemeType>('GREEKS_MODERN')
  const [borderStyle, setBorderStyle] = useState<BorderType>('DOUBLE_LINE')
  const [fontFamily, setFontFamily] = useState<FontType>('Inter')
  const [watermarkUrl, setWatermarkUrl] = useState("")
  const [watermarkOpacity, setWatermarkOpacity] = useState(10)
  const [showQrCode, setShowQrCode] = useState(true)

  // Content States
  const [mainLogoUrl, setMainLogoUrl] = useState("")
  const [certTitle, setCertTitle] = useState("CERTIFICATE")
  const [certSubtitle, setCertSubtitle] = useState("OF COMPLETION")
  const [presentedToText, setPresentedToText] = useState("THIS IS PROUDLY PRESENTED TO")
  const [courseDescription, setCourseDescription] = useState("The certificate is presented for completing {{COURSE_NAME}} Course during the period")
  const [courseDuration, setCourseDuration] = useState("September 2023 to December 2023")
  
  const [mentorTitle, setMentorTitle] = useState("Mentor")
  const [educatorSignatureUrl, setEducatorSignatureUrl] = useState("")
  const [authTitle, setAuthTitle] = useState("Authorized Signature")
  const [academyHeadSignatureUrl, setAcademyHeadSignatureUrl] = useState("")
  
  const [sealText, setSealText] = useState("GREEKS ACADEMY\nCoimbatore")
  const [collaborationLogosStr, setCollaborationLogosStr] = useState("")
  const [footerAddress, setFooterAddress] = useState("96/53A, 2nd Cross Street Bharathi Colony, Peelamedu, Coimbatore, Tamil Nadu 641004 : Ph: 9843199556")

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

  // Preset Colors & Theme Configs
  const getThemeStyles = () => {
    switch (theme) {
      case 'ROYAL_GOLD':
        return {
          primaryColor: '#c5a059',
          secondaryColor: '#8a6d3b',
          accentColor: '#d4af37',
          bgColor: '#fffdf7',
          textColor: '#2c2214',
          defaultFont: "'Playfair Display', Georgia, serif",
          sealBg: 'linear-gradient(135deg, #d4af37, #aa7c11)',
          sealColor: '#ffffff'
        }
      case 'CLASSIC_ACADEMIC':
        return {
          primaryColor: '#1e3a8a',
          secondaryColor: '#7f1d1d',
          accentColor: '#1e293b',
          bgColor: '#ffffff',
          textColor: '#1e293b',
          defaultFont: "'Cinzel', serif",
          sealBg: '#1e3a8a',
          sealColor: '#ffffff'
        }
      case 'CREATIVE_STUDIO':
        return {
          primaryColor: '#8b5cf6',
          secondaryColor: '#ec4899',
          accentColor: '#3b82f6',
          bgColor: '#ffffff',
          textColor: '#0f172a',
          defaultFont: "'Montserrat', sans-serif",
          sealBg: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
          sealColor: '#ffffff'
        }
      case 'GREEKS_MODERN':
      default:
        return {
          primaryColor: '#2c93b6',
          secondaryColor: '#2c6e86',
          accentColor: '#4da4bc',
          bgColor: '#ffffff',
          textColor: '#222222',
          defaultFont: "'Inter', sans-serif",
          sealBg: '#ffffff',
          sealColor: '#444444'
        }
    }
  }

  const themeConfig = getThemeStyles()

  const handleSaveTemplate = async () => {
    const collabHtml = (collaborationLogosStr || "").split(',').filter(s=>s.trim()).map(url => `<img src="${url.trim()}" style="height: 40px; object-fit: contain;" />`).join('');

    const fullHtml = `
      <html>
        <head>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Playfair+Display:ital,wght@0,600;0,700;1,400&family=Cinzel:wght@500;700&family=Montserrat:wght@400;600;700&display=swap');
            body { margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; width: 297mm; height: 210mm; font-family: ${fontFamily}, sans-serif; background: #fff; color: ${themeConfig.textColor}; }
            .certificate { position: relative; width: 100%; height: 100%; box-sizing: border-box; background: ${themeConfig.bgColor}; overflow: hidden; display: flex; flex-direction: column; justify-content: space-between; padding: 50px 70px; }
            
            /* Border Styles */
            ${borderStyle === 'DOUBLE_LINE' ? `
              .cert-border { position: absolute; inset: 20px; border: 2px solid ${themeConfig.primaryColor}; pointer-events: none; }
              .cert-border-inner { position: absolute; inset: 26px; border: 1px solid ${themeConfig.secondaryColor}; pointer-events: none; }
            ` : borderStyle === 'ORNATE' ? `
              .cert-border { position: absolute; inset: 15px; border: 4px double ${themeConfig.primaryColor}; pointer-events: none; }
            ` : borderStyle === 'MODERN_CORNERS' ? `
              .corner-tl { position: absolute; top: 20px; left: 20px; width: 60px; height: 60px; border-top: 4px solid ${themeConfig.primaryColor}; border-left: 4px solid ${themeConfig.primaryColor}; }
              .corner-br { position: absolute; bottom: 20px; right: 20px; width: 60px; height: 60px; border-bottom: 4px solid ${themeConfig.primaryColor}; border-right: 4px solid ${themeConfig.primaryColor}; }
            ` : ''}

            /* Watermark */
            ${watermarkUrl ? `
              .watermark-bg { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 450px; opacity: ${watermarkOpacity / 100}; pointer-events: none; }
            ` : ''}

            .header { display: flex; justify-content: space-between; align-items: flex-start; z-index: 10; }
            .logo-img { height: 70px; object-fit: contain; }
            
            .center-body { text-align: center; margin: auto 0; z-index: 10; }
            .cert-title { font-size: 48px; font-weight: 700; color: ${themeConfig.primaryColor}; letter-spacing: 4px; margin-bottom: 5px; }
            .cert-subtitle { font-size: 20px; color: ${themeConfig.secondaryColor}; letter-spacing: 2px; margin-bottom: 25px; }
            .presented-to { font-size: 16px; color: #555; letter-spacing: 1.5px; margin-bottom: 12px; }
            .student-name { font-size: 44px; font-weight: 600; color: ${themeConfig.primaryColor}; margin-bottom: 25px; border-bottom: 1px solid ${themeConfig.primaryColor}40; display: inline-block; padding-bottom: 8px; min-width: 400px; }
            
            .desc-text { font-size: 17px; color: #333; line-height: 1.6; max-width: 800px; margin: 0 auto 15px auto; }
            .course-duration { font-size: 15px; font-weight: 700; color: ${themeConfig.secondaryColor}; }

            .signatures-row { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 40px; padding: 0 40px; z-index: 10; }
            .sig-block { display: flex; flex-direction: column; align-items: center; width: 200px; }
            .sig-img { height: 50px; object-fit: contain; margin-bottom: 8px; }
            .sig-line { width: 100%; height: 1px; background: #333; margin-bottom: 6px; }
            .sig-title { font-size: 13px; font-weight: 600; color: #222; }

            .seal-box { width: 85px; height: 85px; border-radius: 50%; background: ${themeConfig.sealBg}; color: ${themeConfig.sealColor}; border: 2px solid ${themeConfig.primaryColor}; display: flex; align-items: center; justify-content: center; text-align: center; font-size: 9px; font-weight: bold; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
            
            .footer-row { display: flex; justify-content: space-between; align-items: center; margin-top: 20px; font-size: 11px; color: #666; z-index: 10; }
            .collab-container { display: flex; gap: 15px; align-items: center; }
            .qr-code { width: 50px; height: 50px; border: 1px solid #ccc; padding: 2px; }
          </style>
        </head>
        <body>
          <div class="certificate">
            ${borderStyle === 'DOUBLE_LINE' ? '<div class="cert-border"></div><div class="cert-border-inner"></div>' : ''}
            ${borderStyle === 'ORNATE' ? '<div class="cert-border"></div>' : ''}
            ${borderStyle === 'MODERN_CORNERS' ? '<div class="corner-tl"></div><div class="corner-br"></div>' : ''}

            ${watermarkUrl ? `<img src="${watermarkUrl}" class="watermark-bg" />` : ''}

            <div class="header">
              <div>
                ${mainLogoUrl ? `<img src="${mainLogoUrl}" class="logo-img" />` : `<div style="font-size: 26px; font-weight: 700; color: ${themeConfig.primaryColor};">Greeks<span style="color:#555">Academy.com</span></div>`}
              </div>
              ${showQrCode ? `
                <div style="text-align: right;">
                  <div style="font-size: 9px; color: #777; margin-bottom: 2px;">VERIFIED DIPLOMA</div>
                  <div class="qr-code" style="display: inline-block;">
                    <svg viewBox="0 0 100 100" width="46" height="46"><path d="M0,0 h30 v30 h-30 z M40,0 h10 v10 h-10 z M60,0 h40 v30 h-40 z M10,10 h10 v10 h-10 z M70,10 h20 v10 h-20 z M0,40 h10 v10 h-10 z M20,40 h20 v10 h-20 z M60,40 h30 v10 h-30 z M0,60 h40 v40 h-40 z M10,70 h20 v20 h-20 z M50,60 h20 v10 h-20 z M80,60 h20 v40 h-20 z" fill="${themeConfig.primaryColor}"/></svg>
                  </div>
                </div>
              ` : ''}
            </div>

            <div class="center-body">
              <div class="cert-title">${certTitle}</div>
              <div class="cert-subtitle">${certSubtitle}</div>
              
              <div class="presented-to">${presentedToText}</div>
              <div class="student-name">{{STUDENT_NAME}}</div>

              <div class="desc-text">${courseDescription.replace('{{COURSE_NAME}}', '<b>{{COURSE_NAME}}</b>')}</div>
              <div class="course-duration">${courseDuration}</div>
            </div>

            <div class="signatures-row">
              <div class="sig-block">
                ${educatorSignatureUrl ? `<img src="${educatorSignatureUrl}" class="sig-img" />` : '{{EDUCATOR_SIGNATURE_HTML}}'}
                <div class="sig-line"></div>
                <div class="sig-title">${mentorTitle}</div>
              </div>

              <div class="seal-box">
                ${sealText.replace('\n', '<br/>')}
              </div>

              <div class="sig-block">
                ${academyHeadSignatureUrl ? `<img src="${academyHeadSignatureUrl}" class="sig-img" />` : '{{ACADEMY_HEAD_SIGNATURE_HTML}}'}
                <div class="sig-line"></div>
                <div class="sig-title">${authTitle}</div>
              </div>
            </div>

            <div class="footer-row">
              <div style="font-style: italic;">${footerAddress}</div>
              <div class="collab-container">
                ${collabHtml}
              </div>
            </div>
          </div>
        </body>
      </html>
    `

    try {
      await fetchApi('/academy/certificates/templates', {
        method: 'POST',
        body: JSON.stringify({
          name: templateName,
          htmlContent: fullHtml
        })
      })
      toast.success("Template saved successfully!")
      setShowBuilder(false)
      loadTemplates()
    } catch (err) {
      toast.error("Failed to save template")
    }
  }

  // --- Render Builder UI ---
  if (showBuilder) {
    return (
      <div className="flex h-full bg-[#08080a] text-white overflow-hidden">
        {/* Left Sidebar Controls */}
        <div className="w-88 border-r border-white/10 flex flex-col p-6 overflow-y-auto space-y-6">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <div>
              <h2 className="text-lg font-bold">Rich Certificate Studio</h2>
              <p className="text-xs text-white/50">Configure themes, frames & branding</p>
            </div>
          </div>

          {/* Template Name */}
          <div>
            <label className="text-xs text-white/50 mb-1 block">Template Name</label>
            <input type="text" value={templateName} onChange={e => setTemplateName(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-sm focus:border-purple-500 outline-none" />
          </div>

          {/* 1. Theme Picker */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5" /> Designer Theme
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'GREEKS_MODERN', label: 'Greeks Modern', color: 'from-cyan-500 to-blue-600' },
                { id: 'ROYAL_GOLD', label: 'Royal Executive', color: 'from-amber-400 to-yellow-600' },
                { id: 'CLASSIC_ACADEMIC', label: 'Classic University', color: 'from-blue-900 to-indigo-900' },
                { id: 'CREATIVE_STUDIO', label: 'Creative Studio', color: 'from-pink-500 to-purple-600' },
              ].map(t => (
                <button key={t.id} onClick={() => setTheme(t.id as ThemeType)} className={`p-2.5 rounded-lg border text-left flex flex-col gap-1.5 transition-all ${theme === t.id ? 'border-purple-500 bg-purple-500/10 ring-1 ring-purple-500' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}>
                  <div className={`h-2.5 w-full rounded bg-gradient-to-r ${t.color}`} />
                  <span className="text-xs font-semibold">{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Border & Frame Options */}
          <div className="space-y-2 pt-4 border-t border-white/10">
            <label className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" /> Frame & Border Style
            </label>
            <select value={borderStyle} onChange={e => setBorderStyle(e.target.value as BorderType)} className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs focus:border-purple-500 outline-none">
              <option value="DOUBLE_LINE" className="bg-gray-900">Double Line Border</option>
              <option value="ORNATE" className="bg-gray-900">Ornate Luxury Frame</option>
              <option value="MODERN_CORNERS" className="bg-gray-900">Modern Corner Accents</option>
              <option value="NONE" className="bg-gray-900">Minimal / No Border</option>
            </select>
          </div>

          {/* 3. Typography Presets */}
          <div className="space-y-2 pt-4 border-t border-white/10">
            <label className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
              <Type className="w-3.5 h-3.5" /> Typography Preset
            </label>
            <select value={fontFamily} onChange={e => setFontFamily(e.target.value as FontType)} className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs focus:border-purple-500 outline-none">
              <option value="Inter" className="bg-gray-900">Inter (Modern Clean)</option>
              <option value="Playfair Display" className="bg-gray-900">Playfair Display (Luxury Serif)</option>
              <option value="Cinzel" className="bg-gray-900">Cinzel (Classic Diplomatic)</option>
              <option value="Montserrat" className="bg-gray-900">Montserrat (Bold Tech)</option>
            </select>
          </div>

          {/* 4. Watermark & Branding */}
          <div className="space-y-3 pt-4 border-t border-white/10">
            <label className="text-xs font-bold text-purple-400 uppercase tracking-wider block">Branding & Assets</label>

            <div>
              <label className="text-xs text-white/50 mb-1 block">Main Logo URL</label>
              <input type="text" placeholder="https://logo.png" value={mainLogoUrl} onChange={e => setMainLogoUrl(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs focus:border-purple-500 outline-none" />
            </div>

            <div>
              <label className="text-xs text-white/50 mb-1 block">Watermark Image URL</label>
              <input type="text" placeholder="https://watermark.png" value={watermarkUrl} onChange={e => setWatermarkUrl(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs focus:border-purple-500 outline-none" />
            </div>

            {watermarkUrl && (
              <div>
                <div className="flex justify-between text-xs text-white/50 mb-1">
                  <span>Watermark Opacity</span>
                  <span>{watermarkOpacity}%</span>
                </div>
                <input type="range" min={0} max={30} value={watermarkOpacity} onChange={e => setWatermarkOpacity(parseInt(e.target.value))} className="w-full accent-purple-500" />
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-white/70">Show Verification QR Code</span>
              <input type="checkbox" checked={showQrCode} onChange={e => setShowQrCode(e.target.checked)} className="w-4 h-4 accent-purple-500 rounded cursor-pointer" />
            </div>
          </div>

          {/* 5. Content Texts & Signatures */}
          <div className="space-y-3 pt-4 border-t border-white/10">
            <label className="text-xs font-bold text-purple-400 uppercase tracking-wider block">Content & Signatures</label>

            <div>
              <label className="text-xs text-white/50 mb-1 block">Certificate Title</label>
              <input type="text" value={certTitle} onChange={e => setCertTitle(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs focus:border-purple-500 outline-none" />
            </div>

            <div>
              <label className="text-xs text-white/50 mb-1 block">Course Duration Text</label>
              <input type="text" value={courseDuration} onChange={e => setCourseDuration(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs focus:border-purple-500 outline-none" />
            </div>

            <div>
              <label className="text-xs text-white/50 mb-1 block">Educator Signature URL</label>
              <input type="text" placeholder="https://sig1.png" value={educatorSignatureUrl} onChange={e => setEducatorSignatureUrl(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs focus:border-purple-500 outline-none" />
            </div>

            <div>
              <label className="text-xs text-white/50 mb-1 block">Academy Head Signature URL</label>
              <input type="text" placeholder="https://sig2.png" value={academyHeadSignatureUrl} onChange={e => setAcademyHeadSignatureUrl(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs focus:border-purple-500 outline-none" />
            </div>

            <div>
              <label className="text-xs text-white/50 mb-1 block">Collaboration Logos (Comma-separated URLs)</label>
              <textarea rows={2} placeholder="https://logo1.png, https://logo2.png" value={collaborationLogosStr} onChange={e => setCollaborationLogosStr(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs focus:border-purple-500 outline-none" />
            </div>
          </div>

          <div className="mt-auto pt-6 flex gap-2">
            <button onClick={() => setShowBuilder(false)} className="flex-1 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-xs font-semibold">Cancel</button>
            <button onClick={handleSaveTemplate} className="flex-1 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 transition-colors text-xs font-semibold">Save Template</button>
          </div>
        </div>

        {/* Live A4 Preview Canvas */}
        <div className="flex-1 bg-[#111] flex items-center justify-center p-8 overflow-auto">
          <div className="relative shadow-2xl transition-all duration-300 flex flex-col justify-between p-[50px_70px]" style={{ width: '1056px', height: '747px', backgroundColor: themeConfig.bgColor, color: themeConfig.textColor, fontFamily: fontFamily, transform: 'scale(0.85)', transformOrigin: 'center' }}>
            
            {/* Dynamic Borders */}
            {borderStyle === 'DOUBLE_LINE' && (
              <>
                <div className="absolute inset-[20px] border-2 pointer-events-none" style={{ borderColor: themeConfig.primaryColor }} />
                <div className="absolute inset-[26px] border pointer-events-none" style={{ borderColor: themeConfig.secondaryColor }} />
              </>
            )}
            {borderStyle === 'ORNATE' && (
              <div className="absolute inset-[15px] border-4 border-double pointer-events-none" style={{ borderColor: themeConfig.primaryColor }} />
            )}
            {borderStyle === 'MODERN_CORNERS' && (
              <>
                <div className="absolute top-[20px] left-[20px] w-[60px] h-[60px] border-t-4 border-l-4 pointer-events-none" style={{ borderColor: themeConfig.primaryColor }} />
                <div className="absolute bottom-[20px] right-[20px] w-[60px] h-[60px] border-b-4 border-r-4 pointer-events-none" style={{ borderColor: themeConfig.primaryColor }} />
              </>
            )}

            {/* Watermark Overlay */}
            {watermarkUrl && (
              <img src={watermarkUrl} alt="Watermark" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] pointer-events-none transition-opacity" style={{ opacity: watermarkOpacity / 100 }} />
            )}

            {/* Header */}
            <div className="flex justify-between items-start z-10">
              <div>
                {mainLogoUrl ? (
                  <img src={mainLogoUrl} alt="Logo" className="h-[70px] object-contain" />
                ) : (
                  <div className="text-3xl font-bold" style={{ color: themeConfig.primaryColor }}>
                    Greeks<span className="text-[#555]">Academy.com</span>
                    <div className="text-[10px] text-[#555] tracking-widest mt-1">Art | Design | Animation | Programming</div>
                  </div>
                )}
              </div>

              {showQrCode && (
                <div className="text-right">
                  <div className="text-[9px] text-gray-500 tracking-wider mb-1">VERIFIED DIPLOMA</div>
                  <div className="w-[50px] h-[50px] border border-gray-300 p-1 bg-white inline-flex items-center justify-center">
                    <QrCode className="w-10 h-10 text-gray-800" />
                  </div>
                </div>
              )}
            </div>

            {/* Main Center Content */}
            <div className="text-center my-auto z-10">
              <div className="text-[48px] font-bold tracking-[4px] leading-tight mb-1" style={{ color: themeConfig.primaryColor }}>
                {certTitle}
              </div>
              <div className="text-[20px] tracking-[2px] mb-6" style={{ color: themeConfig.secondaryColor }}>
                {certSubtitle}
              </div>

              <div className="text-[16px] text-gray-600 tracking-wider mb-3">
                {presentedToText}
              </div>

              <div className="text-[44px] font-semibold mb-6 border-b inline-block pb-2 min-w-[400px]" style={{ color: themeConfig.primaryColor, borderColor: `${themeConfig.primaryColor}40` }}>
                {"{Student Name}"}
              </div>

              <div className="text-[17px] text-gray-700 leading-relaxed max-w-[800px] mx-auto mb-4">
                The certificate is presented for completing <span className="font-bold" style={{ color: themeConfig.secondaryColor }}>{"{Course Name}"}</span> Course during the period
              </div>

              <div className="text-[15px] font-bold tracking-wide" style={{ color: themeConfig.secondaryColor }}>
                {courseDuration}
              </div>
            </div>

            {/* Signatures & Seal */}
            <div className="flex justify-between items-end px-10 mt-6 z-10">
              <div className="flex flex-col items-center w-[200px]">
                {educatorSignatureUrl ? (
                  <img src={educatorSignatureUrl} alt="Mentor Sig" className="h-[50px] object-contain mb-2" />
                ) : (
                  <div className="h-[50px] flex items-center text-xs text-gray-400">Mentor Signature Placeholder</div>
                )}
                <div className="w-full h-[1px] bg-gray-800 mb-1.5" />
                <div className="text-[13px] font-semibold text-gray-800">{mentorTitle}</div>
              </div>

              {/* Central Metallic/Custom Seal */}
              <div className="w-[85px] h-[85px] rounded-full border-2 flex items-center justify-center text-center text-[9px] font-bold shadow-lg" style={{ background: themeConfig.sealBg, color: themeConfig.sealColor, borderColor: themeConfig.primaryColor }}>
                {sealText.split('\n').map((line, i) => (
                  <span key={i}>{line}<br/></span>
                ))}
              </div>

              <div className="flex flex-col items-center w-[200px]">
                {academyHeadSignatureUrl ? (
                  <img src={academyHeadSignatureUrl} alt="Auth Sig" className="h-[50px] object-contain mb-2" />
                ) : (
                  <div className="h-[50px] flex items-center text-xs text-gray-400">Auth Signature Placeholder</div>
                )}
                <div className="w-full h-[1px] bg-gray-800 mb-1.5" />
                <div className="text-[13px] font-semibold text-gray-800">{authTitle}</div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-between items-center mt-6 text-[11px] text-gray-500 z-10">
              <div className="italic">{footerAddress}</div>
              <div className="flex gap-3 items-center">
                {collaborationLogosStr.split(',').filter(s=>s.trim()).map((url, i) => (
                  <img key={i} src={url.trim()} alt="Collab" className="h-8 object-contain" />
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Certificate Management</h1>
          <p className="text-sm text-white/50">Create designer templates and issue verified student certificates</p>
        </div>
        <button onClick={() => setShowBuilder(true)} className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors">
          <Plus className="w-4 h-4" /> Create Designer Template
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {templates.map(t => (
          <div key={t.id} className="bg-white/5 border border-white/10 rounded-xl p-5 hover:border-purple-500/50 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <Award className="w-8 h-8 text-purple-400" />
              <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full font-medium">Active</span>
            </div>
            <h3 className="text-lg font-bold text-white mb-1">{t.name}</h3>
            <p className="text-xs text-white/40 mb-4">Created: {new Date(t.createdAt).toLocaleDateString()}</p>
            <div className="flex gap-2">
              <button className="flex-1 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-semibold text-white transition-colors">
                Preview
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
