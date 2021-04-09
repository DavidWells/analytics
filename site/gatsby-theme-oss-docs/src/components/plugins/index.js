import React from 'react'
import { Link } from 'gatsby'
import styles from './plugins.css'

const cdnRoot = 'https://d36ubspakw5kl4.cloudfront.net'

const makeTweet = (name) => {
  return `https://twitter.com/intent/tweet?url=https%3A%2F%2Fgetanalytics.io%2Fplugins%2Frequest%2F&text=Hey%20@davidwells%0ACan%20analytics%20support%20${name}%20please%3F`
}

export const SupportedPlugins = () => {
  const supportedTools = tools.filter((tool) => {
    return tool.url
  }).map((tool) => {
    return (
      <Link key={tool.name} to={`/plugins/${tool.name}/`} className='provider'>
        <img alt={tool.name} src={`${cdnRoot}/${tool.image}`} />
      </Link>
    )
  })
  return (
    <div className='provider-wrapper'>
      {supportedTools}
    </div>
  )
}

export const RequestPlugins = () => {
  const requestTools = tools.filter((tool) => {
    return !tool.url
  }).map((tool) => {
    return (
      <a key={tool.name} className='provider' href={makeTweet(tool.name)} target='_blank' rel='noopener noreferrer'>
        <img alt={tool.name} src={`${cdnRoot}/${tool.image}`} />
      </a>
    )
  })
  return (
    <div className='provider-wrapper'>
      {requestTools}
    </div>
  )
}

