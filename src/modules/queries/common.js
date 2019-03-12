const Config = require('../../classes/config')
const elasticsearch = require('elasticsearch')
const logging = require('../logging')
const crypto = require('crypto')

const doCacheQuery = async (cacheable, index, body) => {
  const config = new Config()
  const elasticsearchConfig = config.get('elasticsearch')

  //  This is the empty dataset we return if we fail
  //  to do any of the things
  const emptyDataSet = {
    hits: {
      hits: []
    }
  }

  //  Set up the connection
  if (elasticsearchConfig === null) {
    return emptyDataSet
  }
  const esclient = new elasticsearch.Client(elasticsearchConfig)

  //  Hash the query body
  const bodyhash = crypto
    .createHash('md5')
    .update(JSON.stringify(body))
    .digest('hex')

  //  If we have been passed a cacheable results, and we aleady have the
  //  results in cache then get it back out
  if (cacheable && global.queryCache && global.queryCache[bodyhash] && global.queryCache[bodyhash].expire > new Date().getTime()) {
    const deepStringResults = JSON.stringify(global.queryCache[bodyhash].results)
    const deepJSONCopy = JSON.parse(deepStringResults)
    return deepJSONCopy
  }

  //  If we didn't just pull the results out of cache, then go and get them
  //  Grab the results
  const results = await esclient.search({
    index,
    body
  }).catch((err) => {
    console.error(err)
    return emptyDataSet
  })

  //  If the results are cacheable, then pop them back into cache
  if (cacheable) {
    if (!global.queryCache) global.queryCache = {}
    const deepStringResults = JSON.stringify(results)
    const deepJSONCopy = JSON.parse(deepStringResults)
    const cacheExpiresLimitMins = 10 // Cache for 10 minu
    global.queryCache[bodyhash] = {
      expire: new Date().getTime() + (cacheExpiresLimitMins * 60 * 1000),
      results: deepJSONCopy
    }
  }

  //  Return the results
  return results
}
exports.doCacheQuery = doCacheQuery

