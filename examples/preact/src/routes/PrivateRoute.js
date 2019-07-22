import { h, Component } from 'preact'
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

class PrivateRoute extends Component {
  render() {
    return (
      <AsyncRoute
        path={this.props.path}
        getComponent={() => {
          return authenticate()
            .then(() => () => {
              return this.props.component(this.props)
            })
            .catch(reason => {
              route(`/login#rurl=${this.props.url}`, true)
              return null
            })
        }}
      />
    )
  }
}

export default PrivateRoute
