import { X, Crown, Check, Sparkles } from "lucide-react";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
}

export function UpgradeModal({ isOpen, onClose, message }: UpgradeModalProps) {
  if (!isOpen) return null;

  const handleUpgradeRedirect = () => {
    onClose();
    window.location.href = "/profile?tab=subscription";
  };

  const PREMIUM_FEATURES = [
    "Propriedades e rebanhos adicionais",
    "Bovinos ilimitados com histórico completo",
    "Relatórios profissionais e exportação de dados",
    "Convite de membros com permissões de acesso",
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity duration-300">
      {/* Back drop click to close */}
      <div className="absolute inset-0" onClick={onClose} />
      
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-8 max-w-md w-full shadow-2xl relative z-10 animate-scale-in text-neutral-900 dark:text-neutral-50 transition-colors duration-300">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Fechar modal"
          className="absolute top-5 right-5 p-1.5 rounded-full text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center">
          
          {/* Badge Icon Container */}
          <div className="w-16 h-16 rounded-2xl bg-primary-50 dark:bg-primary-950/30 flex items-center justify-center mb-5 relative border border-primary-100 dark:border-primary-900/20">
            <Crown className="w-8 h-8 text-primary-600 dark:text-primary-400" />
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tertiary-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-tertiary-500"></span>
            </span>
          </div>

          {/* Titles */}
          <h3 className="text-2xl font-extrabold tracking-tight text-neutral-900 dark:text-white mb-2">
            Limite do Plano Atingido
          </h3>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-[280px] mb-6">
            {message}
          </p>

          {/* Features Box */}
          <div className="bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-100 dark:border-neutral-800/60 rounded-2xl p-5 w-full mb-6 text-left">
            <h4 className="text-xs font-bold uppercase tracking-wider text-primary-600 dark:text-primary-400 mb-3 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> O que você ganha com o upgrade:
            </h4>
            <ul className="space-y-3">
              {PREMIUM_FEATURES.map((feat) => (
                <li key={feat} className="flex items-start gap-2.5 text-sm text-neutral-600 dark:text-neutral-300">
                  <Check className="w-4 h-4 text-primary-600 dark:text-primary-400 flex-shrink-0 mt-0.5" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 w-full">
            <button
              onClick={handleUpgradeRedirect}
              className="w-full py-3 px-6 rounded-2xl font-semibold text-white bg-primary-600 hover:bg-primary-700 active:scale-[0.98] shadow-md shadow-primary-600/10 dark:shadow-none transition-all flex items-center justify-center gap-2"
            >
              Fazer Upgrade do Plano
            </button>
            <button
              onClick={onClose}
              className="w-full py-2 px-4 rounded-xl font-medium text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
            >
              Continuar no plano gratuito
            </button>
          </div>
          
        </div>
      </div>
    </div>
  );
}
