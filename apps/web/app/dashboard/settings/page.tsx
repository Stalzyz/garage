"use client"

import { useState, useRef, useEffect } from "react"
import { 
  Settings, 
  Shield, 
  Palette, 
  Building, 
  Bell, 
  Save, 
  Image as ImageIcon, 
  CheckCircle2, 
  DollarSign, 
  Plug, 
  Loader2, 
  Upload, 
  Mail, 
  Globe, 
  GraduationCap, 
  Building2, 
  Trash2 
} from "lucide-react"
import { toast } from "sonner"
import { useOrganization } from "@/context/OrganizationContext"
import { ApiClient } from "@/lib/api"

export default function SystemSettingsPage() {
  const [activeTab, setActiveTab] = useState('branding')
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [faviconPreview, setFaviconPreview] = useState<string | null>(null)
  const [academyLogoPreview, setAcademyLogoPreview] = useState<string | null>(null)
  const [academyFaviconPreview, setAcademyFaviconPreview] = useState<string | null>(null)
  const [logoUploading, setLogoUploading] = useState(false)
  const [workspaceName, setWorkspaceName] = useState('Grekam Visuals')
  const [companyName, setCompanyName] = useState('')
  const [panNumber, setPanNumber] = useState('')
  const [gstNumber, setGstNumber] = useState('')
  const [phone, setPhone] = useState('')
  const [website, setWebsite] = useState('')
  const [supportEmail, setSupportEmail] = useState('')
  const [billingAddress, setBillingAddress] = useState('')

  const fileInputRef = useRef<HTMLInputElement>(null)
  const faviconInputRef = useRef<HTMLInputElement>(null)
  const academyFileInputRef = useRef<HTMLInputElement>(null)
  const academyFaviconInputRef = useRef<HTMLInputElement>(null)
  const org = useOrganization()

  // Pre-populate from live org data when context loads
  useEffect(() => {
    if (org.name) setWorkspaceName(org.name)
    if ((org as any).companyName) setCompanyName((org as any).companyName)
    if ((org as any).panNumber) setPanNumber((org as any).panNumber)
    if ((org as any).gstNumber) setGstNumber((org as any).gstNumber)
    if (org.logoUrl && !logoPreview) setLogoPreview(org.logoUrl)
    if (org.faviconUrl && !faviconPreview) setFaviconPreview(org.faviconUrl)
    if (org.academyLogoUrl && !academyLogoPreview) setAcademyLogoPreview(org.academyLogoUrl)
    if (org.academyFaviconUrl && !academyFaviconPreview) setAcademyFaviconPreview(org.academyFaviconUrl)
    if (org.phone) setPhone(org.phone)
    if (org.website) setWebsite(org.website)
    if (org.supportEmail) setSupportEmail(org.supportEmail)
    if (org.billingAddress) setBillingAddress(org.billingAddress)
  }, [org])

  const handleFileUpload = async (file: File, setter: (val: string) => void) => {
    try {
      const { uploadUrl, downloadUrl } = await ApiClient.post('/storage/upload-url', {
        filename: file.name,
        contentType: file.type || 'image/png',
        prefix: 'branding'
      });

      await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type || 'image/png' }
      });

      setter(downloadUrl);
      toast.success('Asset uploaded successfully!');
    } catch (err) {
      // Base64 fallback
      const reader = new FileReader();
      reader.onload = (ev) => {
        setter(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      setLogoUploading(true)
      const body: Record<string, string | null> = { 
        name: workspaceName,
        companyName: companyName ? companyName.trim() : null,
        panNumber: panNumber ? panNumber.trim().toUpperCase() : null,
        gstNumber: gstNumber ? gstNumber.trim().toUpperCase() : null,
        phone: phone ? phone.trim() : null,
        website: website ? website.trim() : null,
        supportEmail: supportEmail ? supportEmail.trim() : null,
        billingAddress: billingAddress ? billingAddress.trim() : null,
        logoUrl: logoPreview || null,
        faviconUrl: faviconPreview || null,
        academyLogoUrl: academyLogoPreview || null,
        academyFaviconUrl: academyFaviconPreview || null,
      }

      const res = await fetch('/api/v1/settings/organization', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      if (!res.ok) throw new Error('Failed to save')
      toast.success('Settings and brand assets saved successfully!')
    } catch (err) {
      toast.error('Failed to save settings.')
    } finally {
      setLogoUploading(false)
    }
  }

  return (
    <div className="flex flex-col h-full bg-[#050505] text-white overflow-hidden">
      {/* Header */}
      <div className="flex-none px-8 py-6 border-b border-white/10 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
          <p className="text-sm text-white/50 mt-2">Manage workspace preferences, branding, and configurations.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={logoUploading}
          className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-500 transition-colors shadow-sm disabled:opacity-60 cursor-pointer text-sm"
        >
          {logoUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {logoUploading ? 'Saving...' : 'Save changes'}
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Sidebar - Navigation */}
        <div className="w-60 border-r border-white/[0.08] bg-dash-bg-base p-3 space-y-1">
          <button 
            onClick={() => setActiveTab('branding')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${activeTab === 'branding' ? 'bg-white/[0.08] text-white' : 'text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200'}`}
          >
            <Palette className="w-4 h-4 text-zinc-400" /> Branding
          </button>
          <button 
            onClick={() => setActiveTab('company')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${activeTab === 'company' ? 'bg-white/[0.08] text-white' : 'text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200'}`}
          >
            <Building className="w-4 h-4 text-zinc-400" /> Company Details
          </button>
          <a 
            href="/dashboard/settings/organization"
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200"
          >
            <Building2 className="w-4 h-4 text-blue-400" /> Full Brand Suite
          </a>
          <button 
            onClick={() => setActiveTab('notifications')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${activeTab === 'notifications' ? 'bg-white/[0.08] text-white' : 'text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200'}`}
          >
            <Bell className="w-4 h-4 text-zinc-400" /> Notifications
          </button>
          <a 
            href="/dashboard/settings/roles"
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200"
          >
            <Shield className="w-4 h-4 text-zinc-400" /> Roles & Permissions
          </a>
          <a 
            href="/dashboard/settings/finance"
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200"
          >
            <DollarSign className="w-4 h-4 text-zinc-400" /> Finance & Currency
          </a>
          <a 
            href="/dashboard/settings/integrations"
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200"
          >
            <Plug className="w-4 h-4 text-zinc-400" /> Integrations & APIs
          </a>
          <a 
            href="/dashboard/settings/email-templates"
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200"
          >
            <Mail className="w-4 h-4 text-zinc-400" /> Email Templates
          </a>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8 bg-dash-bg-surface relative">
          <div className="max-w-4xl space-y-6">
            
            {activeTab === 'branding' && (
              <>
                {/* 1. Digital Agency Card */}
                <div className="bg-[#121620] border border-white/[0.08] rounded-xl p-6 space-y-5">
                  <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
                    <div className="flex items-center gap-3">
                      <Building2 className="w-5 h-5 text-slate-300" />
                      <div>
                        <h2 className="text-sm font-semibold text-slate-100">Digital Agency Brand (Grekam Visuals)</h2>
                        <p className="text-xs text-slate-400">Landscape logo for invoices & proposals, 1:1 square favicon for agency.grekam.in</p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 bg-slate-800 text-slate-300 border border-slate-700/60 text-[10px] font-mono uppercase tracking-wider rounded">
                      Agency
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Agency Landscape Logo */}
                    <div className="space-y-3 bg-[#0c0e14] border border-white/[0.06] rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-medium text-slate-300 flex items-center gap-2">
                          <ImageIcon className="w-3.5 h-3.5 text-slate-400" /> Agency Logo (Landscape)
                        </label>
                        <span className="text-[10px] font-mono text-slate-500">~3:1 / 4:1</span>
                      </div>
                      <div className="w-full h-24 rounded-lg border border-white/[0.08] bg-[#10141d] p-2 flex items-center justify-center">
                        {logoPreview ? (
                          <img src={logoPreview} alt="Agency Logo" className="max-h-full max-w-full object-contain" />
                        ) : (
                          <span className="text-slate-600 text-xs font-mono">No Logo</span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] text-slate-200 font-medium text-xs rounded-lg transition-colors"
                        >
                          <Upload className="w-3.5 h-3.5" /> Upload Logo
                        </button>
                        {logoPreview && (
                          <button
                            type="button"
                            onClick={() => setLogoPreview(null)}
                            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 border border-white/[0.08] rounded-lg transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file, setLogoPreview);
                        }}
                      />
                    </div>

                    {/* Agency Square Favicon */}
                    <div className="space-y-3 bg-[#0c0e14] border border-white/[0.06] rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-medium text-slate-300 flex items-center gap-2">
                          <Globe className="w-3.5 h-3.5 text-slate-400" /> Agency Favicon (Square)
                        </label>
                        <span className="text-[10px] font-mono text-slate-500">1:1 Square</span>
                      </div>
                      <div className="w-full h-24 rounded-lg border border-white/[0.08] bg-[#10141d] p-2 flex items-center justify-between">
                        <div className="flex items-center gap-2 bg-white/[0.04] border border-white/[0.06] rounded-md px-2.5 py-1 text-[11px] font-mono text-slate-300">
                          {faviconPreview ? <img src={faviconPreview} className="w-3.5 h-3.5 object-contain" /> : <Globe className="w-3.5 h-3.5 text-slate-500" />}
                          <span>Grekam OS</span>
                        </div>
                        <div className="w-8 h-8 rounded border border-white/[0.08] flex items-center justify-center bg-[#0c0e14]">
                          {faviconPreview ? <img src={faviconPreview} className="w-full h-full object-contain p-0.5" /> : <span className="text-[10px] font-mono text-slate-600">1:1</span>}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => faviconInputRef.current?.click()}
                          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] text-slate-200 font-medium text-xs rounded-lg transition-colors"
                        >
                          <Upload className="w-3.5 h-3.5" /> Upload Favicon
                        </button>
                        {faviconPreview && (
                          <button
                            type="button"
                            onClick={() => setFaviconPreview(null)}
                            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 border border-white/[0.08] rounded-lg transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      <input
                        ref={faviconInputRef}
                        type="file"
                        accept="image/*, .ico"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file, setFaviconPreview);
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Academy Card */}
                <div className="bg-[#121620] border border-white/[0.08] rounded-xl p-6 space-y-5">
                  <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
                    <div className="flex items-center gap-3">
                      <GraduationCap className="w-5 h-5 text-slate-300" />
                      <div>
                        <h2 className="text-sm font-semibold text-slate-100">Academy Brand (Grekam Academy)</h2>
                        <p className="text-xs text-slate-400">Landscape logo for fee receipts & certificates, 1:1 square favicon for academy.grekam.in</p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 bg-slate-800 text-slate-300 border border-slate-700/60 text-[10px] font-mono uppercase tracking-wider rounded">
                      Academy
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Academy Landscape Logo */}
                    <div className="space-y-3 bg-[#0c0e14] border border-white/[0.06] rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-medium text-slate-300 flex items-center gap-2">
                          <ImageIcon className="w-3.5 h-3.5 text-slate-400" /> Academy Logo (Landscape)
                        </label>
                        <span className="text-[10px] font-mono text-slate-500">~3:1 / 4:1</span>
                      </div>
                      <div className="w-full h-24 rounded-lg border border-white/[0.08] bg-[#10141d] p-2 flex items-center justify-center">
                        {academyLogoPreview ? (
                          <img src={academyLogoPreview} alt="Academy Logo" className="max-h-full max-w-full object-contain" />
                        ) : (
                          <span className="text-slate-600 text-xs font-mono">No Academy Logo</span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => academyFileInputRef.current?.click()}
                          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] text-slate-200 font-medium text-xs rounded-lg transition-colors"
                        >
                          <Upload className="w-3.5 h-3.5" /> Upload Logo
                        </button>
                        {academyLogoPreview && (
                          <button
                            type="button"
                            onClick={() => setAcademyLogoPreview(null)}
                            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 border border-white/[0.08] rounded-lg transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      <input
                        ref={academyFileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file, setAcademyLogoPreview);
                        }}
                      />
                    </div>

                    {/* Academy Square Favicon */}
                    <div className="space-y-3 bg-[#0c0e14] border border-white/[0.06] rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-medium text-slate-300 flex items-center gap-2">
                          <Globe className="w-3.5 h-3.5 text-slate-400" /> Academy Favicon (Square)
                        </label>
                        <span className="text-[10px] font-mono text-slate-500">1:1 Square</span>
                      </div>
                      <div className="w-full h-24 rounded-lg border border-white/[0.08] bg-[#10141d] p-2 flex items-center justify-between">
                        <div className="flex items-center gap-2 bg-white/[0.04] border border-white/[0.06] rounded-md px-2.5 py-1 text-[11px] font-mono text-slate-300">
                          {academyFaviconPreview ? <img src={academyFaviconPreview} className="w-3.5 h-3.5 object-contain" /> : <GraduationCap className="w-3.5 h-3.5 text-slate-500" />}
                          <span>Grekam Academy</span>
                        </div>
                        <div className="w-8 h-8 rounded border border-white/[0.08] flex items-center justify-center bg-[#0c0e14]">
                          {academyFaviconPreview ? <img src={academyFaviconPreview} className="w-full h-full object-contain p-0.5" /> : <span className="text-[10px] font-mono text-slate-600">1:1</span>}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => academyFaviconInputRef.current?.click()}
                          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] text-slate-200 font-medium text-xs rounded-lg transition-colors"
                        >
                          <Upload className="w-3.5 h-3.5" /> Upload Favicon
                        </button>
                        {academyFaviconPreview && (
                          <button
                            type="button"
                            onClick={() => setAcademyFaviconPreview(null)}
                            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 border border-white/[0.08] rounded-lg transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      <input
                        ref={academyFaviconInputRef}
                        type="file"
                        accept="image/*, .ico"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file, setAcademyFaviconPreview);
                        }}
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'company' && (
              <div className="bg-[#121620] border border-white/[0.08] rounded-xl p-6 space-y-6">
                <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
                  <div className="flex items-center gap-2.5">
                    <Building className="w-5 h-5 text-slate-300" />
                    <h2 className="text-sm font-semibold text-slate-100">Company & Legal Particulars</h2>
                  </div>
                  <a
                    href="/dashboard/settings/organization"
                    className="text-xs text-slate-400 hover:text-slate-200 transition-colors flex items-center gap-1"
                  >
                    Manage Full Branding & Socials &rarr;
                  </a>
                </div>
                <div className="grid grid-cols-2 gap-5">
                  <div className="col-span-2 md:col-span-1 space-y-1.5">
                    <label className="text-xs font-medium text-slate-300 block">Registered Legal Company Name</label>
                    <input 
                      type="text" 
                      value={companyName} 
                      onChange={e => setCompanyName(e.target.value)} 
                      placeholder="Grekam Visuals & Technologies Pvt Ltd" 
                      className="w-full bg-[#0c0e14] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-white/20 focus:ring-1 focus:ring-white/10" 
                    />
                  </div>
                  <div className="col-span-2 md:col-span-1 space-y-1.5">
                    <label className="text-xs font-medium text-slate-300 block">Workspace Display Name</label>
                    <input 
                      type="text" 
                      value={workspaceName} 
                      onChange={e => setWorkspaceName(e.target.value)} 
                      placeholder="Grekam Visuals" 
                      className="w-full bg-[#0c0e14] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-white/20 focus:ring-1 focus:ring-white/10" 
                    />
                  </div>
                  <div className="col-span-2 md:col-span-1 space-y-1.5">
                    <label className="text-xs font-medium text-slate-300 block">Income Tax PAN Number</label>
                    <input 
                      type="text" 
                      value={panNumber} 
                      onChange={e => setPanNumber(e.target.value.toUpperCase())} 
                      placeholder="ABCDE1234F" 
                      maxLength={10}
                      className="w-full bg-[#0c0e14] border border-white/[0.08] rounded-lg px-3 py-2 text-sm font-mono uppercase text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-white/20 focus:ring-1 focus:ring-white/10" 
                    />
                  </div>
                  <div className="col-span-2 md:col-span-1 space-y-1.5">
                    <label className="text-xs font-medium text-slate-300 block">GSTIN (GST Identification Number)</label>
                    <input 
                      type="text" 
                      value={gstNumber} 
                      onChange={e => setGstNumber(e.target.value.toUpperCase())} 
                      placeholder="33AAAAA0000A1Z5" 
                      maxLength={15}
                      className="w-full bg-[#0c0e14] border border-white/[0.08] rounded-lg px-3 py-2 text-sm font-mono uppercase text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-white/20 focus:ring-1 focus:ring-white/10" 
                    />
                  </div>
                  <div className="col-span-2 md:col-span-1 space-y-1.5">
                    <label className="text-xs font-medium text-slate-300 block">Phone Number</label>
                    <input type="text" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 98400 12345" className="w-full bg-[#0c0e14] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-white/20 focus:ring-1 focus:ring-white/10" />
                  </div>
                  <div className="col-span-2 md:col-span-1 space-y-1.5">
                    <label className="text-xs font-medium text-slate-300 block">Website URL</label>
                    <input type="url" value={website} onChange={e => setWebsite(e.target.value)} placeholder="https://grekam.in" className="w-full bg-[#0c0e14] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-white/20 focus:ring-1 focus:ring-white/10" />
                  </div>
                  <div className="col-span-2 md:col-span-1 space-y-1.5">
                    <label className="text-xs font-medium text-slate-300 block">Support / Contact Email</label>
                    <input type="email" value={supportEmail} onChange={e => setSupportEmail(e.target.value)} placeholder="contact@grekam.in" className="w-full bg-[#0c0e14] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-white/20 focus:ring-1 focus:ring-white/10" />
                  </div>
                  <div className="col-span-2 md:col-span-1 space-y-1.5">
                    <label className="text-xs font-medium text-slate-300 block">Billing & Official Address</label>
                    <textarea rows={3} value={billingAddress} onChange={e => setBillingAddress(e.target.value)} placeholder="Chennai, Tamil Nadu, India" className="w-full bg-[#0c0e14] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-white/20 focus:ring-1 focus:ring-white/10 resize-none" />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="bg-[#121620] border border-white/[0.08] rounded-xl p-6 space-y-5">
                <div className="flex items-center gap-2.5 border-b border-white/[0.06] pb-4">
                  <Bell className="w-5 h-5 text-slate-300" />
                  <h2 className="text-sm font-semibold text-slate-100">Global Notifications</h2>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-[#0c0e14] rounded-lg border border-white/[0.06]">
                    <div>
                      <div className="text-sm font-medium text-slate-200">WhatsApp Integrations (Grafty)</div>
                      <div className="text-xs text-slate-400">Send automated messages to leads and students.</div>
                    </div>
                    <a href="/dashboard/settings/integrations" className="text-xs font-medium text-slate-300 hover:text-white px-3 py-1.5 rounded-lg bg-white/[0.06] border border-white/[0.08] transition-colors">
                      Configure Keys &rarr;
                    </a>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-[#0c0e14] rounded-lg border border-white/[0.06]">
                    <div>
                      <div className="text-sm font-medium text-slate-200">Email Notifications</div>
                      <div className="text-xs text-slate-400">Send daily digests to staff members.</div>
                    </div>
                    <a href="/dashboard/settings/integrations" className="text-xs font-medium text-slate-300 hover:text-white px-3 py-1.5 rounded-lg bg-white/[0.06] border border-white/[0.08] transition-colors">
                      Configure SMTP &rarr;
                    </a>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}
