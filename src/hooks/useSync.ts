import { useState, useEffect, useCallback } from 'react';
import { db } from '../db/db';
import { api } from '../lib/axios';
import { useLiveQuery } from 'dexie-react-hooks';

export function useSync() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);

  const pendingHerds = useLiveQuery(() => 
    db.herds.where('syncStatus').notEqual('synced').toArray()
  );
  
  const pendingCount = (pendingHerds?.length || 0);

  const syncNow = useCallback(async () => {
    if (!navigator.onLine || isSyncing) return;
    
    setIsSyncing(true);

    try {
      const unsyncedHerds = await db.herds
        .where('syncStatus').anyOf('created', 'updated', 'deleted')
        .toArray();

      if (unsyncedHerds.length > 0) {
        const dtos = unsyncedHerds.map(h => ({
          id: h.serverId, 
          name: h.name,
          active: h.active,
        }));

        await api.post('/sync/herds/push', { data: dtos });

        await db.transaction('rw', db.herds, async () => {
          for (const herd of unsyncedHerds) {
            if (herd.syncStatus === 'deleted') {
               if (herd.id) await db.herds.delete(herd.id);
            } else {
               if (herd.id) await db.herds.update(herd.id, { syncStatus: 'synced' });
            }
          }
        });
      }

      const countLocal = await db.herds.count();
      let lastSync = localStorage.getItem('last_sync_herds');
      
      if (countLocal === 0) {
        console.log("Banco vazio detectado. Forçando download completo.");
        lastSync = null; 
      }

      const params = lastSync ? { since: lastSync } : {};
      
      const response = await api.get('/sync/herds/pull', { params });
      const serverHerds = response.data;

      if (serverHerds.length > 0) {
        await db.transaction('rw', db.herds, async () => {
          for (const serverHerd of serverHerds) {
            const existing = await db.herds.where('serverId').equals(serverHerd.id).first();
            
            const existingByName = !existing 
                ? await db.herds.where('name').equals(serverHerd.name).first() 
                : null;

            const target = existing || existingByName;
            
            if (target) {
              await db.herds.update(target.id!, {
                serverId: serverHerd.id,
                name: serverHerd.name,
                active: serverHerd.active,
                syncStatus: 'synced',
                updatedAt: serverHerd.updatedAt
              });
            } else {
              if (serverHerd.active) { 
                await db.herds.add({
                  serverId: serverHerd.id,
                  name: serverHerd.name,
                  active: serverHerd.active,
                  syncStatus: 'synced',
                  updatedAt: serverHerd.updatedAt
                });
              }
            }
          }
        });
        
        localStorage.setItem('last_sync_herds', new Date().toISOString());
      }

    } catch (error) {
      console.error('Erro no Sync:', error);
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing]); 

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      syncNow(); 
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    if (navigator.onLine) {
        syncNow();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isOnline, isSyncing, pendingCount, syncNow };
}