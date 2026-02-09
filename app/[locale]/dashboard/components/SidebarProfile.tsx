'use client';

import * as React from 'react';
import { styled } from '@mui/material/styles';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Divider, { dividerClasses } from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MuiMenuItem from '@mui/material/MenuItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon, { listItemIconClasses } from '@mui/material/ListItemIcon';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { paperClasses } from '@mui/material/Paper';
import { listClasses } from '@mui/material/List';
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import { useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { getMe, logout } from '../../../lib/auth';

const MenuItem = styled(MuiMenuItem)({
  margin: '2px 0',
});

interface UserInfo {
  name: string;
  email: string;
}

export default function SidebarProfile({ mini }: { mini?: boolean }) {
  const router = useRouter();
  const t = useTranslations('common');
  const [user, setUser] = React.useState<UserInfo | null>(null);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  React.useEffect(() => {
    getMe()
      .then((u) => setUser({ name: u.name, email: u.email }))
      .catch(() => {});
  }, []);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleProfile = () => {
    handleClose();
    router.push('/profile');
  };

  const handleLogout = () => {
    handleClose();
    logout();
  };

  if (!user) return null;

  const initials = user.name
    .split(' ')
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join('');

  if (mini) {
    return (
      <>
        <Stack sx={{ alignItems: 'center', py: 1.5 }}>
          <IconButton size="small" onClick={handleClick}>
            <Avatar sx={{ width: 32, height: 32, fontSize: 14 }}>{initials}</Avatar>
          </IconButton>
        </Stack>
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          onClick={handleClose}
          transformOrigin={{ horizontal: 'left', vertical: 'bottom' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          sx={{
            [`& .${listClasses.root}`]: { padding: '4px' },
            [`& .${paperClasses.root}`]: { padding: 0 },
            [`& .${dividerClasses.root}`]: { margin: '4px -4px' },
          }}
        >
          <MenuItem disabled>
            <ListItemText
              primary={user.name}
              secondary={user.email}
              primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
              secondaryTypographyProps={{ variant: 'caption' }}
            />
          </MenuItem>
          <Divider />
          <MenuItem
            onClick={handleProfile}
            sx={{
              [`& .${listItemIconClasses.root}`]: { ml: 'auto', minWidth: 0 },
            }}
          >
            <ListItemText>{t('nav.profile')}</ListItemText>
            <ListItemIcon>
              <PersonRoundedIcon fontSize="small" />
            </ListItemIcon>
          </MenuItem>
          <MenuItem
            onClick={handleLogout}
            sx={{
              [`& .${listItemIconClasses.root}`]: { ml: 'auto', minWidth: 0 },
            }}
          >
            <ListItemText>{t('nav.logout')}</ListItemText>
            <ListItemIcon>
              <LogoutRoundedIcon fontSize="small" />
            </ListItemIcon>
          </MenuItem>
        </Menu>
      </>
    );
  }

  return (
    <>
      <Stack
        direction="row"
        sx={{
          p: 2,
          gap: 1,
          alignItems: 'center',
          borderTop: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Avatar sx={{ width: 36, height: 36, fontSize: 14 }}>{initials}</Avatar>
        <Box sx={{ mr: 'auto', overflow: 'hidden' }}>
          <Typography
            variant="body2"
            sx={{ fontWeight: 500, lineHeight: '16px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
          >
            {user.name}
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: 'text.secondary', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}
          >
            {user.email}
          </Typography>
        </Box>
        <IconButton size="small" onClick={handleClick} sx={{ borderColor: 'transparent' }}>
          <MoreVertRoundedIcon />
        </IconButton>
      </Stack>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        sx={{
          [`& .${listClasses.root}`]: { padding: '4px' },
          [`& .${paperClasses.root}`]: { padding: 0 },
          [`& .${dividerClasses.root}`]: { margin: '4px -4px' },
        }}
      >
        <MenuItem
          onClick={handleProfile}
          sx={{
            [`& .${listItemIconClasses.root}`]: { ml: 'auto', minWidth: 0 },
          }}
        >
          <ListItemText>{t('nav.profile')}</ListItemText>
          <ListItemIcon>
            <PersonRoundedIcon fontSize="small" />
          </ListItemIcon>
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={handleLogout}
          sx={{
            [`& .${listItemIconClasses.root}`]: { ml: 'auto', minWidth: 0 },
          }}
        >
          <ListItemText>{t('nav.logout')}</ListItemText>
          <ListItemIcon>
            <LogoutRoundedIcon fontSize="small" />
          </ListItemIcon>
        </MenuItem>
      </Menu>
    </>
  );
}
