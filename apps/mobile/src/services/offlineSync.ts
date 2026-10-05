import { storage, apiFetch } from './api';
import { notifications } from './notifications';

export interface PendingAction {
  id: string;
  type: 'CLOCK_IN' | 'CLOCK_OUT' | 'LOG_CALL_OUTCOME' | 'UPDATE_TASK' | 'CREATE_INVOICE';
  endpoint: string;
  method: 'POST' | 'PATCH' | 'PUT';
  payload: any;
  createdAt: string;
}

const STORAGE_KEY_QUEUE = 'grekam_offline_queue';

export const offlineSync = {
  /**
   * Save an action to offline queue if network fails
   */
  async enqueue(
    type: PendingAction['type'],
    endpoint: string,
    method: PendingAction['method'],
    payload: any
  ): Promise<PendingAction> {
    const queue = await this.getQueue();
    const newItem: PendingAction = {
      id: `off_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      type,
      endpoint,
      method,
      payload,
      createdAt: new Date().toISOString(),
    };

    queue.push(newItem);
    await storage.setItem(STORAGE_KEY_QUEUE, JSON.stringify(queue));
    await notifications.triggerLocalAlert(
      'Action Saved Offline',
      'Your request was saved locally and will auto-sync when network connects.'
    );
    return newItem;
  },

  /**
   * Get all pending offline actions
   */
  async getQueue(): Promise<PendingAction[]> {
    try {
      const raw = await storage.getItem(STORAGE_KEY_QUEUE);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  /**
   * Clear the offline queue
   */
  async clearQueue(): Promise<void> {
    await storage.removeItem(STORAGE_KEY_QUEUE);
  },

  /**
   * Attempt to sync all pending items in the queue with backend API
   */
  async flushQueue(): Promise<{ synced: number; failed: number }> {
    const queue = await this.getQueue();
    if (queue.length === 0) return { synced: 0, failed: 0 };

    let syncedCount = 0;
    const remaining: PendingAction[] = [];

    for (const item of queue) {
      try {
        await apiFetch(item.endpoint, {
          method: item.method,
          body: JSON.stringify(item.payload),
        });
        syncedCount++;
      } catch {
        // Retain in queue if network error persists
        remaining.push(item);
      }
    }

    await storage.setItem(STORAGE_KEY_QUEUE, JSON.stringify(remaining));

    if (syncedCount > 0) {
      await notifications.triggerLocalAlert(
        'Offline Queue Synced',
        `Successfully auto-synced ${syncedCount} item(s) to cloud server.`
      );
    }

    return { synced: syncedCount, failed: remaining.length };
  },
};
