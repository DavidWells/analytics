import fetch from 'unfetch';

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }

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
function churnZeroPlugin(_ref) {
  var appKey = _ref.appKey,
    subdomain = _ref.subdomain,
    accountExternalId = _ref.accountExternalId,
    contactExternalId = _ref.contactExternalId;
  var _loaded = false;
  return {
    name: 'churn-zero',
    config: {
      appKey: appKey,
      subdomain: subdomain,
      accountExternalId: accountExternalId,
      contactExternalId: contactExternalId
    },
    track: function track(_ref2) {
      var payload = _ref2.payload;
      var _payload$traits = payload.traits,
        company = _payload$traits.company,
        email = _payload$traits.email,
        event = _payload$traits.event,
        properties = _payload$traits.properties;
      makeChurnZeroRequest(config, {
        action: 'trackEvent',
        eventName: event,
        cf_metadata: properties,
        accountExternalId: company ? company.id : undefined,
        contactExternalId: email
      });
    },
    identify: function identify(_ref3) {
      var payload = _ref3.payload;
      var _payload$traits2 = payload.traits,
        company = _payload$traits2.company,
        email = _payload$traits2.email,
        name = _payload$traits2.name,
        firstName = _payload$traits2.firstName,
        lastName = _payload$traits2.lastName;
      makeChurnZeroRequest(config, {
        action: 'setAttribute',
        entity: 'account',
        attr_Name: name,
        accountExternalId: company.id,
        contactExternalId: email
      });
      makeChurnZeroRequest(config, {
        action: 'setAttribute',
        entity: 'contact',
        attr_FirstName: firstName,
        attr_LastName: lastName,
        attr_Email: email,
        accountExternalId: company.id,
        contactExternalId: email
      });
    },
    loaded: function loaded() {
      return _loaded;
    }
  };
}
function makeChurnZeroRequest(_ref4) {
  var config = _ref4.config,
    body = _ref4.body;
  return fetch("https://".concat(config.subdomain, ".churnzero.net/i"), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache'
    },
    body: JSON.stringify(_objectSpread(_objectSpread({
      appKey: config.appKey
    }, body), {}, {
      accountExternalId: body.accountExternalId || config.accountExternalId,
      contactExternalId: body.contactExternalId || config.contactExternalId
    }))
  });
}

/* This module will shake out unused code and work in browser and node 🎉 */
var index = churnZeroPlugin;

export { index as default };
