"use client"

import { useState, useEffect } from "react";
import { useApi } from "@/lib/useApi";
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Shuffle, 
  Monitor, 
  DollarSign, 
  AlertCircle, 
  Filter, 
  Search, 
  User, 
  Calendar,
  MessageSquare,
  ArrowRight,
  ChevronRight,
  TrendingUp
} from "lucide-react";
import { useCurrency } from "@/hooks/useCurrency";

type RequestType = "SHIFT_SWAP" | "OVERTIME_CLAIM" | "ASSET_ALLOCATION" | "CUSTOM_CLAIM";
type RequestStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";

export default function RequestsQueuePage() {
  const { symbol } = useCurrency();
  const { data: requestsData, mutate } = useApi<any>("/hr/requests");
  const requests = requestsData?.data || [];

  // Local state
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [filterType, setFilterType] = useState<string>("ALL");
  const [search, setSearch] = useState<string>("");
  
  // Action Modal State
  const [activeRequest, setActiveRequest] = useState<any>(null);
  const [actionType, setActionType] = useState<"APPROVE" | "REJECT" | null>(null);
  const [adminNotes, setAdminNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Filter logic
  const filteredRequests = requests.filter((r: any) => {
    const matchesStatus = filterStatus === "ALL" ? true : r.status === filterStatus;
    const matchesType = filterType === "ALL" ? true : r.type === filterType;
    
    const empName = `${r.employee?.user?.firstName || ""} ${r.employee?.user?.lastName || ""}`.toLowerCase();
    const matchesSearch = search.trim() === "" ? true : (
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.description.toLowerCase().includes(search.toLowerCase()) ||
      empName.includes(search.toLowerCase())
    );

    return matchesStatus && matchesType && matchesSearch;
  });

  // Stats calculation
  const pendingCount = requests.filter((r: any) => r.status === "PENDING").length;
  const approvedCount = requests.filter((r: any) => r.status === "APPROVED").length;
  const totalCount = requests.length;
  const overtimeCount = requests.filter((r: any) => r.type === "OVERTIME_CLAIM").length;

  const handleOpenAction = (req: any, type: "APPROVE" | "REJECT") => {
    setActiveRequest(req);
    setActionType(type);
    setAdminNotes("");
  };

  const handleCloseAction = () => {
    setActiveRequest(null);
    setActionType(null);
    setAdminNotes("");
  };

  const handleConfirmAction = async () => {
    if (!activeRequest || !actionType) return;
    setIsSubmitting(true);
    try {
      const finalStatus = actionType === "APPROVE" ? "APPROVED" : "REJECTED";
      const res = await fetch(`/api/v1/hr/requests/${activeRequest.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: finalStatus,
          notes: adminNotes
        })
      });

      if (!res.ok) throw new Error("Failed to process approval request");

      mutate();
      handleCloseAction();
    } catch (err) {
      console.error(err);
      alert("Error processing action: " + err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background text-foreground relative bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] p-8 overflow-y-auto custom-scrollbar">
      
      {/* Header */}
      <div className="flex-none mb-8 pb-6 border-b border-border/50">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
          <Clock className="w-8 h-8 text-primary" /> Generic Requests & Approvals Queue
        </h1>
        <p className="text-sm text-muted-foreground mt-2">
          Verify, audit, and action employee requests for Shift Swaps, Overtime Claims, Asset Allocations, and Custom Claims.
        </p>
      </div>

      {/* KPI Stats Widgets */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8 flex-none">
        
        <div className="bg-card border border-border/50 rounded-xl p-5 shadow-sm flex flex-col justify-between hover:border-border transition-colors">
          <div className="flex items-center justify-between text-amber-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Pending Action</span>
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-3xl font-extrabold text-foreground">{pendingCount}</span>
            <span className="text-xs text-muted-foreground block mt-1">awaiting review</span>
          </div>
        </div>

        <div className="bg-card border border-border/50 rounded-xl p-5 shadow-sm flex flex-col justify-between hover:border-border transition-colors">
          <div className="flex items-center justify-between text-emerald-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Approved Requests</span>
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-3xl font-extrabold text-foreground">{approvedCount}</span>
            <span className="text-xs text-muted-foreground block mt-1">successfully applied</span>
          </div>
        </div>

        <div className="bg-card border border-border/50 rounded-xl p-5 shadow-sm flex flex-col justify-between hover:border-border transition-colors">
          <div className="flex items-center justify-between text-blue-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Overtime Claims</span>
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-3xl font-extrabold text-foreground">{overtimeCount}</span>
            <span className="text-xs text-muted-foreground block mt-1">logged hours total</span>
          </div>
        </div>

        <div className="bg-card border border-border/50 rounded-xl p-5 shadow-sm flex flex-col justify-between hover:border-border transition-colors">
          <div className="flex items-center justify-between text-primary mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Handled</span>
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-3xl font-extrabold text-foreground">{totalCount}</span>
            <span className="text-xs text-muted-foreground block mt-1">all-time requests</span>
          </div>
        </div>

      </div>

      {/* Filters & Search Control */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 bg-card border border-border/50 rounded-xl mb-8 flex-none shadow-sm">
        
        {/* Status filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          {[
            { id: "ALL", label: "All Requests" },
            { id: "PENDING", label: "Pending" },
            { id: "APPROVED", label: "Approved" },
            { id: "REJECTED", label: "Rejected" },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilterStatus(f.id)}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all whitespace-nowrap ${
                filterStatus === f.id ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Search & Type filter */}
        <div className="flex flex-col sm:flex-row gap-3 w-full md:max-w-xl">
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            className="bg-background border border-border/50 rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-primary w-full sm:w-48"
          >
            <option value="ALL">All Types</option>
            <option value="SHIFT_SWAP">🔄 Shift Swap</option>
            <option value="OVERTIME_CLAIM">⚡ Overtime Claim</option>
            <option value="ASSET_ALLOCATION">💻 Asset Allocation</option>
            <option value="CUSTOM_CLAIM">💵 Custom Claim</option>
          </select>

          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by title, employee..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-background border border-border/50 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

      </div>

      {/* Grid Queue */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 min-h-0">
        
        {filteredRequests.map((req: any) => {
          const payload = req.payload || {};
          
          return (
            <div 
              key={req.id} 
              className="bg-card border border-border/50 hover:border-border rounded-xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-all group duration-300"
            >
              
              <div className="space-y-4">
                {/* Header & Meta */}
                <div className="flex items-start justify-between border-b border-border/50 pb-3">
                  <div>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] uppercase font-bold border mb-2 ${
                      req.type === "SHIFT_SWAP" ? "bg-blue-500/10 text-blue-500 border-blue-500/20" :
                      req.type === "OVERTIME_CLAIM" ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                      req.type === "ASSET_ALLOCATION" ? "bg-purple-500/10 text-purple-500 border-purple-500/20" :
                      "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                    }`}>
                      {req.type === "SHIFT_SWAP" && <Shuffle className="w-3 h-3" />}
                      {req.type === "OVERTIME_CLAIM" && <TrendingUp className="w-3 h-3" />}
                      {req.type === "ASSET_ALLOCATION" && <Monitor className="w-3 h-3" />}
                      {req.type === "CUSTOM_CLAIM" && <DollarSign className="w-3 h-3" />}
                      {req.type.replace("_", " ")}
                    </span>
                    <h3 className="font-bold text-lg text-foreground tracking-tight line-clamp-1">{req.title}</h3>
                  </div>

                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] uppercase font-extrabold border ${
                    req.status === "PENDING" ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                    req.status === "APPROVED" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                    "bg-red-500/10 text-red-500 border-red-500/20"
                  }`}>
                    {req.status === "PENDING" && <Clock className="w-3 h-3 animate-pulse" />}
                    {req.status === "APPROVED" && <CheckCircle2 className="w-3 h-3" />}
                    {req.status === "REJECTED" && <XCircle className="w-3 h-3" />}
                    {req.status}
                  </span>
                </div>

                {/* Submitter details */}
                <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/40 p-2.5 rounded-lg border border-border/30">
                  <User className="w-3.5 h-3.5 text-primary" />
                  <span className="font-semibold text-foreground">
                    {req.employee?.user?.firstName} {req.employee?.user?.lastName}
                  </span>
                  <span>·</span>
                  <span>{req.employee?.department?.name || "No Department"}</span>
                </div>

                {/* Description */}
                <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">{req.description}</p>

                {/* Type Specific Fields Details */}
                <div className="bg-muted/20 border border-border/50 rounded-xl p-4 text-xs space-y-2">
                  <span className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5">Request Details</span>
                  
                  {req.type === "SHIFT_SWAP" && (
                    <div className="space-y-1 text-foreground">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Effective Date:</span>
                        <span className="font-semibold">{payload.startDate ? new Date(payload.startDate).toLocaleDateString() : "--"}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">New Target Shift:</span>
                        <span className="font-semibold px-2 py-0.5 bg-blue-500/10 text-blue-500 rounded border border-blue-500/20">{payload.shiftName || "Shift ID " + payload.shiftId}</span>
                      </div>
                    </div>
                  )}

                  {req.type === "OVERTIME_CLAIM" && (
                    <div className="space-y-1 text-foreground">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Log Date:</span>
                        <span className="font-semibold">{payload.date ? new Date(payload.date).toLocaleDateString() : "--"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Overtime Claimed:</span>
                        <span className="font-bold text-amber-500">{payload.hours} hours</span>
                      </div>
                      {payload.taskRef && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Task Reference:</span>
                          <span className="font-semibold text-right max-w-[150px] truncate">{payload.taskRef}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {req.type === "ASSET_ALLOCATION" && (
                    <div className="space-y-1 text-foreground">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Asset Needed:</span>
                        <span className="font-semibold">{payload.assetType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Priority Level:</span>
                        <span className="font-bold text-purple-500">{payload.priority || "Standard"}</span>
                      </div>
                    </div>
                  )}

                  {req.type === "CUSTOM_CLAIM" && (
                    <div className="space-y-1 text-foreground">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Claim Category:</span>
                        <span className="font-semibold">{payload.category || "General"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Amount:</span>
                        <span className="font-extrabold text-emerald-500">{symbol}{parseFloat(payload.amount).toLocaleString()}</span>
                      </div>
                      {payload.hasInvoice && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Supporting Docs:</span>
                          <span className="text-emerald-500 underline font-semibold cursor-pointer">Attached Receipt</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Admin notes if processed */}
                {req.notes && (
                  <div className="bg-card border border-border/50 rounded-xl p-3.5 text-xs text-foreground italic flex gap-2">
                    <MessageSquare className="w-4 h-4 text-muted-foreground flex-none mt-0.5" />
                    <div>
                      <span className="block text-[10px] font-bold text-muted-foreground uppercase not-italic mb-1">Approver Note</span>
                      "{req.notes}"
                    </div>
                  </div>
                )}

              </div>

              {/* Action Buttons for Pending */}
              {req.status === "PENDING" && (
                <div className="flex items-center gap-3 pt-5 mt-6 border-t border-border/50">
                  <button 
                    onClick={() => handleOpenAction(req, "REJECT")}
                    className="flex-1 py-2 border border-red-500/20 hover:border-red-500 text-red-500 font-bold rounded-lg text-xs uppercase tracking-widest transition-all bg-red-500/5 hover:bg-red-500/10"
                  >
                    Reject
                  </button>
                  <button 
                    onClick={() => handleOpenAction(req, "APPROVE")}
                    className="flex-1 py-2 border border-emerald-500/20 hover:border-emerald-500 text-emerald-600 font-bold rounded-lg text-xs uppercase tracking-widest transition-all bg-emerald-500/5 hover:bg-emerald-500/10"
                  >
                    Approve
                  </button>
                </div>
              )}

            </div>
          )
        })}

        {filteredRequests.length === 0 && (
          <div className="col-span-full border border-dashed border-border/50 rounded-2xl p-16 text-center text-muted-foreground bg-card shadow-sm">
            <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-30 text-primary animate-bounce" />
            <h4 className="font-bold text-foreground text-base">No Requests Found</h4>
            <p className="text-sm mt-1">There are no requests matching your selected status or filter parameters.</p>
          </div>
        )}

      </div>

      {/* Action Dialog Modal */}
      {activeRequest && actionType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all duration-300">
          <div className="bg-card border border-border/50 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2 mb-2">
              {actionType === "APPROVE" ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              ) : (
                <XCircle className="w-5 h-5 text-red-500" />
              )}
              {actionType === "APPROVE" ? "Confirm Request Approval" : "Confirm Request Rejection"}
            </h2>
            <p className="text-xs text-muted-foreground mb-4">
              Submit decision for <strong>{activeRequest.title}</strong> submitted by {activeRequest.employee?.user?.firstName}.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Admin Notes / Comments</label>
                <textarea
                  value={adminNotes}
                  onChange={e => setAdminNotes(e.target.value)}
                  placeholder="Provide approval reasoning or rejection explanation..."
                  className="w-full bg-background border border-border/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary h-24 resize-none text-foreground"
                />
              </div>

              <div className="flex justify-end gap-3 border-t border-border/50 pt-4 mt-6">
                <button
                  onClick={handleCloseAction}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg border border-border/50 hover:bg-muted transition-colors text-foreground"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmAction}
                  disabled={isSubmitting}
                  className={`px-5 py-2 text-xs font-bold uppercase tracking-wider rounded-lg text-white transition-colors ${
                    actionType === "APPROVE" ? "bg-emerald-600 hover:bg-emerald-500" : "bg-red-600 hover:bg-red-500"
                  }`}
                >
                  {isSubmitting ? "Processing..." : actionType === "APPROVE" ? "Approve" : "Reject"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
