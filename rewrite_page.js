const fs = require('fs');
let content = fs.readFileSync('apps/web/app/page.tsx', 'utf-8');

// Restore the original behavior first by removing the flip logic
const returnIndex = content.indexOf('return (');

// We have the agency block and academy block.
const agencyStart = content.indexOf('{/* Front Face: Agency */}');
const backFaceAcademyStart = content.indexOf('{/* Back Face: Academy */}');
const closingFlipDiv = content.indexOf('{/* Mobile Flip Button */}');
const endOfFlip = content.indexOf(') : (');
const effectsStart = content.indexOf('{/* ═══════════════════════════════ */}\n      {/* EFFECTS & OVERLAYS');

// Wait, since I already modified it, it's better to just fetch the blocks again
const agencyBlockInnerStart = content.indexOf('<div className="relative overflow-hidden"', agencyStart);
const agencyBlockInnerEnd = content.indexOf('</div>\n              \n              {/* Back Face: Academy */}');
let agencyBlock = content.slice(agencyBlockInnerStart, agencyBlockInnerEnd).trim();

const academyBlockInnerStart = content.indexOf('<motion.div\n        className="relative overflow-hidden"', backFaceAcademyStart);
const academyBlockInnerEnd = content.indexOf('</div>\n           </motion.div>');
let academyBlock = content.slice(academyBlockInnerStart, academyBlockInnerEnd).trim();

const dividerBlockStart = content.indexOf('{/* ═══════════════════════════════════════════ */}\n      {/* DIVIDER');
const dividerBlockEnd = content.indexOf('{/* ═══════════════════════════════════════════ */}\n      {/* ACADEMY SIDE');
let dividerBlock = content.slice(dividerBlockStart, dividerBlockEnd).trim();

// The Portal Implementation
// On mobile, if side === null, show portal.
// If side === 'agency', show agency.
// If side === 'academy', show academy.
// We will use framer-motion drag on the portal.

const newRenderStructure = `
      {isMobile ? (
        <div className="relative w-full h-full overflow-hidden bg-[#050505]">
          <AnimatePresence>
            {side === null && (
              <motion.div 
                key="portal"
                className="absolute inset-0 flex flex-col items-center justify-center z-50 touch-none"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 2 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
                drag="y"
                dragConstraints={{ top: 0, bottom: 0 }}
                dragElastic={0.8}
                onDragEnd={(e, info) => {
                  if (info.offset.y < -50 || info.velocity.y < -200) {
                    setSide('agency');
                    setNavVisible(true);
                  } else if (info.offset.y > 50 || info.velocity.y > 200) {
                    setSide('academy');
                    setNavVisible(true);
                  }
                }}
              >
                <div className="absolute top-1/4 text-white/40 font-mono text-xs tracking-widest uppercase animate-pulse flex flex-col items-center gap-2">
                  <span>Swipe Up</span>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>
                  <span className="text-white/60 font-bold mt-1">Agency</span>
                </div>
                
                {/* The Orb */}
                <motion.div 
                  className="w-32 h-32 rounded-full relative"
                  animate={{ 
                    boxShadow: [
                      "0 0 20px 0px rgba(200,210,255,0.2), inset 0 0 20px 0px rgba(255,200,100,0.2)",
                      "0 0 60px 10px rgba(200,210,255,0.4), inset 0 0 40px 10px rgba(255,200,100,0.4)",
                      "0 0 20px 0px rgba(200,210,255,0.2), inset 0 0 20px 0px rgba(255,200,100,0.2)"
                    ]
                  }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  style={{ background: "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.1), rgba(0,0,0,0.5))" }}
                >
                  {/* Orb Core */}
                  <div className="absolute inset-2 rounded-full bg-gradient-to-br from-blue-500/10 to-amber-500/10 backdrop-blur-xl" />
                </motion.div>

                <div className="absolute bottom-1/4 text-white/40 font-mono text-xs tracking-widest uppercase animate-pulse flex flex-col items-center gap-2">
                  <span className="text-white/60 font-bold mb-1">Academy</span>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                  <span>Swipe Down</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {side === 'agency' && (
              <motion.div 
                key="agency-view"
                className="absolute inset-0 z-40"
                initial={{ opacity: 0, scale: 0.9, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 1.1, y: -50 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              >
                ${agencyBlock}
                <button 
                  onClick={() => setSide(null)}
                  className="absolute bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-white font-mono text-[10px] uppercase tracking-widest z-[100]"
                >
                  ← Back to Portal
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {side === 'academy' && (
              <motion.div 
                key="academy-view"
                className="absolute inset-0 z-40"
                initial={{ opacity: 0, scale: 0.9, y: -50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 1.1, y: 50 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              >
                ${academyBlock}
                <button 
                  onClick={() => setSide(null)}
                  className="absolute bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full bg-black/10 backdrop-blur-xl border border-black/20 text-[#3a2808] font-mono text-[10px] uppercase tracking-widest z-[100]"
                >
                  ← Back to Portal
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ) : (
        <>
          ${agencyBlock}
          ${dividerBlock}
          ${academyBlock}
        </>
      )}
`;

// Now find where the previous `{isMobile ? (` started
const mobileStart = content.indexOf('{isMobile ? (');
const endOfElse = content.indexOf('</>\n      )}', mobileStart) + 12;

let finalContent = content.slice(0, mobileStart) + newRenderStructure + content.slice(endOfElse);

// Remove the `if (isMobile && side === null) setSide("agency")` hook we added last time
const hookStart = finalContent.indexOf('useEffect(() => {\n    if (isMobile && side === null) {');
const hookEnd = finalContent.indexOf('}, [isMobile, side]);', hookStart) + 21;
if (hookStart !== -1) {
  finalContent = finalContent.slice(0, hookStart) + finalContent.slice(hookEnd);
}

fs.writeFileSync('apps/web/app/page.tsx', finalContent);
