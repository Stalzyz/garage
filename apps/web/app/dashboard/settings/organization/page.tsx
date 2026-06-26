"use client";

import { useEffect, useState } from "react";
import { ApiClient } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Loader2, Palette, Image as ImageIcon, CheckCircle, BookOpen } from "lucide-react";

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
      const updated = await ApiClient.patch("/settings/organization", org);
      setOrg(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      
      // Force reload to apply new branding globally
      window.location.reload();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
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
              <input
                type="text"
                value={org?.logoUrl || ""}
                onChange={(e) => setOrg({ ...org, logoUrl: e.target.value })}
                className="w-full bg-[#050505] border border-[#333] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                placeholder="https://cdn.example.com/logo.png"
              />
              <p className="text-xs text-[#666]">URL to a public image (Cloudflare R2 or similar).</p>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm text-[#a1a1aa]">Favicon URL</label>
              <input
                type="text"
                value={org?.faviconUrl || ""}
                onChange={(e) => setOrg({ ...org, faviconUrl: e.target.value })}
                className="w-full bg-[#050505] border border-[#333] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                placeholder="https://cdn.example.com/favicon.ico"
              />
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
            <a 
              href="/dashboard/kb" 
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-all shadow-[0_0_15px_rgba(37,99,235,0.2)] shrink-0"
            >
              Open Manual
            </a>
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
