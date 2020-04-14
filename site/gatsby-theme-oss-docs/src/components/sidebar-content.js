import PropTypes from 'prop-types'
import React from 'react'
import SelectLink from './select-link'
import styled from '@emotion/styled'
import {
  GA_EVENT_CATEGORY_SIDEBAR,
  getVersionBasePath,
  trackEvent
} from '../utils'
import { SidebarNav, colors, headerHeight } from 'gatsby-theme-base'

const ContentHeader = styled.h4({
  color: colors.primary,
  backgroundColor: 'rgba(255, 255, 255, 0.85)',
  position: 'sticky',
  top: headerHeight
})

function handleToggleAll(expanded) {
  trackEvent({
    eventCategory: GA_EVENT_CATEGORY_SIDEBAR,
    eventAction: 'toggle all',
    eventLabel: expanded ? 'expand' : 'collapse'
  })
}

function handleToggleCategory(title, expanded) {
  trackEvent({
    eventCategory: GA_EVENT_CATEGORY_SIDEBAR,
    eventAction: 'toggle category',
    eventLabel: title,
    eventValue: Number(expanded)
  })
}

const customSideBarTitles = {
  'Analytics Documentation': 'About',
  'Analytics Plugins': '- Using Plugins',
  'React hooks for analytics': '- React hooks',
  'Request an analytics integration': <b>{'👋'} Request a plugin</b>,
}

export default function SidebarContent(props) {
  const sideBarContents = props.contents.reduce((acc, curr) => {
    const newPages = curr.pages.map((x) => {
      // console.log('x', x)
      const theTitle = x.menuTitle || x.pageTitle || x.title
      // check if top level nav for prefix
      const prefix = (!curr.title) ? '' : '- '
      // map custom names
      const newTitle = customSideBarTitles[theTitle] || `${prefix}${theTitle}`
      return {
        title: newTitle,
        path: x.path
      }
    })
    acc = acc.concat({
      ...curr,
      ...{ pages: newPages }
    })
    return acc
  }, [])
  return (
    <div className="sidebar">
      <ContentHeader>
        <pre style={{
          color: '#f25cc1',
          background: '#EBEEF0',
          padding: '15px',
          fontSize: '14px',
          margin: 0,
          paddingLeft: '25px',
          marginLeft: '-25px'
        }}>
          npm install analytics
        </pre>
        {/*
        <HeaderInner>

          <HeaderText className="title-sidebar">
            {props.title}
          </HeaderText>

          {props.versions.length > 0 && (
            <SelectLink
              useLink
              size="small"
              variant="hidden"
              isPathActive={props.isPathActive}
              options={[
                {
                  text: props.defaultVersion
                    ? getVersionLabel(props.defaultVersion)
                    : 'Latest',
                  value: '/'
                }
              ].concat(
                props.versions.map(version => ({
                  text: getVersionLabel(version),
                  value: getVersionBasePath(version)
                }))
              )}
            />
          )}
        </HeaderInner>
        */}
      </ContentHeader>
      <SidebarNav
        contents={sideBarContents}
        pathname={props.pathname}
        onToggleAll={handleToggleAll}
        onToggleCategory={handleToggleCategory}
      />
    </div>
  )
}

SidebarContent.propTypes = {
  title: PropTypes.string.isRequired,
  contents: PropTypes.array.isRequired,
  pathname: PropTypes.string.isRequired,
  isPathActive: PropTypes.func.isRequired,
  defaultVersion: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  versions: PropTypes.array.isRequired
}
