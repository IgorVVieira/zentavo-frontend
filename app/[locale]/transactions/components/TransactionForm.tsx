'use client';

import * as React from 'react';
import { useRouter } from '@/i18n/navigation';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import Select, { type SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Grid from '@mui/material/Grid';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import MuiLink from '@mui/material/Link';
import NavigateNextRoundedIcon from '@mui/icons-material/NavigateNextRounded';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Link as NextLink } from '@/i18n/navigation';
import type { Transaction, UpdateTransactionRequest } from '../../../lib/transactions';
import { getCategories, type Category } from '../../../lib/categories';
import { useToast } from '../../../components/ToastProvider';
import { useTranslations } from 'next-intl';

interface TransactionFormProps {
  transaction: Transaction;
  onSubmit: (data: UpdateTransactionRequest) => Promise<void>;
  backPath: string;
}

export default function TransactionForm({
  transaction,
  onSubmit,
  backPath,
}: TransactionFormProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const t = useTranslations('transactions');
  const tc = useTranslations('common');
  const [description, setDescription] = React.useState(transaction.description);
  const [categoryId, setCategoryId] = React.useState(transaction.categoryId ?? '');
  const [categories, setCategories] = React.useState<Category[]>([]);

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [descError, setDescError] = React.useState('');
  const [categoriesError, setCategoriesError] = React.useState('');

  React.useEffect(() => {
    const controller = new AbortController();
    setCategoriesError('');
    getCategories()
      .then((cats) => {
        if (!controller.signal.aborted) {
          setCategories(
            cats.filter((c) => c.type === null || c.type === transaction.type),
          );
        }
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        if (err instanceof Error && err.name === 'CanceledError') return;
        setCategoriesError(tc('errors.loadError', { entity: 'categorias' }));
      });
    return () => controller.abort();
  }, [transaction.type, tc]);

  const validate = (): boolean => {
    let valid = true;
    if (!description.trim()) {
      setDescError(t('descriptionRequired'));
      valid = false;
    } else {
      setDescError('');
    }
    return valid;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setError('');

    try {
      await onSubmit({
        description: description.trim(),
        categoryId: categoryId || null,
      });
      showToast({ message: t('updateSuccess') });
      router.push(backPath);
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { data?: { message?: string } } };
        setError(axiosError.response?.data?.message || tc('errors.saveError', { entity: 'transacao' }));
      } else {
        setError(tc('errors.connectionRetry'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.push(backPath);
  };

  return (
    <Container sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <Stack sx={{ flex: 1, my: 2 }} spacing={2}>
        <Stack>
          <Breadcrumbs
            aria-label="breadcrumb"
            separator={<NavigateNextRoundedIcon fontSize="small" />}
            sx={{ my: 1 }}
          >
            <MuiLink
              component={NextLink}
              href="/transactions"
              underline="hover"
              color="inherit"
            >
              {t('title')}
            </MuiLink>
            <Typography sx={{ color: 'text.primary', fontWeight: 600 }}>
              {t('editTransaction')}
            </Typography>
          </Breadcrumbs>
          <Typography variant="h4">{t('editTransaction')}</Typography>
        </Stack>

        <Box sx={{ display: 'flex', flex: 1 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2, width: '100%' }}>
              {error}
            </Alert>
          )}
          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            autoComplete="off"
            sx={{ width: '100%' }}
          >
            <Grid container spacing={2} sx={{ mb: 2, width: '100%' }}>
              <Grid size={{ xs: 12, sm: 6 }} sx={{ display: 'flex' }}>
                <TextField
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    if (e.target.value.trim()) setDescError('');
                  }}
                  name="description"
                  label={t('description')}
                  error={!!descError}
                  helperText={descError ?? ' '}
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }} sx={{ display: 'flex' }}>
                <FormControl fullWidth error={!!categoriesError}>
                  <InputLabel id="category-label">{t('category')}</InputLabel>
                  <Select
                    labelId="category-label"
                    value={categoryId}
                    onChange={(e: SelectChangeEvent) => setCategoryId(e.target.value)}
                    name="categoryId"
                    label={t('category')}
                  >
                    <MenuItem value="">
                      <em>{t('noneCategory')}</em>
                    </MenuItem>
                    {categories.map((cat) => (
                      <MenuItem key={cat.id} value={cat.id}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Box
                            sx={{
                              width: 14,
                              height: 14,
                              borderRadius: '50%',
                              backgroundColor: cat.color,
                              flexShrink: 0,
                            }}
                          />
                          <span>{cat.name}</span>
                        </Stack>
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>{categoriesError || ' '}</FormHelperText>
                </FormControl>
              </Grid>
            </Grid>
            <Stack direction="row" spacing={2} justifyContent="space-between">
              <Button
                variant="contained"
                startIcon={<ArrowBackIcon />}
                onClick={handleBack}
              >
                {tc('actions.back')}
              </Button>
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
                startIcon={
                  loading ? <CircularProgress size={20} color="inherit" /> : undefined
                }
              >
                {tc('actions.save')}
              </Button>
            </Stack>
          </Box>
        </Box>
      </Stack>
    </Container>
  );
}
