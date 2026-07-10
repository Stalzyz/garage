const fs = require('fs');
let content = fs.readFileSync('apps/web/app/agency/page.tsx', 'utf-8');

// 1. & 2. LayoutScatteredCards
// 1. Mobile inactive sizes
content = content.replace(
  `        if (isMobile) {
          if (hasOpenedCard) {
            inactiveWidth = '64px'
            inactiveHeight = '64px'
          } else {
            inactiveWidth = '240px'
            inactiveHeight = '72px'
          }
        } else {`,
  `        if (isMobile) {
          inactiveWidth = '64px'
          inactiveHeight = '64px'
        } else {`
);
content = content.replace(
  `        const isSmallSquare = isMobile && hasOpenedCard;
        const isRectangle = isMobile && !hasOpenedCard;`,
  `        const isSmallSquare = isMobile && !isActive;
        const isRectangle = false;`
);

// 2. Close button z-index and overlay z-index
content = content.replace(
  `          className="absolute top-0 right-0 z-[60] hover:opacity-70 transition-opacity"`,
  `          className="absolute top-4 right-4 z-[120] hover:opacity-70 transition-opacity"`
);
content = content.replace(
  `        {activeId && <motion.div key="overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 z-40 backdrop-blur-md" onClick={() => setActiveId(null)} />}`,
  `        {activeId && <motion.div key="overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 z-[100] backdrop-blur-md" onClick={() => setActiveId(null)} />}`
);
content = content.replace(
  `className="fixed inset-0 m-auto bg-zinc-900 border border-white/10 rounded-3xl shadow-[0_0_100px_rgba(0,0,0,1)] w-[90vw] md:w-[900px] h-auto max-h-[90vh] z-50 flex flex-col p-6 md:p-10 pb-24 md:pb-10 overflow-y-auto custom-scrollbar cursor-default pointer-events-auto"`,
  `className="fixed inset-0 m-auto bg-zinc-900 border border-white/10 rounded-3xl shadow-[0_0_100px_rgba(0,0,0,1)] w-[90vw] md:w-[900px] h-auto max-h-[90vh] z-[110] flex flex-col p-6 md:p-10 pb-24 md:pb-10 overflow-y-auto custom-scrollbar cursor-default pointer-events-auto"`
);

// 3. LayoutCreativeUniverse
content = content.replace(
  `className={\`absolute bottom-24 md:bottom-32 left-1/2 -translate-x-1/2 z-10 w-full px-6 text-center pointer-events-none transition-opacity duration-500 \${activeCard ? 'opacity-0' : 'opacity-100'}\`}`,
  `className={\`absolute bottom-24 md:bottom-32 left-1/2 -translate-x-1/2 z-[40] w-full px-6 text-center pointer-events-none transition-opacity duration-500 bg-[#030014]/50 backdrop-blur-md py-4 rounded-3xl max-w-4xl \${activeCard ? 'opacity-0' : 'opacity-100'}\`}`
);

// 4. LayoutInfiniteCanvas
content = content.replace(
  `            <div key={card.id} className="absolute w-[85vw] md:w-[450px] bg-white p-6 md:p-10 rounded-3xl shadow-xl border border-zinc-200 pointer-events-auto flex flex-col" style={{ left: x, top: y, transform: 'translate(-50%, -50%)' }}>`,
  `            <motion.div drag dragMomentum={false} key={card.id} className="absolute w-[85vw] md:w-[450px] bg-white p-6 md:p-10 rounded-3xl shadow-xl border border-zinc-200 pointer-events-auto flex flex-col cursor-grab active:cursor-grabbing hover:z-50 hover:shadow-2xl transition-shadow" style={{ left: x, top: y, transform: 'translate(-50%, -50%)' }}>`
);

// Need to replace the closing tag for the infinite canvas card
// Find `</button>\n               )}\n            </div>\n          )\n        })}`
content = content.replace(
  `                  </button>
               )}
            </div>
          )
        })}
      </motion.div>`,
  `                  </button>
               )}
            </motion.div>
          )
        })}
      </motion.div>`
);

fs.writeFileSync('apps/web/app/agency/page.tsx', content);
