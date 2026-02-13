import DashboardLayout from '../dashboard/components/DashboardLayout';
import AuthGuard from '../../lib/auth-guard';
import { CategoryProvider } from '../../lib/category-context';

export default function CategoriesLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <CategoryProvider>
        <DashboardLayout>{children}</DashboardLayout>
      </CategoryProvider>
    </AuthGuard>
  );
}
