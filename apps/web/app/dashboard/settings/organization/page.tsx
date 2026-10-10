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
  Upload, 
  Trash2, 
  Globe, 
  CreditCard,
  ExternalLink,
  Share2,
  FileBadge2,
  QrCode,
  Copy,
  Smartphone
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
  { name: "Apple Blue", primary: "#0A84FF", secondary: "#1C1C1E", accent: "#30D158" },
  { name: "Apple Purple", primary: "#AF52DE", secondary: "#1C1C1E", accent: "#64D2FF" },
  { name: "Apple Indigo", primary: "#5E5CE6", secondary: "#1C1C1E", accent: "#FF9F0A" },
  { name: "Apple Teal", primary: "#64D2FF", secondary: "#1C1C1E", accent: "#30D158" },
  { name: "Apple Mint", primary: "#30D158", secondary: "#1C1C1E", accent: "#64D2FF" },
  { name: "Apple Amber", primary: "#FF9F0A", secondary: "#1C1C1E", accent: "#FF453A" },
  { name: "Space Graphite", primary: "#8E8E93", secondary: "#1C1C1E", accent: "#0A84FF" },
];

export default function OrganizationSettingsPage() {
  const [org, setOrg] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Uploading states
  const [uploadingState, setUploadingState] = useState<{ [key: string]: boolean }>({});

  const squareLogoInputRef = useRef<HTMLInputElement>(null);
  const rectLogoInputRef = useRef<HTMLInputElement>(null);
  const upiQrInputRef = useRef<HTMLInputElement>(null);

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

  const handlePrimaryColorChange = (newColor: string) => {
    setOrg((prev: any) => ({ ...prev, primaryColor: newColor }));
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("theme-color-preview", { detail: { primaryColor: newColor } }));
    }
  };

  const handleUploadFile = async (file: File, field: 'logoUrl' | 'faviconUrl' | 'upiQrCodeUrl') => {
    setUploadingState((prev) => ({ ...prev, [field]: true }));

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/v1/storage/upload-local', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        throw new Error(`Upload failed with status ${res.status}`);
      }

      const data = await res.json();
      const finalUrl = data.downloadUrl || data.url;

      if (!finalUrl) {
        throw new Error("No download URL returned");
      }

      // Update local state immediately
      setOrg((prev: any) => ({ ...prev, [field]: finalUrl }));

      // Save directly to organization settings in database
      await ApiClient.patch('/settings/organization', { [field]: finalUrl });

      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("organization-updated"));
      }
      const label = field === 'faviconUrl' ? 'Dashboard logo' : field === 'upiQrCodeUrl' ? 'UPI QR code' : 'Document logo';
      toast.success(`${label} uploaded and saved!`);
    } catch (err: any) {
      console.error('File upload error:', err);
      toast.error(err.message || 'Failed to upload image');
    } finally {
      setUploadingState((prev) => ({ ...prev, [field]: false }));
    }
  };

  const handleRemoveLogo = async (field: 'logoUrl' | 'faviconUrl' | 'upiQrCodeUrl') => {
    setOrg((prev: any) => ({ ...prev, [field]: "" }));
    await ApiClient.patch('/settings/organization', { [field]: null }).catch(() => {});
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("organization-updated"));
    }
    const label = field === 'faviconUrl' ? 'Dashboard logo' : field === 'upiQrCodeUrl' ? 'UPI QR code' : 'Document logo';
    toast.success(`${label} removed`);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload: any = {
        name: org.name || "Grekam Garage",
        companyName: org.companyName ? org.companyName.trim() : null,
        panNumber: org.panNumber ? org.panNumber.trim().toUpperCase() : null,
        gstNumber: org.gstNumber ? org.gstNumber.trim().toUpperCase() : null,
        logoUrl: org.logoUrl || null,
        faviconUrl: org.faviconUrl || null,
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
        bankName: org.bankName ? org.bankName.trim() : null,
        accountName: org.accountName ? org.accountName.trim() : null,
        accountNumber: org.accountNumber ? org.accountNumber.trim() : (org.bankAccountNo || null),
        ifscCode: org.ifscCode ? org.ifscCode.trim().toUpperCase() : (org.bankIfsc || null),
        swiftCode: org.swiftCode ? org.swiftCode.trim().toUpperCase() : null,
        bankBranch: org.bankBranch ? org.bankBranch.trim() : null,
        upiId: org.upiId ? org.upiId.trim() : null,
        upiQrCodeUrl: org.upiQrCodeUrl || null,
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
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-zinc-100 tracking-tight">
              Organization & Branding
            </h1>
            {org?.id && (
              <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-semibold">
                Vendor ID: {org.id}
              </span>
            )}
          </div>
          <p className="text-sm text-zinc-400 mt-1">
            Manage your unique workspace entity, logos, color palette, tax details, and public channels.
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

      {/* ── 0. UNIQUE WORKSPACE & TENANT IDENTIFIER ── */}
      {org?.id && (
        <div className="bg-gradient-to-r from-blue-950/30 via-[#121620] to-indigo-950/30 border border-blue-500/20 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-inner">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0 font-mono text-sm font-bold">
              ID
            </div>
            <div>
              <div className="text-xs font-semibold text-zinc-200">Unique Vendor / Workspace ID</div>
              <div className="text-[11px] font-mono text-blue-400 select-all font-semibold tracking-wide">{org.id}</div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-zinc-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Dedicated Isolated Database Partition</span>
          </div>
        </div>
      )}

      {/* ── 1. BRAND LOGOS & VISUAL ASSETS (TOP POSITION) ── */}
      <div className="bg-[#121620] border border-white/[0.08] rounded-xl p-6 space-y-6">
        <div className="border-b border-white/[0.06] pb-4">
          <h2 className="text-base font-semibold text-zinc-100 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-400" /> Brand Logos & Visual Identity
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">Upload distinct logos tailored for square dashboard icons and rectangular document letterheads.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Dashboard & App Square Logo (1:1) */}
          <div className="bg-[#0b0d13] border border-white/[0.06] rounded-xl p-5 space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-200">Dashboard & Sidebar Logo</span>
                <span className="text-[10px] font-mono font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">1:1 Square</span>
              </div>
              <p className="text-[11px] text-zinc-400">Displayed on dashboard sidebar, mobile header, and browser favicon.</p>
              
              <div className="h-28 w-28 mx-auto my-3 rounded-2xl border border-dashed border-white/[0.15] bg-black/40 flex items-center justify-center p-2 overflow-hidden shadow-inner">
                {org?.faviconUrl ? (
                  <img src={org.faviconUrl} alt="Dashboard Logo" className="w-full h-full object-cover rounded-xl" />
                ) : (
                  <div className="flex flex-col items-center gap-1.5 text-zinc-500">
                    <Globe className="w-6 h-6" />
                    <span className="text-[10px]">No square logo</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-white/[0.04]">
              <input 
                type="file" 
                ref={squareLogoInputRef} 
                accept="image/*, .ico, .png, .jpg, .svg, .webp" 
                className="hidden" 
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleUploadFile(file, 'faviconUrl');
                }} 
              />
              <button
                type="button"
                onClick={() => squareLogoInputRef.current?.click()}
                disabled={uploadingState['faviconUrl']}
                className="flex-1 py-2 px-3 bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/30 text-xs font-semibold text-blue-400 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                {uploadingState['faviconUrl'] ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Upload className="w-3.5 h-3.5" />
                )}
                {uploadingState['faviconUrl'] ? "Uploading..." : "Upload Square Logo"}
              </button>
              {org?.faviconUrl && (
                <button
                  type="button"
                  onClick={() => handleRemoveLogo('faviconUrl')}
                  className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 border border-white/[0.08] rounded-lg transition-colors cursor-pointer"
                  title="Remove logo"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Documents & Invoices Rectangle Logo (~3:1 / 4:1) */}
          <div className="bg-[#0b0d13] border border-white/[0.06] rounded-xl p-5 space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-200">Invoices & Documents Logo</span>
                <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">~3:1 Rectangle</span>
              </div>
              <p className="text-[11px] text-zinc-400">Wide banner displayed at the top of Tax Invoices, Quotations, and PDF exports.</p>
              
              <div className="h-28 w-full my-3 rounded-2xl border border-dashed border-white/[0.15] bg-black/40 flex items-center justify-center p-3 overflow-hidden shadow-inner">
                {org?.logoUrl ? (
                  <img src={org.logoUrl} alt="Document Logo" className="max-h-full max-w-full object-contain" />
                ) : (
                  <div className="flex flex-col items-center gap-1.5 text-zinc-500">
                    <ImageIcon className="w-6 h-6" />
                    <span className="text-[10px]">No banner uploaded</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-white/[0.04]">
              <input 
                type="file" 
                ref={rectLogoInputRef} 
                accept="image/*, .png, .jpg, .svg, .webp" 
                className="hidden" 
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleUploadFile(file, 'logoUrl');
                }} 
              />
              <button
                type="button"
                onClick={() => rectLogoInputRef.current?.click()}
                disabled={uploadingState['logoUrl']}
                className="flex-1 py-2 px-3 bg-emerald-600/10 hover:bg-emerald-600/20 border border-emerald-500/30 text-xs font-semibold text-emerald-400 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                {uploadingState['logoUrl'] ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Upload className="w-3.5 h-3.5" />
                )}
                {uploadingState['logoUrl'] ? "Uploading..." : "Upload Document Banner"}
              </button>
              {org?.logoUrl && (
                <button
                  type="button"
                  onClick={() => handleRemoveLogo('logoUrl')}
                  className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 border border-white/[0.08] rounded-lg transition-colors cursor-pointer"
                  title="Remove banner"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. BRAND COLOR PALETTE & MANUAL SELECTORS ── */}
      <div className="bg-[#121620] border border-white/[0.08] rounded-xl p-6 space-y-6">
        <div className="border-b border-white/[0.06] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-semibold text-zinc-100 flex items-center gap-2">
              <Palette className="w-4 h-4 text-zinc-400" /> Global Token Theme Color
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">Define your system primary accent. Cascades dynamically across navigation, buttons, and badges across all modules.</p>
          </div>
          <span className="text-[11px] font-mono font-medium px-2.5 py-1 rounded-md bg-white/[0.04] border border-white/[0.08] text-zinc-300 shrink-0 self-start sm:self-auto">
            Token: <strong className="text-white uppercase">{org?.primaryColor || "#0A84FF"}</strong>
          </span>
        </div>

        {/* Apple System Accent Presets */}
        <div className="space-y-2.5">
          <label className="text-xs font-medium text-zinc-400">Apple System Accent Presets</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
            {PRESET_PALETTES.map((palette) => {
              const isSelected = org?.primaryColor?.toLowerCase() === palette.primary.toLowerCase();
              return (
                <button
                  key={palette.name}
                  type="button"
                  onClick={() => handlePrimaryColorChange(palette.primary)}
                  className={`p-2.5 rounded-lg border text-left transition-all flex items-center justify-between cursor-pointer ${
                    isSelected 
                      ? 'border-white/40 bg-white/[0.08] shadow-sm' 
                      : 'border-white/[0.06] bg-[#0b0d13] hover:border-white/[0.15] hover:bg-white/[0.02]'
                  }`}
                >
                  <span className="text-[11px] font-medium text-zinc-300 truncate mr-1.5">{palette.name}</span>
                  <span 
                    className={`w-3.5 h-3.5 rounded-full shrink-0 border transition-transform ${isSelected ? 'border-white scale-110 shadow-sm' : 'border-white/20'}`} 
                    style={{ backgroundColor: palette.primary }} 
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom HEX Picker Row */}
        <div className="bg-[#0b0d13] border border-white/[0.06] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-zinc-200">Custom Accent HEX</span>
            <p className="text-[11px] text-zinc-400 leading-tight">Pick any custom brand HEX. Updates all UI modules in real time.</p>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={org?.primaryColor || "#0A84FF"}
              onChange={(e) => handlePrimaryColorChange(e.target.value)}
              className="w-9 h-9 rounded-lg border border-white/10 cursor-pointer bg-transparent p-0 overflow-hidden shrink-0"
            />
            <input
              type="text"
              value={org?.primaryColor || "#0A84FF"}
              onChange={(e) => handlePrimaryColorChange(e.target.value)}
              className="w-32 bg-black/50 border border-white/[0.1] rounded-lg px-3 py-2 text-xs font-mono font-bold text-zinc-100 uppercase focus:outline-none focus:border-white/30 text-center"
              maxLength={7}
            />
          </div>
        </div>

        {/* Live Interactive Preview */}
        <div className="border border-white/[0.06] bg-[#0b0d13] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span 
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: org?.primaryColor || '#0A84FF' }}
              />
              <span className="text-xs font-medium text-zinc-300">Live Workspace Theme Preview</span>
            </div>
            <p className="text-[11px] text-zinc-500">
              Interactive buttons and active navigation indicators will immediately adapt to this accent.
            </p>
          </div>
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              className="px-4 py-2 rounded-lg text-xs font-medium text-white transition-opacity hover:opacity-90 cursor-pointer shadow-sm"
              style={{ backgroundColor: org?.primaryColor || '#0A84FF' }}
            >
              Primary Action
            </button>
            <button
              type="button"
              className="px-4 py-2 rounded-lg text-xs font-medium bg-white/[0.06] hover:bg-white/[0.1] text-zinc-300 border border-white/[0.08] transition-colors cursor-pointer"
            >
              Secondary Action
            </button>
          </div>
        </div>
      </div>

      {/* ── 3. COMPANY & LEGAL IDENTITY ── */}
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
              placeholder="e.g. Grekam Garage & Technologies Pvt Ltd"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-300">Display Name</label>
            <input
              type="text"
              value={org?.name || ""}
              onChange={(e) => setOrg({ ...org, name: e.target.value })}
              className="w-full bg-[#0b0d13] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30"
              placeholder="e.g. Grekam Garage"
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

      {/* ── 4. BANK SETTLEMENT & WIRE DETAILS ── */}
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
              placeholder="Grekam Garage & Technologies Pvt Ltd"
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

      {/* ── 5. UPI & INSTANT QR CODE PAYMENTS ── */}
      <div className="bg-[#121620] border border-white/[0.08] rounded-xl p-6 space-y-6">
        <div className="border-b border-white/[0.06] pb-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-zinc-100 flex items-center gap-2">
              <QrCode className="w-4 h-4 text-emerald-400" /> UPI & Instant QR Code Payments
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Enables 1-click scan-to-pay on Proforma Invoices, Tax Invoices, and Digital Client Proposals.
            </p>
          </div>
          <span className="text-[11px] font-medium bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded-full flex items-center gap-1.5">
            <Smartphone className="w-3.5 h-3.5" /> GPay / PhonePe / Paytm / BHIM
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left inputs (7 cols) */}
          <div className="lg:col-span-7 space-y-5">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-zinc-300">UPI Virtual Payment Address (VPA)</label>
                <span className="text-[11px] text-zinc-500">Auto-generates dynamic QR code</span>
              </div>
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={org?.upiId || ""}
                  onChange={(e) => setOrg({ ...org, upiId: e.target.value.trim() })}
                  className="w-full bg-[#0b0d13] border border-white/[0.08] rounded-lg px-3 py-2.5 text-sm font-mono text-zinc-100 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30"
                  placeholder="e.g. grekam@okaxis or 9840012345@upi"
                />
                {org?.upiId && (
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(org.upiId);
                      toast.success("UPI ID copied to clipboard!");
                    }}
                    className="absolute right-3 text-zinc-400 hover:text-white transition"
                    title="Copy UPI ID"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                )}
              </div>
              <p className="text-[11px] text-zinc-400">
                Clients can directly pay this UPI ID or scan the live QR code on invoices and proposals.
              </p>
            </div>

            {/* Custom QR Code Upload */}
            <div className="space-y-2 pt-2 border-t border-white/[0.06]">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-zinc-300">Custom Branded UPI QR Image (Optional)</label>
                <span className="text-[11px] text-zinc-500">PNG, JPG or SVG</span>
              </div>
              <p className="text-xs text-zinc-400">
                If you have an official merchant standee QR (from PhonePe Business, Paytm for Business, or BharatPe), you can upload it here to replace the auto-generated QR code.
              </p>
              
              <input
                ref={upiQrInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleUploadFile(file, 'upiQrCodeUrl');
                }}
              />

              <div className="flex items-center gap-3 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={uploadingState['upiQrCodeUrl']}
                  onClick={() => upiQrInputRef.current?.click()}
                  className="bg-white/5 border-white/10 hover:bg-white/10 text-white text-xs gap-2"
                >
                  {uploadingState['upiQrCodeUrl'] ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Upload className="w-3.5 h-3.5 text-emerald-400" />
                  )}
                  {org?.upiQrCodeUrl ? "Replace Custom QR Code" : "Upload Custom Merchant QR"}
                </Button>

                {org?.upiQrCodeUrl && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveLogo('upiQrCodeUrl')}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10 text-xs gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Remove Custom QR
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Right Live QR Preview (5 cols) */}
          <div className="lg:col-span-5 bg-[#0b0d13] border border-white/[0.08] rounded-xl p-5 flex flex-col items-center justify-center text-center space-y-3">
            <div className="flex items-center justify-between w-full">
              <span className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                <QrCode className="w-3.5 h-3.5 text-emerald-400" /> Live QR Code Preview
              </span>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
                {org?.upiQrCodeUrl ? "Custom Merchant QR" : org?.upiId ? "Auto-Generated UPI" : "No QR Set"}
              </span>
            </div>

            <div className="w-48 h-48 bg-white rounded-xl p-2.5 flex items-center justify-center shadow-lg shadow-black/40 border border-white/20">
              {org?.upiQrCodeUrl ? (
                <img
                  src={org.upiQrCodeUrl}
                  alt="Custom Merchant QR Code"
                  className="w-full h-full object-contain rounded-lg"
                />
              ) : org?.upiId ? (
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(`upi://pay?pa=${org.upiId}&pn=${org.companyName || org.name || 'Garage'}&cu=INR`)}`}
                  alt="Auto-Generated UPI QR Code"
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="text-zinc-400 flex flex-col items-center justify-center p-4">
                  <QrCode className="w-12 h-12 text-zinc-300 mb-2 opacity-40" />
                  <p className="text-[11px] text-zinc-500">Enter a UPI ID or upload an image to preview QR</p>
                </div>
              )}
            </div>

            <div className="text-center space-y-1">
              <p className="text-xs font-mono font-bold text-zinc-200">
                {org?.upiId || "No UPI ID Configured"}
              </p>
              <p className="text-[11px] text-zinc-400">
                Scan with any UPI App: Google Pay, PhonePe, Paytm, CRED
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── 6. OFFICIAL SOCIAL MEDIA CHANNELS ── */}
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
                placeholder="https://instagram.com/grekam"
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
                placeholder="https://youtube.com/@grekam"
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
                placeholder="https://x.com/grekam"
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
                placeholder="https://facebook.com/grekam"
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
