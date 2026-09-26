"use client";

import { useState, useEffect } from "react";
import { 
  Building2, 
  Plus, 
  Search, 
  Globe, 
  ShieldCheck, 
  Sliders, 
  Palette, 
  Mail, 
  Lock, 
  ExternalLink, 
  Copy, 
  Check, 
  Trash2, 
  AlertCircle, 
  Sparkles,
  Layers,
  Users,
  CheckCircle2,
  XCircle,
  MoreVertical,
  Loader2,
  RefreshCw
} from "lucide-react";
import { ApiClient } from "@/lib/api";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface Tenant {
  id: string;
  name: string;
  slug: string;
  status: "ACTIVE" | "TRIALING" | "PAST_DUE" | "SUSPENDED" | "ARCHIVED";
  plan: "FREE" | "STARTER" | "GROWTH" | "ENTERPRISE";
  customDomain?: string | null;
  domainVerified: boolean;
  sslProvisioned: boolean;
  maxUsers: number;
  maxStorageMb: number;
  createdAt: string;
  _count?: { members: number };
  branding?: {
    id: string;
    logoUrl?: string | null;
    logoDarkUrl?: string | null;
    collapsedLogoUrl?: string | null;
    faviconUrl?: string | null;
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    borderRadius: string;
    fontFamily: string;
    companyName?: string | null;
    supportEmail?: string | null;
    emailSenderName?: string | null;
    emailSenderAddress?: string | null;
  };
  features?: {
    id: string;
    crmEnabled: boolean;
    hrmEnabled: boolean;
    projectsEnabled: boolean;
    financeEnabled: boolean;
    portalEnabled: boolean;
    customDomainAllowed: boolean;
    whiteLabelPdfAllowed: boolean;
    aiAssistantAllowed: boolean;
    apiAccessAllowed: boolean;
  };
}

