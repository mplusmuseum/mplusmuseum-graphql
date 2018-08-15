/**
 * This module allows us to grab an API token from auth0
 * @module modules/auth0
 */
const request = require('request-promise')
const Config = require('../../classes/config')

/**
 * Gets us the token we need to call further API methods on the Auth0 endpoint
 * @returns {string|Array} The bearer token used in future API calls, or an Array
 * an error was generated.
 */
exports.getAuth0Token = async () => {
  //  First we check to see if we already have a token and if
  //  it's still valid. The expires was a time set into the
  //  future based on what Auth0 API gave us back. As long as
  //  the current time is less than that we are good.
  if ('auth0' in global && 'token' in global.auth0) {
    if (new Date().getTime() < global.auth0.expires) {
      return global.auth0.token
    }
  }

  const config = new Config()
  const auth0 = config.get('auth0')
  if (auth0 === null) {
    return [
      'No auth0 set in config'
    ]
  }

  var options = {
    method: 'POST',
    url: `https://${auth0.AUTH0_DOMAIN}/oauth/token`,
    headers: {
      'content-type': 'application/json'
    },
    body: {
      grant_type: 'client_credentials',
      client_id: auth0.AUTH0_CLIENT_ID,
      client_secret: auth0.AUTH0_SECRET,
      audience: `https://${auth0.AUTH0_DOMAIN}/api/v2/`
    },
    json: true
  }

  const auth0Token = await request(options)
    .then(response => {
      return response
    })
    .catch(error => {
      return [error]
    })

  //  Set the token and the time it expires (to be some point in the future)
  //  We are given back a time in seconds that the token is good for, normally
  //  86,400 which is 24 hours (24 * 60 * 60). As getTime() gives us ms, we
  //  *1000 to get the time at which the token will expire and we'll need a
  //  new one.
  const expires = new Date().getTime() + (auth0Token.expires_in * 1000)
  global.auth0 = {
    token: auth0Token.access_token,
    expires: expires
  }
  return global.auth0.token
}
