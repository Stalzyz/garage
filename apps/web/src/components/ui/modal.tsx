"use client";

import { useEffect, ReactNode } from "react";
import { X } from "lucide-react";

interface ModalProps {
  children: ReactNode;
  onClose: () => void;
}

export function Modal({ children, onClose }: ModalProps) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative bg-[#1c1c1e] border border-white/[0.08] rounded-2xl shadow-[0_24px_48px_rgba(0,0,0,0.7)] overflow-hidden max-h-[90vh] flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 text-zinc-400 hover:text-white bg-white/[0.06] hover:bg-white/[0.12] rounded-full transition-colors z-10"
        >
          <X className="w-3.5 h-3.5" />
        </button>
        {children}
      </div>
    </div>
  );
}
