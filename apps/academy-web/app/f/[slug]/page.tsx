"use client"

import { useApi } from "@/lib/useApi"
import { useParams } from "next/navigation"
import { useState } from "react"
import { CheckCircle2, Loader2, Sparkles } from "lucide-react"

export default function PublicFormRenderer() {
  const params = useParams()
  const { data: form, isLoading, error: fetchError } = useApi<any>(`/academy/forms/${params.slug}`)
  
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [submitError, setSubmitError] = useState("")

  if (isLoading) return <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white/50">Loading form...</div>
  if (fetchError || !form) return <div className="min-h-screen bg-[#050505] flex items-center justify-center text-rose-400">Form not found or is currently inactive.</div>

  const handleInput = (id: string, value: any) => {
    setFormData(prev => ({ ...prev, [id]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError("")
    setIsSubmitting(true)
    
    try {
      const res = await fetch(`http://localhost:3002/api/v1/academy/forms/${params.slug}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: formData })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "Failed to submit")
      setIsSuccess(true)
    } catch (err: any) {
      setSubmitError(err.message || "Something went wrong.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] flex items-center justify-center p-6">
        <div className="max-w-lg w-full text-center text-white bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl p-12">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-400" />
          </div>
          <h1 className="text-3xl font-black mb-3">Submitted Successfully</h1>
          <p className="text-white/60">Thank you for your response. Our team will get back to you shortly.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] flex items-center justify-center p-4 sm:p-8">
      <div className="max-w-2xl w-full">
        
        <div className="text-center mb-8 text-white">
          <div className="inline-flex items-center gap-3 mb-6 bg-white/10 border border-white/20 px-4 py-2 rounded-full">
            <Sparkles className="w-4 h-4 text-violet-300" />
            <span className="text-sm font-bold tracking-widest uppercase text-violet-100">Grekam Academy</span>
          </div>
          <h1 className="text-4xl font-black mb-3">{form.title}</h1>
          {form.description && <p className="text-white/60 text-lg">{form.description}</p>}
        </div>

        <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl p-6 sm:p-10 space-y-8 shadow-2xl">
          
          {form.fields.map((field: any) => (
            <div key={field.id} className="space-y-3">
              <label className="text-sm font-bold text-white/90 block">
                {field.label} {field.required && <span className="text-rose-400">*</span>}
              </label>

              {(field.type === "TEXT" || field.type === "EMAIL" || field.type === "PHONE" || field.type === "DATE") && (
                <input 
                  type={field.type === "EMAIL" ? "email" : field.type === "PHONE" ? "tel" : field.type === "DATE" ? "date" : "text"}
                  required={field.required}
                  className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-violet-500 transition-colors [color-scheme:dark]"
                  onChange={e => handleInput(field.id, e.target.value)}
                />
              )}

              {field.type === "TEXTAREA" && (
                <textarea 
                  required={field.required}
                  rows={4}
                  className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-violet-500 transition-colors resize-none"
                  onChange={e => handleInput(field.id, e.target.value)}
                />
              )}

              {field.type === "SELECT" && (
                <select 
                  required={field.required}
                  className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-violet-500 transition-colors [&>option]:bg-[#302b63]"
                  onChange={e => handleInput(field.id, e.target.value)}
                >
                  <option value="">Select an option</option>
                  {(field.options || []).map((opt: string) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              )}

              {field.type === "RADIO" && (
                <div className="space-y-3">
                  {(field.options || []).map((opt: string) => (
                    <label key={opt} className="flex items-center gap-3 p-4 bg-black/20 border border-white/5 rounded-2xl cursor-pointer hover:bg-black/40 transition-colors">
                      <input 
                        type="radio" 
                        name={field.id}
                        value={opt}
                        required={field.required}
                        className="w-5 h-5 accent-violet-500"
                        onChange={e => handleInput(field.id, e.target.value)}
                      />
                      <span className="text-white/80 font-medium">{opt}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          ))}

          {submitError && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-medium">
              {submitError}
            </div>
          )}

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full py-5 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-black text-lg rounded-2xl transition-all disabled:opacity-50 flex items-center justify-center gap-3 shadow-xl shadow-violet-500/20 mt-4"
          >
            {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : "Submit Response"}
          </button>
        </form>
      </div>
    </div>
  )
}
