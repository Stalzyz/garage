import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { CONFIG } from '../config/constants';
import {
  DollarSign,
  Users,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  PhoneCall,
  LogOut,
  Building2,
  Briefcase,
  AlertCircle,
  CreditCard,
  FileText,
} from 'lucide-react-native';
import { QuickInvoiceModal } from '../components/QuickInvoiceModal';
import { OverdueChaserModal } from '../components/OverdueChaserModal';
import { VoiceSOWModal } from '../components/VoiceSOWModal';

export function DashboardScreen({ onNavigate }: { onNavigate: (tab: string) => void }) {
  const { user, logout } = useAuth();
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showOverdueModal, setShowOverdueModal] = useState(false);
  const [showSOWModal, setShowSOWModal] = useState(false);
  const [sowClient, setSOWClient] = useState({ name: 'Nexus Capital', phone: '+919876543210' });

  const isPartner = user?.role === 'RESELLER_ADMIN' || user?.role === 'PARTNER';

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={CONFIG.COLORS.bgBase} />
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Top Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.userName}>{user?.name || 'Business Leader'}</Text>
          </View>
          <View style={styles.headerRight}>
            <View style={[styles.roleBadge, isPartner ? styles.roleBadgePurple : styles.roleBadgeEmerald]}>
              <Text style={[styles.roleText, isPartner ? styles.roleTextPurple : styles.roleTextEmerald]}>
                {isPartner ? 'Whitelabel Partner' : 'Agency Founder'}
              </Text>
            </View>
            <TouchableOpacity onPress={logout} style={styles.logoutBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <LogOut size={18} color={CONFIG.COLORS.textMuted} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Hero Revenue Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroHeader}>
            <Text style={styles.heroLabel}>
              {isPartner ? 'Partner Commission Wallet' : 'Monthly Recurring Revenue (MRR)'}
            </Text>
            <View style={styles.growthBadge}>
              <ArrowUpRight size={14} color="#34d399" />
              <Text style={styles.growthText}>+24.6%</Text>
            </View>
          </View>
          <Text style={styles.heroAmount}>{isPartner ? '₹ 1,84,000' : '₹ 14,80,000'}</Text>
          <Text style={styles.heroSubtext}>
            {isPartner ? 'Ready for instant payout transfer' : '8 Active Retainers & Client Milestones'}
          </Text>
        </View>

        {/* Quick Action Buttons */}
        <View style={styles.quickActionRow}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onNavigate('attendance')}
          >
            <View style={[styles.actionIconBadge, { backgroundColor: '#1e3a8a' }]}>
              <Clock size={20} color="#60a5fa" />
            </View>
            <Text style={styles.actionLabel}>Clock In</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onNavigate('leads')}
          >
            <View style={[styles.actionIconBadge, { backgroundColor: '#064e3b' }]}>
              <PhoneCall size={20} color="#34d399" />
            </View>
            <Text style={styles.actionLabel}>Pipeline</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onNavigate('projects')}
          >
            <View style={[styles.actionIconBadge, { backgroundColor: '#581c87' }]}>
              <Briefcase size={20} color="#c084fc" />
            </View>
            <Text style={styles.actionLabel}>Projects</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setShowInvoiceModal(true)}
          >
            <View style={[styles.actionIconBadge, { backgroundColor: '#064e3b' }]}>
              <CreditCard size={20} color="#34d399" />
            </View>
            <Text style={styles.actionLabel}>UPI Invoice</Text>
          </TouchableOpacity>
        </View>

        {/* 2x2 Metric Grid */}
        <Text style={styles.sectionHeader}>Agency Operations Pulse</Text>
        <View style={styles.grid}>
          {/* Card 1 */}
          <View style={styles.gridCard}>
            <View style={styles.gridCardTop}>
              <Text style={styles.gridLabel}>Active Inquiries</Text>
              <Users size={16} color={CONFIG.COLORS.primary} />
            </View>
            <Text style={styles.gridValue}>28</Text>
            <Text style={styles.gridSub}>6 proposals pending review</Text>
          </View>

          {/* Card 2 */}
          <View style={styles.gridCard}>
            <View style={styles.gridCardTop}>
              <Text style={styles.gridLabel}>Engineers On-Deck</Text>
              <CheckCircle2 size={16} color="#10b981" />
            </View>
            <Text style={styles.gridValue}>12 / 14</Text>
            <Text style={styles.gridSub}>Dev & UI/UX capacity</Text>
          </View>

          {/* Card 3 */}
          <View style={styles.gridCard}>
            <View style={styles.gridCardTop}>
              <Text style={styles.gridLabel}>Active Sprints</Text>
              <Briefcase size={16} color="#f59e0b" />
            </View>
            <Text style={styles.gridValue}>9</Text>
            <Text style={styles.gridSub}>Web & Marketing projects</Text>
          </View>

          {/* Card 4: Overdue Milestones with 1-Tap Chaser */}
          <TouchableOpacity
            style={[styles.gridCard, { borderColor: '#7f1d1d66', backgroundColor: '#1c1517' }]}
            onPress={() => setShowOverdueModal(true)}
            activeOpacity={0.7}
          >
            <View style={styles.gridCardTop}>
              <Text style={styles.gridLabel}>Overdue Retainers</Text>
              <AlertCircle size={16} color="#f43f5e" />
            </View>
            <Text style={[styles.gridValue, { color: '#f87171' }]}>3 Invoices</Text>
            <Text style={[styles.gridSub, { color: '#fb7185' }]}>Tap to WhatsApp Chaser →</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Urgent Action Alert */}
        <View style={styles.alertCard}>
          <View style={styles.alertIconBadge}>
            <FileText size={18} color="#0A84FF" />
          </View>
          <View style={styles.alertBody}>
            <Text style={styles.alertTitle}>New High-Intent SOW Request</Text>
            <Text style={styles.alertText}>
              Nexus Capital requested an architecture estimate for a Next.js portal.
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.alertActionBtn, { backgroundColor: '#0A84FF' }]}
            onPress={() => {
              setSOWClient({ name: 'Nexus Capital', phone: '+919876543210' });
              setShowSOWModal(true);
            }}
          >
            <Text style={styles.alertActionBtnText}>Draft SOW</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* 1-Tap Quick Invoice & UPI Generator Modal */}
      <QuickInvoiceModal
        visible={showInvoiceModal}
        onClose={() => setShowInvoiceModal(false)}
      />

      {/* 1-Tap Overdue Retainer Chaser Modal */}
      <OverdueChaserModal
        visible={showOverdueModal}
        onClose={() => setShowOverdueModal(false)}
      />

      {/* 1-Tap Voice-to-SOW Proposal Generator Modal */}
      <VoiceSOWModal
        visible={showSOWModal}
        onClose={() => setShowSOWModal(false)}
        defaultClient={sowClient.name}
        defaultPhone={sowClient.phone}
        onOpenInvoice={(client, amt) => setShowInvoiceModal(true)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: CONFIG.COLORS.bgBase,
  },
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: {
    fontSize: 13,
    color: CONFIG.COLORS.textMuted,
    fontWeight: '500',
  },
  userName: {
    fontSize: 20,
    fontWeight: '800',
    color: CONFIG.COLORS.textPrimary,
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  roleBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  roleBadgeEmerald: {
    backgroundColor: '#064e3b33',
    borderColor: '#05966966',
  },
  roleBadgePurple: {
    backgroundColor: '#581c8733',
    borderColor: '#9333ea66',
  },
  roleText: {
    fontSize: 11,
    fontWeight: '700',
  },
  roleTextEmerald: {
    color: '#34d399',
  },
  roleTextPurple: {
    color: '#c084fc',
  },
  logoutBtn: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#1C1C1E',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  heroCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    marginBottom: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  heroLabel: {
    fontSize: 13,
    color: CONFIG.COLORS.textSecondary,
    fontWeight: '600',
    letterSpacing: -0.1,
  },
  growthBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(48, 209, 88, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 3,
  },
  growthText: {
    color: CONFIG.COLORS.emerald,
    fontSize: 12,
    fontWeight: '700',
  },
  heroAmount: {
    fontSize: 34,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -1,
    fontVariant: ['tabular-nums'],
  },
  heroSubtext: {
    fontSize: 12,
    color: CONFIG.COLORS.textMuted,
    marginTop: 6,
    fontWeight: '500',
  },
  quickActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 26,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#1C1C1E',
    borderRadius: 18,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  actionIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  actionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: CONFIG.COLORS.textPrimary,
    letterSpacing: 0.1,
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: '700',
    color: CONFIG.COLORS.textPrimary,
    marginBottom: 12,
    letterSpacing: -0.2,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  gridCard: {
    width: '48%',
    backgroundColor: '#1C1C1E',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  gridCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  gridLabel: {
    fontSize: 12,
    color: CONFIG.COLORS.textSecondary,
    fontWeight: '500',
  },
  gridValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#ffffff',
    fontVariant: ['tabular-nums'],
    letterSpacing: -0.5,
  },
  gridSub: {
    fontSize: 11,
    color: CONFIG.COLORS.textMuted,
    marginTop: 4,
    fontWeight: '500',
  },
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.10)',
  },
  alertIconBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(191, 90, 242, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  alertBody: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: -0.1,
  },
  alertText: {
    fontSize: 11,
    color: CONFIG.COLORS.textSecondary,
    marginTop: 2,
    lineHeight: 15,
  },
  alertActionBtn: {
    backgroundColor: CONFIG.COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginLeft: 8,
  },
  alertActionBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
});
