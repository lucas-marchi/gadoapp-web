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

export class GadoAppDB extends Dexie {
  herds!: Table<Herd>;
  bovines!: Table<Bovine>;

  constructor() {
    super('GadoappDB');
    
    this.version(1).stores({
      herds: '++id, serverId, syncStatus, active, name', 
      bovines: '++id, serverId, herdId, syncStatus, active, name'
    });
  }
}

export const db = new GadoAppDB();