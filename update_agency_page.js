const fs = require('fs');
let content = fs.readFileSync('apps/web/app/agency/page.tsx', 'utf-8');

// 1. CHOOSE CONCEPT -> CHOOSE THEME & Gradient button
content = content.replace(
  `Choose Concept <ChevronDown className="w-3 h-3" />`,
  `CHOOSE THEME <ChevronDown className="w-3 h-3" />`
);
content = content.replace(
  `\${isBrutal ? 'bg-white border-black text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' : 
                 isLightMode ? 'bg-white/80 border-black/20 text-black hover:bg-white' : 'bg-black/50 border-white/20 text-white hover:bg-black/80'}\`}`,
  `bg-gradient-to-r from-[#218558] to-[#0E4E7E] text-white border-none hover:opacity-90 shadow-[0_0_20px_rgba(33,133,88,0.3)]\`}`
);


// 2. Creative OS close button z-index
content = content.replace(
  `className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none p-4 md:p-12 mb-24 md:mb-32"`,
  `className="fixed inset-0 z-[120] flex items-center justify-center pointer-events-none p-4 md:p-12 mb-24 md:mb-32"`
);


// 3. Digital Gallery contact form displacement
const oldDigitalGalleryCard = `                 <div className="aspect-[3/4] flex flex-col items-center justify-center p-8 relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    <div className="scale-[2] md:scale-[3] drop-shadow-[0_0_30px_rgba(255,255,255,0.1)] transition-transform duration-700 md:group-hover:scale-[3.5] mb-20" style={{ color: card.colorHex }}>{renderIcon(card.iconName, card.icon)}</div>
                    
                    <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 bg-gradient-to-t from-black via-black/80 to-transparent translate-y-8 md:translate-y-full md:group-hover:translate-y-0 transition-transform duration-500 flex flex-col items-center text-center">
                       <h3 className="text-white text-xl md:text-2xl uppercase tracking-[0.2em] mb-2">{card.title}</h3>
                       <p className="text-zinc-400 text-xs md:text-sm mb-6">{card.subtitle}</p>
                       {!(card.id === 'contact_form' || card.isContactForm) && (
                          <button onClick={() => {
                             if (card.isAcademy) window.location.href = '/academy';
                             else if (card.isCrm) window.location.href = '/dashboard/crm';
                             else if (card.isHrm) window.location.href = '/dashboard/hr';
                          }} className="px-6 py-3 border border-white/30 text-white/70 hover:text-white hover:border-white uppercase tracking-widest text-[10px] transition-all">
                             {card.cta}
                          </button>
                       )}
                    </div>
                 </div>

                 {card.projects && (
                    <div className="bg-black border-t border-[#333] flex flex-row overflow-x-auto h-0 group-hover:h-32 transition-all duration-700">
                       {card.projects.map(proj => (
                          <div key={proj.id} className="w-32 h-full shrink-0 border-r border-[#333] overflow-hidden relative">
                             <img src={proj.image} className="w-full h-full object-cover opacity-50 hover:opacity-100 transition-opacity cursor-pointer" />
                             <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black to-transparent text-[8px] text-white font-bold uppercase tracking-widest text-center truncate">{proj.title}</div>
                          </div>
                       ))}
                    </div>
                 )}
              </div>
              
              {(card.id === 'contact_form' || card.isContactForm) && (
                 <div className="w-full mt-12 bg-[#111] p-6 md:p-8 border border-[#222]">
                    <UniversalContactForm 
                       ctaText={card.cta} 
                       inputClass="p-3 w-full bg-black border border-[#333] rounded-none outline-none focus:border-[#666] text-white text-sm placeholder:text-white/30"
                       btnClass="p-4 w-full bg-white text-black uppercase tracking-widest text-[10px] font-bold hover:bg-zinc-200 mt-4 flex items-center justify-center gap-2"
                    />
                 </div>
              )}`;

