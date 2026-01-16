import { BottomNav } from '../components/BottomNav';
import { Sidebar } from '../components/Sidebar';
import { SyncProvider } from '../contexts/SyncContext';
import { ModalProvider } from '../contexts/ModalContext';
import { HerdFormModal } from '../components/forms/HerdFormModal';
import { BovineFormModal } from '../components/forms/BovineFormModal';
import type { ReactNode } from 'react';

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <SyncProvider>
      <ModalProvider>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
          <Sidebar />
          <div className="md:pl-64 transition-all duration-300">
            <div className="pb-24 md:pb-8">
              {children}
            </div>
          </div>
          <BottomNav />
          
          <HerdFormModal />
          <BovineFormModal />
          
        </div>
      </ModalProvider>
    </SyncProvider>
  );
}