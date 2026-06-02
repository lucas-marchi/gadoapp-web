import { useLiveQuery } from "dexie-react-hooks";
import { useMemo } from "react";
import { db } from "../../db/db";
import type { ExportColumn } from "../../lib/exportUtils";

export type ReportType =
  | "inventory"
  | "weight_history"
  | "births"
  | "health"
  | "mortality";

export interface ReportFilters {
  type: ReportType;
  dateFrom: string;
  dateTo: string;
  herdId: string;
}

export function useReportsController(filters: ReportFilters) {
  const bovines = useLiveQuery(() => db.bovines.toArray());
  const herds = useLiveQuery(() =>
    db.herds.filter((h) => h.active !== false).toArray(),
  );
  const weightRecords = useLiveQuery(() => db.weightRecords.toArray());
  const birthRecords = useLiveQuery(() => db.birthRecords.toArray());
  const healthRecords = useLiveQuery(() => db.healthRecords.toArray());

  const activeBovines = bovines?.filter((b) => b.active !== false) || [];

  const dateFrom = filters.dateFrom ? new Date(filters.dateFrom) : null;
  const dateTo = filters.dateTo
    ? new Date(new Date(filters.dateTo).getTime() + 86400000)
    : null;

  const herdFilter = filters.herdId ? Number(filters.herdId) : null;

  const filteredBovines = useMemo(() => {
    let result = activeBovines;
    if (herdFilter) result = result.filter((b) => b.herdId === herdFilter);
    return result;
  }, [activeBovines, herdFilter]);

  const filteredBovineIds = new Set(filteredBovines.map((b) => b.id));

  const { data, columns } = useMemo(() => {
    switch (filters.type) {
      case "inventory":
        return buildInventoryReport(filteredBovines, herds || []);
      case "weight_history":
        return buildWeightReport(
          weightRecords || [],
          bovines || [],
          filteredBovineIds,
          dateFrom,
          dateTo,
        );
      case "births":
        return buildBirthReport(
          birthRecords || [],
          bovines || [],
          filteredBovineIds,
          dateFrom,
          dateTo,
        );
      case "health":
        return buildHealthReport(
          healthRecords || [],
          bovines || [],
          filteredBovineIds,
          dateFrom,
          dateTo,
        );
      case "mortality":
        return buildMortalityReport(bovines || [], herds || [], herdFilter);
      default:
        return { data: [], columns: [] };
    }
  }, [
    filters.type,
    filteredBovines,
    weightRecords,
    birthRecords,
    healthRecords,
    bovines,
    herds,
    dateFrom,
    dateTo,
    herdFilter,
  ]);

  return {
    data,
    columns,
    herds: herds || [],
    totalRows: data.length,
  };
}

// ========== REPORT BUILDERS ==========

function buildInventoryReport(
  bovines: any[],
  herds: any[],
): { data: Record<string, any>[]; columns: ExportColumn[] } {
  const herdMap = new Map(herds.map((h) => [h.id, h.name]));

  const columns: ExportColumn[] = [
    { header: "Nome/Brinco", key: "name" },
    { header: "Rebanho", key: "herd" },
    { header: "Gênero", key: "gender" },
    { header: "Status", key: "status" },
    { header: "Raça", key: "breed" },
    { header: "Peso (kg)", key: "weight" },
    { header: "Nascimento", key: "birth" },
    { header: "Mãe", key: "mom" },
    { header: "Pai", key: "dad" },
  ];

  const data = bovines.map((b) => ({
    name: b.name,
    herd: herdMap.get(b.herdId) || "—",
    gender: b.gender === "MACHO" ? "Macho" : "Fêmea",
    status: formatStatus(b.status),
    breed: b.breed || "—",
    weight: b.weight || "—",
    birth: formatDate(b.birth),
    mom: bovines.find((x) => x.id === b.momId)?.name || "—",
    dad: bovines.find((x) => x.id === b.dadId)?.name || "—",
  }));

  return { data, columns };
}

function buildWeightReport(
  records: any[],
  bovines: any[],
  filteredIds: Set<number | undefined>,
  dateFrom: Date | null,
  dateTo: Date | null,
): { data: Record<string, any>[]; columns: ExportColumn[] } {
  const bovineMap = new Map(bovines.map((b) => [b.id, b.name]));

  const columns: ExportColumn[] = [
    { header: "Bovino", key: "bovine" },
    { header: "Peso (kg)", key: "weight" },
    { header: "Data", key: "date" },
    { header: "Observações", key: "notes" },
  ];

  let filtered = records.filter(
    (r) => r.active !== false && filteredIds.has(r.bovineId),
  );
  if (dateFrom)
    filtered = filtered.filter((r) => new Date(r.recordedAt) >= dateFrom);
  if (dateTo)
    filtered = filtered.filter((r) => new Date(r.recordedAt) <= dateTo);

  filtered.sort(
    (a, b) =>
      new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime(),
  );

  const data = filtered.map((r) => ({
    bovine: bovineMap.get(r.bovineId) || `ID ${r.bovineId}`,
    weight: r.weight,
    date: formatDate(r.recordedAt),
    notes: r.notes || "—",
  }));

  return { data, columns };
}

