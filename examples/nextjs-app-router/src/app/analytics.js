"use client";
import { useEffect, Suspense } from "react";
import Analytics from "analytics";
import { AnalyticsProvider } from "use-analytics";
import { usePathname, useSearchParams } from "next/navigation";
import googleAnalytics from '@analytics/google-analytics'

const analyticsInstance = Analytics({
  app: "nextjs-app-router",
  debug: true,
  plugins: [
    googleAnalytics({
      measurementIds: ['G-abc123']
    }),
    {
      name: 'logger',
      trackPageViews: true,
      page: (payload) => {
        console.log('Page view fired', payload);
      },
      track: (payload) => {
        console.log('Track fired', payload);
      }
    }
  ],
});

function AnalyticsPageViews() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    analyticsInstance.page();
  }, [pathname, searchParams]);

  return null;
}

/**
 * Analytics component that provides analytics functionality
 * @returns {JSX.Element}
 */
export default function AnalyticsProviderWrapper({ children }) {
  return (
    <AnalyticsProvider instance={analyticsInstance}>
      {children}
      <Suspense fallback={null}>
        <AnalyticsPageViews />
      </Suspense>
    </AnalyticsProvider>
  );
}