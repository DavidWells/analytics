import breakpoints from '../utils/breakpoints'
import styled from '@emotion/styled'
import {colors} from '../utils/colors'

export const headerHeight = 64
const Header = styled.header({
  display: 'flex',
  alignItems: 'center',
  flexShrink: 0,
  height: headerHeight,
  padding: '0 24px',
  color: colors.primary,
  backgroundColor: 'white',
  position: 'sticky',
  top: 0,
  zIndex: 1
})

export default Header

export const MobileHeader = styled(Header)({
  display: 'none',
  [breakpoints.md]: {
    display: 'flex'
  }
})

export const DesktopHeader = styled(Header)({
  [breakpoints.md]: {
    display: 'none'
  }
})
