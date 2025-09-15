/**
 * Storage argument that indicates a storage operation should affect
 * ALL available storage mechanisms.  When use with getItem this returns
 * an object with a key for each available storage system and the value
 * stored there (if any).
 */
export const ALL: "all";

/**
 * Indicate a value should be loaded from or stored to the first available
 * storage system, with preference order:
 *
 * 1. localStorage
 * 2. cookies
 * 3. sessionStorage
 * 4. global variable
 *
 * When fetching a value the first value found that is not undefined will be returned,
 * when storing a value the first available storage mechanism will be used.
 */
export const ANY: "any";

/**
 * Indicate the storage operation should apply to the global variable.
 */
export const GLOBAL: "global";

/**
 * Indicates the storage operaiton should apply to localStorage
 */
export const LOCAL_STORAGE: "localStorage";

/**
 * Indicates the storage operation should apply to sessionStorage
 */
export const SESSION_STORAGE: "sessionStorage";

/**
 * Indicates the storage operation should use cookies
 */
export const COOKIE: "cookie";

/**
 * Helper function to set a cookie
 */
export function setCookie(
  name: string,
  value: string,
  ttl: number,
  path: string,
  domain: string,
  secure: boolean
): void;

/**
 * Helper function to get a cookie
 * @param name
 */
export function getCookie(name: string): string;

/**
 * Helper function to remove a cooke
 * @param name
 */
export function removeCookie(name: string): void;

/**
 * Global object used for the 'global' storage system
 */
export const globalContext: Record<string, any>;

/**
 * True if sessionStorage is allowed by the browser
 */
export function hasSessionStorage(): boolean;

/**
 * True if localStorage is allowed by the browser
 */
export function hasLocalStorage(): boolean;

/**
 * True if cookies are allowed by the browser
 */
export function hasCookies(): boolean;

/**
 * Get an item from storage.
 *
 * If storage is specified as ALL this returns an object with a key for each storage
 * system and the value found in that storage.
 *
 * @param key Key to look for
 * @param options Specify the preferred storage mechanism, either ANY, ALL, GLOBAL,
 *   LOCAL_STORAGE, COOKIE, or SESSION_STORAGE
 */
export function getItem(
  key: string,
  options?: { storage?: string } | string
): unknown;

/**
 * Save a value to storage.
 *
 * When storage is set to ANY this stores to the first available storage system in this order:
 *
 * 1. localStorage
 * 2. cookies
 * 3. sessionStorage
 * 4. global variable
 *
 * When storage is set to ALL, it will update all available storage systems.
 *
 * Otherwise, it uses only the specified storage system.
 */
export function setItem(
  key: string,
  value: unknown,
  options?: { storage?: string } | string
): void;

/**
 * Remove item from storage.  Removes from all storage systems by default.
 *
 * The return value has a key for each storage system the value was present
 * in and removed from, with the value that was there prior to removal.
 */
export function removeItem(
  key: string,
  options?: { storage?: string } | string
): {
  global?: any;
  localStorage?: any;
  sessionStorage?: any;
  cookie?: any;
};

export interface AnalyticsStorage {
  getItem(key: string, options?: { storage?: string } | string): unknown;
  setItem(
    key: string,
    value: unknown,
    options?: { storage?: string } | string
  ): void;
  removeItem(
    key: string,
    options?: { storage?: string } | string
  ): {
    global?: any;
    localStorage?: any;
    sessionStorage?: any;
    cookie?: any;
  };
}

/**
 * Default export can be used as the `storage` option to the analytics constructor.
 */
declare const _default: AnalyticsStorage;

export default _default;
