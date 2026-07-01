"use client"

import { useApi, fetchApi } from "@/lib/useApi"
import { FileText, Plus, Save, Trash2, ListChecks, Link, Loader2 } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

export default function FormBuilderAdmin() {
  const { data: forms, mutate } = useApi<any[]>("/academy/forms")
  const [isBuilding, setIsBuilding] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formMeta, setFormMeta] = useState({ title: "", description: "", createLead: true })
  const [fields, setFields] = useState<any[]>([])

  const addField = () => {
    setFields([...fields, { id: `field_${Date.now()}`, label: "", type: "TEXT", required: true, options: "" }])
  }

  const removeField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index))
  }

  const updateField = (index: number, key: string, value: any) => {
    const newFields = [...fields]
    newFields[index] = { ...newFields[index], [key]: value }
    setFields(newFields)
  }

  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formMeta.title) return toast.error("Title is required")
    if (fields.length === 0) return toast.error("Add at least one field")
    
    // Validate empty labels
    if (fields.some(f => !f.label.trim())) return toast.error("All fields must have a label")

    setIsSubmitting(true)
    try {
      const cleanFields = fields.map(f => ({
        ...f,
        options: f.type === "SELECT" || f.type === "RADIO" 
          ? f.options.split(',').map((s:string) => s.trim()).filter(Boolean) 
          : []
      }))

      await fetchApi("/academy/forms", {
        method: "POST",
        body: JSON.stringify({ ...formMeta, fields: cleanFields })
      })
      
      toast.success("Form published successfully!")
      setIsBuilding(false)
      setFormMeta({ title: "", description: "", createLead: true })
      setFields([])
      mutate()
    } catch (err: any) {
      toast.error(err.message || "Failed to save form")
    } finally {
      setIsSubmitting(false)
    }
  }

  const copyLink = (slug: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/f/${slug}`)
    toast.success("Public link copied to clipboard")
  }

  return (
    <div className="flex flex-col h-full bg-[#050505] text-white p-8 overflow-y-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black flex items-center gap-3">
            <ListChecks className="w-8 h-8 text-rose-500" /> Form Builder
          </h1>
          <p className="text-white/50 mt-2">Create custom enquiry and registration forms instantly.</p>
        </div>
        <button onClick={() => setIsBuilding(true)} className="flex items-center gap-2 bg-rose-600 hover:bg-rose-500 font-bold px-6 py-3 rounded-xl transition-colors">
          <Plus className="w-4 h-4" /> Create New Form
        </button>
      </div>

      {!isBuilding && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(forms || []).map((form: any) => (
            <div key={form.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <span className={`text-[10px] px-2 py-1 rounded font-bold uppercase tracking-widest ${form.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                  {form.isActive ? 'ACTIVE' : 'INACTIVE'}
                </span>
                {form.createLead && <span className="text-[10px] bg-sky-500/20 text-sky-400 px-2 py-1 rounded font-bold uppercase">CRM SYNC</span>}
              </div>
              <h3 className="font-bold text-lg mb-2">{form.title}</h3>
              <p className="text-xs text-white/50 mb-6 flex-1">{form.description}</p>
              
              <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/10">
                <a href={`/dashboard/academy/forms/${form.id}`} className="text-sm font-bold text-rose-400 hover:text-rose-300">
                  {form._count?.submissions || 0} Submissions
                </a>
                <button onClick={() => copyLink(form.slug)} className="p-2 hover:bg-white/10 rounded-lg text-white/50 hover:text-white transition-colors" title="Copy public link">
                  <Link className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isBuilding && (
        <div className="max-w-4xl w-full mx-auto">
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 mb-6">
            <h2 className="text-xl font-black mb-6 flex items-center gap-2">
              <FileText className="w-5 h-5 text-rose-400" /> Form Settings
            </h2>
            <div className="space-y-4">
              <input required placeholder="Form Title (e.g. Scholarship Application)" 
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-lg font-bold placeholder:text-white/30 focus:border-rose-500 transition-colors outline-none"
                value={formMeta.title} onChange={e => setFormMeta(p => ({...p, title: e.target.value}))} />
              
              <textarea placeholder="Form Description (Optional)" rows={2}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm placeholder:text-white/30 focus:border-rose-500 transition-colors outline-none resize-none"
                value={formMeta.description} onChange={e => setFormMeta(p => ({...p, description: e.target.value}))} />

              <label className="flex items-center gap-3 p-4 bg-black/30 border border-white/5 rounded-xl cursor-pointer">
                <input type="checkbox" className="w-5 h-5 accent-rose-500"
                  checked={formMeta.createLead} onChange={e => setFormMeta(p => ({...p, createLead: e.target.checked}))} />
                <div>
                  <div className="font-bold text-sm">Auto-create CRM Lead</div>
                  <div className="text-xs text-white/50">If checked, we'll try to extract Name, Phone, and Email to create a Lead automatically.</div>
                </div>
              </label>
            </div>
          </div>

          <div className="space-y-4 mb-8">
            <h2 className="text-xl font-black mb-4 px-2">Fields Configuration</h2>
            
            {fields.map((field, index) => (
              <div key={field.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 flex gap-4 items-start relative group">
                <div className="flex-1 space-y-4">
                  <div className="flex gap-4">
                    <input required placeholder="Question / Field Label" 
                      className="flex-[2] bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-rose-500"
                      value={field.label} onChange={e => updateField(index, "label", e.target.value)} />
                    
                    <select className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none"
                      value={field.type} onChange={e => updateField(index, "type", e.target.value)}>
                      <option value="TEXT">Short Text</option>
                      <option value="TEXTAREA">Long Paragraph</option>
                      <option value="EMAIL">Email</option>
                      <option value="PHONE">Phone Number</option>
                      <option value="DATE">Date Picker</option>
                      <option value="SELECT">Dropdown Select</option>
                      <option value="RADIO">Radio Buttons</option>
                    </select>

                    <label className="flex items-center gap-2 px-4 border border-white/10 rounded-xl bg-black/50 cursor-pointer">
                      <input type="checkbox" className="accent-rose-500"
                        checked={field.required} onChange={e => updateField(index, "required", e.target.checked)} />
                      <span className="text-xs font-bold text-white/70">Required</span>
                    </label>
                  </div>

                  {(field.type === "SELECT" || field.type === "RADIO") && (
                    <input placeholder="Enter options separated by commas (e.g. Graphic Design, UI/UX, Web Dev)" 
                      className="w-full bg-black/50 border border-rose-500/30 rounded-xl px-4 py-2.5 text-sm outline-none"
                      value={field.options} onChange={e => updateField(index, "options", e.target.value)} />
                  )}
                </div>
                
                <button type="button" onClick={() => removeField(index)} className="p-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl transition-colors">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}

            <button type="button" onClick={addField} className="w-full py-4 border-2 border-dashed border-white/10 hover:border-white/30 hover:bg-white/5 rounded-2xl flex items-center justify-center gap-2 text-white/50 font-bold transition-all">
              <Plus className="w-5 h-5" /> Add Field
            </button>
          </div>

          <div className="flex gap-4 sticky bottom-8">
            <button onClick={() => setIsBuilding(false)} className="flex-1 py-4 bg-white/5 hover:bg-white/10 backdrop-blur-xl rounded-2xl font-bold transition-colors">Cancel</button>
            <button onClick={handleSaveForm} disabled={isSubmitting} className="flex-[2] py-4 bg-rose-600 hover:bg-rose-500 text-white rounded-2xl font-black shadow-xl shadow-rose-500/20 transition-colors flex justify-center items-center gap-2">
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" /> Publish Form</>}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
