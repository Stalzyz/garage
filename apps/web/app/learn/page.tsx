"use client";
import { useEffect, useState } from "react";
import { ApiClient } from "@/lib/api";
import { BookOpen, Clock, Award, Play, Loader2 } from "lucide-react";

export default function LearnPage() {
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ApiClient.get("/lms/enrollments").then(d => {
      setEnrollments(d?.data || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">My Learning</h1>
        <p className="text-[#a1a1aa] mt-1">Continue where you left off.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#555]" /></div>
      ) : enrollments.length === 0 ? (
        <div className="text-center py-24 text-[#444]">
          <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p>No active courses yet. Check back after enrollment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {enrollments.map((en: any) => (
            <div key={en.id} className="bg-[#111] border border-[#222] rounded-xl p-5 hover:border-[#333] transition-colors">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-4">
                <BookOpen className="w-5 h-5 text-purple-400" />
              </div>
              <h3 className="font-semibold text-white mb-1 truncate">{en.course?.title || 'Course'}</h3>
              <p className="text-xs text-[#555] mb-4">{en.course?.category}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-[#666]">
                  <Clock className="w-3 h-3" />
                  {en.progress || 0}% complete
                </div>
                <button className="flex items-center gap-1 text-xs bg-purple-500/10 text-purple-400 border border-purple-500/20 px-3 py-1 rounded-full hover:bg-purple-500/20 transition-colors">
                  <Play className="w-3 h-3" /> Continue
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
