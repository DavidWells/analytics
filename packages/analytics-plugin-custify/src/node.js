import fetch from 'unfetch'

/**
 * Custify server plugin
 * @link https://getanalytics.io/plugins/custify
 * @link https://docs.custify.com/
 * @param {object} pluginConfig - Plugin settings
 * @param {string} pluginConfig.apiKey - custify API key
 * @return {AnalyticsPlugin}
 * @example
 *
 * custifyPlugin({
 *   apiKey: 'abc123'
 * })
 */
function custifyPlugin({ apiKey }) {
  let loaded = false;
  return {
    name: "custify",
    config: {
      apiKey,
    },
    initialize: ({ config }) => {
      makeCustifyRequest(config.apiKey, 'event', 'POST', {loaded: true});
      loaded = true;
    },
    page: ({ payload }) => {
      if (!loaded) return;
      makeCustifyRequest(config.apiKey, 'event', 'POST', {
        name: payload.properties.title,
        user_id: payload.userId,
        company_id: payload.companyId,
        email: payload.email,
        metadata: payload.properties,
      });
    },
    track: ({ payload }) => {
      if (!loaded) return;
      makeCustifyRequest(config.apiKey, 'event', 'POST', {
        name: payload.event,
        user_id: payload.userId,
        company_id: payload.companyId,
        email: payload.email,
        metadata: payload.properties,
      });
    },
    identify: ({ payload }) => {
      if (!loaded) return;
      const { userId, traits } = payload;
      makeCustifyRequest(config.apiKey, 'identify', 'POST', {
        user_id: userId,
        company_id: traits.companyId,
        email: traits.email,
      });
    },
    loaded: () => loaded,
  };
}

function makeCustifyRequest(apiKey, endpoint, method, data) {
  const custifyUrl = 'https://api.custify.com'

  return fetch(`${custifyUrl}/${endpoint}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify(data),
  });
}

export default custifyPlugin