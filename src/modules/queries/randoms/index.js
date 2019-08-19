const Config = require('../../../classes/config')
const common = require('../common.js')
const logging = require('../../logging')

/*
##########################################################
##########################################################

This is where we get all the randoms

##########################################################
##########################################################
*/
const getRandoms = async (args, context, levelDown = 3, initialCall = false) => {
  const startTime = new Date().getTime()
  const config = new Config()
  const baseTMS = config.get('baseTMS')
  if (baseTMS === null) return []

  const index = `randoms_${baseTMS}`

  //  Set up the client
  const cacheable = true
  const page = common.getPage(args)
  const perPage = common.getPerPage(args)
  const body = {
    from: page * perPage,
    size: perPage
  }

  const must = []

  if (must.length > 0) {
    body.query = {
      bool: {
        must
      }
    }
  }

  //  Run the search
  const results = await common.doCacheQuery(cacheable, index, body)

  let total = null
  if (results.hits.total) total = results.hits.total

  let records = results.hits.hits.map((hit) => {
    //  Now get the title
    const record = hit._source
    const newRecord = {
      id: hit._id
    }
    if (record.random) {
      if (record.random.en) newRecord.text = record.random.en
      if (record.random['zh-hant']) newRecord.textTC = record.random['zh-hant']
    }
    return newRecord
  })

  //  Finally, add the pagination information
  const sys = {
    pagination: {
      page,
      perPage,
      total
    }
  }
  if (total !== null) {
    sys.pagination.maxPage = Math.ceil(total / perPage) - 1
  }
  if (records.length > 0) {
    records[0]._sys = sys
  }

  const apiLogger = logging.getAPILogger()
  apiLogger.object(`Randoms query`, {
    method: 'getRandoms',
    args,
    context,
    levelDown,
    initialCall,
    subCall: !initialCall,
    records: records.length,
    ms: new Date().getTime() - startTime
  })

  return records
}
exports.getRandoms = getRandoms
