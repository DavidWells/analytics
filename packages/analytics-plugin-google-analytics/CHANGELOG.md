# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [1.1.0](https://github.com/DavidWells/analytics/compare/@analytics/google-analytics@1.0.7...@analytics/google-analytics@1.1.0) (2024-12-11)


### Features

* [#235](https://github.com/DavidWells/analytics/issues/235) add csp nonce for google tag and analytics packages ([abd2b28](https://github.com/DavidWells/analytics/commit/abd2b2898426577ba3b28eeab5ae999191f21c75))





## [1.0.7](https://github.com/DavidWells/analytics/compare/@analytics/google-analytics@1.0.6...@analytics/google-analytics@1.0.7) (2023-05-27)

**Note:** Version bump only for package @analytics/google-analytics





## [1.0.6](https://github.com/DavidWells/analytics/compare/@analytics/google-analytics@1.0.5...@analytics/google-analytics@1.0.6) (2023-05-27)

**Note:** Version bump only for package @analytics/google-analytics





## [1.0.5](https://github.com/DavidWells/analytics/compare/@analytics/google-analytics@1.0.4...@analytics/google-analytics@1.0.5) (2022-11-09)


### Bug Fixes

* pre-installed gtag causes analytics.js plugin to not initialize ([fd10ab2](https://github.com/DavidWells/analytics/commit/fd10ab2ebabf73beb6242a59b2a04a0af035044e))





## [1.0.4](https://github.com/DavidWells/analytics/compare/@analytics/google-analytics@1.0.3...@analytics/google-analytics@1.0.4) (2022-11-09)


### Bug Fixes

* fixes a sneaky bug that causes all ga4 events (gtag) to fire in debug mode ([1da35cb](https://github.com/DavidWells/analytics/commit/1da35cbef06d93605a4e82767f0e4c6a2ac9aca8))





## [1.0.3](https://github.com/DavidWells/analytics/compare/@analytics/google-analytics@1.0.2...@analytics/google-analytics@1.0.3) (2022-07-22)

**Note:** Version bump only for package @analytics/google-analytics





## [1.0.2](https://github.com/DavidWells/analytics/compare/@analytics/google-analytics@1.0.1...@analytics/google-analytics@1.0.2) (2022-07-21)


### Bug Fixes

* config ref ([b05c971](https://github.com/DavidWells/analytics/commit/b05c971f0e49c7760383cfc342e8b4a103e01783))





## [1.0.1](https://github.com/DavidWells/analytics/compare/@analytics/google-analytics@0.5.3...@analytics/google-analytics@1.0.1) (2022-07-21)

**Note:** Version bump only for package @analytics/google-analytics





## [1.0.0] (2022-06-15)

BREAKING CHANGE. The package has swapped from using google analytics v.3 to the newer product of google analytics v4.

To continue using google analytics v3, use the `@analytics/google-analytics-v3` package. All future updates here will be for the completely different product from google called "google analytics v4".


## [0.5.3](https://github.com/DavidWells/analytics/compare/@analytics/google-analytics@0.5.2...@analytics/google-analytics@0.5.3) (2021-05-30)

**Note:** Version bump only for package @analytics/google-analytics





## [0.5.2](https://github.com/DavidWells/analytics/compare/@analytics/google-analytics@0.5.0...@analytics/google-analytics@0.5.2) (2020-09-25)

**Note:** Version bump only for package @analytics/google-analytics





# [0.5.0](https://github.com/DavidWells/analytics/compare/@analytics/google-analytics@0.4.1...@analytics/google-analytics@0.5.0) (2020-08-15)


### Features

* Add support for custom GA Task overrides for Electron ([72b3e0a](https://github.com/DavidWells/analytics/commit/72b3e0a)), closes [#77](https://github.com/DavidWells/analytics/issues/77)





## [0.4.1](https://github.com/DavidWells/analytics/compare/@analytics/google-analytics@0.4.0...@analytics/google-analytics@0.4.1) (2020-07-30)

**Note:** Version bump only for package @analytics/google-analytics





# [0.4.0](https://github.com/DavidWells/analytics/compare/@analytics/google-analytics@0.3.1...@analytics/google-analytics@0.4.0) (2020-05-12)


### Features

* add support for multiple instances & custom script source to GA ([c9b2510](https://github.com/DavidWells/analytics/commit/c9b2510))





## [0.3.1](https://github.com/DavidWells/analytics/compare/@analytics/google-analytics@0.3.0...@analytics/google-analytics@0.3.1) (2020-04-16)

**Note:** Version bump only for package @analytics/google-analytics





# [0.3.0](https://github.com/DavidWells/analytics/compare/@analytics/google-analytics@0.2.2...@analytics/google-analytics@0.3.0) (2020-04-13)


### Features

* Add support for Google Analytics Custom dimensions ([50a0bbf](https://github.com/DavidWells/analytics/commit/50a0bbf))





## [0.2.2](https://github.com/DavidWells/analytics/compare/@analytics/google-analytics@0.2.1...@analytics/google-analytics@0.2.2) (2019-10-23)

**Note:** Version bump only for package @analytics/google-analytics





## 0.2.1 (2019-10-14)

**Note:** Version bump only for package @analytics/google-analytics





# [0.2.0](https://github.com/DavidWells/analytics/compare/analytics-plugin-ga@0.1.5...analytics-plugin-ga@0.2.0) (2019-09-30)


### Features

* **google-analytics:** expose standalone functions for general use ([88ef970](https://github.com/DavidWells/analytics/commit/88ef970))





## [0.1.5](https://github.com/DavidWells/analytics/compare/analytics-plugin-ga@0.1.4...analytics-plugin-ga@0.1.5) (2019-08-06)


### Bug Fixes

* **google-analytics:** fix label, value, & category payloads ([6e6238d](https://github.com/DavidWells/analytics/commit/6e6238d)), closes [#16](https://github.com/DavidWells/analytics/issues/16)





## [0.1.4](https://github.com/DavidWells/analytics/compare/analytics-plugin-ga@0.1.4...analytics-plugin-ga@0.1.4) (2019-07-13)


### Features

* **ga:** add serverside implementation for google analytics ([fce05b4](https://github.com/DavidWells/analytics/commit/fce05b4))
* **ga:** add standalone gtag browser build ([e9414d4](https://github.com/DavidWells/analytics/commit/e9414d4))
* **ga plugin:** add debug setting ([7942226](https://github.com/DavidWells/analytics/commit/7942226))
* **plugin-ga:** add debug mode to track in google analytics ([315fcab](https://github.com/DavidWells/analytics/commit/315fcab))
