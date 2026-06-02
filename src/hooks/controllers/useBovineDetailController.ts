import { useLiveQuery } from "dexie-react-hooks";
import { db, type Bovine } from "../../db/db";

export type DetailTab = "info" | "weight" | "births" | "health" | "genealogy";

interface GenealogyNode {
  bovine: Bovine | null;
  mom: GenealogyNode | null;
  dad: GenealogyNode | null;
}

export function useBovineDetailController(bovineId: number | undefined) {
  const bovine = useLiveQuery(
    () => (bovineId ? db.bovines.get(bovineId) : undefined),
    [bovineId],
  );

  const herd = useLiveQuery(
    () =>
      bovine?.herdId
        ? db.herds.filter((h) => h.id === bovine.herdId).first()
        : undefined,
    [bovine?.herdId],
  );

  const weightRecords = useLiveQuery(
    () =>
      bovineId
        ? db.weightRecords
            .filter((r) => r.bovineId === bovineId && r.active !== false)
            .toArray()
            .then((records) =>
              records.sort(
                (a, b) =>
                  new Date(a.recordedAt).getTime() -
                  new Date(b.recordedAt).getTime(),
              ),
            )
        : [],
    [bovineId],
  );

  const birthRecords = useLiveQuery(
    () =>
      bovineId
        ? db.birthRecords
            .filter((r) => r.motherId === bovineId && r.active !== false)
            .toArray()
            .then((records) =>
              records.sort(
                (a, b) =>
                  new Date(b.birthDate).getTime() -
                  new Date(a.birthDate).getTime(),
              ),
            )
        : [],
    [bovineId],
  );

  const healthRecords = useLiveQuery(
    () =>
      bovineId
        ? db.healthRecords
            .filter((r) => r.bovineId === bovineId && r.active !== false)
            .toArray()
            .then((records) =>
              records.sort(
                (a, b) =>
                  new Date(b.appliedAt).getTime() -
                  new Date(a.appliedAt).getTime(),
              ),
            )
        : [],
    [bovineId],
  );

  const allBovines = useLiveQuery(
    () => db.bovines.filter((b) => b.active !== false).toArray(),
    [],
  );

  const buildGenealogyTree = (
    id: number | undefined,
    depth: number,
  ): GenealogyNode | null => {
    if (!id || !allBovines || depth <= 0) return null;
    const b = allBovines.find((bov) => bov.id === id);
    if (!b) return null;
    return {
      bovine: b,
      mom: buildGenealogyTree(b.momId, depth - 1),
      dad: buildGenealogyTree(b.dadId, depth - 1),
    };
  };

  const genealogyTree = bovineId
    ? buildGenealogyTree(bovineId, 4)
    : null;

  const getBovineById = (id: number | undefined) => {
    if (!id || !allBovines) return null;
    return allBovines.find((b) => b.id === id) || null;
  };

  return {
    bovine,
    herd,
    weightRecords: weightRecords || [],
    birthRecords: birthRecords || [],
    healthRecords: healthRecords || [],
    genealogyTree,
    allBovines: allBovines || [],
    getBovineById,
  };
}
