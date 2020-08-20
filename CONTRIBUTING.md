# CONTRIBUTING

Contributions are always welcome, no matter how large or small. Before contributing,
please read the [code of conduct](CODE_OF_CONDUCT.md).

## Setup

> Install node & npm on your system: [https://nodejs.org/en/download/](https://nodejs.org/en/download/)

### Install dependencies

> Only required when setting up the project

```sh
$ git clone https://github.com/davidwells/analytics
$ cd analytics
$ npm run setup
```

Because analytics has a large number of packages, we need to also [install watchman](https://facebook.github.io/watchman/docs/install.html) for better watching.

```sh
brew update
brew install watchman
```

### Run locally

To run analytics locally follow these steps:

1. Make sure you have run `npm run setup` to install all packages
2. Run `npm run build` to ensure analytics packages are built
3. Run watch mode `npm run watch` to have changes reflected live in the demo app.
4. In a new terminal window, change directories into the [`/examples/demo`](https://github.com/DavidWells/analytics/tree/master/examples/demo) folder & install the demo apps dependencies `npm install`
5. Finally, you can start the demo app with `npm start`

If you have any questions please ping [@DavidWells](https://twitter.com/davidwells) on Twitter.

## Available scripts

### `setup`

Installs and sets up all analytics package dependencies.

#### Usage

```sh
$ npm run setup
```

### `watch`

Watches all `analytics` packages and builds them on change.

#### Usage

```sh
$ npm run watch
```

### `clean`

Removes all of the `analytics` packages `dist` directories.

#### Usage

```sh
npm run clean
```

### `reset`

Runs the `clean` script and removes all the `node_modules` from the `analytics` packages.

#### Usage

```sh
npm run reset
```

### `build`

Runs the `clean` script and builds the `analytics` packages.

#### Usage

```sh
npm run build
```

### `test`

Runs all the `analytics` packages tests.

#### Usage

```sh
npm run test
```

## Pull Requests

We actively welcome your pull requests!

If you need help with Git or our workflow, please ask on [David on twitter](https://twitter.com/davidwells). We want your contributions even if you're just learning Git. Our maintainers are happy to help!

Analytics uses the [Forking Workflow](https://www.atlassian.com/git/tutorials/comparing-workflows/forking-workflow) + [Feature Branches](https://www.atlassian.com/git/tutorials/comparing-workflows/feature-branch-workflow). Additionally, PR's should be [rebased](https://www.atlassian.com/git/tutorials/merging-vs-rebasing) on master when opened, and again before merging.

1. Fork the repo.
2. Create a branch from `master`. If you're addressing a specific issue, prefix your branch name with the issue number.
2. If you've added code that should be tested, add tests.
3. If you've changed APIs, update the documentation.
4. Run `npm run test` and ensure the test suite passes.
6. PR's must be rebased before merge (feel free to ask for help).
7. PR should be reviewed by two maintainers prior to merging.

## License

By contributing to `analytics`, you agree that your contributions will be licensed
under its [MIT license](LICENSE).
