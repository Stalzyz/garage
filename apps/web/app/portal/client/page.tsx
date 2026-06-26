"use client"

import { Briefcase, CreditCard, LifeBuoy, CheckCircle2, Clock, Loader2, ArrowRight } from "lucide-react"
import { useApi } from "@/lib/useApi"
import { useSession } from "next-auth/react"
import Link from "next/link"

export default function ClientPortalPage() {
  const { data: session } = useSession()
  const { data: projectsData, isLoading: loadingProjects } = useApi<any>("/projects")
  const { data: invoicesData, isLoading: loadingInvoices } = useApi<any>("/finance/invoices")

  const projects = projectsData?.data || []
  const invoices = invoicesData?.data || []

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome, {session?.user?.name || "Client"}</h1>
        <p className="text-white/50 mt-2">Here is the latest status on your projects and billing.</p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Active Projects */}
        <div className="md:col-span-2 bg-white/5 border border-white/10 rounded-3xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <Briefcase className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-bold">Active Projects</h2>
          </div>
          
          <div className="space-y-4">
            {loadingProjects ? (
              <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-blue-500" /></div>
            ) : projects.length === 0 ? (
              <div className="text-center py-10 text-white/40 text-sm border border-dashed border-white/10 rounded-xl">No active projects found.</div>
            ) : (
              projects.map((project: any) => {
                const totalPhases = project._count?.phases || 0;
                // Just mock progress for UI if phases count isn't enough to calculate precisely, or use an arbitrary calc
                const progress = project.status === 'COMPLETED' ? 100 : (project.status === 'PRODUCTION' ? 60 : 25);
                
                return (
                  <Link key={project.id} href={`/portal/projects/${project.id}`}>
                    <div className="bg-black/40 border border-white/10 rounded-2xl p-5 hover:border-blue-500/30 transition-colors cursor-pointer mb-4">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-bold text-white group-hover:text-blue-400 transition-colors flex items-center gap-2">
                            {project.name} <ArrowRight className="w-3 h-3 text-white/30" />
                          </h3>
                          <p className="text-xs text-white/40 mt-1">Due: {project.dueDate ? new Date(project.dueDate).toLocaleDateString() : 'TBD'}</p>
                        </div>
                        <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase">
                          {project.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                      
                      {/* Progress Bar */}
                      <div>
                        <div className="flex justify-between text-xs text-white/50 mb-2">
                          <span>Progress Phase</span>
                          <span>{progress}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 transition-all duration-1000" style={{ width: `${progress}%` }} />
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              })
            )}
          </div>
        </div>

        {/* Invoices & Support */}
        <div className="space-y-6">
          
          {/* Outstanding Invoices */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <CreditCard className="w-5 h-5 text-emerald-400" />
              <h2 className="text-lg font-bold">Recent Invoices</h2>
            </div>
            
            <div className="space-y-4">
              {loadingInvoices ? (
                <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-emerald-500" /></div>
              ) : invoices.length === 0 ? (
                <div className="text-center py-6 text-white/40 text-xs border border-dashed border-white/10 rounded-xl">No recent invoices.</div>
              ) : (
                invoices.slice(0, 4).map((invoice: any) => (
                  <div key={invoice.id} className={`flex items-center justify-between p-3 border rounded-xl ${invoice.status === 'PAID' ? 'bg-white/[0.02] border-white/5 opacity-60' : 'bg-black/40 border-white/10'}`}>
                    <div>
                      <div className="text-sm font-bold truncate max-w-[120px]">{invoice.number || "INV-000"}</div>
                      <div className="text-[10px] text-white/40 mt-0.5 font-mono">{new Date(invoice.dueDate).toLocaleDateString()}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold font-mono">₹{invoice.totalAmount.toLocaleString()}</div>
                      {invoice.status === 'PAID' ? (
                        <div className="text-[10px] text-emerald-400 font-bold uppercase mt-1 flex items-center gap-1 justify-end">
                          <CheckCircle2 className="w-3 h-3" /> Paid
                        </div>
                      ) : (
                        <Link href={`/portal/invoices/${invoice.id}`}>
                          <button className="text-[10px] text-blue-400 font-bold uppercase mt-1 hover:underline">View / Pay</button>
                        </Link>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <LifeBuoy className="w-5 h-5 text-purple-400" />
              <h2 className="text-lg font-bold">Need Help?</h2>
            </div>
            <button className="w-full py-3 bg-white/10 hover:bg-white/15 transition-colors border border-white/10 rounded-xl text-sm font-bold flex items-center justify-center gap-2">
              <LifeBuoy className="w-4 h-4" /> Open Support Ticket
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}
