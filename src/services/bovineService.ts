import { db } from "../db/db";

export interface BovineDTO {
  name: string;
  status: string;
  gender: string;
  breed?: string;
  weight?: number;
  birth: string;
  description?: string;
  herdId: number;
  momId?: number;
  dadId?: number;
}

export const bovineService = {
  list: async (filters: any) => {
    let collection = db.bovines.filter((b) => b.active !== false);

    if (filters.herdId)
      collection = collection.filter(
        (b) => b.herdId === Number(filters.herdId),
      );
    if (filters.status)
      collection = collection.filter((b) => b.status === filters.status);
    if (filters.gender)
      collection = collection.filter((b) => b.gender === filters.gender);

    if (filters.search) {
      const lower = filters.search.toLowerCase();
      collection = collection.filter(
        (b) =>
          b.name.toLowerCase().includes(lower) ||
          (b.breed && b.breed.toLowerCase().includes(lower)) ||
          false,
      );
    }
    return collection.toArray();
  },

  save: async (dto: BovineDTO, id?: number) => {
    console.log("SAVE BOVINE CHAMADO", dto);

    const newSyncStatus: "updated" | "created" = id ? "updated" : "created";

    const herd = await db.herds.get(dto.herdId);
    const serverHerdId = herd?.serverId || undefined;

    console.log("Novo Rebanho Local:", dto.herdId, "ServerID:", serverHerdId);

    const payload = {
      ...dto,
      serverHerdId,
      active: true,
      syncStatus: newSyncStatus,
      updatedAt: new Date().toISOString(),
    };

    if (id) {
      return db.bovines.update(id, payload);
    }
    return db.bovines.add({ ...payload, syncStatus: "created" });
  },

  delete: async (id: number) => {
    return db.bovines.update(id, {
      active: false,
      syncStatus: "deleted",
      updatedAt: new Date().toISOString(),
    });
  },

  batchMove: async (ids: number[], targetHerdId: number) => {
    const targetHerd = await db.herds.get(targetHerdId);
    const targetServerId = targetHerd?.serverId;

    return db.transaction("rw", db.bovines, async () => {
      for (const id of ids) {
        const updatePayload: any = {
          herdId: targetHerdId,
          syncStatus: "updated",
          updatedAt: new Date().toISOString(),
        };

        if (targetServerId) {
          updatePayload.serverHerdId = targetServerId;
        } else {
          updatePayload.serverHerdId = undefined;
        }

        await db.bovines.update(id, updatePayload);
      }
    });
  },

  batchDelete: async (ids: number[]) => {
    return db.transaction("rw", db.bovines, async () => {
      for (const id of ids) {
        await db.bovines.update(id, {
          active: false,
          syncStatus: "deleted",
          updatedAt: new Date().toISOString(),
        });
      }
    });
  },
};
