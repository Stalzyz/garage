"use client"

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, X } from 'lucide-react';
import { useWebsocket } from '@/lib/useWebsocket';

export function TelemetryNotifier() {
  const [notifications, setNotifications] = useState<any[]>([]);
  useWebsocket(); // Initialize the websocket connection

  useEffect(() => {
    const handleTelemetry = (e: any) => {
      const payload = e.detail;
      if (payload.type === 'CONNECTED') return;
      
      const eventName = payload.payload?.event || payload.event || payload.type;
      const eventData = payload.payload?.data || payload.data || payload.payload;
      
      if (!eventName) return;

      const newNotif = {
        id: Date.now(),
        event: eventName,
        data: eventData
      };
      
      setNotifications(prev => [newNotif, ...prev].slice(0, 5)); // Keep last 5

      // Auto dismiss after 5 seconds
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== newNotif.id));
      }, 5000);
    };

    window.addEventListener('telemetry-event', handleTelemetry);
    return () => window.removeEventListener('telemetry-event', handleTelemetry);
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none">
      <AnimatePresence>
        {notifications.map((notif) => (
          <motion.div
            key={notif.id}
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className="pointer-events-auto bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-[0_10px_40px_rgba(0,0,0,0.5)] w-80 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex items-start gap-3 relative z-10">
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center flex-none">
                <Activity className="w-4 h-4 text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-mono tracking-widest uppercase font-bold text-blue-400 mb-1">Live Telemetry</p>
                <h4 className="text-sm font-bold text-white truncate">{notif.event}</h4>
                <p className="text-xs text-white/60 mt-1 line-clamp-2">
                  {JSON.stringify(notif.data)}
                </p>
              </div>
              <button 
                onClick={() => setNotifications(prev => prev.filter(n => n.id !== notif.id))}
                className="text-white/40 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
