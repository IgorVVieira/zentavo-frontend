'use client';

import { useTranslations } from 'next-intl';

export function useDataGridLocale() {
  const t = useTranslations('datagrid');

  return {
    toolbarColumns: t('toolbarColumns'),
    toolbarFilters: t('toolbarFilters'),
    toolbarDensity: t('toolbarDensity'),
    toolbarExport: t('toolbarExport'),
    toolbarQuickFilterPlaceholder: t('toolbarQuickFilterPlaceholder'),
    noRowsLabel: t('noRowsLabel'),
    footerRowSelected: (count: number) =>
      count === 1
        ? t('footerRowSelected_one')
        : t('footerRowSelected_other', { count }),
    columnMenuSortAsc: t('columnMenuSortAsc'),
    columnMenuSortDesc: t('columnMenuSortDesc'),
    columnMenuFilter: t('columnMenuFilter'),
    columnMenuHideColumn: t('columnMenuHideColumn'),
    columnMenuManageColumns: t('columnMenuManageColumns'),
    filterPanelAddFilter: t('filterPanelAddFilter'),
    filterPanelRemoveAll: t('filterPanelRemoveAll'),
    filterPanelDeleteIconLabel: t('filterPanelDeleteIconLabel'),
    filterOperatorContains: t('filterOperatorContains'),
    filterOperatorDoesNotContain: t('filterOperatorDoesNotContain'),
    filterOperatorEquals: t('filterOperatorEquals'),
    filterOperatorDoesNotEqual: t('filterOperatorDoesNotEqual'),
    filterOperatorStartsWith: t('filterOperatorStartsWith'),
    filterOperatorEndsWith: t('filterOperatorEndsWith'),
    filterOperatorIsEmpty: t('filterOperatorIsEmpty'),
    filterOperatorIsNotEmpty: t('filterOperatorIsNotEmpty'),
    filterOperatorIs: t('filterOperatorIs'),
    filterOperatorNot: t('filterOperatorNot'),
    filterOperatorAfter: t('filterOperatorAfter'),
    filterOperatorOnOrAfter: t('filterOperatorOnOrAfter'),
    filterOperatorBefore: t('filterOperatorBefore'),
    filterOperatorOnOrBefore: t('filterOperatorOnOrBefore'),
    columnHeaderSortIconLabel: t('columnHeaderSortIconLabel'),
  };
}
