import DashboardLayout from './components/DashboardLayout';
import AuthGuard from '../../lib/auth-guard';

export default function DashboardPageLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <DashboardLayout>{children}</DashboardLayout>
    </AuthGuard>
  );
}
