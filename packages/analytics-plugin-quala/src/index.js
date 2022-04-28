const { beacon } = require("quala");

function qualaPlugin(writeKey) {
  let loaded = false;
  return {
    name: "quala",
    config: {
      writeKey,
    },
    initialize: ({ config }) => {
      beacon.load(config.writeKey);
      loaded = true;
    },
    page: ({ payload }) => {
      if (!loaded) return;
      beacon.screen({
        name: payload.properties.title,
        userId: payload.userId,
        properties: payload.properties,
      });
    },
    track: ({ payload }) => {
      if (!loaded) return;
      beacon.track({
        userId: payload.userId,
        signal: payload.event,
        properties: payload.properties,
      });
    },
    identify: ({ payload }) => {
      if (!loaded) return;
      const { userId, traits } = payload;
      beacon.identify({
        // Adding this as companyId is mandatory but might not be provided
        companyId: traits.companyId || "company-id-not-provided",
        userId,
        traits,
      });
    },
    loaded: () => loaded,
  };
}

module.exports = qualaPlugin;
