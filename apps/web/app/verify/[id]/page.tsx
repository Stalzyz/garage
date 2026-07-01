"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { ShieldCheck, Award, Calendar, User, Search, CheckCircle2, AlertTriangle } from "lucide-react"
import { useOrganization } from "@/context/OrganizationContext"

export default function CertificateVerificationPage() {
  const { id } = useParams()
  const org = useOrganization()
  const [certData, setCertData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetch(`/api/v1/academy/certificates/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setError(true)
        } else {
          setCertData(data.certificate)
        }
        setIsLoading(false)
      })
      .catch(() => {
        setError(true)
        setIsLoading(false)
      })
  }, [id])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <ShieldCheck className="w-16 h-16 text-slate-300 mb-4" />
          <div className="text-slate-500 font-bold">Verifying Credential...</div>
        </div>
      </div>
    )
  }

  if (error || !certData) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <div className="bg-white border border-red-200 rounded-3xl p-12 max-w-lg w-full text-center shadow-xl">
          <AlertTriangle className="w-20 h-20 text-red-500 mx-auto mb-6" />
          <h1 className="text-3xl font-black text-slate-900 mb-4">Verification Failed</h1>
          <p className="text-slate-600 mb-8">We could not find a valid certificate matching the ID <strong className="text-slate-900">{id}</strong>. The credential may be invalid or forged.</p>
          <Link href="/academy" className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors inline-block">
            Return to Academy
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-[#CCF0FA]">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/academy" className="font-bold text-slate-900 text-lg flex items-center gap-2 hover:opacity-80 transition-opacity">
            {org.academyLogoUrl
              ? <img src={org.academyLogoUrl} alt={org.name} className="w-8 h-8 rounded-full object-contain" />
              : <span className="w-8 h-8 rounded-full bg-[#49ABC9] text-white flex items-center justify-center text-sm">{org.name.charAt(0)}</span>
            }
            {org.name}
          </Link>
          <div className="hidden md:flex items-center gap-2 text-sm font-bold text-green-600 bg-green-50 px-4 py-2 rounded-full">
            <ShieldCheck className="w-4 h-4" /> Official Record
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-16">
        {/* Verification Success Banner */}
        <div className="bg-green-500 text-white rounded-t-3xl p-8 text-center flex flex-col items-center">
          <CheckCircle2 className="w-16 h-16 mb-4" />
          <h1 className="text-3xl font-black mb-2">Verified Credential</h1>
          <p className="text-green-100 max-w-lg">This certificate is authentic and was issued directly by {org.name} to the student listed below.</p>
        </div>

        {/* Certificate Details Card */}
        <div className="bg-white rounded-b-3xl shadow-xl border-x border-b border-slate-200 p-8 md:p-12">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            
            <div className="space-y-8">
              <div>
                <div className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Credential ID</div>
                <div className="text-2xl font-mono text-slate-900 bg-slate-100 inline-block px-4 py-2 rounded-lg border border-slate-200">
                  {certData.certificateId}
                </div>
              </div>

              <div>
                <div className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Recipient</div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-[#49ABC9] rounded-full flex items-center justify-center text-white font-bold text-xl">
                    {certData.student.user.firstName.charAt(0)}{certData.student.user.lastName.charAt(0)}
                  </div>
                  <div>
                    <div className="text-xl font-bold text-slate-900">{certData.student.user.firstName} {certData.student.user.lastName}</div>
                    <div className="text-sm text-slate-500">Student ID: {certData.student.studentCode}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div>
                <div className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2"><Award className="w-4 h-4" /> Certification Name</div>
                <div className="text-xl font-bold text-[#49ABC9]">{certData.course.name}</div>
                <div className="text-sm text-slate-600 mt-1">{certData.course.description}</div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2"><Calendar className="w-4 h-4" /> Issue Date</div>
                  <div className="font-bold text-slate-900">{new Date(certData.issuedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2"><Award className="w-4 h-4" /> Grade</div>
                  <div className="font-bold text-slate-900">{certData.grade || "Completed"}</div>
                </div>
              </div>
            </div>

          </div>

          <div className="mt-12 pt-8 border-t border-slate-200 flex flex-col items-center text-center">
            {org.academyLogoUrl
              ? <img src={org.academyLogoUrl} alt={org.name} className="h-12 w-12 rounded-full object-contain mb-4" />
              : org.logoUrl
                ? <img src={org.logoUrl} alt={org.name} className="h-12 w-12 rounded-full object-contain mb-4 opacity-50" />
                : <div className="h-12 w-12 rounded-full bg-[#49ABC9] text-white flex items-center justify-center font-black text-xl mb-4">{org.name.charAt(0)}</div>
            }
            <p className="text-sm font-bold text-slate-600 mb-1">{org.name}</p>
            {org.website && <a href={org.website} className="text-xs text-[#49ABC9] mb-2">{org.website}</a>}
            <p className="text-sm text-slate-500 max-w-md">This credential verifies that the recipient has successfully completed all required modules, assignments, and assessments for this program.</p>
          </div>

        </div>
      </main>
    </div>
  )
}
