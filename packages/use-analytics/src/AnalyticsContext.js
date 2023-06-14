import { createContext } from 'react'

const createNamedContext = name => {
  const context = createContext()
  context.displayName = name

  return context
}

const context = /* #__PURE__ */ createNamedContext('Analytics')
export default context
