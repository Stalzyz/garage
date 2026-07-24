'use client';

import { useState, useEffect } from "react";
import { fetchApi, useApi } from "@/lib/useApi";
import { useRouter } from "next/navigation";
import { ChevronLeft, Plus, Trash2, Save, Calculator, Users, Eye } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useCurrency } from "@/hooks/useCurrency"
import { useOrganization } from "@/context/OrganizationContext"
import { Modal } from "@/components/ui/modal"

export default function NewInvoicePage() {
  const { symbol } = useCurrency()
  const router = useRouter();
  
  const { data: leadsData } = useApi<any>("/crm/leads")
  const leads = leadsData?.data || []

  const { data: contactsData } = useApi<any>("/crm/contacts")
  const contacts = contactsData?.data || []
  
  const [assignType, setAssignType] = useState<"MANUAL" | "LEAD" | "CONTACT">("MANUAL")
  
  const [invoice, setInvoice] = useState({
    invoiceNumber: `INV-${new Date().getTime().toString().slice(-6)}`,
    clientName: "",
    clientEmail: "",
    clientGst: "",
    businessUnit: "AGENCY",
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    currency: "INR",
    discountRate: 0,
  });

  const [items, setItems] = useState([
    { id: 1, description: "", quantity: 1, unitPrice: 0, discountRate: 0, taxRate: 18, hsnCode: "" }
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-calculated totals
  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice * (1 - (item.discountRate || 0) / 100)), 0);
  const overallDiscountAmt = subtotal * ((invoice.discountRate || 0) / 100);
  const taxableAmount = subtotal - overallDiscountAmt;

  const totalTax = items.reduce((sum, item) => {
    const itemSubtotal = item.quantity * item.unitPrice * (1 - (item.discountRate || 0) / 100);
    const finalItemTaxable = itemSubtotal * (1 - (invoice.discountRate || 0) / 100);
    return sum + (finalItemTaxable * ((item.taxRate || 0) / 100));
  }, 0);
  const grandTotal = taxableAmount + totalTax;

  const handleItemChange = (id: number, field: string, value: any) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const addItem = () => {
    setItems([...items, { id: Date.now(), description: "", quantity: 1, unitPrice: 0, discountRate: 0, taxRate: 18, hsnCode: "" }]);
  };

  const removeItem = (id: number) => {
    if (items.length === 1) return;
    setItems(items.filter(item => item.id !== id));
  };

  const org = useOrganization()
  const [showPreview, setShowPreview] = useState(false)

  const handleSave = async () => {
    if (!invoice.clientName) return alert("Client name is required");
    if (items.some(i => !i.description)) return alert("All items must have a description");
    
    setIsSubmitting(true);
    try {
      const res = await fetchApi<any>("/finance/invoices", {
        method: "POST",
        body: JSON.stringify({
          ...invoice,
          clientEmail: invoice.clientEmail.trim() || undefined,
          clientGst: invoice.clientGst.trim() || undefined,
          discountRate: Number(invoice.discountRate || 0),
          dueDate: new Date(invoice.dueDate).toISOString(),
          items: items.map(i => ({
            description: i.description,
            quantity: Number(i.quantity),
            unitPrice: Number(i.unitPrice),
            discountRate: Number(i.discountRate || 0),
            taxRate: Number(i.taxRate),
            hsnCode: i.hsnCode || null
          }))
        })
      });
      router.push(`/dashboard/finance/invoices/${res.id}`);
    } catch (err) {
      console.error(err);
      alert("Failed to create invoice");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCrmSelect = (id: string) => {
    if (assignType === "LEAD") {
      const lead = leads.find((l: any) => l.id === id)
      if (lead) {
        setInvoice(prev => ({
          ...prev,
          clientName: lead.company || lead.name,
          clientEmail: lead.email || prev.clientEmail,
        }))
      }
    } else if (assignType === "CONTACT") {
      const contact = contacts.find((c: any) => c.id === id)
      if (contact) {
        setInvoice(prev => ({
          ...prev,
          clientName: contact.company?.name || `${contact.firstName} ${contact.lastName}`,
          clientEmail: contact.email || prev.clientEmail,
        }))
      }
    }
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto p-6 lg:p-10 text-white relative">
      <div className="absolute top-[10%] right-[10%] w-[50%] h-[50%] bg-emerald-600/5 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="max-w-4xl w-full mx-auto relative z-10">
        <Link href="/dashboard/finance" className="inline-flex items-center gap-1.5 text-xs font-medium text-white/50 hover:text-white transition-colors mb-6">
          <ChevronLeft className="w-3.5 h-3.5" /> Back to Finance Hub
        </Link>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Invoice Builder</h1>
            <p className="text-xs font-mono text-white/40 mt-1 tracking-widest uppercase">Create new tax invoice</p>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <button 
              onClick={() => setShowPreview(true)}
              className="flex flex-1 md:flex-none justify-center items-center gap-2 bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 text-xs px-5 py-3 rounded-xl transition-all min-h-[44px]"
            >
              <Eye className="w-4 h-4" /> Preview
            </button>
            <button 
              onClick={handleSave} 
              disabled={isSubmitting}
              className="flex flex-1 md:flex-none justify-center items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-black font-bold tracking-widest uppercase text-xs px-6 py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] disabled:opacity-50 min-h-[44px]"
            >
              <Save className="w-4 h-4" /> {isSubmitting ? "Saving..." : "Save Invoice"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            
            {/* Invoice Meta */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-md">
              <h2 className="text-sm font-bold mb-4 font-mono uppercase tracking-widest text-white/50 border-b border-white/10 pb-2">Details</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-white/40 mb-1">Invoice Number</label>
                  <input 
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm font-mono outline-none focus:border-emerald-500"
                    value={invoice.invoiceNumber}
                    onChange={e => setInvoice({...invoice, invoiceNumber: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-white/40 mb-1">Business Unit</label>
                  <select 
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-emerald-500"
                    value={invoice.businessUnit}
                    onChange={e => setInvoice({...invoice, businessUnit: e.target.value})}
                  >
                    <option value="AGENCY">Grekam Visuals (Agency)</option>
                    <option value="ACADEMY">Grekam Academy</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-white/40 mb-1">Due Date</label>
                  <input 
                    type="date"
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-emerald-500"
                    value={invoice.dueDate}
                    onChange={e => setInvoice({...invoice, dueDate: e.target.value})}
                  />
                </div>
              </div>
            </motion.div>

            {/* Client Info */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-md">
              <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-2">
                <h2 className="text-sm font-bold font-mono uppercase tracking-widest text-white/50">Bill To</h2>
                
                {/* CRM Autofill */}
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-white/40 uppercase tracking-widest flex items-center gap-1"><Users className="w-3 h-3"/> Auto-fill:</span>
                  <select
                    className="bg-black/40 border border-white/10 rounded text-xs px-2 py-1 outline-none focus:border-emerald-500"
                    value={assignType}
                    onChange={(e) => setAssignType(e.target.value as any)}
                  >
                    <option value="MANUAL">Manual Entry</option>
                    <option value="LEAD">From Leads</option>
                    <option value="CONTACT">From Contacts</option>
                  </select>
                </div>
              </div>

              {assignType !== "MANUAL" && (
                <div className="mb-4 bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-lg">
                  <label className="block text-[10px] uppercase tracking-widest text-emerald-400 mb-1">Select {assignType === "LEAD" ? "Lead" : "Contact"}</label>
                  <select
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-emerald-500"
                    onChange={(e) => handleCrmSelect(e.target.value)}
                    defaultValue=""
                  >
                    <option value="" disabled>Select...</option>
                    {assignType === "LEAD" ? (
                      leads.map((l: any) => <option key={l.id} value={l.id}>{l.name} ({l.company || 'No Company'})</option>)
                    ) : (
                      contacts.map((c: any) => <option key={c.id} value={c.id}>{c.firstName} {c.lastName} ({c.company?.name || 'No Company'})</option>)
                    )}
                  </select>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-[10px] uppercase tracking-widest text-white/40 mb-1">Client / Company Name *</label>
                  <input 
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-emerald-500"
                    placeholder="E.g. RedBrick Realty"
                    value={invoice.clientName}
                    onChange={e => setInvoice({...invoice, clientName: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-white/40 mb-1">Client Email</label>
                  <input 
                    type="email"
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-emerald-500"
                    placeholder="billing@example.com"
                    value={invoice.clientEmail}
                    onChange={e => setInvoice({...invoice, clientEmail: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-white/40 mb-1">Client GSTIN</label>
                  <input 
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm font-mono outline-none focus:border-emerald-500"
                    placeholder="29XXXXXXXXXXXXX"
                    value={invoice.clientGst}
                    onChange={e => setInvoice({...invoice, clientGst: e.target.value})}
                  />
                </div>
              </div>
            </motion.div>

            {/* Line Items */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-md">
              <div className="flex justify-between items-end mb-4 border-b border-white/10 pb-2">
                <h2 className="text-sm font-bold font-mono uppercase tracking-widest text-white/50">Line Items</h2>
                <button onClick={addItem} className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 text-emerald-400 hover:text-emerald-300">
                  <Plus className="w-3.5 h-3.5" /> Add Item
                </button>
              </div>
              
              <div className="space-y-4">
                {items.map((item, idx) => (
                  <div key={item.id} className="flex gap-3 items-start bg-black/20 p-4 rounded-xl border border-white/5">
                    <div className="flex-1 space-y-3">
                      <div>
                        <input 
                          className="w-full bg-transparent border-b border-white/10 px-1 py-1.5 text-sm outline-none focus:border-emerald-500 placeholder:text-white/20 font-medium"
                          placeholder="Description (e.g. Brand Identity Design)"
                          value={item.description}
                          onChange={e => handleItemChange(item.id, 'description', e.target.value)}
                        />
                      </div>
                      <div className="flex gap-3">
                        <div className="w-20">
                          <label className="block text-[9px] uppercase tracking-widest text-white/40 mb-1">Qty</label>
                          <input 
                            type="number" min="1"
                            className="w-full bg-black/40 border border-white/10 rounded-md px-2 py-1.5 text-sm outline-none focus:border-emerald-500 text-center font-mono"
                            value={item.quantity}
                            onChange={e => handleItemChange(item.id, 'quantity', e.target.value)}
                          />
                        </div>
                        <div className="w-40">
                          <label className="block text-[9px] uppercase tracking-widest text-white/40 mb-1">Rate ({invoice.currency})</label>
                          <input 
                            type="number" min="0"
                            className="w-full bg-black/40 border border-white/10 rounded-md px-2 py-1.5 text-sm outline-none focus:border-emerald-500 font-mono"
                            value={item.unitPrice}
                            onChange={e => handleItemChange(item.id, 'unitPrice', e.target.value)}
                          />
                        </div>
                        <div className="w-16">
                          <label className="block text-[9px] uppercase tracking-widest text-white/40 mb-1">Disc %</label>
                          <input 
                            type="number" min="0" max="100"
                            className="w-full bg-black/40 border border-white/10 rounded-md px-2 py-1.5 text-sm outline-none focus:border-emerald-500 font-mono text-center"
                            value={item.discountRate}
                            onChange={e => handleItemChange(item.id, 'discountRate', e.target.value)}
                          />
                        </div>
                        <div className="w-24">
                          <label className="block text-[9px] uppercase tracking-widest text-white/40 mb-1">HSN/SAC</label>
                          <input 
                            className="w-full bg-black/40 border border-white/10 rounded-md px-2 py-1.5 text-sm outline-none focus:border-emerald-500 font-mono text-center"
                            placeholder="e.g. 9983"
                            value={item.hsnCode || ""}
                            onChange={e => handleItemChange(item.id, 'hsnCode', e.target.value)}
                          />
                        </div>
                        <div className="w-20">
                          <label className="block text-[9px] uppercase tracking-widest text-white/40 mb-1">Tax %</label>
                          <input 
                            type="number" min="0" max="100"
                            className="w-full bg-black/40 border border-white/10 rounded-md px-2 py-1.5 text-sm outline-none focus:border-emerald-500 font-mono text-center"
                            value={item.taxRate}
                            onChange={e => handleItemChange(item.id, 'taxRate', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="pt-8 w-24 text-right">
                      <p className="font-mono text-sm font-bold text-white mb-2">{((item.quantity * item.unitPrice * (1 - (item.discountRate || 0)/100)) * (1 + (item.taxRate || 0)/100)).toLocaleString()}</p>
                      <button onClick={() => removeItem(item.id)} className="text-white/20 hover:text-red-400 p-1.5 rounded-lg hover:bg-white/5 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

          </div>

          {/* Right Sidebar - Summary */}
          <div className="lg:col-span-1">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-2xl backdrop-blur-md sticky top-6">
              <div className="flex items-center gap-2 mb-6 text-emerald-400">
                <Calculator className="w-5 h-5" />
                <h2 className="text-sm font-bold font-mono uppercase tracking-widest">Summary</h2>
              </div>
              
              <div className="space-y-4 text-sm mb-6">
                <div className="flex justify-between items-center text-white/60">
                  <span>Subtotal</span>
                  <span className="font-mono">{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-white/60">
                  <span>Overall Discount %</span>
                  <input 
                    type="number" min="0" max="100"
                    className="w-16 bg-black/40 border border-emerald-500/30 rounded px-2 py-1 text-right text-xs outline-none text-emerald-400 font-mono"
                    value={invoice.discountRate}
                    onChange={e => setInvoice({...invoice, discountRate: Number(e.target.value)})}
                  />
                </div>
                <div className="flex justify-between items-center text-white/60">
                  <span>Estimated Tax</span>
                  <span className="font-mono">{totalTax.toLocaleString()}</span>
                </div>
              </div>
              
              <div className="border-t border-emerald-500/20 pt-4 flex justify-between items-center">
                <span className="font-bold text-white">Total ({invoice.currency})</span>
                <span className="text-2xl font-black font-mono text-emerald-400">{symbol}{grandTotal.toLocaleString()}</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Action Bar */}
      <div className="md:hidden sticky bottom-0 -mx-6 lg:-mx-10 -mb-6 lg:-mb-10 p-4 bg-[#050505]/90 backdrop-blur-xl border-t border-white/10 z-50 mt-8">
        <button 
          onClick={handleSave} 
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-black font-bold tracking-widest uppercase text-xs px-6 py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] disabled:opacity-50 min-h-[44px]"
        >
          <Save className="w-4 h-4" /> {isSubmitting ? "Saving..." : "Save Invoice"}
        </button>
      </div>

      {showPreview && (
        <Modal onClose={() => setShowPreview(false)}>
          <div className="w-[800px] max-w-full bg-[#0f0f13] border border-white/5 rounded-2xl p-10 shadow-2xl text-left overflow-y-auto max-h-[85vh] custom-scrollbar text-white relative">
            <div className="flex justify-between items-start border-b border-white/10 pb-8 mb-8">
              <div>
                <h2 className="text-white font-bold text-lg">{org.name}</h2>
                {org.billingAddress && <p className="text-slate-500 text-sm mt-1 whitespace-pre-wrap">{org.billingAddress}</p>}
                {org.supportEmail && <p className="text-slate-500 text-sm mt-1">{org.supportEmail}</p>}
              </div>
              <div className="text-right">
                <h1 className="text-4xl font-black tracking-tight text-white/20 uppercase mb-2">Invoice</h1>
                <p className="text-white font-bold">{invoice.invoiceNumber}</p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm mt-4 text-right text-slate-400">
                  <span>Due:</span> <span className="text-white font-medium">{invoice.dueDate}</span>
                </div>
              </div>
            </div>

            <div className="mb-12">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Billed To</p>
              <h3 className="text-lg font-bold text-white">{invoice.clientName || "Client Name"}</h3>
              {invoice.clientEmail && <p className="text-slate-400 text-sm mt-1">{invoice.clientEmail}</p>}
              {invoice.clientGst && <p className="text-slate-400 text-sm mt-1">GSTIN: {invoice.clientGst}</p>}
            </div>

            <table className="w-full text-sm text-left mb-8">
              <thead className="bg-white/5 text-xs uppercase text-slate-400 border-b border-white/10">
                <tr>
                  <th className="px-4 py-3 font-bold">Description</th>
                  <th className="px-4 py-3 font-bold text-right">Qty</th>
                  <th className="px-4 py-3 font-bold text-right">Rate</th>
                  <th className="px-4 py-3 font-bold text-right">Disc %</th>
                  <th className="px-4 py-3 font-bold text-right">Tax %</th>
                  <th className="px-4 py-3 font-bold text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {items.map((item, i) => {
                  const itemSubtotal = item.quantity * item.unitPrice * (1 - (item.discountRate || 0) / 100);
                  const itemTotal = itemSubtotal * (1 + (item.taxRate || 0) / 100);
                  return (
                    <tr key={i}>
                      <td className="px-4 py-4 text-white font-medium">{item.description || "Unspecified item"}</td>
                      <td className="px-4 py-4 text-right text-slate-400">{item.quantity}</td>
                      <td className="px-4 py-4 text-right text-slate-400">{symbol}{item.unitPrice.toLocaleString()}</td>
                      <td className="px-4 py-4 text-right text-slate-400">{item.discountRate}%</td>
                      <td className="px-4 py-4 text-right text-slate-400">{item.taxRate}%</td>
                      <td className="px-4 py-4 text-right font-bold text-white">{symbol}{itemTotal.toLocaleString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div className="flex justify-end mb-12">
              <div className="w-64 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Subtotal</span>
                  <span className="text-white">{symbol}{subtotal.toLocaleString()}</span>
                </div>
                {invoice.discountRate > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Overall Discount ({invoice.discountRate}%)</span>
                    <span className="text-red-400">-{symbol}{(subtotal * (invoice.discountRate / 100)).toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Estimated Tax</span>
                  <span className="text-white">{symbol}{totalTax.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center border-t border-white/10 pt-3">
                  <span className="font-bold uppercase tracking-widest text-sm text-blue-400">Total</span>
                  <span className="text-xl font-bold text-white">{symbol}{grandTotal.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {org.bankName && (
              <div className="pt-8 border-t border-white/10 mb-8">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Bank Details</p>
                <div className="grid grid-cols-2 gap-2 text-sm text-slate-300">
                  <div>Bank Name: <span className="text-white font-medium">{org.bankName}</span></div>
                  <div>Account Number: <span className="text-white font-medium font-mono">{org.bankAccountNo}</span></div>
                  <div>IFSC Code: <span className="text-white font-medium font-mono">{org.bankIfsc}</span></div>
                  <div>Branch: <span className="text-white font-medium">{org.bankBranch}</span></div>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
              <button 
                onClick={() => setShowPreview(false)}
                className="px-5 py-2.5 bg-white/5 border border-white/10 text-white font-medium rounded-xl hover:bg-white/10 text-sm"
              >
                Close Preview
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
