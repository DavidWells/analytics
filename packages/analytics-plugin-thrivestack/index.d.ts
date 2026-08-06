// Type definitions for @analytics/thrivestack
// Project: https://github.com/DavidWells/analytics/tree/master/packages/analytics-plugin-thrivestack

import { AnalyticsPlugin } from 'analytics'

/**
 * ThriveStack plugin configuration options
 */
export interface ThriveStackConfig {
  /** ThriveStack API key (required) */
  apiKey: string;
  /** API endpoint */
  apiEndpoint?: string;
  /** Whether to respect DNT browser setting */
  respectDoNotTrack?: boolean;
  /** Automatically track click events */
  trackClicks?: boolean;
  /** Automatically track form submissions */
  trackForms?: boolean;
  /** Enable consent management */
  enableConsent?: boolean;
  /** Default consent value */
  defaultConsent?: boolean;
  /** Source identifier */
  source?: string;
  /** Number of events to batch together */
  batchSize?: number;
  /** Interval in ms for processing event queue */
  batchInterval?: number;
  /** Additional options for ThriveStack */
  options?: ThriveStackOptions;
}

/**
 * ThriveStack options
 */
export interface ThriveStackOptions {
  /** Enable debug mode */
  debug?: boolean;
  /** Custom API URL */
  apiUrl?: string;
  /** Timestamp override */
  timestamp?: string;
  /** User ID */
  userId?: string;
  /** Group ID */
  groupId?: string;
  /** Source identifier */
  source?: string;
  /** Any other custom options */
  [key: string]: any;
}

/**
 * Group traits
 */
export interface GroupTraits {
  /** Group name */
  name?: string;
  /** Group type */
  group_type?: string;
  /** Any other traits */
  [key: string]: any;
}

/**
 * Group identify options
 */
export interface GroupIdentifyOptions {
  /** User ID */
  userId?: string;
  /** User ID (alternative format) */
  user_id?: string;
  /** Timestamp */
  timestamp?: string;
  /** Source identifier */
  source?: string;
  /** Any other options */
  [key: string]: any;
}

/**
 * API config options
 */
export interface ApiConfigOptions {
  /** API key */
  apiKey?: string;
  /** Custom API URL */
  apiUrl?: string;
  /** Source identifier */
  source?: string;
  /** Any other config options */
  [key: string]: any;
}

/**
 * UTM parameters
 */
export interface UtmParameters {
  /** UTM campaign */
  utm_campaign: string | null;
  /** UTM medium */
  utm_medium: string | null;
  /** UTM source */
  utm_source: string | null;
  /** UTM term */
  utm_term: string | null;
  /** UTM content */
  utm_content: string | null;
}

/**
 * ThriveStack Plugin API methods
 */
export interface ThriveStackMethods {
  /** Group identify method */
  groupIdentify(
    groupId: string, 
    traits?: GroupTraits, 
    options?: GroupIdentifyOptions, 
    callback?: (error: Error | null, result?: any) => void
  ): Promise<any>;

  /** Set API configuration */
  setApiConfig(config?: ApiConfigOptions): boolean;
  
  /** Set user consent settings */
  setConsent(category: 'functional' | 'analytics' | 'marketing', enabled: boolean): boolean;
  
  /** Enable debug mode */
  enableDebugMode(): boolean;
  
  /** Get device ID */
  getDeviceId(): string | null;
  
  /** Get session ID */
  getSessionId(): string | null;
  
  /** Get user ID */
  getUserId(): string | null;
  
  /** Get group ID */
  getGroupId(): string | null;
  
  /** Get source */
  getSource(): string | null;
  
  /** Set source */
  setSource(source: string): boolean;
  
  /** Get UTM parameters */
  getUtmParameters(): UtmParameters;
  
  /** Get ThriveStack instance (escape hatch) */
  getThriveStackInstance(): any;
}

/**
 * ThriveStack Analytics plugin for browser & node
 * @param config - Plugin configuration
 * @returns Analytics plugin
 */
declare function thriveStackPlugin(config: ThriveStackConfig): AnalyticsPlugin & {
  methods: ThriveStackMethods
};

export default thriveStackPlugin