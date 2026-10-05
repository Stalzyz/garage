import * as LocalAuthentication from 'expo-local-authentication';
import { Platform } from 'react-native';

export const biometrics = {
  /**
   * Check if device hardware supports biometrics (FaceID / Fingerprint)
   */
  async isAvailable(): Promise<boolean> {
    if (Platform.OS === 'web') return false;
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    return hasHardware && isEnrolled;
  },

  /**
   * Get biometrics label ('FaceID' or 'Fingerprint')
   */
  async getBiometricType(): Promise<string> {
    if (Platform.OS === 'web') return 'Biometrics';
    const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
    if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
      return 'FaceID';
    }
    if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
      return 'Fingerprint';
    }
    return 'Biometrics';
  },

  /**
   * Prompt biometric sensor
   */
  async authenticate(promptMessage = 'Unlock Grekam OS Workspace'): Promise<boolean> {
    if (Platform.OS === 'web') return false;
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage,
        fallbackLabel: 'Use Passcode',
        cancelLabel: 'Cancel',
        disableDeviceFallback: false,
      });
      return result.success;
    } catch {
      return false;
    }
  }
};
