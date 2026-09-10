'use client';

import { useState, useEffect } from 'react';
import { Modal } from './modal';
import { MessageSquare, Send, CheckCircle2, AlertCircle, Loader2, Phone, User, FileText, ExternalLink, Sparkles, CheckCheck } from 'lucide-react';
import { fetchApi, useApi } from '@/lib/useApi';
import { toast } from 'sonner';

export interface WhatsAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultPhone?: string;
  defaultName?: string;
  defaultTemplateId?: string;
  defaultVariables?: Record<string, string>;
  onSuccess?: () => void;
}

export interface TemplateDef {
  id: string;
  name: string;
  templateName: string;
  category: 'FINANCE' | 'CRM' | 'ACADEMY' | 'GENERAL';
  event: string;
  description: string;
  variables: { name: string; label: string; placeholder: string }[];
  bodyPattern: string;
  headerType?: 'DOCUMENT' | 'IMAGE' | 'NONE';
  buttons?: string[];
}

const FALLBACK_TEMPLATES: TemplateDef[] = [
  {
    id: 'invoice_generated_v1',
    name: 'Tax Invoice Notification',
    templateName: 'invoice_generated_v1',
    category: 'FINANCE',
    event: 'INVOICE_GENERATED',
    description: 'Send tax invoice notification to client with invoice number & total amount',
    headerType: 'DOCUMENT',
    variables: [
      { name: 'clientName', label: 'Client Name', placeholder: 'Stalin Kumar' },
      { name: 'invoiceNumber', label: 'Invoice Number', placeholder: 'INV-839210' },
      { name: 'totalAmount', label: 'Total Amount', placeholder: '₹25,000.00' }
    ],
    bodyPattern: 'Hello {{1}},\n\nYour tax invoice #{{2}} for {{3}} has been generated and is ready for payment.\n\nThank you for choosing Grekam Visuals!',
    buttons: ['View Invoice', 'Pay Online']
  },
  {
    id: 'lead_welcome_v1',
    name: 'New Lead Welcome & Introduction',
    templateName: 'lead_welcome_v1',
    category: 'CRM',
    event: 'LEAD_CREATED',
    description: 'Welcome new lead inquiry and share company portfolio link',
    headerType: 'NONE',
    variables: [
      { name: 'leadName', label: 'Lead Name', placeholder: 'Stalin Kumar' },
      { name: 'serviceInterest', label: 'Service / Requirement', placeholder: 'Next.js App & AI Bot' }
    ],
    bodyPattern: 'Hi {{1}},\n\nThank you for reaching out to Grekam Visuals regarding {{2}}!\n\nOur agency team is reviewing your requirements and will connect with you shortly.\n\nExplore our portfolio: https://agency.grekam.in',
    buttons: ['Call Support', 'View Portfolio']
  },
  {
    id: 'proposal_sent_v1',
    name: 'Project Proposal & Quote Shared',
    templateName: 'proposal_sent_v1',
    category: 'CRM',
    event: 'PROPOSAL_SHARED',
    description: 'Notify lead about new project proposal and scope breakdown',
    headerType: 'DOCUMENT',
    variables: [
      { name: 'clientName', label: 'Client / Lead Name', placeholder: 'Stalin Kumar' },
      { name: 'projectName', label: 'Project Name', placeholder: 'Custom E-Commerce Platform' },
      { name: 'amount', label: 'Proposal Value', placeholder: '₹75,000.00' }
    ],
    bodyPattern: 'Hi {{1}},\n\nWe have prepared the proposal for your project *{{2}}* valued at {{3}}.\n\nPlease review it at your convenience and let us know your feedback!',
    buttons: ['Review Proposal']
  },
  {
    id: 'payment_reminder_v1',
    name: 'Payment Due Reminder',
    templateName: 'payment_reminder_v1',
    category: 'FINANCE',
    event: 'PAYMENT_REMINDER',
    description: 'Send payment reminder for pending invoices before due date',
    headerType: 'NONE',
    variables: [
      { name: 'clientName', label: 'Client Name', placeholder: 'Stalin Kumar' },
      { name: 'invoiceNumber', label: 'Invoice Number', placeholder: 'INV-839210' },
      { name: 'amount', label: 'Due Amount', placeholder: '₹25,000.00' },
      { name: 'dueDate', label: 'Due Date', placeholder: '25 Sep 2026' }
    ],
    bodyPattern: 'Hi {{1}},\n\nThis is a friendly reminder that invoice #{{2}} for {{3}} is due on {{4}}.\n\nPlease click below to complete the payment seamlessly.',
    buttons: ['Pay Invoice']
  },
  {
    id: 'walkin_welcome_v1',
    name: 'Academy Walk-In Welcome',
    templateName: 'walkin_welcome_v1',
    category: 'ACADEMY',
    event: 'WALKIN_REGISTERED',
    description: 'Greet new walk-in student visiting Grekam Academy',
    headerType: 'NONE',
    variables: [
      { name: 'studentName', label: 'Student Name', placeholder: 'Alex Martin' },
      { name: 'courseName', label: 'Course Interest', placeholder: 'Fullstack & AI Bootcamp' }
    ],
    bodyPattern: 'Welcome {{1}} to Grekam Academy!\n\nThank you for visiting our campus today to inquire about {{2}}.\n\nOur counselor will guide you through the syllabus & lab facilities.',
    buttons: ['Contact Counselor']
  }
];

