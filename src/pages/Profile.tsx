import { useState, useEffect } from "react";
import {
  User,
  MapPin,
  CreditCard,
  Mail,
  Building2,
  Plus,
  UserPlus,
  Crown,
  Shield,
  Eye,
  Check,
  X,
  Pencil,
  Loader2,
  Lock,
} from "lucide-react";
import { MobileHeader } from "../components/layout/MobileHeader";
import { SyncIndicator } from "../components/features/shared/SyncIndicator";
import { Input } from "../components/ui/Input";
import { Label } from "../components/ui/Label";
import { useAuth } from "../contexts/AuthContext";
import { useFarm, type Farm } from "../contexts/FarmContext";
import { api } from "../lib/axios";
import { toast } from "sonner";
import { FarmFormModal } from "../components/features/farm/FarmFormModal";
import { InviteMemberModal } from "../components/features/farm/InviteMemberModal";

type Tab = "account" | "farms" | "subscription" | "invites";

interface PendingInvite {
  id: number;
  userName: string; // farm name for invites
  userEmail: string; // role
  role: string;
  status: string;
}

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "account", label: "Minha Conta", icon: User },
  { id: "farms", label: "Propriedades", icon: MapPin },
  { id: "subscription", label: "Assinatura", icon: CreditCard },
  { id: "invites", label: "Convites", icon: Mail },
];

const ROLE_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  OWNER: { label: "Proprietário", icon: Crown, color: "text-amber-500" },
  ADMIN: { label: "Administrador", icon: Shield, color: "text-blue-500" },
  VIEWER: { label: "Visualizador", icon: Eye, color: "text-neutral-500" },
};

