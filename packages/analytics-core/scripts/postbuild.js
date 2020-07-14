const fs = require('fs')
const path = require('path')

const filePath = path.join(__dirname, '..', 'dist/@analytics/core.min.js')

// TODO map to urls
const strings = [
  /* 'Reducer "'+t+"\ */' returned undefined during initialization. ',
  'Invalid attempt to spread non-iterable instance',
  'Expected listener to be a function.',
  'Actions must be plain objects. Use custom middleware for async actions.',
  'Expected the observer to be an object.',
  "returned undefined when probed with a random type. Don't try to handle",
  'or other actions in "redux/*" namespace. They are considered private. Instead, you must return the current state for any unknown actions, unless it is undefined, in which case you must return the initial state, regardless of the action type. The initial state may not be undefined, but can be null.',
  'returned undefined. To ignore an action, you must explicitly return the previous state. If you want this reducer to hold no value, you can return null instead of undefined.',
  'Expected the reducer to be a function.',
  "If the state passed to the reducer is undefined, you must explicitly return the initial state. The initial state may not be undefined. If you don't want to set a value for this reducer, you can use null instead of undefined.",
  "returned undefined during initialization. If the state passed to the reducer is undefined, you must explicitly return the initial state. The initial state may not be undefined. If you don't want to set a value for this reducer, you can use null instead of undefined.",
  'Actions may not have an undefined "type" property. Have you misspelled a constant?',
  'Cannot call a class as a function',
  'Expected the enhancer to be a function.',
  'Expected the nextReducer to be a function.',
  "The iterator does not provide a 'throw' method",
  'Invalid attempt to destructure non-iterable instance',
  'iterator result is not an object',
  'Generator is already running',
  'try statement without catch or finally',
  'illegal catch attempt',
  'Reducers may not dispatch actions.'
]

const coreStrings = [
  'Trying to dispatch analytics reservedAction ',
  'Abort not allowed from listener'
]

const contents = fs.readFileSync(filePath, 'utf-8')

const newContents = strings.reduce((acc, curr) => {
  acc = acc.replace(curr, '')
  return acc
}, contents)

console.log(`Update file browser dist`, filePath)

fs.writeFileSync(filePath, newContents)
