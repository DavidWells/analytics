import Analytics from 'analytics'

// https://github.com/sapegin/jest-cheat-sheet#done-callback

it('Track gets called on track', (done) => {
  // const newThing = sinon.spy(trackFunc);
  const fn = jest.fn().mockName('test-plugin track')
  const funcTwo = jest.fn().mockName('test-plugin funcTwo')
  const analytics = Analytics({
    app: 'appname',
    version: 100,
    plugins: [
      {
        NAMESPACE: 'test-plugin',
        track: fn,
        page: funcTwo
      }
    ]
  })

  analytics.track('hi', () => {
    expect(funcTwo).not.toBeCalled()
    expect(fn).toBeCalled()
    expect(fn).toHaveBeenCalledTimes(1)
    // expect(fn).toHaveBeenLastCalledWith(arg1, arg2)
    done()
  })

})

it('Page gets called on page', (done) => {
  // const newThing = sinon.spy(trackFunc);
  const track = jest.fn().mockName('test-plugin page')
  const pageFunc = jest.fn().mockName('test-plugin funcTwo')
  const analytics = Analytics({
    app: 'appname',
    version: 100,
    plugins: [
      {
        NAMESPACE: 'test-plugin',
        track: track,
        page: pageFunc
      }
    ]
  })

  analytics.page('hi', ({ payload }) => {
    expect(track).not.toBeCalled()
    expect(pageFunc).toBeCalled()
    expect(pageFunc).toHaveBeenCalledTimes(1)
    done()
  })

})

it('Both plugin methods are called', (done) => {
  // const newThing = sinon.spy(trackFunc);
  const trackOne = jest.fn().mockName('track-one')
  const trackTwo = jest.fn().mockName('track-two')
  const analytics = Analytics({
    app: 'appname',
    version: 100,
    plugins: [
      {
        NAMESPACE: 'test-plugin',
        track: trackOne,
      },
      {
        NAMESPACE: 'test-plugin-two',
        track: trackTwo,
      }
    ]
  })

  analytics.track('buttonClicked', ({ payload, instance }) => {

    expect(instance).toHaveProperty('user')
    expect(trackOne).toBeCalled()
    expect(trackOne).toHaveBeenCalledTimes(1)
    expect(trackTwo).toBeCalled()
    expect(trackTwo).toHaveBeenCalledTimes(1)
    done()
  })

})

it('should abort if a plugin aborts', (done) => {
  const trackSpy = jest.fn()
  const trackSpyTwo = jest.fn()
  const analytics = Analytics({
    app: 'appname',
    version: 100,
    plugins: [
      {
        NAMESPACE: 'test-plugin-zero',
        track: trackSpy,
      },
      {
        NAMESPACE: 'test-plugin',
        track: ({ abort }) => {
          return abort('stop all other track calls')
        },
      },
      {
        NAMESPACE: 'test-plugin-two',
        track: trackSpyTwo,
      }
    ]
  })

  analytics.track('buttonClicked', ({ payload, instance }) => {
    expect(trackSpy).toHaveBeenCalledTimes(1)
    expect(trackSpy).toBeCalled()
    expect(trackSpyTwo).not.toBeCalled()
    done()
  })

})

it('should abort track calls if trackStart returns abort()', (done) => {
  const trackSpy = jest.fn()
  const trackSpyTwo = jest.fn()
  const callback = jest.fn()
  const analytics = Analytics({
    app: 'appname',
    version: 100,
    plugins: [
      {
        NAMESPACE: 'xyz-test-plugin',
        track: trackSpy,
      },
      {
        NAMESPACE: 'xyz-test-plugin-two',
        trackStart: ({ abort }) => {
          return abort('stop all other track calls')
        },
      },
      {
        NAMESPACE: 'xyz-test-plugin-three',
        track: trackSpyTwo,
      }
    ]
  })

  // Run track call
  analytics.track('buttonClicked', callback)

  setTimeout(function() {
    expect(trackSpy).not.toBeCalled()
    expect(trackSpyTwo).not.toBeCalled()
    expect(callback).not.toBeCalled()
    done()
  }, 3000)
})


it('should abort \'xyz-test-plugin\' track calls if trackStart returns abort("xyz-test-plugin")', (done) => {
  const trackSpy = jest.fn()
  const trackSpyTwo = jest.fn()
  const callback = jest.fn()
  const analytics = Analytics({
    app: 'appname',
    version: 100,
    plugins: [
      {
        NAMESPACE: 'xyz-test-plugin',
        track: trackSpy,
      },
      {
        NAMESPACE: 'xyz-test-plugin-two',
        trackStart: ({ abort }) => {
          return abort('stop all other track calls', ['xyz-test-plugin'])
        },
      },
      {
        NAMESPACE: 'xyz-test-plugin-three',
        track: trackSpyTwo,
      }
    ]
  })

  // Run track call
  analytics.track('buttonClicked', callback)

  setTimeout(function() {
    expect(trackSpy).not.toBeCalled()
    expect(trackSpyTwo).toBeCalled()
    expect(trackSpyTwo).toHaveBeenCalledTimes(1)
    expect(callback).toBeCalled()
    expect(callback).toHaveBeenCalledTimes(1)
    done()
  }, 3000)
})
