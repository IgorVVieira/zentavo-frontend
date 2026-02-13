'use client';

import * as React from 'react';
import { useRouter } from '@/i18n/navigation';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Alert from '@mui/material/Alert';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import MonthYearPicker from '../../components/MonthYearPicker';
import {
  DataGrid,
  GridActionsCellItem,
  GridColDef,
  gridClasses,
} from '@mui/x-data-grid';
import RefreshIcon from '@mui/icons-material/Refresh';
import EditIcon from '@mui/icons-material/Edit';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import { useSearchParams } from 'next/navigation';
import {
  getTransactionsByMonth,
  type Transaction,
} from '../../lib/transactions';
import OnboardingTour from '../../components/OnboardingTour';
import { useSubscription } from '../../lib/subscription-context';
import { useTranslations, useLocale } from 'next-intl';
import { useDataGridLocale } from '@/app/lib/i18n/useDataGridLocale';
import { useTransaction } from '../../lib/transaction-context';


export default function TransactionsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations('transactions');
  const tc = useTranslations('common');
  const locale = useLocale();
  const localeText = useDataGridLocale();
  const { hasSubscription } = useSubscription();
  const { transactions, setTransactions, setEditingTransaction } = useTransaction();
  const now = new Date();

  const [month, setMonth] = React.useState(
    Number(searchParams.get('month')) || now.getMonth() + 1
  );
  const [year, setYear] = React.useState(
    Number(searchParams.get('year')) || now.getFullYear()
  );
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const methodLabels: Record<string, string> = {
    PIX: tc('methods.PIX'),
    DEBIT: tc('methods.DEBIT'),
    TRANSFER: tc('methods.TRANSFER'),
    CARD_PAYMENT: tc('methods.CARD_PAYMENT'),
    CASH_BACK: tc('methods.CASH_BACK'),
  };

  const loadTransactions = React.useCallback(async (signal?: AbortSignal) => {
    setError(null);
    setLoading(true);
    try {
      const data = await getTransactionsByMonth(month, year);
      if (signal?.aborted) return;
      setTransactions(data);
    } catch (err: unknown) {
      if (signal?.aborted) return;
      if (err instanceof Error && err.name === 'CanceledError') return;
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { status?: number; data?: { message?: string } } };
        if (axiosError.response?.status === 401) {
          setError(tc('errors.sessionExpired'));
        } else {
          setError(axiosError.response?.data?.message || tc('errors.loadError', { entity: 'transacoes' }));
        }
      } else {
        setError(tc('errors.connectionErrorShort'));
      }
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }, [month, year, tc, setTransactions]);

  React.useEffect(() => {
    const controller = new AbortController();
    loadTransactions(controller.signal);
    return () => controller.abort();
  }, [loadTransactions]);

  const handleRefresh = React.useCallback(() => {
    if (!loading) {
      loadTransactions();
    }
  }, [loading, loadTransactions]);

  const handleRowEdit = React.useCallback(
    (transaction: Transaction) => () => {
      setEditingTransaction(transaction);
      router.push(`/transactions/${transaction.id}/edit?month=${month}&year=${year}`);
    },
    [router, month, year, setEditingTransaction],
  );


  const columns = React.useMemo<GridColDef[]>(
    () => [
      {
        field: 'description',
        headerName: t('description'),
        flex: 1.5,
        minWidth: 200,
      },
      {
        field: 'type',
        headerName: t('type'),
        width: 110,
        type: 'singleSelect',
        valueOptions: [
          { value: 'CASH_IN', label: tc('types.cashIn') },
          { value: 'CASH_OUT', label: tc('types.cashOut') },
        ],
        renderCell: (params) => (
          <Chip
            label={params.value === 'CASH_IN' ? tc('types.cashIn') : tc('types.cashOut')}
            color={params.value === 'CASH_IN' ? 'success' : 'error'}
            size="small"
          />
        ),
      },
      {
        field: 'amount',
        headerName: t('amount'),
        headerAlign: 'right',
        align: 'right',
        width: 140,
        type: 'number',
        valueFormatter: (value: number) =>
          value.toLocaleString(locale === 'pt-br' ? 'pt-BR' : 'en-US', { style: 'currency', currency: 'BRL' }),
      },
      {
        field: 'method',
        headerName: t('method'),
        width: 130,
        type: 'singleSelect',
        valueOptions: [
          { value: 'PIX', label: tc('methods.PIX') },
          { value: 'DEBIT', label: tc('methods.DEBIT') },
          { value: 'TRANSFER', label: tc('methods.TRANSFER') },
          { value: 'CARD_PAYMENT', label: tc('methods.CARD_PAYMENT') },
          { value: 'CASH_BACK', label: tc('methods.CASH_BACK') },
        ],
        valueFormatter: (value: string) => methodLabels[value] || value,
      },
      {
        field: 'categoryName',
        headerName: t('category'),
        flex: 1,
        minWidth: 120,
      },
      {
        field: 'date',
        headerName: t('date'),
        type: 'date',
        width: 120,
        valueGetter: (value: string) => value && new Date(value),
      },
      ...(hasSubscription
        ? [
            {
              field: 'actions',
              type: 'actions' as const,
              headerName: t('actions'),
              width: 80,
              align: 'right' as const,
              getActions: ({ row }: { row: Transaction }) => [
                <GridActionsCellItem
                  key="edit"
                  icon={<EditIcon />}
                  label={tc('actions.edit')}
                  onClick={handleRowEdit(row)}
                />,
              ],
            },
          ]
        : []),
    ],
    [handleRowEdit, t, tc, locale, methodLabels, hasSubscription],
  );

  const rows = React.useMemo(
    () =>
      transactions.map((tx) => ({
        ...tx,
        categoryName: tx.category?.name ?? '—',
      })),
    [transactions],
  );

  return (
    <Container sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <OnboardingTour page="transactions" />
      <Stack sx={{ flex: 1, my: 2 }} spacing={2}>
        <Stack>
          <Breadcrumbs aria-label="breadcrumb" sx={{ my: 1 }}>
            <Typography sx={{ color: 'text.primary', fontWeight: 600 }}>
              {t('title')}
            </Typography>
          </Breadcrumbs>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              gap: 2,
              flexWrap: 'wrap',
            }}
          >
            <Typography variant="h4" data-tour="transactions-title">{t('title')}</Typography>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ ml: 'auto' }}>
              <Box data-tour="transactions-filter">
                <MonthYearPicker
                  month={month}
                  year={year}
                  onChange={(m, y) => {
                    setMonth(m);
                    setYear(y);
                  }}
                  disabled={!hasSubscription}
                />
              </Box>
              <Tooltip title={tc('actions.refresh')} placement="right" enterDelay={1000}>
                <div>
                  <IconButton
                    size="small"
                    aria-label={tc('actions.refresh')}
                    onClick={handleRefresh}
                    disabled={!hasSubscription}
                    sx={!hasSubscription ? { opacity: 0.4 } : undefined}
                  >
                    <RefreshIcon />
                  </IconButton>
                </div>
              </Tooltip>
              <Button
                variant="contained"
                startIcon={<FileUploadIcon />}
                onClick={() => router.push('/import')}
                data-tour="transactions-import"
                disabled={!hasSubscription}
                sx={!hasSubscription ? { opacity: 0.4, pointerEvents: 'none' } : undefined}
              >
                {tc('actions.import')}
              </Button>
            </Stack>
          </Box>
        </Stack>

        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }} data-tour="transactions-grid">
          <Box sx={{ flex: 1, width: '100%' }}>
            {error ? (
              <Alert severity="error">{error}</Alert>
            ) : (
              <DataGrid
                rows={rows}
                columns={columns}
                loading={loading}
                disableRowSelectionOnClick
                showToolbar
                pageSizeOptions={[10, 25, 50]}
                initialState={{
                  pagination: { paginationModel: { pageSize: 25 } },
                  sorting: { sortModel: [{ field: 'date', sort: 'desc' }] },
                }}
                sx={{
                  [`& .${gridClasses.columnHeader}, & .${gridClasses.cell}`]: {
                    outline: 'transparent',
                  },
                  [`& .${gridClasses.columnHeader}:focus-within, & .${gridClasses.cell}:focus-within`]:
                    {
                      outline: 'none',
                    },
                  [`& .${gridClasses.row}:hover`]: {
                    cursor: 'pointer',
                  },
                }}
                slotProps={{
                  loadingOverlay: {
                    variant: 'circular-progress',
                    noRowsVariant: 'circular-progress',
                  },
                  baseIconButton: {
                    size: 'small',
                  },
                }}
                localeText={{ ...localeText, noRowsLabel: t('noRows') }}
              />
            )}
          </Box>
        </Box>
      </Stack>
    </Container>
  );
}
