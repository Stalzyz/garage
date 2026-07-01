"use client"

import { useParams } from "next/navigation"
import { ChevronLeft, Download, Send, CheckCircle2, Loader2, ArrowRight, Trash2, Edit } from "lucide-react"
import Link from "next/link"
import { useApi, fetchApi } from "@/lib/useApi"
import { format } from "date-fns"
import { useOrganization } from "@/context/OrganizationContext"
import { OrgAvatar } from "@/components/OrgAvatar"

export default function ProposalDetailPage() {
  const params = useParams()
  const proposalId = params.id as string
  const router = import("next/navigation").then(m => m.useRouter)
  const org = useOrganization()

  const { data: proposal, isLoading, mutate } = useApi<any>(`/crm/proposals/${proposalId}`)

  if (isLoading) {
    return (
      <div className="flex flex-col h-full items-center justify-center bg-background/50 text-muted-foreground">
        <Loader2 className="w-8 h-8 animate-spin mb-4" />
        <p>Loading Proposal...</p>
      </div>
    )
  }

  if (!proposal) {
    return (
      <div className="flex flex-col h-full items-center justify-center bg-background/50 text-muted-foreground">
        <p>Proposal not found.</p>
        <Link href="/dashboard/crm/proposals" className="mt-4 text-primary hover:underline">Return to Proposals</Link>
      </div>
    )
  }

  const handlePrint = () => {
    window.print();
  }

  const handleDownloadPDF = async () => {
    const element = document.getElementById('printable-proposal');
    if (!element) return;
    
    // @ts-ignore
    const html2pdfModule = await import('html2pdf.js');
    const html2pdf = html2pdfModule.default || html2pdfModule;
    
    const opt = {
      margin: 10,
      filename:     `Proposal-${proposal.title.replace(/[^a-z0-9]/gi, '_')}.pdf`,
      image:        { type: 'jpeg' as const, quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    } as any;
    
    html2pdf().set(opt).from(element).save();
  }

  const markAsSent = async () => {
    try {
      await fetchApi(`/crm/proposals/${proposalId}/send`, {
        method: "POST"
      });
      mutate();
      alert("Proposal securely emailed to the client!");
    } catch (err) {
      console.error(err);
      alert("Failed to send email");
    }
  }

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this proposal?")) return;
    try {
      await fetchApi(`/crm/proposals/${proposalId}`, { method: "DELETE" });
      window.location.href = "/dashboard/crm/proposals";
    } catch (err: any) {
      console.error(err);
      alert(`Failed to delete proposal: ${err.message || String(err)}`);
    }
  }

  return (
    <div className="flex flex-col h-full min-h-0 overflow-y-auto bg-background/50 relative">
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-proposal, #printable-proposal * {
            visibility: visible;
          }
          #printable-proposal {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 0;
            border: none;
            box-shadow: none;
            background: white !important;
            color: black !important;
          }
          .text-muted-foreground {
            color: #666 !important;
          }
          .text-foreground {
            color: #000 !important;
          }
          .border-border\\/60, .border-border\\/40, .border-border\\/30 {
            border-color: #ddd !important;
          }
        }
      `}} />

      <div className="max-w-4xl w-full mx-auto p-8 relative z-10">
        
        <Link href="/dashboard/crm/proposals" className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors mb-6 print:hidden">
          <ChevronLeft className="w-3.5 h-3.5" /> Back to Proposals
        </Link>

        {/* Action Header */}
        <div className="flex flex-col md:flex-row md:items-start justify-between mb-8 gap-4 print:hidden">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">{proposal.title}</h1>
            <div className="flex items-center gap-3">
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                proposal.status === 'ACCEPTED' ? 'text-emerald-400 border-emerald-400/20 bg-emerald-400/10' :
                proposal.status === 'DRAFT' ? 'text-slate-400 border-slate-400/20 bg-slate-400/10' :
                proposal.status === 'SENT' ? 'text-blue-400 border-blue-400/20 bg-blue-400/10' :
                'text-amber-400 border-amber-400/20 bg-amber-400/10'
              }`}>
                {proposal.status}
              </span>
              <span className="text-sm text-muted-foreground">Version {proposal.version || 1}</span>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={handleDelete} className="flex items-center gap-2 bg-red-500/10 text-red-500 border border-red-500/20 text-sm font-medium px-4 py-2 rounded-lg hover:bg-red-500/20 transition-colors">
              <Trash2 className="w-4 h-4" /> Delete
            </button>
            {proposal.status !== "ACCEPTED" && proposal.status !== "REJECTED" && (
              <button onClick={markAsSent} className="flex items-center gap-2 bg-blue-500/10 text-blue-500 border border-blue-500/20 text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-500/20 transition-colors">
                <Send className="w-4 h-4" /> {proposal.status === "SENT" ? "Resend via Email" : "Send via Email"}
              </button>
            )}
            <Link href={`/dashboard/crm/proposals/${proposalId}/edit`} className="flex items-center gap-2 bg-white/5 text-white border border-white/10 text-sm font-medium px-4 py-2 rounded-lg hover:bg-white/10 transition-colors">
              <Edit className="w-4 h-4" /> Edit
            </Link>
            <button onClick={handleDownloadPDF} className="flex items-center gap-2 bg-muted text-foreground text-sm font-medium px-4 py-2 rounded-lg hover:bg-muted/80 transition-colors">
              <Download className="w-4 h-4" /> Download PDF
            </button>
          </div>
        </div>

        {/* Proposal Paper UI */}
        <div id="printable-proposal" className="bg-card border border-border/60 rounded-2xl p-10 shadow-sm relative overflow-hidden">
          {/* Header */}
          <div className="flex justify-between items-start mb-12 border-b border-border/40 pb-8">
            <div>
              {org.logoUrl
                ? <img src={org.logoUrl} alt={org.name} className="w-14 h-14 object-contain rounded-xl mb-4" />
                : <div className="w-14 h-14 bg-primary rounded-xl mb-4 flex items-center justify-center text-white font-black text-2xl">{org.name.charAt(0)}</div>
              }
              <h2 className="text-xl font-bold text-foreground">{org.name}</h2>
              {org.billingAddress && <p className="text-sm text-muted-foreground mt-1 whitespace-pre-line">{org.billingAddress}</p>}
              {org.supportEmail && <p className="text-sm text-muted-foreground">{org.supportEmail}</p>}
              {org.website && <p className="text-sm text-muted-foreground">{org.website}</p>}
              {org.phone && <p className="text-sm text-muted-foreground">{org.phone}</p>}
            </div>
            <div className="text-right">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-1">Proposal</h3>
              <p className="text-xl font-bold text-foreground">{proposal.title}</p>
              <div className="mt-4 space-y-1 text-sm">
                <p><span className="text-muted-foreground inline-block w-24 text-left">Date:</span> <span className="font-medium">{format(new Date(proposal.createdAt), 'MMM d, yyyy')}</span></p>
                {proposal.validUntil && (
                  <p><span className="text-muted-foreground inline-block w-24 text-left">Valid Until:</span> <span className="font-medium">{format(new Date(proposal.validUntil), 'MMM d, yyyy')}</span></p>
                )}
              </div>
            </div>
          </div>

          {/* Prepared For */}
          <div className="mb-10">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-3">Prepared For</h3>
            <p className="text-lg font-bold text-foreground">{proposal.lead?.name || "Unknown Client"}</p>
            {proposal.lead?.company && <p className="text-sm text-muted-foreground mt-1">{proposal.lead?.company}</p>}
            {proposal.lead?.email && <p className="text-sm text-muted-foreground mt-1">{proposal.lead?.email}</p>}
            {proposal.lead?.phone && <p className="text-sm text-muted-foreground mt-1">{proposal.lead?.phone}</p>}
          </div>

          {/* Line Items */}
          <table className="w-full mb-8 text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-border/60">
                <th className="py-3 text-sm font-semibold text-muted-foreground w-[50%]">Service / Description</th>
                <th className="py-3 text-sm font-semibold text-muted-foreground text-right">Qty</th>
                <th className="py-3 text-sm font-semibold text-muted-foreground text-right">Rate</th>
                <th className="py-3 text-sm font-semibold text-muted-foreground text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {proposal.items.map((item: any, i: number) => (
                <tr key={i}>
                  <td className="py-4 text-sm font-medium text-foreground">
                    <div>{item.description}</div>
                  </td>
                  <td className="py-4 text-sm text-muted-foreground text-right">{item.quantity}</td>
                  <td className="py-4 text-sm text-muted-foreground text-right">{item.unitPrice.toLocaleString()}</td>
                  <td className="py-4 text-sm font-semibold text-foreground text-right">{item.total.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="flex justify-end border-t border-border/60 pt-6">
            <div className="w-72 space-y-3">
              <div className="flex justify-between text-lg font-bold">
                <span className="text-foreground">Total Value ({proposal.currency})</span>
                <span className="text-primary">{proposal.totalAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {proposal.notes && (
            <div className="mt-16 pt-8 border-t border-border/40">
              <h3 className="text-sm font-semibold text-foreground mb-2">Terms & Notes:</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{proposal.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
