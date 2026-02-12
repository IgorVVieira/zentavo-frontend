'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { driver, DriveStep } from 'driver.js';
import 'driver.js/dist/driver.css';
import { useTranslations } from 'next-intl';

const TOUR_STORAGE_KEY = 'zencash_tour_completed';

type TourPage = 'dashboard' | 'categories' | 'transactions' | 'import';

interface OnboardingTourProps {
  page: TourPage;
  onComplete?: () => void;
}

function getTourSteps(page: TourPage, t: (key: string) => string): DriveStep[] {
  const steps: Record<TourPage, DriveStep[]> = {
    dashboard: [
      {
        element: '[data-tour="dashboard"]',
        popover: {
          title: t('dashboard.welcome.title'),
          description: t('dashboard.welcome.description'),
          side: 'right',
          align: 'start',
        },
      },
      {
        element: '[data-tour="stat-cards"]',
        popover: {
          title: t('dashboard.stats.title'),
          description: t('dashboard.stats.description'),
          side: 'bottom',
          align: 'center',
        },
      },
      {
        element: '[data-tour="month-picker"]',
        popover: {
          title: t('dashboard.monthPicker.title'),
          description: t('dashboard.monthPicker.description'),
          side: 'bottom',
          align: 'end',
        },
      },
      {
        element: '[data-tour="charts"]',
        popover: {
          title: t('dashboard.charts.title'),
          description: t('dashboard.charts.description'),
          side: 'top',
          align: 'center',
        },
      },
      {
        element: '[data-tour="import"]',
        popover: {
          title: t('dashboard.import.title'),
          description: t('dashboard.import.description'),
          side: 'right',
          align: 'start',
        },
      },
    ],
    categories: [
      {
        element: '[data-tour="categories-title"]',
        popover: {
          title: t('categories.welcome.title'),
          description: t('categories.welcome.description'),
          side: 'bottom',
          align: 'start',
        },
      },
      {
        element: '[data-tour="categories-create"]',
        popover: {
          title: t('categories.create.title'),
          description: t('categories.create.description'),
          side: 'left',
          align: 'center',
        },
      },
      {
        element: '[data-tour="categories-grid"]',
        popover: {
          title: t('categories.grid.title'),
          description: t('categories.grid.description'),
          side: 'top',
          align: 'center',
        },
      },
    ],
    transactions: [
      {
        element: '[data-tour="transactions-title"]',
        popover: {
          title: t('transactions.welcome.title'),
          description: t('transactions.welcome.description'),
          side: 'bottom',
          align: 'start',
        },
      },
      {
        element: '[data-tour="transactions-filter"]',
        popover: {
          title: t('transactions.filter.title'),
          description: t('transactions.filter.description'),
          side: 'bottom',
          align: 'end',
        },
      },
      {
        element: '[data-tour="transactions-import"]',
        popover: {
          title: t('transactions.import.title'),
          description: t('transactions.import.description'),
          side: 'left',
          align: 'center',
        },
      },
      {
        element: '[data-tour="transactions-grid"]',
        popover: {
          title: t('transactions.grid.title'),
          description: t('transactions.grid.description'),
          side: 'top',
          align: 'center',
        },
      },
    ],
    import: [
      {
        element: '[data-tour="import-title"]',
        popover: {
          title: t('import.welcome.title'),
          description: t('import.welcome.description'),
          side: 'bottom',
          align: 'start',
        },
      },
      {
        element: '[data-tour="import-info"]',
        popover: {
          title: t('import.info.title'),
          description: t('import.info.description'),
          side: 'bottom',
          align: 'center',
        },
      },
      {
        element: '[data-tour="import-dropzone"]',
        popover: {
          title: t('import.dropzone.title'),
          description: t('import.dropzone.description'),
          side: 'top',
          align: 'center',
        },
      },
      {
        element: '[data-tour="import-steps"]',
        popover: {
          title: t('import.steps.title'),
          description: t('import.steps.description'),
          side: 'top',
          align: 'center',
        },
      },
    ],
  };

  return steps[page];
}

export default function OnboardingTour({ page, onComplete }: OnboardingTourProps) {
  const t = useTranslations('tour');
  const [shouldShowTour, setShouldShowTour] = useState(false);
  const driverRef = useRef<ReturnType<typeof driver> | null>(null);

  const startTour = useCallback(() => {
    const steps = getTourSteps(page, t);

    // Mark tour as completed early to prevent re-triggering on fast remounts
    const completedTours = JSON.parse(localStorage.getItem(TOUR_STORAGE_KEY) || '{}');
    localStorage.setItem(TOUR_STORAGE_KEY, JSON.stringify({ ...completedTours, [page]: true }));

    const driverObj = driver({
      showProgress: true,
      animate: true,
      allowClose: true,
      overlayColor: 'rgba(0, 0, 0, 0.75)',
      stagePadding: 4,
      stageRadius: 8,
      popoverClass: 'zencash-tour-popover',
      nextBtnText: t('next'),
      prevBtnText: t('prev'),
      doneBtnText: t('done'),
      progressText: '{{current}} / {{total}}',
      steps,
      onPopoverRender: (popover) => {
        const skipBtn = document.createElement('button');
        skipBtn.innerText = t('skip');
        skipBtn.className = 'driver-popover-skip-btn';
        skipBtn.onclick = () => {
          const completedTours = JSON.parse(localStorage.getItem(TOUR_STORAGE_KEY) || '{}');
          localStorage.setItem(TOUR_STORAGE_KEY, JSON.stringify({ ...completedTours, [page]: true }));
          driverObj.destroy();
          onComplete?.();
        };
        popover.footerButtons.prepend(skipBtn);
      },
      onDestroyed: () => {
        const completedTours = JSON.parse(localStorage.getItem(TOUR_STORAGE_KEY) || '{}');
        localStorage.setItem(TOUR_STORAGE_KEY, JSON.stringify({ ...completedTours, [page]: true }));
        onComplete?.();
      },
    });

    driverRef.current = driverObj;
    driverObj.drive();
  }, [t, onComplete, page]);

  useEffect(() => {
    const completedTours = JSON.parse(localStorage.getItem(TOUR_STORAGE_KEY) || '{}');
    if (!completedTours[page]) {
      // Small delay to ensure elements are rendered
      const timer = setTimeout(() => {
        setShouldShowTour(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [page]);

  useEffect(() => {
    if (shouldShowTour) {
      startTour();
      setShouldShowTour(false);
    }

    return () => {
      driverRef.current?.destroy();
      driverRef.current = null;
    };
  }, [shouldShowTour, startTour]);

  return null;
}

export function resetTour(page?: TourPage) {
  if (page) {
    const completedTours = JSON.parse(localStorage.getItem(TOUR_STORAGE_KEY) || '{}');
    const { [page]: _, ...rest } = completedTours;
    localStorage.setItem(TOUR_STORAGE_KEY, JSON.stringify(rest));
  } else {
    localStorage.removeItem(TOUR_STORAGE_KEY);
  }
}
