"use client"

import { useState } from "react"
import { Search, Filter, IndianRupee, Clock, AlertCircle, Phone, CheckCircle, Wallet } from "lucide-react"
import Link from "next/link"
import { SlideOver } from "@/components/SlideOver"

// Mock Data for Global Installments View
const MOCK_INSTALLMENTS = [
  { id: "i1", student: "Rohan Patel", batch: "Cohort 12", installmentNo: 2, totalInstallments: 3, amount: 15000, dueDate: "2023-09-15", status: "OVERDUE", contact: "+91 9876543210" },
  { id: "i2", student: "Priya Sharma", batch: "Weekend Batch", installmentNo: 1, totalInstallments: 1, amount: 20000, dueDate: "2023-10-01", status: "PENDING", contact: "+91 8765432109" },
  { id: "i3", student: "Amit Singh", batch: "Cohort 12", installmentNo: 2, totalInstallments: 3, amount: 10000, dueDate: "2023-09-10", status: "OVERDUE", contact: "+91 7654321098" },
  { id: "i4", student: "Diana Prince", batch: "UI/UX Basics", installmentNo: 1, totalInstallments: 2, amount: 12000, dueDate: "2023-11-05", status: "PENDING", contact: "+91 6543210987" },
]

export default function FeeCollectionsPage() {
  const [search, setSearch] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("ALL")
  
  // SlideOvers State
  const [paymentModalOpen, setPaymentModalOpen] = useState(false)
  const [followUpModalOpen, setFollowUpModalOpen] = useState(false)
  const [selectedInst, setSelectedInst] = useState<any>(null)

  // Payment Form State
  const [payMethod, setPayMethod] = useState("UPI")
  const [payRef, setPayRef] = useState("")

  // Follow-up Form State
  const [followUpNote, setFollowUpNote] = useState("")

  const filteredInstallments = MOCK_INSTALLMENTS.filter(i => {
    const matchesSearch = i.student.toLowerCase().includes(search.toLowerCase()) || i.batch.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = filterStatus === "ALL" || i.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const openPaymentModal = (inst: any) => {
    setSelectedInst(inst)
    setPaymentModalOpen(true)
  }

  const openFollowUpModal = (inst: any) => {
    setSelectedInst(inst)
    setFollowUpModalOpen(true)
  }

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault()
    alert(`Payment recorded for ${selectedInst?.student}. Amount: ₹${selectedInst?.amount} via ${payMethod}`)
    setPaymentModalOpen(false)
  }

  const handleLogFollowUp = (e: React.FormEvent) => {
    e.preventDefault()
    alert(`Follow-up logged for ${selectedInst?.student}: ${followUpNote}`)
    setFollowUpModalOpen(false)
    setFollowUpNote("")
  }

  return (
    <div className="flex flex-col h-full bg-[#050505] text-white overflow-hidden">
      {/* Header */}
      <div className="flex-none px-8 py-8 border-b border-white/10">
        <h1 className="text-3xl font-bold tracking-tight">Fee Collections</h1>
        <p className="text-sm text-white/50 mt-2">Track upcoming and overdue installments across all students.</p>
      </div>

      <div className="flex-1 overflow-auto custom-scrollbar p-8">
        
        {/* Collection Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-center">
            <AlertCircle className="w-8 h-8 text-red-500 mb-2" />
            <p className="text-sm font-bold text-red-500/70 uppercase tracking-widest">Total Overdue</p>
            <p className="text-3xl font-black text-red-400">₹25,000</p>
          </div>
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-center">
            <Clock className="w-8 h-8 text-amber-500 mb-2" />
            <p className="text-sm font-bold text-amber-500/70 uppercase tracking-widest">Pending This Month</p>
            <p className="text-3xl font-black text-amber-400">₹32,000</p>
          </div>
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-center">
            <CheckCircle className="w-8 h-8 text-emerald-500 mb-2" />
            <p className="text-sm font-bold text-emerald-500/70 uppercase tracking-widest">Collected This Month</p>
            <p className="text-3xl font-black text-emerald-400">₹145,000</p>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
            <input 
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by student or batch..."
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>
          
          <select 
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="w-full md:w-48 bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-emerald-500 appearance-none font-bold tracking-widest uppercase"
          >
            <option value="ALL">All Status</option>
            <option value="OVERDUE">Overdue</option>
            <option value="PENDING">Pending</option>
          </select>
        </div>

        {/* Installments Table */}
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-black/40">
                <th className="py-4 px-6 text-xs font-bold text-white/40 uppercase tracking-widest">Student</th>
                <th className="py-4 px-6 text-xs font-bold text-white/40 uppercase tracking-widest">Installment</th>
                <th className="py-4 px-6 text-xs font-bold text-white/40 uppercase tracking-widest">Due Date</th>
                <th className="py-4 px-6 text-xs font-bold text-white/40 uppercase tracking-widest">Amount</th>
                <th className="py-4 px-6 text-xs font-bold text-white/40 uppercase tracking-widest">Status</th>
                <th className="py-4 px-6 text-xs font-bold text-white/40 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredInstallments.map(inst => (
                <tr key={inst.id} className="hover:bg-white/5 transition-colors group">
                  <td className="py-4 px-6">
                    <div className="font-bold text-sm text-white">{inst.student}</div>
                    <div className="text-xs text-white/40">{inst.batch}</div>
                  </td>
                  <td className="py-4 px-6 text-sm text-white/70">
                    Inst. {inst.installmentNo} of {inst.totalInstallments}
                  </td>
                  <td className="py-4 px-6 text-sm font-mono text-white/70">
                    {inst.dueDate}
                  </td>
                  <td className="py-4 px-6 font-mono text-sm font-bold text-white">
                    ₹{inst.amount.toLocaleString()}
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest border ${
                      inst.status === 'OVERDUE' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 
                      'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    }`}>
                      {inst.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right space-x-2">
                    {inst.status === 'OVERDUE' && (
                      <button 
                        onClick={() => openFollowUpModal(inst)}
                        className="p-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 rounded-lg transition-colors inline-flex items-center justify-center"
                        title="Log Follow-up Call"
                      >
                        <Phone className="w-4 h-4" />
                      </button>
                    )}
                    <button 
                      onClick={() => openPaymentModal(inst)}
                      className="px-3 py-2 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-500/30 rounded-lg text-xs font-bold transition-all"
                    >
                      Record Payment
                    </button>
                  </td>
                </tr>
              ))}
              {filteredInstallments.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-white/30">
                    No installments found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Payment SlideOver */}
      <SlideOver title="Record Payment" open={paymentModalOpen} onClose={() => setPaymentModalOpen(false)}>
        {selectedInst && (
          <form onSubmit={handleRecordPayment} className="p-6 flex flex-col h-full">
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-6 text-center mb-8">
              <p className="text-xs font-bold text-emerald-500/70 uppercase tracking-widest mb-2">Amount Due</p>
              <p className="text-4xl font-black text-emerald-400 font-mono">₹{selectedInst.amount.toLocaleString()}</p>
              <p className="text-sm text-emerald-500/70 mt-2">{selectedInst.student} • Inst. {selectedInst.installmentNo}</p>
            </div>

            <div className="space-y-6 flex-1">
              <div>
                <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-3">Payment Method</label>
                <div className="grid grid-cols-3 gap-3">
                  {['UPI', 'CASH', 'CHEQUE'].map(method => (
                    <label key={method} className={`border rounded-xl p-3 text-center cursor-pointer transition-all ${payMethod === method ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'}`}>
                      <input type="radio" name="payMethod" value={method} checked={payMethod === method} onChange={() => setPayMethod(method)} className="hidden" />
                      <span className="text-sm font-bold">{method}</span>
                    </label>
                  ))}
                </div>
              </div>

              {payMethod !== 'CASH' && (
                <div>
                  <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-2">Reference / Transaction ID</label>
                  <input 
                    required 
                    value={payRef}
                    onChange={e => setPayRef(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
                    placeholder="e.g. TXN987654321"
                  />
                </div>
              )}
            </div>

            <button type="submit" className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold tracking-widest uppercase transition-all mt-8 flex justify-center items-center gap-2">
              <Wallet className="w-5 h-5" /> Confirm Payment
            </button>
          </form>
        )}
      </SlideOver>

      {/* Log Follow-up SlideOver */}
      <SlideOver title="Log Collection Follow-up" open={followUpModalOpen} onClose={() => setFollowUpModalOpen(false)}>
        {selectedInst && (
          <form onSubmit={handleLogFollowUp} className="p-6 flex flex-col h-full">
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-bold text-white">{selectedInst.student}</span>
                <span className="text-xs font-mono text-red-400">Overdue by {Math.floor((Date.now() - new Date(selectedInst.dueDate).getTime()) / (1000 * 3600 * 24))} Days</span>
              </div>
              <div className="flex items-center gap-2 text-white/50 text-sm">
                <Phone className="w-4 h-4" /> {selectedInst.contact}
              </div>
            </div>

            <div className="space-y-4 flex-1">
              <div>
                <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-2">Follow-up Notes</label>
                <textarea 
                  required
                  value={followUpNote}
                  onChange={e => setFollowUpNote(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 h-32 resize-none"
                  placeholder="e.g. Called student, they promised to pay via UPI by Friday evening."
                />
              </div>
            </div>

            <button type="submit" className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold tracking-widest uppercase transition-all mt-8">
              Save Note
            </button>
          </form>
        )}
      </SlideOver>

    </div>
  )
}
