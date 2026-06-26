"use client"

import { useParams } from "next/navigation"
import { ChevronLeft, Download, Send, CheckCircle2, Loader2, ArrowRight } from "lucide-react"
import Link from "next/link"
import { useApi, fetchApi } from "@/lib/useApi"

export default function InvoiceDetailPage() {
  const params = useParams()
  const invoiceId = params.id as string

  const { data: invoice, isLoading, mutate } = useApi<any>(`/finance/invoices/${invoiceId}`)

  if (isLoading) {
    return (
      <div className="flex flex-col h-full items-center justify-center bg-background/50 text-muted-foreground">
        <Loader2 className="w-8 h-8 animate-spin mb-4" />
        <p>Loading Invoice...</p>
      </div>
    )
  }

  if (!invoice) {
    return (
      <div className="flex flex-col h-full items-center justify-center bg-background/50 text-muted-foreground">
        <p>Invoice not found.</p>
        <Link href="/dashboard/finance" className="mt-4 text-primary hover:underline">Return to Dashboard</Link>
      </div>
    )
  }

  const handlePrint = () => {
    window.print();
  }

  const markAsPaid = async () => {
    try {
      await fetchApi(`/finance/invoices/${invoiceId}`, {
        method: "PATCH",
        body: JSON.stringify({ status: "PAID", paidAmount: invoice.totalAmount })
      });
      mutate();
    } catch (err) {
      console.error(err);
      alert("Failed to update status");
    }
  }

  return (
    <div className="flex flex-col h-full min-h-0 overflow-y-auto bg-background/50 relative">
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-invoice, #printable-invoice * {
            visibility: visible;
          }
          #printable-invoice {
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
        
        <Link href="/dashboard/finance" className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors mb-6 print:hidden">
          <ChevronLeft className="w-3.5 h-3.5" /> Back to Invoices
        </Link>

        {/* Action Header */}
        <div className="flex flex-col md:flex-row md:items-start justify-between mb-8 gap-4 print:hidden">
          <div>
            <h1 className="text-3xl font-bold text-foreground font-mono mb-2">{invoice.invoiceNumber}</h1>
            <div className="flex items-center gap-3">
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                invoice.status === 'PAID' ? 'text-emerald-400 border-emerald-400/20 bg-emerald-400/10' :
                invoice.status === 'DRAFT' ? 'text-slate-400 border-slate-400/20 bg-slate-400/10' :
                'text-amber-400 border-amber-400/20 bg-amber-400/10'
              }`}>
                {invoice.status}
              </span>
              <span className="text-sm text-muted-foreground">Due on {new Date(invoice.dueDate).toLocaleDateString()}</span>
            </div>
          </div>
          <div className="flex gap-3">
            {invoice.status !== "PAID" && (
              <button onClick={markAsPaid} className="flex items-center gap-2 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-sm font-medium px-4 py-2 rounded-lg hover:bg-emerald-500/20 transition-colors">
                <CheckCircle2 className="w-4 h-4" /> Mark as Paid
              </button>
            )}
            <button onClick={handlePrint} className="flex items-center gap-2 bg-muted text-foreground text-sm font-medium px-4 py-2 rounded-lg hover:bg-muted/80 transition-colors">
              <Download className="w-4 h-4" /> Print / PDF
            </button>
            <button className="flex items-center gap-2 bg-primary text-primary-foreground text-sm font-medium px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors">
              <Send className="w-4 h-4" /> Send Email
            </button>
          </div>
        </div>

        {/* Invoice Paper UI */}
        <div id="printable-invoice" className="bg-card border border-border/60 rounded-2xl p-10 shadow-sm relative overflow-hidden">
          {/* Watermark for paid */}
          {invoice.status === "PAID" && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-[-15deg] opacity-[0.03] pointer-events-none">
              <span className="text-[150px] font-black uppercase tracking-widest text-emerald-500">PAID</span>
            </div>
          )}

          {/* Header */}
          <div className="flex justify-between items-start mb-12 border-b border-border/40 pb-8">
            <div>
              <div className="w-12 h-12 bg-primary rounded-xl mb-4" />
              <h2 className="text-xl font-bold text-foreground">
                {invoice.businessUnit === 'AGENCY' ? 'Grekam Visuals' : 'Grekam Academy'}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">123 Creative Studio, Indiranagar</p>
              <p className="text-sm text-muted-foreground">Bengaluru, KA 560038, India</p>
              <p className="text-sm text-muted-foreground mt-2 font-mono text-xs">GSTIN: 29AABCU9603R1ZY</p>
            </div>
            <div className="text-right">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-1">Tax Invoice</h3>
              <p className="text-xl font-bold font-mono text-foreground">{invoice.invoiceNumber}</p>
              <div className="mt-4 space-y-1 text-sm">
                <p><span className="text-muted-foreground inline-block w-24 text-left">Date:</span> <span className="font-medium">{new Date(invoice.createdAt).toLocaleDateString()}</span></p>
                <p><span className="text-muted-foreground inline-block w-24 text-left">Due Date:</span> <span className="font-medium">{new Date(invoice.dueDate).toLocaleDateString()}</span></p>
              </div>
            </div>
          </div>

          {/* Bill To */}
          <div className="mb-10">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-3">Bill To</h3>
            <p className="text-lg font-bold text-foreground">{invoice.clientName}</p>
            {invoice.clientEmail && <p className="text-sm text-muted-foreground mt-1">{invoice.clientEmail}</p>}
            {invoice.clientGst && <p className="text-sm text-muted-foreground mt-2 font-mono text-xs border border-border/50 inline-block px-2 py-1 rounded bg-muted/30">GSTIN: {invoice.clientGst}</p>}
          </div>

          {/* Line Items */}
          <table className="w-full mb-8 text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-border/60">
                <th className="py-3 text-sm font-semibold text-muted-foreground w-[50%]">Description</th>
                <th className="py-3 text-sm font-semibold text-muted-foreground text-right">Qty</th>
                <th className="py-3 text-sm font-semibold text-muted-foreground text-right">Rate</th>
                <th className="py-3 text-sm font-semibold text-muted-foreground text-right">GST</th>
                <th className="py-3 text-sm font-semibold text-muted-foreground text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {invoice.items.map((item: any, i: number) => (
                <tr key={i}>
                  <td className="py-4 text-sm font-medium text-foreground">
                    <div>{item.description}</div>
                    {item.hsnCode && <div className="text-[10px] text-muted-foreground font-mono mt-1">HSN/SAC: {item.hsnCode}</div>}
                  </td>
                  <td className="py-4 text-sm text-muted-foreground text-right">{item.quantity}</td>
                  <td className="py-4 text-sm text-muted-foreground text-right">{item.unitPrice.toLocaleString()}</td>
                  <td className="py-4 text-sm text-muted-foreground text-right">{item.taxRate}%</td>
                  <td className="py-4 text-sm font-semibold text-foreground text-right">{item.total.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="flex justify-end border-t border-border/60 pt-6">
            <div className="w-72 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium text-foreground">{invoice.subtotal.toLocaleString()}</span>
              </div>
              {invoice.cgst > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">CGST</span>
                  <span className="font-medium text-foreground">{invoice.cgst.toLocaleString()}</span>
                </div>
              )}
              {invoice.sgst > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">SGST</span>
                  <span className="font-medium text-foreground">{invoice.sgst.toLocaleString()}</span>
                </div>
              )}
              {invoice.igst > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">IGST</span>
                  <span className="font-medium text-foreground">{invoice.igst.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold border-t-2 border-border/60 pt-3 mt-3">
                <span className="text-foreground">Total ({invoice.currency})</span>
                <span className="text-primary">{invoice.totalAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Footer details */}
          <div className="mt-16 pt-8 border-t border-border/40 flex items-end justify-between">
            <div className="text-xs text-muted-foreground space-y-1">
              <p className="font-medium text-foreground mb-2">Payment Instructions:</p>
              <p>Bank: HDFC Bank, Indiranagar</p>
              <p>A/C Name: Grekam Visuals Pvt Ltd</p>
              <p>A/C No: 50200012345678</p>
              <p>IFSC: HDFC0001234</p>
            </div>
            
            {invoice.status === "PAID" && invoice.payments && invoice.payments.length > 0 && (
              <div className="text-right text-xs">
                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-2 rounded-lg inline-block text-left">
                  <p className="font-bold mb-1">Payment Received</p>
                  <p>Method: {invoice.payments[0].method}</p>
                  {invoice.payments[0].transactionId && <p>Txn ID: <span className="font-mono">{invoice.payments[0].transactionId}</span></p>}
                  <p>Date: {new Date(invoice.payments[0].paidAt).toLocaleDateString()}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
