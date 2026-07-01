"use client";

import { useState, useRef } from "react";
import { Image as ImageIcon, Upload, X, HardDrive, CheckCircle, FileUp, Loader2 } from "lucide-react";

// Mock Seed Data from Asset Drive
const PREVIEW_GRADIENTS = [
  "from-violet-600 to-blue-600",
  "from-rose-500 to-orange-500",
  "from-emerald-500 to-teal-500",
  "from-amber-500 to-yellow-400",
  "from-blue-600 to-cyan-500",
  "from-fuchsia-600 to-pink-500",
];

const SEED_ASSETS = [
  { id: "a1", name: "RedBrick_Logo_Final_v3.ai", type: "IMAGE", size: "4.2 MB", uploadedBy: "Santhosh D.", uploadedAt: "Jun 12, 2025", tags: ["logo", "brand"], projectId: "proj_1", projectName: "RedBrick Brand Identity", starred: true, previewColor: PREVIEW_GRADIENTS[0], url: "https://images.unsplash.com/photo-1558655146-d09347e92766?w=400&q=80" },
  { id: "a4", name: "Techflow_Wireframes_v4.fig", type: "IMAGE", size: "22.1 MB", uploadedBy: "Ravi K.", uploadedAt: "Jun 16, 2025", tags: ["ui", "wireframe"], projectId: "proj_2", projectName: "Techflow SaaS Redesign", starred: false, previewColor: PREVIEW_GRADIENTS[4], url: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=400&q=80" },
  { id: "a8", name: "RedBrick_BusinessCard.png",  type: "IMAGE", size: "2.8 MB", uploadedBy: "Santhosh D.", uploadedAt: "Jun 17, 2025", tags: ["print", "brand"], projectId: "proj_1", projectName: "RedBrick Brand Identity", starred: false, previewColor: PREVIEW_GRADIENTS[0], url: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&q=80" },
  { id: "a9", name: "Packaging_3D_Render.png",    type: "IMAGE", size: "14.3 MB", uploadedBy: "Ravi K.", uploadedAt: "Jun 18, 2025", tags: ["3d", "packaging"], projectId: "proj_5", projectName: "Bloom Studios Packaging", starred: false, previewColor: PREVIEW_GRADIENTS[2], url: "https://images.unsplash.com/photo-1600607686527-6fb886090705?w=400&q=80" },
  { id: "a10", name: "Abstract_Tech_Bg.jpg",    type: "IMAGE", size: "2.1 MB", uploadedBy: "AI Gen", uploadedAt: "Jun 20, 2025", tags: ["bg", "tech"], projectId: "proj_6", projectName: "AI Campaign", starred: true, previewColor: PREVIEW_GRADIENTS[1], url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&q=80" },
  { id: "a11", name: "Dashboard_Preview.png",    type: "IMAGE", size: "5.5 MB", uploadedBy: "Priya A.", uploadedAt: "Jun 22, 2025", tags: ["dashboard", "ui"], projectId: "proj_7", projectName: "Lumina Platform", starred: false, previewColor: PREVIEW_GRADIENTS[3], url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&q=80" },
];

interface MediaPickerProps {
  value: string;
  onChange: (url: string) => void;
  placeholder?: string;
}

export function MediaPicker({ value, onChange, placeholder = "Select or upload image..." }: MediaPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tab, setTab] = useState<"UPLOAD" | "DRIVE">("UPLOAD");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // 1. Get presigned URL
      const res = await fetch("/api/v1/storage/upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type,
          prefix: "cms/uploads",
        }),
      });

      if (!res.ok) throw new Error("Failed to get upload URL");
      const { uploadUrl, downloadUrl } = await res.json();

      // 2. Upload file to presigned URL (or mock endpoint)
      await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });

      // 3. Set the image URL
      onChange(downloadUrl);
      setIsOpen(false);
    } catch (err) {
      console.error("Upload error:", err);
      alert("Failed to upload image.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div>
      <div className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 min-w-0 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 bg-white outline-none focus:border-[#49ABC9]"
        />
        <button
          onClick={() => setIsOpen(true)}
          className="flex-none flex items-center justify-center w-10 h-10 border border-slate-200 bg-slate-50 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
          title="Browse Media"
        >
          {value ? (
            <img src={value} alt="Preview" className="w-full h-full object-cover rounded-md" onError={(e) => (e.currentTarget.style.display = 'none')} />
          ) : (
            <ImageIcon className="w-4 h-4" />
          )}
        </button>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-[#49ABC9]" />
                Media Picker
              </h3>
              <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex border-b border-slate-100 px-6 gap-6 text-sm font-medium">
              <button
                onClick={() => setTab("UPLOAD")}
                className={`py-3 border-b-2 flex items-center gap-2 transition-colors ${
                  tab === "UPLOAD" ? "border-[#49ABC9] text-[#49ABC9]" : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <Upload className="w-4 h-4" /> Upload Local
              </button>
              <button
                onClick={() => setTab("DRIVE")}
                className={`py-3 border-b-2 flex items-center gap-2 transition-colors ${
                  tab === "DRIVE" ? "border-[#49ABC9] text-[#49ABC9]" : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <HardDrive className="w-4 h-4" /> Asset Drive
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
              {tab === "UPLOAD" ? (
                <div className="h-full min-h-[300px] flex flex-col items-center justify-center border-2 border-dashed border-slate-200 bg-white rounded-xl">
                  {isUploading ? (
                    <div className="flex flex-col items-center text-slate-500">
                      <Loader2 className="w-8 h-8 animate-spin text-[#49ABC9] mb-4" />
                      <p className="font-medium">Uploading image...</p>
                    </div>
                  ) : (
                    <>
                      <FileUp className="w-12 h-12 text-slate-300 mb-4" />
                      <p className="text-sm font-bold text-slate-700 mb-1">Drag and drop an image, or</p>
                      <p className="text-xs text-slate-500 mb-6">Supports JPG, PNG, GIF, WebP</p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleUpload}
                      />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-6 py-2.5 bg-[#49ABC9] hover:bg-[#3d8fa8] text-white rounded-lg text-sm font-bold transition-colors shadow-md"
                      >
                        Browse Files
                      </button>
                    </>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {SEED_ASSETS.map((asset) => (
                    <button
                      key={asset.id}
                      onClick={() => {
                        if (asset.url) {
                          onChange(asset.url);
                          setIsOpen(false);
                        }
                      }}
                      className="group relative aspect-square bg-white rounded-xl border border-slate-200 overflow-hidden hover:border-[#49ABC9] hover:shadow-lg transition-all text-left flex flex-col"
                    >
                      <div className="flex-1 bg-slate-100 relative">
                        {asset.url && (
                          <img src={asset.url} alt={asset.name} className="w-full h-full object-cover" />
                        )}
                        <div className="absolute inset-0 bg-[#49ABC9]/0 group-hover:bg-[#49ABC9]/20 transition-colors flex items-center justify-center">
                          <div className="opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all bg-white text-[#49ABC9] text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1">
                            <CheckCircle className="w-3.5 h-3.5" /> Select
                          </div>
                        </div>
                      </div>
                      <div className="p-2 border-t border-slate-100 bg-white">
                        <p className="text-[10px] font-bold text-slate-800 truncate">{asset.name}</p>
                        <p className="text-[9px] text-slate-400">{asset.projectName}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
