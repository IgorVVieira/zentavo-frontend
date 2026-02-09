'use client';

import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import LinearProgress, { linearProgressClasses } from '@mui/material/LinearProgress';
import { BarChart } from '@mui/x-charts/BarChart';
import { useTranslations, useLocale } from 'next-intl';
import type { PaymentMethodSummary } from '../../../lib/dashboard';

const methodColors: Record<string, string> = {
  PIX: 'hsl(160, 60%, 45%)',
  DEBIT: 'hsl(220, 60%, 50%)',
  TRANSFER: 'hsl(270, 50%, 50%)',
  CARD_PAYMENT: 'hsl(30, 70%, 50%)',
  CASH_BACK: 'hsl(340, 55%, 50%)',
};

interface PaymentMethodsChartProps {
  data: PaymentMethodSummary[];
  loading: boolean;
}

export default function PaymentMethodsChart({
  data,
  loading,
}: PaymentMethodsChartProps) {
  const t = useTranslations('dashboard');
  const tc = useTranslations('common');
  const locale = useLocale();

  const methodLabels: Record<string, string> = {
    PIX: tc('methods.PIX'),
    DEBIT: tc('methods.DEBIT'),
    TRANSFER: tc('methods.TRANSFER'),
    CARD_PAYMENT: tc('methods.CARD_PAYMENT'),
    CASH_BACK: tc('methods.CASH_BACK'),
  };

  const sorted = [...data]
    .map((item) => ({ method: item.method, total: Math.abs(item.total) }))
    .sort((a, b) => b.total - a.total);

  const grandTotal = sorted.reduce((s, c) => s + c.total, 0);

  const labels = sorted.map((s) => methodLabels[s.method] || s.method);
  const values = sorted.map((s) => s.total);
  const colors = sorted.map((s) => methodColors[s.method] || 'hsl(220, 20%, 50%)');

  return (
    <Card variant="outlined" sx={{ width: '100%' }}>
      <CardContent>
        <Typography component="h2" variant="subtitle2" gutterBottom>
          {t('paymentMethods')}
        </Typography>
        <Stack sx={{ justifyContent: 'space-between' }}>
          <Stack
            direction="row"
            sx={{
              alignContent: { xs: 'center', sm: 'flex-start' },
              alignItems: 'center',
              gap: 1,
            }}
          >
            <Typography variant="h4" component="p">
              {grandTotal.toLocaleString(locale === 'pt-br' ? 'pt-BR' : 'en-US', {
                style: 'currency',
                currency: 'BRL',
              })}
            </Typography>
          </Stack>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {t('paymentMethodsDescription')}
          </Typography>
        </Stack>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : sorted.length > 0 ? (
          <>
            <BarChart
              borderRadius={8}
              xAxis={[
                {
                  scaleType: 'band',
                  data: labels,
                  categoryGapRatio: 0.4,
                },
              ]}
              series={[
                {
                  data: values,
                  color: colors[0],
                  valueFormatter: (v) =>
                    (v ?? 0).toLocaleString(locale === 'pt-br' ? 'pt-BR' : 'en-US', {
                      style: 'currency',
                      currency: 'BRL',
                    }),
                },
              ]}
              height={250}
              margin={{ left: 60, right: 10, top: 20, bottom: 30 }}
              grid={{ horizontal: true }}
              hideLegend
              slotProps={{
                bar: ({ dataIndex }) => ({
                  style: { fill: colors[dataIndex ?? 0] },
                }),
              }}
            />
            <Stack spacing={1.5} sx={{ mt: 1 }}>
              {sorted.map((item, index) => {
                const pct = grandTotal > 0 ? Math.round((item.total / grandTotal) * 100) : 0;
                return (
                  <Stack
                    key={item.method}
                    direction="row"
                    sx={{ alignItems: 'center', gap: 2 }}
                  >
                    <Box
                      sx={{
                        width: 14,
                        height: 14,
                        borderRadius: '50%',
                        backgroundColor: colors[index],
                        flexShrink: 0,
                      }}
                    />
                    <Stack sx={{ gap: 0.5, flexGrow: 1 }}>
                      <Stack
                        direction="row"
                        sx={{
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {methodLabels[item.method] || item.method}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          {pct}%
                        </Typography>
                      </Stack>
                      <LinearProgress
                        variant="determinate"
                        value={pct}
                        sx={{
                          [`& .${linearProgressClasses.bar}`]: {
                            backgroundColor: colors[index],
                          },
                        }}
                      />
                    </Stack>
                  </Stack>
                );
              })}
            </Stack>
          </>
        ) : (
          <Typography
            variant="body2"
            sx={{ color: 'text.secondary', py: 4, textAlign: 'center' }}
          >
            {t('noData')}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}
