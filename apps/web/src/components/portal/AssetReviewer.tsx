"use client";

import React, { useState, useRef, useEffect } from 'react';
import { fetchApi, useApi } from '@/lib/useApi';
import { Send, MessageSquare, X } from 'lucide-react';

interface Marker {
  id: string;
  xPercent: number;
  yPercent: number;
  comment: string;
  createdAt: string;
}

interface AssetReviewerProps {
  projectId: string;
  fileId: string;
  fileUrl: string;
  fileType: 'image' | 'video';
  onClose: () => void;
}

export function AssetReviewer({ projectId, fileId, fileUrl, fileType, onClose }: AssetReviewerProps) {
  const { data: existingMarkers, mutate } = useApi<Marker[]>(`/portal/projects/${projectId}/files/${fileId}/markers`);
  
  const [markers, setMarkers] = useState<Marker[]>([]);
  const [activeDraft, setActiveDraft] = useState<{ xPercent: number, yPercent: number } | null>(null);
  const [draftComment, setDraftComment] = useState("");
  
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (existingMarkers) {
      setMarkers(existingMarkers);
    }
  }, [existingMarkers]);

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('.marker-element') || (e.target as HTMLElement).closest('.marker-input')) {
      return;
    }
    
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const xPercent = ((e.clientX - rect.left) / rect.width) * 100;
    const yPercent = ((e.clientY - rect.top) / rect.height) * 100;
    
    setActiveDraft({ xPercent, yPercent });
    setDraftComment("");
  };

  const handleSaveDraft = async () => {
    if (!activeDraft || !draftComment.trim()) return;
    
    try {
      const newMarker = await fetchApi<Marker>(`/portal/projects/${projectId}/files/${fileId}/markers`, {
        method: 'POST',
        body: JSON.stringify({
          xPercent: activeDraft.xPercent,
          yPercent: activeDraft.yPercent,
          comment: draftComment
        })
      });
      
      setMarkers([...markers, newMarker]);
      setActiveDraft(null);
      setDraftComment("");
      mutate();
    } catch (e) {
      console.error(e);
      alert("Failed to save comment");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-8 backdrop-blur-sm">
      <button 
        onClick={onClose}
        className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
      >
        <X className="w-6 h-6" />
      </button>
      
      <div className="relative max-w-[90vw] max-h-[90vh] flex shadow-2xl rounded-lg overflow-hidden bg-[#111]">
        
        {/* Left Side: The Asset */}
        <div 
          className="relative group cursor-crosshair overflow-hidden" 
          ref={containerRef}
          onClick={handleImageClick}
        >
          {fileType === 'image' ? (
            <img 
              src={fileUrl} 
              alt="Asset for review" 
              className="max-h-[90vh] object-contain select-none"
              draggable="false"
            />
          ) : (
            <video 
              src={fileUrl} 
              controls 
              className="max-h-[90vh] max-w-[70vw] object-contain" 
            />
          )}
          
          {markers.map((m, idx) => (
            <div 
              key={m.id}
              className="marker-element absolute w-6 h-6 -ml-3 -mt-3 bg-violet-600 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold text-white shadow-lg cursor-pointer transform hover:scale-125 transition-transform group/pin"
              style={{ left: `${m.xPercent}%`, top: `${m.yPercent}%` }}
              title={m.comment}
            >
              {idx + 1}
              <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 w-48 bg-white text-black p-3 rounded-lg shadow-xl opacity-0 group-hover/pin:opacity-100 pointer-events-none transition-opacity z-10 text-sm text-left">
                <p className="font-semibold text-xs text-violet-600 mb-1">Comment {idx + 1}</p>
                {m.comment}
              </div>
            </div>
          ))}
          
          {activeDraft && (
            <div 
              className="marker-input absolute z-20 flex flex-col items-center"
              style={{ 
                left: `${activeDraft.xPercent}%`, 
                top: `${activeDraft.yPercent}%`,
                transform: 'translate(-50%, -50%)'
              }}
            >
              <div className="w-4 h-4 bg-violet-500 rounded-full border-2 border-white animate-pulse shadow-[0_0_15px_rgba(139,92,246,0.8)]" />
              <div className="mt-2 bg-[#1a1a24] border border-white/10 p-2 rounded-xl shadow-2xl flex gap-2 w-64 items-center">
                <input 
                  type="text" 
                  autoFocus
                  placeholder="Type feedback here..." 
                  value={draftComment}
                  onChange={e => setDraftComment(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSaveDraft()}
                  className="bg-transparent flex-1 text-sm text-white placeholder-white/40 focus:outline-none px-2"
                />
                <button 
                  onClick={handleSaveDraft}
                  className="bg-violet-600 hover:bg-violet-500 p-1.5 rounded-lg text-white transition-colors flex-none"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Right Side: Comments Sidebar */}
        <div className="w-80 bg-[#0d0d12] border-l border-white/5 flex flex-col">
          <div className="p-5 border-b border-white/5 bg-[#12121a]">
            <h3 className="text-white font-semibold flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-violet-400" />
              Feedback ({markers.length})
            </h3>
            <p className="text-xs text-white/50 mt-1">Click anywhere on the image to drop a pin.</p>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {markers.map((m, idx) => (
              <div key={m.id} className="bg-[#1a1a24] p-4 rounded-xl border border-white/5 hover:border-violet-500/30 transition-colors relative group">
                <div className="absolute -left-2 -top-2 w-6 h-6 bg-violet-600 rounded-full border-2 border-[#1a1a24] flex items-center justify-center text-[10px] font-bold text-white shadow-lg">
                  {idx + 1}
                </div>
                <p className="text-sm text-white/90 leading-relaxed pl-2 mt-1">{m.comment}</p>
                <div className="mt-3 text-[10px] text-white/40 font-medium pl-2">
                  {new Date(m.createdAt).toLocaleString()}
                </div>
              </div>
            ))}
            
            {markers.length === 0 && !activeDraft && (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-white/40">
                <MessageSquare className="w-8 h-8 mb-3 opacity-20" />
                <p className="text-sm">No feedback yet.<br/>Click the image to start.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
