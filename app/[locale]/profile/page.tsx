'use client';

import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import AccountCircleRoundedIcon from '@mui/icons-material/AccountCircleRounded';
import EmailRoundedIcon from '@mui/icons-material/EmailRounded';
import CalendarTodayRoundedIcon from '@mui/icons-material/CalendarTodayRounded';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { getMe } from '../../lib/auth';
import { createPaymentLink } from '../../lib/payments';
import { useSubscription } from '../../lib/subscription-context';
import { resetTour } from '../../components/OnboardingTour';
import { useRouter } from '@/i18n/navigation';
import { useTranslations, useLocale } from 'next-intl';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export default function ProfilePage() {
  const t = useTranslations('profile');
  const locale = useLocale();
  const router = useRouter();
  const { hasSubscription } = useSubscription();
  const [user, setUser] = React.useState<UserProfile | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [renewLoading, setRenewLoading] = React.useState(false);
  const [renewError, setRenewError] = React.useState('');

  const handleRestartTour = () => {
    resetTour();
    router.push('/dashboard');
  };

  const handleRenewSubscription = async () => {
    setRenewLoading(true);
    setRenewError('');
    try {
      const paymentLink = await createPaymentLink();
      window.location.href = paymentLink.url;
    } catch {
      setRenewError(t('renewError'));
    } finally {
      setRenewLoading(false);
    }
  };

  React.useEffect(() => {
    getMe()
      .then((data) => setUser(data))
      .catch(() => setError(t('loadError')))
      .finally(() => setLoading(false));
  }, [t]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !user) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">{error || t('notFound')}</Alert>
      </Container>
    );
  }

  const initials = user.name
    .split(' ')
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join('');

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString(locale === 'pt-br' ? 'pt-BR' : 'en-US', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });

  return (
    <Container sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <Stack sx={{ flex: 1, my: 2 }} spacing={3}>
        <Stack>
          <Breadcrumbs aria-label="breadcrumb" sx={{ my: 1 }}>
            <Typography sx={{ color: 'text.primary', fontWeight: 600 }}>
              {t('title')}
            </Typography>
          </Breadcrumbs>
          <Typography variant="h4">{t('title')}</Typography>
        </Stack>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card variant="outlined">
              <CardContent
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  py: 4,
                  gap: 2,
                }}
              >
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    fontSize: 32,
                    bgcolor: 'primary.main',
                  }}
                >
                  {initials}
                </Avatar>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {user.name}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {user.email}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 8 }}>
            <Card variant="outlined">
              <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
                <Box sx={{ px: 3, py: 2 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {t('accountInfo')}
                  </Typography>
                </Box>
                <Divider />
                <Stack divider={<Divider />}>
                  <InfoRow
                    icon={<AccountCircleRoundedIcon sx={{ color: 'text.secondary' }} />}
                    label={t('name')}
                    value={user.name}
                  />
                  <InfoRow
                    icon={<EmailRoundedIcon sx={{ color: 'text.secondary' }} />}
                    label={t('email')}
                    value={user.email}
                  />
                  <InfoRow
                    icon={<CalendarTodayRoundedIcon sx={{ color: 'text.secondary' }} />}
                    label={t('memberSince')}
                    value={formatDate(user.createdAt)}
                  />
                  <InfoRow
                    icon={<CalendarTodayRoundedIcon sx={{ color: 'text.secondary' }} />}
                    label={t('lastUpdate')}
                    value={formatDate(user.updatedAt)}
                  />
                </Stack>
              </CardContent>
            </Card>

            {!hasSubscription && (
              <Card
                variant="outlined"
                sx={{
                  mt: 3,
                  borderColor: 'warning.main',
                  bgcolor: 'warning.50',
                }}
              >
                <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
                  <Box sx={{ px: 3, py: 2 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {t('subscription')}
                    </Typography>
                  </Box>
                  <Divider />
                  <Stack
                    direction="row"
                    sx={{ px: 3, py: 2, gap: 2, alignItems: 'center', justifyContent: 'space-between' }}
                  >
                    <Stack direction="row" sx={{ gap: 2, alignItems: 'center' }}>
                      <WarningAmberIcon sx={{ color: 'warning.main' }} />
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {t('subscriptionExpired')}
                        </Typography>
                      </Box>
                    </Stack>
                    <Button
                      variant="contained"
                      color="warning"
                      size="small"
                      onClick={handleRenewSubscription}
                      disabled={renewLoading}
                    >
                      {renewLoading ? t('redirecting') : t('renewSubscription')}
                    </Button>
                  </Stack>
                  {renewError && (
                    <Alert severity="error" sx={{ mx: 3, mb: 2 }}>
                      {renewError}
                    </Alert>
                  )}
                </CardContent>
              </Card>
            )}

            <Card variant="outlined" sx={{ mt: 3 }}>
              <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
                <Box sx={{ px: 3, py: 2 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {t('settings')}
                  </Typography>
                </Box>
                <Divider />
                <Stack
                  direction="row"
                  sx={{ px: 3, py: 2, gap: 2, alignItems: 'center', justifyContent: 'space-between' }}
                >
                  <Stack direction="row" sx={{ gap: 2, alignItems: 'center' }}>
                    <HelpOutlineIcon sx={{ color: 'text.secondary' }} />
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {t('restartTour')}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {t('restartTourDescription')}
                      </Typography>
                    </Box>
                  </Stack>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={handleRestartTour}
                  >
                    {t('restartTourButton')}
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Stack>
    </Container>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <Stack
      direction="row"
      sx={{ px: 3, py: 2, gap: 2, alignItems: 'center' }}
    >
      {icon}
      <Box sx={{ minWidth: 140 }}>
        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
          {label}
        </Typography>
      </Box>
      <Typography variant="body2">{value}</Typography>
    </Stack>
  );
}
