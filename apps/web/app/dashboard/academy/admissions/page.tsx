"use client"

import { useState } from "react"
import { Search, Plus, Download, Users, FileText, CheckCircle, ChevronRight, UserPlus, FileCheck } from "lucide-react"
import Link from "next/link"
import { SlideOver } from "@/components/SlideOver"

// Mock Data for Admin Enrollments
const MOCK_ENROLLMENTS = [
  { id: "e1", studentName: "Rohan Patel", course: "Advanced React", batch: "Cohort 12 (Onsite)", date: "Today", fee: 45000, status: "ACTIVE", paid: 15000 },
  { id: "e2", studentName: "Priya Sharma", course: "UI/UX Design", batch: "Weekend Batch (Online)", date: "Yesterday", fee: 20000, status: "ACTIVE", paid: 20000 },
  { id: "e3", studentName: "Amit Singh", course: "Node.js Basics", batch: "Cohort 12 (Onsite)", date: "3 Days Ago", fee: 30000, status: "ACTIVE", paid: 10000 },
]

export default function AdmissionsPage() {
  const [search, setSearch] = useState("")
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false)
  
  // Form State for Enrollment
  const [selectedStudent, setSelectedStudent] = useState("")
  const [selectedBatch, setSelectedBatch] = useState("")
  const [totalFee, setTotalFee] = useState(30000)
  const [installmentCount, setInstallmentCount] = useState(1)
  const [installments, setInstallments] = useState<any[]>([])

  const filteredEnrollments = MOCK_ENROLLMENTS.filter(e => 
    e.studentName.toLowerCase().includes(search.toLowerCase()) || 
    e.course.toLowerCase().includes(search.toLowerCase())
  )

  const generateInstallments = () => {
    if (!totalFee || !installmentCount) return;
    const amountPer = Math.floor(totalFee / installmentCount)
    const remainder = totalFee - (amountPer * installmentCount)
    
    const newInstallments = Array.from({ length: installmentCount }).map((_, i) => ({
      amount: i === 0 ? amountPer + remainder : amountPer,
      dueDate: new Date(Date.now() + (i * 30 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0]
    }))
    setInstallments(newInstallments)
  }

  return (
    <div className="flex flex-col h-full bg-[#050505] text-white overflow-hidden">
      {/* Header */}
      <div className="flex-none px-8 py-8 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admissions & Enrollments</h1>
          <p className="text-sm text-white/50 mt-2">Manage onsite batch enrollments and fee structures.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-all border border-white/10 text-sm font-bold">
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button 
            onClick={() => setIsEnrollModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] text-sm font-bold"
          >
            <UserPlus className="w-4 h-4" /> New Enrollment
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto custom-scrollbar p-8">
        
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col justify-center relative overflow-hidden">
            <Users className="w-8 h-8 text-blue-400 mb-2" />
            <p className="text-sm font-bold text-white/50 uppercase tracking-widest">Active Enrollments</p>
            <p className="text-3xl font-black">284</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col justify-center relative overflow-hidden">
            <FileText className="w-8 h-8 text-emerald-400 mb-2" />
            <p className="text-sm font-bold text-white/50 uppercase tracking-widest">This Month</p>
            <p className="text-3xl font-black">+42</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col justify-center relative overflow-hidden">
            <FileCheck className="w-8 h-8 text-purple-400 mb-2" />
            <p className="text-sm font-bold text-white/50 uppercase tracking-widest">Revenue Expected</p>
            <p className="text-3xl font-black">₹1.2M</p>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="relative mb-6">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
          <input 
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search enrollments by student or course..."
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-4 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Enrollments Table */}
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-black/40">
                <th className="py-4 px-6 text-xs font-bold text-white/40 uppercase tracking-widest">Student</th>
                <th className="py-4 px-6 text-xs font-bold text-white/40 uppercase tracking-widest">Course / Batch</th>
                <th className="py-4 px-6 text-xs font-bold text-white/40 uppercase tracking-widest">Total Fee</th>
                <th className="py-4 px-6 text-xs font-bold text-white/40 uppercase tracking-widest">Paid</th>
                <th className="py-4 px-6 text-xs font-bold text-white/40 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredEnrollments.map(enr => (
                <tr key={enr.id} className="hover:bg-white/5 transition-colors group">
                  <td className="py-4 px-6">
                    <div className="font-bold text-sm text-white">{enr.studentName}</div>
                    <div className="text-xs text-white/40">Enrolled {enr.date}</div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="font-bold text-sm text-white">{enr.course}</div>
                    <div className="text-xs text-white/40">{enr.batch}</div>
                  </td>
                  <td className="py-4 px-6 font-mono text-sm">
                    ₹{enr.fee.toLocaleString()}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-full max-w-[100px] h-2 bg-white/10 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${enr.paid === enr.fee ? 'bg-emerald-500' : 'bg-blue-500'}`}
                          style={{ width: `${(enr.paid / enr.fee) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs font-mono text-white/60">
                        {Math.round((enr.paid / enr.fee) * 100)}%
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <Link href={`/dashboard/academy/admissions/${enr.id}`} className="inline-flex items-center gap-1 text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors">
                      View Profile <ChevronRight className="w-4 h-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Enrollment SlideOver */}
      <SlideOver title="New Manual Enrollment" open={isEnrollModalOpen} onClose={() => setIsEnrollModalOpen(false)}>
        <div className="p-6 space-y-6">
          <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
            <p className="text-xs text-blue-300">
              Use this form to enroll a student into an onsite batch and generate their fee installment plan.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-2">Student</label>
              <select 
                value={selectedStudent} 
                onChange={e => setSelectedStudent(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 appearance-none"
              >
                <option value="" disabled>Select a registered student...</option>
                <option value="1">Rohan Patel</option>
                <option value="2">Priya Sharma</option>
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-2">Course / Batch</label>
              <select 
                value={selectedBatch} 
                onChange={e => setSelectedBatch(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 appearance-none"
              >
                <option value="" disabled>Select a batch...</option>
                <option value="b1">Advanced React - Cohort 12 (Onsite)</option>
                <option value="b2">UI/UX Design - Weekend Batch (Online)</option>
              </select>
            </div>
          </div>

          <div className="border-t border-white/10 pt-6">
            <h3 className="text-sm font-bold text-white mb-4">Fee Structure</h3>
            
            <div className="flex gap-4 mb-4">
              <div className="flex-1">
                <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-2">Total Fee (₹)</label>
                <input 
                  type="number"
                  value={totalFee}
                  onChange={e => setTotalFee(Number(e.target.value))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-mono text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-2">Installments</label>
                <select 
                  value={installmentCount} 
                  onChange={e => setInstallmentCount(Number(e.target.value))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 appearance-none"
                >
                  <option value={1}>1 (Full Payment)</option>
                  <option value={2}>2 Installments</option>
                  <option value={3}>3 Installments</option>
                  <option value={6}>6 Installments</option>
                </select>
              </div>
            </div>

            <button 
              type="button"
              onClick={generateInstallments}
              className="w-full py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-lg transition-colors mb-6"
            >
              Generate Payment Plan
            </button>

            {installments.length > 0 && (
              <div className="space-y-3 bg-black/40 p-4 rounded-xl border border-white/5">
                <h4 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-3">Installment Breakdown</h4>
                {installments.map((inst, idx) => (
                  <div key={idx} className="flex gap-4 items-center">
                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-xs font-bold font-mono shrink-0">
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <input 
                        type="date"
                        value={inst.dueDate}
                        onChange={e => {
                          const updated = [...installments];
                          updated[idx].dueDate = e.target.value;
                          setInstallments(updated);
                        }}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div className="w-24 relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-xs font-mono">₹</span>
                      <input 
                        type="number"
                        value={inst.amount}
                        onChange={e => {
                          const updated = [...installments];
                          updated[idx].amount = Number(e.target.value);
                          setInstallments(updated);
                        }}
                        className="w-full bg-white/5 border border-white/10 rounded-lg pl-6 pr-3 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button 
            onClick={() => {
              setIsEnrollModalOpen(false)
              alert("Student Successfully Enrolled! Fee installments generated.")
            }}
            className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold tracking-widest uppercase transition-all mt-6"
          >
            Confirm Enrollment
          </button>
        </div>
      </SlideOver>
    </div>
  )
}
