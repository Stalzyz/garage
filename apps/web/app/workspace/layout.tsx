import Link from "next/link"
import { LayoutDashboard, Presentation, FolderLock, Receipt, LifeBuoy, MessageSquare, LogOut, Bell } from "lucide-react"

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen bg-[#050508] font-sans overflow-hidden text-slate-300">
      {/* Sidebar */}
      <aside className="w-72 bg-[#0a0a0f] border-r border-white/5 flex flex-col">
        <div className="p-8 pb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center shadow-lg shadow-violet-500/20 mb-6">
            <span className="text-white font-black text-xl">R</span>
          </div>
          <h2 className="text-xl font-bold text-white leading-tight">RedBrick Realty</h2>
          <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1">Client Workspace</p>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar px-4 py-6 space-y-1">
          <NavItem href="/workspace" icon={<LayoutDashboard className="w-4 h-4" />} label="Mission Control" active />
          <NavItem href="/workspace/projects" icon={<Presentation className="w-4 h-4" />} label="Projects & Timeline" />
          <NavItem href="/workspace/assets" icon={<FolderLock className="w-4 h-4" />} label="Asset Vault" />
          <NavItem href="/workspace/invoices" icon={<Receipt className="w-4 h-4" />} label="Invoices & Payments" />
          <NavItem href="/workspace/support" icon={<LifeBuoy className="w-4 h-4" />} label="Support Hub" />
          <NavItem href="/workspace/chat" icon={<MessageSquare className="w-4 h-4" />} label="Team Chat" badge="3" />
        </div>

        <div className="p-4 border-t border-white/5">
          <button className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-white/50 hover:text-white hover:bg-white/5 rounded-xl w-full transition-colors">
            <LogOut className="w-4 h-4" />
            <span>Secure Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 relative">
        <header className="h-20 border-b border-white/5 flex items-center justify-end px-8 shrink-0 bg-[#0a0a0f]/50 backdrop-blur-md absolute top-0 left-0 right-0 z-10">
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-white/50 hover:text-white bg-white/5 rounded-full border border-white/10 transition-colors">
              <Bell className="w-4 h-4" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-rose-500 rounded-full animate-pulse"></span>
            </button>
            <div className="flex items-center gap-3 bg-white/5 pl-3 pr-1 py-1 rounded-full border border-white/10 cursor-pointer hover:bg-white/10 transition-colors">
              <div className="text-right">
                <p className="text-[10px] text-white font-bold uppercase tracking-wider">John Smith</p>
                <p className="text-[9px] text-white/50 uppercase tracking-widest">Client Admin</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/20"></div>
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto pt-20 custom-scrollbar">
          {children}
        </div>
      </main>
    </div>
  )
}

function NavItem({ href, icon, label, badge, active = false }: { href: string, icon: React.ReactNode, label: string, badge?: string, active?: boolean }) {
  return (
    <Link href={href}>
      <div className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all cursor-pointer ${active ? 'bg-violet-600/10 text-violet-400 border border-violet-500/20' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}>
        <div className="flex items-center gap-3">
          {icon}
          <span className="text-sm font-semibold">{label}</span>
        </div>
        {badge && (
          <span className="px-2 py-0.5 rounded-full bg-violet-600 text-[10px] font-bold text-white shadow-[0_0_10px_rgba(124,58,237,0.4)]">
            {badge}
          </span>
        )}
      </div>
    </Link>
  )
}
