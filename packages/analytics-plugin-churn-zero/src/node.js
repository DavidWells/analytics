import fetch from 'unfetch'

/**
 * Custify server plugin
 * @link https://getanalytics.io/plugins/churn-zero
 * @link https://docs.churn-zero.com/
 * @param {object} pluginConfig - Plugin settings
 * @param {string} pluginConfig.appKey - ChurnZero API key
 * @param {string} pluginConfig.subdomain - ChurnZero AppKey
 * @param {string} pluginConfig.whitelistedEvents - An optional list of events to track
 * @return {AnalyticsPlugin}
 * @example
 *
 * churnZeroPlugin({
 *   appKey: '1234578'
 *   subdomain: 'mycompanydomain'
 * })
 */
function churnZeroPlugin({ appKey, subdomain, accountExternalId, contactExternalId }) {
  let loaded = false;
  return {
    name: 'churn-zero',
    config: {
      appKey,
      subdomain,
      accountExternalId,
      contactExternalId,
    },
    track: ({ payload }) => {
      const { company, email, event, properties } = payload.traits

      makeChurnZeroRequest(config, {
        action: 'trackEvent',
        eventName: event,
        cf_metadata: properties,
        accountExternalId: company ? company.id : undefined,
        contactExternalId: email,
      });
    },
    identify: ({ payload }) => {
      const { company, email, name, firstName, lastName } = payload.traits

      makeChurnZeroRequest(config, {
        action: 'setAttribute',
        entity: 'account',
        attr_Name: name,
        accountExternalId: company.id,
        contactExternalId: email,
      });

      makeChurnZeroRequest(config, {
        action: 'setAttribute',
        entity: 'contact',
        attr_FirstName: firstName,
        attr_LastName: lastName,
        attr_Email: email,
        accountExternalId: company.id,
        contactExternalId: email,
      });
    },
    loaded: () => loaded,
  };
}

function makeChurnZeroRequest({config, body}) {
  return fetch(`https://${config.subdomain}.churnzero.net/i`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
    },
    body: JSON.stringify({
      appKey: config.appKey,
      ...body,
      accountExternalId: body.accountExternalId || config.accountExternalId,
      contactExternalId: body.contactExternalId || config.contactExternalId,
    }),
  });
}

export default churnZeroPlugin
