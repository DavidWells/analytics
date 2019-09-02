import { onSubmit, addSubmitListeners } from './onSubmit'
import { onChange, addChangeListeners } from './onChange'

export function listen(form, opts, cb) {
  const listeners = [
    onSubmit(form, opts, cb),
    onChange(form, opts, cb)
  ]
  return () => {
    listeners.forEach((unsub) => {
      unsub()
    })
  }
}

export function listenAll(opts) {
  const doIt = [
    addChangeListeners(opts),
    addSubmitListeners(opts)
  ]

  return () => {
    doIt.forEach((unsub) => {
      unsub()
    })
  }
}
