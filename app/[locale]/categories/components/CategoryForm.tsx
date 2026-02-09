'use client';

import * as React from 'react';
import { useRouter } from '@/i18n/navigation';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import Select, { SelectChangeEvent } from '@mui/material/Select';
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
import type { Category, CreateCategoryRequest } from '../../../lib/categories';
import ColorPicker from './ColorPicker';
import { useToast } from '../../../components/ToastProvider';
import { useTranslations } from 'next-intl';

interface CategoryFormProps {
  category?: Category | null;
  onSubmit: (data: CreateCategoryRequest) => Promise<void>;
  title: string;
  submitLabel: string;
}

export default function CategoryForm({
  category,
  onSubmit,
  title,
  submitLabel,
}: CategoryFormProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const t = useTranslations('categories');
  const tc = useTranslations('common');
  const [name, setName] = React.useState(category?.name ?? '');
  const [color, setColor] = React.useState(category?.color ?? '#FF5733');
  const [type, setType] = React.useState<'CASH_IN' | 'CASH_OUT' | ''>(category?.type ?? '');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [nameError, setNameError] = React.useState('');
  const [colorError, setColorError] = React.useState('');

  const validate = (): boolean => {
    let isValid = true;
    if (!name.trim()) {
      setNameError(tc('validation.categoryNameRequired'));
      isValid = false;
    } else {
      setNameError('');
    }
    if (!color.trim()) {
      setColorError(tc('validation.categoryColorRequired'));
      isValid = false;
    } else {
      setColorError('');
    }
    return isValid;
  };

  const handleFieldChange = (field: 'name' | 'color', value: string) => {
    if (field === 'name') {
      setName(value);
      if (value.trim()) setNameError('');
    } else {
      setColor(value);
      if (value.trim()) setColorError('');
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setError('');

    try {
      await onSubmit({
        name: name.trim(),
        color: color.trim(),
        type: type || null,
      });
      showToast({ message: category ? t('updateSuccess') : t('createSuccess') });
      router.push('/categories');
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { data?: { message?: string } } };
        setError(axiosError.response?.data?.message || tc('errors.saveError', { entity: 'categoria' }));
      } else {
        setError(tc('errors.connectionRetry'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setName(category?.name ?? '');
    setColor(category?.color ?? '#FF5733');
    setType(category?.type ?? '');
    setNameError('');
    setColorError('');
    setError('');
  };

  const handleBack = () => {
    router.push('/categories');
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
              href="/categories"
              underline="hover"
              color="inherit"
            >
              {t('title')}
            </MuiLink>
            <Typography sx={{ color: 'text.primary', fontWeight: 600 }}>
              {title}
            </Typography>
          </Breadcrumbs>
          <Typography variant="h4">{title}</Typography>
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
            onReset={handleReset}
            noValidate
            autoComplete="off"
            sx={{ width: '100%' }}
          >
            <Grid container spacing={2} sx={{ mb: 2, width: '100%' }}>
              <Grid size={{ xs: 12, sm: 6 }} sx={{ display: 'flex' }}>
                <TextField
                  value={name}
                  onChange={(e) => handleFieldChange('name', e.target.value)}
                  name="name"
                  label={t('name')}
                  error={!!nameError}
                  helperText={nameError ?? ' '}
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 12 }} sx={{ display: 'flex' }}>
                <ColorPicker
                  value={color}
                  onChange={(c) => handleFieldChange('color', c)}
                  error={!!colorError}
                  helperText={colorError}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }} sx={{ display: 'flex' }}>
                <FormControl fullWidth>
                  <InputLabel id="category-type-label">{t('type')}</InputLabel>
                  <Select
                    labelId="category-type-label"
                    value={type}
                    onChange={(e: SelectChangeEvent) =>
                      setType(e.target.value as 'CASH_IN' | 'CASH_OUT' | '')
                    }
                    name="type"
                    label={t('type')}
                  >
                    <MenuItem value="">
                      <em>{t('noneType')}</em>
                    </MenuItem>
                    <MenuItem value="CASH_IN">{tc('types.cashIn')}</MenuItem>
                    <MenuItem value="CASH_OUT">{tc('types.cashOut')}</MenuItem>
                  </Select>
                  <FormHelperText>{' '}</FormHelperText>
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
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : undefined}
              >
                {submitLabel}
              </Button>
            </Stack>
          </Box>
        </Box>
      </Stack>
    </Container>
  );
}