export default function TenantManagementPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState<string>("ALL");

  // Provisioning Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: "",
    slug: "",
    plan: "STARTER",
    ownerEmail: "",
    primaryColor: "#2563eb",
    secondaryColor: "#1e40af",
    accentColor: "#10b981",
    customDomain: "",
    crmEnabled: true,
    hrmEnabled: true,
    projectsEnabled: true,
    financeEnabled: true,
    portalEnabled: true,
  });

  // Edit / White-Label Drawer State
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"branding" | "features" | "domain" | "email">("branding");
  const [savingEdit, setSavingEdit] = useState(false);
  const [editForm, setEditForm] = useState<any>({});

  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  const fetchTenants = async () => {
    try {
      setLoading(true);
      const res: any = await ApiClient.get("/settings/tenants");
      setTenants(res?.data || []);
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to load tenants");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.name || !createForm.slug) {
      toast.error("Organization name and subdomain are required");
      return;
    }

    try {
      setCreating(true);
      await ApiClient.post("/settings/tenants", createForm);
      toast.success("Organization provisioned successfully!");
      setIsCreateOpen(false);
      setCreateForm({
        name: "",
        slug: "",
        plan: "STARTER",
        ownerEmail: "",
        primaryColor: "#2563eb",
        secondaryColor: "#1e40af",
        accentColor: "#10b981",
        customDomain: "",
        crmEnabled: true,
        hrmEnabled: true,
        projectsEnabled: true,
        financeEnabled: true,
        portalEnabled: true,
      });
      fetchTenants();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || err.message || "Failed to create tenant");
    } finally {
      setCreating(false);
    }
  };

  const openEditModal = (t: Tenant) => {
    setSelectedTenant(t);
    setEditForm({
      name: t.name,
      slug: t.slug,
      status: t.status,
      plan: t.plan,
      customDomain: t.customDomain || "",
      domainVerified: t.domainVerified,
      sslProvisioned: t.sslProvisioned,
      branding: {
        primaryColor: t.branding?.primaryColor || "#2563eb",
        secondaryColor: t.branding?.secondaryColor || "#1e40af",
        accentColor: t.branding?.accentColor || "#10b981",
        borderRadius: t.branding?.borderRadius || "0.5rem",
        fontFamily: t.branding?.fontFamily || "Inter",
        logoUrl: t.branding?.logoUrl || "",
        logoDarkUrl: t.branding?.logoDarkUrl || "",
        faviconUrl: t.branding?.faviconUrl || "",
        companyName: t.branding?.companyName || t.name,
        supportEmail: t.branding?.supportEmail || "",
        emailSenderName: t.branding?.emailSenderName || "",
        emailSenderAddress: t.branding?.emailSenderAddress || "",
      },
      features: {
        crmEnabled: t.features?.crmEnabled ?? true,
        hrmEnabled: t.features?.hrmEnabled ?? true,
        projectsEnabled: t.features?.projectsEnabled ?? true,
        financeEnabled: t.features?.financeEnabled ?? true,
        portalEnabled: t.features?.portalEnabled ?? true,
        customDomainAllowed: t.features?.customDomainAllowed ?? false,
        whiteLabelPdfAllowed: t.features?.whiteLabelPdfAllowed ?? false,
        aiAssistantAllowed: t.features?.aiAssistantAllowed ?? false,
        apiAccessAllowed: t.features?.apiAccessAllowed ?? false,
      },
    });
    setIsEditOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedTenant) return;
    try {
      setSavingEdit(true);
      await ApiClient.patch(`/settings/tenants/${selectedTenant.id}`, editForm);
      toast.success("Tenant configuration updated successfully");
      setIsEditOpen(false);
      fetchTenants();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Failed to update tenant");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleToggleStatus = async (t: Tenant) => {
    const nextStatus = t.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    try {
      await ApiClient.patch(`/settings/tenants/${t.id}`, { status: nextStatus });
      toast.success(`Tenant ${t.name} set to ${nextStatus}`);
      fetchTenants();
    } catch (err) {
      toast.error("Failed to toggle tenant status");
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSlug(id);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  const filteredTenants = tenants.filter((t) => {
    const matchSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.slug.toLowerCase().includes(search.toLowerCase()) ||
      (t.customDomain && t.customDomain.toLowerCase().includes(search.toLowerCase()));
    const matchPlan = planFilter === "ALL" || t.plan === planFilter;
    return matchSearch && matchPlan;
  });

  const handleImpersonate = async (t: Tenant) => {
    try {
      const res: any = await ApiClient.post(`/settings/tenants/${t.id}/impersonate`, {});
      if (res?.supportMode) {
        toast.success(`Entering Support Access Mode for ${t.name}`);
        // Store support mode context in localStorage / cookies
        localStorage.setItem("support_mode_tenant", JSON.stringify(res));
        window.open(`https://${t.slug}.grekam.in/dashboard`, '_blank');
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Impersonation failed");
    }
  };

  const handleVerifyDomain = async (t: Tenant) => {
    try {
      const res: any = await ApiClient.post(`/settings/tenants/${t.id}/verify-domain`, {});
      toast.success(res.message || "Custom domain verified!");
      fetchTenants();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Domain verification failed");
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-primary/10 text-primary">
              <Building2 className="w-6 h-6" />
            </span>
            <h1 className="text-2xl font-bold tracking-tight">Super Admin Platform Control Center</h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Tenant Control Plane: Provision vendors, enforce white-labeling, verify custom domains, manage plans & audit support access.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchTenants}
            className="flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg border border-border/60 hover:bg-muted/50 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" /> Provision Vendor Account
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Total Vendors</span>
            <Building2 className="w-4 h-4 text-primary" />
          </div>
          <div className="text-3xl font-extrabold mt-2">{tenants.length}</div>
          <div className="text-xs text-muted-foreground mt-1">Multi-tenant accounts</div>
        </div>

        <div className="p-5 rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Active Workspaces</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-3xl font-extrabold mt-2 text-emerald-500">
            {tenants.filter((t) => t.status === "ACTIVE").length}
          </div>
          <div className="text-xs text-muted-foreground mt-1">Operational organizations</div>
        </div>

        <div className="p-5 rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Custom Domains</span>
            <Globe className="w-4 h-4 text-cyan-500" />
          </div>
          <div className="text-3xl font-extrabold mt-2">
            {tenants.filter((t) => t.customDomain).length}
          </div>
          <div className="text-xs text-muted-foreground mt-1">CNAME mapped domains</div>
        </div>

        <div className="p-5 rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Enterprise Tier</span>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-3xl font-extrabold mt-2 text-amber-500">
            {tenants.filter((t) => t.plan === "ENTERPRISE").length}
          </div>
          <div className="text-xs text-muted-foreground mt-1">Full white-label licensees</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name, slug or domain..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-border/60 bg-background focus:outline-hidden focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto overflow-x-auto w-full sm:w-auto">
          {["ALL", "STARTER", "GROWTH", "ENTERPRISE", "FREE"].map((p) => (
            <button
              key={p}
              onClick={() => setPlanFilter(p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                planFilter === p
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/40 text-muted-foreground hover:bg-muted"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Tenants Grid */}
      {loading ? (
        <div className="p-16 flex flex-col items-center justify-center gap-3 text-muted-foreground">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm">Loading multi-tenant ecosystem...</p>
        </div>
      ) : filteredTenants.length === 0 ? (
        <div className="p-16 border border-dashed border-border/80 rounded-2xl text-center space-y-3">
          <Building2 className="w-12 h-12 mx-auto text-muted-foreground/40" />
          <div className="text-lg font-semibold">No tenants found</div>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            {search ? "No tenants match your search filter." : "Get started by provisioning your first white-label tenant."}
          </p>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all mt-2"
          >
            <Plus className="w-4 h-4" /> Provision First Organization
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTenants.map((t) => {
            const primaryColor = t.branding?.primaryColor || "#2563eb";
            return (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative rounded-2xl border border-border/60 bg-card overflow-hidden shadow-xs hover:border-primary/40 transition-all flex flex-col justify-between"
              >
                {/* Top Colored Accent Bar */}
                <div className="h-2 w-full" style={{ backgroundColor: primaryColor }} />

                <div className="p-5 space-y-4">
                  {/* Title & Status */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-xs"
                        style={{ backgroundColor: primaryColor }}
                      >
                        {t.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-semibold text-base leading-tight">{t.name}</h3>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                          <span>{t.slug}.grekam.in</span>
                          <button
                            onClick={() => copyToClipboard(`https://${t.slug}.grekam.in`, t.id)}
                            className="hover:text-foreground transition-colors"
                          >
                            {copiedSlug === t.id ? (
                              <Check className="w-3 h-3 text-emerald-500" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        t.status === "ACTIVE"
                          ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                          : t.status === "SUSPENDED"
                          ? "bg-rose-500/10 text-rose-500 border border-rose-500/20"
                          : "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                      }`}
                    >
                      {t.status}
                    </span>
                  </div>

                  {/* Plan & Domain Badge */}
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="px-2.5 py-1 rounded-md bg-muted font-medium text-foreground">
                      {t.plan} Plan
                    </span>
                    {t.customDomain ? (
                      <span className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-cyan-500/10 text-cyan-500 font-medium">
                        <Globe className="w-3 h-3" /> {t.customDomain}
                      </span>
                    ) : (
                      <span className="text-muted-foreground text-[11px]">No custom domain</span>
                    )}
                  </div>

                  {/* Active Features Badges */}
                  <div className="space-y-1.5 pt-2 border-t border-border/40">
                    <div className="text-[11px] font-medium text-muted-foreground">Enabled Modules:</div>
                    <div className="flex flex-wrap gap-1.5">
                      {t.features?.crmEnabled && (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-sm bg-primary/10 text-primary">
                          CRM
                        </span>
                      )}
                      {t.features?.hrmEnabled && (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-sm bg-purple-500/10 text-purple-500">
                          HRM
                        </span>
                      )}
                      {t.features?.projectsEnabled && (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-sm bg-amber-500/10 text-amber-500">
                          Projects
                        </span>
                      )}
                      {t.features?.financeEnabled && (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-sm bg-emerald-500/10 text-emerald-500">
                          Finance
                        </span>
                      )}
                      {t.features?.portalEnabled && (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-sm bg-blue-500/10 text-blue-500">
                          Client Portal
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="px-5 py-3 bg-muted/20 border-t border-border/40 flex items-center justify-between text-xs gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditModal(t)}
                      className="px-3 py-1.5 rounded-lg border border-border/60 hover:bg-muted font-medium transition-colors flex items-center gap-1.5"
                    >
                      <Palette className="w-3.5 h-3.5" /> Configure White-Label
                    </button>
                    <button
                      onClick={() => handleImpersonate(t)}
                      className="px-2.5 py-1.5 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20 hover:bg-amber-500/20 font-medium transition-colors flex items-center gap-1"
                      title="Open Support Session Access (Audited)"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" /> Support Access
                    </button>
                  </div>

                  <button
                    onClick={() => handleToggleStatus(t)}
                    className={`font-semibold hover:underline ${
                      t.status === "ACTIVE" ? "text-rose-500" : "text-emerald-500"
                    }`}
                  >
                    {t.status === "ACTIVE" ? "Suspend" : "Activate"}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Provisioning Modal */}
      <AnimatePresence>
        {isCreateOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card w-full max-w-lg rounded-2xl border border-border shadow-xl overflow-hidden"
            >
              <div className="p-6 border-b border-border/60 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold">Provision New Tenant</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Create an isolated multi-tenant organization with custom branding.
                  </p>
                </div>
                <button
                  onClick={() => setIsCreateOpen(false)}
                  className="p-1 rounded-lg hover:bg-muted text-muted-foreground"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreate} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                <div className="space-y-1">
                  <label className="text-xs font-medium">Organization Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Acme Visuals Corp"
                    value={createForm.name}
                    onChange={(e) => {
                      const name = e.target.value;
                      const slug = name.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-");
                      setCreateForm({ ...createForm, name, slug: createForm.slug ? createForm.slug : slug });
                    }}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-border/60 bg-background"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium">Subdomain Slug</label>
                  <div className="flex items-center">
                    <input
                      type="text"
                      required
                      placeholder="acme"
                      value={createForm.slug}
                      onChange={(e) => setCreateForm({ ...createForm, slug: e.target.value.toLowerCase() })}
                      className="w-full px-3 py-2 text-sm rounded-l-lg border border-border/60 bg-background"
                    />
                    <span className="px-3 py-2 text-xs bg-muted border border-l-0 border-border/60 rounded-r-lg text-muted-foreground">
                      .grekam.in
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-medium">Subscription Tier</label>
                    <select
                      value={createForm.plan}
                      onChange={(e: any) => setCreateForm({ ...createForm, plan: e.target.value })}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-border/60 bg-background"
                    >
                      <option value="FREE">Free Trial</option>
                      <option value="STARTER">Starter</option>
                      <option value="GROWTH">Growth</option>
                      <option value="ENTERPRISE">Enterprise (White-Label)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium">Primary Brand Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={createForm.primaryColor}
                        onChange={(e) => setCreateForm({ ...createForm, primaryColor: e.target.value })}
                        className="w-10 h-9 p-0.5 rounded-lg border border-border/60 cursor-pointer bg-background"
                      />
                      <input
                        type="text"
                        value={createForm.primaryColor}
                        onChange={(e) => setCreateForm({ ...createForm, primaryColor: e.target.value })}
                        className="w-full px-2.5 py-1.5 text-xs font-mono rounded-lg border border-border/60 bg-background"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium">Owner / Admin Email (Optional)</label>
                  <input
                    type="email"
                    placeholder="admin@acme.com"
                    value={createForm.ownerEmail}
                    onChange={(e) => setCreateForm({ ...createForm, ownerEmail: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-border/60 bg-background"
                  />
                </div>

                {/* Module Toggles */}
                <div className="space-y-2 pt-2 border-t border-border/40">
                  <label className="text-xs font-semibold">Enabled Workspaces & Features</label>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <label className="flex items-center gap-2 p-2 rounded-lg border border-border/40 hover:bg-muted/40 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={createForm.crmEnabled}
                        onChange={(e) => setCreateForm({ ...createForm, crmEnabled: e.target.checked })}
                      />
                      <span>CRM & Pipeline</span>
                    </label>
                    <label className="flex items-center gap-2 p-2 rounded-lg border border-border/40 hover:bg-muted/40 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={createForm.hrmEnabled}
                        onChange={(e) => setCreateForm({ ...createForm, hrmEnabled: e.target.checked })}
                      />
                      <span>HRM & Payroll</span>
                    </label>
                    <label className="flex items-center gap-2 p-2 rounded-lg border border-border/40 hover:bg-muted/40 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={createForm.projectsEnabled}
                        onChange={(e) => setCreateForm({ ...createForm, projectsEnabled: e.target.checked })}
                      />
                      <span>Projects & Tasks</span>
                    </label>
                    <label className="flex items-center gap-2 p-2 rounded-lg border border-border/40 hover:bg-muted/40 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={createForm.financeEnabled}
                        onChange={(e) => setCreateForm({ ...createForm, financeEnabled: e.target.checked })}
                      />
                      <span>Finance & Invoicing</span>
                    </label>
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-end gap-2 border-t border-border/40">
                  <button
                    type="button"
                    onClick={() => setIsCreateOpen(false)}
                    className="px-4 py-2 text-xs font-medium rounded-lg border border-border/60 hover:bg-muted"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="px-5 py-2 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2 shadow-xs"
                  >
                    {creating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    Provision Organization
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Configuration & White-Label Drawer */}
      <AnimatePresence>
        {isEditOpen && selectedTenant && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card w-full max-w-2xl rounded-2xl border border-border shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Drawer Header */}
              <div className="p-6 border-b border-border/60 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold">Configure {selectedTenant.name}</h2>
                  <p className="text-xs text-muted-foreground">
                    Subdomain: <code className="text-primary">{selectedTenant.slug}.grekam.in</code>
                  </p>
                </div>
                <button
                  onClick={() => setIsEditOpen(false)}
                  className="p-1 rounded-lg hover:bg-muted text-muted-foreground"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex items-center px-6 border-b border-border/60 bg-muted/20 gap-2 overflow-x-auto text-xs font-medium">
                <button
                  onClick={() => setActiveTab("branding")}
                  className={`py-3 px-3 border-b-2 flex items-center gap-2 ${
                    activeTab === "branding"
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Palette className="w-3.5 h-3.5" /> Visual Branding & Colors
                </button>
                <button
                  onClick={() => setActiveTab("features")}
                  className={`py-3 px-3 border-b-2 flex items-center gap-2 ${
                    activeTab === "features"
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Sliders className="w-3.5 h-3.5" /> Entitlements & Toggles
                </button>
                <button
                  onClick={() => setActiveTab("domain")}
                  className={`py-3 px-3 border-b-2 flex items-center gap-2 ${
                    activeTab === "domain"
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Globe className="w-3.5 h-3.5" /> Custom Domain
                </button>
                <button
                  onClick={() => setActiveTab("email")}
                  className={`py-3 px-3 border-b-2 flex items-center gap-2 ${
                    activeTab === "email"
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Mail className="w-3.5 h-3.5" /> White-Label Email
                </button>
              </div>

              {/* Tab Contents */}
              <div className="p-6 space-y-4 overflow-y-auto flex-1">
                {activeTab === "branding" && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-medium">Primary Color</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={editForm.branding.primaryColor}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                branding: { ...editForm.branding, primaryColor: e.target.value },
                              })
                            }
                            className="w-10 h-9 p-0.5 rounded-lg border border-border/60 cursor-pointer bg-background"
                          />
                          <input
                            type="text"
                            value={editForm.branding.primaryColor}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                branding: { ...editForm.branding, primaryColor: e.target.value },
                              })
                            }
                            className="w-full px-2 py-1.5 text-xs font-mono rounded-lg border border-border/60 bg-background"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-medium">Secondary Color</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={editForm.branding.secondaryColor}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                branding: { ...editForm.branding, secondaryColor: e.target.value },
                              })
                            }
                            className="w-10 h-9 p-0.5 rounded-lg border border-border/60 cursor-pointer bg-background"
                          />
                          <input
                            type="text"
                            value={editForm.branding.secondaryColor}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                branding: { ...editForm.branding, secondaryColor: e.target.value },
                              })
                            }
                            className="w-full px-2 py-1.5 text-xs font-mono rounded-lg border border-border/60 bg-background"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-medium">Accent Color</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={editForm.branding.accentColor}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                branding: { ...editForm.branding, accentColor: e.target.value },
                              })
                            }
                            className="w-10 h-9 p-0.5 rounded-lg border border-border/60 cursor-pointer bg-background"
                          />
                          <input
                            type="text"
                            value={editForm.branding.accentColor}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                branding: { ...editForm.branding, accentColor: e.target.value },
                              })
                            }
                            className="w-full px-2 py-1.5 text-xs font-mono rounded-lg border border-border/60 bg-background"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-medium">Main Logo URL (Light)</label>
                        <input
                          type="text"
                          placeholder="https://acme.com/logo.png"
                          value={editForm.branding.logoUrl}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              branding: { ...editForm.branding, logoUrl: e.target.value },
                            })
                          }
                          className="w-full px-3 py-2 text-xs rounded-lg border border-border/60 bg-background"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium">Favicon URL (.ico / .png)</label>
                        <input
                          type="text"
                          placeholder="https://acme.com/favicon.ico"
                          value={editForm.branding.faviconUrl}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              branding: { ...editForm.branding, faviconUrl: e.target.value },
                            })
                          }
                          className="w-full px-3 py-2 text-xs rounded-lg border border-border/60 bg-background"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-medium">Border Radius</label>
                        <select
                          value={editForm.branding.borderRadius}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              branding: { ...editForm.branding, borderRadius: e.target.value },
                            })
                          }
                          className="w-full px-3 py-2 text-xs rounded-lg border border-border/60 bg-background"
                        >
                          <option value="0px">Sharp (0px)</option>
                          <option value="0.375rem">Compact (6px)</option>
                          <option value="0.5rem">Standard Modern (8px)</option>
                          <option value="0.75rem">Soft (12px)</option>
                          <option value="1rem">Rounded (16px)</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-medium">Brand Font Family</label>
                        <select
                          value={editForm.branding.fontFamily}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              branding: { ...editForm.branding, fontFamily: e.target.value },
                            })
                          }
                          className="w-full px-3 py-2 text-xs rounded-lg border border-border/60 bg-background"
                        >
                          <option value="Inter">Inter (Clean, Modern)</option>
                          <option value="Outfit">Outfit (Geometric, Premium)</option>
                          <option value="Plus Jakarta Sans">Plus Jakarta Sans</option>
                          <option value="Roboto">Roboto</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "features" && (
                  <div className="space-y-3">
                    <p className="text-xs text-muted-foreground">
                      Enable or disable core modules for this tenant. Disabled modules will be hidden from their sidebar and API requests will be blocked.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {[
                        { key: "crmEnabled", label: "CRM Pipeline & Contacts" },
                        { key: "hrmEnabled", label: "HRM & Staff Attendance" },
                        { key: "projectsEnabled", label: "Project Management & Tasks" },
                        { key: "financeEnabled", label: "Invoicing & Estimates" },
                        { key: "portalEnabled", label: "Client Portal Access" },
                        { key: "customDomainAllowed", label: "Custom Domain Entitlement" },
                        { key: "whiteLabelPdfAllowed", label: "White-Label PDF Removal of Watermark" },
                        { key: "aiAssistantAllowed", label: "AI Copilot & Smart Assistant" },
                      ].map((item) => (
                        <label
                          key={item.key}
                          className="flex items-center justify-between p-3 rounded-xl border border-border/60 hover:bg-muted/40 cursor-pointer"
                        >
                          <span className="font-medium">{item.label}</span>
                          <input
                            type="checkbox"
                            checked={editForm.features[item.key]}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                features: {
                                  ...editForm.features,
                                  [item.key]: e.target.checked,
                                },
                              })
                            }
                            className="rounded-sm"
                          />
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === "domain" && (
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-xs font-medium">Custom White-Label Domain</label>
                      <input
                        type="text"
                        placeholder="e.g. crm.acmeagency.com"
                        value={editForm.customDomain}
                        onChange={(e) => setEditForm({ ...editForm, customDomain: e.target.value.toLowerCase() })}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-border/60 bg-background"
                      />
                    </div>

                    <div className="p-4 rounded-xl border border-border/60 bg-muted/30 space-y-2 text-xs">
                      <div className="font-semibold flex items-center gap-1.5">
                        <Globe className="w-4 h-4 text-primary" /> DNS Setup Instructions for Tenant
                      </div>
                      <p className="text-muted-foreground">
                        Instruct your customer to create the following CNAME DNS record in their domain provider (Cloudflare, GoDaddy, Namecheap):
                      </p>
                      <div className="font-mono bg-background p-2.5 rounded-lg border border-border/60 flex items-center justify-between">
                        <span>CNAME &rarr; cname.grekam.in</span>
                        <button
                          onClick={() => copyToClipboard("cname.grekam.in", "cname")}
                          className="text-primary hover:underline text-[11px]"
                        >
                          Copy Target
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "email" && (
                  <div className="space-y-3">
                    <p className="text-xs text-muted-foreground">
                      Configure custom sender identity so proposal and invoice emails arrive under the tenant&apos;s own brand name.
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-medium">Sender Name</label>
                        <input
                          type="text"
                          placeholder="Acme Operations"
                          value={editForm.branding.emailSenderName}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              branding: { ...editForm.branding, emailSenderName: e.target.value },
                            })
                          }
                          className="w-full px-3 py-2 text-xs rounded-lg border border-border/60 bg-background"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium">Sender Email Address</label>
                        <input
                          type="email"
                          placeholder="proposals@acmeagency.com"
                          value={editForm.branding.emailSenderAddress}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              branding: { ...editForm.branding, emailSenderAddress: e.target.value },
                            })
                          }
                          className="w-full px-3 py-2 text-xs rounded-lg border border-border/60 bg-background"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Drawer Footer */}
              <div className="p-6 border-t border-border/60 flex items-center justify-end gap-2 bg-muted/10">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="px-4 py-2 text-xs font-medium rounded-lg border border-border/60 hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={savingEdit}
                  className="px-5 py-2 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2 shadow-xs"
                >
                  {savingEdit && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Save Configuration
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
