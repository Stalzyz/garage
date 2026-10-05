import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Platform,
  Modal,
} from 'react-native';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { LoginScreen } from './src/screens/LoginScreen';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { LeadsScreen } from './src/screens/LeadsScreen';
import { AttendanceScreen } from './src/screens/AttendanceScreen';
import { ProjectsScreen } from './src/screens/ProjectsScreen';
import { CONFIG } from './src/config/constants';
import {
  LayoutDashboard,
  PhoneCall,
  Clock,
  FolderGit2,
  FileText,
  CreditCard,
  X,
  ChevronRight,
} from 'lucide-react-native';
import { VoiceSOWModal } from './src/components/VoiceSOWModal';
import { QuickInvoiceModal } from './src/components/QuickInvoiceModal';
import { notifications } from './src/services/notifications';
import { offlineSync } from './src/services/offlineSync';

function MainApp() {
  const { isAuthenticated, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'leads' | 'projects' | 'attendance'>('dashboard');

  useEffect(() => {
    if (isAuthenticated) {
      notifications.registerForPushNotificationsAsync();
      offlineSync.flushQueue();
    }
  }, [isAuthenticated]);

  // Quick Action Sheet State
  const [showActionHub, setShowActionHub] = useState(false);
  const [showSOWModal, setShowSOWModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={CONFIG.COLORS.primary} />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return (
    <SafeAreaView style={styles.appContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      {/* Main Screen Content */}
      <View style={styles.screenContent}>
        {activeTab === 'dashboard' && <DashboardScreen onNavigate={(tab: any) => setActiveTab(tab)} />}
        {activeTab === 'leads' && <LeadsScreen />}
        {activeTab === 'projects' && <ProjectsScreen />}
        {activeTab === 'attendance' && <AttendanceScreen />}
      </View>

      {/* Apple-Style Minimal Dock Bar */}
      <View style={styles.tabBar}>
        {/* Tab 1: Pulse */}
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setActiveTab('dashboard')}
          activeOpacity={0.7}
        >
          <LayoutDashboard
            size={20}
            color={activeTab === 'dashboard' ? '#0A84FF' : '#8E8E93'}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === 'dashboard' ? styles.tabTextActive : styles.tabTextInactive,
            ]}
          >
            Pulse
          </Text>
        </TouchableOpacity>

        {/* Tab 2: Leads & Calls */}
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setActiveTab('leads')}
          activeOpacity={0.7}
        >
          <PhoneCall
            size={20}
            color={activeTab === 'leads' ? '#0A84FF' : '#8E8E93'}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === 'leads' ? styles.tabTextActive : styles.tabTextInactive,
            ]}
          >
            CRM
          </Text>
        </TouchableOpacity>

        {/* Tab 3: Projects */}
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setActiveTab('projects')}
          activeOpacity={0.7}
        >
          <FolderGit2
            size={20}
            color={activeTab === 'projects' ? '#0A84FF' : '#8E8E93'}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === 'projects' ? styles.tabTextActive : styles.tabTextInactive,
            ]}
          >
            Projects
          </Text>
        </TouchableOpacity>

        {/* Tab 4: Attendance & Clock-In */}
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setActiveTab('attendance')}
          activeOpacity={0.7}
        >
          <Clock
            size={20}
            color={activeTab === 'attendance' ? '#0A84FF' : '#8E8E93'}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === 'attendance' ? styles.tabTextActive : styles.tabTextInactive,
            ]}
          >
            Clock-In
          </Text>
        </TouchableOpacity>
      </View>

      {/* Apple-Style Quick Action Sheet */}
      <Modal
        visible={showActionHub}
        transparent
        animationType="slide"
        onRequestClose={() => setShowActionHub(false)}
      >
        <View style={styles.sheetOverlay}>
          <View style={styles.sheetCard}>
            {/* iOS Sheet Grabber */}
            <View style={styles.sheetGrabber} />

            <View style={styles.sheetHeader}>
              <View>
                <Text style={styles.sheetTitle}>Agency Shortcuts</Text>
                <Text style={styles.sheetSub}>1-Touch Executive Automations</Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowActionHub(false)}
                style={styles.sheetCloseBtn}
              >
                <X size={16} color={CONFIG.COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Shortcut 1: Voice SOW Proposal */}
            <TouchableOpacity
              style={styles.shortcutRow}
              onPress={() => {
                setShowActionHub(false);
                setTimeout(() => setShowSOWModal(true), 250);
              }}
              activeOpacity={0.7}
            >
              <View style={[styles.shortcutIconBadge, { backgroundColor: 'rgba(10, 132, 255, 0.15)' }]}>
                <FileText size={20} color="#0A84FF" />
              </View>
              <View style={styles.shortcutContent}>
                <Text style={styles.shortcutTitle}>Voice-to-SOW Proposal</Text>
                <Text style={styles.shortcutSub}>Transcribe discovery notes into an interactive client SOW</Text>
              </View>
              <ChevronRight size={18} color={CONFIG.COLORS.textMuted} />
            </TouchableOpacity>

            {/* Shortcut 2: Instant UPI Invoice */}
            <TouchableOpacity
              style={styles.shortcutRow}
              onPress={() => {
                setShowActionHub(false);
                setTimeout(() => setShowInvoiceModal(true), 250);
              }}
              activeOpacity={0.7}
            >
              <View style={[styles.shortcutIconBadge, { backgroundColor: 'rgba(48, 209, 88, 0.15)' }]}>
                <CreditCard size={20} color={CONFIG.COLORS.emerald} />
              </View>
              <View style={styles.shortcutContent}>
                <Text style={styles.shortcutTitle}>Instant UPI Invoice</Text>
                <Text style={styles.shortcutSub}>Generate direct UPI payment link & WhatsApp receipt</Text>
              </View>
              <ChevronRight size={18} color={CONFIG.COLORS.textMuted} />
            </TouchableOpacity>

            {/* Shortcut 3: Shift Punch with FaceID */}
            <TouchableOpacity
              style={styles.shortcutRow}
              onPress={() => {
                setShowActionHub(false);
                setActiveTab('attendance');
              }}
              activeOpacity={0.7}
            >
              <View style={[styles.shortcutIconBadge, { backgroundColor: 'rgba(10, 132, 255, 0.15)' }]}>
                <Clock size={20} color={CONFIG.COLORS.primary} />
              </View>
              <View style={styles.shortcutContent}>
                <Text style={styles.shortcutTitle}>Clock In / Break Tracker</Text>
                <Text style={styles.shortcutSub}>FaceID verified biometric attendance & geo-fence</Text>
              </View>
              <ChevronRight size={18} color={CONFIG.COLORS.textMuted} />
            </TouchableOpacity>

            {/* Shortcut 4: Lead Power Session */}
            <TouchableOpacity
              style={[styles.shortcutRow, { borderBottomWidth: 0 }]}
              onPress={() => {
                setShowActionHub(false);
                setActiveTab('leads');
              }}
              activeOpacity={0.7}
            >
              <View style={[styles.shortcutIconBadge, { backgroundColor: 'rgba(255, 159, 10, 0.15)' }]}>
                <PhoneCall size={20} color={CONFIG.COLORS.amber} />
              </View>
              <View style={styles.shortcutContent}>
                <Text style={styles.shortcutTitle}>Speed-to-Lead CRM</Text>
                <Text style={styles.shortcutSub}>Power dial prospects & drop case study decks</Text>
              </View>
              <ChevronRight size={18} color={CONFIG.COLORS.textMuted} />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Global Quick Modals */}
      <VoiceSOWModal
        visible={showSOWModal}
        onClose={() => setShowSOWModal(false)}
        defaultClient="Nexus Capital"
        defaultPhone="+919876543210"
        onOpenInvoice={() => setShowInvoiceModal(true)}
      />

      <QuickInvoiceModal
        visible={showInvoiceModal}
        onClose={() => setShowInvoiceModal(false)}
      />
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  appContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  screenContent: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    height: Platform.OS === 'ios' ? 82 : 64,
    backgroundColor: '#121214',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingBottom: Platform.OS === 'ios' ? 24 : 8,
    paddingHorizontal: 8,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    height: '100%',
    gap: 3,
  },
  tabText: {
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: -0.1,
  },
  tabTextActive: {
    color: '#0A84FF',
    fontWeight: '600',
  },
  tabTextInactive: {
    color: '#8E8E93',
  },
  sheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.72)',
    justifyContent: 'flex-end',
  },
  sheetCard: {
    backgroundColor: '#1C1C1E',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.12)',
  },
  sheetGrabber: {
    width: 36,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: 'rgba(235, 235, 245, 0.3)',
    alignSelf: 'center',
    marginBottom: 16,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -0.3,
  },
  sheetSub: {
    fontSize: 12,
    color: CONFIG.COLORS.textSecondary,
    marginTop: 2,
  },
  sheetCloseBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(118, 118, 128, 0.24)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shortcutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
    gap: 14,
  },
  shortcutIconBadge: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shortcutContent: {
    flex: 1,
  },
  shortcutTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  shortcutSub: {
    fontSize: 11,
    color: CONFIG.COLORS.textSecondary,
    marginTop: 2,
  },
});
