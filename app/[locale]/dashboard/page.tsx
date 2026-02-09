'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import StatCard from './components/StatCard';
import LastSixMonthsChart from './components/LastSixMonthsChart';
import PaymentMethodsChart from './components/PaymentMethodsChart';
import CategoriesChart from './components/CategoriesChart';
import {
  getTransactionsByMonth,
  type Transaction,
} from '../../lib/transactions';
import {
  getPaymentMethodsSummary,
  getCategoriesSummary,
  getLastSixMonths,
  type CategorySummary,
  type MonthSummary,
  type PaymentMethodSummary,
} from '../../lib/dashboard';
import MonthYearPicker from '../../components/MonthYearPicker';
import OnboardingTour from '../../components/OnboardingTour';
import { useTranslations, useLocale } from 'next-intl';

function getDaysInMonth(month: number, year: number) {
  const date = new Date(year, month, 0);
  const daysInMonth = date.getDate();
  const days: string[] = [];
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(`${i}`);
  }
  return days;
}

export default function DashboardPage() {
  const t = useTranslations('dashboard');
  const locale = useLocale();

  function formatCurrency(value: number): string {
    const loc = locale === 'pt-br' ? 'pt-BR' : 'en-US';
    if (Math.abs(value) >= 1000) {
      return (
        (value / 1000).toLocaleString(loc, {
          maximumFractionDigits: 1,
        }) + 'k'
      );
    }
    return value.toLocaleString(loc, {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0,
    });
  }
  const now = new Date();
  const [currentMonth, setCurrentMonth] = React.useState(now.getMonth() + 1);
  const [currentYear, setCurrentYear] = React.useState(now.getFullYear());

  const handleMonthYearChange = (month: number, year: number) => {
    setCurrentMonth(month);
    setCurrentYear(year);
  };

  const [monthTransactions, setMonthTransactions] = React.useState<Transaction[]>([]);
  const [paymentMethods, setPaymentMethods] = React.useState<PaymentMethodSummary[]>([]);
  const [categoriesCashOut, setCategoriesCashOut] = React.useState<CategorySummary[]>([]);
  const [categoriesCashIn, setCategoriesCashIn] = React.useState<CategorySummary[]>([]);
  const [lastSixMonths, setLastSixMonths] = React.useState<MonthSummary[]>([]);

  const [loadingMonth, setLoadingMonth] = React.useState(true);
  const [loadingPayments, setLoadingPayments] = React.useState(true);
  const [loadingCatOut, setLoadingCatOut] = React.useState(true);
  const [loadingCatIn, setLoadingCatIn] = React.useState(true);
  const [loadingSixMonths, setLoadingSixMonths] = React.useState(true);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    async function loadAll() {
      setError('');
      setLoadingMonth(true);
      setLoadingPayments(true);
      setLoadingCatOut(true);
      setLoadingCatIn(true);
      setLoadingSixMonths(true);

      const results = await Promise.allSettled([
        getTransactionsByMonth(currentMonth, currentYear),
        getPaymentMethodsSummary(currentMonth, currentYear),
        getCategoriesSummary(currentMonth, currentYear, 'CASH_OUT'),
        getCategoriesSummary(currentMonth, currentYear, 'CASH_IN'),
        getLastSixMonths(),
      ]);

      if (results[0].status === 'fulfilled') {
        setMonthTransactions(results[0].value);
      } else {
        setError(t('loadError'));
      }
      setLoadingMonth(false);

      if (results[1].status === 'fulfilled') {
        setPaymentMethods(results[1].value);
      }
      setLoadingPayments(false);

      if (results[2].status === 'fulfilled') {
        setCategoriesCashOut(results[2].value);
      }
      setLoadingCatOut(false);

      if (results[3].status === 'fulfilled') {
        setCategoriesCashIn(results[3].value);
      }
      setLoadingCatIn(false);

      if (results[4].status === 'fulfilled') {
        setLastSixMonths(results[4].value);
      } else {
        console.error('Failed to load last six months:', results[4]);
      }
      setLoadingSixMonths(false);
    }

    loadAll();
  }, [currentMonth, currentYear, t]);

  // Compute stat card data
  const totalCashIn = monthTransactions
    .filter((t) => t.type === 'CASH_IN')
    .reduce((s, t) => s + t.amount, 0);

  const totalCashOut = monthTransactions
    .filter((t) => t.type === 'CASH_OUT')
    .reduce((s, t) => s + t.amount, 0);

  const balance = totalCashIn - totalCashOut;

  const daysLabels = getDaysInMonth(currentMonth, currentYear);
  const dailyCashIn = new Array(daysLabels.length).fill(0);
  const dailyCashOut = new Array(daysLabels.length).fill(0);

  monthTransactions.forEach((t) => {
    const day = new Date(t.date).getDate() - 1;
    if (day >= 0 && day < daysLabels.length) {
      if (t.type === 'CASH_IN') {
        dailyCashIn[day] += t.amount;
      } else {
        dailyCashOut[day] += t.amount;
      }
    }
  });

  const dailyBalance = daysLabels.map(
    (_, i) => dailyCashIn[i] - dailyCashOut[i],
  );

  function computeTrend(data: number[]): { trend: 'up' | 'down' | 'neutral'; label: string } {
    const today = new Date().getDate();
    const relevantData = data.slice(0, today);
    if (relevantData.length < 2) return { trend: 'neutral', label: '0%' };
    const half = Math.floor(relevantData.length / 2);
    const firstHalf = relevantData.slice(0, half).reduce((a, b) => a + b, 0);
    const secondHalf = relevantData.slice(half).reduce((a, b) => a + b, 0);
    if (firstHalf === 0 && secondHalf === 0) return { trend: 'neutral', label: '0%' };
    if (firstHalf === 0) return { trend: 'up', label: '+100%' };
    const pct = Math.round(((secondHalf - firstHalf) / Math.abs(firstHalf)) * 100);
    const trend = pct > 5 ? 'up' : pct < -5 ? 'down' : 'neutral';
    const label = `${pct >= 0 ? '+' : ''}${pct}%`;
    return { trend, label };
  }

  const cashInTrend = computeTrend(dailyCashIn);
  const cashOutTrend = computeTrend(dailyCashOut);
  const balanceTrend = computeTrend(dailyBalance);

  const monthName = new Date(currentYear, currentMonth - 1).toLocaleDateString(
    locale === 'pt-br' ? 'pt-BR' : 'en-US',
    { month: 'long' },
  );
  const intervalLabel = `${monthName.charAt(0).toUpperCase()}${monthName.slice(1)} ${currentYear}`;

  return (
    <Box sx={{ width: '100%', maxWidth: { sm: '100%', md: '1700px' } }}>
      <OnboardingTour page="dashboard" />
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Header with filter */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
        }}
      >
        <Typography component="h2" variant="h6">
          {t('summary')}
        </Typography>
        <Box data-tour="month-picker">
          <MonthYearPicker
            month={currentMonth}
            year={currentYear}
            onChange={handleMonthYearChange}
          />
        </Box>
      </Box>
      <Grid
        container
        spacing={2}
        columns={12}
        sx={{ mb: (theme) => theme.spacing(2) }}
        data-tour="stat-cards"
      >
        <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
          <StatCard
            title={t('cashIn')}
            value={formatCurrency(totalCashIn)}
            interval={intervalLabel}
            trend={cashInTrend.trend}
            trendLabel={cashInTrend.label}
            data={dailyCashIn}
            xLabels={daysLabels}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
          <StatCard
            title={t('cashOut')}
            value={formatCurrency(totalCashOut)}
            interval={intervalLabel}
            trend={cashOutTrend.trend === 'up' ? 'down' : cashOutTrend.trend === 'down' ? 'up' : 'neutral'}
            trendLabel={cashOutTrend.label}
            data={dailyCashOut}
            xLabels={daysLabels}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 12, lg: 4 }}>
          <StatCard
            title={t('balance')}
            value={formatCurrency(balance)}
            interval={intervalLabel}
            trend={balanceTrend.trend}
            trendLabel={balanceTrend.label}
            data={dailyBalance}
            xLabels={daysLabels}
          />
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid
        container
        spacing={2}
        columns={12}
        sx={{ mb: (theme) => theme.spacing(2) }}
        data-tour="charts"
      >
        <Grid size={{ xs: 12, md: 6 }}>
          <LastSixMonthsChart
            data={lastSixMonths}
            loading={loadingSixMonths}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <PaymentMethodsChart
            data={paymentMethods}
            loading={loadingPayments}
          />
        </Grid>
      </Grid>

      {/* Categories breakdown */}
      <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
        {t('byCategory')}
      </Typography>
      <Grid container spacing={2} columns={12}>
        <Grid size={{ xs: 12, md: 6 }}>
          <CategoriesChart
            data={categoriesCashOut}
            loading={loadingCatOut}
            title={t('cashOutByCategory')}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <CategoriesChart
            data={categoriesCashIn}
            loading={loadingCatIn}
            title={t('cashInByCategory')}
          />
        </Grid>
      </Grid>
    </Box>
  );
}
