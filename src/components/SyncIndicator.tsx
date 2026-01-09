import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { useSync } from '../hooks/useSync';

export function SyncIndicator() {
  const { isOnline, isSyncing, pendingCount, syncNow } = useSync();

  return (
    <div className="fixed bottom-4 right-4 flex flex-col items-end gap-2">
      {pendingCount > 0 && (
        <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium shadow-sm border border-yellow-200">
          {pendingCount} alteração(ões) pendente(s)
        </div>
      )}
      
      <button
        onClick={syncNow}
        disabled={isSyncing || !isOnline}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-full shadow-lg transition-all
          ${isOnline 
            ? 'bg-blue-600 text-white hover:bg-blue-700' 
            : 'bg-gray-500 text-white cursor-not-allowed'}
        `}
      >
        {isSyncing ? (
          <RefreshCw className="animate-spin" size={18} />
        ) : isOnline ? (
          <Wifi size={18} />
        ) : (
          <WifiOff size={18} />
        )}
        
        <span className="font-medium">
          {isSyncing ? 'Sincronizando...' : isOnline ? 'Online' : 'Offline'}
        </span>
      </button>
    </div>
  );
}