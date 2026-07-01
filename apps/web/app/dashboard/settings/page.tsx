"use client"

import { useState, useRef, useEffect } from "react"
import { Settings, Shield, Palette, Building, Bell, Save, Image as ImageIcon, CheckCircle2, DollarSign, Plug, Loader2, Upload } from "lucide-react"
import { toast } from "sonner"
import { useOrganization } from "@/context/OrganizationContext"

export default function SystemSettingsPage() {
  const [activeTab, setActiveTab] = useState('branding')
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [academyLogoPreview, setAcademyLogoPreview] = useState<string | null>(null)
  const [logoUploading, setLogoUploading] = useState(false)
  const [workspaceName, setWorkspaceName] = useState('Grekam Visuals')
  const [phone, setPhone] = useState('')
  const [website, setWebsite] = useState('')
  const [supportEmail, setSupportEmail] = useState('')
  const [billingAddress, setBillingAddress] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const academyFileInputRef = useRef<HTMLInputElement>(null)
  const org = useOrganization()

  // Pre-populate from live org data when context loads
  useEffect(() => {
    if (org.name) setWorkspaceName(org.name)
    if (org.logoUrl && !logoPreview) setLogoPreview(org.logoUrl)
    if (org.academyLogoUrl && !academyLogoPreview) setAcademyLogoPreview(org.academyLogoUrl)
    if (org.phone) setPhone(org.phone)
    if (org.website) setWebsite(org.website)
    if (org.supportEmail) setSupportEmail(org.supportEmail)
    if (org.billingAddress) setBillingAddress(org.billingAddress)
  }, [org])

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Show live preview immediately
    const reader = new FileReader()
    reader.onload = (ev) => {
      setLogoPreview(ev.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleAcademyLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (ev) => {
      setAcademyLogoPreview(ev.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleSave = async () => {
    try {
      setLogoUploading(true)
      const body: Record<string, string> = { 
        name: workspaceName,
        phone,
        website,
        supportEmail,
        billingAddress
      }
      if (logoPreview) body.logoUrl = logoPreview
      if (academyLogoPreview) body.academyLogoUrl = academyLogoPreview

      const res = await fetch('/api/v1/settings/organization', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      if (!res.ok) throw new Error('Failed to save')
      toast.success('Settings saved successfully!')
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
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-8 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed relative">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" />
          
          <div className="relative z-10 max-w-3xl space-y-8">
            
            {activeTab === 'branding' && (
              <>
                <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
                  <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <Palette className="w-5 h-5 text-blue-400" /> Workspace Branding
                  </h2>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="text-sm font-bold text-white/70 block mb-2">Workspace Name</label>
                      <input 
                        type="text" 
                        value={workspaceName}
                        onChange={e => setWorkspaceName(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500/50"
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-bold text-white/70 block mb-3">Workspace Logo</label>
                      <div className="flex items-start gap-6">
                        {/* Preview */}
                        <div className="w-24 h-24 rounded-2xl border-2 border-white/10 overflow-hidden flex items-center justify-center bg-gradient-to-tr from-blue-600 to-purple-600 shrink-0">
                          {logoPreview ? (
                            <img src={logoPreview} alt="Logo Preview" className="w-full h-full object-contain" />
                          ) : (
                            <span className="text-white font-black text-3xl">G</span>
                          )}
                        </div>

                        {/* Drop Zone */}
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          onDragOver={e => e.preventDefault()}
                          onDrop={e => {
                            e.preventDefault()
                            const file = e.dataTransfer.files?.[0]
                            if (file && file.type.startsWith('image/')) {
                              const reader = new FileReader()
                              reader.onload = ev => setLogoPreview(ev.target?.result as string)
                              reader.readAsDataURL(file)
                            }
                          }}
                          className="flex-1 border-2 border-dashed border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-blue-500/50 hover:bg-blue-500/5 transition-all group"
                        >
                          <div className="w-10 h-10 rounded-full bg-white/5 group-hover:bg-blue-500/10 flex items-center justify-center transition-colors">
                            <Upload className="w-5 h-5 text-slate-400 group-hover:text-blue-400 transition-colors" />
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-semibold text-white">
                              {logoPreview ? '✅ Logo selected — click to change' : 'Click or drag & drop your logo'}
                            </p>
                            <p className="text-xs text-slate-500 mt-1">PNG, JPG, SVG up to 2MB</p>
                          </div>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleLogoChange}
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-bold text-white/70 block mb-3">Academy Logo (Optional)</label>
                      <div className="flex items-start gap-6">
                        {/* Preview */}
                        <div className="w-24 h-24 rounded-2xl border-2 border-white/10 overflow-hidden flex items-center justify-center bg-gradient-to-tr from-rose-600 to-orange-600 shrink-0">
                          {academyLogoPreview ? (
                            <img src={academyLogoPreview} alt="Academy Logo Preview" className="w-full h-full object-contain" />
                          ) : (
                            <span className="text-white font-black text-3xl">A</span>
                          )}
                        </div>

                        {/* Drop Zone */}
                        <div
                          onClick={() => academyFileInputRef.current?.click()}
                          onDragOver={e => e.preventDefault()}
                          onDrop={e => {
                            e.preventDefault()
                            const file = e.dataTransfer.files?.[0]
                            if (file && file.type.startsWith('image/')) {
                              const reader = new FileReader()
                              reader.onload = ev => setAcademyLogoPreview(ev.target?.result as string)
                              reader.readAsDataURL(file)
                            }
                          }}
                          className="flex-1 border-2 border-dashed border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-orange-500/50 hover:bg-orange-500/5 transition-all group"
                        >
                          <div className="w-10 h-10 rounded-full bg-white/5 group-hover:bg-orange-500/10 flex items-center justify-center transition-colors">
                            <Upload className="w-5 h-5 text-slate-400 group-hover:text-orange-400 transition-colors" />
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-semibold text-white">
                              {academyLogoPreview ? '✅ Academy logo selected' : 'Click or drag & drop academy logo'}
                            </p>
                            <p className="text-xs text-slate-500 mt-1">PNG, JPG, SVG up to 2MB</p>
                          </div>
                          <input
                            ref={academyFileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleAcademyLogoChange}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-bold text-white/70 block mb-3">Primary Brand Color</label>
                      <div className="flex items-center gap-4">
                        {['bg-blue-500', 'bg-purple-500', 'bg-emerald-500', 'bg-red-500', 'bg-amber-500'].map((color, i) => (
                          <button key={i} className={`w-8 h-8 rounded-full ${color} flex items-center justify-center ring-2 ring-transparent hover:ring-white transition-all`}>
                            {i === 0 && <CheckCircle2 className="w-4 h-4 text-white drop-shadow-md" />}
                          </button>
                        ))}
                      </div>
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
                    <input type="text" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+1 (555) 123-4567" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500/50" />
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <label className="text-sm font-bold text-white/70 block mb-2">Website URL</label>
                    <input type="url" value={website} onChange={e => setWebsite(e.target.value)} placeholder="https://grekam.com" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500/50" />
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <label className="text-sm font-bold text-white/70 block mb-2">Support / Contact Email</label>
                    <input type="email" value={supportEmail} onChange={e => setSupportEmail(e.target.value)} placeholder="hello@grekam.com" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500/50" />
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <label className="text-sm font-bold text-white/70 block mb-2">Billing & Official Address</label>
                    <textarea rows={3} value={billingAddress} onChange={e => setBillingAddress(e.target.value)} placeholder="123 Creative Street, Tech Park..." className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500/50 resize-none" />
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
