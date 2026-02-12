'use client';

import * as React from 'react';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import Toolbar from '@mui/material/Toolbar';
import CategoryIcon from '@mui/icons-material/Category';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import { usePathname } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { useSubscription } from '../../../lib/subscription-context';
import { createPaymentLink } from '../../../lib/payments';
import DashboardSidebarContext from '../context/DashboardSidebarContext';
import { DRAWER_WIDTH, MINI_DRAWER_WIDTH } from '../constants';
import DashboardSidebarPageItem from './DashboardSidebarPageItem';
import DashboardSidebarHeaderItem from './DashboardSidebarHeaderItem';
import DashboardSidebarDividerItem from './DashboardSidebarDividerItem';
import SidebarProfile from './SidebarProfile';
import {
  getDrawerSxTransitionMixin,
  getDrawerWidthTransitionMixin,
} from '../mixins';

export interface DashboardSidebarProps {
  expanded?: boolean;
  setExpanded: (expanded: boolean) => void;
  container?: Element;
}

export default function DashboardSidebar({
  expanded = true,
  setExpanded,
  container,
}: DashboardSidebarProps) {
  const theme = useTheme();
  const pathname = usePathname();
  const t = useTranslations('common');
  const { hasSubscription } = useSubscription();
  const [renewLoading, setRenewLoading] = React.useState(false);

  const handleRenewSubscription = React.useCallback(async () => {
    setRenewLoading(true);
    try {
      const paymentLink = await createPaymentLink();
      window.location.href = paymentLink.url;
    } catch {
      setRenewLoading(false);
    }
  }, []);

  const isOverSmViewport = useMediaQuery(theme.breakpoints.up('sm'));
  const isOverMdViewport = useMediaQuery(theme.breakpoints.up('md'));

  const [isFullyExpanded, setIsFullyExpanded] = React.useState(expanded);
  const [isFullyCollapsed, setIsFullyCollapsed] = React.useState(!expanded);

  React.useEffect(() => {
    if (expanded) {
      const timeout = setTimeout(() => {
        setIsFullyExpanded(true);
      }, theme.transitions.duration.enteringScreen);
      return () => clearTimeout(timeout);
    }
    setIsFullyExpanded(false);
    return () => {};
  }, [expanded, theme.transitions.duration.enteringScreen]);

  React.useEffect(() => {
    if (!expanded) {
      const timeout = setTimeout(() => {
        setIsFullyCollapsed(true);
      }, theme.transitions.duration.leavingScreen);
      return () => clearTimeout(timeout);
    }
    setIsFullyCollapsed(false);
    return () => {};
  }, [expanded, theme.transitions.duration.leavingScreen]);

  const mini = !expanded;

  const hasDrawerTransitions = isOverSmViewport || isOverMdViewport;

  const handleSetSidebarExpanded = React.useCallback(
    (newExpanded: boolean) => () => {
      setExpanded(newExpanded);
    },
    [setExpanded],
  );

  const handlePageItemClick = React.useCallback(
    (_itemId: string, hasNestedNavigation: boolean) => {
      if (!isOverSmViewport && !hasNestedNavigation) {
        setExpanded(false);
      }
    },
    [setExpanded, isOverSmViewport],
  );

  const getDrawerContent = React.useCallback(
    (viewport: 'phone' | 'tablet' | 'desktop') => (
      <React.Fragment>
        <Toolbar />
        <Box
          component="nav"
          aria-label={`${viewport.charAt(0).toUpperCase()}${viewport.slice(1)}`}
          sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            overflow: 'auto',
            scrollbarGutter: mini ? 'stable' : 'auto',
            overflowX: 'hidden',
            pt: !mini ? 0 : 2,
            ...(hasDrawerTransitions
              ? getDrawerSxTransitionMixin(isFullyExpanded, 'padding')
              : {}),
          }}
        >
          <List
            dense
            sx={{
              padding: mini ? 0 : 0.5,
              mb: 4,
              width: mini ? MINI_DRAWER_WIDTH : 'auto',
            }}
          >
            <DashboardSidebarHeaderItem>{t('nav.menu')}</DashboardSidebarHeaderItem>
            <DashboardSidebarPageItem
              id="dashboard"
              title={t('nav.dashboard')}
              icon={<DashboardIcon />}
              href="/dashboard"
              selected={pathname === '/dashboard'}
              tourId="dashboard"
            />
            <DashboardSidebarDividerItem />
            <DashboardSidebarHeaderItem>{t('nav.management')}</DashboardSidebarHeaderItem>
            <DashboardSidebarPageItem
              id="categories"
              title={t('nav.categories')}
              icon={<CategoryIcon />}
              href="/categories"
              selected={pathname.startsWith('/categories')}
              tourId="categories"
            />
            <DashboardSidebarPageItem
              id="transactions"
              title={t('nav.transactions')}
              icon={<ReceiptLongIcon />}
              href="/transactions"
              selected={pathname.startsWith('/transactions')}
              tourId="transactions"
            />
            <DashboardSidebarPageItem
              id="import"
              title={t('nav.importOFX')}
              icon={<FileUploadIcon />}
              href="/import"
              selected={pathname.startsWith('/import')}
              tourId="import"
            />
          </List>
          <Box sx={{ flexGrow: 1 }} />
          {!hasSubscription && !mini && (
            <Stack
              sx={{
                mx: 1,
                mb: 1,
                p: 1.5,
                borderRadius: 1,
                bgcolor: 'warning.50',
                border: '1px solid',
                borderColor: 'warning.main',
              }}
              spacing={1}
            >
              <Stack direction="row" spacing={1} alignItems="center">
                <WarningAmberIcon sx={{ color: 'warning.main', fontSize: 20 }} />
                <Typography variant="caption" sx={{ fontWeight: 600, color: 'warning.dark' }}>
                  {t('subscription.expired')}
                </Typography>
              </Stack>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {t('subscription.expiredDescription')}
              </Typography>
              <Button
                variant="contained"
                color="warning"
                size="small"
                fullWidth
                onClick={handleRenewSubscription}
                disabled={renewLoading}
                startIcon={renewLoading ? <CircularProgress size={14} color="inherit" /> : undefined}
              >
                {renewLoading ? t('subscription.redirecting') : t('subscription.renew')}
              </Button>
            </Stack>
          )}
          {!hasSubscription && mini && (
            <Stack sx={{ alignItems: 'center', mb: 1 }}>
              <IconButton
                size="small"
                onClick={handleRenewSubscription}
                disabled={renewLoading}
                sx={{ color: 'warning.main' }}
              >
                {renewLoading ? <CircularProgress size={20} /> : <WarningAmberIcon />}
              </IconButton>
            </Stack>
          )}
          <SidebarProfile mini={mini} />
        </Box>
      </React.Fragment>
    ),
    [mini, hasDrawerTransitions, isFullyExpanded, pathname, t, hasSubscription, renewLoading, handleRenewSubscription],
  );

  const getDrawerSharedSx = React.useCallback(
    (isTemporary: boolean) => {
      const drawerWidth = mini ? MINI_DRAWER_WIDTH : DRAWER_WIDTH;

      return {
        displayPrint: 'none',
        width: drawerWidth,
        flexShrink: 0,
        ...getDrawerWidthTransitionMixin(expanded),
        ...(isTemporary ? { position: 'absolute' } : {}),
        [`& .MuiDrawer-paper`]: {
          position: 'absolute',
          width: drawerWidth,
          boxSizing: 'border-box',
          backgroundImage: 'none',
          ...getDrawerWidthTransitionMixin(expanded),
        },
      };
    },
    [expanded, mini],
  );

  const sidebarContextValue = React.useMemo(() => {
    return {
      onPageItemClick: handlePageItemClick,
      mini,
      fullyExpanded: isFullyExpanded,
      fullyCollapsed: isFullyCollapsed,
      hasDrawerTransitions,
    };
  }, [handlePageItemClick, mini, isFullyExpanded, isFullyCollapsed, hasDrawerTransitions]);

  return (
    <DashboardSidebarContext.Provider value={sidebarContextValue}>
      <Drawer
        container={container}
        variant="temporary"
        open={expanded}
        onClose={handleSetSidebarExpanded(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', sm: 'none', md: 'none' },
          ...getDrawerSharedSx(true),
        }}
      >
        {getDrawerContent('phone')}
      </Drawer>
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block', md: 'none' },
          ...getDrawerSharedSx(false),
        }}
      >
        {getDrawerContent('tablet')}
      </Drawer>
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          ...getDrawerSharedSx(false),
        }}
      >
        {getDrawerContent('desktop')}
      </Drawer>
    </DashboardSidebarContext.Provider>
  );
}
