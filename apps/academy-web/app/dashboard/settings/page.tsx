"use client"

import { useState } from "react"
import { Settings, Shield, Palette, Building, Bell, Save, Image as ImageIcon, CheckCircle2, DollarSign, Plug } from "lucide-react"

export default function SystemSettingsPage() {
  const [activeTab, setActiveTab] = useState('branding')

  return (
    <div className="flex flex-col h-full bg-[#050505] text-white overflow-hidden">
      {/* Header */}
      <div className="flex-none px-8 py-6 border-b border-white/10 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
          <p className="text-sm text-white/50 mt-2">Manage workspace preferences, branding, and configurations.</p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-500 transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)]">
          <Save className="w-4 h-4" /> Save Changes
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Sidebar - Navigation */}
        <div className="w-64 border-r border-white/10 bg-black/20 p-4 space-y-1">
          <button 
            onClick={() => setActiveTab('branding')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-colors ${activeTab === 'branding' ? 'bg-blue-600 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}
          >
            <Palette className="w-4 h-4" /> Branding & Theme
          </button>
          <button 
            onClick={() => setActiveTab('company')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-colors ${activeTab === 'company' ? 'bg-blue-600 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}
          >
            <Building className="w-4 h-4" /> Company Details
          </button>
          <button 
            onClick={() => setActiveTab('notifications')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-colors ${activeTab === 'notifications' ? 'bg-blue-600 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}
          >
            <Bell className="w-4 h-4" /> Notifications
          </button>
          <a 
            href="/dashboard/settings/roles"
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-colors text-white/70 hover:bg-white/10 hover:text-white"
          >
            <Shield className="w-4 h-4" /> Roles & Permissions
          </a>
          <a 
            href="/dashboard/settings/finance"
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-colors text-white/70 hover:bg-white/10 hover:text-white"
          >
            <DollarSign className="w-4 h-4" /> Finance & Currency
          </a>
          <a 
            href="/dashboard/settings/integrations"
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-colors text-white/70 hover:bg-white/10 hover:text-white"
          >
            <Plug className="w-4 h-4" /> Integrations & APIs
          </a>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-8 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed relative">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" />
          
          <div className="relative z-10 max-w-3xl space-y-8">
            
            {activeTab === 'branding' && (
              <>
                <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
                  <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <Palette className="w-5 h-5 text-blue-400" /> Workspace Branding
                  </h2>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="text-sm font-bold text-white/70 block mb-2">Workspace Name</label>
                      <input 
                        type="text" 
                        defaultValue="Grekam Visuals"
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500/50"
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-bold text-white/70 block mb-2">Workspace Logo</label>
                      <div className="flex items-center gap-6">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center font-bold text-2xl border-2 border-white/20">
                          G
                        </div>
                        <button className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors text-sm flex items-center gap-2">
                          <ImageIcon className="w-4 h-4" /> Upload New Logo
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-bold text-white/70 block mb-3">Primary Brand Color</label>
                      <div className="flex items-center gap-4">
                        {['bg-blue-500', 'bg-purple-500', 'bg-emerald-500', 'bg-red-500', 'bg-amber-500'].map((color, i) => (
                          <button key={i} className={`w-8 h-8 rounded-full ${color} flex items-center justify-center ring-2 ring-transparent hover:ring-white transition-all`}>
                            {i === 0 && <CheckCircle2 className="w-4 h-4 text-white drop-shadow-md" />}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'company' && (
              <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <Building className="w-5 h-5 text-emerald-400" /> Company Details
                </h2>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-bold text-white/70 block mb-2">Legal Name</label>
                    <input type="text" defaultValue="Grekam Visuals Pvt Ltd" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500/50" />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-white/70 block mb-2">Tax ID / GSTIN</label>
                    <input type="text" defaultValue="29ABCDE1234F1Z5" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500/50" />
                  </div>
                  <div className="col-span-2">
                    <label className="text-sm font-bold text-white/70 block mb-2">Billing Address</label>
                    <textarea rows={3} defaultValue="123 Creative Street, Tech Park\nBangalore, India 560001" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500/50 resize-none" />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <Bell className="w-5 h-5 text-amber-400" /> Global Notifications
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-black/40 rounded-xl border border-white/10">
                    <div>
                      <div className="font-bold">WhatsApp Integrations (Grafty)</div>
                      <div className="text-xs text-white/50">Send automated messages to leads and students.</div>
                    </div>
                    <a href="/dashboard/settings/integrations" className="text-sm font-medium text-blue-400 hover:text-blue-300">
                      Configure Keys &rarr;
                    </a>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-black/40 rounded-xl border border-white/10">
                    <div>
                      <div className="font-bold">Email Notifications</div>
                      <div className="text-xs text-white/50">Send daily digests to staff members.</div>
                    </div>
                    <a href="/dashboard/settings/integrations" className="text-sm font-medium text-blue-400 hover:text-blue-300">
                      Configure SMTP &rarr;
                    </a>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}
