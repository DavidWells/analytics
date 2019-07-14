# gatsby-theme-base-docs

This is an entirely configuration-based Gatsby theme that generates a documentation website based on a series of Markdown or MDX files. It also exports a series of [components](#components) that can be used within MDX pages.

## Table of contents

- [Installation](#installation)
- [Configuration](#configuration)
  - [versions](#versions)
  - [sidebarCategories](#sidebarcategories)
- [Creating pages](#creating-pages)
- [Components](#components)
- [Deployment](#deployment)
- [Migration](#migration)

## Installation

```bash
$ npm install gatsby gatsby-theme-base-docs
```

## Configuration

```js
// gatsby-config.js
module.exports = {
  pathPrefix: '/docs/apollo-server',
  __experimentalThemes: [
    {
      resolve: 'gatsby-theme-base-docs',
      options: {
        root: __dirname,
        subtitle: 'Apollo Server',
        description: 'A guide to using Apollo Server',
        githubRepo: 'apollographql/apollo-server',
        defaultVersion: '2',
        versions: {
          1: 'origin/version-1'
        },
        sidebarCategories: {
          null: [
            'index',
            'getting-started',
            'whats-new'
          ],
          Features: [
            'features/mocking',
            'features/errors',
            'features/data-sources'
          ]
        }
      }
    }
  ]
};
```

| Option name          | Type   | Description                                                                    |
| -------------------- | ------ | ------------------------------------------------------------------------------ |
| root                 | string | Must be `__dirname`                                                            |
| subtitle             | string | The title that gets rendered above the sidebar navigation                      |
| description          | string | The site description for SEO and social (FB, Twitter) tags                     |
| contentDir           | string | The directory where docs content exists (`docs/source` by default)             |
| githubRepo           | string | The owner and name of the content repository on GitHub                         |
| spectrumPath         | string | The path to be appended to Spectrum links                                      |
| versions             | array  | An array of objects representing the versions that the website should generate |
| sidebarCategories    | object | An object mapping categories to page paths ([described below][])               |
| checkLinksExceptions | array  | An array of strings passed to [`gastby-remark-check-links`][]                  |

[described below]: #sidebarCategories
[`gastby-remark-check-links`]: https://github.com/trevorblades/gatsby-remark-check-links#making-exceptions

### `versions`

If omitted, only one version of docs will be built, based on the files in the theme consumer repository. If provided, the `versions` option expects an object mapping older versions' labels to their respective git branch. The current filesystem will still determine the "default" version. The default label for this version is "Latest", but is configurable by the `defaultVersion` option.

```js
defaultVersion: '2.5',
versions: {
  '2.4': 'version-2.4'
}
```

### `sidebarCategories`

The `sidebarCategories` option is an object keyed by category titles. Each entry in the object is an array of page paths. The path should resemble the location of a Markdown/MDX file in the git repository, relative to `contentDir`, and without the _.md_ extension. Sidebar navigation items that are **not** a member of a category live under the `null` key. To add an external link to your sidebar, your can provide a string formatted like a Markdown link.

```js
{
  null: [
    'index',
    'getting-started',
    'whats-new'
  ],
  Features: [
    'features/mocking',
    'features/errors',
    'features/data-sources'
  ],
  'External links': [
    '[Principled GraphQL](https://principledgraphql.com/)'
  ]
}
```

## Creating pages

This theme generates pages based on Markdown or MDX files in the [`contentDir`](#configuration) directory of a repo. Your Markdown/MDX files should contain some frontmatter defining their titles and descriptions.

```markdown
---
title: Introduction
description: What is Apollo Server and what does it do?
---

Apollo Server is the best way to quickly build a production-ready, self-documenting API for GraphQL clients, using data from any source.
```

Page URLs will be derived from the file paths of your Markdown. You can nest Markdown files within directories to create pages with additional path segments.

## Components

This theme exports React components that you can use in MDX files throughout a documentation website.

- [`Button`](#button)
- [`ButtonLink`](#buttonlink)
- [`ButtonWrapper`](#buttonwrapper)
- [`ExpansionPanel`](#expansionpanel)
- [`ExpansionPanelList`](#expansionpanellist)
- [`ExpansionPanelListItem`](#expansionpanellistitem)

### Button

A button that follows our [Space Kit](https://github.com/apollographql/space-kit) design system. See [the project in Zeplin](https://app.zeplin.io/project/5c7dcb5ab4e654bca8cde54d/screen/5cc9f226cbd69a34a84890ae) for a visual look at the different button variations.

| Prop     | Type   | Default value | Description                          |
| -------- | ------ | ------------- | ------------------------------------ |
| children | node   | N/A           | The content of the button            |
| size     | string | "medium"      | One of "small", "medium", or "large" |
| color    | string | "standard"    | Either "standard" or "branded"       |
| variant  | string | "standard"    | Either "standard" or "hidden"        |

### `ButtonLink`

A button that functions as an internal link using [Gatsby Link](https://www.gatsbyjs.org/docs/gatsby-link/). It accepts all props that the [`Button`](#button) and [`Link`]((https://www.gatsbyjs.org/docs/gatsby-link/)) components accept.

```jsx
import {ButtonWrapper, ButtonLink} from 'gatsby-theme-base-docs';

<ButtonWrapper>
  <ButtonLink
    size="large"
    color="branded"
    to="/tutorial/introduction"
  >
    Try it out!
  </ButtonLink>
  <ButtonLink
    size="large"
    to="/intro/platform"
  >
    Learn more
  </ButtonLink>
</ButtonWrapper>
```

### `ButtonWrapper`

A presentational component that only takes `children` and is designed to render a row of [`Button`](#button) or [`ButtonLink`](#buttonlink) components, center-aligned and evenly spaced.

### `ExpansionPanel`

An expandable panel of content used to hide complex information or instructions that might be a tangent from the main topic of the content it lives within.

| Prop     | Type   | Description                                                        |
| -------- | ------ | ------------------------------------------------------------------ |
| children | node   | The content of the panel, usually includes an `ExpansionPanelList` |
| title    | string | The title of the panel, visible even when the panel is closed      |

### `ExpansionPanelList`

A wrapper element that should be used in conjunction with [`ExpansionPanelListItem`](#expansionpanellistitem) components. It renders an `li` element with some styles baked in.

### `ExpansionPanelListItem`

A list item for use with the `ExpansionPanelList`. It comes with a cicular area to its left to render a number, glyph, or some way to indicate progress through a set of instructions. You can write markdown within these elements if you keep everything detabbed and add an empty line between your content and the component's opening and closing tags.

| Prop     | Type   | Description                                                                            |
| -------- | ------ | -------------------------------------------------------------------------------------- |
| children | node   | The content of the list item, usually a block of markdown                              |
| number   | string | The number displayed to the left of the list item, or a checkmark if "check" is passed |

```js
import {
  ExpansionPanel,
  ExpansionPanelList,
  ExpansionPanelListItem
} from 'gatsby-theme-base-docs';

<ExpansionPanel title="How to use the ExpansionPanel component">

Add a line break _between_ JSX tags and content to parse the content as *markdown*

<ExpansionPanelList>
<ExpansionPanelListItem number="1">

<h4>h4 works well as a heading here</h4>

- markdown
- works
- here

</ExpansionPanelListItem>
<ExpansionPanelListItem number="check">

<h4>That's it!</h4>

> MDX is super fun

</ExpansionPanelListItem>
</ExpansionPanelList>

</ExpansionPanel>
```

## Deployment

All docs sites will eventually be deployed into a subdirectory, as configured by the `pathPrefix` option&mdash;/docs/apollo-server, for example. [Read this guide](../../#deploying-to-a-subdirectory) to learn more about publishing to a subdirectory.

## Migration

To move one of our old Hexo-based sites to Gatsby using this theme, you can follow these steps:

### 1. Clean house

First, clone the repo and move into the _docs_ directory (`cd docs`). Delete that directory's _package-lock.json_ file and *node_modules* directory, and edit the _package.json_ file to look like this:

```json
{
  "scripts": {
    "start": "gatsby develop --prefix-paths"
  }
}
```

Change the name of the _public_ directory (this typically contains the *_redirects* Netlify file) to _static_.

```bash
mv public static
```

You'll also need to edit the _docs_ directory's _.gitignore_ to reflect this change. You'll want to ignore the entire _public_ directory, as well as the _.cache_ directory. These changes will typically look like this:

```
  public/*
- !public/_redirects
+ .cache
```

### 2. Install dependencies

```bash
$ npm install gatsby gatsby-theme-base-docs
```

That was easy!

### 3. Port _config.yml to gatsby-config.js

All of this theme's [configuration options](#configuration) are represented in existing Hexo *_config.yml* files. Moving them over is just a matter of copying and pasting, modifying some property names, and changing snake_case names to camelCase ones. In addition, you must add a `root` option and set it to `__dirname`. For example, here's a before/after of the iOS docs configs:

*_config.yml*

```yaml
title: Apollo iOS Guide # called `subtitle` in gatsby-config.js
subtitle: Apollo iOS Guide # not needed
description: A guide to using Apollo with iOS
versions:
  - '1' # if there's only one version, you don't need to port this option
sidebar_categories:
  null:
    - index
    - installation
    - api-reference
  Usage:
    - downloading-schema
    - initialization
    - fetching-queries
    - fragments
    - watching-queries
    - mutations
github_repo: apollographql/apollo-ios
root: /docs/ios/ # called `pathPrefix` in gatsby-config.js
content_root: docs/source # not required, but called `contentDir` in gatsby-config.js
url: https://www.apollographql.com/docs/ios/ # not needed
public_dir: public/docs/ios # not needed
```

_gatsby-config.js_

```js
module.exports = {
  pathPrefix: '/docs/ios', // similar to `root` in _config.yml
  __experimentalThemes: [
    {
      resolve: 'gatsby-theme-base-docs',
      options: {
        root: __dirname, // <-- this is the only new property added
        subtitle: 'Apollo iOS Guide',
        description: 'A guide to using Apollo with iOS',
        githubRepo: 'apollographql/apollo-ios',
        sidebarCategories: {
          null: [
            'index',
            'installation',
            'api-reference'
          ],
          Usage:[
            'downloading-schema',
            'initialization',
            'fetching-queries',
            'fragments',
            'watching-queries',
            'mutations',
          ]
        }
      }
    }
  ]
};
```

### 4. Add a Netlify config

Add a _netlify.toml_ file to the repo root. It should contain `base`, `publish`, and `command` properties. The `base` and `publish` properties should always be `docs/` and `docs/public/`, respectively. The `command` property will build the site using the `gatsby build` command, and then move the built website into the appropriate directory to be served using Fly.io. You should edit the directory names in that property to reflect the `pathPrefix` option that you provided in your _gatsby-config.js_ file. Here's an example of the iOS docs Netlify config:

```toml
[build]
  base    = "docs/"
  publish = "docs/public/"
  command = "gatsby build --prefix-paths && mkdir -p docs/ios && mv public/* docs/ios && mv docs public/ && mv public/docs/ios/_redirects public"
[build.environment]
  NPM_VERSION = "6"
```

### 5. Deploy

When these changes are pushed to GitHub and a pull request is opened, Netlify will build a deploy preview so you can check out the changes made. When you open the deploy preview in your web browser, be sure to append the `pathPrefix` to the URL. In the example of the iOS docs, the URL would look like this: https://deploy-preview-471--apollo-ios-docs.netlify.com/docs/ios
