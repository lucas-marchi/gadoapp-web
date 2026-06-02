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
        // 1. REBANHOS (HERDS)
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
        const allBovinesLookup = await db.bovines.toArray();
        const unsyncedBovines = await db.bovines
          .where("syncStatus")
          .anyOf("created", "updated", "deleted")
          .toArray();

        if (unsyncedBovines.length > 0) {
          const dtos = unsyncedBovines.map((b) => {
            const mom = b.momId
              ? allBovinesLookup.find((m) => m.id === b.momId)
              : null;
            const dad = b.dadId
              ? allBovinesLookup.find((d) => d.id === b.dadId)
              : null;

            return {
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
              momId: mom?.serverId || null,
              dadId: dad?.serverId || null,
              tempId: b.id,
              momTempId: b.momId,
              dadTempId: b.dadId,
            };
          });

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
                    .filter((b) => !b.serverId)
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

        // =================================================
        // 3. REGISTROS DE PESO (WEIGHT RECORDS)
        // =================================================

        // 3.1 Resolve server IDs for bovines
        const allBovinesForWR = await db.bovines.toArray();

        // 3.2 PUSH WEIGHT RECORDS
        const unsyncedWeightRecords = await db.weightRecords
          .where("syncStatus")
          .anyOf("created", "updated", "deleted")
          .toArray();

        if (unsyncedWeightRecords.length > 0) {
          const wrDtos = unsyncedWeightRecords.map((wr) => {
            const bovine = allBovinesForWR.find((b) => b.id === wr.bovineId);
            return {
              id: wr.serverId,
              bovineId: bovine?.serverId || null,
              weight: wr.weight,
              recordedAt: wr.recordedAt,
              notes: wr.notes,
              active: wr.active,
              tempId: wr.id,
            };
          });

          await api.post("/sync/weight-records/push", { data: wrDtos });

          await db.transaction("rw", db.weightRecords, async () => {
            for (const wr of unsyncedWeightRecords) {
              if (wr.syncStatus === "deleted") {
                if (wr.id) await db.weightRecords.delete(wr.id);
              } else {
                if (wr.id) await db.weightRecords.update(wr.id, { syncStatus: "synced" });
              }
            }
          });
        }

        // 3.3 PULL WEIGHT RECORDS
        const countLocalWR = await db.weightRecords.count();
        let lastSyncWR = localStorage.getItem("last_sync_weight_records");
        if (countLocalWR === 0 || unsyncedWeightRecords.length > 0) lastSyncWR = null;

        const paramsWR = lastSyncWR ? { since: lastSyncWR } : {};
        const resWR = await api.get("/sync/weight-records/pull", { params: paramsWR });
        const serverWRs = resWR.data;

        if (serverWRs.length > 0) {
          await db.transaction("rw", db.weightRecords, db.bovines, async () => {
            for (const swr of serverWRs) {
              const existing = await db.weightRecords
                .where("serverId").equals(swr.id).first();

              let localBovineId: number | undefined;
              if (swr.bovineId) {
                const b = await db.bovines.where("serverId").equals(swr.bovineId).first();
                if (b) localBovineId = b.id;
              }

              // Fallback: match by bovineId + weight + recordedAt when no serverId
              const existingByFields = !existing && localBovineId
                ? await db.weightRecords
                    .filter((r) => {
                      if (r.serverId || r.bovineId !== localBovineId) return false;
                      if (r.weight !== swr.weight) return false;
                      const localTs = new Date(r.recordedAt).getTime();
                      const serverTs = new Date(swr.recordedAt).getTime();
                      return Math.abs(localTs - serverTs) < 86400000; // within 24h
                    })
                    .first()
                : null;

              const target = existing || existingByFields;

              const payload = {
                serverId: swr.id,
                bovineId: localBovineId || 0,
                serverBovineId: swr.bovineId,
                weight: swr.weight,
                recordedAt: swr.recordedAt,
                notes: swr.notes,
                active: swr.active,
                syncStatus: "synced" as const,
                updatedAt: swr.updatedAt,
              };

              if (target) {
                await db.weightRecords.update(target.id!, payload);
              } else if (swr.active) {
                await db.weightRecords.add(payload);
              }
            }
          });
          localStorage.setItem("last_sync_weight_records", new Date().toISOString());
        }

        // =================================================
        // 4. REGISTROS DE NASCIMENTO (BIRTH RECORDS)
        // =================================================

        // 4.1 PUSH BIRTH RECORDS
        const unsyncedBirthRecords = await db.birthRecords
          .where("syncStatus")
          .anyOf("created", "updated", "deleted")
          .toArray();

        if (unsyncedBirthRecords.length > 0) {
          const brDtos = unsyncedBirthRecords.map((br) => {
            const mother = allBovinesForWR.find((b) => b.id === br.motherId);
            const calf = br.calfId ? allBovinesForWR.find((b) => b.id === br.calfId) : null;
            return {
              id: br.serverId,
              motherId: mother?.serverId || null,
              calfId: calf?.serverId || null,
              birthDate: br.birthDate,
              notes: br.notes,
              active: br.active,
              tempId: br.id,
            };
          });

          await api.post("/sync/birth-records/push", { data: brDtos });

          await db.transaction("rw", db.birthRecords, async () => {
            for (const br of unsyncedBirthRecords) {
              if (br.syncStatus === "deleted") {
                if (br.id) await db.birthRecords.delete(br.id);
              } else {
                if (br.id) await db.birthRecords.update(br.id, { syncStatus: "synced" });
              }
            }
          });
        }

        // 4.2 PULL BIRTH RECORDS
        const countLocalBR = await db.birthRecords.count();
        let lastSyncBR = localStorage.getItem("last_sync_birth_records");
        if (countLocalBR === 0 || unsyncedBirthRecords.length > 0) lastSyncBR = null;

        const paramsBR = lastSyncBR ? { since: lastSyncBR } : {};
        const resBR = await api.get("/sync/birth-records/pull", { params: paramsBR });
        const serverBRs = resBR.data;

        if (serverBRs.length > 0) {
          await db.transaction("rw", db.birthRecords, db.bovines, async () => {
            for (const sbr of serverBRs) {
              const existing = await db.birthRecords
                .where("serverId").equals(sbr.id).first();

              let localMotherId: number | undefined;
              if (sbr.motherId) {
                const m = await db.bovines.where("serverId").equals(sbr.motherId).first();
                if (m) localMotherId = m.id;
              }
              let localCalfId: number | undefined;
              if (sbr.calfId) {
                const c = await db.bovines.where("serverId").equals(sbr.calfId).first();
                if (c) localCalfId = c.id;
              }

              // Fallback: match by motherId + birthDate when no serverId
              const existingByFields = !existing && localMotherId
                ? await db.birthRecords
                    .filter((r) => {
                      if (r.serverId || r.motherId !== localMotherId) return false;
                      const localTs = new Date(r.birthDate).getTime();
                      const serverTs = new Date(sbr.birthDate).getTime();
                      return Math.abs(localTs - serverTs) < 86400000; // within 24h
                    })
                    .first()
                : null;

              const target = existing || existingByFields;

              const payload = {
                serverId: sbr.id,
                motherId: localMotherId || 0,
                serverMotherId: sbr.motherId,
                calfId: localCalfId,
                serverCalfId: sbr.calfId,
                birthDate: sbr.birthDate,
                notes: sbr.notes,
                active: sbr.active,
                syncStatus: "synced" as const,
                updatedAt: sbr.updatedAt,
              };

              if (target) {
                await db.birthRecords.update(target.id!, payload);
              } else if (sbr.active) {
                await db.birthRecords.add(payload);
              }
            }
          });
          localStorage.setItem("last_sync_birth_records", new Date().toISOString());
        }

        // =================================================
        // 5. REGISTROS DE SAÚDE (HEALTH RECORDS)
        // =================================================

        // 5.1 PUSH HEALTH RECORDS
        const unsyncedHealthRecords = await db.healthRecords
          .where("syncStatus")
          .anyOf("created", "updated", "deleted")
          .toArray();

        if (unsyncedHealthRecords.length > 0) {
          const hrDtos = unsyncedHealthRecords.map((hr) => {
            const bovine = allBovinesForWR.find((b) => b.id === hr.bovineId);
            return {
              id: hr.serverId,
              bovineId: bovine?.serverId || null,
              type: hr.type,
              productName: hr.productName,
              appliedAt: hr.appliedAt,
              dosage: hr.dosage,
              veterinarian: hr.veterinarian,
              nextDueDate: hr.nextDueDate,
              notes: hr.notes,
              active: hr.active,
              tempId: hr.id,
            };
          });

          await api.post("/sync/health-records/push", { data: hrDtos });

          await db.transaction("rw", db.healthRecords, async () => {
            for (const hr of unsyncedHealthRecords) {
              if (hr.syncStatus === "deleted") {
                if (hr.id) await db.healthRecords.delete(hr.id);
              } else {
                if (hr.id) await db.healthRecords.update(hr.id, { syncStatus: "synced" });
              }
            }
          });
        }

        // 5.2 PULL HEALTH RECORDS
        const countLocalHR = await db.healthRecords.count();
        let lastSyncHR = localStorage.getItem("last_sync_health_records");
        if (countLocalHR === 0 || unsyncedHealthRecords.length > 0) lastSyncHR = null;

        const paramsHR = lastSyncHR ? { since: lastSyncHR } : {};
        const resHR = await api.get("/sync/health-records/pull", { params: paramsHR });
        const serverHRs = resHR.data;

        if (serverHRs.length > 0) {
          await db.transaction("rw", db.healthRecords, db.bovines, async () => {
            for (const shr of serverHRs) {
              const existing = await db.healthRecords
                .where("serverId").equals(shr.id).first();

              let localBovineId: number | undefined;
              if (shr.bovineId) {
                const b = await db.bovines.where("serverId").equals(shr.bovineId).first();
                if (b) localBovineId = b.id;
              }

              // Fallback: match by bovineId + productName + appliedAt when no serverId
              const existingByFields = !existing && localBovineId
                ? await db.healthRecords
                    .filter((r) => {
                      if (r.serverId || r.bovineId !== localBovineId) return false;
                      if (r.productName !== shr.productName) return false;
                      const localTs = new Date(r.appliedAt).getTime();
                      const serverTs = new Date(shr.appliedAt).getTime();
                      return Math.abs(localTs - serverTs) < 86400000; // within 24h
                    })
                    .first()
                : null;

              const target = existing || existingByFields;

              const payload = {
                serverId: shr.id,
                bovineId: localBovineId || 0,
                serverBovineId: shr.bovineId,
                type: shr.type,
                productName: shr.productName,
                appliedAt: shr.appliedAt,
                dosage: shr.dosage,
                veterinarian: shr.veterinarian,
                nextDueDate: shr.nextDueDate,
                notes: shr.notes,
                active: shr.active,
                syncStatus: "synced" as const,
                updatedAt: shr.updatedAt,
              };

              if (target) {
                await db.healthRecords.update(target.id!, payload);
              } else if (shr.active) {
                await db.healthRecords.add(payload);
              }
            }
          });
          localStorage.setItem("last_sync_health_records", new Date().toISOString());
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
