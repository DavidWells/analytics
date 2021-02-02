// https://docs.aws.amazon.com/pinpoint/latest/developerguide/event-streams-data-app.html#event-streams-data-app-attributes

/* The endpoint began a new session. */
export const SESSION_START = '_session.start'
/* The endpoint ended a session. */
export const SESSION_STOP = '_session.stop'
/* The endpoint paused a session. Paused sessions can be resumed so that you can continue to collect metrics without starting an entirely new session. */
export const SESSION_PAUSE = '_session.pause'
/* The endpoint resumed a session. */
export const SESSION_RESUME = '_session.resume'
/* The endpoint logged in to your app. */
export const AUTH_SIGN_IN = '_userauth.sign_in'
/* A new endpoint completed the registration process in your app. */
export const AUTH_SIGN_UP = '_userauth.sign_up'
/* The endpoint attempted to sign in to your app, but wasn't able to complete the process. */
export const AUTH_FAIL = '_userauth.auth_fail'
/* The endpoint made a purchase in your app. */
export const ECOM_PURCHASE = '_monetization.purchase'
/* The pageview event */
export const PAGE_VIEW = 'pageView'
