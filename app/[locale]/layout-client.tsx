'use client';

import { ToastProvider } from '../components/ToastProvider';

export default function LocaleLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ToastProvider>{children}</ToastProvider>;
}
