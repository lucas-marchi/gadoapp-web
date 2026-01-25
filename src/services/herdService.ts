import { db } from "../db/db";

export interface HerdDTO {
  name: string;
}

export const herdService = {
  list: async () => {
    return db.herds.filter((h) => h.active !== false).toArray();
  },

  save: async (dto: HerdDTO, id?: number) => {
    const newSyncStatus: "updated" | "created" = id ? "updated" : "created";

    const payload = {
      ...dto,
      active: true,
      syncStatus: newSyncStatus,
      updatedAt: new Date().toISOString(),
    };

    if (id) {
      return db.herds.update(id, payload);
    }
    return db.herds.add({ ...payload, syncStatus: "created" });
  },

  delete: async (id: number) => {
    return db.herds.update(id, {
      active: false,
      syncStatus: "deleted",
      updatedAt: new Date().toISOString(),
    });
  },
};