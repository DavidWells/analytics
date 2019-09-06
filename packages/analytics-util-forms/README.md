# Form Utilities

Form utilities functions for [analytics](https://www.npmjs.com/package/analytics)

<!-- AUTO-GENERATED-CONTENT:START (TOC) -->
- [`onSubmit`](#onsubmit)
- [`onChange`](#onchange)
- [`listen`](#listen)
- [`submitForm`](#submitform)
- [`getFormData`](#getformdata)
- [`getInputData`](#getinputdata)
- [`filterData`](#filterdata)
<!-- AUTO-GENERATED-CONTENT:END -->

## `onSubmit`

Listen to form submissions & do stuff with inputs.

This will incept form submissions & fire a custom callback before submitting the form normally

```js
import { onSubmit } from 'analytic-util-forms'

// Add to single form
const formOne = document.querySelector("form[id=one]")
onSubmit(formOne, (event, data) => {
  console.log('form', event.target)
  console.log('form data', JSON.stringify(data, null, 2))
})

// Add to single form with options
onSubmit('form[id=two]', {
  /* Turn on debug to disable submissions and see values */
  debug: true,
  /* Turn off sensitive values filter */
  disableFilter: false,
  //* // Exclude field by name or regex pattern of name attribute
  excludeFields: [
    /private/,
    'shhhh'
  ],
  /* Custom filter function. Return false to exclude data */
  filter: (fieldName, value) => {
    if (fieldName === 'hello') {
      return false
    }
    // credit card number
    if (value.match(/^\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}$/)) {
      return false
    }
    return true
  }
}, (event, data) => {
  console.log('form', event.target)
  console.log('form data', JSON.stringify(data, null, 2))
})

// Remove onSubmit listener
const cleanUpFuntion = onSubmit('form[id=three]', (event, data) => {
  console.log('form', event.target)
  console.log('form data', JSON.stringify(data, null, 2))
})
cleanUpFuntion() // <-- call function to clean up listener


// Listen to all forms on page
onSubmit('all', (event, data, meta) => {
  console.log('form', event.target)
  console.log('form data', JSON.stringify(data, null, 2))
})
```

## `onChange`

Listen to form changes & do stuff with inputs.

```js
import { onChange } from 'analytic-util-forms'

// Add to single form with no options
const formOne = document.querySelector("form[id=one]")
onChange(formOne, (event, data) => {
  console.log('form', event.target)
  console.log('form data', JSON.stringify(data, null, 2))
})

// Add to single form with options
onChange('form[id=two]', {
  /* Turn on debug to disable submissions and see values */
  debug: true,
  /* Turn off sensitive values filter */
  disableFilter: false,
  //* // Exclude field by name or regex pattern of name attribute
  excludeFields: [
    /private/,
    'shhhh'
  ],
  /* Custom filter function. Return false to exclude data */
  filter: (fieldName, value) => {
    if (fieldName === 'hello') {
      return false
    }
    // credit card number
    if (value.match(/^\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}$/)) {
      return false
    }
    return true
  }
}, (event, data) => {
  console.log('form', event.target)
  console.log('change data', JSON.stringify(data, null, 2))
})

// Remove onChange listener
const cleanUpFuntion = onChange('form[id=three]', (event, data) => {
  console.log('form', event.target)
  console.log('change data', JSON.stringify(data, null, 2))
})
cleanUpFuntion() // <-- call function to clean up listener

// Listen to all forms on page
onChange('all', (event, data) => {
  console.log('form', event.target)
  console.log('form data', JSON.stringify(data, null, 2))
})
```

## `listen`

Listen will attach `onChange` & `onSubmit` listeners to forms

```js
import { listen } from 'analytic-util-forms'

// Add to single form with no options
const formOne = document.querySelector("form[id=one]")
listen(formOne, (event, data, type) => {
  console.log('listen type', type)
  console.log('listen form', event.target)
  console.log('listen form data', JSON.stringify(data, null, 2))
})

// Listen to all forms with options
listen({
  /* Turn on debug to disable submissions and see values */
  debug: true,
  /* Turn off sensitive values filter */
  disableFilter: false,
  /* Custom functionality handler for onSubmit */
  onSubmit: (event, data) => {
    console.log('submit form', event.target)
    console.log('submit data', JSON.stringify(data, null, 2))
  },
  onChange: (event, data) => {
    console.log('change form', event.target)
    console.log('change data', JSON.stringify(data, null, 2))
  },
  /* Include only specific forms. This negates 'all'
  includeForms: [
    'form[id=content-form]',
    window.document.forms[1]
  ],
  /**/
  /* Exclude forms by selectors or node.
  excludeForms: [
    'form[name=two]',
    window.document.forms[2]
  ],
  /**/
  //* // Exclude field by name or regex pattern of name attribute
  excludeFields: [
    /private/,
    'shhhh'
  ],
  /**/
  //* // Custom filter function
  filter: (fieldName, value) => {
    if (fieldName === 'hello') {
      return false
    }
    // credit card number
    if (value.match(/^\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}$/)) {
      return false
    }
    return true
  }
  /**/
})
```

## `submitForm`

Submit form via JS

```js
import { listen } from 'analytic-util-forms'

```

## `getFormData`

Get values from form inputs

```js
import { getFormData } from 'analytic-util-forms'

const form = document.querySelector("form[id=one]")
const data = getFormData(form)
console.log('data', JSON.stringify(data, null, 2))
```

## `getInputData`

Get value from single form input

```js
import { getInputData } from 'analytic-util-forms'

const form = document.querySelector("form[id=one]")
const inputName = 'email'
const inputData = getInputData(form, inputName)
console.log('inputData', JSON.stringify(inputData, null, 2))
```

## `filterData`

Filter out & omit sensitive fields

```js
import { getFormData, getInputData, filterData } from 'analytic-util-forms'

const form = document.querySelector("form[id=one]")
const inputName = 'email'
const rawData = getFormData(form, inputName)
console.log('rawData', JSON.stringify(rawData, null, 2))

const redactedData = filterData(rawData, {
  /* Exclude field by name or regex pattern of name attribute */
  excludeFields: [
    /regex/,
    'name-attribute'
  ],
  /* Custom filter function */
  filter: (fieldName, value) => {
    if (fieldName === 'hello') {
      return false
    }
    // credit card number
    if (value.match(/^\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}$/)) {
      return false
    }
    return true
  }
})
console.log('redactedData', JSON.stringify(redactedData, null, 2))
```
