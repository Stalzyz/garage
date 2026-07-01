"use client";

import { useEffect, useState } from "react";
import { ApiClient } from "@/lib/api";
import { Loader2, DollarSign, CheckCircle } from "lucide-react";

const TAX_MODELS = ['GST', 'VAT', 'NONE'] as const;
const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
];

export default function FinanceSettingsPage() {
  const [settings, setSettings] = useState<any>(null);
  const [currencies, setCurrencies] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    ApiClient.get("/settings/finance").then((data) => {
      setCurrencies(data.currencies || []);
      setSettings(data);
    });
  }, []);

  const handleCurrencyChange = (code: string) => {
    const cur = currencies.find(c => c.code === code);
    if (cur) setSettings({ ...settings, baseCurrency: cur.code, currencySymbol: cur.symbol });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await ApiClient.patch("/settings/finance", {
        baseCurrency: settings.baseCurrency,
        currencySymbol: settings.currencySymbol,
        taxModel: settings.taxModel,
        gstNumber: settings.gstNumber,
        vatNumber: settings.vatNumber,
        fiscalYearStart: settings.fiscalYearStart,
        invoicePrefix: settings.invoicePrefix,
      });
      setSettings({ ...updated, currencies });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  if (!settings) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-[#666]" /></div>;

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
          <DollarSign className="w-7 h-7 text-emerald-400" /> Finance & Currency
        </h1>
        <p className="text-[#a1a1aa] mt-2">Configure currency, tax model, and invoice numbering for your OS instance.</p>
      </div>

      <div className="space-y-6">
        <div className="bg-[#111111] border border-[#222] rounded-xl p-6">
          <h2 className="text-base font-semibold text-white mb-5">Currency</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-sm text-[#a1a1aa]">Base Currency</label>
              <select
                value={settings.baseCurrency}
                onChange={(e) => handleCurrencyChange(e.target.value)}
                className="w-full bg-[#050505] border border-[#333] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500"
              >
                {currencies.map(c => (
                  <option key={c.code} value={c.code}>{c.symbol} — {c.name} ({c.code})</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-[#a1a1aa]">Currency Symbol</label>
              <input
                type="text"
                value={settings.currencySymbol || ""}
                onChange={(e) => setSettings({ ...settings, currencySymbol: e.target.value })}
                className="w-full bg-[#050505] border border-[#333] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
          </div>
        </div>

        <div className="bg-[#111111] border border-[#222] rounded-xl p-6">
          <h2 className="text-base font-semibold text-white mb-5">Tax Model</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
            {TAX_MODELS.map(m => (
              <button
                key={m}
                onClick={() => setSettings({ ...settings, taxModel: m })}
                className={`p-4 rounded-xl border text-sm font-medium transition-all ${
                  settings.taxModel === m
                    ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                    : 'border-[#333] text-[#a1a1aa] hover:border-[#555]'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
          {settings.taxModel === 'GST' && (
            <div className="space-y-2">
              <label className="text-sm text-[#a1a1aa]">GST Number (GSTIN)</label>
              <input
                type="text"
                value={settings.gstNumber || ""}
                onChange={(e) => setSettings({ ...settings, gstNumber: e.target.value })}
                className="w-full bg-[#050505] border border-[#333] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 font-mono uppercase"
                placeholder="22AAAAA0000A1Z5"
              />
            </div>
          )}
          {settings.taxModel === 'VAT' && (
            <div className="space-y-2">
              <label className="text-sm text-[#a1a1aa]">VAT Number</label>
              <input
                type="text"
                value={settings.vatNumber || ""}
                onChange={(e) => setSettings({ ...settings, vatNumber: e.target.value })}
                className="w-full bg-[#050505] border border-[#333] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 font-mono"
                placeholder="GB123456789"
              />
            </div>
          )}
        </div>

        <div className="bg-[#111111] border border-[#222] rounded-xl p-6">
          <h2 className="text-base font-semibold text-white mb-5">Invoice Numbering</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-sm text-[#a1a1aa]">Invoice Prefix</label>
              <input
                type="text"
                value={settings.invoicePrefix || "INV"}
                onChange={(e) => setSettings({ ...settings, invoicePrefix: e.target.value })}
                className="w-full bg-[#050505] border border-[#333] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500"
                placeholder="INV"
              />
              <p className="text-xs text-[#555]">Preview: {settings.invoicePrefix || 'INV'}-{new Date().getFullYear()}-0001</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-[#a1a1aa]">Fiscal Year Start</label>
              <select
                value={settings.fiscalYearStart}
                onChange={(e) => setSettings({ ...settings, fiscalYearStart: parseInt(e.target.value) })}
                className="w-full bg-[#050505] border border-[#333] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500"
              >
                {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> :
             saved ? <><CheckCircle className="w-4 h-4" /> Saved!</> :
             'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
