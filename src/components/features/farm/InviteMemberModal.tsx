import { useState } from "react";
import { X, Loader2, UserPlus } from "lucide-react";
import { Input } from "../../ui/Input";
import { Label } from "../../ui/Label";
import { Select } from "../../ui/Select";
import { api } from "../../../lib/axios";
import { toast } from "sonner";

interface InviteMemberModalProps {
  farmId: number;
  onClose: () => void;
}

export function InviteMemberModal({ farmId, onClose }: InviteMemberModalProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("VIEWER");
  const [isSending, setIsSending] = useState(false);

  const handleInvite = async () => {
    if (!email.trim()) {
      toast.error("Digite o email do convidado.");
      return;
    }

    setIsSending(true);
    try {
      await api.post(`/farms/${farmId}/invite`, { email, role });
      toast.success(`Convite enviado para ${email}!`);
      onClose();
    } catch (e: any) {
      const msg = e.response?.data?.message || "Erro ao enviar convite.";
      toast.error(msg);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-neutral-800 rounded-2xl w-full max-w-md border border-neutral-100 dark:border-neutral-700 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 dark:border-neutral-700">
          <div className="flex items-center gap-2">
            <UserPlus size={20} className="text-blue-500" />
            <h3 className="text-lg font-bold text-neutral-800 dark:text-white">
              Convidar Membro
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors"
          >
            <X size={20} className="text-neutral-500" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <div>
            <Label>Email do Convidado</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="consultor@email.com"
              autoFocus
            />
          </div>

          <div>
            <Label>Permissão</Label>
            <Select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="ADMIN">Administrador — pode editar e convidar</option>
              <option value="VIEWER">Visualizador — apenas consulta</option>
            </Select>
          </div>

          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            O convidado precisa ter uma conta no GadoApp. Ele verá o convite na aba "Convites" do perfil.
          </p>
        </div>

        {/* Footer */}
        <div className="flex gap-3 justify-end px-6 py-4 border-t border-neutral-100 dark:border-neutral-700">
          <button
            onClick={onClose}
            className="px-4 py-2.5 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-xl text-sm font-medium transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleInvite}
            disabled={isSending}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-60"
          >
            {isSending && <Loader2 size={16} className="animate-spin" />}
            Enviar Convite
          </button>
        </div>
      </div>
    </div>
  );
}
