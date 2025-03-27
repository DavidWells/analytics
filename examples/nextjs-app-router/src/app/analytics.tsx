"use client";
import { PropsWithChildren, useEffect } from "react";
import Analytics from "analytics";
import { AnalyticsProvider } from "use-analytics";
import { usePathname, useSearchParams } from "next/navigation";
import googleAnalytics from '@analytics/google-analytics'

const analyticsInstance = Analytics({
  app: "nextjsexample",
  debug: true,
  plugins: [
    googleAnalytics({
        measurementIds: ['G-abc123']
      })
  ],
});

export default function AnalyticsComponent({ children }: PropsWithChildren) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    analyticsInstance.page();
  }, [pathname, searchParams]);

  return (
    <AnalyticsProvider instance={analyticsInstance}>
      {children}
    </AnalyticsProvider>
  );
}