import React from "react"

export function PolicySection({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-lg font-bold text-white mb-4 pb-3 border-b border-white/[0.07] flex items-center gap-2">
        <span className="w-1 h-5 rounded-full bg-emerald-500 inline-block shrink-0" />
        {title}
      </h2>
      <div className="space-y-3 text-[15px] leading-7 text-white/60">
        {children}
      </div>
    </section>
  )
}

export function PolicyList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2 mt-2">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-3">
          <span className="mt-2 w-1.5 h-1.5 rounded-full bg-emerald-500/60 shrink-0" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

export function PolicyHighlight({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-4 p-4 rounded-xl bg-emerald-500/[0.06] border border-emerald-500/20 text-emerald-300/80 text-sm leading-relaxed">
      {children}
    </div>
  )
}

export function PolicyWarning({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-4 p-4 rounded-xl bg-amber-500/[0.06] border border-amber-500/20 text-amber-300/80 text-sm leading-relaxed">
      {children}
    </div>
  )
}

export function PolicyPageHeader({ title, subtitle, lastUpdated }: { title: string, subtitle: string, lastUpdated: string }) {
  return (
    <div className="mb-12">
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-mono uppercase tracking-widest mb-6">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        Legal Document
      </div>
      <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4 leading-tight">{title}</h1>
      <p className="text-white/50 text-base leading-relaxed max-w-2xl">{subtitle}</p>
      <div className="mt-6 pt-6 border-t border-white/[0.07] flex flex-wrap gap-6 text-[13px] text-white/40">
        <span><span className="text-white/60 font-medium">Effective:</span> {lastUpdated}</span>
        <span><span className="text-white/60 font-medium">Jurisdiction:</span> Tamil Nadu, India</span>
        <span><span className="text-white/60 font-medium">Contact:</span> admin@grekam.in</span>
      </div>
    </div>
  )
}
