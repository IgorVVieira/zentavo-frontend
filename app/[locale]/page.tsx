'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Container from '@mui/material/Container';
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { styled, useTheme } from '@mui/material/styles';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import AppTheme from '../shared-theme/AppTheme';
import ColorModeSelect from '../shared-theme/ColorModeSelect';
import CoinLogo from '../components/CoinLogo';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { useTranslations } from 'next-intl';
import { BarChart } from '@mui/x-charts/BarChart';
import { PieChart } from '@mui/x-charts/PieChart';
import { SparkLineChart } from '@mui/x-charts/SparkLineChart';
import { areaElementClasses } from '@mui/x-charts/LineChart';

// ---------------------------------------------------------------------------
// Styled
// ---------------------------------------------------------------------------

const PageContainer = styled(Stack)(({ theme }) => ({
  minHeight: '100dvh',
  padding: theme.spacing(2),
  [theme.breakpoints.up('sm')]: { padding: theme.spacing(4) },
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

// ---------------------------------------------------------------------------
// Mini preview components  (static mockups of real screens)
// ---------------------------------------------------------------------------

function PreviewStatCard({
  title,
  value,
  trend,
  trendLabel,
  data,
  color,
}: {
  title: string;
  value: string;
  trend: 'success' | 'error' | 'default';
  trendLabel: string;
  data: number[];
  color: string;
}) {
  const id = `grad-${title.replace(/\s/g, '')}`;
  return (
    <Card variant="outlined" sx={{ flex: 1, minWidth: 0 }}>
      <CardContent sx={{ pb: '12px !important' }}>
        <Typography variant="caption" color="text.secondary">
          {title}
        </Typography>
        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5" fontWeight={700}>
            {value}
          </Typography>
          <Chip size="small" color={trend} label={trendLabel} />
        </Stack>
        <Box sx={{ width: '100%', height: 40, mt: 1 }}>
          <SparkLineChart
            color={color}
            data={data}
            area
            xAxis={{ scaleType: 'band', data: data.map((_, i) => `${i + 1}`) }}
            sx={{ [`& .${areaElementClasses.root}`]: { fill: `url(#${id})` } }}
          >
            <defs>
              <linearGradient id={id} x1="50%" y1="0%" x2="50%" y2="100%">
                <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
          </SparkLineChart>
        </Box>
      </CardContent>
    </Card>
  );
}

function DashboardPreview() {
  const theme = useTheme();
  const t = useTranslations('landing');
  const green =
    theme.palette.mode === 'light'
      ? theme.palette.success.main
      : theme.palette.success.dark;
  const red =
    theme.palette.mode === 'light'
      ? theme.palette.error.main
      : theme.palette.error.dark;

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <PreviewStatCard
          title={t('preview.cashIn')}
          value="R$4.2k"
          trend="success"
          trendLabel="+12%"
          data={[200, 450, 300, 600, 500, 800, 700, 650, 900]}
          color={green}
        />
        <PreviewStatCard
          title={t('preview.cashOut')}
          value="R$2.8k"
          trend="error"
          trendLabel="+5%"
          data={[400, 350, 500, 300, 450, 200, 350, 400, 300]}
          color={red}
        />
        <PreviewStatCard
          title={t('preview.balance')}
          value="R$1.4k"
          trend="success"
          trendLabel="+18%"
          data={[-200, 100, -200, 300, 50, 600, 350, 250, 600]}
          color={green}
        />
      </Stack>

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
        <Card variant="outlined" sx={{ flex: 1, p: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            {t('preview.last6months')}
          </Typography>
          <BarChart
            height={180}
            series={[
              { data: [3200, 4100, 3800, 4500, 3900, 4200], label: t('preview.cashIn'), color: green },
              { data: [2800, 3200, 2900, 3600, 3100, 2800], label: t('preview.cashOut'), color: red },
            ]}
            xAxis={[{ data: ['Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'], scaleType: 'band' }]}
            hideLegend
            margin={{ top: 10, bottom: 25, left: 50, right: 10 }}
          />
        </Card>
        <Card variant="outlined" sx={{ flex: 1, p: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            {t('preview.expensesByCategory')}
          </Typography>
          <PieChart
            height={180}
            series={[
              {
                data: [
                  { id: 0, value: 35, label: 'Alimentacao' },
                  { id: 1, value: 25, label: 'Transporte' },
                  { id: 2, value: 20, label: 'Moradia' },
                  { id: 3, value: 20, label: 'Lazer' },
                ],
                innerRadius: 40,
              },
            ]}
            hideLegend
            margin={{ top: 10, bottom: 10, left: 10, right: 10 }}
          />
        </Card>
      </Stack>
    </Stack>
  );
}

function TransactionsPreview() {
  const t = useTranslations('landing');
  const rows = [
    { desc: 'Supermercado Extra', type: 'Saida', method: 'Debito', val: 'R$247,50', cat: 'Alimentacao' },
    { desc: 'Salario', type: 'Entrada', method: 'Transferencia', val: 'R$4.200,00', cat: 'Renda' },
    { desc: 'Uber', type: 'Saida', method: 'PIX', val: 'R$32,90', cat: 'Transporte' },
    { desc: 'Netflix', type: 'Saida', method: 'Cartao', val: 'R$55,90', cat: 'Lazer' },
  ];
  return (
    <Card variant="outlined" sx={{ overflow: 'hidden' }}>
      <Box sx={{ overflowX: 'auto' }}>
        <Box
          component="table"
          sx={{
            width: '100%',
            borderCollapse: 'collapse',
            '& th, & td': {
              px: 2,
              py: 1.2,
              textAlign: 'left',
              fontSize: '0.8125rem',
              borderBottom: '1px solid',
              borderColor: 'divider',
              whiteSpace: 'nowrap',
            },
            '& th': { fontWeight: 600, color: 'text.secondary', bgcolor: 'background.default' },
          }}
        >
          <thead>
            <tr>
              <th>{t('preview.description')}</th>
              <th>{t('preview.type')}</th>
              <th>{t('preview.method')}</th>
              <th>{t('preview.amount')}</th>
              <th>{t('preview.category')}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.desc}>
                <td>{r.desc}</td>
                <td>
                  <Chip
                    label={r.type}
                    color={r.type === 'Entrada' ? 'success' : 'error'}
                    size="small"
                  />
                </td>
                <td>{r.method}</td>
                <td>{r.val}</td>
                <td>{r.cat}</td>
              </tr>
            ))}
          </tbody>
        </Box>
      </Box>
    </Card>
  );
}

function ImportPreview() {
  const t = useTranslations('landing');
  return (
    <Card variant="outlined" sx={{ p: 3, maxWidth: 420, mx: 'auto' }}>
      <Typography variant="subtitle2" sx={{ mb: 2 }}>
        {t('preview.importStatement')}
      </Typography>
      <Box
        sx={{
          border: '2px dashed',
          borderColor: 'divider',
          borderRadius: 2,
          p: 4,
          textAlign: 'center',
          mb: 2,
        }}
      >
        <CloudUploadIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
        <Typography variant="body2" color="text.secondary">
          {t('preview.selectOFX')}
        </Typography>
      </Box>
      <Button variant="contained" fullWidth disabled>
        {t('preview.importBtn')}
      </Button>
    </Card>
  );
}

function CategoriesPreview() {
  const t = useTranslations('landing');
  const cats = [
    { name: 'Alimentacao', color: '#4caf50', type: 'Saida' },
    { name: 'Transporte', color: '#2196f3', type: 'Saida' },
    { name: 'Renda', color: '#ff9800', type: 'Entrada' },
    { name: 'Lazer', color: '#9c27b0', type: 'Saida' },
  ];
  return (
    <Card variant="outlined" sx={{ overflow: 'hidden' }}>
      <Box
        component="table"
        sx={{
          width: '100%',
          borderCollapse: 'collapse',
          '& th, & td': {
            px: 2,
            py: 1.2,
            textAlign: 'left',
            fontSize: '0.8125rem',
            borderBottom: '1px solid',
            borderColor: 'divider',
            whiteSpace: 'nowrap',
          },
          '& th': { fontWeight: 600, color: 'text.secondary', bgcolor: 'background.default' },
        }}
      >
        <thead>
          <tr>
            <th>{t('preview.color')}</th>
            <th>{t('preview.name')}</th>
            <th>{t('preview.type')}</th>
          </tr>
        </thead>
        <tbody>
          {cats.map((c) => (
            <tr key={c.name}>
              <td>
                <Box
                  sx={{
                    width: 24,
                    height: 24,
                    borderRadius: 0.5,
                    bgcolor: c.color,
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                />
              </td>
              <td>{c.name}</td>
              <td>{c.type}</td>
            </tr>
          ))}
        </tbody>
      </Box>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function LandingPage() {
  const t = useTranslations('landing');
  const tc = useTranslations('common');

  const tiers = [
    {
      title: t('pricing.free.title'),
      price: t('pricing.free.price'),
      features: t.raw('pricing.free.features') as string[],
      buttonText: t('pricing.free.cta'),
      buttonVariant: 'outlined' as const,
    },
    {
      title: t('pricing.pro.title'),
      price: t('pricing.pro.price'),
      features: t.raw('pricing.pro.features') as string[],
      buttonText: t('pricing.pro.cta'),
      buttonVariant: 'contained' as const,
      recommended: true,
    },
  ];

  return (
    <AppTheme>
      <CssBaseline enableColorScheme />
      <PageContainer direction="column">
        <Stack direction="row" spacing={1} sx={{ position: 'fixed', top: '1rem', right: '1rem', zIndex: 10 }}>
          <LanguageSwitcher />
          <ColorModeSelect />
        </Stack>

        {/* Nav */}
        <Container maxWidth="lg">
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ py: 2 }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <CoinLogo size={32} />
              <Typography variant="h5" fontWeight={700}>
                ZenCash
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1}>
              <Button variant="text" href="/login">
                {tc('auth.signIn')}
              </Button>
              <Button variant="contained" href="/register" size="small">
                {tc('auth.signUp')}
              </Button>
            </Stack>
          </Stack>
        </Container>

        {/* Hero */}
        <Container maxWidth="md" sx={{ textAlign: 'center', py: { xs: 6, md: 10 } }}>
          <Typography
            component="h1"
            variant="h1"
            sx={{ fontSize: 'clamp(2.5rem, 8vw, 3.5rem)', fontWeight: 700, mb: 2 }}
          >
            {t('hero.titleStart')}{' '}
            <Typography
              component="span"
              sx={{
                fontSize: 'inherit',
                fontWeight: 'inherit',
                background: 'linear-gradient(135deg, hsl(210, 98%, 48%), hsl(210, 100%, 35%))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {t('hero.titleHighlight')}
            </Typography>
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 4, fontWeight: 400 }}>
            {t('hero.subtitle')}
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
            <Button variant="contained" size="large" href="/register" sx={{ px: 4 }}>
              {t('hero.cta')}
            </Button>
            <Button variant="outlined" size="large" href="/login" sx={{ px: 4 }}>
              {t('hero.ctaSecondary')}
            </Button>
          </Stack>
        </Container>

        {/* Section: Dashboard */}
        <Box sx={{ bgcolor: 'background.paper', py: { xs: 6, md: 8 } }}>
          <Container maxWidth="lg">
            <Typography variant="overline" color="primary">
              {t('sections.dashboard.label')}
            </Typography>
            <Typography variant="h4" fontWeight={600} sx={{ mb: 1 }}>
              {t('sections.dashboard.title')}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 520 }}>
              {t('sections.dashboard.description')}
            </Typography>
            <DashboardPreview />
          </Container>
        </Box>

        {/* Section: Transacoes */}
        <Container maxWidth="lg" sx={{ py: { xs: 6, md: 8 } }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={4} alignItems="center">
            <Box sx={{ flex: 1 }}>
              <Typography variant="overline" color="primary">
                {t('sections.transactions.label')}
              </Typography>
              <Typography variant="h4" fontWeight={600} sx={{ mb: 1 }}>
                {t('sections.transactions.title')}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                {t('sections.transactions.description')}
              </Typography>
            </Box>
            <Box sx={{ flex: 1.2, width: '100%' }}>
              <TransactionsPreview />
            </Box>
          </Stack>
        </Container>

        {/* Section: Import + Categories side by side */}
        <Box sx={{ bgcolor: 'background.paper', py: { xs: 6, md: 8 } }}>
          <Container maxWidth="lg">
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={4}>
              {/* Import */}
              <Box sx={{ flex: 1 }}>
                <Typography variant="overline" color="primary">
                  {t('sections.import.label')}
                </Typography>
                <Typography variant="h4" fontWeight={600} sx={{ mb: 1 }}>
                  {t('sections.import.title')}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  {t('sections.import.description')}
                </Typography>
                <ImportPreview />
                <Stack
                  direction="row"
                  spacing={1}
                  flexWrap="wrap"
                  useFlexGap
                  sx={{ mt: 3, justifyContent: 'center' }}
                >
                  {['Nubank', 'Inter', 'Itau', 'Bradesco', 'C6', 'BTG', 'Santander', 'BB'].map(
                    (b) => (
                      <Chip key={b} label={b} size="small" variant="outlined" />
                    ),
                  )}
                  <Chip label={t('preview.andOthers')} size="small" color="primary" />
                </Stack>
              </Box>

              {/* Categories */}
              <Box sx={{ flex: 1 }}>
                <Typography variant="overline" color="primary">
                  {t('sections.categories.label')}
                </Typography>
                <Typography variant="h4" fontWeight={600} sx={{ mb: 1 }}>
                  {t('sections.categories.title')}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  {t('sections.categories.description')}
                </Typography>
                <CategoriesPreview />
              </Box>
            </Stack>
          </Container>
        </Box>

        {/* Pricing */}
        <Container maxWidth="md" sx={{ py: { xs: 6, md: 10 } }}>
          <Typography variant="h3" fontWeight={600} sx={{ textAlign: 'center', mb: 1 }}>
            {t('pricing.title')}
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ textAlign: 'center', mb: 6 }}
          >
            {t('pricing.subtitle')}
          </Typography>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} sx={{ maxWidth: 700, mx: 'auto' }}>
            {tiers.map((tier) => (
              <Card
                key={tier.title}
                variant="outlined"
                sx={{
                  p: 4,
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  ...(tier.recommended && { borderColor: 'primary.main', borderWidth: 2 }),
                }}
              >
                {tier.recommended && (
                  <Chip
                    label={t('pricing.recommended')}
                    color="primary"
                    size="small"
                    sx={{ position: 'absolute', top: 16, right: 16 }}
                  />
                )}
                <Typography variant="h5" fontWeight={600} sx={{ mb: 1 }}>
                  {tier.title}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'baseline', mb: 3 }}>
                  <Typography variant="h3" fontWeight={700}>
                    R${tier.price}
                  </Typography>
                  {tier.price !== '0' && (
                    <Typography variant="subtitle1" color="text.secondary" sx={{ ml: 0.5 }}>
                      {t('pricing.perMonth')}
                    </Typography>
                  )}
                </Box>
                <Divider sx={{ mb: 3 }} />
                <Stack spacing={1.5} sx={{ mb: 4, flex: 1 }}>
                  {tier.features.map((f) => (
                    <Stack key={f} direction="row" spacing={1} alignItems="center">
                      <CheckCircleRoundedIcon sx={{ fontSize: 20, color: 'success.main' }} />
                      <Typography variant="body2">{f}</Typography>
                    </Stack>
                  ))}
                </Stack>
                <Button variant={tier.buttonVariant} size="large" fullWidth href="/register">
                  {tier.buttonText}
                </Button>
              </Card>
            ))}
          </Stack>
        </Container>

        {/* Footer */}
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <Stack direction="row" spacing={1} justifyContent="center" alignItems="center" sx={{ mb: 0.5 }}>
            <CoinLogo size={20} />
            <Typography variant="body2" fontWeight={600}>
              ZenCash
            </Typography>
          </Stack>
          <Typography variant="caption" color="text.secondary">
            {t('footer.tagline')}
          </Typography>
        </Box>
      </PageContainer>
    </AppTheme>
  );
}