const getPage = (args) => {
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
exports.getPage = getPage

const getPerPage = (args) => {
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
exports.getPerPage = getPerPage

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

const getSingleTextFromArrayByLang = (thisObj, lang) => {
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
exports.getSingleTextFromArrayByLang = getSingleTextFromArrayByLang

//  Notice this only works with 2 languages!!!
exports.getSingleTextFromArrayByNotLang = (thisObj, lang) => {
  //  If we can't find the language in the object then
  //  fall back to 'en' and try again
  if (!thisObj) return null

  const matchingText = getSingleTextFromArrayByLang(thisObj, lang)
  let titleOther = null
  Object.entries(thisObj).forEach((entry) => {
    const value = entry[1]
    if (value !== matchingText) titleOther = value
  })
  //  Make sure it's actually null if it's nothing at all
  if (titleOther === '') titleOther = null
  return titleOther
}

exports.getMakerRoles = async (index) => {
  const cacheable = true
  const body = {
    from: 0,
    size: 200
  }
  const results = await doCacheQuery(cacheable, index, body)
  if (results && results.hits && results.hits.hits) {
    const makers = results.hits.hits
    const isMaker = {}
    makers.forEach((maker) => {
      isMaker[maker._source.id] = maker._source.value
    })
    return isMaker
  }
  return {}
}

const getAggregates = async (args, field, index) => {
  //  Set up the client
  const cacheable = true
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

  const must = []

  if ('publicAccess' in args) {
    must.push({
      match: {
        'publicAccess': args.publicAccess
      }
    })
  }

  if ('collectionCode' in args && args.collectionCode !== '') {
    must.push({
      match: {
        'collectionCode': args.collectionCode
      }
    })
  }

  if ('collectionType' in args && args.collectionType !== '') {
    must.push({
      match: {
        'collectionType': args.collectionType
      }
    })
  }

  if ('collectionName' in args && args.collectionName !== '') {
    must.push({
      match: {
        'collectionName': args.collectionName
      }
    })
  }

  if ('department' in args && args.department !== '') {
    must.push({
      match: {
        'department': args.department
      }
    })
  }

  if ('style' in args && args.style !== '') {
    must.push({
      match: {
        'style': args.style
      }
    })
  }

  if ('constituent' in args && args.constituent !== '') {
    must.push({
      match: {
        'consituents.ids': args.constituent
      }
    })
  }

  if ('area' in args && args.area !== '') {
    must.push({
      multi_match: {
        query: args.area,
        type: 'best_fields',
        fields: ['classification.area.areacat.en.keyword', 'classification.area.areacat.zh-hant.keyword'],
        operator: 'or'
      }
    })
  }

  if ('category' in args && args.category !== '') {
    must.push({
      multi_match: {
        query: args.category,
        type: 'best_fields',
        fields: ['classification.category.areacat.en.keyword', 'classification.category.areacat.zh-hant.keyword'],
        operator: 'or'
      }
    })
  }

  if ('archivalLevel' in args && args.archivalLevel !== '') {
    must.push({
      multi_match: {
        query: args.archivalLevel,
        type: 'best_fields',
        fields: ['classification.archivalLevel.areacat.en.keyword', 'classification.archivalLevel.areacat.zh-hant.keyword'],
        operator: 'or'
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
  const results = await doCacheQuery(cacheable, index, body)

  const records = results.aggregations.results.buckets

  return records.map((record) => {
    return {
      title: record.key,
      count: record.doc_count
    }
  })
}

exports.getAreas = async (args, context, levelDown = 3, initialCall = false) => {
  const startTime = new Date().getTime()
  const config = new Config()
  const baseTMS = config.get('baseTMS')
  if (baseTMS === null) return []

  const aggs = getAggregates(args, `classification.area.areacat.${args.lang}.keyword`, `objects_${baseTMS}`)
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
  const config = new Config()
  const baseTMS = config.get('baseTMS')
  if (baseTMS === null) return []

  const aggs = getAggregates(args, `classification.category.areacat.${args.lang}.keyword`, `objects_${baseTMS}`)
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

exports.getArchivalLevels = async (args, context, levelDown = 3, initialCall = false) => {
  const startTime = new Date().getTime()
  const config = new Config()
  const baseTMS = config.get('baseTMS')
  if (baseTMS === null) return []

  const aggs = getAggregates(args, `classification.archivalLevel.areacat.${args.lang}.keyword`, `objects_${baseTMS}`)
  const apiLogger = logging.getAPILogger()
  apiLogger.object(`ArchivalLevels query`, {
    method: 'getArchivalLevels',
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
  const config = new Config()
  const baseTMS = config.get('baseTMS')
  if (baseTMS === null) return []

  const aggs = getAggregates(args, `medium.${args.lang}.keyword`, `objects_${baseTMS}`)
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

exports.getStatuses = async (args, context, levelDown = 3, initialCall = false) => {
  const startTime = new Date().getTime()
  const config = new Config()
  const baseTMS = config.get('baseTMS')
  if (baseTMS === null) return []

  const aggs = getAggregates(args, `objectStatus.${args.lang}.keyword`, `objects_${baseTMS}`)
  const apiLogger = logging.getAPILogger()
  apiLogger.object(`objectStatus query`, {
    method: 'getStatuses',
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

exports.getNames = async (args, context, levelDown = 3, initialCall = false) => {
  const startTime = new Date().getTime()
  const config = new Config()
  const baseTMS = config.get('baseTMS')
  if (baseTMS === null) return []

  const aggs = getAggregates(args, `objectName.${args.lang}.keyword`, `objects_${baseTMS}`)
  const apiLogger = logging.getAPILogger()
  apiLogger.object(`objectNames query`, {
    method: 'getNames',
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

exports.getCollectionCodes = async (args, context, levelDown = 3, initialCall = false) => {
  const startTime = new Date().getTime()
  const config = new Config()
  const baseTMS = config.get('baseTMS')
  if (baseTMS === null) return []

  const aggs = getAggregates(args, `collectionCode.keyword`, `objects_${baseTMS}`)
  const apiLogger = logging.getAPILogger()
  apiLogger.object(`collectionCode query`, {
    method: 'getCollectionCodes',
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

exports.getCollectionTypes = async (args, context, levelDown = 3, initialCall = false) => {
  const startTime = new Date().getTime()
  const config = new Config()
  const baseTMS = config.get('baseTMS')
  if (baseTMS === null) return []

  const aggs = getAggregates(args, `collectionType.keyword`, `objects_${baseTMS}`)
  const apiLogger = logging.getAPILogger()
  apiLogger.object(`collectionType query`, {
    method: 'getCollectionTypes',
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

exports.getCollectionNames = async (args, context, levelDown = 3, initialCall = false) => {
  const startTime = new Date().getTime()
  const config = new Config()
  const baseTMS = config.get('baseTMS')
  if (baseTMS === null) return []

  const aggs = getAggregates(args, `collectionName.keyword`, `objects_${baseTMS}`)
  const apiLogger = logging.getAPILogger()
  apiLogger.object(`collectionName query`, {
    method: 'getCollectionNames',
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

exports.getDepartments = async (args, context, levelDown = 3, initialCall = false) => {
  const startTime = new Date().getTime()
  const config = new Config()
  const baseTMS = config.get('baseTMS')
  if (baseTMS === null) return []

  const aggs = getAggregates(args, `department.keyword`, `objects_${baseTMS}`)
  const apiLogger = logging.getAPILogger()
  apiLogger.object(`department query`, {
    method: 'getDepartments',
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

exports.getStyles = async (args, context, levelDown = 3, initialCall = false) => {
  const startTime = new Date().getTime()
  const config = new Config()
  const baseTMS = config.get('baseTMS')
  if (baseTMS === null) return []

  const aggs = getAggregates(args, `style.keyword`, `objects_${baseTMS}`)
  const apiLogger = logging.getAPILogger()
  apiLogger.object(`style query`, {
    method: 'getStyles',
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

exports.getMakerTypes = async (args, context, levelDown = 3, initialCall = false) => {
  const config = new Config()
  const baseTMS = config.get('baseTMS')
  if (baseTMS === null) return []

  const index = `config_ismakers_${baseTMS}`

  //  Set up the client
  const cacheable = true
  const body = {
    from: 0,
    size: 1000
  }
  const objects = await doCacheQuery(cacheable, index, body)
  let records = objects.hits.hits.map((hit) => hit._source).map((record) => {
    record.title = record.id
    return record
  })

  return records
}
