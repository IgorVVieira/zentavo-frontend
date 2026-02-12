'use client';

import * as React from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import TransactionForm from '../../components/TransactionForm';
import {
  getTransactionById,
  updateTransaction,
  type Transaction,
  type UpdateTransactionRequest,
} from '../../../../lib/transactions';
import { useTranslations } from 'next-intl';
import { useSubscription } from '../../../../lib/subscription-context';
import { useRouter } from '@/i18n/navigation';

export default function EditTransactionPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const t = useTranslations('transactions');
  const { hasSubscription } = useSubscription();
  const router = useRouter();

  React.useEffect(() => {
    if (!hasSubscription) {
      router.replace('/transactions');
    }
  }, [hasSubscription, router]);

  const month = Number(searchParams.get('month')) || new Date().getMonth() + 1;
  const year = Number(searchParams.get('year')) || new Date().getFullYear();

  const [transaction, setTransaction] = React.useState<Transaction | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const found = await getTransactionById(id);
        if (!controller.signal.aborted) {
          setTransaction(found);
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          if (err instanceof Error && err.name === 'CanceledError') return;
          setError(t('loadError'));
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }
    load();
    return () => controller.abort();
  }, [id, t]);

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

  if (error || !transaction) {
    return (
      <Box sx={{ flexGrow: 1, m: 2 }}>
        <Alert severity="error">{error || t('notFound')}</Alert>
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
