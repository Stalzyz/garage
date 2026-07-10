"use client";

import React, { useState } from 'react';
import { fetchApi, useApi } from '@/lib/useApi';
import { Send, MessageSquare, Plus, Clock, CheckCircle, Loader2, User } from 'lucide-react';

interface Ticket {
  id: string;
  subject: string;
  status: string;
  priority: string;
  createdAt: string;
  updatedAt: string;
}

interface TicketMessage {
  id: string;
  message: string;
  senderId: string;
  createdAt: string;
  isInternal: boolean;
}

export function SupportTickets() {
  const { data: tickets, mutate: mutateTickets, isLoading } = useApi<Ticket[]>("/portal/tickets");
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newSubject, setNewSubject] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [replyMessage, setReplyMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: activeTicketDetails, mutate: mutateDetails } = useApi<{ id: string, subject: string, status: string, messages: TicketMessage[] }>(
    activeTicketId ? `/portal/tickets/${activeTicketId}` : null
  );

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.trim() || !newMessage.trim()) return;
    
    setIsSubmitting(true);
    try {
      await fetchApi<Ticket>('/portal/tickets', {
        method: 'POST',
        body: JSON.stringify({
          subject: newSubject,
          message: newMessage,
          priority: 'NORMAL'
        })
      });
      setNewSubject("");
      setNewMessage("");
      setIsCreating(false);
      mutateTickets();
    } catch (err) {
      alert("Failed to create ticket");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyMessage.trim() || !activeTicketId) return;
    
    setIsSubmitting(true);
    try {
      await fetchApi(`/portal/tickets/${activeTicketId}/messages`, {
        method: 'POST',
        body: JSON.stringify({ message: replyMessage })
      });
      setReplyMessage("");
      mutateDetails();
    } catch (err) {
      alert("Failed to send reply");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-12"><Loader2 className="w-6 h-6 animate-spin text-white/50" /></div>;
  }

  return (
    <div className="flex bg-[#14141f] border border-white/8 rounded-2xl overflow-hidden h-[600px]">
      
      {/* Sidebar: List of Tickets */}
      <div className="w-1/3 border-r border-white/8 flex flex-col bg-[#0d0d14]">
        <div className="p-4 border-b border-white/8 flex justify-between items-center">
          <h3 className="font-bold text-white flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-violet-400" /> Support
          </h3>
          <button 
            onClick={() => { setIsCreating(true); setActiveTicketId(null); }}
            className="p-1.5 bg-violet-600/20 text-violet-400 hover:bg-violet-600 hover:text-white rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {tickets?.length === 0 ? (
            <div className="p-8 text-center text-white/40 text-sm">No tickets found.</div>
          ) : (
            tickets?.map(t => (
              <button
                key={t.id}
                onClick={() => { setActiveTicketId(t.id); setIsCreating(false); }}
                className={`w-full text-left p-4 border-b border-white/5 hover:bg-white/5 transition-colors ${activeTicketId === t.id ? 'bg-white/5 border-l-2 border-l-violet-500' : ''}`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="font-semibold text-white text-sm truncate pr-2">{t.subject}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    t.status === 'OPEN' ? 'bg-blue-500/20 text-blue-400' :
                    t.status === 'RESOLVED' || t.status === 'CLOSED' ? 'bg-emerald-500/20 text-emerald-400' :
                    'bg-amber-500/20 text-amber-400'
                  }`}>
                    {t.status}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs text-white/40">
                  <Clock className="w-3 h-3" /> {new Date(t.updatedAt).toLocaleDateString()}
                </div>
              </button>
            ))
          )}
        </div>
      </div>
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col bg-[#14141f]">
        {isCreating ? (
          <div className="p-8 max-w-xl">
            <h2 className="text-xl font-bold text-white mb-6">Create Support Ticket</h2>
            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-white/50 mb-1 uppercase tracking-wider">Subject</label>
                <input 
                  type="text" 
                  value={newSubject}
                  onChange={e => setNewSubject(e.target.value)}
                  placeholder="e.g. Revision request for video..."
                  className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-violet-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-white/50 mb-1 uppercase tracking-wider">Message</label>
                <textarea 
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  placeholder="Describe your issue or request..."
                  className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-violet-500 h-32 resize-none"
                  required
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setIsCreating(false)} className="px-4 py-2 text-sm text-white/50 hover:text-white transition-colors">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-bold rounded-xl transition-all disabled:opacity-50 flex items-center gap-2">
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Submit Ticket
                </button>
              </div>
            </form>
          </div>
        ) : activeTicketId && activeTicketDetails ? (
          <>
            <div className="p-6 border-b border-white/8 bg-[#1a1a26]">
              <h2 className="text-lg font-bold text-white">{activeTicketDetails.subject}</h2>
              <p className="text-xs text-white/50 mt-1">Ticket ID: {activeTicketDetails.id}</p>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {activeTicketDetails.messages?.map((msg, idx) => {
                const isMyMessage = idx % 2 === 0; // Simple simulation for styling
                return (
                  <div key={msg.id} className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-2xl p-4 ${isMyMessage ? 'bg-violet-600 text-white rounded-br-none' : 'bg-[#222233] text-white/90 rounded-bl-none border border-white/5'}`}>
                      <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                      <span className="text-[10px] opacity-50 mt-2 block">{new Date(msg.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                )
              })}
            </div>
            
            <div className="p-4 border-t border-white/8 bg-[#0a0a0f]">
              <form onSubmit={handleReply} className="flex gap-2">
                <input 
                  type="text" 
                  value={replyMessage}
                  onChange={e => setReplyMessage(e.target.value)}
                  placeholder="Type a reply..."
                  className="flex-1 bg-[#1a1a26] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-violet-500"
                />
                <button type="submit" disabled={isSubmitting || !replyMessage.trim()} className="px-4 bg-violet-600 hover:bg-violet-500 text-white rounded-xl transition-all disabled:opacity-50">
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-white/30 h-full">
            <MessageSquare className="w-12 h-12 mb-4 opacity-20" />
            <p>Select a ticket or create a new one.</p>
          </div>
        )}
      </div>
    </div>
  );
}
