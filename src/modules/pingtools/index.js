const Config = require('../../classes/config')
const Elasticsearch = require('elasticsearch')

/**
 * This pings elastic search to see if it's up
 * @return {null/number} Null if no connection, milliseconds if we did
 */
const pingES = async () => {
  const config = new Config()
  const startTime = new Date().getTime()
  const elasticsearchJSON = config.get('elasticsearch')

  let worked = false
  if (elasticsearchJSON !== null) {
    //  We want to add error suppression to the client so it doesn't throw
    //  errors (which sometimes will) on the ping test. We want to know the
    //  response is 'null', we don't need all the error messages in our logs
    //  TODO: actually we may want the errors in logs and we should change the
    //  `type` to be a log file rather than console
    const client = elasticsearchJSON
    client.log = [{
      type: 'stdio',
      levels: []
    }]
    const esclient = new Elasticsearch.Client(client)
    try {
      worked = await esclient.ping()
    } catch (er) {
      worked = false
    }
  }
  const endTime = new Date().getTime()
  const ping = {
    ms: endTime - startTime,
    timestamp: endTime,
    valid: worked
  }

  if (!('elasticsearchping' in global)) {
    global.elasticsearchping = []
  }
  global.elasticsearchping.unshift(ping)
  global.elasticsearchping = global.elasticsearchping.slice(0, 30)
}
exports.pingES = pingES
exports.startPingingES = () => {
  //  Ping GrahpQL
  global.pingESTmr = setInterval(() => {
    pingES()
  }, 60 * 1000)
  pingES()
}