'use client';

import * as React from 'react';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import CssBaseline from '@mui/material/CssBaseline';
import AppTheme from '../../../shared-theme/AppTheme';
import DashboardHeader from './DashboardHeader';
import DashboardSidebar from './DashboardSidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const theme = useTheme();

  const [isDesktopNavigationExpanded, setIsDesktopNavigationExpanded] =
    React.useState(true);
  const [isMobileNavigationExpanded, setIsMobileNavigationExpanded] =
    React.useState(false);

  const isOverMdViewport = useMediaQuery(theme.breakpoints.up('md'));

  const isNavigationExpanded = isOverMdViewport
    ? isDesktopNavigationExpanded
    : isMobileNavigationExpanded;

  const setIsNavigationExpanded = React.useCallback(
    (newExpanded: boolean) => {
      if (isOverMdViewport) {
        setIsDesktopNavigationExpanded(newExpanded);
      } else {
        setIsMobileNavigationExpanded(newExpanded);
      }
    },
    [isOverMdViewport],
  );

  const handleToggleHeaderMenu = React.useCallback(
    (isExpanded: boolean) => {
      setIsNavigationExpanded(isExpanded);
    },
    [setIsNavigationExpanded],
  );

  const layoutRef = React.useRef<HTMLDivElement>(null);

  return (
    <AppTheme>
      <CssBaseline enableColorScheme />
      <Box
        ref={layoutRef}
        sx={{
          position: 'relative',
          display: 'flex',
          overflow: 'hidden',
          height: '100vh',
          width: '100%',
        }}
      >
        <DashboardHeader
          menuOpen={isNavigationExpanded}
          onToggleMenu={handleToggleHeaderMenu}
        />
        <DashboardSidebar
          expanded={isNavigationExpanded}
          setExpanded={setIsNavigationExpanded}
          container={layoutRef?.current ?? undefined}
        />
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            minWidth: 0,
          }}
        >
          <Toolbar sx={{ displayPrint: 'none' }} />
          <Box
            component="main"
            sx={{
              display: 'flex',
              flexDirection: 'column',
              flex: 1,
              overflow: 'auto',
              px: { xs: 2, sm: 3, md: 4 },
              py: { xs: 2, sm: 3 },
            }}
          >
            {children}
          </Box>
        </Box>
      </Box>
    </AppTheme>
  );
}
