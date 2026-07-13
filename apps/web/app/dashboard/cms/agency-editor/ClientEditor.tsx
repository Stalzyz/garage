"use client"

import { useState } from "react"
import { Save, AlertCircle, CheckCircle2 } from "lucide-react"
import { saveAgencyData } from "./actions"

export default function ClientEditor({ initialJson }: { initialJson: string }) {
  const [jsonStr, setJsonStr] = useState(initialJson)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    setSuccess(false)
    
    // Quick validation
    try {
      JSON.parse(jsonStr)
    } catch (e) {
      setError("Invalid JSON format. Please check for syntax errors.")
      setSaving(false)
      return
    }

    const result = await saveAgencyData(jsonStr)
    if (result.success) {
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } else {
      setError(result.error || "Failed to save")
    }
    setSaving(false)
  }

  return (
    <div className="flex flex-col h-full bg-[#050505] text-white overflow-hidden p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Agency Data Editor</h1>
          <p className="text-white/50 text-sm">Edit the JSON array for the Agency homepage cards.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white px-6 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors shadow-[0_0_15px_rgba(168,85,247,0.3)]"
        >
          {saving ? <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"/> : <Save className="w-4 h-4" />}
          Save Changes
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-lg mb-6 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-500/10 border border-green-500/50 text-green-400 p-4 rounded-lg mb-6 flex items-center gap-2 transition-all">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <p>Saved successfully! Live changes applied.</p>
        </div>
      )}

      <textarea
        value={jsonStr}
        onChange={(e) => setJsonStr(e.target.value)}
        className="flex-1 w-full bg-black border border-white/10 rounded-xl p-4 text-sm font-mono text-green-400 focus:outline-none focus:border-purple-500/50 resize-none"
        spellCheck={false}
      />
    </div>
  )
}
