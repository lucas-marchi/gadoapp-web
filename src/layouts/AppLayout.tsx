import { BottomNav } from '../components/layout/BottomNav';
import { SyncProvider } from '../contexts/SyncContext';
import { ModalProvider } from '../contexts/ModalContext';
import { HerdFormModal } from '../components/features/herds/HerdFormModal';
import { BovineFormModal } from '../components/features/bovines/BovineFormModal';
import type { ReactNode } from 'react';
import { Sidebar } from '../components/layout/Sidebar';
import { BovineDetailsModal } from '../components/features/bovines/BovineDetailsModal';
import { UpgradeModal } from '../components/UpgradeModal';
import { useModals } from '../contexts/ModalContext';

function AppLayoutInner({ children }: { children: ReactNode }) {
  const { isUpgradeModalOpen, closeUpgradeModal, upgradeMessage } = useModals();

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 transition-colors duration-300">
      <Sidebar />
      <div className="md:pl-64 transition-all duration-300">
        <div className="pb-24 md:pb-8">
          {children}
        </div>
      </div>
      <BottomNav />
      
      <HerdFormModal />
      <BovineFormModal />
      <BovineDetailsModal />
      
      <UpgradeModal 
        isOpen={isUpgradeModalOpen} 
        onClose={closeUpgradeModal} 
        message={upgradeMessage} 
      />
    </div>
  );
}

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <SyncProvider>
      <ModalProvider>
        <AppLayoutInner>{children}</AppLayoutInner>
      </ModalProvider>
    </SyncProvider>
  );
}