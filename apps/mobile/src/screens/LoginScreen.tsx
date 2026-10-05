import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { CONFIG } from '../config/constants';
import { ShieldCheck, Mail, Lock, Building2, Users, ScanFace } from 'lucide-react-native';

export function LoginScreen() {
  const { login, demoLogin, biometricUnlock, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Missing Credentials', 'Please enter both your work email and password.');
      return;
    }
    await login(email, password);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Header Branding */}
        <View style={styles.brandContainer}>
          <View style={styles.logoBadge}>
            <ShieldCheck size={36} color={CONFIG.COLORS.primary} strokeWidth={2.2} />
          </View>
          <Text style={styles.brandTitle}>Grekam OS</Text>
          <Text style={styles.brandSubtitle}>Digital Agency & Enterprise Pocket Suite</Text>
        </View>

        {/* Input Card */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Sign In to Workspace</Text>

          {/* Email Input */}
          <View style={styles.inputWrapper}>
            <Mail size={18} color={CONFIG.COLORS.textMuted} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Work Email"
              placeholderTextColor={CONFIG.COLORS.textMuted}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          {/* Password Input */}
          <View style={styles.inputWrapper}>
            <Lock size={18} color={CONFIG.COLORS.textMuted} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor={CONFIG.COLORS.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          {/* Primary Submit Button */}
          <TouchableOpacity
            style={[styles.primaryButton, isLoading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryButtonText}>Sign In</Text>
            )}
          </TouchableOpacity>

          {/* Biometric Quick Unlock */}
          <TouchableOpacity
            style={[styles.biometricButton, isLoading && styles.buttonDisabled]}
            onPress={biometricUnlock}
            disabled={isLoading}
          >
            <ScanFace size={20} color="#60a5fa" />
            <Text style={styles.biometricButtonText}>Quick Unlock with FaceID</Text>
          </TouchableOpacity>
        </View>

        {/* 1-Tap Demo Test Drive Section */}
        <View style={styles.demoSection}>
          <View style={styles.demoDivider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>Instant Demo Test-Drive</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.demoButtonsRow}>
            {/* Agency Founder Button */}
            <TouchableOpacity
              style={styles.demoButtonEmerald}
              onPress={() => demoLogin('GARAGE')}
              disabled={isLoading}
            >
              <Building2 size={16} color="#34d399" />
              <Text style={styles.demoButtonTextEmerald}>Agency Founder</Text>
            </TouchableOpacity>

            {/* Partner Button */}
            <TouchableOpacity
              style={styles.demoButtonPurple}
              onPress={() => demoLogin('PARTNER')}
              disabled={isLoading}
            >
              <Users size={16} color="#c084fc" />
              <Text style={styles.demoButtonTextPurple}>Whitelabel Partner</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.demoHint}>
            Tap either demo role above for instant preview with client pipeline, sprints, and team attendance.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CONFIG.COLORS.bgBase,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: CONFIG.COLORS.textPrimary,
    letterSpacing: -0.5,
  },
  brandSubtitle: {
    fontSize: 14,
    color: CONFIG.COLORS.textSecondary,
    marginTop: 4,
  },
  card: {
    backgroundColor: CONFIG.COLORS.bgSurface,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: CONFIG.COLORS.borderSubtle,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: CONFIG.COLORS.textPrimary,
    marginBottom: 20,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CONFIG.COLORS.bgElevated,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: CONFIG.COLORS.borderStrong,
    marginBottom: 16,
    paddingHorizontal: 14,
    height: 50,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: CONFIG.COLORS.textPrimary,
    fontSize: 15,
  },
  primaryButton: {
    backgroundColor: CONFIG.COLORS.primary,
    borderRadius: 12,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    shadowColor: CONFIG.COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  biometricButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#1e293b66',
    borderWidth: 1,
    borderColor: '#3b82f644',
    borderRadius: 12,
    height: 48,
    marginTop: 12,
  },
  biometricButtonText: {
    color: '#93c5fd',
    fontSize: 14,
    fontWeight: '700',
  },
  demoSection: {
    marginTop: 36,
  },
  demoDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: CONFIG.COLORS.borderSubtle,
  },
  dividerText: {
    color: CONFIG.COLORS.textMuted,
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  demoButtonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  demoButtonEmerald: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#064e3b33',
    borderWidth: 1,
    borderColor: '#05966966',
    borderRadius: 12,
    paddingVertical: 14,
  },
  demoButtonTextEmerald: {
    color: '#34d399',
    fontSize: 13,
    fontWeight: '700',
  },
  demoButtonPurple: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#581c8733',
    borderWidth: 1,
    borderColor: '#9333ea66',
    borderRadius: 12,
    paddingVertical: 14,
  },
  demoButtonTextPurple: {
    color: '#c084fc',
    fontSize: 13,
    fontWeight: '700',
  },
  demoHint: {
    textAlign: 'center',
    color: CONFIG.COLORS.textMuted,
    fontSize: 11,
    marginTop: 12,
    lineHeight: 16,
  },
});
