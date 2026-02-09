'use client';

import * as React from 'react';
import { useColorScheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';

export default function ThemeSwitcher() {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const preferredMode = prefersDarkMode ? 'dark' : 'light';

  const { mode, setMode } = useColorScheme();

  const paletteMode = !mode || mode === 'system' ? preferredMode : mode;

  const toggleMode = React.useCallback(() => {
    setMode(paletteMode === 'dark' ? 'light' : 'dark');
  }, [setMode, paletteMode]);

  if (!mode) {
    return null;
  }

  return (
    <Tooltip
      title={`Modo ${paletteMode === 'dark' ? 'claro' : 'escuro'}`}
      enterDelay={1000}
    >
      <div>
        <IconButton
          size="small"
          aria-label={`Alternar para modo ${paletteMode === 'dark' ? 'claro' : 'escuro'}`}
          onClick={toggleMode}
        >
          {paletteMode === 'dark' ? <DarkModeIcon /> : <LightModeIcon />}
        </IconButton>
      </div>
    </Tooltip>
  );
}
