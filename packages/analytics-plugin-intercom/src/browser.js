/* global analytics */

const config = {
  /* Your intercom app id */
  appId: null,
  disableAnonymousTraffic: false,
  /* Customize left or right position of messenger */
  alignment: undefined,
  /* Customize horizontal padding */
  horizontalPadding: undefined,
  /* Customize vertical padding */
  verticalPadding: undefined,
  /* Css selector of the custom launcher */
  customLauncherSelector: undefined,
}

/**
 * intercom analytics plugin
 * @link https://getanalytics.io/plugins/intercom/
 * @link https://developers.intercom.com/installing-intercom/docs/intercom-javascript
 * @param {object}  pluginConfig - Plugin settings
 * @param {string}  pluginConfig.appId - Your intercom app id
 * @param {boolean} [pluginConfig.disableAnonymousTraffic] - Disable loading intercom for anonymous visitors
 * @param {string}  [pluginConfig.alignment] - Customize left or right position of messenger
 * @param {number}  [pluginConfig.horizontalPadding] - Customize horizontal padding
 * @param {number}  [pluginConfig.verticalPadding] - Customize vertical padding
 * @param {string}  [pluginConfig.customLauncherSelector] - Css selector of the custom launcher see https://www.intercom.com/help/en/articles/2894-customize-the-intercom-messenger-technical for additional info
 * @return {object} Analytics plugin
 * @example
 *
 * intercomPlugin({
 *   appId: '123-xyz'
 * })
 */
function intercomPlugin(pluginConfig = {}) {
  return {
    name: "intercom",
    config: {
      ...config,
      ...pluginConfig,
    },
    /* Custom methods TODO: shutdown? hide show */
    methods: {
      startTour(tourId) {
        const intercom = window.Intercom;
        if (typeof intercom === "undefined") return;
        intercom("startTour", tourId);
      },
      shutdown() {
        const intercom = window.Intercom;
        if (typeof intercom === "undefined") return;
        intercom("shutdown");
      },
      hide() {
        const intercom = window.Intercom;
        if (typeof intercom === "undefined") return;
        intercom("hide");
      },
      show() {
        const intercom = window.Intercom;
        if (typeof intercom === "undefined") return;
        intercom("show");
      },
      showMessages() {
        const intercom = window.Intercom;
        if (typeof intercom === "undefined") return;
        intercom("showMessages");
      },
      showNewMessage() {
        const intercom = window.Intercom;
        if (typeof intercom === "undefined") return;
        intercom("showNewMessage");
      },
      onShow(callback) {
        const intercom = window.Intercom;
        if (typeof intercom === "undefined") return;
        intercom("onShow", callback);
      },
      onUnreadCountChange(callback) {
        const intercom = window.Intercom;
        if (typeof intercom === "undefined") return;
        intercom("onUnreadCountChange", callback);
      },
    },
    bootstrap: ({ config, instance }) => {
      /* Load intercom script after userId exists */
      if (config.disableAnonymousTraffic && !instance.user("userId")) {
        instance.once("identifyStart", ({ plugins }) => {
          const self = plugins["intercom"];
          if (!self.loaded()) {
            instance.loadPlugin("intercom");
          }
        });
      }
    },
    /* Load intercom widget on page */
    initialize: ({ config, instance, payload }) => {
      // console.log('initialize event intercom', payload)

      const {
        disableAnonymousTraffic,
        appId,
        alignment,
        horizontalPadding,
        verticalPadding,
        customLauncherSelector,
      } = config;
      if (!appId) {
        throw new Error("No intercom appId");
      }
      /* Disable intercom.com if user is not yet identified. Save on Monthly MTU bill $$$ */
      const userID = instance.user("userId");
      if (!userID && disableAnonymousTraffic) {
        return false;
      }
      /* eslint-disable */
      (function() {
        var w = window;
        var ic = w.Intercom;
        if (typeof ic === "function") {
          ic("reattach_activator");
          ic("update", w.intercomSettings);
        } else {
          var d = document;
          var i = function() {
            i.c(arguments);
          };
          i.q = [];
          i.c = function(args) {
            i.q.push(args);
          };
          w.Intercom = i;
          var l = function() {
            var s = d.createElement("script");
            s.type = "text/javascript";
            s.async = true;
            s.src = "https://widget.intercom.io/widget/" + appId;
            var x = d.getElementsByTagName("script")[0];
            x.parentNode.insertBefore(s, x);
          };
          if (document.readyState === "complete") {
            l();
          } else if (w.attachEvent) {
            w.attachEvent("onload", l);
          } else {
            w.addEventListener("load", l, false);
          }
        }
      })();
      /* eslint-enable */
      window.intercomSettings = {
        app_id: appId,
        alignment,
        horizontal_padding: horizontalPadding,
        vertical_padding: verticalPadding,
        custom_launcher_selector: customLauncherSelector,
      };
    },
    /* Trigger intercom page view */
    page: ({ payload, config }) => {
      // console.log('page event intercom', payload)
      const intercom = window.Intercom;
      if (typeof intercom === "undefined") return;
      intercom("update");
    },
    /* Track intercom event */
    track: ({ payload, config }) => {
      // console.log('track event intercom', payload)
      const intercom = window.Intercom;
      if (typeof intercom === "undefined") return;
      intercom("trackEvent", payload.event, payload.properties);
    },

    /* Identify Segment user */
    identify: ({ payload, config }) => {
      const intercom = window.Intercom;
      if (typeof intercom === "undefined") return;
      const { userId, traits, options } = payload;
      if (typeof userId === "string") {
        window.Intercom("boot", {
          app_id: config.appId,
          user_id: userId,
          ...traits,
        });
      }
    },
    /* Remove intercom cookies on analytics.reset */
    reset: () => {
      const intercom = window.Intercom;
      if (typeof intercom === "undefined") return;
      intercom("shutdown");
    },
    /* Sync id when ready */
    ready: ({ instance, config }) => {
      const intercom = window.Intercom;
      if (!config.syncAnonymousId || typeof intercom === "undefined") return;
      const intercomUser = intercom("getVisitorId");
      if (intercomUser) {
        const intercomAnonId = intercom("getVisitorId");
        const analyticsAnonId = instance.user("anonymousId");
        // If has intercom anonymous ID && doesnt match analytics anon id, update
        if (intercomAnonId && intercomAnonId !== analyticsAnonId) {
          instance.setAnonymousId(intercomAnonId);
        }
      }
    },
    /* Check if intercom loaded */
    loaded: () => {
      return window.Intercom;
    },
  };
}

export default intercomPlugin;
