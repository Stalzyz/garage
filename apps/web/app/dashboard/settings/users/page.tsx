"use client";

import { useState, useEffect } from "react";
import { 
  Users, 
  Search, 
  KeyRound, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  Copy, 
  Check, 
  RefreshCw, 
  ArrowLeft,
  Lock,
  UserCheck,
  Filter
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { ApiClient } from "@/lib/api";

interface UserItem {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  status: string;
  phone?: string | null;
  avatarUrl?: string | null;
  mustChangePassword: boolean;
  passwordResetAt?: string | null;
  createdAt: string;
}

export default function AdminUsersSecurityPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Reset Modal state
  const [confirmTarget, setConfirmTarget] = useState<UserItem | null>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [resetResult, setResetResult] = useState<{
    user: UserItem;
    temporaryPassword: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (roleFilter !== "ALL") params.set("role", roleFilter);
      if (statusFilter !== "ALL") params.set("status", statusFilter);

      const res = await ApiClient.get(`/admin/users?${params.toString()}`);
      if (res && res.data) {
        setUsers(res.data);
      } else if (Array.isArray(res)) {
        setUsers(res);
      }
    } catch (err: any) {
      console.error("Failed to load users:", err);
      toast.error(err.message || "Failed to load user accounts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, roleFilter, statusFilter]);

  const handleExecuteReset = async () => {
    if (!confirmTarget) return;
    setIsResetting(true);
    try {
      const res = await ApiClient.post(`/admin/users/${confirmTarget.id}/reset-password`, {});
      if (res && res.temporaryPassword) {
        setResetResult({
          user: confirmTarget,
          temporaryPassword: res.temporaryPassword,
        });
        setConfirmTarget(null);
        toast.success(`Temporary password generated for ${confirmTarget.email}`);
        fetchUsers();
      } else {
        throw new Error(res.message || "Failed to reset password");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to execute password reset");
    } finally {
      setIsResetting(false);
    }
  };

  const handleCopyPassword = () => {
    if (!resetResult?.temporaryPassword) return;
    navigator.clipboard.writeText(resetResult.temporaryPassword);
    setCopied(true);
    toast.success("Temporary password copied to clipboard");
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="flex flex-col h-full bg-[#050505] text-white overflow-y-auto">
      {/* Header */}
      <div className="flex-none px-8 py-6 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/settings" className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-amber-400" />
              User Access & Password Governance
            </h1>
            <p className="text-xs text-white/50 mt-0.5">
              Admin-controlled password resets across all system accounts (Staff, Clients, Students, Educators, Vendors, Admins)
            </p>
          </div>
        </div>

        <button
          onClick={() => fetchUsers()}
          className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-medium transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      <div className="p-8 max-w-7xl mx-auto w-full space-y-6">
        {/* Security Policy Banner */}
        <div className="bg-amber-950/20 border border-amber-500/30 rounded-xl p-4 flex items-start gap-3.5">
          <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <p className="font-semibold text-amber-300">Enforced Security Policy: Zero Public Password Recovery</p>
            <p className="text-white/70 leading-relaxed">
              Public self-service password recovery is disabled across Grekam OS. Account credentials can only be reset by authorized administrators.
              Triggering a reset generates a temporary, single-use passkey and invalidates existing sessions. The user will be strictly forced to set their permanent password on next login.
            </p>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white/[0.02] border border-white/5 p-4 rounded-xl">
          <div className="relative flex-1 min-w-[280px]">
            <Search className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name or email address..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-white/40 focus:outline-none focus:border-amber-400/50"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-white/40" />
              <span className="text-xs text-white/50">Role:</span>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-white/30"
              >
                <option value="ALL">All Roles</option>
                <option value="SUPER_ADMIN">Super Admin</option>
                <option value="MANAGER">Manager</option>
                <option value="STAFF">Staff</option>
                <option value="CLIENT">Client</option>
                <option value="STUDENT">Student</option>
                <option value="EDUCATOR">Educator</option>
                <option value="VENDOR">Vendor</option>
                <option value="INTERN">Intern</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-white/50">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-white/30"
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="PENDING">Pending</option>
                <option value="SUSPENDED">Suspended</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="border border-white/10 rounded-xl overflow-hidden bg-black/40">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-white/[0.03] border-b border-white/10 text-white/50 uppercase tracking-wider font-semibold">
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Account Status</th>
                <th className="py-3 px-4">Password Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-white/40">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshCw className="w-5 h-5 animate-spin text-amber-400" />
                      <span>Loading accounts...</span>
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-white/40">
                    No matching user accounts found.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs">
                          {user.firstName?.[0] || user.email[0].toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-white">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="text-white/40 font-mono text-[11px]">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wide bg-blue-500/10 border border-blue-500/20 text-blue-300">
                        {user.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-medium border ${
                        user.status === 'ACTIVE' 
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' 
                          : user.status === 'SUSPENDED' 
                          ? 'bg-red-500/10 border-red-500/20 text-red-300' 
                          : 'bg-white/5 border-white/10 text-white/60'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          user.status === 'ACTIVE' ? 'bg-emerald-400' : user.status === 'SUSPENDED' ? 'bg-red-400' : 'bg-white/40'
                        }`} />
                        {user.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {user.mustChangePassword ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-medium bg-amber-500/10 border border-amber-500/30 text-amber-300">
                          <AlertTriangle className="w-3 h-3" />
                          Change Forced on Next Login
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] text-white/50">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          Normal Password Active
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setConfirmTarget(user)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 hover:text-amber-200 rounded-lg text-xs font-medium transition-colors"
                      >
                        <KeyRound className="w-3.5 h-3.5" />
                        Reset Password
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CONFIRMATION MODAL */}
      {confirmTarget && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111] border border-white/10 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Confirm Admin Password Reset</h3>
                <p className="text-xs text-white/50 mt-0.5">Admin-controlled credential override</p>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-white/50">Target User:</span>
                <span className="font-semibold text-white">{confirmTarget.firstName} {confirmTarget.lastName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50">Email:</span>
                <span className="font-mono text-white/80">{confirmTarget.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50">Role:</span>
                <span className="text-blue-300 font-semibold">{confirmTarget.role}</span>
              </div>
            </div>

            <p className="text-xs text-white/70 leading-relaxed">
              Generating a reset will invalidate all current active sessions for this account. A secure temporary password will be created, and the user will be <strong className="text-amber-300">mandated to set a new password</strong> before they can access any dashboard functions.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmTarget(null)}
                disabled={isResetting}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-medium text-white/70 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteReset}
                disabled={isResetting}
                className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs rounded-lg transition-colors disabled:opacity-50"
              >
                {isResetting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                Generate Temporary Password
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RESULT MODAL (ONE-TIME DISPLAY OF TEMPORARY PASSWORD) */}
      {resetResult && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111] border border-amber-500/40 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Temporary Password Generated</h3>
                <p className="text-xs text-white/50 mt-0.5">Provide this temporary passkey to the user</p>
              </div>
            </div>

            <div className="bg-amber-950/20 border border-amber-500/30 rounded-xl p-3 text-xs text-amber-300/90 leading-relaxed">
              ⚠️ <strong>Single-Use Display:</strong> This temporary password will NOT be displayed again. Copy it now and deliver it securely to <strong>{resetResult.user.email}</strong>.
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] uppercase tracking-wider text-white/50 font-semibold">Temporary Passkey</label>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-black border border-white/20 rounded-xl px-4 py-3 font-mono text-base font-bold text-amber-400 tracking-wider select-all">
                  {resetResult.temporaryPassword}
                </div>
                <button
                  type="button"
                  onClick={handleCopyPassword}
                  className="px-4 py-3 bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors shrink-0"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 text-xs text-white/70 space-y-1">
              <p className="font-semibold text-white">Next User Flow:</p>
              <ol className="list-decimal pl-4 space-y-0.5 text-white/60">
                <li>User logs in using their email and this temporary password.</li>
                <li>System Route Guard intercepts access and automatically routes them to <strong>/auth/change-password</strong>.</li>
                <li>User enters their temporary password and chooses a permanent password.</li>
                <li>Full dashboard access is restored.</li>
              </ol>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setResetResult(null)}
                className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-semibold transition-colors"
              >
                Close & Return
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
