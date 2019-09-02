# Analytics Form Utilities

Form utilities for [analytics](https://www.npmjs.com/package/analytics)

## `onSubmit`

Listen to form submissions & do stuff with inputs.

This will incept form submissions & fire a custom callback before submitting the form normally

```js
import { onSubmit } from 'analytic-util-forms'

// No options
const formOne = document.querySelector("form[id=one]")
onSubmit(formOne, (event, data) => {
  console.log('form', event.target)
  console.log('form data', JSON.stringify(data, null, 2))
})

// With options
const formTwo = document.querySelector("form[id=two]")
onSubmit(formTwo, {
  excludeFields: [
    /exclude-regex/,
  ],
}, (event, data) => {
  console.log('form', event.target)
  console.log('form data', JSON.stringify(data, null, 2))
})

// Remove listener
const formThree = document.querySelector("form[id=three]")
const listener = onSubmit(formThree, (event, data) => {
  console.log('form', event.target)
  console.log('form data', JSON.stringify(data, null, 2))
})
listener() // <-- call function to clean up listener
```

## `onChange`

Listen to form changes & do stuff with inputs.

```js
import { onChange } from 'analytic-util-forms'

// No options
const formOne = document.querySelector("form[id=one]")
onChange(formOne, (event, data) => {
  console.log('form', event.target)
  console.log('form data', JSON.stringify(data, null, 2))
})

// With options
const formTwo = document.querySelector("form[id=two]")
const listenerOptions =  {
  excludeFields: [
    /exclude-regex/,
  ],
  // custom filter function
  filter: (fieldName, value) => {
    if (fieldName === 'badthing') {
      return false
    }
    return true
  }
}
onChange(formTwo, listenerOptions, (event, data) => {
  console.log('form', event.target)
  console.log('form data', JSON.stringify(data, null, 2))
})

// Remove listener
const formThree = document.querySelector("form[id=three]")
const listener = onChange(formThree, (event, data) => {
  console.log('form', event.target)
  console.log('form data', JSON.stringify(data, null, 2))
})
listener() // <-- call function to clean up listener
```
