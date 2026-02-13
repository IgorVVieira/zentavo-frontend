'use client';

import * as React from 'react';
import { Transaction } from './transactions';

interface TransactionContextType {
  transactions: Transaction[];
  setTransactions: (transactions: Transaction[]) => void;
  editingTransaction: Transaction | null;
  setEditingTransaction: (transaction: Transaction | null) => void;
}

const TransactionContext = React.createContext<TransactionContextType | undefined>(undefined);

export function TransactionProvider({ children }: { children: React.ReactNode }) {
  const [transactions, setTransactions] = React.useState<Transaction[]>([]);
  const [editingTransaction, setEditingTransaction] = React.useState<Transaction | null>(null);

  const value = { transactions, setTransactions, editingTransaction, setEditingTransaction };

  return (
    <TransactionContext.Provider value={value}>
      {children}
    </TransactionContext.Provider>
  );
}

export function useTransaction() {
  const context = React.useContext(TransactionContext);
  if (context === undefined) {
    throw new Error('useTransaction must be used within a TransactionProvider');
  }
  return context;
}
