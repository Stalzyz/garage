"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AlertCircle, ArrowLeft, Calculator, CheckCircle2, ExternalLink, IndianRupee, Layers, Percent, RotateCcw, Save, ShieldCheck, Sliders } from "lucide-react";
import {
  CalculatorConfig,
  DEFAULT_CALCULATOR_CONFIG
} from '@/lib/calculator/calculator-config';

export default function CalculatorSettingsAdminPage() {
  const [config, setConfig] = useState<CalculatorConfig>(DEFAULT_CALCULATOR_CONFIG);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'packages' | 'features' | 'addons' | 'rules'>('packages');

  useEffect(() => {
    fetch('/api/calculator/config')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.config) {
          setConfig(data.config);
        }
        setIsLoading(false);
      })
      .catch(err => {
        console.error(err);
        setIsLoading(false);
      });
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setSavedSuccess(false);
    try {
      const res = await fetch('/api/calculator/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      const data = await res.json();
      if (data.success) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      } else {
        alert(data.error || 'Failed to save settings');
      }
    } catch (err) {
      console.error(err);
      alert('Error saving calculator configuration');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetToDefaults = () => {
    if (confirm('Are you sure you want to reset all calculator prices to factory defaults?')) {
      setConfig(DEFAULT_CALCULATOR_CONFIG);
    }
  };

  if (isLoading) {
    return (
      <div className="p-12 flex flex-col items-center justify-center min-h-[50vh]">
        <div className="w-10 h-10 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-400 text-sm font-mono">Loading Calculator Settings...</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 text-slate-800">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link
              href="/dashboard/cms"
              className="text-xs font-mono text-slate-500 hover:text-slate-900 flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to CMS
            </Link>
            <span className="text-slate-300">•</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
              PRICING ENGINE
            </span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
            <Calculator className="w-8 h-8 text-emerald-600" />
            Website Cost Calculator Settings
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">
            Configure live package prices, feature add-ons, multipliers, and GST rules for the customer-facing calculator.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* There is no /agency/calculator route anywhere in the app — this link
              was a verified HTTP 404. The calculator config API
              (/api/calculator/config) exists but no page renders it, so the
              button is shown disabled rather than linking nowhere. */}
          <span
            title="No calculator page exists yet — build app/agency/calculator/page.tsx to enable this."
            className="px-4 py-2.5 bg-slate-100 text-slate-400 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-not-allowed"
          >
            <span>Preview Calculator</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </span>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            {isSaving ? (
              <span>Saving...</span>
            ) : savedSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Saved!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save All Changes</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 space-x-4">
        {[
          { id: 'packages', label: '1. Website Types & Pages' },
          { id: 'features', label: '2. Features & E-commerce' },
          { id: 'addons', label: '3. Integrations & Services' },
          { id: 'rules', label: '4. GST & Multipliers' },
        ].map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-3 text-xs md:text-sm font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
              activeTab === tab.id
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: PACKAGES & PAGES */}
      {activeTab === 'packages' && (
        <div className="space-y-8">
          {/* Website Packages */}
          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <span>Base Website Starting Prices (₹)</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {config.websiteTypes.map((pkg, idx) => (
                <div key={pkg.id} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-900">{pkg.title}</span>
                    <span className="text-xs font-mono text-slate-400 uppercase">{pkg.id}</span>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 block mb-1">Starting Price (₹)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-sm">₹</span>
                      <input
                        type="number"
                        value={pkg.startingPrice}
                        onChange={e => {
                          const val = Number(e.target.value);
                          setConfig(prev => {
                            const updated = [...prev.websiteTypes];
                            updated[idx].startingPrice = val;
                            return { ...prev, websiteTypes: updated };
                          });
                        }}
                        className="w-full pl-8 pr-3 py-2 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 block mb-1">Included Base Pages</label>
                    <input
                      type="number"
                      value={pkg.includedPages}
                      onChange={e => {
                        const val = Number(e.target.value);
                        setConfig(prev => {
                          const updated = [...prev.websiteTypes];
                          updated[idx].includedPages = val;
                          return { ...prev, websiteTypes: updated };
                        });
                      }}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm text-slate-800 outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Design Caliber Tiers */}
          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-4">Design Style Add-on Rates (₹)</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {config.designTiers.map((d, idx) => (
                <div key={d.id} className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
                  <span className="font-bold text-sm text-slate-900">{d.title}</span>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-sm">₹</span>
                    <input
                      type="number"
                      value={d.price}
                      onChange={e => {
                        const val = Number(e.target.value);
                        setConfig(prev => {
                          const updated = [...prev.designTiers];
                          updated[idx].price = val;
                          return { ...prev, designTiers: updated };
                        });
                      }}
                      className="w-full pl-8 pr-3 py-2 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: FEATURES & E-COMMERCE */}
      {activeTab === 'features' && (
        <div className="space-y-8">
          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-4">Core Website Features (₹)</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {config.features.map((f, idx) => (
                <div key={f.id} className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-between gap-3">
                  <div className="flex-1">
                    <div className="text-xs font-bold text-slate-800 truncate">{f.title}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{f.id}</div>
                  </div>
                  <div className="w-28 relative shrink-0">
                    <span className="absolute left-2.5 top-2 text-slate-400 font-bold text-xs">₹</span>
                    <input
                      type="number"
                      value={f.price}
                      onChange={e => {
                        const val = Number(e.target.value);
                        setConfig(prev => {
                          const updated = [...prev.features];
                          updated[idx].price = val;
                          return { ...prev, features: updated };
                        });
                      }}
                      className="w-full pl-6 pr-2 py-1.5 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-4">E-commerce Specific Modules (₹)</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {config.ecommerceFeatures.map((ef, idx) => (
                <div key={ef.id} className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-between gap-3">
                  <div className="flex-1">
                    <div className="text-xs font-bold text-slate-800 truncate">{ef.title}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{ef.id}</div>
                  </div>
                  <div className="w-28 relative shrink-0">
                    <span className="absolute left-2.5 top-2 text-slate-400 font-bold text-xs">₹</span>
                    <input
                      type="number"
                      value={ef.price}
                      onChange={e => {
                        const val = Number(e.target.value);
                        setConfig(prev => {
                          const updated = [...prev.ecommerceFeatures];
                          updated[idx].price = val;
                          return { ...prev, ecommerceFeatures: updated };
                        });
                      }}
                      className="w-full pl-6 pr-2 py-1.5 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: INTEGRATIONS & SERVICES */}
      {activeTab === 'addons' && (
        <div className="space-y-8">
          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-4">Integrations (₹)</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {config.integrations.map((item, idx) => (
                <div key={item.id} className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-between gap-3">
                  <div className="flex-1">
                    <div className="text-xs font-bold text-slate-800 truncate">{item.title}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{item.id}</div>
                  </div>
                  <div className="w-28 relative shrink-0">
                    <span className="absolute left-2.5 top-2 text-slate-400 font-bold text-xs">₹</span>
                    <input
                      type="number"
                      value={item.price}
                      onChange={e => {
                        const val = Number(e.target.value);
                        setConfig(prev => {
                          const updated = [...prev.integrations];
                          updated[idx].price = val;
                          return { ...prev, integrations: updated };
                        });
                      }}
                      className="w-full pl-6 pr-2 py-1.5 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-4">Branding Packages (₹)</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {config.brandingOptions.map((b, idx) => (
                <div key={b.id} className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-2">
                  <span className="font-bold text-xs text-slate-800 block">{b.title}</span>
                  <div className="relative">
                    <span className="absolute left-2.5 top-2 text-slate-400 font-bold text-xs">₹</span>
                    <input
                      type="number"
                      value={b.price}
                      onChange={e => {
                        const val = Number(e.target.value);
                        setConfig(prev => {
                          const updated = [...prev.brandingOptions];
                          updated[idx].price = val;
                          return { ...prev, brandingOptions: updated };
                        });
                      }}
                      className="w-full pl-6 pr-2 py-1.5 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-4">Maintenance Retainer Tiers (₹ / month)</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {config.maintenanceOptions.map((m, idx) => (
                <div key={m.id} className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-2">
                  <span className="font-bold text-xs text-slate-800 block">{m.title}</span>
                  <div className="relative">
                    <span className="absolute left-2.5 top-2 text-slate-400 font-bold text-xs">₹</span>
                    <input
                      type="number"
                      value={m.price}
                      onChange={e => {
                        const val = Number(e.target.value);
                        setConfig(prev => {
                          const updated = [...prev.maintenanceOptions];
                          updated[idx].price = val;
                          return { ...prev, maintenanceOptions: updated };
                        });
                      }}
                      className="w-full pl-6 pr-2 py-1.5 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: RULES & GST */}
      {activeTab === 'rules' && (
        <div className="space-y-6 max-w-2xl">
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Percent className="w-5 h-5 text-emerald-600" />
              <span>Tax & Enterprise Rules</span>
            </h2>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                GST Rate (% applied when GST toggle is ON)
              </label>
              <input
                type="number"
                step="0.01"
                value={Math.round(config.gstRate * 100)}
                onChange={e => {
                  const percent = Number(e.target.value);
                  setConfig(prev => ({ ...prev, gstRate: percent / 100 }));
                }}
                className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 outline-none focus:border-emerald-500"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">Default: 18%</span>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Custom Project Threshold (₹)
              </label>
              <input
                type="number"
                value={config.customProjectThreshold}
                onChange={e => {
                  const val = Number(e.target.value);
                  setConfig(prev => ({ ...prev, customProjectThreshold: val }));
                }}
                className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 outline-none focus:border-emerald-500"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Quotes exceeding this amount will display "CUSTOM PROJECT — Starting from ₹2,50,000" rather than a fixed estimate.
              </span>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={handleResetToDefaults}
                className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset to Factory Defaults</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
