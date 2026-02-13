'use client';

import * as React from 'react';
import { Category } from './categories';

interface CategoryContextType {
  categories: Category[];
  setCategories: (categories: Category[]) => void;
  editingCategory: Category | null;
  setEditingCategory: (category: Category | null) => void;
}

const CategoryContext = React.createContext<CategoryContextType | undefined>(undefined);

export function CategoryProvider({ children }: { children: React.ReactNode }) {
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [editingCategory, setEditingCategory] = React.useState<Category | null>(null);

  const value = { categories, setCategories, editingCategory, setEditingCategory };

  return (
    <CategoryContext.Provider value={value}>
      {children}
    </CategoryContext.Provider>
  );
}

export function useCategory() {
  const context = React.useContext(CategoryContext);
  if (context === undefined) {
    throw new Error('useCategory must be used within a CategoryProvider');
  }
  return context;
}
