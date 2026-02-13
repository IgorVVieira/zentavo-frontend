'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import CategoryForm from '../../components/CategoryForm';
import {
  updateCategory,
  type Category,
  type CreateCategoryRequest,
} from '../../../../lib/categories';
import { useTranslations } from 'next-intl';
import { useSubscription } from '../../../../lib/subscription-context';
import { useRouter } from '@/i18n/navigation';
import { useCategory } from '../../../../lib/category-context';

export default function EditCategoryPage() {
  const params = useParams();
  const id = params.id as string;
  const t = useTranslations('categories');
  const tc = useTranslations('common');
  const { hasSubscription } = useSubscription();
  const router = useRouter();
  const { editingCategory } = useCategory();

  const [category, setCategory] = React.useState<Category | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!hasSubscription) {
      router.replace('/categories');
      return;
    }

    if (editingCategory && editingCategory.id === id) {
      setCategory(editingCategory);
    } else {
      // If there's no editing category in context, we can't edit.
      // This can happen if the user navigates directly to the edit URL.
      // Redirect to the list page as a safe fallback.
      router.replace('/categories');
    }
    setLoading(false);
  }, [id, editingCategory, hasSubscription, router]);

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

  if (!category) {
    // This will be briefly visible before the redirect happens.
    // Or if the redirect for some reason fails.
    return (
      <Box sx={{ flexGrow: 1, m: 2 }}>
        <Alert severity="error">{t('notFound')}</Alert>
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
