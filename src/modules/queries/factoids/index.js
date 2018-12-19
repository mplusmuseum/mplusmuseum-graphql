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
  const baseTMS = config.get('baseTMS')
  if (baseTMS === null) return []

  const index = `factoids_${baseTMS}`

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

  const must = []
  //  Now the section filters
  if ('isConstituent' in args) {
    must.push({
      match: {
        isConstituent: args.isConstituent
      }
    })
  }
  if ('isArea' in args) {
    must.push({
      match: {
        isArea: args.isArea
      }
    })
  }
  if ('isCategory' in args) {
    must.push({
      match: {
        isCategory: args.isCategory
      }
    })
  }
  if ('isMedium' in args) {
    must.push({
      match: {
        isMedium: args.isMedium
      }
    })
  }
  if ('isArchive' in args) {
    must.push({
      match: {
        isArchive: args.isArchive
      }
    })
  }
  if ('isColour' in args) {
    must.push({
      match: {
        isColour: args.isColour
      }
    })
  }
  if ('isRecommended' in args) {
    must.push({
      match: {
        isRecommended: args.isRecommended
      }
    })
  }
  if ('isPopular' in args) {
    must.push({
      match: {
        isPopular: args.isPopular
      }
    })
  }

  if (must.length > 0) {
    body.query = {
      bool: {
        must
      }
    }
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
    newRecord.isConstituent = (record.isConstituent)
    newRecord.isArea = (record.isArea)
    newRecord.isCategory = (record.isCategory)
    newRecord.isMedium = (record.isMedium)
    newRecord.isArchive = (record.isArchive)
    newRecord.isColour = (record.isColour)
    newRecord.isRecommended = (record.isRecommended)
    newRecord.isPopular = (record.isPopular)
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
