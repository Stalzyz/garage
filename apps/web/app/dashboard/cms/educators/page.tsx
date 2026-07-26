"use client"

import { useState, useEffect } from "react"
import { GraduationCap, ShieldCheck, ShieldAlert, Clock, UserCheck, XCircle } from "lucide-react"
import Image from "next/image"

export default function EducatorsAdminPage() {
  const [educators, setEducators] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchEducators = () => {
    fetch('/api/v1/cms/academy/educators')
      .then(res => res.json())
      .then(data => {
        setEducators(data.data || [])
        setIsLoading(false)
      })
      .catch(console.error)
  }

  useEffect(() => {
    fetchEducators()
  }, [])

  const handleVerify = async (id: string, status: "VERIFIED" | "REJECTED" | "PENDING") => {
    try {
      await fetch(`/api/v1/cms/academy/educators/${id}/verify`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verificationStatus: status })
      })
      fetchEducators()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Instructor Verifications</h1>
          <p className="text-slate-500">Review and verify educator profiles to feature them on the landing page.</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12"><div className="animate-pulse w-8 h-8 rounded-full border-4 border-slate-200 border-t-emerald-600" /></div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {educators.map((educator) => {
            const isVerified = educator.verificationStatus === "VERIFIED"
            const isPending = educator.verificationStatus === "PENDING"
            
            return (
              <div key={educator.id} className={`bg-white rounded-2xl shadow-sm border p-6 flex flex-col gap-4 relative transition-colors ${isVerified ? 'border-emerald-200' : isPending ? 'border-amber-200' : 'border-red-200'}`}>
                
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 relative">
                    {educator.user?.avatarUrl ? (
                      <Image src={educator.user.avatarUrl} alt="Avatar" fill className="object-cover" />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full text-slate-400 font-bold text-xl">
                        {educator.user?.firstName?.[0] || "?"}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">
                          {educator.user?.firstName} {educator.user?.lastName}
                        </h3>
                        <p className="text-sm text-slate-500 font-medium">{educator.designation} {educator.company ? `at ${educator.company}` : ''}</p>
                      </div>
                      <div className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full flex items-center gap-1 ${isVerified ? 'bg-emerald-100 text-emerald-700' : isPending ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                        {isVerified && <ShieldCheck className="w-3 h-3" />}
                        {isPending && <Clock className="w-3 h-3" />}
                        {!isVerified && !isPending && <ShieldAlert className="w-3 h-3" />}
                        {educator.verificationStatus}
                      </div>
                    </div>
                    
                    {educator.skills?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {educator.skills.slice(0, 5).map((skill: string) => (
                          <span key={skill} className="text-[10px] px-2 py-0.5 bg-slate-50 border border-slate-200 rounded text-slate-600">{skill}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-2 pt-4 border-t border-slate-100 flex gap-2 justify-end">
                  {isVerified ? (
                    <button onClick={() => handleVerify(educator.id, "PENDING")} className="px-4 py-2 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-200 transition-colors">
                      Revoke Verification
                    </button>
                  ) : (
                    <>
                      <button onClick={() => handleVerify(educator.id, "REJECTED")} className="px-4 py-2 bg-red-50 text-red-600 text-xs font-bold rounded-lg hover:bg-red-100 transition-colors flex items-center gap-1">
                        <XCircle className="w-3.5 h-3.5" /> Reject
                      </button>
                      <button onClick={() => handleVerify(educator.id, "VERIFIED")} className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 transition-colors shadow-sm flex items-center gap-1">
                        <UserCheck className="w-3.5 h-3.5" /> Verify & Publish
                      </button>
                    </>
                  )}
                </div>
              </div>
            )
          })}
          
          {educators.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-500 bg-white border border-slate-200 border-dashed rounded-xl">
              <GraduationCap className="w-12 h-12 mx-auto text-slate-300 mb-3" />
              <p>No educators have created profiles yet.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
