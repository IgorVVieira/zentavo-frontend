import DashboardLayout from '../dashboard/components/DashboardLayout';
import AuthGuard from '../../lib/auth-guard';
import { TransactionProvider } from '../../lib/transaction-context';

export default function TransactionsLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <TransactionProvider>
        <DashboardLayout>{children}</DashboardLayout>
      </TransactionProvider>
    </AuthGuard>
  );
}
