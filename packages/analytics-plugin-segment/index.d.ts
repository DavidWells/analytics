import type { AnalyticsPlugin } from 'analytics';

export type AnalyticsSegmentOptions = {
  /** Your segment write key */
  writeKey: string;

  flushAt?: number;
  
  /* Segment sdk config options. Docs https://bit.ly/2H2jJMb */
  flushInterval?: number;

  /** Disable loading segment for anonymous visitors */
  disableAnonymousTraffic?: boolean;

  /** Override the Segment snippet url, for loading via custom CDN proxy */
  customScriptSrc?: boolean;

  /** Enable/disable segment destinations https://bit.ly/38nRBj3 */
  integrations?: Record<string, boolean>;
};

export default function AnalyticsSegment(options: AnalyticsSegmentOptions): AnalyticsPlugin;
