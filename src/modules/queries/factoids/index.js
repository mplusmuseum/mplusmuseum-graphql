const Config = require('../../../classes/config')
const elasticsearch = require('elasticsearch')
const common = require('../common.js')
const logging = require('../../logging')

/*
##########################################################
##########################################################

This is where we get all the factoids

##########################################################
##########################################################
*/
const getFactoids = async (args, context, levelDown = 3, initialCall = false) => {
  const startTime = new Date().getTime()
  const config = new Config()
  const index = 'factoids_mplus'

  //  Grab the elastic search config details
  const elasticsearchConfig = config.get('elasticsearch')
  if (elasticsearchConfig === null) {
    return []
  }

  //  Set up the client
  const esclient = new elasticsearch.Client(elasticsearchConfig)
  const page = common.getPage(args)
  const perPage = common.getPerPage(args)
  const body = {
    from: page * perPage,
    size: perPage
  }

  //  Run the search
  const results = await esclient.search({
    index,
    body
  }).catch((err) => {
    console.error(err)
  })

  let total = null
  if (results.hits.total) total = results.hits.total

  let records = results.hits.hits.map((hit) => {
    //  Now get the title
    const record = hit._source
    const newRecord = {
      id: hit._id
    }
    if (record.fact) {
      if (record.fact.en) newRecord.text = record.fact.en
      if (record.fact['zh-hant']) newRecord.textTC = record.fact['zh-hant']
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
  apiLogger.object(`Factoids query`, {
    method: 'getFactoids',
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
exports.getFactoids = getFactoids
