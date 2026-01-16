import { createContext, useContext, useState, type ReactNode } from 'react';

interface ModalContextType {
  // Rebanho
  isHerdModalOpen: boolean;
  openHerdModal: (editingId?: number, initialData?: any) => void;
  closeHerdModal: () => void;
  herdEditingId: number | null;
  herdInitialData: any;

  // Bovino
  isBovineModalOpen: boolean;
  openBovineModal: (editingId?: number, initialData?: any) => void;
  closeBovineModal: () => void;
  bovineEditingId: number | null;
  bovineInitialData: any;
}

const ModalContext = createContext<ModalContextType>({} as ModalContextType);

export function ModalProvider({ children }: { children: ReactNode }) {
  // Herd State
  const [isHerdModalOpen, setIsHerdModalOpen] = useState(false);
  const [herdEditingId, setHerdEditingId] = useState<number | null>(null);
  const [herdInitialData, setHerdInitialData] = useState<any>(null);

  // Bovine State
  const [isBovineModalOpen, setIsBovineModalOpen] = useState(false);
  const [bovineEditingId, setBovineEditingId] = useState<number | null>(null);
  const [bovineInitialData, setBovineInitialData] = useState<any>(null);

  const openHerdModal = (id?: number, data?: any) => {
    setHerdEditingId(id || null);
    setHerdInitialData(data || null);
    setIsHerdModalOpen(true);
  };

  const closeHerdModal = () => {
    setIsHerdModalOpen(false);
    setHerdEditingId(null);
    setHerdInitialData(null);
  };

  const openBovineModal = (id?: number, data?: any) => {
    setBovineEditingId(id || null);
    setBovineInitialData(data || null);
    setIsBovineModalOpen(true);
  };

  const closeBovineModal = () => {
    setIsBovineModalOpen(false);
    setBovineEditingId(null);
    setBovineInitialData(null);
  };

  return (
    <ModalContext.Provider value={{
      isHerdModalOpen, openHerdModal, closeHerdModal, herdEditingId, herdInitialData,
      isBovineModalOpen, openBovineModal, closeBovineModal, bovineEditingId, bovineInitialData
    }}>
      {children}
    </ModalContext.Provider>
  );
}

export const useModals = () => useContext(ModalContext);