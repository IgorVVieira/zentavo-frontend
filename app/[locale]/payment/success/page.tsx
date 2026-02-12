'use client';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import MuiCard from '@mui/material/Card';
import { styled } from '@mui/material/styles';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import AppTheme from '../../../shared-theme/AppTheme';
import ColorModeSelect from '../../../shared-theme/ColorModeSelect';
import CoinLogo from '../../../components/CoinLogo';
import LanguageSwitcher from '../../../components/LanguageSwitcher';
import { useTranslations } from 'next-intl';

const Card = styled(MuiCard)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignSelf: 'center',
  width: '100%',
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  margin: 'auto',
  textAlign: 'center',
  [theme.breakpoints.up('sm')]: {
    maxWidth: '480px',
  },
  boxShadow:
    'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px',
  ...theme.applyStyles('dark', {
    boxShadow:
      'hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px',
  }),
}));

const PageContainer = styled(Stack)(({ theme }) => ({
  height: 'calc((1 - var(--template-frame-height, 0)) * 100dvh)',
  minHeight: '100%',
  padding: theme.spacing(2),
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(4),
  },
  '&::before': {
    content: '""',
    display: 'block',
    position: 'absolute',
    zIndex: -1,
    inset: 0,
    backgroundImage:
      'radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))',
    backgroundRepeat: 'no-repeat',
    ...theme.applyStyles('dark', {
      backgroundImage:
        'radial-gradient(at 50% 50%, hsla(210, 100%, 16%, 0.5), hsl(220, 30%, 5%))',
    }),
  },
}));

export default function PaymentSuccessPage() {
  const t = useTranslations('common');

  return (
    <AppTheme>
      <CssBaseline enableColorScheme />
      <Stack direction="row" spacing={1} sx={{ position: 'fixed', top: '1rem', right: '1rem' }}>
        <LanguageSwitcher />
        <ColorModeSelect />
      </Stack>
      <PageContainer direction="column" justifyContent="center" alignItems="center">
        <Card variant="outlined">
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <CoinLogo size={40} />
          </Box>
          <CheckCircleOutlineIcon
            sx={{ fontSize: 64, color: 'success.main', mx: 'auto' }}
          />
          <Typography variant="h4" fontWeight={700}>
            {t('paymentSuccess.title')}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {t('paymentSuccess.description')}
          </Typography>
          <Button variant="contained" size="large" href="/login" sx={{ mt: 2 }}>
            {t('paymentSuccess.cta')}
          </Button>
        </Card>
      </PageContainer>
    </AppTheme>
  );
}
