import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { CONFIG } from '../config/constants';

// Platform-safe storage helper
export const storage = {
  async getItem(key: string): Promise<string | null> {
    try {
      if (Platform.OS === 'web') {
        return typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null;
      }
      return await SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  },
  async setItem(key: string, value: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        if (typeof localStorage !== 'undefined') localStorage.setItem(key, value);
        return;
      }
      await SecureStore.setItemAsync(key, value);
    } catch {}
  },
  async removeItem(key: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        if (typeof localStorage !== 'undefined') localStorage.removeItem(key);
        return;
      }
      await SecureStore.deleteItemAsync(key);
    } catch {}
  },
};

// Generic API fetch wrapper with token injection
export async function apiFetch<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = await storage.getItem(CONFIG.STORAGE_TOKEN);

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    headers['Cookie'] = `authjs.session-token=${token}; __Secure-authjs.session-token=${token}`;
  }

  const url = endpoint.startsWith('http') ? endpoint : `${CONFIG.API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorJson: any = null;
      try {
        errorJson = JSON.parse(errorText);
      } catch {}
      throw new Error(errorJson?.message || errorJson?.error || `HTTP ${response.status}`);
    }

    return await response.json();
  } catch (err: any) {
    console.warn(`[API] Call to ${endpoint} failed:`, err.message);
    throw err;
  }
}

// Agency API Services
export const crmService = {
  async getContacts() {
    try {
      return await apiFetch('/crm/contacts');
    } catch {
      return null; // Graceful fallback to offline/demo data
    }
  },

  async logOutcome(contactId: string, outcome: string, notes?: string) {
    try {
      return await apiFetch(`/crm/contacts/${contactId}/notes`, {
        method: 'POST',
        body: JSON.stringify({ content: `Call Outcome: ${outcome}. ${notes || ''}` }),
      });
    } catch {
      return null;
    }
  },
};

export const financeService = {
  async createQuickInvoice(data: {
    clientName: string;
    clientEmail?: string;
    clientPhone?: string;
    amount: number;
    description: string;
  }) {
    const invoiceNumber = `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const upiUri = `upi://pay?pa=billing@grekam.in&pn=Grekam%20OS&am=${data.amount}&cu=INR&tn=${encodeURIComponent(
      data.description
    )}`;
    const onlinePaymentUrl = `https://garage.grekam.in/verify/invoice/${invoiceNumber}`;

    try {
      // Attempt to sync with Fastify backend if online
      await apiFetch('/finance/invoices', {
        method: 'POST',
        body: JSON.stringify({
          invoiceNumber,
          clientName: data.clientName,
          clientEmail: data.clientEmail || 'billing@client.com',
          totalAmount: data.amount,
          status: 'UNPAID',
          description: data.description,
        }),
      });
    } catch (e) {
      console.log('[Finance] Offline or demo mode invoice created:', invoiceNumber);
    }

    return {
      invoiceNumber,
      amount: data.amount,
      clientName: data.clientName,
      description: data.description,
      upiUri,
      onlinePaymentUrl,
      createdAt: new Date().toISOString(),
    };
  },
};

export const attendanceService = {
  async getTelemetry(employeeId = 'current_user') {
    try {
      return await apiFetch(`/hr/attendance/telemetry/${employeeId}`);
    } catch {
      return null;
    }
  },

  async clockIn(data: { latitude: number; longitude: number; note?: string }) {
    try {
      return await apiFetch('/hr/attendance/clock-in', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch {
      return null;
    }
  },

  async clockOut(data: { latitude: number; longitude: number; note?: string }) {
    try {
      return await apiFetch('/hr/attendance/clock-out', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch {
      return null;
    }
  },

  async toggleBreak(action: 'START' | 'END') {
    try {
      return await apiFetch('/hr/attendance/break', {
        method: 'POST',
        body: JSON.stringify({ action }),
      });
    } catch {
      return null;
    }
  },
};

export const taskService = {
  async updateStatus(taskId: string, status: string) {
    try {
      return await apiFetch(`/projects/tasks/${taskId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
    } catch {
      return null;
    }
  },
};

