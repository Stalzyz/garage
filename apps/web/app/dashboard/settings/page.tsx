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
  CreditCard
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
  const [workspaceName, setWorkspaceName] = useState('Grekam Garage OS')
  const [companyName, setCompanyName] = useState('')
  const [panNumber, setPanNumber] = useState('')
  const [gstNumber, setGstNumber] = useState('')
  const [phone, setPhone] = useState('')
  const [website, setWebsite] = useState('')
  const [supportEmail, setSupportEmail] = useState('')
  const [billingAddress, setBillingAddress] = useState('')
  const [bankName, setBankName] = useState('')
  const [accountName, setAccountName] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [ifscCode, setIfscCode] = useState('')
  const [swiftCode, setSwiftCode] = useState('')
  const [bankBranch, setBankBranch] = useState('')

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
    if ((org as any).bankName) setBankName((org as any).bankName)
    if ((org as any).accountName) setAccountName((org as any).accountName)
    if ((org as any).accountNumber || (org as any).bankAccountNo) {
      setAccountNumber((org as any).accountNumber || (org as any).bankAccountNo)
    }
    if ((org as any).ifscCode || (org as any).bankIfsc) {
      setIfscCode((org as any).ifscCode || (org as any).bankIfsc)
    }
    if ((org as any).swiftCode) setSwiftCode((org as any).swiftCode)
    if ((org as any).bankBranch) setBankBranch((org as any).bankBranch)
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
        name: workspaceName ? workspaceName.trim() : null,
        companyName: companyName ? companyName.trim() : null,
        panNumber: panNumber ? panNumber.trim().toUpperCase() : null,
        gstNumber: gstNumber ? gstNumber.trim().toUpperCase() : null,
        phone: phone ? phone.trim() : null,
        website: website ? website.trim() : null,
        supportEmail: supportEmail ? supportEmail.trim() : null,
        billingAddress: billingAddress ? billingAddress.trim() : null,
        bankName: bankName ? bankName.trim() : null,
        accountName: accountName ? accountName.trim() : null,
        accountNumber: accountNumber ? accountNumber.trim() : null,
        bankAccountNo: accountNumber ? accountNumber.trim() : null,
        ifscCode: ifscCode ? ifscCode.trim().toUpperCase() : null,
        bankIfsc: ifscCode ? ifscCode.trim().toUpperCase() : null,
        swiftCode: swiftCode ? swiftCode.trim().toUpperCase() : null,
        bankBranch: bankBranch ? bankBranch.trim() : null,
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

      if (!res.ok) {
        let errData;
        try { errData = await res.json(); } catch {}
        throw new Error(errData?.message || errData?.error || 'Failed to save');
      }
      toast.success('Settings and brand assets saved successfully!')
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('organization-updated'));
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to save settings.')
    } finally {
      setLogoUploading(false)
    }
  }

  return (
    <div className="flex flex-col h-full bg-[#000000] text-white overflow-hidden font-sans">
      {/* Header */}
      <div className="flex-none px-6 py-4 border-b border-white/[0.08] bg-[#121214]/60 backdrop-blur-md flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-white">System Settings</h1>
          <p className="text-xs text-white/50 mt-0.5">Manage workspace preferences, branding, and organization profile.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={logoUploading}
          className="flex items-center gap-2 px-4 py-2 bg-[#0A84FF] hover:bg-[#0071E3] text-white font-medium rounded-lg transition-colors shadow-sm disabled:opacity-60 cursor-pointer text-xs"
        >
          {logoUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
          {logoUploading ? 'Saving...' : 'Save changes'}
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Sidebar - Navigation */}
        <div className="w-56 border-r border-white/[0.08] bg-[#121214] p-2.5 space-y-0.5 shrink-0">
          <button 
            onClick={() => setActiveTab('branding')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${activeTab === 'branding' ? 'bg-[#1c1c1e] text-white' : 'text-white/60 hover:bg-white/[0.04] hover:text-white'}`}
          >
            <Palette className="w-3.5 h-3.5 text-[#0A84FF]" /> Branding
          </button>
          <button 
            onClick={() => setActiveTab('company')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${activeTab === 'company' ? 'bg-[#1c1c1e] text-white' : 'text-white/60 hover:bg-white/[0.04] hover:text-white'}`}
          >
            <Building className="w-3.5 h-3.5 text-white/40" /> Company Details
          </button>
          <a 
            href="/dashboard/settings/organization"
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors text-white/60 hover:bg-white/[0.04] hover:text-white"
          >
            <Building2 className="w-3.5 h-3.5 text-white/40" /> Full Brand Suite
          </a>
          <button 
            onClick={() => setActiveTab('notifications')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${activeTab === 'notifications' ? 'bg-[#1c1c1e] text-white' : 'text-white/60 hover:bg-white/[0.04] hover:text-white'}`}
          >
            <Bell className="w-3.5 h-3.5 text-white/40" /> Notifications
          </button>
          <a 
            href="/dashboard/settings/roles"
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors text-white/60 hover:bg-white/[0.04] hover:text-white"
          >
            <Shield className="w-3.5 h-3.5 text-white/40" /> Roles & Permissions
          </a>
          <a 
            href="/dashboard/settings/finance"
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors text-white/60 hover:bg-white/[0.04] hover:text-white"
          >
            <DollarSign className="w-3.5 h-3.5 text-white/40" /> Finance & Currency
          </a>
          <a 
            href="/dashboard/settings/integrations"
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors text-white/60 hover:bg-white/[0.04] hover:text-white"
          >
            <Plug className="w-3.5 h-3.5 text-white/40" /> Integrations & APIs
          </a>
          <a 
            href="/dashboard/settings/email-templates"
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors text-white/60 hover:bg-white/[0.04] hover:text-white"
          >
            <Mail className="w-3.5 h-3.5 text-white/40" /> Email & SMTP Delivery
          </a>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8 bg-[#000000] relative">
          <div className="max-w-4xl space-y-6">
            
            {activeTab === 'branding' && (
              <>
                {/* 1. Digital Agency Card */}
                <div className="bg-[#161618] border border-white/[0.08] rounded-xl p-6 space-y-5">
                  <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
                    <div className="flex items-center gap-3">
                      <Building2 className="w-5 h-5 text-white/70" />
                      <div>
                        <h2 className="text-sm font-semibold text-white">Brand Assets & Identity</h2>
                        <p className="text-xs text-white/40">Landscape logo for invoices & proposals, 1:1 square icon for browser favicon</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-0.5 bg-white/[0.05] text-white/70 border border-white/[0.08] text-[10px] font-mono uppercase tracking-wider rounded-md">
                      Active Org
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Agency Landscape Logo */}
                    <div className="space-y-3 bg-[#121214] border border-white/[0.06] rounded-xl p-4">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-medium text-white/70 flex items-center gap-2">
                          <ImageIcon className="w-3.5 h-3.5 text-white/40" /> Primary Logo (Landscape)
                        </label>
                        <span className="text-[10px] font-mono text-white/40">~3:1 / 4:1</span>
                      </div>
                      <div className="w-full h-24 rounded-lg border border-white/[0.08] bg-[#161618] p-2 flex items-center justify-center">
                        {logoPreview ? (
                          <img src={logoPreview} alt="Agency Logo" className="max-h-full max-w-full object-contain" />
                        ) : (
                          <span className="text-white/30 text-xs font-mono">No Logo Uploaded</span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.08] text-white/80 font-medium text-xs rounded-lg transition-colors"
                        >
                          <Upload className="w-3.5 h-3.5" /> Upload Logo
                        </button>
                        {logoPreview && (
                          <button
                            type="button"
                            onClick={() => setLogoPreview(null)}
                            className="p-1.5 text-white/40 hover:text-[#FF453A] hover:bg-[#FF453A]/10 border border-white/[0.08] rounded-lg transition-colors"
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
                    <div className="space-y-3 bg-[#121214] border border-white/[0.06] rounded-xl p-4">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-medium text-white/70 flex items-center gap-2">
                          <Globe className="w-3.5 h-3.5 text-white/40" /> Browser Favicon (Square)
                        </label>
                        <span className="text-[10px] font-mono text-white/40">1:1 Square</span>
                      </div>
                      <div className="w-full h-24 rounded-lg border border-white/[0.08] bg-[#161618] p-2 flex items-center justify-between">
                        <div className="flex items-center gap-2 bg-white/[0.04] border border-white/[0.06] rounded-md px-2.5 py-1 text-[11px] font-mono text-white/70">
                          {faviconPreview ? <img src={faviconPreview} className="w-3.5 h-3.5 object-contain" /> : <Globe className="w-3.5 h-3.5 text-white/40" />}
                          <span>{workspaceName || 'Garage OS'}</span>
                        </div>
                        <div className="w-8 h-8 rounded border border-white/[0.08] flex items-center justify-center bg-[#121214]">
                          {faviconPreview ? <img src={faviconPreview} className="w-full h-full object-contain p-0.5" /> : <span className="text-[10px] font-mono text-white/40">1:1</span>}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => faviconInputRef.current?.click()}
                          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.08] text-white/80 font-medium text-xs rounded-lg transition-colors"
                        >
                          <Upload className="w-3.5 h-3.5" /> Upload Favicon
                        </button>
                        {faviconPreview && (
                          <button
                            type="button"
                            onClick={() => setFaviconPreview(null)}
                            className="p-1.5 text-white/40 hover:text-[#FF453A] hover:bg-[#FF453A]/10 border border-white/[0.08] rounded-lg transition-colors"
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
              </>
            )}

            {activeTab === 'company' && (
              <div className="bg-[#161618] border border-white/[0.08] rounded-xl p-6 space-y-6">
                <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
                  <div className="flex items-center gap-2.5">
                    <Building className="w-5 h-5 text-white/70" />
                    <h2 className="text-sm font-semibold text-white">Company & Legal Particulars</h2>
                  </div>
                  <a
                    href="/dashboard/settings/organization"
                    className="text-xs text-white/50 hover:text-white transition-colors flex items-center gap-1"
                  >
                    Manage Full Branding & Socials &rarr;
                  </a>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 md:col-span-1 space-y-1.5">
                    <label className="text-xs font-medium text-white/60 block">Registered Legal Company Name</label>
                    <input 
                      type="text" 
                      value={companyName} 
                      onChange={e => setCompanyName(e.target.value)} 
                      placeholder="Grekam Garage & Auto Services Pvt Ltd" 
                      className="w-full bg-[#121214] border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-[#0A84FF]" 
                    />
                  </div>
                  <div className="col-span-2 md:col-span-1 space-y-1.5">
                    <label className="text-xs font-medium text-white/60 block">Workspace Display Name</label>
                    <input 
                      type="text" 
                      value={workspaceName} 
                      onChange={e => setWorkspaceName(e.target.value)} 
                      placeholder="Garage CRM" 
                      className="w-full bg-[#121214] border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-[#0A84FF]" 
                    />
                  </div>
                  <div className="col-span-2 md:col-span-1 space-y-1.5">
                    <label className="text-xs font-medium text-white/60 block">Income Tax PAN Number</label>
                    <input 
                      type="text" 
                      value={panNumber} 
                      onChange={e => setPanNumber(e.target.value.toUpperCase())} 
                      placeholder="ABCDE1234F" 
                      maxLength={10}
                      className="w-full bg-[#121214] border border-white/[0.08] rounded-lg px-3 py-2 text-xs font-mono uppercase text-white placeholder:text-white/20 focus:outline-none focus:border-[#0A84FF]" 
                    />
                  </div>
                  <div className="col-span-2 md:col-span-1 space-y-1.5">
                    <label className="text-xs font-medium text-white/60 block">GSTIN (GST Identification Number)</label>
                    <input 
                      type="text" 
                      value={gstNumber} 
                      onChange={e => setGstNumber(e.target.value.toUpperCase())} 
                      placeholder="33AAAAA0000A1Z5" 
                      maxLength={15}
                      className="w-full bg-[#121214] border border-white/[0.08] rounded-lg px-3 py-2 text-xs font-mono uppercase text-white placeholder:text-white/20 focus:outline-none focus:border-[#0A84FF]" 
                    />
                  </div>
                  <div className="col-span-2 md:col-span-1 space-y-1.5">
                    <label className="text-xs font-medium text-white/60 block">Phone Number</label>
                    <input type="text" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 98400 12345" className="w-full bg-[#121214] border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-[#0A84FF]" />
                  </div>
                  <div className="col-span-2 md:col-span-1 space-y-1.5">
                    <label className="text-xs font-medium text-white/60 block">Website URL</label>
                    <input type="url" value={website} onChange={e => setWebsite(e.target.value)} placeholder="https://garage-crm.com" className="w-full bg-[#121214] border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-[#0A84FF]" />
                  </div>
                  <div className="col-span-2 md:col-span-1 space-y-1.5">
                    <label className="text-xs font-medium text-white/60 block">Support / Contact Email</label>
                    <input type="email" value={supportEmail} onChange={e => setSupportEmail(e.target.value)} placeholder="contact@garage-crm.com" className="w-full bg-[#121214] border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-[#0A84FF]" />
                  </div>
                  <div className="col-span-2 md:col-span-1 space-y-1.5">
                    <label className="text-xs font-medium text-white/60 block">Billing & Official Address</label>
                    <textarea rows={3} value={billingAddress} onChange={e => setBillingAddress(e.target.value)} placeholder="Chennai, Tamil Nadu, India" className="w-full bg-[#121214] border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-[#0A84FF] resize-none" />
                  </div>
                </div>

                {/* Banking & Settlement Particulars */}
                <div className="border-t border-white/[0.06] pt-5 mt-5 space-y-4">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-white/60" />
                    <h3 className="text-xs font-semibold text-white uppercase tracking-wider">Settlement & Bank Details</h3>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-white/60 block">Bank Name</label>
                      <input type="text" value={bankName} onChange={e => setBankName(e.target.value)} placeholder="HDFC Bank Ltd" className="w-full bg-[#121214] border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-[#0A84FF]" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-white/60 block">Account Beneficiary Name</label>
                      <input type="text" value={accountName} onChange={e => setAccountName(e.target.value)} placeholder="Grekam Garage & Tech Pvt Ltd" className="w-full bg-[#121214] border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-[#0A84FF]" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-white/60 block">Account Number</label>
                      <input type="text" value={accountNumber} onChange={e => setAccountNumber(e.target.value)} placeholder="50200012345678" className="w-full bg-[#121214] border border-white/[0.08] rounded-lg px-3 py-2 text-xs font-mono text-white placeholder:text-white/20 focus:outline-none focus:border-[#0A84FF]" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-white/60 block">IFSC Code</label>
                      <input type="text" value={ifscCode} onChange={e => setIfscCode(e.target.value.toUpperCase())} placeholder="HDFC0000123" className="w-full bg-[#121214] border border-white/[0.08] rounded-lg px-3 py-2 text-xs font-mono uppercase text-white placeholder:text-white/20 focus:outline-none focus:border-[#0A84FF]" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-white/60 block">SWIFT / BIC Code</label>
                      <input type="text" value={swiftCode} onChange={e => setSwiftCode(e.target.value.toUpperCase())} placeholder="HDFCINBB" className="w-full bg-[#121214] border border-white/[0.08] rounded-lg px-3 py-2 text-xs font-mono uppercase text-white placeholder:text-white/20 focus:outline-none focus:border-[#0A84FF]" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-white/60 block">Branch Name</label>
                      <input type="text" value={bankBranch} onChange={e => setBankBranch(e.target.value)} placeholder="Indiranagar, Bangalore" className="w-full bg-[#121214] border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-[#0A84FF]" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="bg-[#161618] border border-white/[0.08] rounded-xl p-6 space-y-5">
                <div className="flex items-center gap-2.5 border-b border-white/[0.06] pb-4">
                  <Bell className="w-5 h-5 text-white/70" />
                  <h2 className="text-sm font-semibold text-white">Global Notifications</h2>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-[#121214] rounded-xl border border-white/[0.06]">
                    <div>
                      <div className="text-xs font-medium text-white">WhatsApp Integration (Grafty)</div>
                      <div className="text-[11px] text-white/40 mt-0.5">Send automated messages to leads and service clients.</div>
                    </div>
                    <a href="/dashboard/settings/integrations" className="text-xs font-medium text-white/80 hover:text-white px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.08] transition-colors">
                      Configure Keys &rarr;
                    </a>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-[#121214] rounded-xl border border-white/[0.06]">
                    <div>
                      <div className="text-xs font-medium text-white">Email Delivery (SMTP)</div>
                      <div className="text-[11px] text-white/40 mt-0.5">Automated job card updates, invoices and digests to staff.</div>
                    </div>
                    <a href="/dashboard/settings/email-templates" className="text-xs font-medium text-white/80 hover:text-white px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.08] transition-colors">
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
