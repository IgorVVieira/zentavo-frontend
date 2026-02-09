'use client';

import * as React from 'react';
import { useDrawingArea } from '@mui/x-charts/hooks';
import { PieChart } from '@mui/x-charts/PieChart';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import CircularProgress from '@mui/material/CircularProgress';
import LinearProgress, { linearProgressClasses } from '@mui/material/LinearProgress';
import { useTranslations, useLocale } from 'next-intl';
import type { CategorySummary } from '../../../lib/dashboard';

interface StyledTextProps {
  variant: 'primary' | 'secondary';
}

const StyledText = styled('text', {
  shouldForwardProp: (prop) => prop !== 'variant',
})<StyledTextProps>(({ theme }) => ({
  textAnchor: 'middle',
  dominantBaseline: 'central',
  fill: (theme.vars || theme).palette.text.secondary,
  variants: [
    {
      props: { variant: 'primary' },
      style: {
        fontSize: theme.typography.h5.fontSize,
        fontWeight: theme.typography.h5.fontWeight,
      },
    },
    {
      props: ({ variant }) => variant !== 'primary',
      style: {
        fontSize: theme.typography.body2.fontSize,
        fontWeight: theme.typography.body2.fontWeight,
      },
    },
  ],
}));

function PieCenterLabel({
  primaryText,
  secondaryText,
}: {
  primaryText: string;
  secondaryText: string;
}) {
  const { width, height, left, top } = useDrawingArea();
  const primaryY = top + height / 2 - 10;
  const secondaryY = primaryY + 24;

  return (
    <React.Fragment>
      <StyledText variant="primary" x={left + width / 2} y={primaryY}>
        {primaryText}
      </StyledText>
      <StyledText variant="secondary" x={left + width / 2} y={secondaryY}>
        {secondaryText}
      </StyledText>
    </React.Fragment>
  );
}

const fallbackColors = [
  'hsl(220, 20%, 65%)',
  'hsl(220, 20%, 42%)',
  'hsl(220, 20%, 35%)',
  'hsl(220, 20%, 25%)',
  'hsl(160, 40%, 45%)',
  'hsl(30, 60%, 50%)',
  'hsl(0, 50%, 50%)',
  'hsl(270, 40%, 50%)',
];

interface CategoriesChartProps {
  data: CategorySummary[];
  loading: boolean;
  title: string;
}

export default function CategoriesChart({
  data,
  loading,
  title,
}: CategoriesChartProps) {
  const t = useTranslations('dashboard');
  const locale = useLocale();

  const grandTotal = data.reduce((s, c) => s + Math.abs(c.total), 0);

  const pieData = data.map((c, i) => ({
    label: c.name,
    value: Math.abs(c.total),
    color: c.color || fallbackColors[i % fallbackColors.length],
  }));

  const categories = data.map((c, i) => ({
    name: c.name,
    value: Math.round(c.percentage),
    color: c.color || fallbackColors[i % fallbackColors.length],
    total: c.total,
  }));

  return (
    <Card
      variant="outlined"
      sx={{ display: 'flex', flexDirection: 'column', gap: '8px', flexGrow: 1 }}
    >
      <CardContent>
        <Typography component="h2" variant="subtitle2">
          {title}
        </Typography>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : pieData.length > 0 ? (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <PieChart
                colors={pieData.map((d) => d.color)}
                margin={{ left: 80, right: 80, top: 80, bottom: 80 }}
                series={[
                  {
                    data: pieData,
                    innerRadius: 75,
                    outerRadius: 100,
                    paddingAngle: 0,
                    highlightScope: { fade: 'global', highlight: 'item' },
                  },
                ]}
                height={260}
                width={260}
                hideLegend
              >
                <PieCenterLabel
                  primaryText={grandTotal.toLocaleString(locale === 'pt-br' ? 'pt-BR' : 'en-US', {
                    style: 'currency',
                    currency: 'BRL',
                    maximumFractionDigits: 0,
                  })}
                  secondaryText={t('total')}
                />
              </PieChart>
            </Box>
            {categories.map((cat, index) => (
              <Stack
                key={index}
                direction="row"
                sx={{ alignItems: 'center', gap: 2, pb: 2 }}
              >
                <Box
                  sx={{
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    backgroundColor: cat.color,
                    flexShrink: 0,
                  }}
                />
                <Stack sx={{ gap: 1, flexGrow: 1 }}>
                  <Stack
                    direction="row"
                    sx={{
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: 2,
                    }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: '500' }}>
                      {cat.name}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {cat.value}%
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    aria-label={`${cat.name}: ${cat.value}%`}
                    value={cat.value}
                    sx={{
                      [`& .${linearProgressClasses.bar}`]: {
                        backgroundColor: cat.color,
                      },
                    }}
                  />
                </Stack>
              </Stack>
            ))}
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