export function WhatsAppModal({
  isOpen,
  onClose,
  defaultPhone = '',
  defaultName = '',
  defaultTemplateId = 'invoice_generated_v1',
  defaultVariables = {},
  onSuccess,
}: WhatsAppModalProps) {
  const { data: serverTemplates } = useApi<any>('/integrations/whatsapp/templates');
  const templates: TemplateDef[] = serverTemplates?.data || FALLBACK_TEMPLATES;

  const [phone, setPhone] = useState(defaultPhone);
  const [name, setName] = useState(defaultName);
  const [selectedTemplateId, setSelectedTemplateId] = useState(defaultTemplateId);
  const [variableValues, setVariableValues] = useState<Record<string, string>>(defaultVariables);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    setPhone(defaultPhone);
    setName(defaultName);
    if (defaultTemplateId) setSelectedTemplateId(defaultTemplateId);
  }, [defaultPhone, defaultName, defaultTemplateId]);

  useEffect(() => {
    // When selected template changes, pre-populate default variables if available
    const template = templates.find((t) => t.id === selectedTemplateId) || templates[0];
    if (template) {
      const initialVars: Record<string, string> = { ...defaultVariables };
      template.variables.forEach((v, idx) => {
        if (!initialVars[v.name]) {
          if (v.name === 'clientName' || v.name === 'leadName' || v.name === 'studentName') {
            initialVars[v.name] = name || v.placeholder;
          } else {
            initialVars[v.name] = defaultVariables[v.name] || v.placeholder;
          }
        }
      });
      setVariableValues(initialVars);
    }
  }, [selectedTemplateId, name]);

  if (!isOpen) return null;

  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId) || templates[0];

  // Helper to render preview body with variables replaced
  const renderPreviewBody = () => {
    if (!selectedTemplate) return '';
    let pattern = selectedTemplate.bodyPattern;
    selectedTemplate.variables.forEach((v, idx) => {
      const val = variableValues[v.name] || `[${v.label}]`;
      pattern = pattern.replace(new RegExp(`\\{\\{${idx + 1}\\}\\}`, 'g'), `*${val}*`);
    });
    return pattern;
  };

  const handleSend = async () => {
    if (!phone || phone.replace(/[^0-9]/g, '').length < 10) {
      return toast.error('Please enter a valid 10-digit phone number with country code');
    }
    if (!name.trim()) {
      return toast.error('Please enter the recipient name');
    }

    setIsSending(true);
    try {
      const formattedVars = selectedTemplate.variables.map(
        (v) => variableValues[v.name] || v.placeholder
      );

      const res = await fetchApi<any>('/integrations/whatsapp/send-template', {
        method: 'POST',
        body: JSON.stringify({
          phone,
          name,
          event: selectedTemplate.event,
          templateName: selectedTemplate.templateName,
          variables: formattedVars,
        }),
      });

      toast.success(`WhatsApp message sent to ${name} (${phone})!`);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to send WhatsApp message via Grafty');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Modal onClose={onClose}>
      <div className="w-[820px] max-w-full bg-[#0a0a0f] text-white rounded-2xl p-6 lg:p-8 border border-white/10 shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold flex items-center gap-2">
                Send WhatsApp Template <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono uppercase">Grafty Hub</span>
              </h2>
              <p className="text-xs text-white/50">Send 1-click official WhatsApp template to client via Grafty WABA engine</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Form Column (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* Recipient Details */}
            <div className="grid grid-cols-2 gap-3 bg-black/40 p-3.5 rounded-xl border border-white/10">
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-white/40 mb-1 flex items-center gap-1">
                  <User className="w-3 h-3 text-emerald-400" /> Recipient Name
                </label>
                <input
                  className="w-full bg-black/60 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-emerald-500 font-medium"
                  placeholder="e.g. Stalin Kumar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-white/40 mb-1 flex items-center gap-1">
                  <Phone className="w-3 h-3 text-emerald-400" /> Phone Number (with Country Code)
                </label>
                <input
                  className="w-full bg-black/60 border border-white/10 rounded-lg px-3 py-2 text-sm font-mono outline-none focus:border-emerald-500"
                  placeholder="e.g. 919840012345"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>

            {/* Template Selector */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-[10px] uppercase tracking-widest text-white/40 font-mono">
                  Select WhatsApp Template
                </label>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      const res = await fetchApi<any>('/integrations/whatsapp/templates');
                      toast.success('Meta Cloud API templates refreshed from Grafty!');
                    } catch (e: any) {
                      toast.error('Failed to sync templates from Meta Cloud API');
                    }
                  }}
                  className="text-[10px] font-mono text-emerald-400 hover:text-emerald-300 flex items-center gap-1 bg-emerald-500/10 hover:bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/30 transition-all"
                  title="Sync newly created templates from Meta Cloud API / Grafty workspace"
                >
                  <Sparkles className="w-3 h-3" /> Sync Meta Cloud Templates
                </button>
              </div>
              <select
                className="w-full bg-black/60 border border-emerald-500/30 rounded-xl px-3 py-2.5 text-sm font-semibold outline-none focus:border-emerald-500 text-emerald-300"
                value={selectedTemplateId}
                onChange={(e) => setSelectedTemplateId(e.target.value)}
              >
                {templates.map((t) => (
                  <option key={t.id} value={t.id} className="bg-slate-900 text-white">
                    [{t.category}] {t.name}
                  </option>
                ))}
              </select>
              {selectedTemplate && (
                <p className="text-[11px] text-white/40 mt-1 italic">{selectedTemplate.description}</p>
              )}
            </div>

            {/* Variable Inputs */}
            {selectedTemplate && selectedTemplate.variables.length > 0 && (
              <div className="space-y-3 bg-white/5 p-4 rounded-xl border border-white/10">
                <p className="text-[10px] uppercase tracking-widest text-emerald-400 font-mono flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Auto-Mapped Dynamic Variables
                </p>
                <div className="space-y-2.5">
                  {selectedTemplate.variables.map((v, idx) => (
                    <div key={v.name} className="flex justify-between items-center gap-3">
                      <label className="text-xs text-white/60 font-medium shrink-0 w-36">
                        {v.label} <span className="text-white/30 font-mono text-[10px]">({`{{${idx + 1}}}`})</span>:
                      </label>
                      <input
                        className="flex-1 bg-black/50 border border-white/10 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-emerald-500 text-white font-mono"
                        placeholder={v.placeholder}
                        value={variableValues[v.name] || ''}
                        onChange={(e) =>
                          setVariableValues({ ...variableValues, [v.name]: e.target.value })
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Right Phone Mockup Column (5 cols) */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center">
            
            <div className="w-full max-w-[320px] bg-[#0c1317] border border-white/20 rounded-[28px] p-3 shadow-2xl overflow-hidden text-left relative font-sans">
              
              {/* iPhone Notch & WhatsApp Header */}
              <div className="bg-[#1f2c34] -mx-3 -mt-3 p-3 text-white flex items-center gap-2.5 border-b border-white/10">
                <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-xs font-bold text-white shadow">
                  GV
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold truncate flex items-center gap-1">
                    Grekam Visuals <CheckCircle2 className="w-3 h-3 text-emerald-400 fill-emerald-400/20" />
                  </p>
                  <p className="text-[9px] text-emerald-400 font-mono">Official Business Account</p>
                </div>
              </div>

              {/* Chat Canvas */}
              <div className="py-4 space-y-2 text-xs">
                <div className="bg-[#005c4b] text-white p-3 rounded-2xl rounded-tr-none shadow-lg space-y-2 border border-emerald-500/20">
                  
                  {selectedTemplate?.headerType === 'DOCUMENT' && (
                    <div className="bg-black/30 p-2 rounded-lg flex items-center gap-2 border border-white/10">
                      <FileText className="w-5 h-5 text-emerald-300 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-bold truncate">Attachment_Document.pdf</p>
                        <p className="text-[8px] text-white/50">PDF Document • 1.2 MB</p>
                      </div>
                    </div>
                  )}

                  <div className="whitespace-pre-wrap text-[11px] leading-relaxed text-slate-100 font-sans">
                    {renderPreviewBody()}
                  </div>

                  <div className="flex justify-end items-center gap-1 text-[8px] text-white/50 pt-1">
                    <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    <CheckCheck className="w-3 h-3 text-emerald-400" />
                  </div>
                </div>

                {/* Buttons Preview */}
                {selectedTemplate?.buttons && selectedTemplate.buttons.length > 0 && (
                  <div className="space-y-1 pt-1">
                    {selectedTemplate.buttons.map((btn, i) => (
                      <div key={i} className="bg-[#1f2c34] text-emerald-400 font-semibold text-center text-[10px] py-2 px-3 rounded-xl border border-white/10 flex items-center justify-center gap-1">
                        <ExternalLink className="w-3 h-3" /> {btn}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <p className="text-[10px] text-white/40 mt-2 text-center">Live Preview (What recipient sees on WhatsApp)</p>

          </div>

        </div>

        {/* Footer Controls */}
        <div className="flex justify-between items-center pt-3 border-t border-white/10">
          <p className="text-[10px] text-white/40 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Powered by Grafty Meta Cloud API
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl text-xs font-medium transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSend}
              disabled={isSending}
              className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-black font-bold uppercase tracking-wider text-xs rounded-xl transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.3)] disabled:opacity-50"
            >
              {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {isSending ? 'Sending...' : 'Send WhatsApp Message'}
            </button>
          </div>
        </div>

      </div>
    </Modal>
  );
}
