import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { CONFIG } from '../config/constants';
import {
  X,
  AlertCircle,
  Clock,
  Share2,
  CheckCircle2,
  Building,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react-native';
import { getOverdueNudge, sendWhatsAppMessage } from '../services/whatsapp';

interface OverdueInvoice {
  id: string;
  invoiceNo: string;
  clientName: string;
  phone: string;
  amount: string;
  daysOverdue: number;
  project: string;
}

const SAMPLE_OVERDUE: OverdueInvoice[] = [
  {
    id: 'ov1',
    invoiceNo: 'INV-2026-104',
    clientName: 'Apex Fleet Logistics',
    phone: '+919790123456',
    amount: '₹ 92,000',
    daysOverdue: 6,
    project: 'Quarterly Maintenance Retainer',
  },
  {
    id: 'ov2',
    invoiceNo: 'INV-2026-109',
    clientName: 'UrbanVogue Lifestyle',
    phone: '+919812345678',
    amount: '₹ 1,75,000',
    daysOverdue: 3,
    project: 'Monthly Meta Ads & CRO Retainer',
  },
  {
    id: 'ov3',
    invoiceNo: 'INV-2026-112',
    clientName: 'MedPulse Labs',
    phone: '+919876543210',
    amount: '₹ 65,000',
    daysOverdue: 8,
    project: 'Sprint 2 Milestone Sign-off',
  },
];

interface OverdueChaserModalProps {
  visible: boolean;
  onClose: () => void;
}

export function OverdueChaserModal({ visible, onClose }: OverdueChaserModalProps) {
  const [invoices, setInvoices] = useState<OverdueInvoice[]>(SAMPLE_OVERDUE);

  const handleSendNudge = (inv: OverdueInvoice, isUrgent = false) => {
    const text = getOverdueNudge(inv.clientName, inv.invoiceNo, inv.amount, isUrgent);
    sendWhatsAppMessage(inv.phone, text);
  };

  const handleMarkPaid = (id: string) => {
    setInvoices((prev) => prev.filter((i) => i.id !== id));
    Alert.alert('Payment Recorded', 'Invoice marked as paid. Commission wallet updated.');
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <View style={styles.headerTitleRow}>
                <AlertCircle size={20} color="#f43f5e" />
                <Text style={styles.title}>Overdue Retainer Chaser</Text>
              </View>
              <Text style={styles.sub}>1-tap gentle or urgent WhatsApp payment recovery</Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <X size={20} color={CONFIG.COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 420 }}>
            {invoices.length === 0 ? (
              <View style={styles.emptyBox}>
                <CheckCircle2 size={36} color="#34d399" />
                <Text style={styles.emptyTitle}>Zero Overdue Invoices!</Text>
                <Text style={styles.emptySub}>All client retainers and milestone invoices are up to date.</Text>
              </View>
            ) : (
              invoices.map((inv) => (
                <View key={inv.id} style={styles.invoiceCard}>
                  {/* Card Header */}
                  <View style={styles.cardTop}>
                    <View>
                      <Text style={styles.clientName}>{inv.clientName}</Text>
                      <Text style={styles.projectText}>{inv.project}</Text>
                    </View>
                    <View style={styles.overdueBadge}>
                      <Clock size={11} color="#f43f5e" />
                      <Text style={styles.overdueBadgeText}>{inv.daysOverdue}d overdue</Text>
                    </View>
                  </View>

                  {/* Amount Row */}
                  <View style={styles.amountRow}>
                    <Text style={styles.invNoText}>{inv.invoiceNo}</Text>
                    <Text style={styles.amountText}>{inv.amount}</Text>
                  </View>

                  {/* 1-Tap Action Buttons */}
                  <View style={styles.actionsRow}>
                    {/* Gentle Nudge */}
                    <TouchableOpacity
                      style={styles.gentleBtn}
                      onPress={() => handleSendNudge(inv, false)}
                    >
                      <Share2 size={13} color="#34d399" />
                      <Text style={styles.gentleBtnText}>Polite Nudge</Text>
                    </TouchableOpacity>

                    {/* Urgent Nudge */}
                    <TouchableOpacity
                      style={styles.urgentBtn}
                      onPress={() => handleSendNudge(inv, true)}
                    >
                      <ShieldAlert size={13} color="#f43f5e" />
                      <Text style={styles.urgentBtnText}>Urgent Nudge</Text>
                    </TouchableOpacity>

                    {/* Mark Paid */}
                    <TouchableOpacity
                      style={styles.paidBtn}
                      onPress={() => handleMarkPaid(inv.id)}
                    >
                      <CheckCircle2 size={13} color="#60a5fa" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </ScrollView>

          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeBtnText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  card: {
    backgroundColor: CONFIG.COLORS.bgSurface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    borderTopWidth: 1,
    borderColor: CONFIG.COLORS.borderStrong,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  emptyBox: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: CONFIG.COLORS.textPrimary,
  },
  emptySub: {
    fontSize: 12,
    color: CONFIG.COLORS.textMuted,
  },
  invoiceCard: {
    backgroundColor: CONFIG.COLORS.bgElevated,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#7f1d1d44',
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  clientName: {
    fontSize: 15,
    fontWeight: '800',
    color: CONFIG.COLORS.textPrimary,
  },
  projectText: {
    fontSize: 12,
    color: CONFIG.COLORS.textMuted,
    marginTop: 2,
  },
  overdueBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#7f1d1d44',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ef444444',
  },
  overdueBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#f87171',
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#334155',
    marginBottom: 10,
  },
  invNoText: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '600',
  },
  amountText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#34d399',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  gentleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#064e3b33',
    paddingVertical: 9,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#05966955',
  },
  gentleBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#34d399',
  },
  urgentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#7f1d1d33',
    paddingVertical: 9,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ef444455',
  },
  urgentBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#f87171',
  },
  paidBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#1e3a8a33',
    borderWidth: 1,
    borderColor: '#3b82f655',
  },
  closeBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginTop: 8,
  },
  closeBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: CONFIG.COLORS.textMuted,
  },
});
