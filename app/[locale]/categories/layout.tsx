import DashboardLayout from '../dashboard/components/DashboardLayout';
import AuthGuard from '../../lib/auth-guard';

export default function CategoriesLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <DashboardLayout>{children}</DashboardLayout>
    </AuthGuard>
  );
}
