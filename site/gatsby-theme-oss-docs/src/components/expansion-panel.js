import PropTypes from 'prop-types'
import React, {useState} from 'react'
import styled from '@emotion/styled'
import {MdCheck, MdExpandLess, MdExpandMore} from 'react-icons/md'
import {colors} from 'gatsby-theme-base'
import {size, transparentize} from 'polished'

const Container = styled.div({
  marginBottom: '1.45rem',
  borderLeft: `2px solid ${colors.primary}`
})

const InnerContainer = styled.div({
  border: `1px solid ${colors.text4}`,
  borderLeft: 0,
  borderTopRightRadius: 4,
  borderBottomRightRadius: 4
})

const iconMargin = 8
const horizontalPadding = 16
const StyledButton = styled.button({
  display: 'flex',
  alignItems: 'center',
  width: '100%',
  padding: `12px ${horizontalPadding}px`,
  border: 0,
  fontSize: 16,
  color: colors.primary,
  lineHeight: 'calc(5/3)',
  textAlign: 'left',
  background: 'none',
  outline: 'none',
  cursor: 'pointer',
  ':hover': {
    backgroundColor: transparentize(0.95, 'black')
  },
  ':active': {
    backgroundColor: transparentize(0.9, 'black')
  },
  svg: {
    marginRight: iconMargin
  }
})

const iconSize = 24
const Content = styled.div({
  padding: `8px ${horizontalPadding + iconSize + iconMargin}px`,
  color: colors.text1,
  p: {
    fontSize: '1rem'
  }
})

const lineItemNumberSize = 24
const lineItemNumberOffset = lineItemNumberSize / 2
const ListItemNumber = styled.div(size(lineItemNumberSize), {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: `1px solid ${colors.primary}`,
  borderRadius: '50%',
  fontSize: 14,
  color: colors.primary,
  textAlign: 'center',
  backgroundColor: 'white',
  position: 'absolute',
  top: 0,
  left: lineItemNumberSize / -2
})

export const ExpansionPanelList = styled.ul({
  marginLeft: lineItemNumberOffset,
  borderLeft: `1px solid ${colors.primary}`,
  listStyle: 'none'
})

const StyledListItem = styled.li({
  marginBottom: 0,
  paddingLeft: lineItemNumberOffset + 8,
  fontSize: '1rem',
  lineHeight: 1.5,
  position: 'relative',
  ':not(:last-child)': {
    marginBottom: 28
  },
  h4: {
    lineHeight: 1.3
  }
})

export function ExpansionPanelListItem(props) {
  return (
    <StyledListItem>
      <ListItemNumber>
        {props.number === 'check' ? <MdCheck size={16} /> : props.number}
      </ListItemNumber>
      {props.children}
    </StyledListItem>
  )
}

ExpansionPanelListItem.propTypes = {
  number: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired
}

export function ExpansionPanel(props) {
  const [expanded, setExpanded] = useState(false)
  const Icon = expanded ? MdExpandLess : MdExpandMore
  return (
    <Container>
      <InnerContainer>
        <StyledButton onClick={() => setExpanded(!expanded)}>
          <Icon size={iconSize} />
          {props.title}
        </StyledButton>
        {expanded && <Content>{props.children}</Content>}
      </InnerContainer>
    </Container>
  )
}

ExpansionPanel.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.string.isRequired
}
