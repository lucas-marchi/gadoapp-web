import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import { db } from "../db/db";
import { api } from "../lib/axios";
import { useLiveQuery } from "dexie-react-hooks";
import { Check } from "lucide-react";

interface SyncContextType {
  isOnline: boolean;
  isSyncing: boolean;
  pendingCount: number;
  syncNow: () => void;
}

const SyncContext = createContext<SyncContextType>({} as SyncContextType);

export function SyncProvider({ children }: { children: ReactNode }) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const syncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pendingHerds = useLiveQuery(() =>
    db.herds.where("syncStatus").notEqual("synced").toArray(),
  );

  const pendingCount = pendingHerds?.length || 0;

  const syncNow = useCallback(async () => {
    if (!navigator.onLine || isSyncing) return;

    if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);

    syncTimeoutRef.current = setTimeout(async () => {
      setIsSyncing(true);
      try {
        // =================================================
        // 1. REBANHOS (HERDS) - Prioridade Máxima
        // =================================================

        // 1.1 PUSH HERDS
        const unsyncedHerds = await db.herds
          .where("syncStatus")
          .anyOf("created", "updated", "deleted")
          .toArray();

        if (unsyncedHerds.length > 0) {
          const dtos = unsyncedHerds.map((h) => ({
            id: h.serverId,
            name: h.name,
            active: h.active,
          }));

          await api.post("/sync/herds/push", { data: dtos });

          await db.transaction("rw", db.herds, async () => {
            for (const herd of unsyncedHerds) {
              if (herd.syncStatus === "deleted") {
                if (herd.id) await db.herds.delete(herd.id);
              } else {
                if (herd.id)
                  await db.herds.update(herd.id, { syncStatus: "synced" });
              }
            }
          });
        }

        // 1.2 PULL HERDS
        const countLocalHerds = await db.herds.count();
        let lastSyncHerds = localStorage.getItem("last_sync_herds");
        if (countLocalHerds === 0) lastSyncHerds = null;

        const paramsHerds = lastSyncHerds ? { since: lastSyncHerds } : {};
        const resHerds = await api.get("/sync/herds/pull", {
          params: paramsHerds,
        });
        const serverHerds = resHerds.data;

        if (serverHerds.length > 0) {
          await db.transaction("rw", db.herds, db.bovines, async () => {
            for (const serverHerd of serverHerds) {
              const existing = await db.herds
                .where("serverId")
                .equals(serverHerd.id)
                .first();
              const existingByName = !existing
                ? await db.herds.where("name").equals(serverHerd.name).first()
                : null;

              const target = existing || existingByName;

              if (target) {
                await db.herds.update(target.id!, {
                  serverId: serverHerd.id,
                  name: serverHerd.name,
                  active: serverHerd.active,
                  syncStatus: "synced",
                  updatedAt: serverHerd.updatedAt,
                });

                // ATUALIZAÇÃO EM CASCATA:
                // Se o rebanho ganhou um serverId novo, precisamos avisar os bois locais
                // que pertencem a ele para usarem esse serverId no futuro envio.
                if (!target.serverId) {
                  await db.bovines
                    .where("herdId")
                    .equals(target.id!)
                    .modify({ serverHerdId: serverHerd.id });
                }
              } else {
                if (serverHerd.active) {
                  await db.herds.add({
                    serverId: serverHerd.id,
                    name: serverHerd.name,
                    active: serverHerd.active,
                    syncStatus: "synced",
                    updatedAt: serverHerd.updatedAt,
                  });
                }
              }
            }
          });
          localStorage.setItem("last_sync_herds", new Date().toISOString());
        }

        // =================================================
        // 2. BOVINOS (BOVINES)
        // =================================================

        // 2.1 PREPARAR DADOS (Vincular IDs)
        // Antes de enviar, garante que todo boi tenha o serverHerdId preenchido
        const bovinesWithoutServerHerd = await db.bovines
          .filter((b) => !b.serverHerdId && !!b.herdId)
          .toArray();

        for (const b of bovinesWithoutServerHerd) {
          const herd = await db.herds.get(b.herdId!);
          if (herd && herd.serverId) {
            await db.bovines.update(b.id!, { serverHerdId: herd.serverId });
          }
        }

        // 2.2 PUSH BOVINES
        const unsyncedBovines = await db.bovines
          .where("syncStatus")
          .anyOf("created", "updated", "deleted")
          .toArray();

        if (unsyncedBovines.length > 0) {
          const dtos = unsyncedBovines.map((b) => ({
            id: b.serverId,
            name: b.name,
            status: b.status,
            gender: b.gender,
            breed: b.breed,
            weight: b.weight,
            birth: b.birth,
            description: b.description,
            herdId: b.serverHerdId,
            active: b.active,
            // momId, dadId (Futuro: mesma lógica de serverId)
          }));

          await api.post("/sync/bovines/push", { data: dtos });

          await db.transaction("rw", db.bovines, async () => {
            for (const b of unsyncedBovines) {
              if (b.syncStatus === "deleted") {
                if (b.id) await db.bovines.delete(b.id);
              } else {
                if (b.id)
                  await db.bovines.update(b.id, { syncStatus: "synced" });
              }
            }
          });
        }

        // 2.3 PULL BOVINES
        const countLocalBovines = await db.bovines.count();
        let lastSyncBovines = localStorage.getItem("last_sync_bovines");

        if (countLocalBovines === 0 || unsyncedBovines.length > 0) {
          lastSyncBovines = null;
        }

        const paramsBovines = lastSyncBovines ? { since: lastSyncBovines } : {};
        const resBovines = await api.get("/sync/bovines/pull", {
          params: paramsBovines,
        });
        const serverBovines = resBovines.data;

        if (serverBovines.length > 0) {
          await db.transaction("rw", db.bovines, db.herds, async () => {
            for (const sb of serverBovines) {
              // 1. Tenta achar pelo serverId
              const existing = await db.bovines
                .where("serverId")
                .equals(sb.id)
                .first();

              // 2. Descobre o ID local do rebanho (para busca e para salvar)
              let localHerdId = undefined;
              if (sb.herdId) {
                const h = await db.herds
                  .where("serverId")
                  .equals(sb.herdId)
                  .first();
                console.log(
                  `Buscando rebanho local para serverId ${sb.herdId}:`,
                  h,
                );
                if (h) localHerdId = h.id;
              }

              // 3. Tenta achar pelo (nome + rebanho) se não achou pelo ID
              const existingByName = !existing
                ? await db.bovines
                    .where("name")
                    .equals(sb.name)
                    .filter((b) => !b.serverId) // Só pega se não tiver vínculo ainda
                    .first()
                : null;

              const target = existing || existingByName;

              const payload = {
                serverId: sb.id,
                name: sb.name,
                status: sb.status,
                gender: sb.gender,
                breed: sb.breed,
                weight: sb.weight,
                birth: sb.birth,
                description: sb.description,
                herdId: localHerdId,
                serverHerdId: sb.herdId,
                active: sb.active,
                syncStatus: "synced" as const,
                updatedAt: sb.updatedAt,
              };

              console.log("Pull Bovino:", sb.name, sb.id);
              console.log("Target encontrado:", target);

              if (target) {
                console.log("Atualizando target com serverId:", sb.id);
                await db.bovines.update(target.id!, payload);
              } else {
                if (sb.active) {
                  await db.bovines.add(payload);
                  console.log("Boi após update:", Check);
                }
              }
            }
          });
          localStorage.setItem("last_sync_bovines", new Date().toISOString());
        }
      } catch (error) {
        console.error("Erro no Sync:", error);
      } finally {
        setIsSyncing(false);
        syncTimeoutRef.current = null;
      }
    }, 500);
  }, [isSyncing]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      syncNow();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    if (navigator.onLine) {
      syncNow();
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    };
  }, []);

  return (
    <SyncContext.Provider
      value={{ isOnline, isSyncing, pendingCount, syncNow }}
    >
      {children}
    </SyncContext.Provider>
  );
}

export const useSync = () => useContext(SyncContext);
