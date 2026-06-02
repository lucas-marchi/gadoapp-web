import { db } from "../db/db";
import type { WeightRecord, BirthRecord } from "../db/db";

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
  tempId?: number;
  momTempId?: number;
  dadTempId?: number;
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
    const newSyncStatus: "updated" | "created" = id ? "updated" : "created";

    const herd = await db.herds.get(dto.herdId);
    const serverHerdId = herd?.serverId || undefined;

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

    // New bovine: create and get the local ID back
    const newBovineId = await db.bovines.add({ ...payload, syncStatus: "created" });

    // Auto-create WeightRecord if initial weight is provided
    if (dto.weight && dto.weight > 0) {
      const wrPayload: Omit<WeightRecord, "id"> = {
        bovineId: newBovineId as number,
        serverBovineId: undefined,
        weight: dto.weight,
        recordedAt: dto.birth || new Date().toISOString(),
        notes: "Peso inicial no cadastro",
        active: true,
        syncStatus: "created",
        updatedAt: new Date().toISOString(),
      };
      await db.weightRecords.add(wrPayload);
    }

    // Auto-create BirthRecord for the mother if momId is provided
    if (dto.momId) {
      const mother = await db.bovines.get(dto.momId);
      const brPayload: Omit<BirthRecord, "id"> = {
        motherId: dto.momId,
        serverMotherId: mother?.serverId,
        calfId: newBovineId as number,
        serverCalfId: undefined,
        birthDate: dto.birth || new Date().toISOString(),
        notes: undefined,
        active: true,
        syncStatus: "created",
        updatedAt: new Date().toISOString(),
      };
      await db.birthRecords.add(brPayload);
    }

    return newBovineId;
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

  deleteByHerdId: async (herdId: number) => {
    const bovines = await db.bovines
      .filter((b) => b.herdId === herdId && b.active !== false)
      .toArray();

    return db.transaction("rw", db.bovines, async () => {
      for (const bovine of bovines) {
        if (bovine.id) {
          await db.bovines.update(bovine.id, {
            active: false,
            syncStatus: "deleted",
            updatedAt: new Date().toISOString(),
          });
        }
      }
    });
  },

  batchUpdateStatus: async (ids: number[], status: string) => {
    return db.transaction("rw", db.bovines, async () => {
      for (const id of ids) {
        await db.bovines.update(id, {
          status: status,
          syncStatus: "updated",
          updatedAt: new Date().toISOString(),
        });
      }
    });
  },
};
