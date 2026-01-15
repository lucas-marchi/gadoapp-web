import { Cloud, CloudOff, RefreshCw, CheckCircle2 } from 'lucide-react';
import { useSync } from '../hooks/useSync';

export function SyncIndicator() {
  const { isOnline, isSyncing, pendingCount, syncNow } = useSync();

  return (
    <button
      onClick={syncNow}
      disabled={isSyncing || !isOnline}
      className={`
        flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all
        ${isSyncing 
          ? 'bg-blue-100 text-blue-700' 
          : !isOnline 
            ? 'bg-gray-100 text-gray-500' 
            : pendingCount > 0 
              ? 'bg-orange-100 text-orange-700'
              : 'bg-green-100 text-green-700'}
      `}
    >
      {isSyncing ? (
        <RefreshCw className="animate-spin" size={14} />
      ) : !isOnline ? (
        <CloudOff size={14} />
      ) : pendingCount > 0 ? (
        <Cloud size={14} />
      ) : (
        <CheckCircle2 size={14} />
      )}
      
      <span className="hidden sm:inline">
        {isSyncing ? 'Sincronizando...' 
         : !isOnline ? 'Offline' 
         : pendingCount > 0 ? `${pendingCount} pendente(s)` 
         : 'Sincronizado'}
      </span>
    </button>
  );
}