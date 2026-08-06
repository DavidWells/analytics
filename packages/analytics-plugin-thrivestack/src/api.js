/**
 * ThriveStack API client for making server-side requests
 */

/**
 * Make a request to the ThriveStack API
 * @param {string} endpoint - API endpoint
 * @param {object} data - Data to send to the API
 * @param {object} options - Request options
 * @param {string} apiKey - ThriveStack API key
 * @returns {Promise} - API response
 */
async function makeRequest(endpoint, data = {}, options = {}, apiKey) {
    if (!apiKey) {
      throw new Error('API key is required for ThriveStack API requests')
    }
  
    const baseUrl = options.baseUrl || 'https://api.thrivestack.io'
    const url = `${baseUrl}/${endpoint}`
  
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          ...options.headers
        },
        body: JSON.stringify(data)
      })
  
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`ThriveStack API error (${response.status}): ${errorText}`)
      }
  
      return await response.json()
    } catch (error) {
      console.error('ThriveStack API request failed:', error)
      throw error
    }
  }
  
  /**
   * Get events from ThriveStack
   * @param {object} options - Query options
   * @param {string} apiKey - ThriveStack API key
   * @returns {Promise} - API response with events
   */
  export async function getEvents(options = {}, apiKey) {
    const { startDate, endDate, limit = 100, offset = 0, ...restOptions } = options
    
    const queryParams = {
      startDate,
      endDate,
      limit,
      offset,
      ...restOptions
    }
    
    return makeRequest('events', queryParams, {}, apiKey)
  }
  
  /**
   * Get page visits from ThriveStack
   * @param {object} options - Query options
   * @param {string} apiKey - ThriveStack API key
   * @returns {Promise} - API response with page visits
   */
  export async function getPageVisits(options = {}, apiKey) {
    const { startDate, endDate, limit = 100, offset = 0, ...restOptions } = options
    
    const queryParams = {
      startDate,
      endDate,
      limit,
      offset,
      ...restOptions
    }
    
    return makeRequest('page-visits', queryParams, {}, apiKey)
  }
  
  /**
   * Get user data from ThriveStack
   * @param {string} userId - User ID
   * @param {object} options - Query options
   * @param {string} apiKey - ThriveStack API key
   * @returns {Promise} - API response with user data
   */
  export async function getUserData(userId, options = {}, apiKey) {
    if (!userId) {
      throw new Error('User ID is required to get user data')
    }
    
    return makeRequest(`users/${userId}`, {}, options, apiKey)
  }
  
  /**
   * Get dashboard statistics from ThriveStack
   * @param {object} options - Query options
   * @param {string} apiKey - ThriveStack API key
   * @returns {Promise} - API response with dashboard statistics
   */
  export async function getDashboardStats(options = {}, apiKey) {
    const { period = '7d', ...restOptions } = options
    
    const queryParams = {
      period,
      ...restOptions
    }
    
    return makeRequest('dashboard/stats', queryParams, {}, apiKey)
  }
  
  export default {
    getEvents,
    getPageVisits,
    getUserData,
    getDashboardStats
  }