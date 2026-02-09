'use client';

import Chip from '@mui/material/Chip';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import type { Transaction } from '../../../lib/dashboard';

const methodLabels: Record<string, string> = {
  PIX: 'PIX',
  DEBIT: 'Debito',
  TRANSFER: 'Transferencia',
  CARD_PAYMENT: 'Cartao',
  CASH_BACK: 'Cashback',
};

const columns: GridColDef[] = [
  {
    field: 'description',
    headerName: 'Descricao',
    flex: 1.5,
    minWidth: 200,
  },
  {
    field: 'type',
    headerName: 'Tipo',
    flex: 0.5,
    minWidth: 100,
    renderCell: (params) => (
      <Chip
        label={params.value === 'CASH_IN' ? 'Entrada' : 'Saida'}
        color={params.value === 'CASH_IN' ? 'success' : 'error'}
        size="small"
      />
    ),
  },
  {
    field: 'amount',
    headerName: 'Valor',
    headerAlign: 'right',
    align: 'right',
    flex: 1,
    minWidth: 120,
    valueFormatter: (value: number) =>
      value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
  },
  {
    field: 'method',
    headerName: 'Metodo',
    flex: 0.8,
    minWidth: 120,
    valueFormatter: (value: string) => methodLabels[value] || value,
  },
  {
    field: 'categoryName',
    headerName: 'Categoria',
    flex: 1,
    minWidth: 120,
  },
  {
    field: 'date',
    headerName: 'Data',
    type: 'date',
    flex: 0.8,
    minWidth: 110,
    valueGetter: (value: string) => value && new Date(value),
  },
];

interface TransactionsGridProps {
  transactions: Transaction[];
  loading: boolean;
}

export default function TransactionsGrid({
  transactions,
  loading,
}: TransactionsGridProps) {
  const rows = transactions.map((t) => ({
    ...t,
    categoryName: t.category?.name ?? '—',
  }));

  return (
    <DataGrid
      rows={rows}
      columns={columns}
      loading={loading}
      disableRowSelectionOnClick
      density="compact"
      initialState={{
        pagination: { paginationModel: { pageSize: 10 } },
        sorting: { sortModel: [{ field: 'date', sort: 'desc' }] },
      }}
      pageSizeOptions={[10, 20, 50]}
      getRowClassName={(params) =>
        params.indexRelativeToCurrentPage % 2 === 0 ? 'even' : 'odd'
      }
      localeText={{
        noRowsLabel: 'Nenhuma transacao encontrada',
        toolbarColumns: 'Colunas',
        toolbarFilters: 'Filtros',
        toolbarDensity: 'Densidade',
        toolbarExport: 'Exportar',
      }}
    />
  );
}
