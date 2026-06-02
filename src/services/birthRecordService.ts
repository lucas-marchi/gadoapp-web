import { db } from "../db/db";

export interface BirthRecordDTO {
  motherId: number;
  calfId?: number;
  birthDate: string;
  notes?: string;
}

export const birthRecordService = {
  listByMother: async (motherId: number) => {
    return db.birthRecords
      .filter((r) => r.motherId === motherId && r.active !== false)
      .toArray();
  },

  save: async (dto: BirthRecordDTO, id?: number) => {
    const newSyncStatus: "updated" | "created" = id ? "updated" : "created";

    const mother = await db.bovines.get(dto.motherId);
    const serverMotherId = mother?.serverId || undefined;

    let serverCalfId: number | undefined;
    if (dto.calfId) {
      const calf = await db.bovines.get(dto.calfId);
      serverCalfId = calf?.serverId || undefined;
    }

    const payload = {
      ...dto,
      serverMotherId,
      serverCalfId,
      active: true,
      syncStatus: newSyncStatus,
      updatedAt: new Date().toISOString(),
    };

    if (id) {
      return db.birthRecords.update(id, payload);
    }
    return db.birthRecords.add({ ...payload, syncStatus: "created" });
  },

  delete: async (id: number) => {
    return db.birthRecords.update(id, {
      active: false,
      syncStatus: "deleted",
      updatedAt: new Date().toISOString(),
    });
  },
};