function buildBirthReport(
  records: any[],
  bovines: any[],
  filteredIds: Set<number | undefined>,
  dateFrom: Date | null,
  dateTo: Date | null,
): { data: Record<string, any>[]; columns: ExportColumn[] } {
  const bovineMap = new Map(bovines.map((b) => [b.id, b.name]));

  const columns: ExportColumn[] = [
    { header: "Mãe", key: "mother" },
    { header: "Cria", key: "calf" },
    { header: "Data de Nascimento", key: "date" },
    { header: "Observações", key: "notes" },
  ];

  let filtered = records.filter(
    (r) => r.active !== false && filteredIds.has(r.motherId),
  );
  if (dateFrom)
    filtered = filtered.filter((r) => new Date(r.birthDate) >= dateFrom);
  if (dateTo)
    filtered = filtered.filter((r) => new Date(r.birthDate) <= dateTo);

  filtered.sort(
    (a, b) =>
      new Date(b.birthDate).getTime() - new Date(a.birthDate).getTime(),
  );

  const data = filtered.map((r) => ({
    mother: bovineMap.get(r.motherId) || `ID ${r.motherId}`,
    calf: r.calfId ? bovineMap.get(r.calfId) || `ID ${r.calfId}` : "—",
    date: formatDate(r.birthDate),
    notes: r.notes || "—",
  }));

  return { data, columns };
}

function buildHealthReport(
  records: any[],
  bovines: any[],
  filteredIds: Set<number | undefined>,
  dateFrom: Date | null,
  dateTo: Date | null,
): { data: Record<string, any>[]; columns: ExportColumn[] } {
  const bovineMap = new Map(bovines.map((b) => [b.id, b.name]));

  const columns: ExportColumn[] = [
    { header: "Bovino", key: "bovine" },
    { header: "Tipo", key: "type" },
    { header: "Produto", key: "product" },
    { header: "Data Aplicação", key: "appliedAt" },
    { header: "Dosagem", key: "dosage" },
    { header: "Veterinário", key: "vet" },
    { header: "Próxima Dose", key: "nextDue" },
    { header: "Observações", key: "notes" },
  ];

  let filtered = records.filter(
    (r) => r.active !== false && filteredIds.has(r.bovineId),
  );
  if (dateFrom)
    filtered = filtered.filter((r) => new Date(r.appliedAt) >= dateFrom);
  if (dateTo)
    filtered = filtered.filter((r) => new Date(r.appliedAt) <= dateTo);

  filtered.sort(
    (a, b) =>
      new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime(),
  );

  const data = filtered.map((r) => ({
    bovine: bovineMap.get(r.bovineId) || `ID ${r.bovineId}`,
    type: r.type === "VACCINE" ? "Vacina" : "Medicamento",
    product: r.productName,
    appliedAt: formatDate(r.appliedAt),
    dosage: r.dosage || "—",
    vet: r.veterinarian || "—",
    nextDue: r.nextDueDate ? formatDate(r.nextDueDate) : "—",
    notes: r.notes || "—",
  }));

  return { data, columns };
}

function buildMortalityReport(
  bovines: any[],
  herds: any[],
  herdFilter: number | null,
): { data: Record<string, any>[]; columns: ExportColumn[] } {
  const herdMap = new Map(herds.map((h) => [h.id, h.name]));

  const columns: ExportColumn[] = [
    { header: "Nome/Brinco", key: "name" },
    { header: "Rebanho", key: "herd" },
    { header: "Gênero", key: "gender" },
    { header: "Raça", key: "breed" },
    { header: "Nascimento", key: "birth" },
    { header: "Descrição", key: "description" },
  ];

  let dead = bovines.filter((b) => b.status === "MORTO");
  if (herdFilter) dead = dead.filter((b) => b.herdId === herdFilter);

  const data = dead.map((b) => ({
    name: b.name,
    herd: herdMap.get(b.herdId) || "—",
    gender: b.gender === "MACHO" ? "Macho" : "Fêmea",
    breed: b.breed || "—",
    birth: formatDate(b.birth),
    description: b.description || "—",
  }));

  return { data, columns };
}

// ========== HELPERS ==========

function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString("pt-BR");
  } catch {
    return dateStr;
  }
}

function formatStatus(status: string): string {
  switch (status) {
    case "VIVO":
      return "Vivo";
    case "MORTO":
      return "Morto";
    case "VENDIDO":
      return "Vendido";
    default:
      return status;
  }
}
