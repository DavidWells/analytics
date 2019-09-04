# Analytics Form Utilities

Form utilities for [analytics](https://www.npmjs.com/package/analytics)

<!-- AUTO-GENERATED-CONTENT:START (TOC) -->
- [`onSubmit`](#onsubmit)
- [`onChange`](#onchange)
- [`listen`](#listen)
<!-- AUTO-GENERATED-CONTENT:END -->

## `onSubmit`

Listen to form submissions & do stuff with inputs.

This will incept form submissions & fire a custom callback before submitting the form normally

```js
import forms from 'analytic-util-forms'

// Add to single form
const formOne = document.querySelector("form[id=one]")
forms.onSubmit(formOne, (event, data) => {
  console.log('form', event.target)
  console.log('form data', JSON.stringify(data, null, 2))
})

// Add to single form with options
forms.onSubmit('form[id=two]', {
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
const cleanUpFuntion = forms.onSubmit('form[id=three]', (event, data) => {
  console.log('form', event.target)
  console.log('form data', JSON.stringify(data, null, 2))
})
cleanUpFuntion() // <-- call function to clean up listener


// Listen to all forms on page
forms.onSubmit('all', (event, data) => {
  console.log('form', event.target)
  console.log('form data', JSON.stringify(data, null, 2))
})
```

## `onChange`

Listen to form changes & do stuff with inputs.

```js
import forms from 'analytic-util-forms'

// Add to single form with no options
const formOne = document.querySelector("form[id=one]")
forms.onChange(formOne, (event, data) => {
  console.log('form', event.target)
  console.log('form data', JSON.stringify(data, null, 2))
})

// Add to single form with options
forms.onChange('form[id=two]', {
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
const cleanUpFuntion = forms.onChange('form[id=three]', (event, data) => {
  console.log('form', event.target)
  console.log('change data', JSON.stringify(data, null, 2))
})
cleanUpFuntion() // <-- call function to clean up listener

// Listen to all forms on page
forms.onChange('all', (event, data) => {
  console.log('form', event.target)
  console.log('form data', JSON.stringify(data, null, 2))
})
```

## `listen`

Listen will attach `onChange` & `onSubmit` listeners to forms

```js
import forms from 'analytic-util-forms'

// Add to single form with no options
const formOne = document.querySelector("form[id=one]")
forms.listen(formOne, (event, data, type) => {
  console.log('listen type', type)
  console.log('listen form', event.target)
  console.log('listen form data', JSON.stringify(data, null, 2))
})

// Listen to all forms with options
forms.listen({
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
