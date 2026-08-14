"use client";

import React, { useState } from 'react';
import { fetchApi } from '@/lib/useApi';
import { X, CreditCard, Landmark, Send, Loader2, Copy, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface PaymentModalProps {
  invoiceId: string;
  amount: number;
  currency: string;
  onClose: () => void;
  onSuccess: () => void;
  onPayWithGateway: (invoiceId: string) => void;
}

export function PaymentModal({ invoiceId, amount, currency, onClose, onSuccess, onPayWithGateway }: PaymentModalProps) {
  const [method, setMethod] = useState<'gateway' | 'bank' | null>(null);
  const [reference, setReference] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  // Hardcoded for now; can be fetched from org settings in future
  const bankDetails = {
    name: "Grekam Visuals Pvt. Ltd.",
    account: "123456789012",
    ifsc: "HDFC0001234",
    bank: "HDFC Bank, Indiranagar"
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleManualSubmit = async () => {
    if (!reference.trim()) {
      toast.error("Please enter a transaction reference number.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      await fetchApi(`/finance/invoices/${invoiceId}/payments`, {
        method: 'POST',
        body: JSON.stringify({
          amount,
          method: 'BANK_TRANSFER',
          transactionId: reference,
          notes: "Manual bank transfer submitted by client."
        })
      });
      
      toast.success("Payment reference submitted for verification!");
      onSuccess();
    } catch (err: any) {
      toast.error(err.message || "Failed to submit payment reference.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md bg-[#111] rounded-2xl shadow-2xl border border-white/10 overflow-hidden relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-white/5 hover:bg-white/10 rounded-full text-white/50 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-6 border-b border-white/5 bg-gradient-to-br from-violet-500/10 to-transparent">
          <h2 className="text-xl font-bold text-white mb-1">Select Payment Method</h2>
          <p className="text-sm text-white/50">Amount due: <span className="font-bold text-emerald-400">{currency}{amount.toLocaleString()}</span></p>
        </div>

        <div className="p-6 space-y-4">
          {!method && (
            <div className="space-y-3">
              <button 
                onClick={() => {
                  onClose();
                  onPayWithGateway(invoiceId);
                }}
                className="w-full flex items-center p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-violet-500/10 hover:border-violet-500/30 transition-all text-left group"
              >
                <div className="w-10 h-10 rounded-full bg-violet-500/20 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                  <CreditCard className="w-5 h-5 text-violet-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Pay Online</h3>
                  <p className="text-xs text-white/40 mt-1">Cards, UPI, Netbanking, Wallets</p>
                </div>
              </button>

              <button 
                onClick={() => setMethod('bank')}
                className="w-full flex items-center p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-emerald-500/10 hover:border-emerald-500/30 transition-all text-left group"
              >
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                  <Landmark className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Manual Bank Transfer</h3>
                  <p className="text-xs text-white/40 mt-1">NEFT / RTGS / IMPS</p>
                </div>
              </button>
            </div>
          )}

          {method === 'bank' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="bg-[#1a1a24] p-5 rounded-xl border border-white/5 space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-white/5">
                  <span className="text-xs text-white/40">Account Name</span>
                  <span className="text-sm font-semibold text-white">{bankDetails.name}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-white/5">
                  <span className="text-xs text-white/40">Account No.</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono text-white">{bankDetails.account}</span>
                    <button onClick={() => handleCopy(bankDetails.account)} className="text-white/40 hover:text-white transition-colors">
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-white/5">
                  <span className="text-xs text-white/40">IFSC Code</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono text-white">{bankDetails.ifsc}</span>
                    <button onClick={() => handleCopy(bankDetails.ifsc)} className="text-white/40 hover:text-white transition-colors">
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-white/40">Bank</span>
                  <span className="text-sm text-white">{bankDetails.bank}</span>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-semibold text-white/60">Transaction Reference / UTR Number</label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    placeholder="Enter UTR or Ref number"
                    className="w-full bg-[#1a1a24] border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  onClick={() => setMethod(null)}
                  className="flex-1 py-3 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-white text-sm font-medium transition-colors"
                >
                  Back
                </button>
                <button 
                  onClick={handleManualSubmit}
                  disabled={isSubmitting || !reference.trim()}
                  className="flex-1 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold flex items-center justify-center gap-2 transition-colors"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Submit Ref
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
