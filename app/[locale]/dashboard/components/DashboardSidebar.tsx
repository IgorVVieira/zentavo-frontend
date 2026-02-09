'use client';

import * as React from 'react';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import Toolbar from '@mui/material/Toolbar';
import CategoryIcon from '@mui/icons-material/Category';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import { usePathname } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
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
          <SidebarProfile mini={mini} />
        </Box>
      </React.Fragment>
    ),
    [mini, hasDrawerTransitions, isFullyExpanded, pathname, t],
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
