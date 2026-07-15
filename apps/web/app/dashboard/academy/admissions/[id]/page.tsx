"use client"

import { useParams } from "next/navigation"
import { ChevronLeft, User, Phone, Mail, BookOpen, Calendar, IndianRupee, Clock, CheckCircle2, AlertCircle } from "lucide-react"
import Link from "next/link"

// Mock Data for a single student's enrollment and fee installments
const MOCK_STUDENT_ENROLLMENT = {
  id: "e1",
  student: {
    name: "Rohan Patel",
    email: "rohan@example.com",
    phone: "+91 9876543210",
    joinDate: "Aug 15, 2023"
  },
  course: "Advanced React",
  batch: "Cohort 12 (Onsite)",
  status: "ACTIVE",
  totalFee: 45000,
  feePaid: 15000,
  installments: [
    { id: "i1", amount: 15000, dueDate: "2023-08-15", status: "PAID", paidAmount: 15000, paidAt: "2023-08-15", ref: "UPI_TXN_9872" },
    { id: "i2", amount: 15000, dueDate: "2023-09-15", status: "PENDING", paidAmount: 0, paidAt: null, ref: null },
    { id: "i3", amount: 15000, dueDate: "2023-10-15", status: "PENDING", paidAmount: 0, paidAt: null, ref: null },
  ],
  followUps: [
    { date: "2023-09-10", note: "Sent automated WhatsApp reminder for upcoming installment." }
  ]
}

export default function AdmissionProfilePage() {
  const params = useParams()
  const enrollmentId = params.id as string
  
  // In a real app, fetch based on enrollmentId. We'll use mock data.
  const data = MOCK_STUDENT_ENROLLMENT

  const handleRecordPayment = (installmentId: string) => {
    alert(`Trigger "Record Payment" modal for installment ${installmentId}`)
  }

  return (
    <div className="flex flex-col h-full bg-[#050505] text-white overflow-hidden">
      
      {/* Header */}
      <div className="flex-none px-6 py-4 border-b border-white/10 flex items-center justify-between bg-black/40">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/academy/admissions" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-white">Enrollment Details</h1>
            <p className="text-xs text-white/50 font-mono">ID: {data.id.toUpperCase()}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto custom-scrollbar p-8">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Student & Course Info */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Student Card */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="flex flex-col items-center text-center mb-6">
                <div className="w-20 h-20 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-3xl font-black mb-4">
                  {data.student.name.charAt(0)}
                </div>
                <h2 className="text-xl font-bold">{data.student.name}</h2>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest bg-blue-500/10 text-blue-400 border border-blue-500/20 mt-2">
                  <CheckCircle2 className="w-3 h-3" /> ACTIVE STUDENT
                </span>
              </div>
              
              <div className="space-y-4 pt-6 border-t border-white/10">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="w-4 h-4 text-white/30" />
                  <span className="text-white/70">{data.student.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="w-4 h-4 text-white/30" />
                  <span className="text-white/70">{data.student.phone}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="w-4 h-4 text-white/30" />
                  <span className="text-white/70">Joined {data.student.joinDate}</span>
                </div>
              </div>
            </div>

            {/* Course Card */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-4">Enrolled In</h3>
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0 border border-purple-500/30">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-lg leading-tight mb-1">{data.course}</h4>
                  <p className="text-sm text-white/50">{data.batch}</p>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Fee Schedule & Payments */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Fee Overview */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-blue-500/10 rounded-full blur-xl pointer-events-none" />
                <p className="text-xs font-bold text-white/50 uppercase tracking-widest mb-1">Total Course Fee</p>
                <div className="flex items-center gap-2">
                  <IndianRupee className="w-5 h-5 text-blue-400" />
                  <p className="text-3xl font-black">{data.totalFee.toLocaleString()}</p>
                </div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />
                <p className="text-xs font-bold text-white/50 uppercase tracking-widest mb-1">Total Paid</p>
                <div className="flex items-center gap-2">
                  <IndianRupee className="w-5 h-5 text-emerald-400" />
                  <p className="text-3xl font-black">{data.feePaid.toLocaleString()}</p>
                </div>
                <div className="mt-3 w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(data.feePaid / data.totalFee) * 100}%` }} />
                </div>
              </div>
            </div>

            {/* Installment Plan */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold">Installment Plan</h3>
                <span className="px-3 py-1 bg-white/10 text-white/70 text-xs font-bold rounded-lg">{data.installments.length} Installments</span>
              </div>
              
              <div className="space-y-4">
                {data.installments.map((inst, idx) => (
                  <div key={inst.id} className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 border border-white/5 bg-black/40 rounded-xl relative">
                    
                    {/* Status Indicator line */}
                    <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-xl ${
                      inst.status === 'PAID' ? 'bg-emerald-500' : 
                      inst.status === 'OVERDUE' ? 'bg-red-500' : 'bg-amber-500'
                    }`} />
                    
                    <div className="flex-1 pl-2">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-sm font-bold text-white">Installment {idx + 1}</span>
                        <span className={`text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full border ${
                          inst.status === 'PAID' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                          inst.status === 'OVERDUE' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 
                          'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }`}>
                          {inst.status}
                        </span>
                      </div>
                      <p className="text-xs text-white/50 font-mono">
                        {inst.status === 'PAID' ? `Paid on ${inst.paidAt} • Ref: ${inst.ref}` : `Due on ${inst.dueDate}`}
                      </p>
                    </div>
                    
                    <div className="text-left sm:text-right">
                      <p className="text-lg font-bold font-mono">₹{inst.amount.toLocaleString()}</p>
                      {inst.status !== 'PAID' && (
                        <p className="text-xs text-white/40 font-mono line-through">₹{inst.paidAmount}</p>
                      )}
                    </div>
                    
                    {inst.status !== 'PAID' && (
                      <div className="w-full sm:w-auto mt-3 sm:mt-0">
                        <button 
                          onClick={() => handleRecordPayment(inst.id)}
                          className="w-full px-4 py-2 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-500/30 rounded-lg text-xs font-bold transition-all"
                        >
                          Record Payment
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Follow-ups */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Phone className="w-5 h-5 text-blue-400" /> Collection Logs
                </h3>
                <button className="text-xs font-bold text-blue-400 hover:text-blue-300">
                  + Add Log
                </button>
              </div>
              
              <div className="space-y-4">
                {data.followUps.length === 0 ? (
                  <p className="text-sm text-white/40 italic">No collection logs recorded.</p>
                ) : (
                  data.followUps.map((log, i) => (
                    <div key={i} className="flex gap-4 p-4 border border-white/5 bg-black/40 rounded-xl">
                      <div className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
                        <Clock className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm text-white/80">{log.note}</p>
                        <p className="text-xs text-white/40 mt-1 font-mono">{log.date}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
