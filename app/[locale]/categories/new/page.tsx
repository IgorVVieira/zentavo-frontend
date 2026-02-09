'use client';

import { useTranslations } from 'next-intl';
import CategoryForm from '../components/CategoryForm';
import { createCategory, type CreateCategoryRequest } from '../../../lib/categories';

export default function NewCategoryPage() {
  const t = useTranslations('categories');
  const tc = useTranslations('common');

  const handleSubmit = async (data: CreateCategoryRequest) => {
    await createCategory(data);
  };

  return (
    <CategoryForm
      title={t('newCategory')}
      submitLabel={tc('actions.create')}
      onSubmit={handleSubmit}
    />
  );
}
