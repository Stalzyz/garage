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
import { numberToWordsIN } from "@/lib/utils"
import { Phone, Mail, Globe, Instagram, Linkedin, Youtube } from "lucide-react";


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
    companyName: "",
    contactName: "",
    clientEmail: "",
    clientPhone: "",
    clientAddress: "",
    clientGst: "",
    businessUnit: "AGENCY",
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    currency: "INR",
    discountRate: 0,
    notes: "",
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
    if (!invoice.companyName && !invoice.contactName) {
      return alert("Please enter either a Company Name or Contact Person Name");
    }
    if (items.some(i => !i.description)) return alert("All items must have a description");
    
    setIsSubmitting(true);
    try {
      const finalClientName = invoice.companyName 
        ? (invoice.contactName ? `${invoice.companyName} (Attn: ${invoice.contactName})` : invoice.companyName)
        : (invoice.contactName || "Valued Client");

      const res = await fetchApi<any>("/finance/invoices", {
        method: "POST",
        body: JSON.stringify({
          invoiceNumber: invoice.invoiceNumber,
          clientName: finalClientName,
          clientEmail: invoice.clientEmail.trim() || undefined,
          clientGst: invoice.clientGst.trim() || undefined,
          businessUnit: invoice.businessUnit,
          discountRate: Number(invoice.discountRate || 0),
          dueDate: new Date(invoice.dueDate).toISOString(),
          notes: invoice.notes || (invoice.clientPhone ? `Contact Phone: ${invoice.clientPhone}` : undefined),
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
          companyName: lead.company || "",
          contactName: lead.name || "",
          clientEmail: lead.email || prev.clientEmail,
          clientPhone: lead.phone || prev.clientPhone,
        }))
      }
    } else if (assignType === "CONTACT") {
      const contact = contacts.find((c: any) => c.id === id)
      if (contact) {
        setInvoice(prev => ({
          ...prev,
          companyName: contact.company?.name || "",
          contactName: `${contact.firstName} ${contact.lastName}`.trim(),
          clientEmail: contact.email || prev.clientEmail,
          clientPhone: contact.phone || contact.whatsapp || prev.clientPhone,
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
              
              <div className="space-y-4">
                {/* 🏢 Company Particulars */}
                <div className="bg-black/20 p-4 rounded-xl border border-white/5 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-blue-400 font-mono uppercase tracking-wider">
                    <span>🏢 Company / Organization (Legal Entity)</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[9px] uppercase tracking-widest text-white/40 mb-1">Company Legal Name</label>
                      <input 
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 placeholder:text-white/20"
                        placeholder="e.g. Raaghas Retail Pvt Ltd"
                        value={invoice.companyName}
                        onChange={e => setInvoice({...invoice, companyName: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] uppercase tracking-widest text-white/40 mb-1">Company GSTIN</label>
                      <input 
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm font-mono outline-none focus:border-blue-500 placeholder:text-white/20"
                        placeholder="33AAAAA0000A1Z5"
                        value={invoice.clientGst}
                        onChange={e => setInvoice({...invoice, clientGst: e.target.value})}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-[9px] uppercase tracking-widest text-white/40 mb-1">Registered Billing Address</label>
                      <input 
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 placeholder:text-white/20"
                        placeholder="No. 42 Anna Salai, Chennai, Tamil Nadu – 600002"
                        value={invoice.clientAddress}
                        onChange={e => setInvoice({...invoice, clientAddress: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                {/* 👤 Contact Person Particulars */}
                <div className="bg-black/20 p-4 rounded-xl border border-white/5 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 font-mono uppercase tracking-wider">
                    <span>👤 Contact Person (Attention To / SPOC)</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[9px] uppercase tracking-widest text-white/40 mb-1">Contact Name</label>
                      <input 
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-emerald-500 placeholder:text-white/20"
                        placeholder="e.g. Stalin Kumar"
                        value={invoice.contactName}
                        onChange={e => setInvoice({...invoice, contactName: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] uppercase tracking-widest text-white/40 mb-1">Direct Email</label>
                      <input 
                        type="email"
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-emerald-500 placeholder:text-white/20"
                        placeholder="stalin@raaghas.com"
                        value={invoice.clientEmail}
                        onChange={e => setInvoice({...invoice, clientEmail: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] uppercase tracking-widest text-white/40 mb-1">Direct Phone / WhatsApp</label>
                      <input 
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-emerald-500 placeholder:text-white/20"
                        placeholder="+91 98400 12345"
                        value={invoice.clientPhone}
                        onChange={e => setInvoice({...invoice, clientPhone: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Line Items & Presets */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-md">
              <div className="flex justify-between items-end mb-3 border-b border-white/10 pb-2">
                <div>
                  <h2 className="text-sm font-bold font-mono uppercase tracking-widest text-white/50">
                    {invoice.businessUnit === 'ACADEMY' ? 'Academy Fee Items' : 'Service Line Items'}
                  </h2>
                  <p className="text-[10px] text-white/40 mt-0.5">
                    {invoice.businessUnit === 'ACADEMY' ? 'SAC 9992 — Vocational & Education Services' : 'SAC 9983 — Information Technology & Digital Agency'}
                  </p>
                </div>
                <button onClick={addItem} className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 text-emerald-400 hover:text-emerald-300">
                  <Plus className="w-3.5 h-3.5" /> Add Item
                </button>
              </div>

              {/* ⚡ Quick Presets */}
              <div className="mb-5 flex flex-wrap gap-2 pt-1">
                <span className="text-[10px] text-white/40 uppercase tracking-widest self-center mr-1">⚡ 1-Click Presets:</span>
                {invoice.businessUnit === 'ACADEMY' ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setItems([...items, { id: Date.now(), description: "Fullstack Web & AI Bootcamp Tuition Fee", quantity: 1, unitPrice: 35000, discountRate: 0, taxRate: 18, hsnCode: "999293" }])}
                      className="text-[10px] px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 hover:bg-indigo-500/20 transition-all font-medium"
                    >
                      + Web Bootcamp (₹35k, SAC 999293)
                    </button>
                    <button
                      type="button"
                      onClick={() => setItems([...items, { id: Date.now(), description: "Student Registration & Admission Fee", quantity: 1, unitPrice: 3000, discountRate: 0, taxRate: 18, hsnCode: "999299" }])}
                      className="text-[10px] px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 hover:bg-indigo-500/20 transition-all font-medium"
                    >
                      + Admission Fee (₹3k, SAC 999299)
                    </button>
                    <button
                      type="button"
                      onClick={() => setItems([...items, { id: Date.now(), description: "Student Course Kit & Cloud Lab Access", quantity: 1, unitPrice: 5000, discountRate: 0, taxRate: 18, hsnCode: "999299" }])}
                      className="text-[10px] px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 hover:bg-indigo-500/20 transition-all font-medium"
                    >
                      + Study Kit & Lab (₹5k)
                    </button>
                    <button
                      type="button"
                      onClick={() => setItems([...items, { id: Date.now(), description: "Vocational Certification Course (GST-Exempt)", quantity: 1, unitPrice: 25000, discountRate: 0, taxRate: 0, hsnCode: "999293" }])}
                      className="text-[10px] px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 hover:bg-emerald-500/20 transition-all font-medium"
                    >
                      + Exempt Course (0% GST)
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setItems([...items, { id: Date.now(), description: "Next.js Web Application & API Engine", quantity: 1, unitPrice: 45000, discountRate: 0, taxRate: 18, hsnCode: "998314" }])}
                      className="text-[10px] px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-300 hover:bg-blue-500/20 transition-all font-medium"
                    >
                      + Web & API (₹45k, SAC 998314)
                    </button>
                    <button
                      type="button"
                      onClick={() => setItems([...items, { id: Date.now(), description: "UI/UX Prototyping & Brand Design System", quantity: 1, unitPrice: 25000, discountRate: 0, taxRate: 18, hsnCode: "998313" }])}
                      className="text-[10px] px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-300 hover:bg-blue-500/20 transition-all font-medium"
                    >
                      + UI/UX & Brand (₹25k, SAC 998313)
                    </button>
                    <button
                      type="button"
                      onClick={() => setItems([...items, { id: Date.now(), description: "WhatsApp Cloud API & Bot Automation (Grafty)", quantity: 1, unitPrice: 15000, discountRate: 0, taxRate: 18, hsnCode: "998413" }])}
                      className="text-[10px] px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 hover:bg-emerald-500/20 transition-all font-medium"
                    >
                      + WhatsApp Automation (₹15k, SAC 998413)
                    </button>
                    <button
                      type="button"
                      onClick={() => setItems([...items, { id: Date.now(), description: "Monthly Website Maintenance & Cloud Ops", quantity: 1, unitPrice: 8000, discountRate: 0, taxRate: 18, hsnCode: "998315" }])}
                      className="text-[10px] px-2.5 py-1 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-300 hover:bg-purple-500/20 transition-all font-medium"
                    >
                      + Cloud Maintenance (₹8k, SAC 998315)
                    </button>
                  </>
                )}
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
          <div className="w-[850px] max-w-full bg-white text-slate-900 rounded-2xl p-8 shadow-2xl text-left overflow-y-auto max-h-[88vh] custom-scrollbar relative border border-slate-200 space-y-6">
            
            {/* Top Brand Header */}
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-black tracking-tight text-slate-900">
                    {org.name || "Grekam"} <span className="text-emerald-600">Visual<sup>+</sup></span>
                  </span>
                </div>
                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-medium">
                  by {org.name || "Grekam"}.
                </p>
                <p className="text-[10px] tracking-widest text-slate-400 font-semibold pt-1">
                  Ideas · Design · Digital Growth
                </p>

                <div className="pt-4 space-y-0.5">
                  <h3 className="font-bold text-slate-900 text-sm">
                    {invoice.businessUnit === 'ACADEMY' ? `${org.name || 'Grekam'} Academy` : (org.name || 'Grekam Visuals')}
                  </h3>
                  <p className="text-xs text-slate-600">{org.billingAddress || "Coimbatore, Tamil Nadu, India – 641024"}</p>
                  {org.gstNumber && <p className="text-xs text-slate-600 font-mono">GSTIN : {org.gstNumber}</p>}
                  <p className="text-xs text-slate-600 font-mono">PAN : {org.gstNumber?.slice(2, 12) || "HCCPS5424M"}</p>
                </div>
              </div>

              {/* Right Meta Column */}
              <div className="text-right space-y-3">
                <h1 className="text-3xl font-black tracking-tight text-[#064e3b] uppercase">
                  TAX INVOICE
                </h1>

                <div className="inline-grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-right pt-2">
                  <span className="text-slate-500 font-medium">Invoice No.</span>
                  <span className="font-bold text-slate-900 font-mono">: {invoice.invoiceNumber}</span>
                  
                  <span className="text-slate-500 font-medium">Invoice Date</span>
                  <span className="font-bold text-slate-900">: {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                  
                  <span className="text-slate-500 font-medium">Due Date</span>
                  <span className="font-bold text-slate-900">: {new Date(invoice.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                  
                  <span className="text-slate-500 font-medium">Payment Status</span>
                  <div className="flex justify-end">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
                      Pending
                    </span>
                  </div>

                  <span className="text-slate-500 font-medium">Place of Supply</span>
                  <span className="font-bold text-slate-900">: Tamil Nadu (33)</span>

                  <span className="text-slate-500 font-medium">Reverse Charge</span>
                  <span className="font-bold text-slate-900">: No</span>
                </div>
              </div>
            </div>

            {/* 2 Mint Green Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="bg-[#f0fdf4] border border-[#dcfce7] rounded-xl p-4 space-y-1">
                <p className="text-xs font-bold text-[#064e3b] uppercase tracking-wider mb-2">Bill To</p>
                <p className="font-bold text-slate-900 text-sm">{invoice.companyName || invoice.contactName || "Valued Client"}</p>
                {invoice.clientAddress && <p className="text-xs text-slate-600">{invoice.clientAddress}</p>}
                <p className="text-xs text-slate-600">Tamil Nadu, India</p>
                {invoice.clientGst && <p className="text-xs text-slate-600 font-mono">GSTIN : {invoice.clientGst}</p>}
                <p className="text-xs text-slate-600">State : Tamil Nadu (33)</p>
              </div>

              <div className="bg-[#f0fdf4] border border-[#dcfce7] rounded-xl p-4 flex flex-col justify-center space-y-2">
                <h4 className="font-bold text-[#064e3b] text-sm">
                  Thank you for choosing {invoice.businessUnit === 'ACADEMY' ? `${org.name || 'Grekam'} Academy` : (org.name || 'Grekam Visuals')}!
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Designing bold ideas for a brighter tomorrow.
                </p>
              </div>
            </div>

            {/* Table */}
            <div className="rounded-xl border border-slate-200 overflow-hidden pt-2">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-[#055740] text-white font-bold uppercase tracking-wider">
                    <th className="py-3 px-4 text-center w-12">#</th>
                    <th className="py-3 px-4">Description</th>
                    <th className="py-3 px-4 text-center">HSN/SAC</th>
                    <th className="py-3 px-4 text-center">Qty</th>
                    <th className="py-3 px-4 text-right">Unit Price ({symbol})</th>
                    <th className="py-3 px-4 text-right">Amount ({symbol})</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((item, idx) => {
                    const itemTotal = item.quantity * item.unitPrice * (1 - (item.discountRate || 0) / 100);
                    return (
                      <tr key={idx} className={idx % 2 === 1 ? 'bg-slate-50/50' : 'bg-white'}>
                        <td className="py-3.5 px-4 text-center font-medium text-slate-500">{idx + 1}</td>
                        <td className="py-3.5 px-4 font-bold text-slate-900">{item.description || "Unspecified Item"}</td>
                        <td className="py-3.5 px-4 text-center font-mono text-slate-600">{item.hsnCode || '998313'}</td>
                        <td className="py-3.5 px-4 text-center font-medium">{item.quantity}</td>
                        <td className="py-3.5 px-4 text-right font-mono">{Number(item.unitPrice || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                        <td className="py-3.5 px-4 text-right font-bold font-mono text-slate-900">{itemTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Totals & Words Section */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-2">
              <div className="md:col-span-7 space-y-4">
                <div className="bg-[#f0fdf4] border border-[#dcfce7] rounded-xl p-4">
                  <p className="text-[11px] font-bold text-[#064e3b] uppercase tracking-wider mb-1">Amount in Words</p>
                  <p className="text-xs font-bold text-slate-800">{numberToWordsIN(grandTotal)}</p>
                </div>
              </div>

              <div className="md:col-span-5">
                <div className="border border-slate-200 rounded-xl overflow-hidden text-xs divide-y divide-slate-100">
                  <div className="flex justify-between py-2.5 px-4">
                    <span className="text-slate-600 font-medium">Subtotal</span>
                    <span className="font-bold text-slate-900 font-mono">{symbol} {subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between py-2.5 px-4">
                    <span className="text-slate-600 font-medium">Estimated Tax</span>
                    <span className="font-bold text-slate-900 font-mono">{symbol} {totalTax.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between py-3 px-4 bg-[#f0fdf4] text-[#064e3b] font-bold border-t border-[#dcfce7]">
                    <span className="text-sm">Total Amount ({symbol})</span>
                    <span className="text-base font-black font-mono">{symbol} {grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes & Authorized Signatory */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-4 border-t border-slate-100">
              <div className="md:col-span-8 space-y-1">
                <p className="text-xs font-bold text-slate-900">Notes</p>
                <ol className="text-[10px] text-slate-600 space-y-0.5 list-none pl-0">
                  <li>1. This is a computer generated invoice and does not require a signature.</li>
                  <li>2. Services provided under {invoice.businessUnit === 'ACADEMY' ? `${org.name || 'Grekam'} Academy` : (org.name || 'Grekam Visuals')}.</li>
                  <li>3. Payment once made is non-refundable.</li>
                  <li>4. For any billing queries, contact <span className="text-emerald-700 font-semibold">{org.supportEmail || 'support@grekam.in'}</span>.</li>
                  <li>5. Thank you for being a valued client!</li>
                </ol>
              </div>

              <div className="md:col-span-4 flex flex-col items-center justify-end text-center pt-2">
                <p className="text-xs font-bold text-slate-900 mb-4">For {invoice.businessUnit === 'ACADEMY' ? `${org.name || 'Grekam'} Academy` : (org.name || 'Grekam Visuals')}</p>
                <div className="w-28 border-b border-slate-300 mb-1"></div>
                <p className="text-[9px] text-slate-500 uppercase tracking-widest font-semibold">Authorized Signatory</p>
              </div>
            </div>

            {/* Footer Bar */}
            <div className="bg-slate-50 border border-slate-200 rounded-full px-5 py-2.5 flex flex-wrap justify-between items-center text-xs text-slate-600 gap-3 mt-4">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 bg-[#055740] text-white px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                  <Phone className="w-3 h-3" /> {org.phone || "+91 422 123 4567"}
                </span>
                <span className="flex items-center gap-1 bg-[#055740] text-white px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                  <Mail className="w-3 h-3" /> {org.supportEmail || "support@grekam.in"}
                </span>
                <span className="flex items-center gap-1 bg-[#055740] text-white px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                  <Globe className="w-3 h-3" /> {org.website || "agency.grekam.in"}
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-slate-400 font-medium text-[10px]">
                <Instagram className="w-3 h-3 text-slate-600" />
                <Linkedin className="w-3 h-3 text-slate-600" />
                <Youtube className="w-3 h-3 text-slate-600" />
                <span>Design · Develop · Grow</span>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button 
                onClick={() => setShowPreview(false)}
                className="px-5 py-2 bg-slate-900 text-white font-medium rounded-xl hover:bg-slate-800 text-xs"
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
