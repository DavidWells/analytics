import breakpoints from '../utils/breakpoints'
import styled from '@emotion/styled'

export default styled.div({
  padding: '40px 64px',
  [breakpoints.md]: {
    padding: '32px 48px'
  },
  [breakpoints.sm]: {
    padding: '24px 20px'
  }
})
