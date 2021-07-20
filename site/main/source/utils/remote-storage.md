---
title: Remote Storage Utils
pageTitle: RemoteStorage Utils
description: Utility library for cross domain localStorage access.
---

Utilities for cross domain localStorage access.

## Basic Usage

```js
import RemoteStorage from '@analytics/remote-storage-utils'

// Connect to remote storage domain
const storage = new RemoteStorage('https://remote-site.com/storage.html')

// Get item
storage.getItem('the_remote_local_storage_key').then((value) => {
  console.log('value', value)
})

// Set item
storage.setItem({
  key: 'the_remote_local_storage_key',
  value: 'foobar'
}).then(() => {
  console.log('Value set')
})
```

## API

### `getItem`

Get localStorage from another domain

```js
import { RemoteStorage } from '@analytics/remote-storage-utils'

const remoteStorage = new RemoteStorage('https://remote-site.com/storage.html')

remoteStorage.getItem('the_remote_local_storage_key').then(() => {
  console.log('remote value is', value)
})
```

### `getRemoteItem`

You can also use the standalone `getRemoteItem` function with a cross storage client instance passed into it.

```js
import { getRemoteItem, CrossStorageClient } from '@analytics/remote-storage-utils'

// Create an instance to use in standalone functions
const storageInstance = new CrossStorageClient('https://remote-site.com/storage.html')

const localStorageKeys = [
  'the_remote_local_storage_key',
  'another_remote_local_storage_key',
  'xyz',
]

getRemoteItem(localStorageKeys, storageInstance).then((values) => {
  console.log('remote values', values)
})
```

### `setItem`

Set a localStorage value in remote domain

```js
import { RemoteStorage } from '@analytics/remote-storage-utils'

const remoteStorage = new RemoteStorage('https://remote-site.com/storage.html')

remoteStorage.setItem('the_remote_local_storage_key', 'foobar').then(() => {
  console.log('remote value stored')
})
```

You can also use the standalone `setRemoteItem` function with a cross storage client instance passed into it.

```js
import { setRemoteItem, CrossStorageClient } from '@analytics/remote-storage-utils'

// Create an instance to use in standalone functions
const storageInstance = new CrossStorageClient('https://remote-site.com/storage.html')

// Set remote value
setRemoteItem({
  key: 'foobar',
  value: JSON.stringify(userId)
}, storageInstance)

// Handler if values are different
function customConflictResolver(localValue, remoteValue) {
  if (localValue === remoteValue) {
    // Return empty to abort setting remote value
    return
  }
  if (remoteValue === 'cool') {
    // Return empty to abort setting remote value
    return
  }
  // Return value to set in remote
  return 'this-value-will-be-set'
}

setRemoteItem({
  key: 'baz',
  value: 123,
  resolve: customConflictResolver
}, crossStorage)
```
