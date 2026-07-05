"use client";

import { motion } from "framer-motion";
import { Send, MapPin, Phone, Mail } from "lucide-react";

export function ContactForm() {
  return (
    <section className="py-24" id="contact">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col lg:flex-row gap-12 bg-background border border-border rounded-[32px] overflow-hidden shadow-sm">
          
          {/* Left: Contact Info */}
          <div className="w-full lg:w-2/5 bg-[#0f172a] text-white p-10 md:p-14 relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#49abc9]/20 to-transparent pointer-events-none" />
            <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-[#2ecc71]/20 rounded-full blur-3xl" />
            
            <div className="relative z-10 mb-12">
              <h3 className="text-3xl font-bold mb-4">Get in Touch</h3>
              <p className="text-gray-300 leading-relaxed">
                Have questions about our programs or admissions? Reach out to our team and we'll get back to you shortly.
              </p>
            </div>

            <div className="relative z-10 space-y-8">
              <div className="flex items-start gap-4">
                <MapPin className="text-[#49abc9] shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold mb-1">Our Campus</h4>
                  <p className="text-gray-400">Coimbatore, Tamil Nadu, India</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Phone className="text-[#49abc9] shrink-0" />
                <div>
                  <h4 className="font-semibold mb-1">Phone</h4>
                  <p className="text-gray-400">+91 98765 43210</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Mail className="text-[#49abc9] shrink-0" />
                <div>
                  <h4 className="font-semibold mb-1">Email</h4>
                  <p className="text-gray-400">admissions@grekam.in</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Form */}
          <div className="w-full lg:w-3/5 p-10 md:p-14">
            <h3 className="text-2xl font-bold mb-8">Send us a message</h3>
            
            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">First Name</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 bg-muted/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#49abc9]/50 transition-shadow"
                    placeholder="John"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Last Name</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 bg-muted/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#49abc9]/50 transition-shadow"
                    placeholder="Doe"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Email Address</label>
                <input 
                  type="email" 
                  className="w-full px-4 py-3 bg-muted/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#49abc9]/50 transition-shadow"
                  placeholder="john@example.com"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Course of Interest</label>
                <select className="w-full px-4 py-3 bg-muted/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#49abc9]/50 transition-shadow text-foreground">
                  <option>Graphic Designing</option>
                  <option>UI/UX Designing</option>
                  <option>Web Development</option>
                  <option>Other</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Message</label>
                <textarea 
                  rows={4}
                  className="w-full px-4 py-3 bg-muted/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#49abc9]/50 transition-shadow resize-none"
                  placeholder="How can we help you?"
                ></textarea>
              </div>

              <button 
                type="submit"
                className="w-full sm:w-auto px-8 py-4 bg-gradient-academy text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-[#49abc9]/20 hover:shadow-[#49abc9]/40 hover:-translate-y-0.5 transition-all"
              >
                Send Message
                <Send size={18} />
              </button>
            </form>
          </div>

        </div>
      </div>
    </section>
  );
}
