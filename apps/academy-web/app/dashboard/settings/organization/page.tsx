"use client";

import { useEffect, useState } from "react";
import { ApiClient } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Loader2, Palette, Image as ImageIcon, CheckCircle, BookOpen } from "lucide-react";
import { toast } from "sonner";

export default function OrganizationSettingsPage() {
  const [org, setOrg] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    ApiClient.get("/settings/organization").then((data) => {
      setOrg(data);
      setLoading(false);
    }).catch(console.error);
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload: any = {
        name: org.name || "",
        primaryColor: org.primaryColor || "#2563eb",
      }
      if (org.logoUrl) payload.logoUrl = org.logoUrl
      if (org.faviconUrl) payload.faviconUrl = org.faviconUrl
      if (org.supportEmail) payload.supportEmail = org.supportEmail
      if (org.billingAddress) payload.billingAddress = org.billingAddress
      if (org.darkModeDefault !== undefined) payload.darkModeDefault = org.darkModeDefault
      if (org.openAiKey !== undefined) payload.openAiKey = org.openAiKey
      if (org.resendApiKey !== undefined) payload.resendApiKey = org.resendApiKey

      const updated = await ApiClient.patch("/settings/organization", payload);
      setOrg(updated);
      setSaved(true);
      toast.success("Settings saved successfully!");
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'logoUrl' | 'faviconUrl') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (field === 'logoUrl') setUploadingLogo(true);
    else setUploadingFavicon(true);

    try {
      const { uploadUrl, downloadUrl } = await ApiClient.post('/storage/upload-url', {
        filename: file.name,
        contentType: file.type,
        prefix: 'branding'
      });

      await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type }
      });

      setOrg({ ...org, [field]: downloadUrl });
    } catch (err) {
      console.error('Upload failed', err);
      alert('Upload failed. Please check console.');
    } finally {
      if (field === 'logoUrl') setUploadingLogo(false);
      else setUploadingFavicon(false);
    }
  };

  if (loading) {
    return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-[#666]" /></div>;
  }

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight">Organization & Whitelabel</h1>
        <p className="text-[#a1a1aa] mt-2">Customize the branding, colors, and global settings for your OS instance.</p>
      </div>

      <div className="space-y-8">
        {/* Core Settings */}
        <div className="bg-[#111111] border border-[#222] rounded-xl p-6">
          <h2 className="text-lg font-medium text-white mb-6 flex items-center">
            <Palette className="w-5 h-5 mr-2 text-blue-500" /> Branding
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm text-[#a1a1aa]">OS Display Name</label>
              <input
                type="text"
                value={org?.name || ""}
                onChange={(e) => setOrg({ ...org, name: e.target.value })}
                className="w-full bg-[#050505] border border-[#333] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                placeholder="e.g. Acme OS"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm text-[#a1a1aa]">Primary Color (Hex)</label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={org?.primaryColor || "#2563eb"}
                  onChange={(e) => setOrg({ ...org, primaryColor: e.target.value })}
                  className="w-10 h-10 rounded border-0 cursor-pointer bg-transparent"
                />
                <input
                  type="text"
                  value={org?.primaryColor || "#2563eb"}
                  onChange={(e) => setOrg({ ...org, primaryColor: e.target.value })}
                  className="w-full bg-[#050505] border border-[#333] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 font-mono"
                  placeholder="#2563eb"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Assets */}
        <div className="bg-[#111111] border border-[#222] rounded-xl p-6">
          <h2 className="text-lg font-medium text-white mb-6 flex items-center">
            <ImageIcon className="w-5 h-5 mr-2 text-purple-500" /> Logos & Assets
          </h2>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm text-[#a1a1aa]">Logo URL</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={org?.logoUrl || ""}
                  onChange={(e) => setOrg({ ...org, logoUrl: e.target.value })}
                  className="flex-1 bg-[#050505] border border-[#333] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                  placeholder="https://cdn.example.com/logo.png"
                />
                <label className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg cursor-pointer flex items-center justify-center min-w-[100px] transition-colors">
                  {uploadingLogo ? <Loader2 className="w-4 h-4 animate-spin" /> : "Upload"}
                  <input type="file" className="hidden" accept="image/*" onChange={(e) => handleUpload(e, 'logoUrl')} />
                </label>
              </div>
              <p className="text-xs text-[#666]">Upload a new logo or provide a direct URL.</p>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm text-[#a1a1aa]">Favicon URL</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={org?.faviconUrl || ""}
                  onChange={(e) => setOrg({ ...org, faviconUrl: e.target.value })}
                  className="flex-1 bg-[#050505] border border-[#333] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                  placeholder="https://cdn.example.com/favicon.ico"
                />
                <label className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg cursor-pointer flex items-center justify-center min-w-[100px] transition-colors">
                  {uploadingFavicon ? <Loader2 className="w-4 h-4 animate-spin" /> : "Upload"}
                  <input type="file" className="hidden" accept="image/*, .ico" onChange={(e) => handleUpload(e, 'faviconUrl')} />
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-[#111111] border border-[#222] rounded-xl p-6">
          <h2 className="text-lg font-medium text-white mb-6">Contact & Billing</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm text-[#a1a1aa]">Support Email</label>
              <input
                type="email"
                value={org?.supportEmail || ""}
                onChange={(e) => setOrg({ ...org, supportEmail: e.target.value })}
                className="w-full bg-[#050505] border border-[#333] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                placeholder="support@agency.com"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm text-[#a1a1aa]">Billing Address</label>
              <textarea
                value={org?.billingAddress || ""}
                onChange={(e) => setOrg({ ...org, billingAddress: e.target.value })}
                className="w-full bg-[#050505] border border-[#333] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 min-h-[100px]"
                placeholder="123 Creative Street..."
              />
            </div>
          </div>
        </div>

        {/* API Integrations */}
        <div className="bg-[#111111] border border-[#222] rounded-xl p-6">
          <h2 className="text-lg font-medium text-white mb-6 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="m9 15 2 2 4-4"/></svg> 
            API Integrations
          </h2>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-[#a1a1aa]">OpenAI API Key (For AI Features)</label>
              <input
                type="password"
                value={org?.openAiKey || ""}
                onChange={(e) => setOrg({ ...org, openAiKey: e.target.value })}
                className="w-full bg-[#050505] border border-[#333] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 font-mono"
                placeholder="sk-proj-..."
              />
              <p className="text-xs text-[#666]">Used for generating notes, descriptions, and AI documents.</p>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm text-[#a1a1aa]">Resend API Key (For Email Delivery)</label>
              <input
                type="password"
                value={org?.resendApiKey || ""}
                onChange={(e) => setOrg({ ...org, resendApiKey: e.target.value })}
                className="w-full bg-[#050505] border border-[#333] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 font-mono"
                placeholder="re_..."
              />
              <p className="text-xs text-[#666]">Used for delivering fee invoices and system notifications via email.</p>
            </div>
          </div>
        </div>

        {/* System Documentation / Knowledge Base */}
        <div className="bg-[#111111] border border-[#222] rounded-xl p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-medium text-white mb-2 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-500" /> System Knowledge Base
              </h2>
              <p className="text-sm text-[#a1a1aa] leading-relaxed max-w-xl">
                Access the comprehensive operational manual covering all platform sub-modules, access clearance rules, user workflows, and database mechanics.
              </p>
            </div>
            <button 
              onClick={() => toast("Knowledge Base module coming soon!")}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-all shadow-[0_0_15px_rgba(37,99,235,0.2)] shrink-0"
            >
              Open Manual
            </button>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button 
            onClick={handleSave} 
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 text-white min-w-[120px]"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 
             saved ? <><CheckCircle className="w-4 h-4 mr-2" /> Saved!</> : 
             "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}
