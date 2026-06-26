"use client";

import { useEffect, useState } from "react";
import { ApiClient } from "@/lib/api";
import { Loader2, Shield, RefreshCw } from "lucide-react";

const ACTION_COLORS: Record<string, string> = {
  CREATE: "text-emerald-400 bg-emerald-400/10",
  UPDATE: "text-blue-400 bg-blue-400/10",
  DELETE: "text-red-400 bg-red-400/10",
  VIEW:   "text-zinc-400 bg-zinc-400/10",
};

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await ApiClient.get(`/settings/audit-logs?page=${page}&limit=50`);
      setLogs(data.logs || []);
    } catch {
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLogs(); }, [page]);

  return (
    <div className="p-8 max-w-6xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <Shield className="w-7 h-7 text-violet-400" /> Audit Logs
          </h1>
          <p className="text-[#a1a1aa] mt-2">A tamper-evident log of every action taken inside the OS. Useful for security and compliance.</p>
        </div>
        <button onClick={fetchLogs} className="flex items-center gap-2 border border-[#333] text-[#a1a1aa] hover:text-white px-4 py-2 rounded-lg text-sm transition-colors">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#666]" /></div>
      ) : logs.length === 0 ? (
        <div className="text-center py-20 text-[#555]">No audit logs found yet.</div>
      ) : (
        <div className="bg-[#111111] border border-[#222] rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#222] text-[#555] text-xs uppercase tracking-widest">
                <th className="text-left px-4 py-3">When</th>
                <th className="text-left px-4 py-3">Action</th>
                <th className="text-left px-4 py-3">Resource</th>
                <th className="text-left px-4 py-3">User</th>
                <th className="text-left px-4 py-3">IP</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log, i) => (
                <tr key={log.id} className={`border-b border-[#1a1a1a] hover:bg-white/[0.02] transition-colors ${i % 2 === 0 ? '' : 'bg-[#0a0a0a]'}`}>
                  <td className="px-4 py-3 text-[#666] font-mono text-xs whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded font-mono ${ACTION_COLORS[log.action] || 'text-zinc-400 bg-zinc-400/10'}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-white text-xs font-mono">{log.resource}</span>
                    <span className="text-[#555] text-xs ml-2">#{log.resourceId?.slice(0, 8)}</span>
                  </td>
                  <td className="px-4 py-3 text-[#a1a1aa] text-xs">
                    {log.user?.email || log.userId?.slice(0, 8)}
                  </td>
                  <td className="px-4 py-3 text-[#555] text-xs font-mono">{log.ipAddress || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
