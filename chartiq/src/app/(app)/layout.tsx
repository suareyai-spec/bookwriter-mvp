import { SessionGuard } from '@/components/SessionGuard';
import { Sidebar } from '@/components/Sidebar';
import { GlobalChat } from '@/components/GlobalChat';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionGuard>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-surface p-6">
          {children}
        </main>
        <GlobalChat />
      </div>
    </SessionGuard>
  );
}
