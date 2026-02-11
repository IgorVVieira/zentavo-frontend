'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import CategoryForm from '../components/CategoryForm';
import { createCategory, type CreateCategoryRequest } from '../../../lib/categories';
import { useSubscription } from '../../../lib/subscription-context';

export default function NewCategoryPage() {
  const t = useTranslations('categories');
  const tc = useTranslations('common');
  const { hasSubscription } = useSubscription();
  const router = useRouter();

  React.useEffect(() => {
    if (!hasSubscription) {
      router.replace('/categories');
    }
  }, [hasSubscription, router]);

  const handleSubmit = async (data: CreateCategoryRequest) => {
    await createCategory(data);
  };

  if (!hasSubscription) return null;

  return (
    <CategoryForm
      title={t('newCategory')}
      submitLabel={tc('actions.create')}
      onSubmit={handleSubmit}
    />
  );
}
