import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !routing.locales.includes(locale as 'pt-br' | 'en')) {
    locale = routing.defaultLocale;
  }

  const namespaces = [
    'common',
    'landing',
    'dashboard',
    'transactions',
    'categories',
    'import',
    'profile',
    'datagrid',
    'tour',
  ] as const;

  const messageModules = await Promise.all(
    namespaces.map((ns) =>
      import(`../messages/${locale}/${ns}.json`).then((m) => [ns, m.default] as const),
    ),
  );

  const messages: Record<string, Record<string, unknown>> = {};
  for (const [ns, mod] of messageModules) {
    messages[ns] = mod;
  }

  return { locale, messages };
});
