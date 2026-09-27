"use client";

import { useEffect, useState, useRef } from "react";
import { ApiClient } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { 
  Loader2, 
  Palette, 
  Image as ImageIcon, 
  Check, 
  Building2, 
  GraduationCap, 
  Upload, 
  Trash2, 
  Globe, 
  CreditCard,
  ExternalLink,
  Share2,
  FileBadge2,
  Eye
} from "lucide-react";
import { 
  FaTwitter, 
  FaInstagram, 
  FaLinkedinIn, 
  FaYoutube, 
  FaFacebookF, 
  FaWhatsapp 
} from "react-icons/fa";
import { toast } from "sonner";

const PRESET_PALETTES = [
  { name: "Indigo", primary: "#4f46e5", secondary: "#6366f1", accent: "#10b981" },
  { name: "Blue", primary: "#2563eb", secondary: "#3b82f6", accent: "#06b6d4" },
  { name: "Emerald", primary: "#059669", secondary: "#10b981", accent: "#34d399" },
  { name: "Rose", primary: "#e11d48", secondary: "#f43f5e", accent: "#f59e0b" },
  { name: "Purple", primary: "#7c3aed", secondary: "#8b5cf6", accent: "#ec4899" },
  { name: "Slate", primary: "#334155", secondary: "#475569", accent: "#38bdf8" },
];

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
        toast.error("Failed to load organization settings");
        setLoading(false);
      });
  }, []);

  const handleUploadFile = async (file: File, field: 'logoUrl' | 'faviconUrl' | 'academyLogoUrl' | 'academyFaviconUrl') => {
    setUploadingState((prev) => ({ ...prev, [field]: true }));

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

      setOrg((prev: any) => ({ ...prev, [field]: downloadUrl }));
      await ApiClient.patch('/settings/organization', { [field]: downloadUrl }).catch(() => {});
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("organization-updated"));
      }
      toast.success(`${field.includes('Favicon') ? 'Favicon' : 'Logo'} uploaded`);
    } catch (err: any) {
      console.warn('Upload-url failed, falling back to data URI encoding...', err);
      const reader = new FileReader();
      reader.onload = async (e) => {
        const dataUri = e.target?.result as string;
        setOrg((prev: any) => ({ ...prev, [field]: dataUri }));
        await ApiClient.patch('/settings/organization', { [field]: dataUri }).catch(() => {});
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("organization-updated"));
        }
        toast.success(`${field.includes('Favicon') ? 'Favicon' : 'Logo'} updated`);
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
        companyName: org.companyName ? org.companyName.trim() : null,
        panNumber: org.panNumber ? org.panNumber.trim().toUpperCase() : null,
        gstNumber: org.gstNumber ? org.gstNumber.trim().toUpperCase() : null,
        logoUrl: org.logoUrl || null,
        faviconUrl: org.faviconUrl || null,
        academyLogoUrl: org.academyLogoUrl || null,
        academyFaviconUrl: org.academyFaviconUrl || null,
        primaryColor: org.primaryColor || "#4f46e5",
        secondaryColor: org.secondaryColor || "#7c3aed",
        accentColor: org.accentColor || "#10b981",
        darkModeDefault: org.darkModeDefault ?? true,
        supportEmail: org.supportEmail ? org.supportEmail.trim() : null,
        billingAddress: org.billingAddress ? org.billingAddress.trim() : null,
        website: org.website ? org.website.trim() : null,
        phone: org.phone ? org.phone.trim() : null,
        instagramUrl: org.instagramUrl ? org.instagramUrl.trim() : null,
        youtubeUrl: org.youtubeUrl ? org.youtubeUrl.trim() : null,
        linkedinUrl: org.linkedinUrl ? org.linkedinUrl.trim() : null,
        twitterUrl: org.twitterUrl ? org.twitterUrl.trim() : null,
        facebookUrl: org.facebookUrl ? org.facebookUrl.trim() : null,
        whatsappNumber: org.whatsappNumber ? org.whatsappNumber.trim() : null,
        openAiKey: org.openAiKey || null,
        bankName: org.bankName ? org.bankName.trim() : null,
        accountName: org.accountName ? org.accountName.trim() : null,
        accountNumber: org.accountNumber ? org.accountNumber.trim() : (org.bankAccountNo || null),
        ifscCode: org.ifscCode ? org.ifscCode.trim().toUpperCase() : (org.bankIfsc || null),
        swiftCode: org.swiftCode ? org.swiftCode.trim().toUpperCase() : null,
        bankBranch: org.bankBranch ? org.bankBranch.trim() : null,
      };

      const updated = await ApiClient.patch("/settings/organization", payload);
      setOrg(updated);
      setSaved(true);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("organization-updated"));
      }
      toast.success("Settings saved successfully");
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || err?.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 flex flex-col items-center justify-center min-h-[350px]">
        <Loader2 className="w-6 h-6 animate-spin text-zinc-400 mb-2" />
        <p className="text-xs text-zinc-500">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-100 tracking-tight">
            Organization & Branding
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Manage your legal entity, brand assets, tax details, and public channels.
          </p>
        </div>
        <Button 
          onClick={handleSave} 
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-500 text-white font-medium px-5 py-2 rounded-lg transition-colors shrink-0 flex items-center gap-2 cursor-pointer shadow-sm"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4 text-emerald-300" /> : null}
          {saving ? "Saving..." : saved ? "Saved" : "Save changes"}
        </Button>
      </div>

      {/* ── 1. LEGAL ENTITY & TAX PARTICULARS ── */}
      <div className="bg-[#121620] border border-white/[0.08] rounded-xl p-6 space-y-6">
        <div className="border-b border-white/[0.06] pb-4">
          <h2 className="text-base font-semibold text-zinc-100 flex items-center gap-2">
            <FileBadge2 className="w-4 h-4 text-zinc-400" /> Company & Legal Identity
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">Corporate identifiers used across invoices, contracts, and filings.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-300">Registered Legal Company Name</label>
            <input
              type="text"
              value={org?.companyName || ""}
              onChange={(e) => setOrg({ ...org, companyName: e.target.value })}
              className="w-full bg-[#0b0d13] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30"
              placeholder="e.g. Grekam Visuals and Technologies Pvt Ltd"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-300">Display Name</label>
            <input
              type="text"
              value={org?.name || ""}
              onChange={(e) => setOrg({ ...org, name: e.target.value })}
              className="w-full bg-[#0b0d13] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30"
              placeholder="e.g. Grekam Visuals"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-zinc-300">Income Tax PAN</label>
              <span className="text-[11px] text-zinc-500">10-character code</span>
            </div>
            <input
              type="text"
              value={org?.panNumber || ""}
              onChange={(e) => setOrg({ ...org, panNumber: e.target.value.toUpperCase() })}
              className="w-full bg-[#0b0d13] border border-white/[0.08] rounded-lg px-3 py-2 text-sm font-mono uppercase text-zinc-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30"
              placeholder="ABCDE1234F"
              maxLength={10}
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-zinc-300">GSTIN</label>
              <span className="text-[11px] text-zinc-500">Auto-synced with Finance</span>
            </div>
            <input
              type="text"
              value={org?.gstNumber || ""}
              onChange={(e) => setOrg({ ...org, gstNumber: e.target.value.toUpperCase() })}
              className="w-full bg-[#0b0d13] border border-white/[0.08] rounded-lg px-3 py-2 text-sm font-mono uppercase text-zinc-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30"
              placeholder="33AAAAA0000A1Z5"
              maxLength={15}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-300">Official Support Email</label>
            <input
              type="email"
              value={org?.supportEmail || ""}
              onChange={(e) => setOrg({ ...org, supportEmail: e.target.value })}
              className="w-full bg-[#0b0d13] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30"
              placeholder="contact@grekam.in"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-300">Official Website</label>
            <div className="relative flex items-center">
              <input
                type="text"
                value={org?.website || ""}
                onChange={(e) => setOrg({ ...org, website: e.target.value })}
                className="w-full bg-[#0b0d13] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500 pr-9"
                placeholder="https://grekam.in"
              />
              {org?.website && (
                <a
                  href={org.website.startsWith("http") ? org.website : `https://${org.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute right-3 text-zinc-400 hover:text-zinc-200 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-300">Contact Phone</label>
            <input
              type="text"
              value={org?.phone || ""}
              onChange={(e) => setOrg({ ...org, phone: e.target.value })}
              className="w-full bg-[#0b0d13] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
              placeholder="+91 98400 12345"
            />
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-medium text-zinc-300">Registered Billing Address</label>
            <textarea
              value={org?.billingAddress || ""}
              onChange={(e) => setOrg({ ...org, billingAddress: e.target.value })}
              className="w-full bg-[#0b0d13] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500 min-h-[75px] resize-none"
              placeholder="No. 42 Anna Salai, Chennai, Tamil Nadu 600002"
            />
          </div>
        </div>
      </div>

      {/* ── 2. BRAND COLOR THEME ── */}
      <div className="bg-[#121620] border border-white/[0.08] rounded-xl p-6 space-y-6">
        <div className="border-b border-white/[0.06] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-semibold text-zinc-100 flex items-center gap-2">
              <Palette className="w-4 h-4 text-zinc-400" /> Brand Color Palette
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">Applied to invoice headers, badges, and interface accents.</p>
          </div>
        </div>

        {/* Curated Presets */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-zinc-400">Palette Presets</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {PRESET_PALETTES.map((palette) => {
              const isSelected = 
                org?.primaryColor?.toLowerCase() === palette.primary.toLowerCase() &&
                org?.secondaryColor?.toLowerCase() === palette.secondary.toLowerCase() &&
                org?.accentColor?.toLowerCase() === palette.accent.toLowerCase();

              return (
                <button
                  key={palette.name}
                  type="button"
                  onClick={() => setOrg({
                    ...org,
                    primaryColor: palette.primary,
                    secondaryColor: palette.secondary,
                    accentColor: palette.accent,
                  })}
                  className={`p-2.5 rounded-lg border text-left transition-colors flex items-center justify-between cursor-pointer ${
                    isSelected 
                      ? 'border-blue-500/60 bg-blue-500/10' 
                      : 'border-white/[0.06] bg-[#0b0d13] hover:border-white/[0.15]'
                  }`}
                >
                  <span className="text-xs font-medium text-zinc-300">{palette.name}</span>
                  <div className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: palette.primary }} />
                    <span className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: palette.accent }} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Individual Color Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[#0b0d13] border border-white/[0.06] rounded-lg p-3.5 space-y-2">
            <label className="text-xs font-medium text-zinc-300 block">Primary Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={org?.primaryColor || "#4f46e5"}
                onChange={(e) => setOrg({ ...org, primaryColor: e.target.value })}
                className="w-8 h-8 rounded border border-white/10 cursor-pointer bg-transparent p-0 overflow-hidden"
              />
              <input
                type="text"
                value={org?.primaryColor || "#4f46e5"}
                onChange={(e) => setOrg({ ...org, primaryColor: e.target.value })}
                className="w-full bg-black/40 border border-white/[0.08] rounded-md px-2.5 py-1.5 text-xs font-mono text-zinc-200 uppercase focus:outline-none focus:border-blue-500"
                maxLength={7}
              />
            </div>
          </div>

          <div className="bg-[#0b0d13] border border-white/[0.06] rounded-lg p-3.5 space-y-2">
            <label className="text-xs font-medium text-zinc-300 block">Secondary Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={org?.secondaryColor || "#7c3aed"}
                onChange={(e) => setOrg({ ...org, secondaryColor: e.target.value })}
                className="w-8 h-8 rounded border border-white/10 cursor-pointer bg-transparent p-0 overflow-hidden"
              />
              <input
                type="text"
                value={org?.secondaryColor || "#7c3aed"}
                onChange={(e) => setOrg({ ...org, secondaryColor: e.target.value })}
                className="w-full bg-black/40 border border-white/[0.08] rounded-md px-2.5 py-1.5 text-xs font-mono text-zinc-200 uppercase focus:outline-none focus:border-blue-500"
                maxLength={7}
              />
            </div>
          </div>

          <div className="bg-[#0b0d13] border border-white/[0.06] rounded-lg p-3.5 space-y-2">
            <label className="text-xs font-medium text-zinc-300 block">Accent Highlight</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={org?.accentColor || "#10b981"}
                onChange={(e) => setOrg({ ...org, accentColor: e.target.value })}
                className="w-8 h-8 rounded border border-white/10 cursor-pointer bg-transparent p-0 overflow-hidden"
              />
              <input
                type="text"
                value={org?.accentColor || "#10b981"}
                onChange={(e) => setOrg({ ...org, accentColor: e.target.value })}
                className="w-full bg-black/40 border border-white/[0.08] rounded-md px-2.5 py-1.5 text-xs font-mono text-zinc-200 uppercase focus:outline-none focus:border-blue-500"
                maxLength={7}
              />
            </div>
          </div>
        </div>

        {/* Clean Live Component Simulation */}
        <div className="border border-white/[0.06] bg-[#0b0d13] rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span 
                className="px-2 py-0.5 rounded text-[11px] font-medium"
                style={{ 
                  backgroundColor: `${org?.accentColor || '#10b981'}1a`,
                  color: org?.accentColor || '#10b981'
                }}
              >
                ● Active
              </span>
              <span className="text-xs text-zinc-400">Invoice #INV-2026-001</span>
            </div>
            <p className="text-sm font-medium text-zinc-200">
              {org?.companyName || org?.name || "Grekam Visuals and Technologies Pvt Ltd"}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              className="px-3.5 py-1.5 rounded-md text-xs font-medium text-white shadow-sm"
              style={{ backgroundColor: org?.primaryColor || '#4f46e5' }}
            >
              Primary
            </button>
            <button
              type="button"
              className="px-3.5 py-1.5 rounded-md text-xs font-medium border border-white/[0.1] text-zinc-300 hover:bg-white/[0.04]"
            >
              Secondary
            </button>
          </div>
        </div>
      </div>

      {/* ── 3. OFFICIAL SOCIAL MEDIA CHANNELS ── */}
      <div className="bg-[#121620] border border-white/[0.08] rounded-xl p-6 space-y-5">
        <div className="border-b border-white/[0.06] pb-4">
          <h2 className="text-base font-semibold text-zinc-100 flex items-center gap-2">
            <Share2 className="w-4 h-4 text-zinc-400" /> Social Media & Channels
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">Displayed in email footers, proposals, and client portals.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Instagram */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-400">Instagram</label>
            <div className="relative flex items-center">
              <FaInstagram className="w-4 h-4 text-zinc-500 absolute left-3 pointer-events-none" />
              <input
                type="text"
                value={org?.instagramUrl || ""}
                onChange={(e) => setOrg({ ...org, instagramUrl: e.target.value })}
                className="w-full bg-[#0b0d13] border border-white/[0.08] rounded-lg pl-9 pr-9 py-2 text-xs text-zinc-200 focus:outline-none focus:border-blue-500"
                placeholder="https://instagram.com/grekamvisuals"
              />
              {org?.instagramUrl && (
                <a
                  href={org.instagramUrl.startsWith("http") ? org.instagramUrl : `https://${org.instagramUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute right-3 text-zinc-500 hover:text-zinc-300"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>

          {/* YouTube */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-400">YouTube</label>
            <div className="relative flex items-center">
              <FaYoutube className="w-4 h-4 text-zinc-500 absolute left-3 pointer-events-none" />
              <input
                type="text"
                value={org?.youtubeUrl || ""}
                onChange={(e) => setOrg({ ...org, youtubeUrl: e.target.value })}
                className="w-full bg-[#0b0d13] border border-white/[0.08] rounded-lg pl-9 pr-9 py-2 text-xs text-zinc-200 focus:outline-none focus:border-blue-500"
                placeholder="https://youtube.com/@grekamvisuals"
              />
              {org?.youtubeUrl && (
                <a
                  href={org.youtubeUrl.startsWith("http") ? org.youtubeUrl : `https://${org.youtubeUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute right-3 text-zinc-500 hover:text-zinc-300"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>

          {/* LinkedIn */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-400">LinkedIn</label>
            <div className="relative flex items-center">
              <FaLinkedinIn className="w-4 h-4 text-zinc-500 absolute left-3 pointer-events-none" />
              <input
                type="text"
                value={org?.linkedinUrl || ""}
                onChange={(e) => setOrg({ ...org, linkedinUrl: e.target.value })}
                className="w-full bg-[#0b0d13] border border-white/[0.08] rounded-lg pl-9 pr-9 py-2 text-xs text-zinc-200 focus:outline-none focus:border-blue-500"
                placeholder="https://linkedin.com/company/grekam"
              />
              {org?.linkedinUrl && (
                <a
                  href={org.linkedinUrl.startsWith("http") ? org.linkedinUrl : `https://${org.linkedinUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute right-3 text-zinc-500 hover:text-zinc-300"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>

          {/* X / Twitter */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-400">X (Twitter)</label>
            <div className="relative flex items-center">
              <FaTwitter className="w-4 h-4 text-zinc-500 absolute left-3 pointer-events-none" />
              <input
                type="text"
                value={org?.twitterUrl || ""}
                onChange={(e) => setOrg({ ...org, twitterUrl: e.target.value })}
                className="w-full bg-[#0b0d13] border border-white/[0.08] rounded-lg pl-9 pr-9 py-2 text-xs text-zinc-200 focus:outline-none focus:border-blue-500"
                placeholder="https://x.com/grekamvisuals"
              />
              {org?.twitterUrl && (
                <a
                  href={org.twitterUrl.startsWith("http") ? org.twitterUrl : `https://${org.twitterUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute right-3 text-zinc-500 hover:text-zinc-300"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>

          {/* Facebook */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-400">Facebook</label>
            <div className="relative flex items-center">
              <FaFacebookF className="w-4 h-4 text-zinc-500 absolute left-3 pointer-events-none" />
              <input
                type="text"
                value={org?.facebookUrl || ""}
                onChange={(e) => setOrg({ ...org, facebookUrl: e.target.value })}
                className="w-full bg-[#0b0d13] border border-white/[0.08] rounded-lg pl-9 pr-9 py-2 text-xs text-zinc-200 focus:outline-none focus:border-blue-500"
                placeholder="https://facebook.com/grekamvisuals"
              />
              {org?.facebookUrl && (
                <a
                  href={org.facebookUrl.startsWith("http") ? org.facebookUrl : `https://${org.facebookUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute right-3 text-zinc-500 hover:text-zinc-300"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>

          {/* WhatsApp */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-400">WhatsApp Business</label>
            <div className="relative flex items-center">
              <FaWhatsapp className="w-4 h-4 text-zinc-500 absolute left-3 pointer-events-none" />
              <input
                type="text"
                value={org?.whatsappNumber || ""}
                onChange={(e) => setOrg({ ...org, whatsappNumber: e.target.value })}
                className="w-full bg-[#0b0d13] border border-white/[0.08] rounded-lg pl-9 pr-9 py-2 text-xs text-zinc-200 focus:outline-none focus:border-blue-500"
                placeholder="+91 98400 12345"
              />
              {org?.whatsappNumber && (
                <a
                  href={
                    org.whatsappNumber.startsWith("http") 
                      ? org.whatsappNumber 
                      : `https://wa.me/${org.whatsappNumber.replace(/[^0-9]/g, '')}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute right-3 text-zinc-500 hover:text-zinc-300"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── 4. BRAND LOGOS & VISUAL ASSETS ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Dashboard & App Square Logo */}
        <div className="bg-[#121620] border border-white/[0.08] rounded-xl p-6 space-y-4">
          <div className="border-b border-white/[0.06] pb-3">
            <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-400" /> Dashboard & Sidebar Logo (Square)
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">Square 1:1 ratio icon displayed in the dashboard sidebar, top navigation, and app icon.</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-zinc-400 font-medium">
              <span>Square App Logo</span>
              <span className="text-[11px] text-zinc-500">1:1 square ratio</span>
            </div>
            <div className="h-24 w-24 mx-auto rounded-xl border border-dashed border-white/[0.15] bg-[#0b0d13] flex items-center justify-center p-2 overflow-hidden shadow-inner">
              {org?.faviconUrl ? (
                <img src={org.faviconUrl} alt="Dashboard Logo" className="w-full h-full object-cover rounded-lg" />
              ) : (
                <div className="flex flex-col items-center gap-1 text-zinc-500">
                  <Globe className="w-6 h-6" />
                  <span className="text-[10px]">No logo</span>
                </div>
              )}
            </div>
            <div className="flex gap-2 pt-2">
              <input 
                type="file" 
                ref={agencyFaviconInputRef} 
                accept="image/*, .ico, .png, .jpg, .svg, .webp" 
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
                className="flex-1 py-2 px-3 bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/30 text-xs font-semibold text-blue-400 rounded-lg transition-colors cursor-pointer"
              >
                {uploadingState['faviconUrl'] ? "Uploading..." : "Upload Dashboard Logo"}
              </button>
              {org?.faviconUrl && (
                <button
                  type="button"
                  onClick={async () => {
                    setOrg({ ...org, faviconUrl: "" });
                    await ApiClient.patch('/settings/organization', { faviconUrl: null }).catch(() => {});
                    if (typeof window !== "undefined") window.dispatchEvent(new Event("organization-updated"));
                    toast.success("Dashboard logo removed");
                  }}
                  className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 border border-white/[0.08] rounded-lg transition-colors cursor-pointer"
                  title="Remove logo"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Documents & Invoices Rectangle Logo */}
        <div className="bg-[#121620] border border-white/[0.08] rounded-xl p-6 space-y-4">
          <div className="border-b border-white/[0.06] pb-3">
            <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
              <FileBadge2 className="w-4 h-4 text-emerald-400" /> Invoices & Documents Logo (Rectangle)
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">Wide landscape banner displayed on Tax Invoices, Estimates, Quotations, and PDF exports.</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-zinc-400 font-medium">
              <span>Wide Document Banner</span>
              <span className="text-[11px] text-zinc-500">~3:1 or 4:1 landscape</span>
            </div>
            <div className="h-24 w-full rounded-xl border border-dashed border-white/[0.15] bg-[#0b0d13] flex items-center justify-center p-3 overflow-hidden shadow-inner">
              {org?.logoUrl ? (
                <img src={org.logoUrl} alt="Document Logo" className="max-h-full max-w-full object-contain" />
              ) : (
                <div className="flex flex-col items-center gap-1 text-zinc-500">
                  <ImageIcon className="w-6 h-6" />
                  <span className="text-[10px]">No invoice banner uploaded</span>
                </div>
              )}
            </div>
            <div className="flex gap-2 pt-2">
              <input 
                type="file" 
                ref={agencyLogoInputRef} 
                accept="image/*, .png, .jpg, .svg, .webp" 
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
                className="flex-1 py-2 px-3 bg-emerald-600/10 hover:bg-emerald-600/20 border border-emerald-500/30 text-xs font-semibold text-emerald-400 rounded-lg transition-colors cursor-pointer"
              >
                {uploadingState['logoUrl'] ? "Uploading..." : "Upload Document Logo"}
              </button>
              {org?.logoUrl && (
                <button
                  type="button"
                  onClick={async () => {
                    setOrg({ ...org, logoUrl: "" });
                    await ApiClient.patch('/settings/organization', { logoUrl: null }).catch(() => {});
                    if (typeof window !== "undefined") window.dispatchEvent(new Event("organization-updated"));
                    toast.success("Document logo removed");
                  }}
                  className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 border border-white/[0.08] rounded-lg transition-colors cursor-pointer"
                  title="Remove logo"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── 5. BANK SETTLEMENT & UPI DETAILS ── */}
      <div className="bg-[#121620] border border-white/[0.08] rounded-xl p-6 space-y-5">
        <div className="border-b border-white/[0.06] pb-4">
          <h2 className="text-base font-semibold text-zinc-100 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-zinc-400" /> Bank Settlement Details
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">Printed on invoice footers for direct NEFT/RTGS/IMPS wire payments.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-300">Bank Name</label>
            <input
              type="text"
              value={org?.bankName || ""}
              onChange={(e) => setOrg({ ...org, bankName: e.target.value })}
              className="w-full bg-[#0b0d13] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
              placeholder="e.g. HDFC Bank"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-300">Account Holder Name</label>
            <input
              type="text"
              value={org?.accountName || ""}
              onChange={(e) => setOrg({ ...org, accountName: e.target.value })}
              className="w-full bg-[#0b0d13] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
              placeholder="Grekam Visuals and Technologies Pvt Ltd"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-300">Account Number</label>
            <input
              type="text"
              value={org?.accountNumber || org?.bankAccountNo || ""}
              onChange={(e) => setOrg({ ...org, accountNumber: e.target.value, bankAccountNo: e.target.value })}
              className="w-full bg-[#0b0d13] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-zinc-100 font-mono focus:outline-none focus:border-blue-500"
              placeholder="50200012345678"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-300">IFSC Code</label>
            <input
              type="text"
              value={org?.ifscCode || org?.bankIfsc || ""}
              onChange={(e) => setOrg({ ...org, ifscCode: e.target.value.toUpperCase(), bankIfsc: e.target.value.toUpperCase() })}
              className="w-full bg-[#0b0d13] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-zinc-100 font-mono uppercase focus:outline-none focus:border-blue-500"
              placeholder="HDFC0001234"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-300">Branch Name</label>
            <input
              type="text"
              value={org?.bankBranch || ""}
              onChange={(e) => setOrg({ ...org, bankBranch: e.target.value })}
              className="w-full bg-[#0b0d13] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
              placeholder="Anna Salai Branch, Chennai"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-300">SWIFT / BIC (Optional for International Wire)</label>
            <input
              type="text"
              value={org?.swiftCode || ""}
              onChange={(e) => setOrg({ ...org, swiftCode: e.target.value.toUpperCase() })}
              className="w-full bg-[#0b0d13] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-zinc-100 font-mono uppercase focus:outline-none focus:border-blue-500"
              placeholder="HDFCINBBXXX"
            />
          </div>
        </div>
      </div>

      {/* Save Button Bar */}
      <div className="flex items-center justify-end pt-2">
        <Button 
          onClick={handleSave} 
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-500 text-white font-medium px-6 py-2.5 rounded-lg transition-colors cursor-pointer shadow-sm"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : saved ? <Check className="w-4 h-4 mr-2" /> : null}
          {saving ? "Saving..." : saved ? "Saved" : "Save changes"}
        </Button>
      </div>
    </div>
  );
}
