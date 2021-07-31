<!--
title: Javascript session utils
pageTitle: Session utils
description: Session library for user sessions
-->

# Session Utilities

A tiny session utility library in <!-- AUTO-GENERATED-CONTENT:START (pkgSize) -->`775 bytes`<!-- AUTO-GENERATED-CONTENT:END -->.

- Persisted Sessions - saved as cookie for 30min
  - `getSession`
  - `setSession` 
- Tab Sessions - saved until tab/window closed
  - `getTabSession`
  - `setTabSession`
- Page Sessions - saved until page changes
  - `getPageSession`
  - `setPageSession`

[See live demo](https://utils-sessions.netlify.app).

## Example

```js
import { getSession, setSession } from '@analytics/session-utils'

const currentSession = getSession()
console.log('currentSession', currentSession)

// Update session
const newSessionInfo = setSession()
console.log('newSessionInfo', newSessionInfo)
```

## About

```
┌─────────────────────────────────────────────────────────────────┐
│                        Persisted Session                        │
│                                                                 │
│   ┌──────────────────────────┐    ┌──────────────────────────┐  │
│   │       Tab Session        │    │       Tab Session        │  │
│   │                          │    │                          │  │
│   │  ┌────────────────────┐  │    │  ┌────────────────────┐  │  │
│   │  │    Page Session    │  │    │  │    Page Session    │  │  │
│   │  │                    │  │    │  │                    │  │  │
│   │  │                    │  │    │  │                    │  │  │
│   │  │                    │  │    │  │                    │  │  │
│   │  │                    │  │    │  │                    │  │  │
│   │  │                    │  │    │  │                    │  │  │
│   │  │                    │  │    │  │                    │  │  │
│   │  │                    │  │    │  │                    │  │  │
│   │  │                    │  │    │  │                    │  │  │
│   │  └────────────────────┘  │    │  └────────────────────┘  │  │
│   └──────────────────────────┘    └──────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```