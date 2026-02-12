'use client';

import * as React from 'react';
import { useRouter } from '@/i18n/navigation';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { SubscriptionProvider } from './subscription-context';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [authorized, setAuthorized] = React.useState(false);
  const [token, setToken] = React.useState<string | null>(null);

  React.useEffect(() => {
    const storedToken = localStorage.getItem('zencash_token');
    if (!storedToken) {
      router.replace('/login');
    } else {
      setToken(storedToken);
      setAuthorized(true);
    }
  }, [router]);

  if (!authorized) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <SubscriptionProvider token={token}>
      {children}
    </SubscriptionProvider>
  );
}
