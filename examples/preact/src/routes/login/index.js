import { h } from 'preact'
import Wrapper from '../../components/content'
import { route } from 'preact-router'

function parseHash(hash) {
  return hash
    .replace(/^#/, '')
    .split("&")
    .map(v => v.split("="))
    .reduce((pre, [key, value]) => ({ ...pre, [key]: value }), {})
}

function setLogin(prev) {
  let to = '/dashboard'
  if (typeof window !== "undefined") {
    const hash = parseHash(window.location.hash)
    to = hash.rurl || to
    window.isLoggedIn = true
  }
  route(to, true)
}

const Login = props => {
  console.log(props)
  const previousUrl = props.previous || props.prev || props.rurl
  return (
    <Wrapper>
      <h1>Please login</h1>
      <p>Login first to access your profile!</p>
      <button onClick={() => setLogin(previousUrl)}>
        Simulate login
      </button>
    </Wrapper>
  )
}

export default Login
