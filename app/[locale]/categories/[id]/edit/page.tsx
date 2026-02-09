'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import CategoryForm from '../../components/CategoryForm';
import {
  getCategories,
  updateCategory,
  type Category,
  type CreateCategoryRequest,
} from '../../../../lib/categories';
import { useTranslations } from 'next-intl';

export default function EditCategoryPage() {
  const params = useParams();
  const id = params.id as string;
  const t = useTranslations('categories');
  const tc = useTranslations('common');

  const [category, setCategory] = React.useState<Category | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    async function load() {
      try {
        const categories = await getCategories();
        const found = categories.find((c) => c.id === id);
        if (found) {
          setCategory(found);
        } else {
          setError(t('notFound'));
        }
      } catch {
        setError(t('loadError'));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, t]);

  const handleSubmit = async (data: CreateCategoryRequest) => {
    await updateCategory(id, data);
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

  if (error || !category) {
    return (
      <Box sx={{ flexGrow: 1, m: 2 }}>
        <Alert severity="error">{error || t('notFound')}</Alert>
      </Box>
    );
  }

  return (
    <CategoryForm
      category={category}
      title={t('editCategory')}
      submitLabel={tc('actions.save')}
      onSubmit={handleSubmit}
    />
  );
}
