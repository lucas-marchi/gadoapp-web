import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { api } from "../lib/axios";
import { db } from "../db/db";

export interface Farm {
  id: number;
  name: string;
  inscricaoEstadual?: string;
  city?: string;
  state?: string;
  address?: string;
  totalAreaHa?: number;
  role: string;
  herdCount: number;
  bovineCount: number;
  memberCount: number;
}

interface FarmContextType {
  farms: Farm[];
  activeFarm: Farm | null;
  switchFarm: (farmId: number) => void;
  refreshFarms: () => Promise<void>;
  setFarmsFromLogin: (farms: Farm[]) => void;
}

const FarmContext = createContext<FarmContextType>({} as FarmContextType);

export function FarmProvider({ children }: { children: ReactNode }) {
  const [farms, setFarms] = useState<Farm[]>(() => {
    const cached = localStorage.getItem("gadoapp_farms");
    return cached ? JSON.parse(cached) : [];
  });

  const [activeFarm, setActiveFarm] = useState<Farm | null>(() => {
    const activeFarmId = localStorage.getItem("gadoapp_active_farm_id");
    if (activeFarmId && farms.length > 0) {
      return farms.find((f) => f.id === Number(activeFarmId)) || farms[0] || null;
    }
    return farms[0] || null;
  });

  const switchFarm = useCallback(
    async (farmId: number) => {
      const farm = farms.find((f) => f.id === farmId);
      if (!farm) return;

      setActiveFarm(farm);
      localStorage.setItem("gadoapp_active_farm_id", String(farmId));

      // Clear local data and force full re-sync
      await db.herds.clear();
      await db.bovines.clear();
      await db.weightRecords.clear();
      await db.birthRecords.clear();
      await db.healthRecords.clear();
      localStorage.removeItem("last_sync_herds");
      localStorage.removeItem("last_sync_bovines");
      localStorage.removeItem("last_sync_weight_records");
      localStorage.removeItem("last_sync_birth_records");
      localStorage.removeItem("last_sync_health_records");
    },
    [farms],
  );

  const refreshFarms = useCallback(async () => {
    try {
      const res = await api.get("/farms");
      const data: Farm[] = res.data;
      setFarms(data);
      localStorage.setItem("gadoapp_farms", JSON.stringify(data));

      // Update active farm if it still exists
      if (activeFarm) {
        const updated = data.find((f) => f.id === activeFarm.id);
        if (updated) setActiveFarm(updated);
        else if (data.length > 0) {
          setActiveFarm(data[0]);
          localStorage.setItem("gadoapp_active_farm_id", String(data[0].id));
        }
      } else if (data.length > 0) {
        setActiveFarm(data[0]);
        localStorage.setItem("gadoapp_active_farm_id", String(data[0].id));
      }
    } catch {
      // Offline — keep cached data
    }
  }, [activeFarm]);

  const setFarmsFromLogin = useCallback((loginFarms: Farm[]) => {
    setFarms(loginFarms);
    localStorage.setItem("gadoapp_farms", JSON.stringify(loginFarms));

    const savedId = localStorage.getItem("gadoapp_active_farm_id");
    const match = savedId ? loginFarms.find((f) => f.id === Number(savedId)) : null;
    const active = match || loginFarms[0] || null;
    setActiveFarm(active);
    if (active) localStorage.setItem("gadoapp_active_farm_id", String(active.id));
  }, []);

  return (
    <FarmContext.Provider
      value={{ farms, activeFarm, switchFarm, refreshFarms, setFarmsFromLogin }}
    >
      {children}
    </FarmContext.Provider>
  );
}

export const useFarm = () => useContext(FarmContext);
