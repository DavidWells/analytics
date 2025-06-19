"use client";
import { useEffect, Suspense } from "react";
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

function AnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    analyticsInstance.page();
  }, [pathname, searchParams]);

  return null;
}

/**
 * Analytics wrapper component that provides analytics instance to children
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {JSX.Element}
 */
export default function AnalyticsComponent({ children }) {
  return (
    <AnalyticsProvider instance={analyticsInstance}>
      <Suspense fallback={null}>
        <AnalyticsTracker />
      </Suspense>
      {children}
    </AnalyticsProvider>
  );
}