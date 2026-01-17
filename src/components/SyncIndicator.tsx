import { CloudOff, RefreshCw, UploadCloud, Wifi, RotateCw } from "lucide-react";
import { useSync } from "../contexts/SyncContext";

export function SyncIndicator() {
  const { isOnline, isSyncing, pendingCount, syncNow } = useSync();

  let icon = <Wifi size={16} />;
  let statusText = "Online";
  let actionText = "Atualizar";
  let baseClass =
    "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-blue-300 hover:text-blue-600 dark:hover:text-blue-400";

  if (!isOnline) {
    icon = <CloudOff size={16} />;
    statusText = "Offline";
    actionText = "";
    baseClass =
      "bg-gray-50 dark:bg-gray-900 text-gray-400 border-gray-200 dark:border-gray-800 cursor-not-allowed";
  } else if (isSyncing) {
    icon = <RefreshCw className="animate-spin" size={16} />;
    statusText = "Sincronizando...";
    actionText = "";
    baseClass =
      "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800 cursor-wait";
  } else if (pendingCount > 0) {
    icon = <UploadCloud size={16} className="text-orange-500" />;
    statusText = `${pendingCount} pendente(s)`;
    actionText = "Sincronizar";
    baseClass =
      "bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800 hover:bg-orange-100 hover:border-orange-300";
  }

  return (
    <button
      onClick={syncNow}
      disabled={isSyncing || !isOnline}
      className={`
        group flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200
        ${baseClass}
        ${isOnline && !isSyncing ? "active:scale-95 shadow-sm hover:shadow-md" : ""}
      `}
    >
      {/* Ícone + Status */}
      <div className="flex items-center gap-2">
        {icon}
        <span className="hidden sm:inline">{statusText}</span>
      </div>

      {/* Separador e Ação (Só aparece se online e não syncando) */}
      {isOnline && !isSyncing && (
        <>
          {/* Separador (Só Desktop) */}
          <div className="w-px h-3 bg-current opacity-20 mx-1 hidden sm:block" />

          {/* Ação Desktop (Texto + Ícone) */}
          <div className="hidden sm:flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
            {pendingCount === 0 && (
              <RotateCw
                size={12}
                className="group-hover:rotate-180 transition-transform duration-500"
              />
            )}
            <span className="font-bold">{actionText}</span>
          </div>

          {/* Ação Mobile (Só aparece se tiver pendência crítica) */}
          {pendingCount > 0 && (
            <div className="sm:hidden flex items-center gap-1 ml-1 font-bold text-[10px]">
              Sincronizar
            </div>
          )}
        </>
      )}
    </button>
  );
}
