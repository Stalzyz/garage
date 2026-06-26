"use client"

import { useState } from "react"
import { Settings, Play, FileText, CheckCircle2, ChevronRight, Calculator, User, Loader2, ArrowLeft, Printer, X } from "lucide-react"
import { useApi, fetchApi } from "@/lib/useApi"
import { toast } from "sonner"
import { useCurrency } from "@/hooks/useCurrency"

// --- Sub-components ---

function RunDetailView({ run, onBack, onViewPayslip }: { run: any, onBack: () => void, onViewPayslip: (p: any) => void }) {
  const { symbol } = useCurrency()
  const [year, month] = run.id.split('-')
  const { data: payslipsData, isLoading } = useApi<any>(`/hr/payroll/run/${year}/${month}`)
  const payslips = payslipsData?.payslips || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Payroll Runs
        </button>
        <div className="text-sm font-mono text-white/50">Run ID: {run.id}</div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-xl font-bold">{run.month} Detailed Statement</h2>
          <p className="text-xs text-white/50 mt-1">Processed on {run.processedOn} • Total {run.totalEmployees} employees comped</p>
        </div>
        <div className="flex items-center gap-8">
          <div>
            <div className="text-xs text-white/50 font-mono mb-0.5">Total Outflow</div>
            <div className="font-mono font-bold text-2xl text-blue-400 flex items-center gap-1">
              {symbol}
              {run.totalAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.02] text-xs font-mono text-white/50 uppercase tracking-wider">
                <th className="p-4 pl-6">Employee</th>
                <th className="p-4">Gross Salary</th>
                <th className="p-4">Statutory Ded.</th>
                <th className="p-4">Unpaid Leave (LWP)</th>
                <th className="p-4">Net Salary</th>
                <th className="p-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-white/40">Loading statement details...</td>
                </tr>
              ) : payslips.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-white/40">No employee payslips found for this run.</td>
                </tr>
              ) : (
                payslips.map((slip: any) => {
                  const statutoryDeductions = slip.pfDeduction + slip.tdsDeduction + slip.ptDeduction;
                  return (
                    <tr key={slip.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-4 pl-6">
                        <div className="font-bold text-white">{slip.employee?.user?.firstName || 'Employee'} {slip.employee?.user?.lastName || ''}</div>
                        <div className="text-xs text-white/40 font-mono mt-0.5">{slip.employee?.employeeCode} • {slip.employee?.department?.name || 'HR & Operations'}</div>
                      </td>
                      <td className="p-4 font-mono">{symbol}{slip.grossSalary.toLocaleString('en-IN')}</td>
                      <td className="p-4 font-mono text-red-400/90">{symbol}{statutoryDeductions.toLocaleString('en-IN')}</td>
                      <td className="p-4 font-mono text-amber-500/90">
                        {slip.lwpDeduction > 0 ? `${symbol}${slip.lwpDeduction.toLocaleString('en-IN')}` : '—'}
                      </td>
                      <td className="p-4 font-mono font-bold text-emerald-400">{symbol}{slip.netSalary.toLocaleString('en-IN')}</td>
                      <td className="p-4 pr-6 text-right">
                        <button 
                          onClick={() => onViewPayslip(slip)}
                          className="px-3.5 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs hover:bg-white/10 transition-colors text-white font-medium inline-flex items-center gap-1.5"
                        >
                          <FileText className="w-3.5 h-3.5" /> View Payslip
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function PayslipModal({ slip, onClose }: { slip: any, onClose: () => void }) {
  const { symbol } = useCurrency()
  const statutoryDeductions = slip.pfDeduction + slip.tdsDeduction + slip.ptDeduction;
  const totalDeductions = statutoryDeductions + (slip.lwpDeduction || 0);

  const numberToWords = (num: number) => {
    const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    
    const numStr = num.toString();
    if (numStr.length > 9) return 'overflow';
    const n = ('000000000' + numStr).slice(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    if (!n) return ''; 
    let str = '';
    str += (Number(n[1]) != 0) ? (a[Number(n[1])] || b[Number(n[1][0])] + ' ' + a[Number(n[1][1])]) + 'Crore ' : '';
    str += (Number(n[2]) != 0) ? (a[Number(n[2])] || b[Number(n[2][0])] + ' ' + a[Number(n[2][1])]) + 'Lakh ' : '';
    str += (Number(n[3]) != 0) ? (a[Number(n[3])] || b[Number(n[3][0])] + ' ' + a[Number(n[3][1])]) + 'Thousand ' : '';
    str += (Number(n[4]) != 0) ? a[Number(n[4])] + 'Hundred ' : '';
    str += (Number(n[5]) != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[Number(n[5][0])] + ' ' + a[Number(n[5][1])]) + 'Only ' : 'Only';
    return str;
  }

  const getMonthName = (m: number) => {
    return new Date(2000, m - 1, 1).toLocaleString('default', { month: 'long' });
  }

  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 print:p-0 print:static print:bg-white print:text-black">
      <div className="bg-[#0c0c0c] border border-white/10 rounded-3xl w-full max-w-3xl overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.7)] flex flex-col max-h-[90vh] print:max-h-full print:w-full print:border-none print:shadow-none print:bg-white print:text-black">
        {/* Modal Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/[0.02] print:hidden">
          <h3 className="font-bold text-lg">Employee Payslip Detailed Statement</h3>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => window.print()}
              className="p-2 hover:bg-white/10 rounded-xl transition-colors text-white/70 hover:text-white flex items-center gap-1.5 text-xs font-medium"
            >
              <Printer className="w-4 h-4" /> Print Payslip
            </button>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors text-white/50 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Payslip Content (Printable Area) */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8 print:overflow-visible print:p-0 print:text-black">
          {/* Logo & Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/10 pb-6 print:border-black/10">
            <div>
              <h1 className="text-2xl font-bold tracking-wider text-blue-400 print:text-blue-600 uppercase">Grekam OS</h1>
              <p className="text-[10px] text-white/40 font-mono mt-0.5 print:text-black/50">UNIFIED ENTERPRISE SYSTEMS</p>
            </div>
            <div className="text-left sm:text-right mt-4 sm:mt-0">
              <h2 className="text-base font-bold uppercase tracking-wider print:text-black font-sans">Salary Payslip</h2>
              <p className="text-xs text-white/50 font-mono mt-1 print:text-black/60">Pay Period: {getMonthName(slip.month)} {slip.year}</p>
            </div>
          </div>

          {/* Employee & Job Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white/[0.02] border border-white/5 rounded-2xl p-6 print:border-black/10 print:bg-black/[0.02] print:text-black">
            <div className="space-y-2.5">
              <div className="grid grid-cols-3 text-xs">
                <span className="text-white/40 font-mono print:text-black/50">Employee Code:</span>
                <span className="col-span-2 font-bold font-mono">{slip.employee?.employeeCode}</span>
              </div>
              <div className="grid grid-cols-3 text-xs">
                <span className="text-white/40 font-mono print:text-black/50">Employee Name:</span>
                <span className="col-span-2 font-bold">{slip.employee?.user?.firstName || 'Employee'} {slip.employee?.user?.lastName || ''}</span>
              </div>
              <div className="grid grid-cols-3 text-xs">
                <span className="text-white/40 font-mono print:text-black/50">Email Address:</span>
                <span className="col-span-2 font-mono">{slip.employee?.user?.email}</span>
              </div>
            </div>

            <div className="space-y-2.5">
              <div className="grid grid-cols-3 text-xs">
                <span className="text-white/40 font-mono print:text-black/50">Department:</span>
                <span className="col-span-2 font-bold">{slip.employee?.department?.name || 'HR & Operations'}</span>
              </div>
              <div className="grid grid-cols-3 text-xs">
                <span className="text-white/40 font-mono print:text-black/50">Designation:</span>
                <span className="col-span-2 font-bold">{slip.employee?.jobTitle}</span>
              </div>
              <div className="grid grid-cols-3 text-xs">
                <span className="text-white/40 font-mono print:text-black/50">Joining Date:</span>
                <span className="col-span-2 font-mono">{new Date(slip.employee?.joiningDate).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Earnings vs Deductions Split Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Earnings */}
            <div className="border border-white/10 rounded-2xl overflow-hidden print:border-black/10">
              <div className="bg-white/[0.03] px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider text-blue-400 border-b border-white/10 print:bg-black/5 print:text-blue-700 print:border-black/10">
                Earnings
              </div>
              <div className="divide-y divide-white/5 text-xs p-4 space-y-3 print:divide-black/5">
                <div className="flex items-center justify-between pb-1">
                  <span className="text-white/60 print:text-black/70">Basic Salary</span>
                  <span className="font-mono">{symbol}{slip.basicSalary.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-white/60 print:text-black/70">House Rent Allowance (HRA)</span>
                  <span className="font-mono">{symbol}{slip.hra.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-white/60 print:text-black/70">Special Allowance</span>
                  <span className="font-mono">{symbol}{slip.allowances.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-white/10 font-bold print:border-black/10">
                  <span>Gross Earnings</span>
                  <span className="font-mono text-blue-400 print:text-blue-700">{symbol}{slip.grossSalary.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>

            {/* Deductions */}
            <div className="border border-white/10 rounded-2xl overflow-hidden print:border-black/10">
              <div className="bg-white/[0.03] px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider text-red-400 border-b border-white/10 print:bg-black/5 print:text-red-700 print:border-black/10">
                Deductions
              </div>
              <div className="divide-y divide-white/5 text-xs p-4 space-y-3 print:divide-black/5">
                <div className="flex items-center justify-between pb-1">
                  <span className="text-white/60 print:text-black/70">Provident Fund (PF)</span>
                  <span className="font-mono">{symbol}{slip.pfDeduction.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-white/60 print:text-black/70">Professional Tax (PT)</span>
                  <span className="font-mono">{symbol}{slip.ptDeduction.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-white/60 print:text-black/70">Income Tax (TDS)</span>
                  <span className="font-mono">{symbol}{slip.tdsDeduction.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex items-center justify-between py-1 text-amber-400 print:text-amber-700">
                  <span>Unpaid Leave (LWP) Deduction</span>
                  <span className="font-mono">{symbol}{slip.lwpDeduction.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-white/10 font-bold print:border-black/10">
                  <span>Total Deductions</span>
                  <span className="font-mono text-red-400 print:text-red-700">{symbol}{totalDeductions.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Net Pay Payout Summary */}
          <div className="bg-gradient-to-r from-blue-500/10 to-emerald-500/10 border border-white/10 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6 print:border-black/10 print:bg-black/[0.02]">
            <div>
              <div className="text-xs text-white/50 font-mono print:text-black/60">Net Payout Amount (in words)</div>
              <div className="text-sm font-bold mt-1 text-white/90 capitalize print:text-black">{numberToWords(Math.round(slip.netSalary))}</div>
            </div>
            <div className="text-center sm:text-right shrink-0">
              <div className="text-xs text-white/50 font-mono mb-1 print:text-black/60">NET SALARY PAYABLE</div>
              <div className="text-3xl font-bold font-mono text-emerald-400 flex items-center justify-center sm:justify-end gap-1.5 print:text-emerald-700">
                {symbol}{slip.netSalary.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          {/* Digital Signature Placeholder */}
          <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between text-xs text-white/40 font-mono print:border-black/10 print:text-black/50 gap-4">
            <div>
              <p>Generated electronically via Grekam OS Enterprise System.</p>
              <p className="mt-1">No physical signature required.</p>
            </div>
            <div className="sm:text-right">
              <p>Employer Signature: _______________________</p>
              <p className="mt-3">Employee Signature: _______________________</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// --- Main component ---

export default function PayrollPage() {
  const { symbol } = useCurrency()
  const { data: runsData, isLoading: runsLoading, mutate: mutateRuns } = useApi<any>("/hr/payroll")
  const { data: configData, mutate: mutateConfig } = useApi<any>("/hr/payroll/config")
  
  const payrollRuns = runsData?.data || []
  const config = configData?.config || {}

  const [activeTab, setActiveTab] = useState("RUNS")
  const [isSavingConfig, setIsSavingConfig] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [formData, setFormData] = useState<any>(null)
  
  const [selectedRun, setSelectedRun] = useState<any>(null)
  const [activePayslip, setActivePayslip] = useState<any>(null)

  // Initialize form data when config loads
  if (config && !formData && Object.keys(config).length > 0) {
    setFormData(config)
  }

  const handleConfigChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: parseFloat(e.target.value) || 0 })
  }

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSavingConfig(true)
    try {
      await fetchApi("/hr/payroll/config", {
        method: "PUT",
        body: JSON.stringify(formData)
      })
      toast.success("Payroll settings saved")
      mutateConfig()
    } catch (err: any) {
      toast.error(err.message || "Failed to save settings")
    } finally {
      setIsSavingConfig(false)
    }
  }

  const handleRunPayroll = async () => {
    setIsProcessing(true)
    try {
      const today = new Date()
      await fetchApi("/hr/payroll/run", {
        method: "POST",
        body: JSON.stringify({
          month: today.getMonth() + 1,
          year: today.getFullYear()
        })
      })
      toast.success("Payroll processed successfully")
      mutateRuns()
      setActiveTab("RUNS")
    } catch (err: any) {
      toast.error(err.message || "Failed to process payroll")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="flex flex-col h-full bg-[#050505] text-white overflow-hidden font-sans">
      {/* Header */}
      <div className="flex-none px-8 py-8 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Payroll Management</h1>
            <p className="text-sm text-white/50 mt-2">Manage employee compensation, taxes, and payslips</p>
          </div>
          <button 
            onClick={handleRunPayroll}
            disabled={isProcessing}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-500 transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] disabled:opacity-50"
          >
            {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
            {isProcessing ? "Processing..." : "Run Payroll"}
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-6 mt-8 border-b border-white/10">
          <button 
            onClick={() => {
              setActiveTab("RUNS");
              setSelectedRun(null);
            }}
            className={`pb-3 text-sm font-medium transition-colors border-b-2 ${activeTab === "RUNS" ? "border-blue-500 text-blue-400" : "border-transparent text-white/50 hover:text-white"}`}
          >
            Payroll Runs
          </button>
          <button 
            onClick={() => setActiveTab("SETTINGS")}
            className={`pb-3 text-sm font-medium transition-colors border-b-2 flex items-center gap-2 ${activeTab === "SETTINGS" ? "border-blue-500 text-blue-400" : "border-transparent text-white/50 hover:text-white"}`}
          >
            <Settings className="w-4 h-4" /> Config & Rules
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto custom-scrollbar p-8">
        
        {activeTab === "RUNS" && (
          selectedRun ? (
            <RunDetailView 
              run={selectedRun} 
              onBack={() => setSelectedRun(null)} 
              onViewPayslip={(payslip: any) => setActivePayslip(payslip)}
            />
          ) : (
            <div className="grid gap-4">
              {runsLoading ? (
                <div className="text-center py-12 text-white/40">Loading runs...</div>
              ) : payrollRuns.length === 0 ? (
                <div className="text-center py-16 border border-dashed border-white/10 rounded-2xl">
                  <FileText className="w-8 h-8 text-white/20 mx-auto mb-3" />
                  <p className="text-white/50 mb-4">No payroll runs have been processed yet.</p>
                  <button className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-white font-medium transition-colors">
                    Run First Payroll
                  </button>
                </div>
              ) : (
                payrollRuns.map((run: any) => (
                  <div 
                    key={run.id} 
                    onClick={() => setSelectedRun(run)}
                    className="bg-white/5 border border-white/10 rounded-2xl p-6 flex items-center justify-between hover:bg-white/10 transition-colors group cursor-pointer"
                  >
                    <div className="flex items-center gap-6">
                      <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex flex-col items-center justify-center">
                        <span className="text-[10px] font-mono text-blue-400 uppercase leading-none mb-1">{run.month.split(' ')[0]}</span>
                        <span className="text-sm font-bold leading-none">{run.month.split(' ')[1]}</span>
                      </div>

                      <div>
                        <h3 className="font-bold text-white mb-1">Payroll Run • {run.month}</h3>
                        <div className="text-xs text-white/50 font-mono flex items-center gap-3">
                          <span><User className="w-3 h-3 inline mr-1 opacity-50" /> {run.totalEmployees} Employees</span>
                          <span><CheckCircle2 className="w-3 h-3 inline mr-1 text-emerald-400 opacity-70" /> Processed {run.processedOn}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-8">
                      <div className="text-right">
                        <div className="text-sm text-white/50 font-mono mb-1">Total Payout</div>
                        <div className="font-mono font-bold text-lg flex items-center justify-end gap-1">
                          {symbol}{run.totalAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                        </div>
                      </div>
                      
                      <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all -translate-x-4 group-hover:translate-x-0">
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )
        )}

        {activeTab === "SETTINGS" && formData && (
          <div className="max-w-4xl">
            <form onSubmit={handleSaveConfig} className="space-y-8">
              
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h2 className="text-sm font-bold text-white mb-6 flex items-center gap-2 uppercase tracking-widest font-mono">
                  <Calculator className="w-4 h-4 text-blue-400" /> Salary Components
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-white/70">Basic Pay (%)</label>
                    <input type="number" step="0.1" name="basicPct" value={formData.basicPct} onChange={handleConfigChange} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500/50 text-white font-mono" />
                    <p className="text-[10px] text-white/40">Percentage of Gross Salary</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-white/70">HRA (%)</label>
                    <input type="number" step="0.1" name="hraPct" value={formData.hraPct} onChange={handleConfigChange} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500/50 text-white font-mono" />
                    <p className="text-[10px] text-white/40">House Rent Allowance</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-white/70">Special Allowance (%)</label>
                    <input type="number" step="0.1" name="specialPct" value={formData.specialPct} onChange={handleConfigChange} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500/50 text-white font-mono" />
                    <p className="text-[10px] text-white/40">Remaining component</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h2 className="text-sm font-bold text-white mb-6 flex items-center gap-2 uppercase tracking-widest font-mono">
                  <Calculator className="w-4 h-4 text-red-400" /> Statutory Deductions
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4 bg-black/20 p-5 rounded-xl border border-white/5">
                    <h3 className="text-sm font-medium text-white">Provident Fund (PF)</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs text-white/60">Employee %</label>
                        <input type="number" step="0.1" name="pfPct" value={formData.pfPct} onChange={handleConfigChange} className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500/50 text-white font-mono" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs text-white/60">Max Limit ({symbol})</label>
                        <input type="number" name="pfMaxLimit" value={formData.pfMaxLimit} onChange={handleConfigChange} className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500/50 text-white font-mono" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 bg-black/20 p-5 rounded-xl border border-white/5">
                    <h3 className="text-sm font-medium text-white">Professional Tax (PT)</h3>
                    <div className="space-y-2">
                      <label className="text-xs text-white/60">Fixed Monthly Amount ({symbol})</label>
                      <input type="number" name="ptAmount" value={formData.ptAmount} onChange={handleConfigChange} className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500/50 text-white font-mono" />
                    </div>
                  </div>

                  <div className="space-y-4 bg-black/20 p-5 rounded-xl border border-white/5 col-span-1 md:col-span-2">
                    <h3 className="text-sm font-medium text-white">TDS (Tax Deducted at Source)</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs text-white/60">Limit / Threshold ({symbol})</label>
                        <input type="number" name="tdsLimit" value={formData.tdsLimit} onChange={handleConfigChange} className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500/50 text-white font-mono" />
                        <p className="text-[10px] text-white/40">Apply TDS if gross exceeds this</p>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs text-white/60">TDS %</label>
                        <input type="number" step="0.1" name="tdsPct" value={formData.tdsPct} onChange={handleConfigChange} className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500/50 text-white font-mono" />
                        <p className="text-[10px] text-white/40">Flat percentage applied</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button 
                  type="submit" 
                  disabled={isSavingConfig}
                  className="px-6 py-2.5 bg-white text-black font-medium rounded-xl hover:bg-white/90 transition-all disabled:opacity-50 text-sm"
                >
                  {isSavingConfig ? "Saving..." : "Save Configuration"}
                </button>
              </div>

            </form>
          </div>
        )}
      </div>

      {activePayslip && (
        <PayslipModal 
          slip={activePayslip} 
          onClose={() => setActivePayslip(null)} 
        />
      )}
    </div>
  )
}
