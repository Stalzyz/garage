import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Linking,
  Modal,
  Alert,
  AppState,
  AppStateStatus,
} from 'react-native';
import { CONFIG } from '../config/constants';
import {
  Search,
  Phone,
  MessageCircle,
  Clock,
  CheckCircle2,
  X,
  Calendar,
  Play,
  Pause,
  Square,
  Mic,
  Trash2,
  ChevronRight,
  PhoneForwarded,
  PhoneCall,
  FileText,
  Check,
  Send,
  Code2,
  Building,
} from 'lucide-react-native';
import { WHATSAPP_TEMPLATES, sendWhatsAppMessage } from '../services/whatsapp';
import { voiceRecorder } from '../services/audioRecorder';
import { VoiceSOWModal } from '../components/VoiceSOWModal';
import { QuickInvoiceModal } from '../components/QuickInvoiceModal';

export interface Lead {
  id: string;
  name: string;
  phone: string;
  company: string;
  service: string;
  amount: string;
  stage: 'INBOUND' | 'QUALIFIED' | 'PROPOSAL' | 'WON';
  timeAgo: string;
  techStack?: string[];
  lastOutcome?: string;
  hasVoiceMemo?: boolean;
}

const INITIAL_LEADS: Lead[] = [
  {
    id: '1',
    name: 'Vikramaditya Sharma',
    phone: '+919876543210',
    company: 'Nexus Capital (Fintech)',
    service: 'Full-Stack Next.js Web Application & Real-time Trading Portal',
    amount: '₹ 4,50,000',
    stage: 'INBOUND',
    timeAgo: '12m ago',
    techStack: ['Next.js 15', 'Fastify', 'PostgreSQL'],
  },
  {
    id: '2',
    name: 'Priya Sundaram',
    phone: '+919812345678',
    company: 'UrbanVogue (D2C Lifestyle)',
    service: 'Shopify Plus Redesign & Performance Meta/Google Ads Retainer',
    amount: '₹ 1,75,000 / mo',
    stage: 'QUALIFIED',
    timeAgo: '45m ago',
    techStack: ['Shopify Plus', 'Meta Ads', 'Klaviyo'],
  },
  {
    id: '3',
    name: 'Karthik Narayanan',
    phone: '+919790123456',
    company: 'FleetLogix Enterprise',
    service: 'Custom B2B Client Portal & SEO Organic Growth Sprint',
    amount: '₹ 2,90,000',
    stage: 'PROPOSAL',
    timeAgo: '2h ago',
    techStack: ['React', 'Node.js', 'Technical SEO'],
  },
  {
    id: '4',
    name: 'Rajesh Kanna',
    phone: '+919944112233',
    company: 'CloudSphere Solutions',
    service: 'UI/UX Design System & Cross-Platform Mobile App (iOS & Android)',
    amount: '₹ 5,20,000',
    stage: 'WON',
    timeAgo: 'Yesterday',
    techStack: ['Figma', 'React Native', 'Expo'],
  },
];

