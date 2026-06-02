import Dexie, { type Table } from 'dexie';

export interface Herd {
    id?: number;
    serverId?: number;
    name: string;
    active: boolean;
    updatedAt: string;
    syncStatus: 'synced' | 'created' | 'updated' | 'deleted';
}

export interface Bovine {
  id?: number;
  serverId?: number;
  name: string;
  status: string;
  gender: string;
  breed?: string;
  weight?: number;
  birth: string;
  description?: string;
  herdId?: number;
  serverHerdId?: number;
  momId?: number;
  dadId?: number;
  active: boolean;
  updatedAt: string;
  syncStatus: 'synced' | 'created' | 'updated' | 'deleted';
}

export interface WeightRecord {
  id?: number;
  serverId?: number;
  bovineId: number;
  serverBovineId?: number;
  weight: number;
  recordedAt: string;
  notes?: string;
  active: boolean;
  updatedAt: string;
  syncStatus: 'synced' | 'created' | 'updated' | 'deleted';
}

export interface BirthRecord {
  id?: number;
  serverId?: number;
  motherId: number;
  serverMotherId?: number;
  calfId?: number;
  serverCalfId?: number;
  birthDate: string;
  notes?: string;
  active: boolean;
  updatedAt: string;
  syncStatus: 'synced' | 'created' | 'updated' | 'deleted';
}

export interface HealthRecord {
  id?: number;
  serverId?: number;
  bovineId: number;
  serverBovineId?: number;
  type: 'VACCINE' | 'MEDICATION';
  productName: string;
  appliedAt: string;
  dosage?: string;
  veterinarian?: string;
  nextDueDate?: string;
  notes?: string;
  active: boolean;
  updatedAt: string;
  syncStatus: 'synced' | 'created' | 'updated' | 'deleted';
}

export class GadoAppDB extends Dexie {
  herds!: Table<Herd>;
  bovines!: Table<Bovine>;
  weightRecords!: Table<WeightRecord>;
  birthRecords!: Table<BirthRecord>;
  healthRecords!: Table<HealthRecord>;

  constructor() {
    super('GadoappDB');
    
    this.version(1).stores({
      herds: '++id, serverId, syncStatus, active, name', 
      bovines: '++id, serverId, herdId, syncStatus, active, name'
    });

    this.version(2).stores({
      herds: '++id, serverId, syncStatus, active, name', 
      bovines: '++id, serverId, herdId, syncStatus, active, name',
      weightRecords: '++id, serverId, bovineId, syncStatus, active',
      birthRecords: '++id, serverId, motherId, syncStatus, active',
    });

    this.version(3).stores({
      herds: '++id, serverId, syncStatus, active, name', 
      bovines: '++id, serverId, herdId, syncStatus, active, name',
      weightRecords: '++id, serverId, bovineId, syncStatus, active',
      birthRecords: '++id, serverId, motherId, syncStatus, active',
      healthRecords: '++id, serverId, bovineId, syncStatus, active, type',
    });
  }
}

export const db = new GadoAppDB();