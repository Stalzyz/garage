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
  Trash2, 
  Sparkles 
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
        phone,
        website,
        supportEmail,
        billingAddress,
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
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-500 transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] disabled:opacity-60"
        >
          {logoUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {logoUploading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Sidebar - Navigation */}
        <div className="w-64 border-r border-white/10 bg-black/20 p-4 space-y-1">
          <button 
            onClick={() => setActiveTab('branding')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-colors ${activeTab === 'branding' ? 'bg-blue-600 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}
          >
            <Palette className="w-4 h-4" /> Branding & Theme
          </button>
          <button 
            onClick={() => setActiveTab('company')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-colors ${activeTab === 'company' ? 'bg-blue-600 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}
          >
            <Building className="w-4 h-4" /> Company Details
          </button>
          <button 
            onClick={() => setActiveTab('notifications')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-colors ${activeTab === 'notifications' ? 'bg-blue-600 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}
          >
            <Bell className="w-4 h-4" /> Notifications
          </button>
          <a 
            href="/dashboard/settings/roles"
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-colors text-white/70 hover:bg-white/10 hover:text-white"
          >
            <Shield className="w-4 h-4" /> Roles & Permissions
          </a>
          <a 
            href="/dashboard/settings/finance"
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-colors text-white/70 hover:bg-white/10 hover:text-white"
          >
            <DollarSign className="w-4 h-4" /> Finance & Currency
          </a>
          <a 
            href="/dashboard/settings/integrations"
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-colors text-white/70 hover:bg-white/10 hover:text-white"
          >
            <Plug className="w-4 h-4" /> Integrations & APIs
          </a>
          <a 
            href="/dashboard/settings/email-templates"
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-colors text-white/70 hover:bg-white/10 hover:text-white"
          >
            <Mail className="w-4 h-4 text-indigo-400" /> Email Templates
          </a>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-8 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed relative">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" />
          
          <div className="relative z-10 max-w-4xl space-y-8">
            
            {activeTab === 'branding' && (
              <>
                {/* 1. Digital Agency Card */}
                <div className="bg-[#0b0f19] border border-blue-500/20 rounded-3xl p-7 space-y-6">
                  <div className="flex items-center justify-between border-b border-white/5 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div>
                        <h2 className="text-base font-bold text-white">Digital Agency Brand (Grekam Visuals)</h2>
                        <p className="text-xs text-white/50">Landscape logo for invoices/proposals & 1:1 square favicon for garage.grekam.in</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[9px] font-mono font-bold uppercase rounded-lg">
                      Agency
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Agency Landscape Logo */}
                    <div className="space-y-3 bg-white/[0.02] border border-white/5 rounded-2xl p-4">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold font-mono uppercase tracking-wider text-white/80 flex items-center gap-2">
                          <ImageIcon className="w-3.5 h-3.5 text-blue-400" /> Agency Logo (Landscape)
                        </label>
                        <span className="text-[9px] font-mono text-white/40">~3:1 / 4:1</span>
                      </div>
                      <div className="w-full h-24 rounded-xl border border-white/10 bg-[#06080e] p-2 flex items-center justify-center">
                        {logoPreview ? (
                          <img src={logoPreview} alt="Agency Logo" className="max-h-full max-w-full object-contain" />
                        ) : (
                          <span className="text-white/30 text-xs font-mono">No Logo</span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-300 font-bold text-xs rounded-xl transition-all"
                        >
                          <Upload className="w-3 h-3" /> Upload Logo
                        </button>
                        {logoPreview && (
                          <button
                            type="button"
                            onClick={() => setLogoPreview(null)}
                            className="p-2 text-white/40 hover:text-red-400 hover:bg-red-500/10 border border-white/10 rounded-xl"
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
                    <div className="space-y-3 bg-white/[0.02] border border-white/5 rounded-2xl p-4">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold font-mono uppercase tracking-wider text-white/80 flex items-center gap-2">
                          <Globe className="w-3.5 h-3.5 text-blue-400" /> Agency Favicon (Square)
                        </label>
                        <span className="text-[9px] font-mono text-white/40">1:1 Square</span>
                      </div>
                      <div className="w-full h-24 rounded-xl border border-white/10 bg-[#06080e] p-2 flex items-center justify-between">
                        <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-2.5 py-1 text-[10px] font-mono text-white/70">
                          {faviconPreview ? <img src={faviconPreview} className="w-3.5 h-3.5 object-contain" /> : <Globe className="w-3.5 h-3.5 text-white/40" />}
                          <span>Grekam OS</span>
                        </div>
                        <div className="w-8 h-8 rounded border border-white/10 flex items-center justify-center">
                          {faviconPreview ? <img src={faviconPreview} className="w-full h-full object-contain p-0.5" /> : <span className="text-[9px] font-mono text-white/30">1:1</span>}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => faviconInputRef.current?.click()}
                          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-300 font-bold text-xs rounded-xl transition-all"
                        >
                          <Upload className="w-3 h-3" /> Upload Favicon
                        </button>
                        {faviconPreview && (
                          <button
                            type="button"
                            onClick={() => setFaviconPreview(null)}
                            className="p-2 text-white/40 hover:text-red-400 hover:bg-red-500/10 border border-white/10 rounded-xl"
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
                <div className="bg-[#0f0e1a] border border-indigo-500/20 rounded-3xl p-7 space-y-6">
                  <div className="flex items-center justify-between border-b border-white/5 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                        <GraduationCap className="w-4 h-4" />
                      </div>
                      <div>
                        <h2 className="text-base font-bold text-white">Academy Brand (Grekam Academy)</h2>
                        <p className="text-xs text-white/50">Landscape logo for fee receipts/certificates & 1:1 square favicon for academy.grekam.in</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[9px] font-mono font-bold uppercase rounded-lg">
                      Academy
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Academy Landscape Logo */}
                    <div className="space-y-3 bg-white/[0.02] border border-white/5 rounded-2xl p-4">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold font-mono uppercase tracking-wider text-white/80 flex items-center gap-2">
                          <ImageIcon className="w-3.5 h-3.5 text-indigo-400" /> Academy Logo (Landscape)
                        </label>
                        <span className="text-[9px] font-mono text-white/40">~3:1 / 4:1</span>
                      </div>
                      <div className="w-full h-24 rounded-xl border border-white/10 bg-[#06080e] p-2 flex items-center justify-center">
                        {academyLogoPreview ? (
                          <img src={academyLogoPreview} alt="Academy Logo" className="max-h-full max-w-full object-contain" />
                        ) : (
                          <span className="text-white/30 text-xs font-mono">No Academy Logo</span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => academyFileInputRef.current?.click()}
                          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 font-bold text-xs rounded-xl transition-all"
                        >
                          <Upload className="w-3 h-3" /> Upload Logo
                        </button>
                        {academyLogoPreview && (
                          <button
                            type="button"
                            onClick={() => setAcademyLogoPreview(null)}
                            className="p-2 text-white/40 hover:text-red-400 hover:bg-red-500/10 border border-white/10 rounded-xl"
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
                    <div className="space-y-3 bg-white/[0.02] border border-white/5 rounded-2xl p-4">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold font-mono uppercase tracking-wider text-white/80 flex items-center gap-2">
                          <Globe className="w-3.5 h-3.5 text-indigo-400" /> Academy Favicon (Square)
                        </label>
                        <span className="text-[9px] font-mono text-white/40">1:1 Square</span>
                      </div>
                      <div className="w-full h-24 rounded-xl border border-white/10 bg-[#06080e] p-2 flex items-center justify-between">
                        <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-2.5 py-1 text-[10px] font-mono text-white/70">
                          {academyFaviconPreview ? <img src={academyFaviconPreview} className="w-3.5 h-3.5 object-contain" /> : <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />}
                          <span>Grekam Academy</span>
                        </div>
                        <div className="w-8 h-8 rounded border border-white/10 flex items-center justify-center">
                          {academyFaviconPreview ? <img src={academyFaviconPreview} className="w-full h-full object-contain p-0.5" /> : <span className="text-[9px] font-mono text-white/30">1:1</span>}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => academyFaviconInputRef.current?.click()}
                          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 font-bold text-xs rounded-xl transition-all"
                        >
                          <Upload className="w-3 h-3" /> Upload Favicon
                        </button>
                        {academyFaviconPreview && (
                          <button
                            type="button"
                            onClick={() => setAcademyFaviconPreview(null)}
                            className="p-2 text-white/40 hover:text-red-400 hover:bg-red-500/10 border border-white/10 rounded-xl"
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
              <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <Building className="w-5 h-5 text-emerald-400" /> Company Details
                </h2>
                <div className="grid grid-cols-2 gap-6">
                  <div className="col-span-2 md:col-span-1">
                    <label className="text-sm font-bold text-white/70 block mb-2">Phone Number</label>
                    <input type="text" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 98400 12345" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500/50" />
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <label className="text-sm font-bold text-white/70 block mb-2">Website URL</label>
                    <input type="url" value={website} onChange={e => setWebsite(e.target.value)} placeholder="https://grekam.in" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500/50" />
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <label className="text-sm font-bold text-white/70 block mb-2">Support / Contact Email</label>
                    <input type="email" value={supportEmail} onChange={e => setSupportEmail(e.target.value)} placeholder="contact@grekam.in" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500/50" />
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <label className="text-sm font-bold text-white/70 block mb-2">Billing & Official Address</label>
                    <textarea rows={3} value={billingAddress} onChange={e => setBillingAddress(e.target.value)} placeholder="Chennai, Tamil Nadu, India" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500/50 resize-none" />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <Bell className="w-5 h-5 text-amber-400" /> Global Notifications
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-black/40 rounded-xl border border-white/10">
                    <div>
                      <div className="font-bold">WhatsApp Integrations (Grafty)</div>
                      <div className="text-xs text-white/50">Send automated messages to leads and students.</div>
                    </div>
                    <a href="/dashboard/settings/integrations" className="text-sm font-medium text-blue-400 hover:text-blue-300">
                      Configure Keys &rarr;
                    </a>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-black/40 rounded-xl border border-white/10">
                    <div>
                      <div className="font-bold">Email Notifications</div>
                      <div className="text-xs text-white/50">Send daily digests to staff members.</div>
                    </div>
                    <a href="/dashboard/settings/integrations" className="text-sm font-medium text-blue-400 hover:text-blue-300">
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
