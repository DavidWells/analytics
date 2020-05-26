# Analytics Demo Site

See `./src/utils/analytics`

## Setup & Install

To run this demo locally, you must first build all the local packages

1. In the repo root folder, run `npm run setup`
2. Then In the repo root folder, `npm run build` to ensure all the local plugins are built.
3. Now change directories back into `/example/demo` and run `npm install` to install the local plugins.
4. Then you should be able to start it locally with `npm start`

## Watching local plugins

To see your changes to plugins reflected in the demo app:

1. Run `npm run watch` in the root of the repository in a separate terminal window.
2. With watch running, in a new terminal window change directories back into `/example/demo` and run `npm start`
3. Edit code in a given plugin and it will automatically rebuilt & the demo app will reload.

## Running

1. Add/edit plugins in `./src/utils/analytics`
2. Update `.env` keys to update the environment values used by plugins

Then start the app

```
npm start
```
