import React, { useEffect } from "react"
import { X } from "lucide-react"

interface SlideOverProps {
  open?: boolean
  isOpen?: boolean
  onClose: () => void
  title: string
  subtitle?: string
  description?: string
  children: React.ReactNode
}

export function SlideOver({ open, isOpen, onClose, title, subtitle, description, children }: SlideOverProps) {
  const isVisible = Boolean(open ?? isOpen ?? false)
  const subText = subtitle || description

  useEffect(() => {
    if (isVisible) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => { document.body.style.overflow = 'unset' }
  }, [isVisible])

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-end md:items-stretch justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />
      
      {/* Panel */}
      <div className="relative w-full max-w-md h-[90vh] md:h-full bg-[#0a0a0a] border-t md:border-t-0 md:border-l border-white/10 shadow-2xl flex flex-col animate-in slide-in-from-bottom md:slide-in-from-right duration-300 rounded-t-[2rem] md:rounded-none">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-lg font-bold text-white">{title}</h2>
            {subText && <p className="text-sm text-white/50 mt-1">{subText}</p>}
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 text-white custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  )
}
