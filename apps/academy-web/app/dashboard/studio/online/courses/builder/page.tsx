"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { MonitorPlay, Loader2, ArrowRight } from "lucide-react"
import { fetchApi } from "@/lib/useApi"

export default function NewCoursePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.code) {
      setError("Title and Course Code are required.")
      return
    }

    setLoading(true)
    setError("")
    try {
      // Using fetchApi wrapper which handles credentials, errors, and endpoints relative to API_BASE_URL
      const data: any = await fetchApi("/lms/courses", {
        method: "POST",
        body: JSON.stringify({
          name: formData.name,
          code: formData.code.toUpperCase(),
          description: formData.description,
          duration: "Self-paced",
          fee: 0,
        })
      })

      // Redirect to builder with the newly created LMSCourse ID
      router.push(`/dashboard/studio/online/courses/builder/${data.id}`)
    } catch (err: any) {
      setError(err.message || "An error occurred")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-[#0a0a0a] border border-white/10 rounded-3xl p-8"
      >
        <div className="w-16 h-16 rounded-2xl bg-purple-500/20 flex items-center justify-center mb-6 mx-auto border border-purple-500/30">
          <MonitorPlay className="w-8 h-8 text-purple-400" />
        </div>
        
        <h1 className="text-2xl font-bold text-center mb-2">Create New Course</h1>
        <p className="text-white/50 text-center text-sm mb-8">Setup the basics of your new course. You can change these later.</p>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-white/70 ml-1">Course Title *</label>
            <input 
              type="text" 
              placeholder="e.g. Advanced Web Architecture"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white focus:outline-none focus:ring-1 focus:ring-purple-500/50" 
              required
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-xs font-semibold text-white/70 ml-1">Course Code *</label>
            <input 
              type="text" 
              placeholder="e.g. CS501"
              value={formData.code}
              onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
              className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white focus:outline-none focus:ring-1 focus:ring-purple-500/50 uppercase" 
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-white/70 ml-1">Short Description</label>
            <textarea 
              placeholder="What is this course about?"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:ring-1 focus:ring-purple-500/50 resize-none" 
            />
          </div>

          {error && <p className="text-red-400 text-sm text-center">{error}</p>}

          <button 
            type="submit"
            disabled={loading}
            className="w-full h-12 mt-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold transition-colors flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(168,85,247,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
              <>Create Course <ArrowRight className="w-4 h-4" /></>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  )
}