var tools = [
  {
    'name': 'google-analytics',
    'image': 'google-analytics.svg',
    url: 'https://getanalytics.io/plugins/google-analytics/'
  },
  {
    'name': 'google-tag-manager',
    'image': 'google-tag-manager.svg',
    url: 'https://getanalytics.io/plugins/google-tag-manager/'
  },
  {
    name: 'customerio',
    image: 'customer-io.svg',
    url: 'https://getanalytics.io/plugins/customerio/'
  },
  {
    name: 'snowplow',
    image: 'snowplow.svg',
    url: 'https://getanalytics.io/plugins/snowplow/'
  },
  {
    name: 'fullstory',
    image: 'fullstory.svg',
    url: 'https://getanalytics.io/plugins/fullstory/'
  },
  // {
  //   name: 'aws-pinpoint',
  //   image: 'aws-pinpoint.svg',
  //   url: 'https://getanalytics.io/plugins/aws-pinpoint/'
  // },
  {
    name: 'amplitude',
    image: 'amplitude.svg',
    url: 'https://getanalytics.io/plugins/amplitude/'
  },
  {
    name: 'segment',
    image: 'segment.svg',
    url: 'https://getanalytics.io/plugins/segment/'
  },
  {
    name: 'mixpanel',
    image: 'mixpanel.svg',
    url: 'https://getanalytics.io/plugins/mixpanel/'
  },
  {
    'name': 'adlearn-open-platform',
    'image': 'adlearn-open-platform.svg'
  },
  {
    'name': 'adobe-analytics',
    'image': 'adobe-analytics.svg'
  },
  {
    'name': 'adtriba',
    'image': 'adtriba.svg'
  },
  {
    'name': 'alexa',
    'image': 'alexa.svg'
  },
  {
    'name': 'amplitude',
    'image': 'amplitude.svg'
  },
  {
    'name': 'asayer',
    'image': 'asayer.svg'
  },
  {
    'name': 'auryc',
    'image': 'auryc.svg'
  },
  {
    'name': 'blendo',
    'image': 'blendo.svg'
  },
  {
    'name': 'bytegain',
    'image': 'bytegain.svg'
  },
  {
    'name': 'calq',
    'image': 'calq.svg'
  },
  {
    'name': 'chartbeat',
    'image': 'chartbeat.svg'
  },
  {
    'name': 'clearbrain',
    'image': 'clearbrain.svg'
  },
  {
    'name': 'clevertap',
    'image': 'clevertap.svg'
  },
  {
    'name': 'clicky',
    'image': 'clicky.svg'
  },
  {
    'name': 'comscore',
    'image': 'comscore.svg'
  },
  {
    'name': 'countly',
    'image': 'countly.svg'
  },
  {
    name: 'crazyegg',
    image: 'crazyegg.svg',
    url: 'https://getanalytics.io/plugins/crazyegg/'
  },
  {
    'name': 'cruncher',
    'image': 'cruncher.svg'
  },
  {
    'name': 'custify',
    'image': 'custify.svg'
  },


  {
    'name': 'customersuccessbox',
    'image': 'customersuccessbox.svg'
  },
  {
    'name': 'emarsys',
    'image': 'emarsys.svg'
  },
  {
    'name': 'emma',
    'image': 'emma.svg'
  },
  {
    'name': 'epica',
    'image': 'epica.svg'
  },
  {
    'name': 'evergage',
    'image': 'evergage.svg'
  },
  {
    'name': 'facebook-app-events',
    'image': 'facebook-app-events.svg'
  },
  {
    'name': 'factorsai',
    'image': 'factorsai.svg'
  },
  {
    'name': 'firebase',
    'image': 'firebase.svg'
  },
  {
    'name': 'flurry',
    'image': 'flurry.svg'
  },
  {
    'name': 'foxmetrics',
    'image': 'foxmetrics.svg'
  },
  {
    'name': 'funnelfox',
    'image': 'funnelfox.svg'
  },

  {
    'name': 'gainsight-px',
    'image': 'gainsight-px.svg'
  },
  {
    'name': 'gainsight',
    'image': 'gainsight.svg'
  },
  {
    'name': 'gauges',
    'image': 'gauges.png'
  },
  {
    'name': 'goedle.io',
    'image': 'goedle.io.svg'
  },
  {
    'name': 'gosquared',
    'image': 'gosquared.svg',
    url: 'https://getanalytics.io/plugins/gosquared/'
  },
  {
    'name': 'heap',
    'image': 'heap.svg'
  },
  {
    'name': 'hittail',
    'image': 'hittail.svg'
  },
  {
    name: 'hubspot',
    image: 'hubspot.svg',
    url: 'https://getanalytics.io/plugins/hubspot/'
  },
  {
    name: 'hydra',
    image: 'hydra.svg'
  },
  {
    'name': 'ibm-ubx',
    'image': 'ibm-ubx.jpg'
  },
  {
    'name': 'indicative',
    'image': 'indicative.svg'
  },
  {
    'name': 'keen',
    'image': 'keen.svg'
  },
  {
    'name': 'kissmetrics',
    'image': 'kissmetrics.svg'
  },
  {
    'name': 'kitemetrics',
    'image': 'kitemetrics.svg'
  },
  {
    'name': 'librato',
    'image': 'librato.svg'
  },
  {
    'name': 'localytics',
    'image': 'localytics.svg'
  },
  {
    'name': 'lytics',
    'image': 'lytics.svg'
  },
  {
    'name': 'madkudu',
    'image': 'madkudu.svg'
  },
  {
    'name': 'moengage',
    'image': 'moengage.svg'
  },
  {
    'name': 'mutiny',
    'image': 'mutiny.svg'
  },
  {
    'name': 'new-relic',
    'image': 'new-relic.svg'
  },
  {
    'name': 'nielsen-dcr',
    'image': 'nielsen-dcr.svg'
  },
  {
    'name': 'northstar-by-growthhackers',
    'image': 'northstar-by-growthhackers.svg'
  },
  {
    'name': 'parsely',
    'image': 'parsely.svg'
  },
  {
    'name': 'pendo',
    'image': 'pendo.svg'
  },
  {
    'name': 'piwik',
    'image': 'piwik.svg'
  },
  {
    'name': 'pixelme',
    'image': 'pixelme.svg'
  },
  {
    'name': 'pointillist',
    'image': 'pointillist.svg'
  },
  {
    'name': 'quantcast',
    'image': 'quantcast.svg'
  },
  {
    'name': 'refersion',
    'image': 'refersion.svg'
  },
  {
    'name': 'refiner',
    'image': 'refiner.svg'
  },
  {
    'name': 'scopeai',
    'image': 'scopeai.svg'
  },

  {
    'name': 'serenytics',
    'image': 'serenytics.svg'
  },
  {
    'name': 'sherlock',
    'image': 'sherlock.svg'
  },
  {
    'name': 'singular',
    'image': 'singular.svg'
  },
  {
    name: 'simple-analytics',
    image: 'simple-analytics.jpg',
    url: 'https://getanalytics.io/plugins/simple-analytics/'
  },
  {
    'name': 'slicingdice',
    'image': 'slicingdice.svg'
  },
  {
    'name': 'smartlook',
    'image': 'smartlook.svg'
  },
  {
    'name': 'smbstreams',
    'image': 'smbstreams.svg'
  },
  {
    'name': 'split',
    'image': 'split.svg'
  },
  {
    'name': 'strikedeck',
    'image': 'strikedeck.svg'
  },
  {
    'name': 'survicate',
    'image': 'survicate.svg'
  },
  {
    'name': 'swrve',
    'image': 'swrve.svg'
  },
  {
    'name': 'tamber',
    'image': 'tamber.svg'
  },
  {
    'name': 'tractionboard',
    'image': 'tractionboard.svg'
  },
  {
    'name': 'trafficguard',
    'image': 'trafficguard.svg'
  },
  {
    'name': 'treasure-data',
    'image': 'treasure-data.svg'
  },
  {
    'name': 'unwaffle',
    'image': 'unwaffle.svg'
  },
  {
    'name': 'useriq',
    'image': 'useriq.svg'
  },
  {
    'name': 'walkme',
    'image': 'walkme.svg'
  },
  {
    'name': 'webengage',
    'image': 'webengage.svg'
  },
  {
    'name': 'whale-watch',
    'image': 'whale-watch.svg'
  },
  {
    'name': 'wigzo',
    'image': 'wigzo.svg'
  },
  {
    'name': 'woopra',
    'image': 'woopra.svg'
  },
  {
    'name': 'xtremepush',
    'image': 'xtremepush.svg'
  },
  {
    'name': 'yandex-metrica',
    'image': 'yandex-metrica.svg'
  },
  {
    'name': 'youbora',
    'image': 'youbora.svg'
  }
]
