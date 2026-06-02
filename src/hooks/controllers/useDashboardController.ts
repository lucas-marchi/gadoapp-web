import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../../db/db";

export function useDashboardController() {
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
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(now.getDate() - 30);

  const activeBovines = bovines || [];
  const totalBovines = activeBovines.length;
  const totalHerds = herds?.length || 0;
  const totalFemales = activeBovines.filter((b) => b.gender === "FEMEA").length;

  // ===== GROWTH RATE (existing) =====
  const newBovinesCount =
    activeBovines.filter((b) => {
      const date = new Date(b.updatedAt);
      return b.active && date >= thirtyDaysAgo;
    }).length;

  const previousTotal = totalBovines - newBovinesCount;
  const growthRate =
    previousTotal > 0
      ? ((newBovinesCount / previousTotal) * 100).toFixed(1)
      : "0";

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

    const gains: number[] = [];
    const bovineIds = new Set(records.map((r) => r.bovineId));

    for (const bovineId of bovineIds) {
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
    return (gains.reduce((s, g) => s + g, 0) / gains.length).toFixed(1);
  })();

  // ===== VACCINATION COVERAGE =====
  const vaccineRecords = (healthRecords || []).filter((r) => r.type === "VACCINE");
  const bovinesWithVaccine = new Set(vaccineRecords.map((r) => r.bovineId));
  const vaccinationCoverage =
    totalBovines > 0
      ? ((bovinesWithVaccine.size / totalBovines) * 100).toFixed(1)
      : "0";

  // ===== OVERDUE VACCINES =====
  const overdueVaccinesCount = vaccineRecords.filter(
    (r) => r.nextDueDate && new Date(r.nextDueDate) < now,
  ).length;

  // ===== BY GENDER =====
  const byGender = [
    {
      name: "Machos",
      value: activeBovines.filter((b) => b.gender === "MACHO").length,
      fill: "#2563eb",
    },
    {
      name: "Fêmeas",
      value: totalFemales,
      fill: "#db2777",
    },
  ];

  // ===== BY STATUS =====
  const byStatus = [
    {
      name: "Vivos",
      value: activeBovines.filter((b) => b.status === "VIVO").length,
      fill: "rgb(var(--color-secondary-500))",
    },
    {
      name: "Vendidos",
      value: (allBovines || []).filter((b) => b.status === "VENDIDO").length,
      fill: "#eab308",
    },
    {
      name: "Mortos",
      value: deadBovines.length,
      fill: "rgb(var(--color-danger-500))",
    },
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

  return {
    totalBovines,
    totalHerds,
    byGender,
    byStatus,
    herdDistribution,
    growthRate,
    newBovinesCount,
    birthRate,
    birthsLast12Months: birthsLast12Months.length,
    totalFemales,
    mortalityRate,
    deadCount: deadBovines.length,
    avgWeightGain,
    vaccinationCoverage,
    overdueVaccinesCount,
    birthsByMonth,
  };
}
