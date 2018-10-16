const Config = require('../../classes/config')
const elasticsearch = require('elasticsearch')
const logging = require('../logging')

exports.getPage = (args) => {
  const defaultPage = 0
  if ('page' in args) {
    try {
      const page = parseInt(args.page, 10)
      if (page < 0) {
        return defaultPage
      }
      return page
    } catch (er) {
      return defaultPage
    }
  }
  return defaultPage
}

exports.getPerPage = (args) => {
  const defaultPerPage = 50
  if ('per_page' in args) {
    try {
      const perPage = parseInt(args.per_page, 10)
      if (perPage < 0) {
        return defaultPerPage
      }
      return perPage
    } catch (er) {
      return defaultPerPage
    }
  }
  return defaultPerPage
}

const getAggPerPage = (args) => {
  const defaultPerPage = 10000
  if ('per_page' in args) {
    try {
      const perPage = parseInt(args.per_page, 10)
      if (perPage < 0) {
        return defaultPerPage
      }
      return perPage
    } catch (er) {
      return defaultPerPage
    }
  }
  return defaultPerPage
}

exports.getSingleTextFromArrayByLang = (thisObj, lang) => {
  //  If we can't find the language in the object then
  //  fall back to 'en' and try again

  //  Return null if we don't have an obejct
  if (thisObj === null || thisObj === undefined) return null
  //  If we find the language the just go for it
  if (lang in thisObj) return thisObj[lang]
  //  Otherwise default to English
  if ('en' in thisObj) return thisObj['en']
  //  If that didn't work, then we don't have the language asked for
  //  or english, lets see if we have anything at all, get the keys
  const keys = Object.keys(thisObj)
  //  If we have no keys return null
  if (keys.length === 0) return null
  //  Otherwise just return the first record we can find
  return thisObj[keys[0]]
}

const getAggregates = async (args, field, index) => {
  const config = new Config()

  //  Grab the elastic search config details
  const elasticsearchConfig = config.get('elasticsearch')
  if (elasticsearchConfig === null) {
    return []
  }

  //  Set up the client
  const esclient = new elasticsearch.Client(elasticsearchConfig)
  const perPage = getAggPerPage(args)
  const body = {}

  body.aggs = {
    'results': {
      'terms': {
        'field': field,
        'size': perPage
      }
    }
  }

  // Now let us add extra sorting if needed
  if ('sort_field' in args && (args.sort_field === 'title' || args.sort_field === 'count')) {
    let sortOrder = 'asc'
    if ('sort' in args && args.sort === 'desc') sortOrder = 'desc'
    if (args.sort_field === 'title') {
      body.aggs.results.terms.order = {
        '_key': sortOrder
      }
    } else {
      body.aggs.results.terms.order = {
        '_count': sortOrder
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
  return results.aggregations.results.buckets.map((record) => {
    return {
      title: record.key,
      count: record.doc_count
    }
  })
}

exports.getAreas = async (args, context, levelDown = 3, initialCall = false) => {
  const startTime = new Date().getTime()
  const aggs = getAggregates(args, `classification.area.areacat.${args.lang}.keyword`, 'objects_mplus')
  const apiLogger = logging.getAPILogger()
  apiLogger.object(`Areas query`, {
    method: 'getAreas',
    args,
    context,
    levelDown,
    initialCall,
    subCall: !initialCall,
    records: aggs.length,
    ms: new Date().getTime() - startTime
  })
  return aggs
}

exports.getCategories = async (args, context, levelDown = 3, initialCall = false) => {
  const startTime = new Date().getTime()
  const aggs = getAggregates(args, `classification.category.areacat.${args.lang}.keyword`, 'objects_mplus')
  const apiLogger = logging.getAPILogger()
  apiLogger.object(`Categories query`, {
    method: 'getCategories',
    args,
    context,
    levelDown,
    initialCall,
    subCall: !initialCall,
    records: aggs.length,
    ms: new Date().getTime() - startTime
  })
  return aggs
}

exports.getMediums = async (args, context, levelDown = 3, initialCall = false) => {
  const startTime = new Date().getTime()
  const aggs = getAggregates(args, `medium.${args.lang}.keyword`, 'objects_mplus')
  const apiLogger = logging.getAPILogger()
  apiLogger.object(`Mediums query`, {
    method: 'getMediums',
    args,
    context,
    levelDown,
    initialCall,
    subCall: !initialCall,
    records: aggs.length,
    ms: new Date().getTime() - startTime
  })
  return aggs
}
