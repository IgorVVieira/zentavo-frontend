'use client';

import { useTheme } from '@mui/material/styles';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import { BarChart } from '@mui/x-charts/BarChart';
import { useTranslations, useLocale } from 'next-intl';
import type { MonthSummary } from '../../../lib/dashboard';

interface LastSixMonthsChartProps {
  data: MonthSummary[];
  loading: boolean;
}

export default function LastSixMonthsChart({
  data,
  loading,
}: LastSixMonthsChartProps) {
  const theme = useTheme();
  const t = useTranslations('dashboard');
  const locale = useLocale();

  const labels = data.map((m) => {
    const date = new Date(m.year, m.month - 1);
    return date.toLocaleDateString(locale === 'pt-br' ? 'pt-BR' : 'en-US', { month: 'short' });
  });
  const cashInData = data.map((m) => m.totalCashIn);
  const cashOutData = data.map((m) => Math.abs(m.totalCashOut));

  const totalIn = cashInData.reduce((a, b) => a + b, 0);
  const totalOut = cashOutData.reduce((a, b) => a + b, 0);

  return (
    <Card variant="outlined" sx={{ width: '100%' }}>
      <CardContent>
        <Typography component="h2" variant="subtitle2" gutterBottom>
          {t('last6months')}
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
              {(totalIn - totalOut).toLocaleString(locale === 'pt-br' ? 'pt-BR' : 'en-US', {
                style: 'currency',
                currency: 'BRL',
              })}
            </Typography>
          </Stack>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {t('last6monthsBalance')}
          </Typography>
        </Stack>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : data.length > 0 ? (
          <BarChart
            xAxis={[
              {
                scaleType: 'band',
                data: labels,
              },
            ]}
            series={[
              {
                id: 'cash-in',
                label: t('cashIn'),
                data: cashInData,
                color: theme.palette.success.main,
              },
              {
                id: 'cash-out',
                label: t('cashOut'),
                data: cashOutData,
                color: theme.palette.error.main,
              },
            ]}
            height={250}
            margin={{ left: 60, right: 20, top: 20, bottom: 30 }}
            grid={{ horizontal: true }}
          />
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
