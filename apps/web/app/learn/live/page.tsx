"use client";
import { useEffect, useState } from "react";
import { ApiClient } from "@/lib/api";
import { Video, Calendar, ExternalLink, Loader2 } from "lucide-react";

export default function LiveClassesPage() {
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ApiClient.get("/academy/batches").then(d => {
      setBatches(d?.data || d || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Video className="w-7 h-7 text-blue-400" /> Live Classes
        </h1>
        <p className="text-[#a1a1aa] mt-1">All your scheduled Google Meet sessions.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#555]" /></div>
      ) : (
        <div className="space-y-4">
          {batches.map((batch: any) => (
            <div key={batch.id} className="bg-[#111] border border-[#222] rounded-xl p-5 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-white">{batch.name}</h3>
                <div className="flex items-center gap-3 mt-1 text-xs text-[#555]">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {batch.startDate ? new Date(batch.startDate).toLocaleDateString() : 'TBD'}</span>
                  <span className="text-[#333]">•</span>
                  <span>{batch.schedule || 'Flexible'}</span>
                </div>
              </div>
              {batch.meetLink ? (
                <a
                  href={batch.meetLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg transition-colors"
                >
                  <Video className="w-4 h-4" /> Join Meet
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </a>
              ) : (
                <span className="text-xs text-[#444] border border-[#222] px-3 py-1.5 rounded-lg">No link yet</span>
              )}
            </div>
          ))}
          {batches.length === 0 && (
            <p className="text-center py-16 text-[#444]">No batches scheduled yet.</p>
          )}
        </div>
      )}
    </div>
  );
}
