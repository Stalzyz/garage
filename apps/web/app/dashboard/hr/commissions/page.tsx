'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Trophy, 
  IndianRupee, 
  Wallet, 
  CheckCircle2, 
  Clock, 
  Copy,
  TrendingUp,
  Building,
  User,
  Share2,
  Loader2
} from 'lucide-react';
import { useApi, fetchApi } from '@/lib/useApi';
import { toast } from 'sonner';

export default function CommissionsPage() {
  const { data: commissionsRes, mutate: mutateCommissions, isLoading } = useApi<{ data: any[]; stats: any }>('/hr/commissions');
  const { data: rulesRes, mutate: mutateRules } = useApi<{ data: { salesCommissionPercentage: number } }>('/hr/rules/commission');

  const commissions = commissionsRes?.data || [];
  const stats = commissionsRes?.stats || { totalEarnings: 0, pendingEarnings: 0, referralCode: 'SALES-EMP' };

  const [isAdmin, setIsAdmin] = useState(true);
  const [copied, setCopied] = useState(false);
  const [salesRate, setSalesRate] = useState<number>(10);
  const [isSavingRate, setIsSavingRate] = useState(false);

  useEffect(() => {
    const role = localStorage.getItem('userRole');
    if (role && ['STUDENT', 'CLIENT', 'USER'].includes(role.toUpperCase())) {
      setIsAdmin(false);
    } else {
      setIsAdmin(true);
    }
  }, []);

  useEffect(() => {
    if (rulesRes?.data?.salesCommissionPercentage !== undefined) {
      setSalesRate(rulesRes.data.salesCommissionPercentage);
    }
  }, [rulesRes]);

  const handleSaveSalesRate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingRate(true);
    try {
      await fetchApi('/hr/rules/commission', {
        method: 'POST',
        body: JSON.stringify({ salesCommissionPercentage: Number(salesRate) })
      });
      toast.success(`Sales commission share updated to ${salesRate}%`);
      mutateRules();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update sales commission rate');
    } finally {
      setIsSavingRate(false);
    }
  };

  const markAsPaid = async (id: string) => {
    try {
      await fetchApi(`/hr/commissions/${id}/pay`, {
        method: 'POST'
      });
      toast.success('Commission marked as paid');
      mutateCommissions();
    } catch (err: any) {
      toast.error(err.message || 'Error paying commission');
    }
  };

  const copyLink = () => {
    const code = stats?.referralCode || 'EMP-1';
    const url = `${window.location.origin}/contact?ref=${code}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success('Referral link copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 text-white">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Commissions & Referrals</h1>
          <p className="text-white/60 text-lg">
            {isAdmin ? 'Manage payout requests, sales commissions, and affiliate settings.' : 'Track your earnings and referral conversions.'}
          </p>
        </div>

        {isAdmin && (
          <form onSubmit={handleSaveSalesRate} className="bg-white/5 border border-white/10 p-4 rounded-xl flex items-center gap-3">
            <div>
              <label className="block text-[10px] font-bold text-purple-400 uppercase tracking-widest">Sales Commission Share %</label>
              <div className="flex items-center gap-1 mt-1">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={salesRate}
                  onChange={e => setSalesRate(parseFloat(e.target.value))}
                  className="w-20 bg-black/60 border border-white/10 rounded-lg px-3 py-1.5 text-sm font-bold text-white text-center focus:outline-none focus:border-purple-400"
                />
                <span className="text-sm font-bold text-white/70">%</span>
              </div>
            </div>
            <button
              type="submit"
              disabled={isSavingRate}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg text-xs transition-colors shadow-sm disabled:opacity-50 flex items-center gap-1.5"
            >
              {isSavingRate ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Save %"}
            </button>
          </form>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-xl bg-black/40 border border-white/10 p-6 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative z-10 flex items-center gap-4">
            <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-xl">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-white/60 mb-1">Total Paid</p>
              <div className="flex items-baseline gap-1">
                <IndianRupee className="w-5 h-5 text-emerald-400" />
                <span className="text-3xl font-bold text-white">{(stats?.totalEarnings || 0).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-black/40 border border-white/10 p-6 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative z-10 flex items-center gap-4">
            <div className="p-3 bg-amber-500/20 text-amber-400 rounded-xl">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-white/60 mb-1">Pending Payout</p>
              <div className="flex items-baseline gap-1">
                <IndianRupee className="w-5 h-5 text-amber-400" />
                <span className="text-3xl font-bold text-white">{(stats?.pendingEarnings || 0).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/30 p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Trophy className="w-24 h-24" />
          </div>
          <div className="relative z-10">
            <p className="text-sm text-purple-300 font-medium mb-2 uppercase tracking-wider">Your Referral Link</p>
            <div className="flex items-center gap-2 bg-black/50 p-2 rounded-lg border border-purple-500/30">
              <span className="text-white/80 font-mono text-sm truncate flex-1 pl-2">
                {typeof window !== 'undefined' ? `${window.location.origin}/contact?ref=${stats?.referralCode || 'EMP-1'}` : ''}
              </span>
              <button 
                onClick={copyLink}
                className="px-3 py-1 rounded-md hover:bg-purple-500/20 text-purple-400 shrink-0 transition-colors"
              >
                {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Commissions List */}
      <div className="rounded-xl bg-black/40 border border-white/10 overflow-hidden">
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-400" />
            Recent Activity
          </h2>
        </div>
        
        <div className="divide-y divide-white/10">
          {commissions.length === 0 ? (
            <div className="p-12 text-center text-white/40">
              <Share2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No referrals or commissions found.</p>
              <p className="text-sm mt-1">Share your link to start earning!</p>
            </div>
          ) : (
            commissions.map((c, idx) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                key={c.id} 
                className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl mt-1 ${c.status === 'PAID' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                    {c.status === 'PAID' ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-medium text-white text-lg">
                        {c.lead?.name || 'Unknown Client'}
                      </h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs border ${c.status === 'PAID' ? 'border-emerald-500/30 text-emerald-400' : 'border-amber-500/30 text-amber-400'}`}>
                        {c.status}
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm text-white/50">
                      {c.lead?.company && (
                        <span className="flex items-center gap-1">
                          <Building className="w-4 h-4" /> {c.lead.company}
                        </span>
                      )}
                      {isAdmin && c.employee && (
                        <span className="flex items-center gap-1 text-purple-400">
                          <User className="w-4 h-4" /> 
                          {c.employee.user.firstName} {c.employee.user.lastName}
                        </span>
                      )}
                      <span>
                        {new Date(c.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {c.notes && (
                      <p className="text-sm text-white/40 mt-2 bg-white/5 px-3 py-1.5 rounded-md inline-block">
                        {c.notes}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-6 pl-16 md:pl-0">
                  <div className="text-right">
                    <p className="text-xs text-white/50 mb-1">Commission</p>
                    <div className="flex items-center justify-end text-xl font-bold text-white">
                      <IndianRupee className="w-4 h-4" />
                      {c.amount.toLocaleString()}
                    </div>
                  </div>
                  
                  {isAdmin && c.status === 'PENDING' && (
                    <button 
                      onClick={() => markAsPaid(c.id)}
                      className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-medium shadow-lg shadow-emerald-500/20 transition-colors"
                    >
                      Mark Paid
                    </button>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

