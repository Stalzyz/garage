'use client';

import { useState, useEffect } from 'react';
import { Modal } from './modal';
import { MessageSquare, Send, CheckCircle2, AlertCircle, Loader2, Phone, User, FileText, ExternalLink, Sparkles, CheckCheck, Upload, Image as ImageIcon, Paperclip, FileUp, X } from 'lucide-react';
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
    id: 'grafty_welcome',
    name: 'Grafty Welcome & Inquiry Response',
    templateName: 'grafty_welcome',
    category: 'CRM',
    event: 'LEAD_CREATED',
    description: 'Welcome & introduction template without header attachment',
    headerType: 'NONE',
    variables: [
      { name: 'leadName', label: 'Lead / Client Name', placeholder: 'Stalin Kumar' },
      { name: 'serviceInterest', label: 'Service Interested', placeholder: 'Shopify / Web Development' }
    ],
    bodyPattern: 'Hi {{1}},\n\nThank you for reaching out to Grekam Visuals regarding {{2}}!\n\nOur agency team is reviewing your requirements and will connect with you shortly.\n\nPortfolio: https://agency.grekam.in',
    buttons: ['Call Support', 'View Portfolio']
  },
  {
    id: 'grafty_proposals',
    name: 'Grafty Proposals & Scope Breakdown',
    templateName: 'grafty_proposals',
    category: 'CRM',
    event: 'PROPOSAL_SHARED',
    description: 'Official Grafty Proposal & Quote template with PDF document header attachment',
    headerType: 'DOCUMENT',
    variables: [
      { name: 'clientName', label: 'Client / Lead Name', placeholder: 'Stalin Kumar' },
      { name: 'projectName', label: 'Project Name', placeholder: 'Custom E-Commerce Platform' },
      { name: 'amount', label: 'Proposal Value', placeholder: '₹75,000.00' }
    ],
    bodyPattern: 'Hi {{1}},\n\nWe have prepared the proposal for your project *{{2}}* valued at {{3}}.\n\nPlease review the proposal document attached above and let us know your thoughts!',
    buttons: ['Review Proposal']
  },
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
  defaultTemplateId = 'grafty_welcome',
  defaultVariables = {},
  onSuccess,
}: WhatsAppModalProps) {
  const { data: serverTemplates } = useApi<any>('/integrations/whatsapp/templates');
  const { data: statusData } = useApi<any>('/integrations/whatsapp/status');
  const templates: TemplateDef[] = serverTemplates?.data || FALLBACK_TEMPLATES;

  // Sort templates so verified active ones appear at the top
  const verifiedList = ['grafty_welcome', 'quick_call', 'grafty_proposals', 'welcome', 'grafty_image_proposal'];
  const sortedTemplates = [...templates].sort((a, b) => {
    const aVer = verifiedList.indexOf(a.templateName || a.id);
    const bVer = verifiedList.indexOf(b.templateName || b.id);
    const aScore = aVer >= 0 ? aVer : 99;
    const bScore = bVer >= 0 ? bVer : 99;
    return aScore - bScore;
  });

  const [phone, setPhone] = useState(defaultPhone);
  const [name, setName] = useState(defaultName);
  const [selectedTemplateId, setSelectedTemplateId] = useState(defaultTemplateId);
  const [variableValues, setVariableValues] = useState<Record<string, string>>(defaultVariables);
  const [mediaUrl, setMediaUrl] = useState<string>('');
  const [mediaSourceMode, setMediaSourceMode] = useState<'upload' | 'url'>('upload');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string>('');
  const [provider, setProvider] = useState<'grafty' | 'meta' | 'auto'>('auto');
  const [isSending, setIsSending] = useState(false);
  const [mismatchErrorNotice, setMismatchErrorNotice] = useState<string | null>(null);

  useEffect(() => {
    setPhone(defaultPhone);
    setName(defaultName);
    if (defaultTemplateId) {
      setSelectedTemplateId(defaultTemplateId);
    } else if (sortedTemplates.length > 0) {
      setSelectedTemplateId(sortedTemplates[0].id);
    }
  }, [defaultPhone, defaultName, defaultTemplateId]);

  useEffect(() => {
    // Reset any error notice when switching templates
    setMismatchErrorNotice(null);
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
      // Do NOT pre-populate mediaUrl with a hardcoded placeholder — it causes Meta URL-access errors.
      // The upload zone / URL field is already visible and clearly prompts the user.
    }
  }, [selectedTemplateId, name]);

  if (!isOpen) return null;

  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId) || templates[0];

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Local preview URL for instant UI response
    const localUrl = URL.createObjectURL(file);
    setLocalPreviewUrl(localUrl);
    setUploadedFileName(file.name);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api/v1';
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

      const res = await fetch(`${API_BASE}/storage/upload-local`, {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });

      if (!res.ok) {
        throw new Error(`Upload failed with status ${res.status}`);
      }

      const data = await res.json();
      if (data.downloadUrl) {
        setMediaUrl(data.downloadUrl);
        toast.success(`Uploaded "${file.name}" from local drive!`);
      } else {
        throw new Error('No download URL returned');
      }
    } catch (err: any) {
      console.error('File upload error:', err);
      toast.error(err.message || 'Failed to upload local file');
    } finally {
      setIsUploading(false);
    }
  };

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
    if (selectedTemplate?.headerType && selectedTemplate.headerType !== 'NONE' && !mediaUrl.trim()) {
      return toast.error(`Please provide or upload a ${selectedTemplate.headerType} file from your local drive`);
    }

    setIsSending(true);
    setMismatchErrorNotice(null);

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
          headerType: selectedTemplate.headerType,
          mediaUrl: mediaUrl.trim() || undefined,
          provider,
        }),
      });

      toast.success(`WhatsApp message sent to ${name} (${phone})!`);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      // Read structured error from API: { error, details, message }
      const responseBody = err?.response || {};
      let errMsg =
        responseBody?.details ||
        responseBody?.message ||
        responseBody?.error ||
        err?.message ||
        'Failed to send WhatsApp message';

      const is132012 =
        errMsg.includes('132012') ||
        errMsg.toLowerCase().includes('parameter format does not match') ||
        errMsg.toLowerCase().includes('param count') ||
        errMsg.toLowerCase().includes('whatsapp api rejection');

      if (is132012) {
        setMismatchErrorNotice(
          `The template "${selectedTemplate?.name || 'Selected Template'}" in Meta WhatsApp Manager has rigid/fixed parameters that do not match the request (#132012). ` +
          `Switch to "Grafty Proposals" or clear the media attachment and retry.`
        );
        errMsg = `Meta Template Mismatch (#132012): "${selectedTemplate?.name}" has rigid parameters. Use the quick-fix actions below.`;
      }
      toast.error(errMsg, { duration: 9000 });
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
              <p className="text-xs text-white/50">Send 1-click official WhatsApp template to client via Meta Cloud API or Grafty WABA engine</p>
            </div>
          </div>
          {/* Connection Status */}
          <div className="flex items-center gap-2">
            {statusData ? (
              statusData.overallReady ? (
                <span className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {statusData.meta?.ready ? 'Meta Cloud API' : 'Grafty'} Connected
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-red-400 bg-red-500/10 border border-red-500/30 px-2.5 py-1 rounded-full" title="Go to Settings → Integrations → META and add META_ACCESS_TOKEN + META_PHONE_NUMBER_ID">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                  Not Connected — See Settings
                </span>
              )
            ) : (
              <span className="flex items-center gap-1.5 text-[10px] font-mono text-white/40">
                <Loader2 className="w-3 h-3 animate-spin" /> Checking...
              </span>
            )}
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

            {/* Provider Selection */}
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-white/40 mb-1.5 font-mono">
                Sending Provider Engine
              </label>
              <div className="grid grid-cols-3 gap-2 bg-black/40 p-1.5 rounded-xl border border-white/10">
                <button
                  type="button"
                  onClick={() => setProvider('grafty')}
                  className={`py-1.5 px-2 rounded-lg text-xs font-semibold font-mono flex items-center justify-center gap-1 transition-all ${
                    provider === 'grafty'
                      ? 'bg-emerald-500 text-black shadow'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  Grafty WABA
                </button>
                <button
                  type="button"
                  onClick={() => setProvider('meta')}
                  className={`py-1.5 px-2 rounded-lg text-xs font-semibold font-mono flex items-center justify-center gap-1 transition-all ${
                    provider === 'meta'
                      ? 'bg-emerald-500 text-black shadow'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  Meta Direct
                </button>
                <button
                  type="button"
                  onClick={() => setProvider('auto')}
                  className={`py-1.5 px-2 rounded-lg text-xs font-semibold font-mono flex items-center justify-center gap-1 transition-all ${
                    provider === 'auto'
                      ? 'bg-emerald-500 text-black shadow'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  Auto Fallback
                </button>
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
                {sortedTemplates.map((t) => {
                  const isVerified = ['grafty_proposals', 'grafty_welcome', 'proposal_sent_v1', 'invoice_generated_v1', 'lead_welcome_v1', 'quick_call', 'welcome', 'test'].includes(t.templateName || t.id);
                  return (
                    <option key={t.id} value={t.id} className="bg-slate-900 text-white">
                      {isVerified ? '⚡ [VERIFIED LIVE] ' : ''}[{t.category}] {t.name}
                    </option>
                  );
                })}
              </select>
              {selectedTemplate && (
                <p className="text-[11px] text-white/40 mt-1 italic">{selectedTemplate.description}</p>
              )}
              {mismatchErrorNotice && (
                <div className="mt-3 bg-amber-500/10 border border-amber-500/30 p-3.5 rounded-xl text-amber-200 text-xs space-y-2 font-sans">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-amber-300">Meta Template Parameter Mismatch (#132012)</p>
                      <p className="text-[11px] text-amber-200/80 mt-0.5">{mismatchErrorNotice}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-1 font-mono">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedTemplateId('grafty_welcome');
                        setMismatchErrorNotice(null);
                        toast.info('Switched template to "Grafty Welcome"!');
                      }}
                      className="px-3 py-1 bg-emerald-500 text-black font-bold rounded-lg text-[11px] hover:bg-emerald-400 transition-all flex items-center gap-1 shadow"
                    >
                      <Sparkles className="w-3 h-3" /> Select "Grafty Welcome"
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMediaUrl('');
                        setLocalPreviewUrl('');
                        setUploadedFileName('');
                        setMismatchErrorNotice(null);
                        toast.info('Cleared media attachment. Try sending again!');
                      }}
                      className="px-3 py-1 bg-white/10 text-white rounded-lg text-[11px] hover:bg-white/20 transition-all"
                    >
                      Send Without Attachment
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Header Media Input (IMAGE / DOCUMENT / VIDEO) */}
            {selectedTemplate && selectedTemplate.headerType && selectedTemplate.headerType !== 'NONE' && (
              <div className="bg-emerald-500/10 p-3.5 rounded-xl border border-emerald-500/30 space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] uppercase tracking-widest text-emerald-400 font-mono font-bold flex items-center gap-1.5">
                    <FileUp className="w-3.5 h-3.5 text-emerald-400" />
                    Header {selectedTemplate.headerType} Attachment
                  </label>

                  <div className="flex items-center gap-1 bg-black/50 p-1 rounded-lg border border-white/10">
                    <button
                      type="button"
                      onClick={() => setMediaSourceMode('upload')}
                      className={`text-[9px] font-mono px-2 py-0.5 rounded transition-all ${
                        mediaSourceMode === 'upload'
                          ? 'bg-emerald-500 text-black font-bold'
                          : 'text-white/60 hover:text-white'
                      }`}
                    >
                      Local Drive File
                    </button>
                    <button
                      type="button"
                      onClick={() => setMediaSourceMode('url')}
                      className={`text-[9px] font-mono px-2 py-0.5 rounded transition-all ${
                        mediaSourceMode === 'url'
                          ? 'bg-emerald-500 text-black font-bold'
                          : 'text-white/60 hover:text-white'
                      }`}
                    >
                      Public Link URL
                    </button>
                  </div>
                </div>

                {mediaSourceMode === 'upload' ? (
                  <div className="space-y-2">
                    <label className="relative flex flex-col items-center justify-center p-4 border-2 border-dashed border-emerald-500/40 hover:border-emerald-400 bg-black/40 hover:bg-black/60 rounded-xl cursor-pointer transition-all group">
                      <input
                        type="file"
                        accept={
                          selectedTemplate.headerType === 'IMAGE'
                            ? 'image/*'
                            : 'application/pdf,image/*,application/msword'
                        }
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      {isUploading ? (
                        <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono">
                          <Loader2 className="w-4 h-4 animate-spin" /> Uploading file from local drive to server...
                        </div>
                      ) : uploadedFileName ? (
                        <div className="flex items-center gap-2 text-emerald-300 text-xs font-mono">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span className="font-bold underline truncate max-w-[240px]">{uploadedFileName}</span>
                          <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded">
                            Ready
                          </span>
                        </div>
                      ) : (
                        <div className="text-center space-y-1">
                          <Upload className="w-6 h-6 text-emerald-400 mx-auto group-hover:scale-110 transition-transform" />
                          <p className="text-xs font-semibold text-white">Click to Choose {selectedTemplate.headerType} from Local Drive</p>
                          <p className="text-[10px] text-white/40">PNG, JPG, WEBP, or PDF up to 50MB</p>
                        </div>
                      )}
                    </label>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <input
                      type="url"
                      className="w-full bg-black/70 border border-emerald-500/40 rounded-lg px-3 py-2 text-xs font-mono outline-none focus:border-emerald-400 text-white"
                      placeholder={
                        selectedTemplate.headerType === 'DOCUMENT'
                          ? 'https://agency.grekam.in/sample_proposal.pdf'
                          : 'https://agency.grekam.in/portfolio_showcase.png'
                      }
                      value={mediaUrl}
                      onChange={(e) => {
                        setMediaUrl(e.target.value);
                        setLocalPreviewUrl('');
                      }}
                    />
                  </div>
                )}

                <div className="flex items-center gap-2 pt-0.5">
                  <span className="text-[9px] text-white/40 font-mono">Presets:</span>
                  {selectedTemplate.headerType === 'DOCUMENT' ? (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setMediaUrl('https://agency.grekam.in/sample_proposal.pdf');
                          setLocalPreviewUrl('');
                          setUploadedFileName('sample_proposal.pdf');
                        }}
                        className="text-[9px] font-mono text-emerald-300 bg-white/5 hover:bg-white/10 px-2 py-0.5 rounded border border-white/10"
                      >
                        Proposal PDF
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setMediaUrl('https://agency.grekam.in/sample_invoice.pdf');
                          setLocalPreviewUrl('');
                          setUploadedFileName('sample_invoice.pdf');
                        }}
                        className="text-[9px] font-mono text-emerald-300 bg-white/5 hover:bg-white/10 px-2 py-0.5 rounded border border-white/10"
                      >
                        Tax Invoice PDF
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setMediaUrl('https://agency.grekam.in/portfolio_showcase.png');
                          setLocalPreviewUrl('');
                          setUploadedFileName('portfolio_showcase.png');
                        }}
                        className="text-[9px] font-mono text-emerald-300 bg-white/5 hover:bg-white/10 px-2 py-0.5 rounded border border-white/10"
                      >
                        Portfolio Image
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setMediaUrl('https://grafty.pro/grafty.svg');
                          setLocalPreviewUrl('');
                          setUploadedFileName('grafty.svg');
                        }}
                        className="text-[9px] font-mono text-emerald-300 bg-white/5 hover:bg-white/10 px-2 py-0.5 rounded border border-white/10"
                      >
                        Grafty Logo
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}

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
                        <p className="text-[10px] font-bold truncate">
                          {uploadedFileName || (mediaUrl ? mediaUrl.split('/').pop()?.split('?')[0] : 'Attachment_Document.pdf')}
                        </p>
                        <p className="text-[8px] text-white/50">PDF Document • Click to View</p>
                      </div>
                    </div>
                  )}

                  {selectedTemplate?.headerType === 'IMAGE' && (
                    <div className="bg-black/40 rounded-lg overflow-hidden border border-white/10 flex items-center justify-center min-h-[90px]">
                      {(localPreviewUrl || mediaUrl) ? (
                        <img
                          src={localPreviewUrl || mediaUrl}
                          alt="Header Image Preview"
                          className="w-full max-h-32 object-cover"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="p-3 text-center">
                          <Sparkles className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
                          <p className="text-[9px] text-white/50">Header Image Attachment</p>
                        </div>
                      )}
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
              disabled={isSending || isUploading}
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

