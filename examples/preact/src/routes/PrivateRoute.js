import { h } from 'preact'
import AsyncRoute from 'preact-async-route'
import { route } from 'preact-router'

function authenticate() {
  return new Promise((resolve, reject) => {
    if (typeof window !== "undefined" && !window.isLoggedIn) {
      throw new Error('no login')
    }
    return resolve(true)
  })
}

const PrivateRoute = (props) => {
  return (
    <AsyncRoute
      path={props.path}
      getComponent={() => {
        return authenticate()
          .then(() => () => {
            return props.component(props)
          })
          .catch(reason => {
            route(`/login#rurl=${props.url}`, true)
            return null
          })
      }}
    />
  )
}

export default PrivateRoute