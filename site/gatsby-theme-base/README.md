# gatsby-theme-apollo

This is the base theme for building Apollo-branded Gatsby sites. It contains a small amount of configuration, and a handful of components that make it easy to build consistent-looking UIs.

It comes with a few Gatsby plugins:

 - `gatsby-plugin-svgr` enables [importing SVGs as React components](https://www.gatsbyjs.org/packages/gatsby-plugin-svgr)
 - `gatsby-plugin-emotion` server renders your [Emotion](https://emotion.sh) styles
 - `gatsby-plugin-react-helmet` server renders `<head>` tags set with [React Helmet](https://github.com/nfl/react-helmet)
 - `gatsby-plugin-typography` provides a stylesheet reset and sets default styles for basic HTML elements

## Table of contents

- [Installation](#installation)
- [Configuration](#configuration)
- [Components and utilities](#components-and-utilities)
  - [Layout](#layout)
  - [Header](#header)
  - [Sidebar](#sidebar)
  - [SidebarNav](#sidebarnav)
  - [ResponsiveSidebar](#responsivesidebar)
  - [LogoTitle](#logotitle)
  - [colors](#colors)
  - [breakpoints](#breakpoints)
- [Examples](#examples)

## Installation

```bash
$ npm install gatsby gatsby-theme-apollo
```

## Configuration

```js
// gatsby-config.js
module.exports = {
  __experimentalThemes: [
    {
      resolve: 'gatsby-theme-apollo',
      options: {
        root: __dirname
      }
    }
  ],
  siteMetadata: {
    title: 'Apollo rocks!',
    description: 'Gatsby themes are pretty cool too...'
  }
};
```

## Components and utilities

All of the React components and utilities documented here are available as named exports in the `gatsby-theme-apollo` package. You can import them like this:

```js
import {MenuButton, Sidebar, breakpoints} from 'gatsby-theme-apollo';
```

### Layout

`Layout` should wrap every page that gets created. It configures [React Helmet](https://github.com/nfl/react-helmet) and sets the meta description tag with data from the `siteMetadata` property in your Gatsby config. It also sets the favicon for the page to the Apollo "A" logo.

```js
import {Layout} from 'gatsby-theme-apollo';

function MyPage() {
  return (
    <Layout>
      Hello world
    </Layout>
  );
}
```

| Prop name | Type | Required |
| --------- | ---- | -------- |
| children  | node | yes      |

### Header

A sticky header component with a white background and our brand primary, ![#220a82](https://placehold.it/15/220a82/000000?text=+) `#220a82` as the font color.

```js
import {Layout, Header} from 'gatsby-theme-apollo';

function MyPage() {
  return (
    <Layout>
      <Header>Main nav goes up here</Header>
    </Layout>
  );
}
```

`MobileHeader` and `DesktopHeader` components are also exported, and can be used to easily render headers with different content depending on the window size.

```js
import {Layout, MobileHeader, DesktopHeader} from 'gatsby-theme-apollo';

function MyPage() {
  return (
    <Layout>
      <MobileHeader>
        This is only shown on mobile
        <HamburgerMenu />
      </MobileHeader>
      <DesktopHeader>
        <Logo />
        This is only shown on desktop
        <HorizontalMenu />
      </DesktopHeader>
    </Layout>
  );
}
```

| Prop name | Type | Required |
| --------- | ---- | -------- |
| children  | node | yes      |

### Sidebar

A component that renders a sidebar with a [`LogoTitle`](#logo-title) component in the top left corner. It can also be configured to collapse into the left side of the page on narrow windows.

```js
import {Layout, Sidebar} from 'gatbsy-theme-apollo';

function MyPage() {
  return (
    <Layout>
      <Sidebar>
        Sidebar content goes here
      </Sidebar>
    </Layout>
  );
}
```

| Prop name  | Type | Required | Description                                                                      |
| ---------- | ---- | -------- | -------------------------------------------------------------------------------- |
| children   | node | yes      |                                                                                  |
| responsive | bool | no       | If `true`, the sidebar will behave as a drawer absolutely positioned on the left |
| open       | bool | no       | Controls the sidebar visibility when the `responsive` prop is `true`             |
| noLogo     | bool | no       | If `true`, the logo next to the site title at the top left will be hidden        |

### SidebarNav

A configurable two-tiered, expandable/collapsible navigation component for use in conjunction with the `Sidebar` component above. It accepts a `contents` prop that defines what links and collapsible sections get rendered. Here's an example of the expected shape of a `contents` prop:

```js
const contents = [
  {
    title: 'Getting started',
    path: '/'
  },
  {
    title: 'External link',
    path: 'https://apollographql.com',
    anchor: true
  },
  {
    title: 'Advanced features',
    pages: [
      {
        title: 'Schema stitching',
        path: '/advanced/schema-stitching'
      }
    ]
  }
];
```

Each element in the array can have `title`, `path`, `pages`, and `anchor` props. `pages` is an array of more elements with the same shape. By default, a [Gatsby `Link` component](https://www.gatsbyjs.org/docs/gatsby-link/) will be used to render the links, but you can use a regular HTML anchor tag (`<a>`) by passing the `anchor` property to `true` on any page object.

The `SidebarNav` component gives the currently selected page an "active" style, and if it's a subpage, it will keep the currently active section expanded. To facilitate this, you must pass the current path to the `pathname` prop. Luckily, Gatsby exposes this in the `location` prop that gets passed automatically to every page!

```js
import {Layout, Sidebar, SidebarNav} from 'gatsby-theme-apollo';

function MyPage(props) {
  return (
    <Layout>
      <Sidebar>
        <SidebarNav
          contents={contents}
          pathname={props.location.pathname}
        />
      </Sidebar>
    </Layout>
  );
}
```

| Prop name      | Type   | Required | Description                                                       |
| -------------- | ------ | -------- | ----------------------------------------------------------------- |
| contents       | array  | yes      | An array of items to render                                       |
| pathname       | string | yes      | The current path (`props.location.pathname` expected)             |
| alwaysExpanded | bool   | no       | If `true`, all collapsible sections are expanded and cannot close |


### ResponsiveSidebar

A render props component that manages the state for responsive sidebars. On mobile devices, the sidebar is opened by a `MenuButton` component, and dismissed when the user clicks away from the sidebar. This component's `children` prop accepts a function that provides values and functions to enable this behavior easily.

```js
import {
  Layout,
  Sidebar,
  ResponsiveSidebar,
  FlexWrapper,
  MenuButton
} from 'gatsby-theme-apollo';

function MyPage() {
  return (
    <Layout>
      <ResponsiveSidebar>
        {({sidebarOpen, openSidebar, onWrapperClick, sidebarRef}) => (
          <FlexWrapper onClick={onWrapperClick}>
            <Sidebar responsive open={sidebarOpen} ref={sidebarRef}>
              This is a sidebar
            </Sidebar>
            <MenuButton onClick={openSidebar} />
          </FlexWrapper>
        )}
      </ResponsiveSidebar>
    </Layout>
  );
}
```

| Prop name | Type | Required | Description                                                 |
| --------- | ---- | -------- | ----------------------------------------------------------- |
| children  | func | yes      | A render prop-style function that returns a React component |

### LogoTitle

A component that renders an Apollo "A" logo, and the site title, as defined in the [`siteMetadata` Gatsby config option](https://www.gatsbyjs.org/docs/gatsby-config/#sitemetadata).

```js
import {LogoTitle} from 'gatsby-theme-apollo';

function MyPage() {
  return <LogoTitle />;
}
```

Through [component shadowing](https://www.gatsbyjs.org/blog/2019-01-29-themes-update-child-theming-and-component-shadowing/), you can override the logo that gets shown. Simply create a file that exports a SVG React component in your theme consumer at _src/gatsby-theme-apollo/components/logo.js_.

```js
// src/gatsby-theme-apollo/components/logo.js
export {ReactComponent as default} from '../../assets/custom-logo.svg';
```

Check out [this CodeSandbox](https://codesandbox.io/s/mq7p0z3wmj) for a full component shadowing example!

[![Edit Component shadowing example](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/mq7p0z3wmj?fontsize=14)

| Prop name | Type | Required | Description                          |
| --------- | ---- | -------- | ------------------------------------ |
| noLogo    | bool | no       | If `true`, the Apollo logo is hidden |

### colors

An object mapping semantic names to hex strings. All of these colors are drawn from [Space Kit](https://github.com/apollographql/space-kit#colors). You can use this utility to write CSS-in-JS rules like this:

```js
import {colors} from 'gatsby-theme-apollo';

const StyledButton = styled.button({
  color: colors.primary,
  background: colors.background
});
```

 ### breakpoints

 A mapping of size keys to media queries. This is useful for writing responsive CSS-in-JS components.

 ```js
 import {breakpoints} from 'gatsby-theme-apollo';

 const StyledMenu = styled.nav({
   fontSize: 24,
   [breakpoints.lg]: {
     fontSize: 20
   },
   [breakpoints.md]: {
     fontSize: 16
   },
   [breakpoints.sm]: {
     fontSize: 12
   }
 })
 ```

| Key | Value                      |
| --- | -------------------------- |
| sm  | @media (max-width: 600px)  |
| md  | @media (max-width: 850px)  |
| lg  | @media (max-width: 1120px) |

## Examples

- [Principled GraphQL](https://github.com/apollographql/principled-graphql)
