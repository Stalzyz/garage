const fs = require('fs');
let content = fs.readFileSync('apps/web/app/page.tsx', 'utf-8');

const startTag = '{isMobile ? (';
const endTag = ') : (\n        <>\n          <motion.div\n            className="relative overflow-hidden"';

const startIndex = content.indexOf(startTag);
const endIndex = content.indexOf(endTag);

const newMobileBlock = `{isMobile ? (
        <div className="relative w-full h-full overflow-hidden bg-[#050505]">
          <AnimatePresence>
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
                    navigate('agency', '/agency');
                  } else if (info.offset.y > 50 || info.velocity.y > 200) {
                    navigate('academy', '/academy');
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
          </AnimatePresence>
        </div>
      `;

content = content.slice(0, startIndex) + newMobileBlock + content.slice(endIndex);
fs.writeFileSync('apps/web/app/page.tsx', content);
