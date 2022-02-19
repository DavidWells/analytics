---
title: Javascript URL utils
pageTitle: URL Utils
description: Utility library for working with URLs
---

A tiny utility library for working with URLs in <!-- AUTO-GENERATED-CONTENT:START (pkgSize) -->`2.53kb`<!-- AUTO-GENERATED-CONTENT:END -->.

This library will work with [analytics](https://getanalytics.io) or as a standalone package.

[See live demo](https://utils-url.netlify.app/).

### Why this package?

This package makes it a little easy to work with URLs

## How to install

Install `@analytics/url-utils` from [npm](https://www.npmjs.com/package/@analytics/url-utils).

```bash
npm install @analytics/url-utils
```

## API

Below is the api for `@analytics/url-utils`.

## `parseUrl`

Parse a url parts

```js
import { parseUrl } from '@analytics/url-utils'

parseUrl('https://www.cool.com/my-path/here?hello=true#my-hash=cool')
/*
{
  protocol: 'https',
  hostname: 'www.cool.com',
  port: '',
  path: '/my-path/here',
  query: 'hello=true',
  hash: 'my-hash=cool'
}
*/
```

## `getHost`

Get host domain of url

```js
import { getHost } from '@analytics/url-utils'

getHost('https://subdomain.my-site.com/')
// subdomain.my-site.com
```

## `getDomain`

Get domain of url

```js
import { getDomain } from '@analytics/url-utils'

getDomain('https://subdomain.my-site.com/')
// my-site.com
```

## `getSubDomain`

Get sub-domain of url

```js
import { getSubDomain } from '@analytics/url-utils'

getSubDomain('https://subdomain.my-site.com/')
// subdomain
```

## `trimTld`

Trim TLD from domain name

```js
import { trimTld } from '@analytics/url-utils'

trimTld('my-site.com')
// my-site
```

### Alternative libs

- If in node.js context, you can also use the native `url` module