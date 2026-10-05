import React, { useState } from 'react';
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
} from 'react-native';
import { CONFIG } from '../config/constants';
import {
  FolderGit2,
  CheckCircle2,
  Clock,
  ExternalLink,
  Users,
  Code2,
  TrendingUp,
  Share2,
  Plus,
  X,
  Layers,
  CheckSquare,
  Square,
  Globe,
  Smartphone,
  Search,
  ShieldAlert,
  CreditCard,
  HeartPulse,
  AlertTriangle,
} from 'lucide-react-native';
import { QuickInvoiceModal } from '../components/QuickInvoiceModal';
import { getClientBlockerMessage, getFounderReassuranceMessage, sendWhatsAppMessage } from '../services/whatsapp';

interface Milestone {
  id: string;
  title: string;
  completed: boolean;
}

interface Project {
  id: string;
  client: string;
  name: string;
  clientPhone?: string;
  serviceType: 'WEB_DEV' | 'MOBILE_APP' | 'MARKETING_SEO' | 'UI_UX';
  progress: number; // 0 to 100
  budget: string;
  deadline: string;
  stagingUrl?: string;
  health: 'HEALTHY' | 'NEEDS_ATTENTION' | 'AT_RISK';
  healthReason: string;
  team: string[];
  milestones: Milestone[];
}

const INITIAL_PROJECTS: Project[] = [
  {
    id: 'p1',
    client: 'Nexus Capital',
    name: 'SaaS Trading Dashboard & API Portal',
    clientPhone: '+919876543210',
    serviceType: 'WEB_DEV',
    progress: 75,
    budget: '₹ 4,50,000',
    deadline: 'Due Oct 24',
    stagingUrl: 'https://staging.nexus-portal.grekam.in',
    health: 'HEALTHY',
    healthReason: 'Sprint velocity at 98% • Next demo in 4 days',
    team: ['Stalin (Tech Lead)', 'Ananya (Frontend)', 'Rahul (DevOps)'],
    milestones: [
      { id: 'm1', title: 'Figma Design System & High-fidelity Tokens', completed: true },
      { id: 'm2', title: 'Fastify REST API & Database Migration', completed: true },
      { id: 'm3', title: 'Razorpay / Stripe Payment Subscriptions', completed: true },
      { id: 'm4', title: 'Real-time WebSocket Ticker & Charting', completed: false },
      { id: 'm5', title: 'Production Security Audit & Launch', completed: false },
    ],
  },
  {
    id: 'p2',
    client: 'UrbanVogue Lifestyle',
    name: 'Shopify Plus Redesign & Performance Meta Ads',
    clientPhone: '+919812345678',
    serviceType: 'MARKETING_SEO',
    progress: 90,
    budget: '₹ 1,75,000 / mo',
    deadline: 'Monthly Retainer (Sprint 2)',
    stagingUrl: 'https://urbanvogue-staging.myshopify.com',
    health: 'NEEDS_ATTENTION',
    healthReason: 'Meta ROAS review needed before scaling ad spend',
    team: ['Divya (Growth Marketer)', 'Siddharth (Creative Director)'],
    milestones: [
      { id: 'm6', title: 'Conversion Rate Optimization (CRO) Audit', completed: true },
      { id: 'm7', title: '12x High-converting UGC Video Creatives', completed: true },
      { id: 'm8', title: 'Klaviyo Email Abandoned Cart Sequences', completed: true },
      { id: 'm9', title: 'Meta ROAS Scale Sprint (> 4.2x)', completed: false },
    ],
  },
  {
    id: 'p3',
    client: 'CloudSphere Solutions',
    name: 'Cross-Platform React Native App (iOS & Android)',
    clientPhone: '+919944112233',
    serviceType: 'MOBILE_APP',
    progress: 40,
    budget: '₹ 5,20,000',
    deadline: 'Due Nov 15',
    stagingUrl: 'https://expo.dev/@grekam/cloudsphere-preview',
    health: 'AT_RISK',
    healthReason: 'Apple & Stripe credentials blocked for 48h',
    team: ['Arjun (Mobile Eng)', 'Deepa (QA Lead)'],
    milestones: [
      { id: 'm10', title: 'Offline-first Local SQLite Cache Engine', completed: true },
      { id: 'm11', title: 'Biometric FaceID & Push Notification Setup', completed: true },
      { id: 'm12', title: 'Cloud File Upload & Background Sync', completed: false },
      { id: 'm13', title: 'Apple App Store & Play Store Submissions', completed: false },
    ],
  },
  {
    id: 'p4',
    client: 'FleetLogix Enterprise',
    name: 'Technical SEO Audit & Organic Traffic Surge',
    clientPhone: '+919790123456',
    serviceType: 'MARKETING_SEO',
    progress: 60,
    budget: '₹ 2,90,000',
    deadline: 'Due Nov 02',
    stagingUrl: 'https://fleetlogix.io',
    health: 'HEALTHY',
    healthReason: 'Core Web Vitals 95+ achieved • Retainer healthy',
    team: ['Pooja (SEO Specialist)', 'Harish (Content Strategist)'],
    milestones: [
      { id: 'm14', title: 'Core Web Vitals & PageSpeed 95+ Tuning', completed: true },
      { id: 'm15', title: 'Schema Markup & Programmatic Landing Pages', completed: true },
      { id: 'm16', title: 'High-Authority Backlink Acquisition', completed: false },
    ],
  },
];

