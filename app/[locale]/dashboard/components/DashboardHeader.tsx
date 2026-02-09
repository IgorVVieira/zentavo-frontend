'use client';

import * as React from 'react';
import { styled } from '@mui/material/styles';
import MuiAppBar from '@mui/material/AppBar';
import IconButton from '@mui/material/IconButton';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import MenuIcon from '@mui/icons-material/Menu';
import CoinLogo from '../../../components/CoinLogo';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import Stack from '@mui/material/Stack';
import { Link as NextLink } from '@/i18n/navigation';
import ThemeSwitcher from './ThemeSwitcher';
import { useTranslations } from 'next-intl';
import LanguageSwitcher from '../../../components/LanguageSwitcher';

const AppBar = styled(MuiAppBar)(({ theme }) => ({
  borderWidth: 0,
  borderBottomWidth: 1,
  borderStyle: 'solid',
  borderColor: (theme.vars ?? theme).palette.divider,
  boxShadow: 'none',
  zIndex: theme.zIndex.drawer + 1,
}));

export interface DashboardHeaderProps {
  menuOpen: boolean;
  onToggleMenu: (open: boolean) => void;
}

export default function DashboardHeader({
  menuOpen,
  onToggleMenu,
}: DashboardHeaderProps) {
  const t = useTranslations('common');

  const handleMenuOpen = React.useCallback(() => {
    onToggleMenu(!menuOpen);
  }, [menuOpen, onToggleMenu]);

  const getMenuIcon = React.useCallback(
    (isExpanded: boolean) => {
      return (
        <Tooltip
          title={isExpanded ? t('nav.collapseMenu') : t('nav.expandMenu')}
          enterDelay={1000}
        >
          <div>
            <IconButton
              size="small"
              aria-label={isExpanded ? t('nav.collapseMenuAria') : t('nav.expandMenuAria')}
              onClick={handleMenuOpen}
            >
              {isExpanded ? <MenuOpenIcon /> : <MenuIcon />}
            </IconButton>
          </div>
        </Tooltip>
      );
    },
    [handleMenuOpen],
  );

  return (
    <AppBar color="inherit" position="absolute" sx={{ displayPrint: 'none' }}>
      <Toolbar sx={{ backgroundColor: 'inherit', mx: { xs: -0.75, sm: -1 } }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ flexWrap: 'wrap', width: '100%' }}
        >
          <Stack direction="row" alignItems="center">
            <Stack sx={{ mr: 1 }}>{getMenuIcon(menuOpen)}</Stack>
            <NextLink href="/dashboard" style={{ textDecoration: 'none' }}>
              <Typography
                variant="h6"
                sx={(theme) => ({
                  color: (theme.vars ?? theme).palette.primary.main,
                  fontWeight: '700',
                  ml: 1,
                  whiteSpace: 'nowrap',
                  lineHeight: 1,
                })}
              >
                <CoinLogo size={22} />{' '}ZenCash
              </Typography>
            </NextLink>
          </Stack>
          <Stack
            direction="row"
            alignItems="center"
            spacing={1}
            sx={{ marginLeft: 'auto' }}
          >
            <LanguageSwitcher />
            <ThemeSwitcher />
          </Stack>
        </Stack>
      </Toolbar>
    </AppBar>
  );
}
