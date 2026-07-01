"use client"

import { useApi } from "@/lib/useApi"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, ListChecks, Calendar } from "lucide-react"

export default function FormSubmissionsView() {
  const params = useParams()
  const router = useRouter()
  const { data: form, isLoading } = useApi<any>(`/academy/forms/id/${params.id}`)

  if (isLoading) return <div className="p-8 text-white/50">Loading form data...</div>
  if (!form) return <div className="p-8 text-rose-400">Form not found.</div>

  return (
    <div className="flex flex-col h-full bg-[#050505] text-white p-8 overflow-y-auto">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-white/50 hover:text-white transition-colors mb-6 text-sm font-bold w-fit">
        <ArrowLeft className="w-4 h-4" /> Back to Forms
      </button>

      <div className="mb-8">
        <h1 className="text-3xl font-black flex items-center gap-3">
          <ListChecks className="w-8 h-8 text-rose-500" /> {form.title}
        </h1>
        <p className="text-white/50 mt-2">{form.description}</p>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/10 text-white/50 text-xs uppercase tracking-widest">
            <tr>
              <th className="p-4 font-bold w-48">Submitted At</th>
              <th className="p-4 font-bold">Responses</th>
              <th className="p-4 font-bold w-32 text-right">CRM Sync</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {(form.submissions || []).length === 0 && (
              <tr><td colSpan={3} className="p-8 text-center text-white/50">No submissions yet.</td></tr>
            )}
            {(form.submissions || []).map((sub: any) => (
              <tr key={sub.id} className="hover:bg-white/[0.02]">
                <td className="p-4 align-top">
                  <div className="flex items-center gap-2 font-medium text-white/80">
                    <Calendar className="w-3 h-3" /> {new Date(sub.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                  </div>
                </td>
                <td className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {form.fields.map((field: any) => (
                      <div key={field.id} className="bg-black/30 p-3 rounded-xl border border-white/5">
                        <div className="text-[10px] text-white/40 uppercase font-bold tracking-wider mb-1">{field.label}</div>
                        <div className="font-medium text-white/90 break-words">
                          {sub.data[field.id] || <span className="text-white/20 italic">Empty</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </td>
                <td className="p-4 text-right align-top">
                  {sub.leadId ? (
                    <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded">LEAD CREATED</span>
                  ) : (
                    <span className="text-[10px] font-bold bg-white/5 text-white/30 px-2 py-1 rounded">NO LEAD</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
