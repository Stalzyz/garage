"use client"

import { useState } from "react"
import { Zap, Plus, ArrowRight, Play, Settings, Save, Trash2, CheckCircle2, AlertCircle } from "lucide-react"
import { useApi, fetchApi } from "@/lib/useApi"
import { toast } from "sonner"
import { format } from "date-fns"

export default function AutomationsPage() {
  const { data, mutate, isLoading } = useApi<any>("/automations/workflows")
  const workflows = data?.workflows || []

  const [activeWorkflowId, setActiveWorkflowId] = useState<string | null>(null)
  
  const activeWorkflow = workflows.find((w: any) => w.id === activeWorkflowId)

  return (
    <div className="flex flex-col h-full bg-[#050505] text-white overflow-hidden">
      {/* Header */}
      <div className="flex-none px-8 py-6 border-b border-white/10 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Automation Engine</h1>
          <p className="text-sm text-white/50 mt-2">Build visual workflows to put your business on autopilot.</p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-500 transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)]">
          <Plus className="w-4 h-4" /> Create Workflow
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Col - Workflow List */}
        <div className="w-1/3 flex flex-col border-r border-white/10 bg-black/20 p-4 overflow-y-auto custom-scrollbar space-y-3">
          {isLoading ? (
            <div className="text-center text-white/40 py-8">Loading workflows...</div>
          ) : workflows.length === 0 ? (
            <div className="text-center text-white/40 py-8 border border-dashed border-white/10 rounded-xl">
              <Zap className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No workflows created</p>
            </div>
          ) : (
            workflows.map((wf: any) => (
              <div 
                key={wf.id}
                onClick={() => setActiveWorkflowId(wf.id)}
                className={`p-4 rounded-xl cursor-pointer transition-colors border ${activeWorkflowId === wf.id ? 'bg-blue-500/10 border-blue-500/30' : 'bg-white/5 border-white/5 hover:border-white/20'}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-sm truncate">{wf.name}</h3>
                  <div className={`w-2 h-2 rounded-full ${wf.isActive ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-white/20'}`} />
                </div>
                <div className="flex items-center gap-2 text-xs text-white/40 font-mono">
                  <Zap className="w-3 h-3 text-amber-400" />
                  <span className="truncate">{wf.triggerType}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right Col - Visual Builder */}
        <div className="w-2/3 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed relative">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
          
          <div className="relative z-10 h-full flex flex-col">
            {!activeWorkflow ? (
              <div className="flex-1 flex flex-col items-center justify-center text-white/40">
                <Settings className="w-12 h-12 mb-4 opacity-20 animate-[spin_10s_linear_infinite]" />
                <p>Select a workflow to open the builder</p>
              </div>
            ) : (
              <>
                {/* Builder Header */}
                <div className="p-4 border-b border-white/10 flex items-center justify-between bg-black/40">
                  <h2 className="text-lg font-bold">{activeWorkflow.name}</h2>
                  <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg text-xs hover:bg-white/10 transition-colors border border-white/10">
                      <Play className="w-3 h-3" /> Test Run
                    </button>
                    <button className="flex items-center gap-2 px-3 py-1.5 bg-emerald-600/20 text-emerald-400 rounded-lg text-xs hover:bg-emerald-600/30 transition-colors border border-emerald-500/30">
                      <Save className="w-3 h-3" /> Save Changes
                    </button>
                  </div>
                </div>

                {/* Builder Canvas */}
                <div className="flex-1 overflow-auto custom-scrollbar p-12 flex flex-col items-center">
                  
                  {/* Trigger Block */}
                  <div className="bg-black/60 border border-amber-500/30 w-80 rounded-2xl p-5 shadow-[0_8px_30px_rgba(245,158,11,0.1)] mb-6 relative">
                    <div className="absolute -top-3 -left-3 w-8 h-8 bg-amber-500/20 border border-amber-500/50 rounded-full flex items-center justify-center text-amber-400">
                      <Zap className="w-4 h-4" />
                    </div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-amber-400/80 mb-1 pl-4">Trigger</div>
                    <div className="font-bold text-white pl-4">{activeWorkflow.triggerType}</div>
                  </div>

                  {/* Connecting Line */}
                  <div className="w-px h-8 bg-white/20 mb-6" />

                  {/* Actions */}
                  {activeWorkflow.steps?.map((step: any, idx: number) => (
                    <div key={step.id} className="flex flex-col items-center w-full">
                      <div className="bg-white/5 border border-white/10 w-80 rounded-2xl p-5 relative group hover:border-blue-500/50 transition-colors">
                        <div className="text-[10px] font-bold uppercase tracking-widest text-blue-400/80 mb-1">Action {idx + 1}</div>
                        <div className="font-bold text-white flex items-center justify-between">
                          <span>{step.actionType}</span>
                          <Settings className="w-4 h-4 text-white/30 cursor-pointer hover:text-white" />
                        </div>
                        <div className="mt-3 p-2 bg-black/40 rounded text-[10px] font-mono text-white/50 truncate">
                          {JSON.stringify(step.config)}
                        </div>
                      </div>
                      
                      {idx < activeWorkflow.steps.length - 1 && (
                        <div className="w-px h-8 bg-white/20 my-6" />
                      )}
                    </div>
                  ))}

                  {/* Add Action Button */}
                  <div className="w-px h-8 bg-white/20 mt-6" />
                  <button className="mt-6 w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-blue-500/20 hover:border-blue-500/50 hover:text-blue-400 transition-all text-white/50">
                    <Plus className="w-5 h-5" />
                  </button>

                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
