import { db } from "../db/db";

export interface HealthRecordDTO {
  bovineId: number;
  type: "VACCINE" | "MEDICATION";
  productName: string;
  appliedAt: string;
  dosage?: string;
  veterinarian?: string;
  nextDueDate?: string;
  notes?: string;
}

export const healthRecordService = {
  listByBovine: async (bovineId: number) => {
    return db.healthRecords
      .filter((r) => r.bovineId === bovineId && r.active !== false)
      .toArray();
  },

  listByType: async (bovineId: number, type: "VACCINE" | "MEDICATION") => {
    return db.healthRecords
      .filter(
        (r) =>
          r.bovineId === bovineId && r.type === type && r.active !== false,
      )
      .toArray();
  },

  save: async (dto: HealthRecordDTO, id?: number) => {
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
      return db.healthRecords.update(id, payload);
    }
    return db.healthRecords.add({ ...payload, syncStatus: "created" });
  },

  delete: async (id: number) => {
    return db.healthRecords.update(id, {
      active: false,
      syncStatus: "deleted",
      updatedAt: new Date().toISOString(),
    });
  },
};
