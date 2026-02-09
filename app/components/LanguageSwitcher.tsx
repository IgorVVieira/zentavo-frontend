'use client';

import * as React from 'react';
import Select, { type SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/navigation';

export default function LanguageSwitcher(props: { sx?: object }) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const handleChange = (event: SelectChangeEvent) => {
    const newLocale = event.target.value as 'pt-br' | 'en';
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <Select
      value={locale}
      onChange={handleChange}
      size="small"
      sx={{ minWidth: 80, ...props.sx }}
    >
      <MenuItem value="pt-br">PT</MenuItem>
      <MenuItem value="en">EN</MenuItem>
    </Select>
  );
}
