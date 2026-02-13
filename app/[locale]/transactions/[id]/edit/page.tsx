'use client';

import * as React from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import TransactionForm from '../../components/TransactionForm';
import {
  updateTransaction,
  type Transaction,
  type UpdateTransactionRequest,
} from '../../../../lib/transactions';
import { useTranslations } from 'next-intl';
import { useSubscription } from '../../../../lib/subscription-context';
import { useRouter } from '@/i18n/navigation';
import { useTransaction } from '../../../../lib/transaction-context';

export default function EditTransactionPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const t = useTranslations('transactions');
  const { hasSubscription } = useSubscription();
  const router = useRouter();
  const { editingTransaction } = useTransaction();

  const month = Number(searchParams.get('month')) || new Date().getMonth() + 1;
  const year = Number(searchParams.get('year')) || new Date().getFullYear();

  const [transaction, setTransaction] = React.useState<Transaction | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!hasSubscription) {
      router.replace('/transactions');
      return;
    }

    if (editingTransaction && editingTransaction.id === id) {
      setTransaction(editingTransaction);
    } else {
      router.replace(`/transactions?month=${month}&year=${year}`);
    }
    setLoading(false);
  }, [id, editingTransaction, hasSubscription, router, month, year]);

  const handleSubmit = async (data: UpdateTransactionRequest) => {
    await updateTransaction(id, data);
  };

  if (loading) {
    return (
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          m: 1,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!transaction) {
    return (
      <Box sx={{ flexGrow: 1, m: 2 }}>
        <Alert severity="error">{t('notFound')}</Alert>
      </Box>
    );
  }

  return (
    <TransactionForm
      transaction={transaction}
      onSubmit={handleSubmit}
      backPath={`/transactions?month=${month}&year=${year}`}
    />
  );
}
