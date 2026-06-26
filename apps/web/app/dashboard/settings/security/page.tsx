"use client";

import { useState } from "react";
import { ApiClient } from "@/lib/api";
import { Shield, QrCode, Key, CheckCircle, Loader2, Copy, AlertTriangle } from "lucide-react";

type Step = "idle" | "setup" | "verify" | "done";

export default function TwoFASettingsPage() {
  const [step, setStep] = useState<Step>("idle");
  const [qrCode, setQrCode] = useState("");
  const [secret, setSecret] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSetup = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await ApiClient.post("/auth/2fa/setup", {});
      setQrCode(data.qrCode);
      setSecret(data.secret);
      setBackupCodes(data.backupCodes);
      setStep("setup");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (code.length !== 6) return;
    setLoading(true);
    setError("");
    try {
      await ApiClient.post("/auth/2fa/verify", { code });
      setStep("done");
    } catch (e: any) {
      setError("Invalid code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
          <Shield className="w-7 h-7 text-emerald-400" /> Two-Factor Authentication
        </h1>
        <p className="text-[#a1a1aa] mt-2">Add an extra layer of security to your account using an authenticator app.</p>
      </div>

      {step === "idle" && (
        <div className="bg-[#111] border border-[#222] rounded-xl p-6 space-y-5">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
              <QrCode className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-medium text-white mb-1">Authenticator App</h3>
              <p className="text-sm text-[#666]">Use Google Authenticator, Authy, or any TOTP app. Scan the QR code and enter the 6-digit code to enable.</p>
            </div>
          </div>
          <button onClick={handleSetup} disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Shield className="w-4 h-4" /> Enable 2FA</>}
          </button>
        </div>
      )}

      {step === "setup" && (
        <div className="space-y-5">
          <div className="bg-[#111] border border-[#222] rounded-xl p-6 text-center">
            <p className="text-sm text-[#a1a1aa] mb-4">Scan this QR code with your authenticator app:</p>
            {qrCode && <img src={qrCode} alt="QR Code" className="mx-auto w-48 h-48 rounded-lg" />}
            <div className="mt-4 bg-[#0a0a0a] border border-[#222] rounded-lg px-4 py-2 flex items-center justify-between gap-3">
              <code className="text-xs text-emerald-400 font-mono break-all">{secret}</code>
              <button onClick={() => navigator.clipboard.writeText(secret)} className="text-[#555] hover:text-white transition-colors shrink-0">
                <Copy className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-[#444] mt-2">Or enter the key manually in your app.</p>
          </div>

          <div className="bg-[#111] border border-amber-500/20 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <p className="text-sm font-medium text-amber-400">Save your backup codes</p>
            </div>
            <div className="grid grid-cols-2 gap-2 mb-3">
              {backupCodes.map(c => (
                <code key={c} className="text-xs font-mono bg-[#0a0a0a] border border-[#222] px-3 py-1.5 rounded text-center text-[#a1a1aa]">{c}</code>
              ))}
            </div>
            <p className="text-xs text-[#555]">Store these in a safe place. Each can only be used once if you lose your phone.</p>
          </div>

          <div className="bg-[#111] border border-[#222] rounded-xl p-5">
            <label className="text-sm text-[#a1a1aa] block mb-2">Enter the 6-digit code from your app:</label>
            <div className="flex gap-3">
              <input
                type="text"
                value={code}
                onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                onKeyDown={e => e.key === 'Enter' && handleVerify()}
                className="flex-1 bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-2.5 text-white font-mono text-xl tracking-widest text-center focus:outline-none focus:border-emerald-500"
                placeholder="000000"
                maxLength={6}
              />
              <button onClick={handleVerify} disabled={loading || code.length !== 6} className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verify'}
              </button>
            </div>
            {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
          </div>
        </div>
      )}

      {step === "done" && (
        <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-8 text-center">
          <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">2FA Enabled!</h3>
          <p className="text-sm text-[#a1a1aa]">Your account is now protected with two-factor authentication. You will be asked for your code on every sign-in.</p>
        </div>
      )}
    </div>
  );
}