export function LeadsScreen() {
  const [leads, setLeads] = useState<Lead[]>(INITIAL_LEADS);
  const [search, setSearch] = useState('');
  const [selectedStage, setSelectedStage] = useState<string>('ALL');

  // Modals & Drawers
  const [selectedLeadForOutcome, setSelectedLeadForOutcome] = useState<Lead | null>(null);
  const [selectedLeadForWhatsApp, setSelectedLeadForWhatsApp] = useState<Lead | null>(null);
  const [selectedLeadForSOW, setSelectedLeadForSOW] = useState<Lead | null>(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [invoiceData, setInvoiceData] = useState({ client: '', amount: '' });

  // Power Dialer Queue State
  const [isPowerSessionActive, setIsPowerSessionActive] = useState(false);
  const [powerIndex, setPowerIndex] = useState(0);
  const [isQueuePaused, setIsQueuePaused] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  // Voice Memo State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [recordedAudioUri, setRecordedAudioUri] = useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Refs for tracking active call and app state
  const appState = useRef(AppState.currentState);
  const dialedLeadRef = useRef<Lead | null>(null);
  const recordingTimerRef = useRef<any>(null);
  const countdownTimerRef = useRef<any>(null);

  const filteredLeads = leads.filter((l) => {
    const matchesSearch =
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.company.toLowerCase().includes(search.toLowerCase()) ||
      l.service.toLowerCase().includes(search.toLowerCase()) ||
      (l.techStack && l.techStack.some((t) => t.toLowerCase().includes(search.toLowerCase())));
    const matchesStage = selectedStage === 'ALL' || l.stage === selectedStage;
    return matchesSearch && matchesStage;
  });

  // AppState listener: Auto-detect when user returns from native phone call
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active' &&
        dialedLeadRef.current
      ) {
        setSelectedLeadForOutcome(dialedLeadRef.current);
        dialedLeadRef.current = null;
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    };
  }, []);

  // Power Dialer auto-countdown handler
  useEffect(() => {
    if (countdown !== null && countdown > 0 && !isQueuePaused) {
      countdownTimerRef.current = setTimeout(() => {
        setCountdown((prev) => (prev !== null ? prev - 1 : null));
      }, 1000);
    } else if (countdown === 0 && !isQueuePaused) {
      setCountdown(null);
      dialCurrentQueueLead();
    }

    return () => {
      if (countdownTimerRef.current) clearTimeout(countdownTimerRef.current);
    };
  }, [countdown, isQueuePaused]);

  // Execute native cellular call
  const triggerCall = (lead: Lead) => {
    dialedLeadRef.current = lead;
    Linking.openURL(`tel:${lead.phone}`);
  };

  // Start continuous Power Dialer session
  const startPowerSession = () => {
    if (filteredLeads.length === 0) {
      Alert.alert('No Leads', 'There are no client leads matching your current filter.');
      return;
    }
    setIsPowerSessionActive(true);
    setPowerIndex(0);
    setIsQueuePaused(false);
    triggerCall(filteredLeads[0]);
  };

  const dialCurrentQueueLead = () => {
    if (powerIndex < filteredLeads.length) {
      triggerCall(filteredLeads[powerIndex]);
    } else {
      setIsPowerSessionActive(false);
      Alert.alert('Power Session Complete', `You have reached out to all ${filteredLeads.length} client leads!`);
    }
  };

  const skipNextQueueLead = () => {
    setCountdown(null);
    const nextIdx = powerIndex + 1;
    if (nextIdx < filteredLeads.length) {
      setPowerIndex(nextIdx);
      triggerCall(filteredLeads[nextIdx]);
    } else {
      setIsPowerSessionActive(false);
      Alert.alert('Queue Ended', 'All client leads in this session have been dialed.');
    }
  };

  const stopPowerSession = () => {
    setIsPowerSessionActive(false);
    setCountdown(null);
    setIsQueuePaused(false);
    setPowerIndex(0);
  };

  // Voice Memo recording handlers
  const handleStartRecording = async () => {
    const started = await voiceRecorder.startRecording();
    if (started) {
      setIsRecording(true);
      setRecordingSeconds(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      Alert.alert('Microphone Access', 'Please allow microphone access in device settings to record voice notes.');
    }
  };

  const handleStopRecording = async () => {
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    setIsRecording(false);
    const uri = await voiceRecorder.stopRecording();
    if (uri) {
      setRecordedAudioUri(uri);
    }
  };

  const handlePlayVoiceMemo = async () => {
    if (!recordedAudioUri) return;
    if (isPlayingAudio) {
      await voiceRecorder.stopSound();
      setIsPlayingAudio(false);
    } else {
      setIsPlayingAudio(true);
      await voiceRecorder.playSound(recordedAudioUri, () => {
        setIsPlayingAudio(false);
      });
    }
  };

  const handleDeleteVoiceMemo = async () => {
    await voiceRecorder.stopSound();
    setIsPlayingAudio(false);
    setRecordedAudioUri(null);
    setRecordingSeconds(0);
  };

  // Outcome submission
  const handleSaveOutcome = (outcomeText: string) => {
    if (!selectedLeadForOutcome) return;

    const updatedLeadId = selectedLeadForOutcome.id;
    setLeads((prev) =>
      prev.map((l) =>
        l.id === updatedLeadId
          ? {
              ...l,
              lastOutcome: outcomeText,
              hasVoiceMemo: !!recordedAudioUri,
            }
          : l
      )
    );

    handleDeleteVoiceMemo();
    setSelectedLeadForOutcome(null);

    // If power dialer is active, start countdown for next lead
    if (isPowerSessionActive) {
      const nextIdx = powerIndex + 1;
      if (nextIdx < filteredLeads.length) {
        setPowerIndex(nextIdx);
        setCountdown(5);
      } else {
        setIsPowerSessionActive(false);
        Alert.alert('Session Complete', 'Great job! All client prospects have been contacted.');
      }
    }
  };

  return (
    <View style={styles.container}>
      {/* Sticky Power Dialer Header Bar (If Active) */}
      {isPowerSessionActive && (
        <View style={styles.powerQueueBar}>
          <View style={styles.powerQueueLeft}>
            <View style={styles.powerPill}>
              <PhoneCall size={14} color="#f59e0b" />
              <Text style={styles.powerPillText}>POWER DIALER ACTIVE</Text>
            </View>
            <Text style={styles.powerQueueSub}>
              Prospect {powerIndex + 1} of {filteredLeads.length}:{' '}
              <Text style={{ fontWeight: '800', color: '#ffffff' }}>
                {filteredLeads[powerIndex]?.name} ({filteredLeads[powerIndex]?.company})
              </Text>
            </Text>
            {countdown !== null && (
              <Text style={styles.countdownBanner}>
                Auto-dialing next call in {countdown}s...
              </Text>
            )}
          </View>

          <View style={styles.powerQueueActions}>
            <TouchableOpacity
              style={styles.queueBtnSecondary}
              onPress={() => setIsQueuePaused(!isQueuePaused)}
            >
              {isQueuePaused ? (
                <Play size={14} color="#34d399" />
              ) : (
                <Pause size={14} color="#f59e0b" />
              )}
              <Text style={styles.queueBtnText}>{isQueuePaused ? 'Resume' : 'Pause'}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.queueBtnSecondary} onPress={skipNextQueueLead}>
              <PhoneForwarded size={14} color="#60a5fa" />
              <Text style={styles.queueBtnText}>Skip</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.queueBtnStop} onPress={stopPowerSession}>
              <X size={14} color="#f87171" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Search & Filter Header */}
      <View style={styles.searchHeader}>
        <View style={styles.searchRow}>
          <View style={styles.searchBar}>
            <Search size={18} color={CONFIG.COLORS.textMuted} style={{ marginRight: 8 }} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search client, company, tech stack, or proposal..."
              placeholderTextColor={CONFIG.COLORS.textMuted}
              value={search}
              onChangeText={setSearch}
            />
          </View>

          {!isPowerSessionActive && (
            <TouchableOpacity style={styles.startPowerBtn} onPress={startPowerSession}>
              <PhoneCall size={16} color="#000000" />
              <Text style={styles.startPowerBtnText}>Power Session</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Filter Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {['ALL', 'INBOUND', 'QUALIFIED', 'PROPOSAL', 'WON'].map((st) => (
            <TouchableOpacity
              key={st}
              onPress={() => setSelectedStage(st)}
              style={[styles.filterPill, selectedStage === st && styles.filterPillActive]}
            >
              <Text
                style={[
                  styles.filterPillText,
                  selectedStage === st && styles.filterPillTextActive,
                ]}
              >
                {st}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Leads List */}
      <ScrollView contentContainerStyle={styles.listContent}>
        {filteredLeads.map((lead, idx) => (
          <View
            key={lead.id}
            style={[
              styles.leadCard,
              isPowerSessionActive && powerIndex === idx && styles.leadCardActiveQueue,
            ]}
          >
            {/* Header: Customer Name, Voice Badge, Amount */}
            <View style={styles.cardHeader}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={styles.customerName}>{lead.name}</Text>
                  {lead.hasVoiceMemo && (
                    <View style={styles.voiceBadge}>
                      <Mic size={10} color="#30D158" />
                      <Text style={styles.voiceBadgeText}>Voice</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.companyMeta} numberOfLines={1}>
                  {lead.company} · {lead.timeAgo}
                </Text>
              </View>
              <Text style={styles.amountText}>{lead.amount}</Text>
            </View>

            {/* Scope / Service text (clean typography, no box) */}
            <Text style={styles.serviceText} numberOfLines={2}>
              {lead.service}
            </Text>

            {/* Tech Stack (subtle text metadata, no nested boxes) */}
            {lead.techStack && lead.techStack.length > 0 && (
              <Text style={styles.techText} numberOfLines={1}>
                {lead.techStack.join('  ·  ')}
              </Text>
            )}

            {/* Last Outcome (if any) */}
            {lead.lastOutcome && (
              <View style={styles.lastOutcomeRow}>
                <Check size={11} color="#30D158" />
                <Text style={styles.lastOutcomeText} numberOfLines={1}>
                  {lead.lastOutcome}
                </Text>
              </View>
            )}

            {/* Action Bar (Zero Overflow: 3 Icon Buttons + Flex Call Button) */}
            <View style={styles.actionsRow}>
              {/* 1-Tap Speed-to-Lead Portfolio Drop */}
              <TouchableOpacity
                style={styles.actionIconBtn}
                onPress={() => {
                  const speedTemplate = WHATSAPP_TEMPLATES.find((t) => t.id === 'speed_pitch');
                  if (speedTemplate) {
                    const msg = speedTemplate.getMessage(lead);
                    sendWhatsAppMessage(lead.phone, msg);
                  }
                }}
              >
                <Send size={15} color="#8E8E93" />
              </TouchableOpacity>

              {/* 1-Tap Voice-to-SOW Generator */}
              <TouchableOpacity
                style={styles.actionIconBtn}
                onPress={() => setSelectedLeadForSOW(lead)}
              >
                <FileText size={15} color="#8E8E93" />
              </TouchableOpacity>

              {/* 1-Tap WhatsApp Selector Button */}
              <TouchableOpacity
                style={styles.actionIconBtn}
                onPress={() => setSelectedLeadForWhatsApp(lead)}
              >
                <MessageCircle size={15} color="#30D158" />
              </TouchableOpacity>

              {/* Direct Native Phone Dialer */}
              <TouchableOpacity
                style={styles.actionCallBtn}
                onPress={() => triggerCall(lead)}
              >
                <Phone size={14} color="#ffffff" />
                <Text style={styles.actionCallBtnText}>Call</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Modal 1: 1-Tap WhatsApp Smart Templates */}
      <Modal
        visible={!!selectedLeadForWhatsApp}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedLeadForWhatsApp(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Agency WhatsApp Templates</Text>
                <Text style={styles.modalSub}>
                  Select dynamic scope or retainer template for {selectedLeadForWhatsApp?.name}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setSelectedLeadForWhatsApp(null)}>
                <X size={20} color={CONFIG.COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 380 }} showsVerticalScrollIndicator={false}>
              {WHATSAPP_TEMPLATES.map((tmpl) => (
                <TouchableOpacity
                  key={tmpl.id}
                  style={styles.templateCard}
                  onPress={() => {
                    if (selectedLeadForWhatsApp) {
                      const msg = tmpl.getMessage(selectedLeadForWhatsApp);
                      sendWhatsAppMessage(selectedLeadForWhatsApp.phone, msg);
                      setSelectedLeadForWhatsApp(null);
                    }
                  }}
                >
                  <View style={styles.templateCardTop}>
                    <Text style={styles.templateTitle}>{tmpl.title}</Text>
                    <View style={[styles.templateBadge, { backgroundColor: `${tmpl.color}22` }]}>
                      <Text style={[styles.templateBadgeText, { color: tmpl.color }]}>
                        {tmpl.badge}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.templatePreview} numberOfLines={2}>
                    {selectedLeadForWhatsApp && tmpl.getMessage(selectedLeadForWhatsApp)}
                  </Text>
                  <View style={styles.templateSendRow}>
                    <Text style={[styles.templateSendText, { color: tmpl.color }]}>
                      Send via WhatsApp
                    </Text>
                    <Send size={12} color={tmpl.color} />
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal 2: Post-Call Disposition & Voice Memo Recorder */}
      <Modal
        visible={!!selectedLeadForOutcome}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedLeadForOutcome(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Call Disposition & Notes</Text>
                <Text style={styles.modalSub}>
                  {selectedLeadForOutcome?.name} • {selectedLeadForOutcome?.company}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setSelectedLeadForOutcome(null)}>
                <X size={20} color={CONFIG.COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            {/* Voice Memo Recording Box */}
            <View style={styles.voiceSection}>
              <Text style={styles.voiceSectionTitle}>Voice Briefing (AI Note Taker)</Text>
              <View style={styles.voiceControlRow}>
                {!isRecording && !recordedAudioUri && (
                  <TouchableOpacity style={styles.recordStartBtn} onPress={handleStartRecording}>
                    <Mic size={16} color="#ffffff" />
                    <Text style={styles.recordStartBtnText}>Hold to Dictate Call Notes</Text>
                  </TouchableOpacity>
                )}

                {isRecording && (
                  <View style={styles.recordingLiveBar}>
                    <View style={styles.recordingPulseDot} />
                    <Text style={styles.recordingTimerText}>
                      Recording notes... {recordingSeconds}s
                    </Text>
                    <TouchableOpacity style={styles.recordStopBtn} onPress={handleStopRecording}>
                      <Square size={14} color="#ffffff" />
                      <Text style={styles.recordStopBtnText}>Stop</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {recordedAudioUri && !isRecording && (
                  <View style={styles.playbackBar}>
                    <TouchableOpacity style={styles.playBtn} onPress={handlePlayVoiceMemo}>
                      {isPlayingAudio ? (
                        <Pause size={14} color="#34d399" />
                      ) : (
                        <Play size={14} color="#34d399" />
                      )}
                      <Text style={styles.playbackText}>
                        {isPlayingAudio ? 'Playing...' : `Voice Note (${recordingSeconds}s)`}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.trashBtn} onPress={handleDeleteVoiceMemo}>
                      <Trash2 size={16} color="#f87171" />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>

            {/* Disposition Options */}
            <Text style={styles.voiceSectionTitle}>Select Pipeline Result</Text>
            <View style={styles.outcomeOptions}>
              <TouchableOpacity
                style={styles.outcomeBtn}
                onPress={() => handleSaveOutcome('Interested - Proposal & SOW Sent')}
              >
                <CheckCircle2 size={16} color="#30D158" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.outcomeBtnText}>Interested - SOW & Proposal Sent</Text>
                  <Text style={styles.outcomeBtnSub}>Client requested timeline & milestone estimate</Text>
                </View>
                <ChevronRight size={16} color={CONFIG.COLORS.textMuted} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.outcomeBtn}
                onPress={() => handleSaveOutcome('Discovery Call Scheduled')}
              >
                <Calendar size={16} color="#60a5fa" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.outcomeBtnText}>Discovery Call Scheduled</Text>
                  <Text style={styles.outcomeBtnSub}>Scheduled 30-min Zoom / Meet architecture session</Text>
                </View>
                <ChevronRight size={16} color={CONFIG.COLORS.textMuted} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.outcomeBtn}
                onPress={() => handleSaveOutcome('Follow-up / Unanswered')}
              >
                <Clock size={16} color="#f59e0b" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.outcomeBtnText}>Busy / Follow-Up Needed</Text>
                  <Text style={styles.outcomeBtnSub}>Auto-schedule retry & drop WhatsApp intro</Text>
                </View>
                <ChevronRight size={16} color={CONFIG.COLORS.textMuted} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.outcomeBtn}
                onPress={() => handleSaveOutcome('Contract Signed / Won')}
              >
                <CheckCircle2 size={16} color="#10b981" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.outcomeBtnText}>Contract Signed / Retainer Won</Text>
                  <Text style={styles.outcomeBtnSub}>Advance paid, initialize sprint repository</Text>
                </View>
                <ChevronRight size={16} color={CONFIG.COLORS.textMuted} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal 3: Voice-to-SOW Proposal Generator */}
      <VoiceSOWModal
        visible={!!selectedLeadForSOW}
        onClose={() => setSelectedLeadForSOW(null)}
        defaultClient={selectedLeadForSOW?.company || selectedLeadForSOW?.name || ''}
        defaultPhone={selectedLeadForSOW?.phone || ''}
        onOpenInvoice={(client, amt) => {
          setInvoiceData({ client, amount: amt });
          setShowInvoiceModal(true);
        }}
      />

      {/* 1-Tap Quick Invoice Modal */}
      <QuickInvoiceModal
        visible={showInvoiceModal}
        onClose={() => setShowInvoiceModal(false)}
        defaultClient={invoiceData.client}
        defaultAmount={invoiceData.amount}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CONFIG.COLORS.bgBase,
  },
  powerQueueBar: {
    backgroundColor: '#1e1b4b',
    borderBottomWidth: 1,
    borderBottomColor: '#3730a3',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  powerQueueLeft: {
    flex: 1,
    marginRight: 10,
  },
  powerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  powerPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#fbbf24',
    letterSpacing: 0.5,
  },
  powerQueueSub: {
    fontSize: 12,
    color: '#c7d2fe',
  },
  countdownBanner: {
    fontSize: 11,
    fontWeight: '700',
    color: '#34d399',
    marginTop: 2,
  },
  powerQueueActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  queueBtnSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#312e81',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  queueBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#ffffff',
  },
  queueBtnStop: {
    backgroundColor: '#7f1d1d55',
    padding: 6,
    borderRadius: 8,
  },
  searchHeader: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 10,
    backgroundColor: '#000000',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 36,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 14,
  },
  startPowerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 12,
    borderRadius: 10,
    height: 36,
  },
  startPowerBtnText: {
    color: '#0A84FF',
    fontWeight: '600',
    fontSize: 12,
  },
  filterRow: {
    flexDirection: 'row',
    backgroundColor: '#1C1C1E',
    borderRadius: 8,
    padding: 2,
    gap: 2,
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: 'transparent',
  },
  filterPillActive: {
    backgroundColor: '#2C2C2E',
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#8E8E93',
  },
  filterPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  listContent: {
    padding: 14,
    gap: 10,
  },
  leadCard: {
    backgroundColor: '#121214',
    borderRadius: 12,
    padding: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  leadCardActiveQueue: {
    borderColor: '#0A84FF',
    backgroundColor: '#161922',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  companyMeta: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
  },
  voiceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(48, 209, 88, 0.12)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  voiceBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#30D158',
  },
  amountText: {
    color: '#30D158',
    fontSize: 14,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  serviceText: {
    fontSize: 13,
    color: '#E5E5EA',
    lineHeight: 18,
    marginBottom: 4,
  },
  techText: {
    fontSize: 11,
    color: '#71717A',
    marginBottom: 8,
  },
  lastOutcomeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 8,
  },
  lastOutcomeText: {
    fontSize: 11,
    color: '#30D158',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  actionIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionCallBtn: {
    flex: 1,
    height: 38,
    borderRadius: 8,
    backgroundColor: '#0A84FF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  actionCallBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: CONFIG.COLORS.bgSurface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    borderTopWidth: 1,
    borderColor: CONFIG.COLORS.borderStrong,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: CONFIG.COLORS.textPrimary,
  },
  modalSub: {
    fontSize: 12,
    color: CONFIG.COLORS.textMuted,
    marginTop: 2,
  },
  voiceSection: {
    backgroundColor: CONFIG.COLORS.bgElevated,
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: CONFIG.COLORS.borderSubtle,
  },
  voiceSectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: CONFIG.COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  voiceControlRow: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordStartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#dc2626',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    width: '100%',
  },
  recordStartBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  recordingLiveBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#7f1d1d44',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    width: '100%',
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  recordingPulseDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ef4444',
  },
  recordingTimerText: {
    color: '#f87171',
    fontWeight: '700',
    fontSize: 13,
  },
  recordStopBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ef4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  recordStopBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  playbackBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#064e3b33',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    width: '100%',
    borderWidth: 1,
    borderColor: '#05966955',
  },
  playBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  playbackText: {
    color: '#34d399',
    fontSize: 13,
    fontWeight: '700',
  },
  trashBtn: {
    padding: 6,
  },
  outcomeOptions: {
    gap: 10,
    marginBottom: 10,
  },
  outcomeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: CONFIG.COLORS.bgElevated,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: CONFIG.COLORS.borderSubtle,
  },
  outcomeBtnText: {
    color: CONFIG.COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  outcomeBtnSub: {
    color: CONFIG.COLORS.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  templateCard: {
    backgroundColor: CONFIG.COLORS.bgElevated,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: CONFIG.COLORS.borderSubtle,
  },
  templateCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  templateTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: CONFIG.COLORS.textPrimary,
  },
  templateBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  templateBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  templatePreview: {
    fontSize: 12,
    color: CONFIG.COLORS.textSecondary,
    lineHeight: 18,
    marginBottom: 10,
  },
  templateSendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 6,
  },
  templateSendText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