export function ProjectsScreen() {
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [blockerProject, setBlockerProject] = useState<Project | null>(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  const filteredProjects = projects.filter((p) => {
    if (selectedType === 'ALL') return true;
    return p.serviceType === selectedType;
  });

  const toggleMilestone = (projectId: string, milestoneId: string) => {
    setProjects((prev) =>
      prev.map((proj) => {
        if (proj.id !== projectId) return proj;
        const updatedMilestones = proj.milestones.map((m) =>
          m.id === milestoneId ? { ...m, completed: !m.completed } : m
        );
        const completedCount = updatedMilestones.filter((m) => m.completed).length;
        const newProgress = Math.round((completedCount / updatedMilestones.length) * 100);
        return {
          ...proj,
          milestones: updatedMilestones,
          progress: newProgress,
        };
      })
    );

    // Update active modal project if open
    if (activeProject && activeProject.id === projectId) {
      setActiveProject((prev) => {
        if (!prev) return null;
        const updatedMilestones = prev.milestones.map((m) =>
          m.id === milestoneId ? { ...m, completed: !m.completed } : m
        );
        const completedCount = updatedMilestones.filter((m) => m.completed).length;
        return {
          ...prev,
          milestones: updatedMilestones,
          progress: Math.round((completedCount / updatedMilestones.length) * 100),
        };
      });
    }
  };

  const sendProgressWhatsApp = (project: Project) => {
    const text =
      `Hello ${project.client}! Here is your live sprint update for "${project.name}":\n\n` +
      `• Progress: ${project.progress}% Complete\n` +
      `• Timeline: ${project.deadline}\n` +
      `• Live Staging Build: ${project.stagingUrl || 'https://staging.grekam.in'}\n\n` +
      `Let us know if you have any questions or feedback!`;
    sendWhatsAppMessage(project.clientPhone || '', text);
  };

  const getServiceBadge = (type: Project['serviceType']) => {
    switch (type) {
      case 'WEB_DEV':
        return { label: 'Web Dev & SaaS', color: '#60a5fa', icon: Globe };
      case 'MOBILE_APP':
        return { label: 'Mobile App', color: '#c084fc', icon: Smartphone };
      case 'MARKETING_SEO':
        return { label: 'SEO & Ads Growth', color: '#34d399', icon: TrendingUp };
      case 'UI_UX':
        return { label: 'UI/UX Design', color: '#f59e0b', icon: Layers };
    }
  };

  return (
    <View style={styles.container}>
      {/* Header Bar */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Client Projects & Sprints</Text>
          <Text style={styles.headerSub}>Active engineering & marketing deliverables</Text>
        </View>

        <TouchableOpacity
          style={styles.headerInvoiceBtn}
          onPress={() => setShowInvoiceModal(true)}
        >
          <CreditCard size={14} color="#34d399" />
          <Text style={styles.headerInvoiceBtnText}>+ Invoice</Text>
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterSection}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {[
            { id: 'ALL', label: 'All Projects' },
            { id: 'WEB_DEV', label: 'Web & SaaS' },
            { id: 'MOBILE_APP', label: 'Mobile Apps' },
            { id: 'MARKETING_SEO', label: 'SEO & Ads' },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[styles.filterPill, selectedType === tab.id && styles.filterPillActive]}
              onPress={() => setSelectedType(tab.id)}
            >
              <Text
                style={[
                  styles.filterPillText,
                  selectedType === tab.id && styles.filterPillTextActive,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Projects List */}
      <ScrollView contentContainerStyle={styles.listContent}>
        {filteredProjects.map((project) => {
          const badge = getServiceBadge(project.serviceType);
          const BadgeIcon = badge.icon;

          return (
            <View key={project.id} style={styles.projectCard}>
              {/* Card Header */}
              <View style={styles.cardHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.clientName}>{project.client}</Text>
                  <Text style={styles.projectName}>{project.name}</Text>
                </View>

                <View style={[styles.typeBadge, { backgroundColor: `${badge.color}22` }]}>
                  <BadgeIcon size={12} color={badge.color} />
                  <Text style={[styles.typeBadgeText, { color: badge.color }]}>{badge.label}</Text>
                </View>
              </View>

              {/* Retainer Health Radar Row */}
              <View style={styles.healthRow}>
                <View
                  style={[
                    styles.healthBadge,
                    project.health === 'HEALTHY'
                      ? styles.healthBadgeGreen
                      : project.health === 'AT_RISK'
                      ? styles.healthBadgeRed
                      : styles.healthBadgeAmber,
                  ]}
                >
                  {project.health === 'HEALTHY' ? (
                    <CheckCircle2 size={11} color="#34d399" />
                  ) : project.health === 'AT_RISK' ? (
                    <AlertTriangle size={11} color="#f43f5e" />
                  ) : (
                    <Clock size={11} color="#f59e0b" />
                  )}
                  <Text
                    style={[
                      styles.healthBadgeText,
                      project.health === 'HEALTHY'
                        ? { color: '#34d399' }
                        : project.health === 'AT_RISK'
                        ? { color: '#f43f5e' }
                        : { color: '#f59e0b' },
                    ]}
                  >
                    {project.health.replace('_', ' ')}
                  </Text>
                </View>
                <Text style={styles.healthReasonText} numberOfLines={1}>
                  {project.healthReason}
                </Text>
              </View>

              {/* Progress Bar */}
              <View style={styles.progressContainer}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressLabel}>Sprint Completion</Text>
                  <Text style={styles.progressValue}>{project.progress}%</Text>
                </View>
                <View style={styles.progressBarTrack}>
                  <View style={[styles.progressBarFill, { width: `${project.progress}%` }]} />
                </View>
              </View>

              {/* Budget & Due Date Row */}
              <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                  <Clock size={12} color={CONFIG.COLORS.textMuted} />
                  <Text style={styles.metaText}>{project.deadline}</Text>
                </View>
                <View style={styles.budgetBadge}>
                  <Text style={styles.budgetText}>{project.budget}</Text>
                </View>
              </View>

              {/* Milestones Preview */}
              <View style={styles.milestoneSection}>
                <Text style={styles.milestoneSectionTitle}>Key Deliverables ({project.milestones.filter(m => m.completed).length}/{project.milestones.length})</Text>
                {project.milestones.slice(0, 3).map((m) => (
                  <TouchableOpacity
                    key={m.id}
                    style={styles.milestoneItem}
                    onPress={() => toggleMilestone(project.id, m.id)}
                  >
                    {m.completed ? (
                      <CheckSquare size={16} color="#34d399" />
                    ) : (
                      <Square size={16} color={CONFIG.COLORS.textMuted} />
                    )}
                    <Text
                      style={[
                        styles.milestoneText,
                        m.completed && styles.milestoneTextCompleted,
                      ]}
                      numberOfLines={1}
                    >
                      {m.title}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Card Footer Actions */}
              <View style={styles.cardFooter}>
                {project.stagingUrl && (
                  <TouchableOpacity
                    style={styles.stagingBtn}
                    onPress={() => Linking.openURL(project.stagingUrl!)}
                  >
                    <ExternalLink size={14} color="#60a5fa" />
                    <Text style={styles.stagingBtnText}>Staging</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={styles.blockerBtn}
                  onPress={() => setBlockerProject(project)}
                >
                  <ShieldAlert size={13} color="#f59e0b" />
                  <Text style={styles.blockerBtnText}>Blocker</Text>
                </TouchableOpacity>

                {(project.health === 'AT_RISK' || project.health === 'NEEDS_ATTENTION') && (
                  <TouchableOpacity
                    style={styles.reassureBtn}
                    onPress={() => {
                      const text = getFounderReassuranceMessage(
                        project.client,
                        project.name,
                        project.healthReason
                      );
                      sendWhatsAppMessage(project.clientPhone || '', text);
                    }}
                  >
                    <HeartPulse size={13} color="#f43f5e" />
                    <Text style={styles.reassureBtnText}>Reassure</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={styles.shareUpdateBtn}
                  onPress={() => sendProgressWhatsApp(project)}
                >
                  <Share2 size={14} color="#34d399" />
                  <Text style={styles.shareUpdateBtnText}>WhatsApp</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.detailsBtn}
                  onPress={() => setActiveProject(project)}
                >
                  <Text style={styles.detailsBtnText}>Checklist</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Deliverables Modal */}
      <Modal
        visible={!!activeProject}
        transparent
        animationType="slide"
        onRequestClose={() => setActiveProject(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalTitle}>{activeProject?.name}</Text>
                <Text style={styles.modalSub}>{activeProject?.client} • {activeProject?.budget}</Text>
              </View>
              <TouchableOpacity onPress={() => setActiveProject(null)}>
                <X size={20} color={CONFIG.COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 380 }}>
              <Text style={styles.modalSectionLabel}>Assigned Sprint Team</Text>
              <View style={styles.teamContainer}>
                {activeProject?.team.map((member) => (
                  <View key={member} style={styles.teamPill}>
                    <Users size={12} color="#94a3b8" />
                    <Text style={styles.teamText}>{member}</Text>
                  </View>
                ))}
              </View>

              <Text style={[styles.modalSectionLabel, { marginTop: 16 }]}>Sprint Deliverables Checklist</Text>
              {activeProject?.milestones.map((m) => (
                <TouchableOpacity
                  key={m.id}
                  style={styles.modalMilestoneItem}
                  onPress={() => activeProject && toggleMilestone(activeProject.id, m.id)}
                >
                  {m.completed ? (
                    <CheckSquare size={18} color="#34d399" />
                  ) : (
                    <Square size={18} color={CONFIG.COLORS.textMuted} />
                  )}
                  <Text
                    style={[
                      styles.modalMilestoneText,
                      m.completed && styles.milestoneTextCompleted,
                    ]}
                  >
                    {m.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={styles.modalPrimaryBtn}
              onPress={() => {
                if (activeProject) sendProgressWhatsApp(activeProject);
              }}
            >
              <Share2 size={16} color="#ffffff" />
              <Text style={styles.modalPrimaryBtnText}>Send Milestone Report on WhatsApp</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Client Blocker Resolver Modal */}
      <Modal
        visible={!!blockerProject}
        transparent
        animationType="slide"
        onRequestClose={() => setBlockerProject(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <ShieldAlert size={18} color="#f59e0b" />
                  <Text style={styles.modalTitle}>Resolve Client Blocker</Text>
                </View>
                <Text style={styles.modalSub}>
                  Ping {blockerProject?.client} for missing assets or credentials
                </Text>
              </View>
              <TouchableOpacity onPress={() => setBlockerProject(null)}>
                <X size={20} color={CONFIG.COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSectionLabel}>Select Blocker Item</Text>
            {[
              'Stripe / Razorpay API Credentials',
              'Domain DNS Access / Cloudflare Config',
              'Brand Assets, Content & Copy Approval',
              'Figma Prototype & Design Sign-off',
            ].map((blocker) => (
              <TouchableOpacity
                key={blocker}
                style={styles.blockerOptionCard}
                onPress={() => {
                  if (blockerProject) {
                    const text = getClientBlockerMessage(
                      blockerProject.client,
                      blockerProject.name,
                      blocker
                    );
                    sendWhatsAppMessage(blockerProject.clientPhone || '', text);
                    setBlockerProject(null);
                  }
                }}
              >
                <ShieldAlert size={16} color="#f59e0b" />
                <Text style={styles.blockerOptionText}>{blocker}</Text>
                <Share2 size={14} color="#34d399" />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      {/* Quick Invoice Modal */}
      <QuickInvoiceModal
        visible={showInvoiceModal}
        onClose={() => setShowInvoiceModal(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CONFIG.COLORS.bgBase,
  },
  header: {
    padding: 16,
    paddingBottom: 10,
    backgroundColor: CONFIG.COLORS.bgBase,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: CONFIG.COLORS.textPrimary,
  },
  headerSub: {
    fontSize: 12,
    color: CONFIG.COLORS.textMuted,
    marginTop: 2,
  },
  filterSection: {
    borderBottomWidth: 1,
    borderBottomColor: CONFIG.COLORS.borderSubtle,
    paddingBottom: 10,
  },
  filterRow: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: CONFIG.COLORS.bgElevated,
    borderWidth: 1,
    borderColor: CONFIG.COLORS.borderSubtle,
  },
  filterPillActive: {
    backgroundColor: CONFIG.COLORS.primary,
    borderColor: CONFIG.COLORS.primary,
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: CONFIG.COLORS.textSecondary,
  },
  filterPillTextActive: {
    color: '#ffffff',
  },
  listContent: {
    padding: 16,
    gap: 16,
  },
  projectCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  clientName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#60a5fa',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  projectName: {
    fontSize: 16,
    fontWeight: '800',
    color: CONFIG.COLORS.textPrimary,
    marginTop: 2,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  healthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  healthBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  healthBadgeGreen: {
    backgroundColor: '#064e3b33',
    borderColor: '#05966944',
  },
  healthBadgeAmber: {
    backgroundColor: '#78350f33',
    borderColor: '#d9770644',
  },
  healthBadgeRed: {
    backgroundColor: '#7f1d1d33',
    borderColor: '#dc262644',
  },
  healthBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  healthReasonText: {
    flex: 1,
    fontSize: 11,
    color: CONFIG.COLORS.textMuted,
  },
  reassureBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#7f1d1d33',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#dc262644',
  },
  reassureBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#f87171',
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 11,
    color: CONFIG.COLORS.textMuted,
    fontWeight: '600',
  },
  progressValue: {
    fontSize: 12,
    fontWeight: '800',
    color: CONFIG.COLORS.primary,
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: CONFIG.COLORS.bgElevated,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: CONFIG.COLORS.primary,
    borderRadius: 3,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 12,
    color: CONFIG.COLORS.textMuted,
    fontWeight: '600',
  },
  budgetBadge: {
    backgroundColor: '#064e3b33',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#05966944',
  },
  budgetText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#34d399',
    fontVariant: ['tabular-nums'],
  },
  milestoneSection: {
    backgroundColor: '#2C2C2E',
    borderRadius: 14,
    padding: 12,
    marginBottom: 14,
  },
  milestoneSectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: CONFIG.COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  milestoneItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  milestoneText: {
    fontSize: 13,
    color: CONFIG.COLORS.textPrimary,
    flex: 1,
  },
  milestoneTextCompleted: {
    color: CONFIG.COLORS.textMuted,
    textDecorationLine: 'line-through',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  stagingBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(10, 132, 255, 0.1)',
    paddingHorizontal: 10,
    height: 34,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(10, 132, 255, 0.25)',
  },
  stagingBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#0A84FF',
  },
  shareUpdateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(48, 209, 88, 0.1)',
    paddingHorizontal: 10,
    height: 34,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(48, 209, 88, 0.25)',
  },
  shareUpdateBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#30D158',
  },
  detailsBtn: {
    flex: 1,
    minWidth: 80,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  detailsBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
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
    maxHeight: '85%',
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
  modalSectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: CONFIG.COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  teamContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  teamPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: CONFIG.COLORS.bgElevated,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: CONFIG.COLORS.borderSubtle,
  },
  teamText: {
    fontSize: 11,
    color: '#cbd5e1',
  },
  modalMilestoneItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: CONFIG.COLORS.bgElevated,
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: CONFIG.COLORS.borderSubtle,
  },
  modalMilestoneText: {
    fontSize: 13,
    color: CONFIG.COLORS.textPrimary,
    flex: 1,
  },
  modalPrimaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#059669',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 16,
  },
  modalPrimaryBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  headerInvoiceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#064e3b33',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#05966955',
  },
  headerInvoiceBtnText: {
    color: '#34d399',
    fontSize: 12,
    fontWeight: '800',
  },
  blockerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#78350f33',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#f59e0b55',
  },
  blockerBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fbbf24',
  },
  blockerOptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: CONFIG.COLORS.bgElevated,
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: CONFIG.COLORS.borderSubtle,
  },
  blockerOptionText: {
    flex: 1,
    color: CONFIG.COLORS.textPrimary,
    fontSize: 13,
    fontWeight: '600',
  },
});
