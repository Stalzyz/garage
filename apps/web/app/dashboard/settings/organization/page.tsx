"use client";

import { useEffect, useState, useRef } from "react";
import { ApiClient } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { 
  Loader2, 
  Palette, 
  Image as ImageIcon, 
  CheckCircle2, 
  BookOpen, 
  Zap, 
  Building2, 
  GraduationCap, 
  Upload, 
  Trash2, 
  Globe, 
  CreditCard,
  FileText,
  Sparkles
} from "lucide-react";
import { toast } from "sonner";

export default function OrganizationSettingsPage() {
  const [org, setOrg] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Uploading states
  const [uploadingState, setUploadingState] = useState<{ [key: string]: boolean }>({});

  const agencyLogoInputRef = useRef<HTMLInputElement>(null);
  const agencyFaviconInputRef = useRef<HTMLInputElement>(null);
  const academyLogoInputRef = useRef<HTMLInputElement>(null);
  const academyFaviconInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    ApiClient.get("/settings/organization")
      .then((data) => {
        setOrg(data || {});
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleUploadFile = async (file: File, field: 'logoUrl' | 'faviconUrl' | 'academyLogoUrl' | 'academyFaviconUrl') => {
    setUploadingState((prev) => ({ ...prev, [field]: true }));

    try {
      // 1. Request presigned upload URL or local upload endpoint
      const { uploadUrl, downloadUrl } = await ApiClient.post('/storage/upload-url', {
        filename: file.name,
        contentType: file.type || 'image/png',
        prefix: 'branding'
      });

      // 2. Upload file to target
      await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type || 'image/png' }
      });

      // 3. Update state
      setOrg((prev: any) => ({ ...prev, [field]: downloadUrl }));
      toast.success(`${field.includes('Favicon') ? 'Favicon' : 'Logo'} uploaded successfully!`);
    } catch (err: any) {
      console.warn('Upload-url failed, falling back to data URI encoding...', err);
      // Fallback: Read as base64 data URI
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUri = e.target?.result as string;
        setOrg((prev: any) => ({ ...prev, [field]: dataUri }));
        toast.success(`${field.includes('Favicon') ? 'Favicon' : 'Logo'} loaded! Click Save to apply.`);
      };
      reader.readAsDataURL(file);
    } finally {
      setUploadingState((prev) => ({ ...prev, [field]: false }));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload: any = {
        name: org.name || "Grekam Visuals",
        logoUrl: org.logoUrl || null,
        faviconUrl: org.faviconUrl || null,
        academyLogoUrl: org.academyLogoUrl || null,
        academyFaviconUrl: org.academyFaviconUrl || null,
        primaryColor: org.primaryColor || "#2563eb",
        secondaryColor: org.secondaryColor || "#1e40af",
        accentColor: org.accentColor || "#10b981",
        darkModeDefault: org.darkModeDefault ?? true,
        supportEmail: org.supportEmail || null,
        billingAddress: org.billingAddress || null,
        website: org.website || null,
        phone: org.phone || null,
        openAiKey: org.openAiKey || null,
        bankName: org.bankName || null,
        accountName: org.accountName || null,
        accountNumber: org.accountNumber || org.bankAccountNo || null,
        ifscCode: org.ifscCode || org.bankIfsc || null,
        swiftCode: org.swiftCode || null,
        bankBranch: org.bankBranch || null,
      };

      const updated = await ApiClient.patch("/settings/organization", payload);
      setOrg(updated);
      setSaved(true);
      toast.success("Organization & branding settings updated successfully!");
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-3" />
        <p className="text-sm font-mono text-white/50 uppercase tracking-wider">Loading Brand Settings...</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-10">
      {/* Page Title */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <Palette className="w-8 h-8 text-blue-500" />
            Brand Assets & Identity
          </h1>
          <p className="text-white/50 text-sm mt-1">
            Configure landscape logos and square favicons for both Digital Agency and Academy ecosystems.
          </p>
        </div>
        <Button 
          onClick={handleSave} 
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-2.5 rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all shrink-0 flex items-center gap-2"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <CheckCircle2 className="w-4 h-4 text-emerald-300" /> : <Sparkles className="w-4 h-4" />}
          {saving ? "Saving Changes..." : saved ? "Changes Saved!" : "Save Brand Settings"}
        </Button>
      </div>

      {/* ── 1. DIGITAL AGENCY BRANDING ── */}
      <div className="bg-[#0b0f19] border border-blue-500/20 rounded-3xl p-7 shadow-xl space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-wide">Digital Agency Brand (Grekam Visuals)</h2>
              <p className="text-xs text-white/50">Used across Tax Invoices, Proposals, Client Estimates, HR Documents, and Garage OS.</p>
            </div>
          </div>
          <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-mono font-bold uppercase rounded-lg">
            Agency Unit
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Agency Landscape Logo */}
          <div className="space-y-3 bg-white/[0.02] border border-white/5 rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold font-mono uppercase tracking-wider text-white/80 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-blue-400" /> Agency Logo (Landscape)
              </label>
              <span className="text-[10px] font-mono text-white/40">~3:1 / 4:1 Ratio</span>
            </div>
            <p className="text-[11px] text-white/40">Pulls automatically into PDF invoices, proposals, estimates, and email letterheads.</p>

            {/* Preview Box */}
            <div className="w-full h-28 rounded-xl border border-white/10 bg-[#06080e] p-3 flex items-center justify-center relative overflow-hidden group">
              {org?.logoUrl ? (
                <img 
                  src={org.logoUrl} 
                  alt="Agency Logo" 
                  className="max-h-full max-w-full object-contain" 
                />
              ) : (
                <div className="text-center text-white/30 text-xs font-mono">
                  No Landscape Logo Uploaded
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2 pt-2">
              <input 
                type="file" 
                ref={agencyLogoInputRef} 
                accept="image/*" 
                className="hidden" 
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleUploadFile(file, 'logoUrl');
                }} 
              />
              <button
                type="button"
                onClick={() => agencyLogoInputRef.current?.click()}
                disabled={uploadingState['logoUrl']}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-300 font-bold text-xs rounded-xl transition-all"
              >
                {uploadingState['logoUrl'] ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                {uploadingState['logoUrl'] ? "Uploading..." : "Upload Logo"}
              </button>
              {org?.logoUrl && (
                <button
                  type="button"
                  onClick={() => setOrg({ ...org, logoUrl: "" })}
                  className="p-2 text-white/40 hover:text-red-400 hover:bg-red-500/10 border border-white/10 rounded-xl transition-all"
                  title="Remove Logo"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
            <input 
              type="text" 
              placeholder="Or enter logo image URL (https://...)" 
              value={org?.logoUrl || ""} 
              onChange={(e) => setOrg({ ...org, logoUrl: e.target.value })}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white placeholder:text-white/20 focus:outline-none focus:border-blue-500" 
            />
          </div>

          {/* Agency Favicon */}
          <div className="space-y-3 bg-white/[0.02] border border-white/5 rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold font-mono uppercase tracking-wider text-white/80 flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-400" /> Agency Favicon (Square)
              </label>
              <span className="text-[10px] font-mono text-white/40">1:1 Square</span>
            </div>
            <p className="text-[11px] text-white/40">Appears on browser tabs for garage.grekam.in & grekam.in, app bookmarks and portal icons.</p>

            {/* Preview Box with Mock Browser Tab */}
            <div className="w-full h-28 rounded-xl border border-white/10 bg-[#06080e] p-3 flex flex-col justify-between">
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 max-w-[220px]">
                <div className="w-4 h-4 rounded shrink-0 flex items-center justify-center overflow-hidden bg-black/40">
                  {org?.faviconUrl ? (
                    <img src={org.faviconUrl} alt="Favicon" className="w-full h-full object-contain" />
                  ) : (
                    <Globe className="w-3 h-3 text-white/40" />
                  )}
                </div>
                <span className="text-[11px] font-mono text-white/70 truncate">Grekam OS — Agency</span>
              </div>
              <div className="flex items-center justify-end">
                <div className="w-10 h-10 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center p-1">
                  {org?.faviconUrl ? (
                    <img src={org.faviconUrl} alt="Favicon" className="w-full h-full object-contain" />
                  ) : (
                    <span className="text-[10px] font-mono text-white/20">1:1</span>
                  )}
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2 pt-2">
              <input 
                type="file" 
                ref={agencyFaviconInputRef} 
                accept="image/*, .ico" 
                className="hidden" 
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleUploadFile(file, 'faviconUrl');
                }} 
              />
              <button
                type="button"
                onClick={() => agencyFaviconInputRef.current?.click()}
                disabled={uploadingState['faviconUrl']}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-300 font-bold text-xs rounded-xl transition-all"
              >
                {uploadingState['faviconUrl'] ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                {uploadingState['faviconUrl'] ? "Uploading..." : "Upload Favicon"}
              </button>
              {org?.faviconUrl && (
                <button
                  type="button"
                  onClick={() => setOrg({ ...org, faviconUrl: "" })}
                  className="p-2 text-white/40 hover:text-red-400 hover:bg-red-500/10 border border-white/10 rounded-xl transition-all"
                  title="Remove Favicon"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
            <input 
              type="text" 
              placeholder="Or enter favicon URL (https://.../favicon.ico)" 
              value={org?.faviconUrl || ""} 
              onChange={(e) => setOrg({ ...org, faviconUrl: e.target.value })}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white placeholder:text-white/20 focus:outline-none focus:border-blue-500" 
            />
          </div>
        </div>
      </div>

      {/* ── 2. ACADEMY BRANDING ── */}
      <div className="bg-[#0f0e1a] border border-indigo-500/20 rounded-3xl p-7 shadow-xl space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-wide">Academy Brand (Grekam Academy)</h2>
              <p className="text-xs text-white/50">Used across Fee Receipts, Certificates, Course Agreements, LMS, and Student Portals.</p>
            </div>
          </div>
          <span className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-mono font-bold uppercase rounded-lg">
            Academy Unit
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Academy Landscape Logo */}
          <div className="space-y-3 bg-white/[0.02] border border-white/5 rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold font-mono uppercase tracking-wider text-white/80 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-indigo-400" /> Academy Logo (Landscape)
              </label>
              <span className="text-[10px] font-mono text-white/40">~3:1 / 4:1 Ratio</span>
            </div>
            <p className="text-[11px] text-white/40">Pulls automatically into Student Fee Receipts, Certificates, and LMS course materials.</p>

            {/* Preview Box */}
            <div className="w-full h-28 rounded-xl border border-white/10 bg-[#06080e] p-3 flex items-center justify-center relative overflow-hidden group">
              {org?.academyLogoUrl ? (
                <img 
                  src={org.academyLogoUrl} 
                  alt="Academy Logo" 
                  className="max-h-full max-w-full object-contain" 
                />
              ) : (
                <div className="text-center text-white/30 text-xs font-mono">
                  No Academy Logo Uploaded (Defaults to Agency Logo)
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2 pt-2">
              <input 
                type="file" 
                ref={academyLogoInputRef} 
                accept="image/*" 
                className="hidden" 
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleUploadFile(file, 'academyLogoUrl');
                }} 
              />
              <button
                type="button"
                onClick={() => academyLogoInputRef.current?.click()}
                disabled={uploadingState['academyLogoUrl']}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 font-bold text-xs rounded-xl transition-all"
              >
                {uploadingState['academyLogoUrl'] ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                {uploadingState['academyLogoUrl'] ? "Uploading..." : "Upload Academy Logo"}
              </button>
              {org?.academyLogoUrl && (
                <button
                  type="button"
                  onClick={() => setOrg({ ...org, academyLogoUrl: "" })}
                  className="p-2 text-white/40 hover:text-red-400 hover:bg-red-500/10 border border-white/10 rounded-xl transition-all"
                  title="Remove Academy Logo"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
            <input 
              type="text" 
              placeholder="Or enter academy logo URL (https://...)" 
              value={org?.academyLogoUrl || ""} 
              onChange={(e) => setOrg({ ...org, academyLogoUrl: e.target.value })}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500" 
            />
          </div>

          {/* Academy Favicon */}
          <div className="space-y-3 bg-white/[0.02] border border-white/5 rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold font-mono uppercase tracking-wider text-white/80 flex items-center gap-2">
                <Globe className="w-4 h-4 text-indigo-400" /> Academy Favicon (Square)
              </label>
              <span className="text-[10px] font-mono text-white/40">1:1 Square</span>
            </div>
            <p className="text-[11px] text-white/40">Appears on browser tabs for academy.grekam.in, student LMS portals, and course bookmarks.</p>

            {/* Preview Box with Mock Browser Tab */}
            <div className="w-full h-28 rounded-xl border border-white/10 bg-[#06080e] p-3 flex flex-col justify-between">
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 max-w-[220px]">
                <div className="w-4 h-4 rounded shrink-0 flex items-center justify-center overflow-hidden bg-black/40">
                  {org?.academyFaviconUrl || org?.faviconUrl ? (
                    <img src={org.academyFaviconUrl || org.faviconUrl} alt="Academy Favicon" className="w-full h-full object-contain" />
                  ) : (
                    <GraduationCap className="w-3 h-3 text-indigo-400" />
                  )}
                </div>
                <span className="text-[11px] font-mono text-white/70 truncate">Grekam Academy</span>
              </div>
              <div className="flex items-center justify-end">
                <div className="w-10 h-10 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center p-1">
                  {org?.academyFaviconUrl || org?.faviconUrl ? (
                    <img src={org.academyFaviconUrl || org.faviconUrl} alt="Academy Favicon" className="w-full h-full object-contain" />
                  ) : (
                    <span className="text-[10px] font-mono text-white/20">1:1</span>
                  )}
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2 pt-2">
              <input 
                type="file" 
                ref={academyFaviconInputRef} 
                accept="image/*, .ico" 
                className="hidden" 
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleUploadFile(file, 'academyFaviconUrl');
                }} 
              />
              <button
                type="button"
                onClick={() => academyFaviconInputRef.current?.click()}
                disabled={uploadingState['academyFaviconUrl']}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 font-bold text-xs rounded-xl transition-all"
              >
                {uploadingState['academyFaviconUrl'] ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                {uploadingState['academyFaviconUrl'] ? "Uploading..." : "Upload Academy Favicon"}
              </button>
              {org?.academyFaviconUrl && (
                <button
                  type="button"
                  onClick={() => setOrg({ ...org, academyFaviconUrl: "" })}
                  className="p-2 text-white/40 hover:text-red-400 hover:bg-red-500/10 border border-white/10 rounded-xl transition-all"
                  title="Remove Academy Favicon"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
            <input 
              type="text" 
              placeholder="Or enter academy favicon URL (https://.../favicon.ico)" 
              value={org?.academyFaviconUrl || ""} 
              onChange={(e) => setOrg({ ...org, academyFaviconUrl: e.target.value })}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500" 
            />
          </div>
        </div>
      </div>

      {/* ── 3. GENERAL ORGANIZATION & CONTACT ── */}
      <div className="bg-[#111111] border border-white/10 rounded-3xl p-7 space-y-6">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Building2 className="w-5 h-5 text-blue-500" /> Organization Legal & Contact Particulars
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-mono uppercase tracking-wider text-white/50">Organization Display Name</label>
            <input
              type="text"
              value={org?.name || ""}
              onChange={(e) => setOrg({ ...org, name: e.target.value })}
              className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
              placeholder="e.g. Grekam Visuals & Technologies Pvt Ltd"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-mono uppercase tracking-wider text-white/50">Support / Official Email</label>
            <input
              type="email"
              value={org?.supportEmail || ""}
              onChange={(e) => setOrg({ ...org, supportEmail: e.target.value })}
              className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
              placeholder="contact@grekam.in"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-mono uppercase tracking-wider text-white/50">Website URL</label>
            <input
              type="text"
              value={org?.website || ""}
              onChange={(e) => setOrg({ ...org, website: e.target.value })}
              className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
              placeholder="https://grekam.in"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-mono uppercase tracking-wider text-white/50">Contact Phone / WhatsApp</label>
            <input
              type="text"
              value={org?.phone || ""}
              onChange={(e) => setOrg({ ...org, phone: e.target.value })}
              className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
              placeholder="+91 98400 12345"
            />
          </div>

          <div className="md:col-span-2 space-y-2">
            <label className="text-xs font-mono uppercase tracking-wider text-white/50">Registered Billing Address (Printed on Invoices & Receipts)</label>
            <textarea
              value={org?.billingAddress || ""}
              onChange={(e) => setOrg({ ...org, billingAddress: e.target.value })}
              className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 min-h-[90px]"
              placeholder="No. 42 Anna Salai, Chennai, Tamil Nadu 600002"
            />
          </div>
        </div>
      </div>

      {/* ── 4. BANK & SETTLEMENT PARTICULARS ── */}
      <div className="bg-[#111111] border border-white/10 rounded-3xl p-7 space-y-6">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-emerald-400" /> Bank Settlement & UPI Details
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-mono uppercase tracking-wider text-white/50">Bank Name</label>
            <input
              type="text"
              value={org?.bankName || ""}
              onChange={(e) => setOrg({ ...org, bankName: e.target.value })}
              className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
              placeholder="e.g. HDFC Bank"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-mono uppercase tracking-wider text-white/50">Account Holder Name</label>
            <input
              type="text"
              value={org?.accountName || ""}
              onChange={(e) => setOrg({ ...org, accountName: e.target.value })}
              className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
              placeholder="Grekam Visuals & Technologies Pvt Ltd"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-mono uppercase tracking-wider text-white/50">Account Number</label>
            <input
              type="text"
              value={org?.accountNumber || org?.bankAccountNo || ""}
              onChange={(e) => setOrg({ ...org, accountNumber: e.target.value, bankAccountNo: e.target.value })}
              className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
              placeholder="50200012345678"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-mono uppercase tracking-wider text-white/50">IFSC Code</label>
            <input
              type="text"
              value={org?.ifscCode || org?.bankIfsc || ""}
              onChange={(e) => setOrg({ ...org, ifscCode: e.target.value, bankIfsc: e.target.value })}
              className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
              placeholder="HDFC0001234"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-mono uppercase tracking-wider text-white/50">Branch Name</label>
            <input
              type="text"
              value={org?.bankBranch || ""}
              onChange={(e) => setOrg({ ...org, bankBranch: e.target.value })}
              className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
              placeholder="Anna Salai Branch, Chennai"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-mono uppercase tracking-wider text-white/50">SWIFT / BIC (Optional for International Wire)</label>
            <input
              type="text"
              value={org?.swiftCode || ""}
              onChange={(e) => setOrg({ ...org, swiftCode: e.target.value })}
              className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
              placeholder="HDFCINBBXXX"
            />
          </div>
        </div>
      </div>

      {/* Save Button Bar */}
      <div className="flex items-center justify-end gap-4 pt-4 border-t border-white/10">
        <Button 
          onClick={handleSave} 
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-3 rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all min-w-[160px]"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : saved ? <CheckCircle2 className="w-4 h-4 text-emerald-300 mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
          {saving ? "Saving Changes..." : saved ? "Changes Saved!" : "Save All Changes"}
        </Button>
      </div>
    </div>
  );
}
