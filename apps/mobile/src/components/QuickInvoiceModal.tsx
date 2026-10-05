import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Linking,
  Alert,
  Share,
} from 'react-native';
import { CONFIG } from '../config/constants';
import {
  X,
  CreditCard,
  QrCode,
  Share2,
  CheckCircle2,
  Send,
  Building,
  ExternalLink,
} from 'lucide-react-native';
import { financeService } from '../services/api';
import { sendWhatsAppMessage } from '../services/whatsapp';

interface QuickInvoiceModalProps {
  visible: boolean;
  onClose: () => void;
  defaultClient?: string;
  defaultAmount?: string;
}

export function QuickInvoiceModal({
  visible,
  onClose,
  defaultClient = '',
  defaultAmount = '',
}: QuickInvoiceModalProps) {
  const [clientName, setClientName] = useState(defaultClient || 'Nexus Capital');
  const [clientPhone, setClientPhone] = useState('+919876543210');
  const [amount, setAmount] = useState(defaultAmount || '50000');
  const [description, setDescription] = useState('Sprint 1 Advance Deposit & Milestone');
  const [generatedInvoice, setGeneratedInvoice] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleGenerate = async () => {
    const numAmount = parseFloat(amount.replace(/[^0-9.]/g, ''));
    if (!numAmount || isNaN(numAmount)) {
      Alert.alert('Invalid Amount', 'Please enter a valid milestone amount.');
      return;
    }

    setIsSubmitting(true);
    try {
      const inv = await financeService.createQuickInvoice({
        clientName,
        clientPhone,
        amount: numAmount,
        description,
      });
      setGeneratedInvoice(inv);
    } catch {
      Alert.alert('Error', 'Failed to generate invoice. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendWhatsApp = () => {
    if (!generatedInvoice) return;
    const formattedAmount = `₹ ${Number(generatedInvoice.amount).toLocaleString('en-IN')}`;
    const text =
      `Hello ${clientName}!\n\n` +
      `Here is your invoice & payment link for ${description}:\n\n` +
      `• Invoice No: ${generatedInvoice.invoiceNumber}\n` +
      `• Total Amount: ${formattedAmount}\n` +
      `• Direct UPI Pay: ${generatedInvoice.upiUri}\n` +
      `• Online Invoice & Card Payment: ${generatedInvoice.onlinePaymentUrl}\n\n` +
      `Please confirm once the transfer is completed. Thank you!`;
    sendWhatsAppMessage(clientPhone, text);
  };

  const handleOpenUPI = () => {
    if (!generatedInvoice) return;
    Linking.openURL(generatedInvoice.upiUri).catch(() => {
      Alert.alert('UPI Not Found', 'No supported UPI app (GPay, PhonePe, Paytm) found on this device.');
    });
  };

  const handleReset = () => {
    setGeneratedInvoice(null);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleReset}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>1-Tap Invoice & UPI Link</Text>
              <Text style={styles.sub}>Generate instant milestone payment link</Text>
            </View>
            <TouchableOpacity onPress={handleReset}>
              <X size={20} color={CONFIG.COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          {!generatedInvoice ? (
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Client Selection */}
              <Text style={styles.fieldLabel}>Client / Enterprise Account</Text>
              <View style={styles.inputWrapper}>
                <Building size={16} color={CONFIG.COLORS.textMuted} style={{ marginRight: 8 }} />
                <TextInput
                  style={styles.input}
                  placeholder="Client Name or Company"
                  placeholderTextColor={CONFIG.COLORS.textMuted}
                  value={clientName}
                  onChangeText={setClientName}
                />
              </View>

              {/* Client Phone */}
              <Text style={styles.fieldLabel}>Client WhatsApp Number</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="+91 Phone Number"
                  placeholderTextColor={CONFIG.COLORS.textMuted}
                  value={clientPhone}
                  onChangeText={setClientPhone}
                  keyboardType="phone-pad"
                />
              </View>

              {/* Amount */}
              <Text style={styles.fieldLabel}>Milestone Amount (₹ INR)</Text>
              <View style={styles.inputWrapper}>
                <CreditCard size={16} color={CONFIG.COLORS.textMuted} style={{ marginRight: 8 }} />
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 50000"
                  placeholderTextColor={CONFIG.COLORS.textMuted}
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="numeric"
                />
              </View>

              {/* Quick Amount Chips */}
              <View style={styles.chipsRow}>
                {['25000', '50000', '100000', '250000'].map((chip) => (
                  <TouchableOpacity
                    key={chip}
                    style={[styles.chip, amount === chip && styles.chipActive]}
                    onPress={() => setAmount(chip)}
                  >
                    <Text style={[styles.chipText, amount === chip && styles.chipTextActive]}>
                      ₹ {Number(chip).toLocaleString('en-IN')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Description / Milestone */}
              <Text style={styles.fieldLabel}>Milestone Purpose / Scope</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Sprint 1 Advance, Monthly Retainer"
                  placeholderTextColor={CONFIG.COLORS.textMuted}
                  value={description}
                  onChangeText={setDescription}
                />
              </View>

              {/* Generate Button */}
              <TouchableOpacity
                style={styles.generateBtn}
                onPress={handleGenerate}
                disabled={isSubmitting}
              >
                <CreditCard size={16} color="#000000" />
                <Text style={styles.generateBtnText}>
                  {isSubmitting ? 'Creating Invoice...' : 'Generate Invoice & Payment Link'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          ) : (
            /* Invoice Created Success View */
            <View style={styles.successContainer}>
              <View style={styles.successIconBadge}>
                <CheckCircle2 size={36} color="#34d399" />
              </View>

              <Text style={styles.successTitle}>Invoice Generated Successfully!</Text>
              <Text style={styles.invoiceNumberText}>{generatedInvoice.invoiceNumber}</Text>

              <View style={styles.invoiceSummaryBox}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Client:</Text>
                  <Text style={styles.summaryValue}>{generatedInvoice.clientName}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Milestone:</Text>
                  <Text style={styles.summaryValue}>{generatedInvoice.description}</Text>
                </View>
                <View style={[styles.summaryRow, { borderTopWidth: 1, borderTopColor: '#334155', paddingTop: 8, marginTop: 4 }]}>
                  <Text style={styles.summaryLabelBold}>Payable Amount:</Text>
                  <Text style={styles.summaryValueBold}>
                    ₹ {Number(generatedInvoice.amount).toLocaleString('en-IN')}
                  </Text>
                </View>
              </View>

              {/* Action Buttons */}
              <TouchableOpacity style={styles.whatsappSendBtn} onPress={handleSendWhatsApp}>
                <Share2 size={16} color="#ffffff" />
                <Text style={styles.whatsappSendBtnText}>Share via WhatsApp</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.upiAppBtn} onPress={handleOpenUPI}>
                <QrCode size={16} color="#60a5fa" />
                <Text style={styles.upiAppBtnText}>Open in UPI App (GPay / PhonePe)</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.doneBtn}
                onPress={handleReset}
              >
                <Text style={styles.doneBtnText}>Done</Text>
              </TouchableOpacity>
            </View>
          )}
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
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: CONFIG.COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
    marginTop: 10,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CONFIG.COLORS.bgElevated,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 46,
    borderWidth: 1,
    borderColor: CONFIG.COLORS.borderSubtle,
  },
  input: {
    flex: 1,
    color: CONFIG.COLORS.textPrimary,
    fontSize: 14,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
    marginBottom: 6,
  },
  chip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: CONFIG.COLORS.bgElevated,
    borderWidth: 1,
    borderColor: CONFIG.COLORS.borderSubtle,
  },
  chipActive: {
    backgroundColor: '#064e3b',
    borderColor: '#059669',
  },
  chipText: {
    fontSize: 11,
    fontWeight: '700',
    color: CONFIG.COLORS.textSecondary,
  },
  chipTextActive: {
    color: '#34d399',
  },
  generateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#fbbf24',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 20,
    marginBottom: 10,
  },
  generateBtnText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '800',
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  successIconBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#064e3b33',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#05966944',
  },
  successTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: CONFIG.COLORS.textPrimary,
  },
  invoiceNumberText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#60a5fa',
    marginTop: 4,
    letterSpacing: 0.5,
  },
  invoiceSummaryBox: {
    backgroundColor: CONFIG.COLORS.bgElevated,
    borderRadius: 14,
    padding: 14,
    width: '100%',
    marginVertical: 16,
    borderWidth: 1,
    borderColor: CONFIG.COLORS.borderSubtle,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: CONFIG.COLORS.textMuted,
  },
  summaryValue: {
    fontSize: 12,
    fontWeight: '600',
    color: CONFIG.COLORS.textPrimary,
  },
  summaryLabelBold: {
    fontSize: 13,
    fontWeight: '700',
    color: CONFIG.COLORS.textPrimary,
  },
  summaryValueBold: {
    fontSize: 15,
    fontWeight: '800',
    color: '#34d399',
  },
  whatsappSendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#059669',
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 10,
  },
  whatsappSendBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  upiAppBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#1e3a8a33',
    borderWidth: 1,
    borderColor: '#3b82f644',
    width: '100%',
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 10,
  },
  upiAppBtnText: {
    color: '#60a5fa',
    fontSize: 13,
    fontWeight: '700',
  },
  doneBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    width: '100%',
  },
  doneBtnText: {
    color: CONFIG.COLORS.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
});
