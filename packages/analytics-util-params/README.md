# Param utilities

URI param utilities for [analytics](https://www.npmjs.com/package/analytics)

`getParams`, `removeParams`, `replaceParams`

## `getParams`

```js
import { getParams } from '@analytics/param-utils'

/* Get url params */
const params = getParams()
```

## `removeParams`

```js
import { removeParams } from '@analytics/param-utils'

/* Get url params */
removeParams('foo')
```

## `replaceParams`

```js
import { replaceParams } from '@analytics/param-utils'

// Replace
replaceParams('foo')
```


## Params Parse benchmark

```
Decode:
@analytics/param-utils x 189,959 ops/sec ±0.91% (91 runs sampled)
qs                     x 152,998 ops/sec ±1.41% (90 runs sampled)
querystringify         x 240,017 ops/sec ±1.32% (90 runs sampled)
query-string           x 172,217 ops/sec ±0.67% (91 runs sampled)
native                 x 179,175 ops/sec ±0.88% (88 runs sampled)
qss                    x 391,393 ops/sec ±0.99% (91 runs sampled)
```

## Details

[Open API Query Params](https://github.com/OAI/OpenAPI-Specification/issues/1706)
[Query API ref](https://docs.directus.io/api/reference.html#filtering)
[jQuery Param](https://api.jquery.com/jquery.param/)
[URL spec](https://url.spec.whatwg.org/#url-query-string)
[](https://www.moesif.com/blog/technical/api-design/REST-API-Design-Best-Practices-for-Parameters-and-Query-String-Usage/#)
