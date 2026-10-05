import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { CONFIG } from '../config/constants';
import {
  X,
  Mic,
  Square,
  Share2,
  CheckCircle2,
  ExternalLink,
  Code2,
  Layers,
  Calendar,
  DollarSign,
  FileText,
  CreditCard,
} from 'lucide-react-native';
import { sendWhatsAppMessage } from '../services/whatsapp';

interface VoiceSOWModalProps {
  visible: boolean;
  onClose: () => void;
  defaultClient?: string;
  defaultPhone?: string;
  onOpenInvoice?: (clientName: string, amount: string) => void;
}

interface SOWMilestone {
  title: string;
  duration: string;
  deliverables: string;
  amount: string;
}

interface GeneratedSOW {
  proposalId: string;
  clientName: string;
  scopeSummary: string;
  techStack: string[];
  totalBudget: string;
  depositAmount: string;
  milestones: SOWMilestone[];
  proposalUrl: string;
}

export function VoiceSOWModal({
  visible,
  onClose,
  defaultClient = '',
  defaultPhone = '',
  onOpenInvoice,
}: VoiceSOWModalProps) {
  const [clientName, setClientName] = useState(defaultClient || 'Nexus Capital');
  const [clientPhone, setClientPhone] = useState(defaultPhone || '+919876543210');
  const [discoveryNotes, setDiscoveryNotes] = useState(
    'Client wants full-stack SaaS trading dashboard with Next.js 15, Fastify REST APIs, real-time WebSockets, and Razorpay/Stripe billing. Target launch in 30 days.'
  );
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedSOW, setGeneratedSOW] = useState<GeneratedSOW | null>(null);

  // Toggle voice memo recording
  const handleToggleRecord = () => {
    if (!isRecording) {
      setIsRecording(true);
      setRecordingSeconds(0);
    } else {
      setIsRecording(false);
      setDiscoveryNotes(
        (prev) =>
          prev +
          '\n\n[Voice Memo Transcribed]: High intent lead. Requires automated email triggers and role-based permissions for enterprise compliance.'
      );
    }
  };

  // Generate SOW using AI logic
  const handleGenerateSOW = () => {
    if (!clientName.trim()) {
      Alert.alert('Missing Field', 'Please enter a client or company name.');
      return;
    }

    setIsGenerating(true);

    setTimeout(() => {
      setIsGenerating(false);
      const randomId = `SOW-2026-${Math.floor(1000 + Math.random() * 9000)}`;

      setGeneratedSOW({
        proposalId: randomId,
        clientName: clientName.trim(),
        scopeSummary:
          'Engineering of a production-ready, high-throughput web application including design system tokens, database architecture, third-party payment gateways, and real-time streaming interfaces.',
        techStack: ['Next.js 15 (App Router)', 'Fastify TypeScript', 'PostgreSQL & Prisma', 'Redis Cache', 'Tailwind & Radix UI'],
        totalBudget: '₹ 4,50,000',
        depositAmount: '₹ 1,50,000',
        milestones: [
          {
            title: 'Sprint 1: Architecture & UI System',
            duration: 'Days 1 - 10',
            deliverables: 'Figma high-fidelity prototypes, DB schema migration, Auth & RBAC',
            amount: '₹ 1,50,000 (Advance)',
          },
          {
            title: 'Sprint 2: Core Business Logic & Payments',
            duration: 'Days 11 - 20',
            deliverables: 'Real-time WebSocket feed, Razorpay/Stripe checkout, REST APIs',
            amount: '₹ 1,50,000',
          },
          {
            title: 'Sprint 3: QA Hardening & Production Deploy',
            duration: 'Days 21 - 30',
            deliverables: 'Security audit, Core Web Vitals optimization, DNS & Cloudflare live rollout',
            amount: '₹ 1,50,000',
          },
        ],
        proposalUrl: `https://garage.grekam.in/verify/proposal/${randomId}`,
      });
    }, 1200);
  };

  // 1-Tap WhatsApp dispatch
  const handleSendWhatsApp = () => {
    if (!generatedSOW) return;

    const message =
      `Hello ${generatedSOW.clientName}!\n\n` +
      `Thank you for our discovery discussion! Based on your technical requirements, our agency has compiled your official Statement of Work (SOW) & Project Scope:\n\n` +
      `📋 *Proposal ID:* ${generatedSOW.proposalId}\n` +
      `💰 *Total Investment:* ${generatedSOW.totalBudget}\n` +
      `⚡ *Advance Deposit:* ${generatedSOW.depositAmount}\n` +
      `🛠️ *Tech Stack:* ${generatedSOW.techStack.join(', ')}\n\n` +
      `🔗 *Live Interactive Proposal & Milestone Breakdown:*\n` +
      `${generatedSOW.proposalUrl}\n\n` +
      `You can review and electronically sign off on the milestones at the link above. We look forward to building this with your team!`;

    sendWhatsAppMessage(clientPhone, message);
  };

  const handleReset = () => {
    setGeneratedSOW(null);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <View style={styles.headerTitleRow}>
                <FileText size={20} color="#0A84FF" />
                <Text style={styles.title}>Voice-to-SOW Generator</Text>
              </View>
              <Text style={styles.sub}>Turn discovery voice notes into an interactive client proposal</Text>
            </View>
            <TouchableOpacity onPress={handleReset}>
              <X size={20} color={CONFIG.COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 480 }}>
            {!generatedSOW ? (
              <>
                {/* Client Info */}
                <Text style={styles.inputLabel}>Client / Prospect Name</Text>
                <TextInput
                  style={styles.textInput}
                  value={clientName}
                  onChangeText={setClientName}
                  placeholder="e.g. Nexus Capital"
                  placeholderTextColor={CONFIG.COLORS.textMuted}
                />

                <Text style={styles.inputLabel}>Client WhatsApp Number</Text>
                <TextInput
                  style={styles.textInput}
                  value={clientPhone}
                  onChangeText={setClientPhone}
                  placeholder="+919876543210"
                  placeholderTextColor={CONFIG.COLORS.textMuted}
                  keyboardType="phone-pad"
                />

                {/* Voice Discovery Recorder */}
                <View style={styles.voiceSection}>
                  <View style={styles.voiceHeader}>
                    <Text style={styles.inputLabelNoMargin}>Discovery Call Notes / Voice Memo</Text>
                    {isRecording && (
                      <View style={styles.recordingPulse}>
                        <View style={styles.pulseDot} />
                        <Text style={styles.recordingText}>Recording...</Text>
                      </View>
                    )}
                  </View>

                  <TextInput
                    style={[styles.textInput, styles.textArea]}
                    value={discoveryNotes}
                    onChangeText={setDiscoveryNotes}
                    multiline
                    numberOfLines={4}
                    placeholder="Speak or type discovery notes (client goals, tech stack, timeline, budget)..."
                    placeholderTextColor={CONFIG.COLORS.textMuted}
                  />

                  <TouchableOpacity
                    style={[styles.recordBtn, isRecording && styles.recordBtnActive]}
                    onPress={handleToggleRecord}
                  >
                    {isRecording ? <Square size={16} color="#ffffff" /> : <Mic size={16} color="#ffffff" />}
                    <Text style={styles.recordBtnText}>
                      {isRecording ? 'Stop Recording' : 'Add Voice Memo to Notes'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Generate Button */}
                <TouchableOpacity
                  style={[styles.generateBtn, isGenerating && styles.btnDisabled]}
                  onPress={handleGenerateSOW}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <>
                      <FileText size={18} color="#ffffff" />
                      <Text style={styles.generateBtnText}>Generate SOW & Proposal Link</Text>
                    </>
                  )}
                </TouchableOpacity>
              </>
            ) : (
              /* Generated Proposal State */
              <View style={styles.resultContainer}>
                <View style={styles.successBanner}>
                  <CheckCircle2 size={18} color="#34d399" />
                  <Text style={styles.successBannerText}>Proposal {generatedSOW.proposalId} Ready</Text>
                </View>

                {/* Scope Summary */}
                <Text style={styles.summaryTitle}>Executive Scope</Text>
                <Text style={styles.summaryBody}>{generatedSOW.scopeSummary}</Text>

                {/* Recommended Tech Stack */}
                <Text style={styles.summaryTitle}>Recommended Architecture</Text>
                <View style={styles.techStackRow}>
                  {generatedSOW.techStack.map((tech) => (
                    <View key={tech} style={styles.techPill}>
                      <Code2 size={12} color="#a855f7" />
                      <Text style={styles.techPillText}>{tech}</Text>
                    </View>
                  ))}
                </View>

                {/* Sprint Milestones Breakdown */}
                <Text style={styles.summaryTitle}>Milestone Breakdown ({generatedSOW.totalBudget})</Text>
                {generatedSOW.milestones.map((m, idx) => (
                  <View key={idx} style={styles.milestoneCard}>
                    <View style={styles.milestoneHeader}>
                      <Text style={styles.milestoneTitle}>{m.title}</Text>
                      <Text style={styles.milestoneAmount}>{m.amount}</Text>
                    </View>
                    <Text style={styles.milestoneDuration}>{m.duration}</Text>
                    <Text style={styles.milestoneDeliverables}>• {m.deliverables}</Text>
                  </View>
                ))}

                {/* Action Buttons */}
                <View style={styles.actionButtonsCol}>
                  <TouchableOpacity style={styles.whatsappBtn} onPress={handleSendWhatsApp}>
                    <Share2 size={18} color="#ffffff" />
                    <Text style={styles.whatsappBtnText}>Send SOW Proposal on WhatsApp</Text>
                  </TouchableOpacity>

                  {onOpenInvoice && (
                    <TouchableOpacity
                      style={styles.invoiceBtn}
                      onPress={() => {
                        onClose();
                        onOpenInvoice(generatedSOW.clientName, '150000');
                      }}
                    >
                      <CreditCard size={18} color="#34d399" />
                      <Text style={styles.invoiceBtnText}>Generate Advance Deposit UPI (₹1,50,000)</Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity style={styles.resetBtn} onPress={() => setGeneratedSOW(null)}>
                    <Text style={styles.resetBtnText}>Edit Scope or Re-generate</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  card: {
    backgroundColor: '#121215',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: CONFIG.COLORS.borderSubtle,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: CONFIG.COLORS.textPrimary,
  },
  sub: {
    fontSize: 12,
    color: CONFIG.COLORS.textMuted,
    marginTop: 2,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: CONFIG.COLORS.textSecondary,
    marginBottom: 6,
    marginTop: 8,
  },
  inputLabelNoMargin: {
    fontSize: 12,
    fontWeight: '700',
    color: CONFIG.COLORS.textSecondary,
  },
  textInput: {
    backgroundColor: CONFIG.COLORS.bgSurface,
    borderWidth: 1,
    borderColor: CONFIG.COLORS.borderSubtle,
    borderRadius: 12,
    padding: 12,
    color: CONFIG.COLORS.textPrimary,
    fontSize: 14,
  },
  textArea: {
    height: 90,
    textAlignVertical: 'top',
    marginTop: 6,
  },
  voiceSection: {
    marginTop: 8,
  },
  voiceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recordingPulse: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
  },
  recordingText: {
    fontSize: 11,
    color: '#ef4444',
    fontWeight: '700',
  },
  recordBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1f2937',
    borderWidth: 1,
    borderColor: '#374151',
    borderRadius: 10,
    paddingVertical: 10,
    marginTop: 8,
    gap: 8,
  },
  recordBtnActive: {
    backgroundColor: '#7f1d1d',
    borderColor: '#b91c1c',
  },
  recordBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
  generateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#a855f7',
    borderRadius: 14,
    paddingVertical: 14,
    marginTop: 20,
    marginBottom: 10,
    gap: 8,
  },
  generateBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#ffffff',
  },
  btnDisabled: {
    opacity: 0.6,
  },
  resultContainer: {
    paddingVertical: 4,
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#062016',
    borderWidth: 1,
    borderColor: '#065f46',
    padding: 12,
    borderRadius: 12,
    gap: 8,
    marginBottom: 14,
  },
  successBannerText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#34d399',
  },
  summaryTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 10,
    marginBottom: 6,
  },
  summaryBody: {
    fontSize: 13,
    color: CONFIG.COLORS.textPrimary,
    lineHeight: 18,
  },
  techStackRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  techPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e1b4b',
    borderWidth: 1,
    borderColor: '#3730a3',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 6,
  },
  techPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#c084fc',
  },
  milestoneCard: {
    backgroundColor: CONFIG.COLORS.bgSurface,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: CONFIG.COLORS.borderSubtle,
    marginBottom: 8,
  },
  milestoneHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  milestoneTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: CONFIG.COLORS.textPrimary,
    flex: 1,
  },
  milestoneAmount: {
    fontSize: 12,
    fontWeight: '800',
    color: '#34d399',
  },
  milestoneDuration: {
    fontSize: 11,
    color: '#60a5fa',
    marginBottom: 4,
  },
  milestoneDeliverables: {
    fontSize: 12,
    color: CONFIG.COLORS.textSecondary,
    lineHeight: 16,
  },
  actionButtonsCol: {
    marginTop: 16,
    gap: 10,
    marginBottom: 10,
  },
  whatsappBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#25D366',
    borderRadius: 14,
    paddingVertical: 14,
    gap: 8,
  },
  whatsappBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#ffffff',
  },
  invoiceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#062016',
    borderWidth: 1,
    borderColor: '#065f46',
    borderRadius: 14,
    paddingVertical: 12,
    gap: 8,
  },
  invoiceBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#34d399',
  },
  resetBtn: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  resetBtnText: {
    fontSize: 12,
    color: CONFIG.COLORS.textMuted,
    fontWeight: '600',
  },
});
