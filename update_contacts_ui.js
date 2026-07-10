const fs = require('fs');
let content = fs.readFileSync('apps/web/app/dashboard/crm/contacts/page.tsx', 'utf-8');

// 1. Add lucide icon 'Key' to imports if not there
if (!content.includes('Key')) {
  content = content.replace('UserCircle2 } from "lucide-react"', 'UserCircle2, Key } from "lucide-react"');
}

// 2. Add state for invite modal
if (!content.includes('const [inviteData')) {
  const statesToAdd = `
  const [inviteData, setInviteData] = useState<any>(null);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isInviting, setIsInviting] = useState(false);
`;
  content = content.replace('const [searchQuery, setSearchQuery] = useState("")', statesToAdd + '\n  const [searchQuery, setSearchQuery] = useState("")');
}

// 3. Add handleInvite function
if (!content.includes('handleInvite')) {
  const funcToAdd = `
  const handleInvite = async (e: any, contact: any) => {
    e.stopPropagation();
    if (!contact.email) {
      toast.error("Contact must have an email address to invite.");
      return;
    }
    setIsInviting(true);
    try {
      const res = await fetchApi<any>(\`/crm/contacts/\${contact.id}/invite\`, { method: "POST" });
      if (res.alreadyExists) {
        toast.info("This user already has portal credentials.");
      } else {
        setInviteData(res.credentials);
        setIsInviteOpen(true);
        toast.success("Credentials generated successfully!");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to generate credentials");
    } finally {
      setIsInviting(false);
    }
  };
`;
  content = content.replace('const handleCreateContact', funcToAdd + '\n  const handleCreateContact');
}

// 4. Add the button to the contact card
const oldCardHeader = `                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center border border-white/10 shrink-0 text-lg font-bold text-white">
                    {(contact.firstName || 'U').charAt(0)}
                  </div>
                  <span className="text-[10px] font-mono tracking-widest uppercase bg-white/10 px-2 py-1 rounded text-white/60">
                    {contact.tier || 'BRONZE'}
                  </span>
                </div>`;

const newCardHeader = `                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center border border-white/10 shrink-0 text-lg font-bold text-white">
                    {(contact.firstName || 'U').charAt(0)}
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={(e) => handleInvite(e, contact)}
                      disabled={isInviting || !contact.email}
                      className="p-1.5 rounded bg-white/5 hover:bg-white/20 text-white/50 hover:text-white transition-colors group/btn relative"
                      title="Generate Portal Credentials"
                    >
                      <Key className="w-4 h-4" />
                    </button>
                    <span className="text-[10px] font-mono tracking-widest uppercase bg-white/10 px-2 py-1 rounded text-white/60">
                      {contact.tier || 'BRONZE'}
                    </span>
                  </div>
                </div>`;

content = content.replace(oldCardHeader, newCardHeader);

// 5. Add the Invite slideover / modal at the bottom
const inviteModal = `
      {/* Invite Credentials Modal */}
      {isInviteOpen && inviteData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-md p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-emerald-500" />
            <h3 className="text-xl font-bold mb-2">Portal Credentials Generated</h3>
            <p className="text-white/60 text-sm mb-6">Please securely share these credentials with the client. They will not be shown again.</p>
            
            <div className="space-y-4 mb-8">
              <div>
                <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Email (Username)</label>
                <div className="mt-1 p-3 bg-black/40 border border-white/10 rounded-xl font-mono text-white select-all">{inviteData.email}</div>
              </div>
              <div>
                <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Temporary Password</label>
                <div className="mt-1 p-3 bg-black/40 border border-white/10 rounded-xl font-mono text-green-400 select-all">{inviteData.password}</div>
              </div>
            </div>
            
            <button 
              onClick={() => {
                setIsInviteOpen(false);
                setInviteData(null);
              }}
              className="w-full py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}
`;

content = content.replace('</SlideOver>\n    </div>', '</SlideOver>\n' + inviteModal + '\n    </div>');

fs.writeFileSync('apps/web/app/dashboard/crm/contacts/page.tsx', content);
