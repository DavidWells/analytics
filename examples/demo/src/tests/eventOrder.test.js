import Analytics from 'analytics'

// https://github.com/sapegin/jest-cheat-sheet#done-callback

it('Should fire events in order', (done) => {
  let order = []

  const analytics = Analytics({
    app: 'appname',
    version: 100,
    plugins: [
      {
        NAMESPACE: 'test-plugin',
        track: () => {},
        page: () => {}
      },
      {
        NAMESPACE: 'test-plugin-two',
        track: () => {},
        page: () => {}
      }
    ]
  })

  analytics.on('*', ({ payload }) => {
    order.push(payload)
  })

  analytics.track('hi', ({ payload }) => {
    const events = order.map((item) => {
      return item.type
    })
    // console.log('events', events)
    expect(events[0]).toBe('trackStart')
    expect(events[1]).toBe('track:test-plugin')
    expect(events[2]).toBe('track:test-plugin-two')
    expect(events[3]).toBe('track')
    expect(events[events.length - 1]).toBe('trackEnd')

    done()
  })
})

it('Should fire listeners in order', (done) => {
  let order = []

  const analytics = Analytics({
    app: 'appname',
    version: 100,
    plugins: [
      {
        NAMESPACE: 'test-plugin',
        page: () => {},
        bootstrap: ({ abort, config, instance }) => {
          instance.on('pageStart', () => {
            order.push(1)
          })
          instance.on('page:test-plugin', () => {
            order.push(2)
          })
          instance.on('page', () => {
            order.push(3)
          })
          instance.on('pageStart:lifecycle-example', () => {
            console.log('on("pageStart:lifecycle-example") handler')
          })
          instance.on('pageEnd', () => {
            order.push(4)
          })
          instance.on('pageEnd:lifecycle-example', () => {
            console.log('on("pageEnd:lifecycle-example") handler')
          })
        },
      }
    ]
  })

  analytics.page(({ payload }) => {
    console.log('order', order)
    // console.log('events', events)
    expect(order[0]).toBe(1)
    expect(order[1]).toBe(2)
    expect(order[2]).toBe(3)
    expect(order[3]).toBe(4)
    expect(order[order.length - 1]).toBe(4)

    done()
  })
})
