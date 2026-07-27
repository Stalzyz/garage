"use client"

import { useState, useEffect } from "react"
import { Award, Download, ExternalLink, Calendar, CheckCircle } from "lucide-react"
import { fetchApi } from "@/lib/useApi"
import { toast } from "sonner"

export default function StudentCertificatesPage() {
  const [certificates, setCertificates] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // In a real app, this would fetch the current student's certificates
    // For now, we simulate fetching
    setTimeout(() => {
      setCertificates([])
      setIsLoading(false)
    }, 1000)
  }, [])

  return (
    <div className="p-8 h-full overflow-y-auto bg-[#0a0a0a] text-white">
      <div className="mb-10">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <Award className="w-8 h-8 text-purple-500" />
          My Certificates
        </h1>
        <p className="text-white/50">View and download your earned certificates.</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full"></div>
        </div>
      ) : certificates.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-3xl p-12 text-center max-w-2xl mx-auto mt-20">
          <Award className="w-16 h-16 text-white/20 mx-auto mb-6" />
          <h2 className="text-2xl font-bold mb-3">No certificates yet</h2>
          <p className="text-white/50 mb-8 max-w-md mx-auto">
            Complete courses and assignments to earn certificates. They will appear here once issued by your educators.
          </p>
          <button className="px-6 py-3 bg-purple-600 hover:bg-purple-500 rounded-xl font-bold transition-colors">
            Browse Courses
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certificates.map((cert) => (
            <div key={cert.id} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden group">
              <div className="h-48 bg-gradient-to-br from-purple-900/40 to-blue-900/40 relative flex flex-col items-center justify-center p-6 text-center">
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm z-10 gap-3">
                  <a href={cert.pdfUrl} target="_blank" rel="noopener noreferrer" className="p-3 bg-white text-black rounded-full hover:scale-110 transition-transform">
                    <Download className="w-5 h-5" />
                  </a>
                  <a href={`/verify/${cert.verificationCode}`} target="_blank" rel="noopener noreferrer" className="p-3 bg-white/20 text-white rounded-full hover:scale-110 transition-transform">
                    <ExternalLink className="w-5 h-5" />
                  </a>
                </div>
                <Award className="w-12 h-12 text-purple-400 mb-3" />
                <h3 className="font-serif text-lg font-bold text-white/90 line-clamp-2">{cert.course?.title || "Course Certificate"}</h3>
              </div>
              <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-xs text-white/50">
                    <Calendar className="w-4 h-4" />
                    <span>Issued: {new Date(cert.issuedAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-green-400 font-semibold bg-green-400/10 px-2 py-1 rounded">
                    <CheckCircle className="w-3 h-3" />
                    Verified
                  </div>
                </div>
                <div className="text-xs text-white/40 font-mono">
                  ID: {cert.certificateId}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
