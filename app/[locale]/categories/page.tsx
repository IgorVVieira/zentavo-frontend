'use client';

import * as React from 'react';
import { useRouter } from '@/i18n/navigation';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Alert from '@mui/material/Alert';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import {
  DataGrid,
  GridActionsCellItem,
  GridColDef,
  gridClasses,
} from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import DeleteConfirmDialog from './components/DeleteConfirmDialog';
import {
  getCategories,
  deleteCategory,
  type Category,
} from '../../lib/categories';
import { useToast } from '../../components/ToastProvider';
import OnboardingTour from '../../components/OnboardingTour';
import { useSubscription } from '../../lib/subscription-context';
import { useTranslations } from 'next-intl';
import { useDataGridLocale } from '@/app/lib/i18n/useDataGridLocale';

export default function CategoriesPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const t = useTranslations('categories');
  const tc = useTranslations('common');
  const localeText = useDataGridLocale();
  const { hasSubscription } = useSubscription();
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [deletingCategory, setDeletingCategory] = React.useState<Category | null>(null);
  const [deleteLoading, setDeleteLoading] = React.useState(false);

  const typeLabels: Record<string, string> = {
    CASH_IN: tc('types.cashIn'),
    CASH_OUT: tc('types.cashOut'),
  };

  const loadCategories = React.useCallback(async (signal?: AbortSignal) => {
    setError(null);
    setLoading(true);
    try {
      const data = await getCategories();
      if (signal?.aborted) return;
      setCategories(data);
    } catch (err: unknown) {
      if (signal?.aborted) return;
      if (err instanceof Error && err.name === 'CanceledError') return;
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { status?: number; data?: { message?: string } } };
        if (axiosError.response?.status === 401) {
          setError(tc('errors.sessionExpired'));
        } else {
          setError(axiosError.response?.data?.message || tc('errors.loadError', { entity: 'categorias' }));
        }
      } else {
        setError(tc('errors.connectionErrorShort'));
      }
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }, [tc]);

  React.useEffect(() => {
    const controller = new AbortController();
    loadCategories(controller.signal);
    return () => controller.abort();
  }, [loadCategories]);

  const handleRefresh = React.useCallback(() => {
    if (!loading) {
      loadCategories();
    }
  }, [loading, loadCategories]);

  const handleCreateClick = React.useCallback(() => {
    router.push('/categories/new');
  }, [router]);

  const handleRowEdit = React.useCallback(
    (category: Category) => () => {
      router.push(`/categories/${category.id}/edit`);
    },
    [router],
  );

  const handleRowDelete = React.useCallback(
    (category: Category) => () => {
      setDeletingCategory(category);
      setDeleteOpen(true);
    },
    [],
  );

  const handleDeleteConfirm = async () => {
    if (!deletingCategory) return;
    setDeleteLoading(true);
    try {
      await deleteCategory(deletingCategory.id);
      setCategories(prev => prev.filter(c => c.id !== deletingCategory.id));
      setDeleteOpen(false);
      setDeletingCategory(null);
      showToast({ message: t('deleteSuccess') });
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { data?: { message?: string } } };
        setError(axiosError.response?.data?.message || tc('errors.deleteError', { entity: 'categoria' }));
      } else {
        setError(tc('errors.connectionRetry'));
      }
    } finally {
      setDeleteLoading(false);
    }
  };

  const columns = React.useMemo<GridColDef[]>(
    () => [
      {
        field: 'color',
        headerName: t('color'),
        width: 80,
        sortable: false,
        filterable: false,
        renderCell: ({ value }) => (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              height: '100%',
            }}
          >
            <Box
              sx={{
                width: 28,
                height: 28,
                borderRadius: 1,
                backgroundColor: value,
                border: '1px solid',
                borderColor: 'divider',
              }}
            />
          </Box>
        ),
      },
      {
        field: 'name',
        headerName: t('name'),
        flex: 1,
        minWidth: 150,
      },
      {
        field: 'type',
        headerName: t('type'),
        width: 140,
        type: 'singleSelect',
        valueOptions: [
          { value: 'CASH_IN', label: tc('types.cashIn') },
          { value: 'CASH_OUT', label: tc('types.cashOut') },
        ],
        valueFormatter: (value: string | null) => {
          if (!value) return '—';
          return typeLabels[value] || value;
        },
      },
      {
        field: 'createdAt',
        headerName: t('createdAt'),
        type: 'date',
        width: 140,
        valueGetter: (value: string) => value && new Date(value),
      },
      ...(hasSubscription
        ? [
            {
              field: 'actions',
              type: 'actions' as const,
              headerName: t('actions'),
              flex: 0.5,
              align: 'right' as const,
              getActions: ({ row }: { row: Category }) => [
                <GridActionsCellItem
                  key="edit"
                  icon={<EditIcon />}
                  label={tc('actions.edit')}
                  onClick={handleRowEdit(row)}
                />,
                <GridActionsCellItem
                  key="delete"
                  icon={<DeleteIcon />}
                  label={tc('actions.delete')}
                  onClick={handleRowDelete(row)}
                />,
              ],
            },
          ]
        : []),
    ],
    [handleRowEdit, handleRowDelete, t, tc, typeLabels, hasSubscription],
  );

  return (
    <Container sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <OnboardingTour page="categories" />
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
            }}
          >
            <Typography variant="h4" data-tour="categories-title">{t('title')}</Typography>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ ml: 'auto' }}>
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
                onClick={handleCreateClick}
                startIcon={<AddIcon />}
                data-tour="categories-create"
                disabled={!hasSubscription}
                sx={!hasSubscription ? { opacity: 0.4, pointerEvents: 'none' } : undefined}
              >
                {tc('actions.create')}
              </Button>
            </Stack>
          </Box>
        </Stack>

        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }} data-tour="categories-grid">
          <Box sx={{ flex: 1, width: '100%' }}>
            {error ? (
              <Alert severity="error">{error}</Alert>
            ) : (
              <DataGrid
                rows={categories}
                columns={columns}
                loading={loading}
                disableRowSelectionOnClick
                showToolbar
                pageSizeOptions={[5, 10, 25]}
                initialState={{
                  pagination: { paginationModel: { pageSize: 10 } },
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

      <DeleteConfirmDialog
        open={deleteOpen}
        onClose={() => {
          setDeleteOpen(false);
          setDeletingCategory(null);
        }}
        onConfirm={handleDeleteConfirm}
        loading={deleteLoading}
        categoryName={deletingCategory?.name ?? ''}
      />
    </Container>
  );
}
