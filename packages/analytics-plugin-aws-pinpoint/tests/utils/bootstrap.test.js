import test from 'ava'
import sinon from 'sinon'
import bootstrap from '../../src/utils/bootstrap'

test('should call instance.once with disableAnonymousTraffic true and userId does not exist', () => {
  const pluginApi = {
    config: { disableAnonymousTraffic: true },
    instance: {
      user: sinon.fake.returns(false),
      once: sinon.fake(),
    },
  }
  const data = bootstrap(pluginApi)

  sinon.assert.calledOnce(pluginApi.instance.once)
})

test('should not call instance.once if disableAnonymousTraffic false or user exists', () => {
  const pluginApi = {
    config: { disableAnonymousTraffic: false },
    instance: {
      user: sinon.fake.returns(true),
      once: sinon.fake(),
    },
  }
  const data = bootstrap(pluginApi)

  sinon.assert.notCalled(pluginApi.instance.once)
})

test('should call instance.loadPlugin if plugin is not loaded', () => {
  const pluginApi = {
    config: { disableAnonymousTraffic: true },
    instance: {
      user: sinon.fake.returns(false),
      once: sinon.fake.yields({
        plugins: {
          'aws-pinpoint': {
            loaded: sinon.fake.returns(false),
          },
        },
      }),
      loadPlugin: sinon.fake(),
    },
  }
  const data = bootstrap(pluginApi)

  sinon.assert.calledOnce(pluginApi.instance.loadPlugin)
})
