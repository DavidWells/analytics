import Analytics from 'analytics'

console.log('Analytics:', Analytics)
console.log('Analytics type:', typeof Analytics)
console.log('Analytics keys:', Object.keys(Analytics))

// Try the workaround
try {
  const analytics = Analytics.default({
    app: 'awesome-app', 
    plugins: []
  })
  console.log('Success with Analytics.default!')
} catch (error) {
  console.error('Failed with Analytics.default:', error.message)
}