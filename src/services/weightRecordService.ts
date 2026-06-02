import { db } from "../db/db";

export interface WeightRecordDTO {
  bovineId: number;
  weight: number;
  recordedAt: string;
  notes?: string;
}

export const weightRecordService = {
  listByBovine: async (bovineId: number) => {
    return db.weightRecords
      .filter((r) => r.bovineId === bovineId && r.active !== false)
      .toArray();
  },

  save: async (dto: WeightRecordDTO, id?: number) => {
    const newSyncStatus: "updated" | "created" = id ? "updated" : "created";

    const bovine = await db.bovines.get(dto.bovineId);
    const serverBovineId = bovine?.serverId || undefined;

    const payload = {
      ...dto,
      serverBovineId,
      active: true,
      syncStatus: newSyncStatus,
      updatedAt: new Date().toISOString(),
    };

    if (id) {
      return db.weightRecords.update(id, payload);
    }
    return db.weightRecords.add({ ...payload, syncStatus: "created" });
  },

  delete: async (id: number) => {
    return db.weightRecords.update(id, {
      active: false,
      syncStatus: "deleted",
      updatedAt: new Date().toISOString(),
    });
  },
};
