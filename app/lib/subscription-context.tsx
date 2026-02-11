'use client';

import * as React from 'react';

interface SubscriptionContextValue {
  hasSubscription: boolean;
}

const SubscriptionContext = React.createContext<SubscriptionContextValue>({
  hasSubscription: false,
});

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const base64 = token.split('.')[1];
    if (!base64) return null;
    const json = atob(base64.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function SubscriptionProvider({
  children,
  token,
}: {
  children: React.ReactNode;
  token: string | null;
}) {
  const hasSubscription = React.useMemo(() => {
    if (!token) return false;
    const payload = decodeJwtPayload(token);
    return payload?.hasSubscription === true;
  }, [token]);

  return (
    <SubscriptionContext.Provider value={{ hasSubscription }}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  return React.useContext(SubscriptionContext);
}
