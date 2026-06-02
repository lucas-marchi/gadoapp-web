import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../../db/db";

export function useReportsController() {
  const bovines = useLiveQuery(() =>
    db.bovines.filter((b) => b.active !== false).toArray(),
  );
  const allBovines = useLiveQuery(() => db.bovines.toArray());
  const herds = useLiveQuery(() =>
    db.herds.filter((h) => h.active !== false).toArray(),
  );
  const birthRecords = useLiveQuery(() =>
    db.birthRecords.filter((r) => r.active !== false).toArray(),
  );
  const weightRecords = useLiveQuery(() =>
    db.weightRecords.filter((r) => r.active !== false).toArray(),
  );
  const healthRecords = useLiveQuery(() =>
    db.healthRecords.filter((r) => r.active !== false).toArray(),
  );

  const now = new Date();
  const activeBovines = bovines || [];
  const totalActive = activeBovines.length;
  const females = activeBovines.filter((b) => b.gender === "FEMEA");
  const totalFemales = females.length;

  // ===== BIRTH RATE =====
  const birthsLast12Months = (birthRecords || []).filter((r) => {
    const date = new Date(r.birthDate);
    const diff = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24 * 365);
    return diff <= 1;
  });
  const birthRate =
    totalFemales > 0
      ? ((birthsLast12Months.length / totalFemales) * 100).toFixed(1)
      : "0";

  // ===== MORTALITY RATE =====
  const deadBovines = (allBovines || []).filter((b) => b.status === "MORTO");
  const totalEver = (allBovines || []).length;
  const mortalityRate =
    totalEver > 0
      ? ((deadBovines.length / totalEver) * 100).toFixed(1)
      : "0";

  // ===== AVERAGE WEIGHT GAIN =====
  const avgWeightGain = (() => {
    const records = weightRecords || [];
    if (records.length < 2) return null;

    const byBovine = new Map<number, { first: number; last: number; days: number }>();
    for (const r of records) {
      const existing = byBovine.get(r.bovineId);
      const date = new Date(r.recordedAt).getTime();
      if (!existing) {
        byBovine.set(r.bovineId, { first: r.weight, last: r.weight, days: 0 });
      } else {
        if (date > new Date(r.recordedAt).getTime()) {
          existing.last = r.weight;
        }
      }
    }

    const gains: number[] = [];
    for (const [bovineId] of byBovine) {
      const bovineRecords = records
        .filter((r) => r.bovineId === bovineId)
        .sort((a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime());
      if (bovineRecords.length >= 2) {
        const first = bovineRecords[0];
        const last = bovineRecords[bovineRecords.length - 1];
        gains.push(last.weight - first.weight);
      }
    }

    if (gains.length === 0) return null;
    const avg = gains.reduce((s, g) => s + g, 0) / gains.length;
    return avg.toFixed(1);
  })();

  // ===== VACCINATION COVERAGE =====
  const vaccineRecords = (healthRecords || []).filter((r) => r.type === "VACCINE");
  const bovinesWithVaccine = new Set(vaccineRecords.map((r) => r.bovineId));
  const vaccinationCoverage =
    totalActive > 0
      ? ((bovinesWithVaccine.size / totalActive) * 100).toFixed(1)
      : "0";

  // ===== OVERDUE VACCINES =====
  const overdueVaccines = vaccineRecords.filter(
    (r) => r.nextDueDate && new Date(r.nextDueDate) < now,
  );

  // ===== BIRTHS BY MONTH (last 12 months) =====
  const birthsByMonth = (() => {
    const months: { month: string; count: number }[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" });
      const count = (birthRecords || []).filter((r) => {
        const bd = new Date(r.birthDate);
        return bd.getMonth() === d.getMonth() && bd.getFullYear() === d.getFullYear();
      }).length;
      months.push({ month: key, count });
    }
    return months;
  })();

  // ===== BY STATUS =====
  const byStatus = [
    { name: "Vivos", value: activeBovines.filter((b) => b.status === "VIVO").length, fill: "rgb(var(--color-secondary-500))" },
    { name: "Vendidos", value: (allBovines || []).filter((b) => b.status === "VENDIDO").length, fill: "#eab308" },
    { name: "Mortos", value: deadBovines.length, fill: "rgb(var(--color-danger-500))" },
  ];

  // ===== HERD DISTRIBUTION =====
  const herdDistribution =
    (herds || [])
      .map((h) => ({
        name: h.name,
        value: activeBovines.filter((b) => b.herdId === h.id).length,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8) || [];

  return {
    totalActive,
    totalFemales,
    birthRate,
    birthsLast12Months: birthsLast12Months.length,
    mortalityRate,
    deadCount: deadBovines.length,
    avgWeightGain,
    vaccinationCoverage,
    overdueVaccinesCount: overdueVaccines.length,
    birthsByMonth,
    byStatus,
    herdDistribution,
  };
}
