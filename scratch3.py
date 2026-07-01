import re

with open("apps/web/app/dashboard/hr/page.tsx", "r") as f:
    content = f.read()

# Add inputs for extended fields
extended_inputs = """
          <div className="pt-4 border-t border-white/10 mt-4">
            <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-emerald-400 mb-4">Extended Profile Details</h4>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-widest text-white/50 mb-2">Blood Group</label>
                <input value={formData.bloodGroup} onChange={e => setFormData({...formData, bloodGroup: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-emerald-500/50 outline-none" placeholder="e.g. O+" />
              </div>
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-widest text-white/50 mb-2">Gov ID Type</label>
                <input value={formData.govIdType} onChange={e => setFormData({...formData, govIdType: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-emerald-500/50 outline-none" placeholder="e.g. PAN" />
              </div>
              <div className="col-span-2">
                <label className="block text-[10px] font-mono uppercase tracking-widest text-white/50 mb-2">Gov ID Number</label>
                <input value={formData.govIdNumber} onChange={e => setFormData({...formData, govIdNumber: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-emerald-500/50 outline-none" />
              </div>
            </div>

            <h5 className="text-[10px] font-mono font-bold uppercase tracking-widest text-white/70 mb-3">Emergency Contact</h5>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="col-span-2">
                <input value={formData.emergencyContactName} onChange={e => setFormData({...formData, emergencyContactName: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-emerald-500/50 outline-none" placeholder="Contact Name" />
              </div>
              <div>
                <input value={formData.emergencyContactRelation} onChange={e => setFormData({...formData, emergencyContactRelation: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-emerald-500/50 outline-none" placeholder="Relation (e.g. Spouse)" />
              </div>
              <div>
                <input value={formData.emergencyContactPhone} onChange={e => setFormData({...formData, emergencyContactPhone: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-emerald-500/50 outline-none" placeholder="Phone Number" />
              </div>
            </div>

            <h5 className="text-[10px] font-mono font-bold uppercase tracking-widest text-white/70 mb-3">Bank Details</h5>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <input value={formData.bankName} onChange={e => setFormData({...formData, bankName: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-emerald-500/50 outline-none" placeholder="Bank Name" />
              </div>
              <div>
                <input value={formData.bankAccountNo} onChange={e => setFormData({...formData, bankAccountNo: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-emerald-500/50 outline-none" placeholder="Account No" />
              </div>
              <div>
                <input value={formData.bankIfsc} onChange={e => setFormData({...formData, bankIfsc: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-emerald-500/50 outline-none" placeholder="IFSC Code" />
              </div>
            </div>
          </div>
"""

# Find the button in the form and insert before it
content = content.replace(
    '<button disabled={isSubmitting} type="submit" className="w-full py-4 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg font-bold font-mono tracking-widest uppercase hover:bg-emerald-500/30 transition-colors disabled:opacity-50">\n            {isSubmitting ? "Processing..." : "Create Personnel"}\n          </button>',
    extended_inputs + '\n          <button disabled={isSubmitting} type="submit" className="w-full py-4 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg font-bold font-mono tracking-widest uppercase hover:bg-emerald-500/30 transition-colors disabled:opacity-50">\n            {isSubmitting ? "Processing..." : "Create Personnel"}\n          </button>'
)

content = content.replace(
    '<button disabled={isSubmitting} type="submit" className="w-full py-4 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg font-bold font-mono tracking-widest uppercase hover:bg-blue-500/30 transition-colors disabled:opacity-50">\n            {isSubmitting ? "Processing..." : "Save Changes"}\n          </button>',
    extended_inputs + '\n          <button disabled={isSubmitting} type="submit" className="w-full py-4 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg font-bold font-mono tracking-widest uppercase hover:bg-blue-500/30 transition-colors disabled:opacity-50">\n            {isSubmitting ? "Processing..." : "Save Changes"}\n          </button>'
)

with open("apps/web/app/dashboard/hr/page.tsx", "w") as f:
    f.write(content)