export function Profile() {
  const { user, updateUser } = useAuth();
  const { farms, activeFarm, switchFarm, refreshFarms } = useFarm();

  const [activeTab, setActiveTab] = useState<Tab>("account");
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [showFarmModal, setShowFarmModal] = useState(false);
  const [editingFarm, setEditingFarm] = useState<Farm | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteFarmId, setInviteFarmId] = useState<number | null>(null);

  const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>([]);
  const [isSubscribing, setIsSubscribing] = useState<string | null>(null);

  useEffect(() => {
    loadProfile();
    loadInvites();
  }, []);

  const loadProfile = async () => {
    try {
      const res = await api.get("/profile");
      setName(res.data.name || "");
      setPhone(res.data.phone || "");
    } catch {
      // Use cached data
    }
  };

  const loadInvites = async () => {
    try {
      const res = await api.get("/farms/invites/pending");
      setPendingInvites(res.data);
    } catch {
      // Offline
    }
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      await api.put("/profile", { name, phone });
      updateUser({ name });
      setIsEditing(false);
      toast.success("Perfil atualizado!");
    } catch {
      toast.error("Erro ao salvar perfil.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      toast.error("Preencha ambos os campos.");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("A nova senha deve ter no mínimo 6 caracteres.");
      return;
    }
    try {
      await api.put("/profile/password", { currentPassword, newPassword });
      toast.success("Senha alterada com sucesso!");
      setShowPasswordModal(false);
      setCurrentPassword("");
      setNewPassword("");
    } catch (e: any) {
      toast.error(e.response?.data?.error || "Erro ao alterar senha.");
    }
  };

  const handleAcceptInvite = async (id: number) => {
    try {
      await api.post(`/farms/invites/${id}/accept`);
      toast.success("Convite aceito!");
      setPendingInvites((prev) => prev.filter((i) => i.id !== id));
      refreshFarms();
    } catch {
      toast.error("Erro ao aceitar convite.");
    }
  };

  const handleDeclineInvite = async (id: number) => {
    try {
      await api.post(`/farms/invites/${id}/decline`);
      setPendingInvites((prev) => prev.filter((i) => i.id !== id));
    } catch {
      toast.error("Erro ao recusar convite.");
    }
  };

  const handleSubscribe = async (priceId: string) => {
    setIsSubscribing(priceId);
    try {
      const response = await api.post("/v1/subscriptions/checkout", {
        priceId,
        successUrl: `${window.location.origin}/profile?success=true`,
        cancelUrl: `${window.location.origin}/profile?canceled=true`,
      });
      if (response.data.url) {
        window.location.href = response.data.url;
      }
    } catch (e: any) {
      toast.error("Erro ao iniciar assinatura. Tente novamente.");
    } finally {
      setIsSubscribing(null);
    }
  };

  const PLANS = [
    {
      id: "free",
      name: "Gratuito",
      price: "R$ 0",
      features: ["1 propriedade", "50 bovinos", "1 rebanho", "Relatórios básicos"],
      current: !user?.subscriptionStatus || user?.subscriptionStatus === "canceled",
      priceId: "",
    },
    {
      id: "producer",
      name: "Produtor",
      price: "R$ 49,90",
      period: "/mês",
      features: [
        "3 propriedades",
        "Bovinos ilimitados",
        "Relatórios PDF",
        "Exportação CSV",
        "Suporte por email",
      ],
      highlighted: true,
      current: user?.subscriptionStatus === "active" && user?.stripePriceId === "price_1TfTGmKHCIRT9fmkCYZ9DwXd",
      priceId: "price_1TfTGmKHCIRT9fmkCYZ9DwXd",
    },
    {
      id: "enterprise",
      name: "Enterprise",
      price: "R$ 149,90",
      period: "/mês",
      features: [
        "Propriedades ilimitadas",
        "Membros ilimitados",
        "Relatórios avançados",
        "API de integração",
        "Suporte prioritário",
      ],
      current: user?.subscriptionStatus === "active" && user?.stripePriceId === "price_1TfTHWKHCIRT9fmkxY5wbWeD",
      priceId: "price_1TfTHWKHCIRT9fmkxY5wbWeD",
    },
  ];

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 font-sans pb-24 transition-colors duration-300">
      <MobileHeader title="Perfil" />

      <div className="hidden md:flex justify-between items-center max-w-5xl mx-auto pt-8 px-4 mb-6">
        <h1 className="text-3xl font-bold text-neutral-800 dark:text-white">Perfil</h1>
        <SyncIndicator />
      </div>

      <main className="max-w-5xl mx-auto p-4 space-y-6">
        {/* TAB BAR */}
        <div className="flex gap-1 bg-white dark:bg-neutral-800 p-1.5 rounded-2xl border border-neutral-100 dark:border-neutral-700 shadow-sm overflow-x-auto">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap flex-1 justify-center ${
                  isActive
                    ? "bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400 shadow-sm"
                    : "text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
                }`}
              >
                <Icon size={16} />
                {tab.label}
                {tab.id === "invites" && pendingInvites.length > 0 && (
                  <span className="bg-danger-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {pendingInvites.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* TAB: MINHA CONTA */}
        {activeTab === "account" && (
          <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-100 dark:border-neutral-700 shadow-sm p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-neutral-800 dark:text-white">Dados Pessoais</h2>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium"
                >
                  <Pencil size={14} /> Editar
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Nome</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input value={user?.email || ""} disabled className="opacity-60" />
              </div>
              <div>
                <Label>Telefone</Label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={!isEditing}
                  placeholder="(00) 00000-0000"
                />
              </div>
            </div>

            {isEditing && (
              <div className="flex gap-3">
                <button
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-60"
                >
                  {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                  Salvar
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setName(user?.name || "");
                  }}
                  className="px-6 py-2.5 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-xl text-sm font-medium transition-colors"
                >
                  Cancelar
                </button>
              </div>
            )}

            <div className="pt-4 border-t border-neutral-100 dark:border-neutral-700">
              <button
                onClick={() => setShowPasswordModal(true)}
                className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-white font-medium transition-colors"
              >
                <Lock size={16} /> Alterar Senha
              </button>
            </div>
          </div>
        )}

        {/* TAB: PROPRIEDADES */}
        {activeTab === "farms" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-neutral-800 dark:text-white">
                Suas Propriedades ({farms.length})
              </h2>
              <button
                onClick={() => {
                  setEditingFarm(null);
                  setShowFarmModal(true);
                }}
                className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-medium shadow-lg shadow-primary-200 dark:shadow-none transition-colors active:scale-[0.98]"
              >
                <Plus size={16} /> Nova Propriedade
              </button>
            </div>

            {farms.map((farm) => {
              const roleConfig = ROLE_CONFIG[farm.role] || ROLE_CONFIG.VIEWER;
              const RoleIcon = roleConfig.icon;
              const isActive = activeFarm?.id === farm.id;

              return (
                <div
                  key={farm.id}
                  className={`bg-white dark:bg-neutral-800 rounded-2xl border shadow-sm p-6 transition-all ${
                    isActive
                      ? "border-primary-300 dark:border-primary-600 ring-2 ring-primary-100 dark:ring-primary-900/30"
                      : "border-neutral-100 dark:border-neutral-700"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Building2 size={20} className="text-primary-600 dark:text-primary-400" />
                        <h3 className="text-lg font-bold text-neutral-800 dark:text-white">
                          {farm.name}
                        </h3>
                        {isActive && (
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400 px-2 py-0.5 rounded-full">
                            Ativa
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm text-neutral-500 dark:text-neutral-400 mb-3">
                        <span className="flex items-center gap-1">
                          <RoleIcon size={14} className={roleConfig.color} /> {roleConfig.label}
                        </span>
                        {farm.inscricaoEstadual && (
                          <span>IE: {farm.inscricaoEstadual}</span>
                        )}
                        {farm.city && farm.state && (
                          <span className="flex items-center gap-1">
                            <MapPin size={14} /> {farm.city}/{farm.state}
                          </span>
                        )}
                        {farm.totalAreaHa && <span>{farm.totalAreaHa} ha</span>}
                      </div>

                      <div className="flex gap-6 text-sm">
                        <span className="text-neutral-600 dark:text-neutral-300">
                          <strong>{farm.herdCount}</strong> rebanho{farm.herdCount !== 1 ? "s" : ""}
                        </span>
                        <span className="text-neutral-600 dark:text-neutral-300">
                          <strong>{farm.bovineCount}</strong> bovino{farm.bovineCount !== 1 ? "s" : ""}
                        </span>
                        <span className="text-neutral-600 dark:text-neutral-300">
                          <strong>{farm.memberCount}</strong> membro{farm.memberCount !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      {!isActive && (
                        <button
                          onClick={() => switchFarm(farm.id)}
                          className="text-xs font-medium px-3 py-1.5 bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors"
                        >
                          Ativar
                        </button>
                      )}
                      {(farm.role === "OWNER" || farm.role === "ADMIN") && (
                        <>
                          <button
                            onClick={() => {
                              setEditingFarm(farm);
                              setShowFarmModal(true);
                            }}
                            className="text-xs font-medium px-3 py-1.5 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => {
                              setInviteFarmId(farm.id);
                              setShowInviteModal(true);
                            }}
                            className="text-xs font-medium px-3 py-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors flex items-center gap-1"
                          >
                            <UserPlus size={12} /> Convidar
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB: ASSINATURA */}
        {activeTab === "subscription" && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-neutral-800 dark:text-white">Planos</h2>
            
            {user?.subscriptionStatus === "active" && (
               <div className="bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 p-4 rounded-xl flex items-center gap-3 font-medium">
                 <Check size={20} />
                 Você tem uma assinatura ativa!
               </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {PLANS.map((plan) => (
                <div
                  key={plan.id}
                  className={`bg-white dark:bg-neutral-800 rounded-2xl border p-6 transition-all ${
                    plan.highlighted
                      ? "border-primary-300 dark:border-primary-600 ring-2 ring-primary-100 dark:ring-primary-900/30 relative"
                      : "border-neutral-100 dark:border-neutral-700"
                  }`}
                >
                  {plan.highlighted && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary-600 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                      Recomendado
                    </span>
                  )}

                  <h3 className="text-lg font-bold text-neutral-800 dark:text-white mb-1">
                    {plan.name}
                  </h3>
                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-2xl font-bold text-neutral-900 dark:text-white">
                      {plan.price}
                    </span>
                    {plan.period && (
                      <span className="text-sm text-neutral-500 dark:text-neutral-400">
                        {plan.period}
                      </span>
                    )}
                  </div>

                  <ul className="space-y-2 mb-6">
                    {plan.features.map((f) => (
                      <li
                        key={f}
                        className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-300"
                      >
                        <Check size={14} className="text-primary-500 flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  {plan.current ? (
                    <div className="text-center py-2.5 bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 rounded-xl text-sm font-medium">
                      Plano Atual
                    </div>
                  ) : (
                    <button 
                      onClick={() => handleSubscribe(plan.priceId)}
                      disabled={isSubscribing === plan.priceId}
                      className="w-full flex justify-center items-center gap-2 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white rounded-xl text-sm font-medium transition-colors shadow-lg shadow-primary-200 dark:shadow-none active:scale-[0.98]">
                      {isSubscribing === plan.priceId ? <Loader2 size={16} className="animate-spin" /> : "Assinar"}
                    </button>
                  )}
                </div>
              ))}
            </div>
            <p className="text-xs text-center text-neutral-400 dark:text-neutral-500">
              Pagamentos seguros processados pelo Stripe.
            </p>
          </div>
        )}

        {/* TAB: CONVITES */}
        {activeTab === "invites" && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-neutral-800 dark:text-white">
              Convites Pendentes
            </h2>

            {pendingInvites.length === 0 ? (
              <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-100 dark:border-neutral-700 shadow-sm p-12 text-center">
                <Mail size={48} className="mx-auto mb-4 text-neutral-300 dark:text-neutral-600" />
                <h3 className="text-lg font-semibold text-neutral-600 dark:text-neutral-400">
                  Nenhum convite pendente
                </h3>
                <p className="text-sm text-neutral-400 dark:text-neutral-500 mt-1">
                  Quando alguém convidar você para uma propriedade, o convite aparecerá aqui.
                </p>
              </div>
            ) : (
              pendingInvites.map((invite) => (
                <div
                  key={invite.id}
                  className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-100 dark:border-neutral-700 shadow-sm p-6 flex items-center justify-between gap-4"
                >
                  <div>
                    <h3 className="font-bold text-neutral-800 dark:text-white">
                      {invite.userName}
                    </h3>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      Cargo: {ROLE_CONFIG[invite.role]?.label || invite.role}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAcceptInvite(invite.id)}
                      className="flex items-center gap-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-medium transition-colors"
                    >
                      <Check size={14} /> Aceitar
                    </button>
                    <button
                      onClick={() => handleDeclineInvite(invite.id)}
                      className="flex items-center gap-1 px-4 py-2 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-xl text-sm font-medium transition-colors"
                    >
                      <X size={14} /> Recusar
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>

      {/* PASSWORD MODAL */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6 w-full max-w-md border border-neutral-100 dark:border-neutral-700 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-neutral-800 dark:text-white">Alterar Senha</h3>
            <div>
              <Label>Senha Atual</Label>
              <Input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            <div>
              <Label>Nova Senha</Label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowPasswordModal(false)}
                className="px-4 py-2 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-xl text-sm font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleChangePassword}
                className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-medium transition-colors"
              >
                Alterar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FARM MODAL */}
      {showFarmModal && (
        <FarmFormModal
          farm={editingFarm}
          onClose={() => {
            setShowFarmModal(false);
            setEditingFarm(null);
          }}
          onSaved={() => {
            setShowFarmModal(false);
            setEditingFarm(null);
            refreshFarms();
          }}
        />
      )}

      {/* INVITE MODAL */}
      {showInviteModal && inviteFarmId && (
        <InviteMemberModal
          farmId={inviteFarmId}
          onClose={() => {
            setShowInviteModal(false);
            setInviteFarmId(null);
          }}
        />
      )}
    </div>
  );
}
