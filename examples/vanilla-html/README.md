# Using Analytics with HTML

[Demo](https://analytics-html-example.netlify.com/)

## Usage

```html
<!-- Include from CDN -->
<script src="https://unpkg.com/analytics/dist/analytics.min.js"></script>
<!-- Include plugins -->
<script src="https://unpkg.com/analytics-plugin-ga/dist/analytics-plugin-ga.min.js"></script>

<script type="text/javascript">
  /* Initialize analytics */
  var Analytics = _analytics.init({
    app: 'analytics-html-demo',
    debug: true,
    version: 100,
    plugins: [
      analyticsGA({
        trackingId: 'UA-126647663-3'
      })
      // ... add other plugins
    ]
  })

  /* Then use */
  Analytics.page()
```