const newDigitalGalleryCard = `                 {!(card.id === 'contact_form' || card.isContactForm) ? (
                   <>
                     <div className="aspect-[3/4] flex flex-col items-center justify-center p-8 relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                        <div className="scale-[2] md:scale-[3] drop-shadow-[0_0_30px_rgba(255,255,255,0.1)] transition-transform duration-700 md:group-hover:scale-[3.5] mb-20" style={{ color: card.colorHex }}>{renderIcon(card.iconName, card.icon)}</div>
                        
                        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 bg-gradient-to-t from-black via-black/80 to-transparent translate-y-8 md:translate-y-full md:group-hover:translate-y-0 transition-transform duration-500 flex flex-col items-center text-center">
                           <h3 className="text-white text-xl md:text-2xl uppercase tracking-[0.2em] mb-2">{card.title}</h3>
                           <p className="text-zinc-400 text-xs md:text-sm mb-6">{card.subtitle}</p>
                           <button onClick={() => {
                              if (card.isAcademy) window.location.href = '/academy';
                              else if (card.isCrm) window.location.href = '/dashboard/crm';
                              else if (card.isHrm) window.location.href = '/dashboard/hr';
                           }} className="px-6 py-3 border border-white/30 text-white/70 hover:text-white hover:border-white uppercase tracking-widest text-[10px] transition-all">
                              {card.cta}
                           </button>
                        </div>
                     </div>
                     {card.projects && (
                        <div className="bg-black border-t border-[#333] flex flex-row overflow-x-auto h-0 group-hover:h-32 transition-all duration-700">
                           {card.projects.map(proj => (
                              <div key={proj.id} className="w-32 h-full shrink-0 border-r border-[#333] overflow-hidden relative">
                                 <img src={proj.image} className="w-full h-full object-cover opacity-50 hover:opacity-100 transition-opacity cursor-pointer" />
                                 <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black to-transparent text-[8px] text-white font-bold uppercase tracking-widest text-center truncate">{proj.title}</div>
                              </div>
                           ))}
                        </div>
                     )}
                   </>
                 ) : (
                    <div className="flex flex-col w-full h-full p-8 md:p-12 justify-center bg-[#111]">
                       <h3 className="text-white text-xl md:text-2xl uppercase tracking-[0.2em] mb-2 text-center">{card.title}</h3>
                       <p className="text-zinc-400 text-xs md:text-sm mb-6 text-center">{card.subtitle}</p>
                       <UniversalContactForm 
                          ctaText={card.cta} 
                          inputClass="p-3 w-full bg-black border border-[#333] rounded-none outline-none focus:border-[#666] text-white text-sm placeholder:text-white/30"
                          btnClass="p-4 w-full bg-white text-black uppercase tracking-widest text-[10px] font-bold hover:bg-zinc-200 mt-4 flex items-center justify-center gap-2"
                       />
                    </div>
                 )}
              </div>`;
content = content.replace(oldDigitalGalleryCard, newDigitalGalleryCard);


// 4. Default country code +91
content = content.replace(
  `<select name="countryCode" className={\`\${inputClass} w-24 md:w-32 appearance-none text-center bg-transparent cursor-pointer [&>option]:text-black\`}>
          <option value="+1">🇺🇸 +1</option>
          <option value="+44">🇬🇧 +44</option>
          <option value="+91">🇮🇳 +91</option>`,
  `<select name="countryCode" defaultValue="+91" className={\`\${inputClass} w-24 md:w-32 appearance-none text-center bg-transparent cursor-pointer [&>option]:text-black\`}>
          <option value="+91">🇮🇳 +91</option>
          <option value="+1">🇺🇸 +1</option>
          <option value="+44">🇬🇧 +44</option>`
);


// 5. Creative Universe close button 
const oldUniverseClose = `<motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} className="absolute bottom-0 md:bottom-10 left-0 right-0 z-50 flex justify-center p-4 pointer-events-none">
              <div className="pointer-events-auto w-full max-w-4xl bg-white/10 backdrop-blur-3xl border border-white/20 rounded-3xl p-6 md:p-10 shadow-2xl relative overflow-hidden flex flex-col md:flex-row gap-8 items-center">
                 <button onClick={() => { playSound(); setActiveCard(null); }} className="absolute top-6 right-6 text-white/50 hover:text-white"><X className="w-6 h-6" /></button>`;

const newUniverseClose = `<motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} className="absolute bottom-10 md:bottom-10 left-0 right-0 z-[120] flex justify-center p-4 pointer-events-none">
              <div className="pointer-events-auto w-full max-w-4xl bg-[#030014]/90 backdrop-blur-3xl border border-white/20 rounded-3xl p-6 pt-16 md:p-10 shadow-2xl relative overflow-hidden flex flex-col md:flex-row gap-8 items-center">
                 <button onClick={() => { playSound(); setActiveCard(null); }} className="absolute top-4 right-4 z-[130] text-white/50 hover:text-white p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"><X className="w-6 h-6" /></button>`;

content = content.replace(oldUniverseClose, newUniverseClose);

fs.writeFileSync('apps/web/app/agency/page.tsx', content);
