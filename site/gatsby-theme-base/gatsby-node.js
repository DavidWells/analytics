const fs = require('fs')
const path = require('path')

// include theme files in babel transpilation
exports.onCreateWebpackConfig = ({loaders, actions}) => {
  actions.setWebpackConfig({
    module: {
      rules: [
        {
          test: /\.js$/,
          include: path.dirname(require.resolve('gatsby-theme-base')),
          use: [loaders.js()]
        }
      ]
    }
  })
}

// copy the favicon from the theme dir to the built website
exports.onPostBootstrap = (_, {root}) => {
  fs.copyFileSync(
    path.resolve(__dirname, 'static/favicon.ico'),
    path.resolve(root, 'public/favicon.ico')
  )
}
