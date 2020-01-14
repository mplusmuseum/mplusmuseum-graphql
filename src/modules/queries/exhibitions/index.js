const Config = require('../../../classes/config')
const common = require('../common.js')
const logging = require('../../logging')

/*
##########################################################
##########################################################

This is where we get all the exhibitions

##########################################################
##########################################################
*/
const getExhibitions = async (args, context, levelDown = 3, initialCall = false) => {
  const startTime = new Date().getTime()
  const config = new Config()
  const baseTMS = config.get('baseTMS')
  if (baseTMS === null) return []

  const index = `exhibitions_${baseTMS}`

  //  Set up the client
  let cacheable = true
  //  If we are the dashboard (or ourself) don't use a cached query
  if (context.isSelf || context.isDashboard) cacheable = false
  const page = common.getPage(args)
  const perPage = common.getPerPage(args)
  const body = {
    from: page * perPage,
    size: perPage
  }

  //  Check to see if we have been passed valid sort fields values, if we have
  //  then use that for a sort. Otherwise use a default one
  const keywordFields = ['type']
  const validFields = ['id', 'title', 'type', 'begindate', 'enddate']
  const validSorts = ['asc', 'desc']
  if ('sort_field' in args && validFields.includes(args.sort_field.toLowerCase()) && 'sort' in args && (validSorts.includes(args.sort.toLowerCase()))) {
    //  To actually sort on a title we need to really sort on `title.keyword`
    let sortField = args.sort_field
    if (keywordFields.includes(sortField.toLowerCase())) sortField = `${sortField}.keyword`

    //  Special cases
    if (sortField === 'title') sortField = `title.${args.lang}.keyword`

    //  For objects we want to actually want to sort by the _id
    const sortObj = {}
    sortObj[sortField] = {
      order: args.sort
    }
    body.sort = [sortObj]
  } else {
    body.sort = [{
      id: {
        order: 'asc'
      }
    }]
  }

  const must = []

  //  Sigh, very bad way to add filters
  //  NOTE: This doesn't combine filters
  if ('ids' in args && Array.isArray(args.ids)) {
    must.push({
      terms: {
        id: args.ids
      }
    })
  }

  if ('type' in args && args.type !== '') {
    const pushThis = {
      match: {}
    }
    pushThis.match[`type.keyword`] = args.type
    must.push(pushThis)
  }

  if ('title' in args && args.title !== '') {
    //  Don't cache when doing string searches
    cacheable = false
    must.push({
      multi_match: {
        query: args.title,
        type: 'best_fields',
        fields: ['title.en'],
        operator: 'or'
      }
    })
  }

  if ('keyword' in args && args.title !== '') {
    //  Don't cache when doing string searches
    cacheable = false
    must.push({
      multi_match: {
        query: args.keyword,
        type: 'best_fields',
        fields: ['title.en', 'type', 'venues.titles.en', 'venues.venues.en.title'],
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

  //  Run the search
  const results = await common.doCacheQuery(cacheable, index, body)

  let total = null
  if (results.hits.total) total = results.hits.total

  let records = results.hits.hits.map((hit) => hit._source).map((record) => {
    //  Grab the name
    //  Get the rest of the data by language
    record.title = common.getSingleTextFromArrayByLang(record.title, args.lang)
    record.beginDate = record.beginDateStr
    record.endDate = record.endDateStr

    //  Now go sort out all the venues filtering for language
    let venues = []
    if (record.venues && record.venues.venues) {
      let useLang = args.lang
      if (!(useLang in record.venues.venues)) {
        if ('en' in record.venues.venues) {
          useLang = 'en'
        } else {
          if ('zh-hant' in record.venues.venues && record.venues.venues['zh-hant'].length) {
            useLang = 'zh-hant'
          }
        }
      }
      record.venues.venues[useLang].forEach((venue) => {
        const venueObj = {}
        if (venue.title) venueObj.title = venue.title
        if (venue.beginDateStr) venueObj.beginDate = venue.beginDateStr
        if (venue.endDateStr) venueObj.endDate = venue.endDateStr
        venues.push(venueObj)
      })
    }
    //  If there aren't any, return null
    if (venues.length === 0) venues = null
    record.venues = venues

    record.exhCitationOnline = common.getSingleTextFromArrayByLang(record.exhCitationOnline, args.lang)

    //  Fill things with deafult language if null
    if (args.lang !== 'en') {
      if (!record.exhCitationOnline) common.getSingleTextFromArrayByLang(record.exhCitationOnline, 'en')
    }

    return record
  })

  //  If we are in here the 1st time, then we get more info about the objects
  //  but if we are any deeper levels down then we don't want to go and fetch any more
  async function asyncForEach (array, callback) {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array)
    }
  }

  if (levelDown <= 2) {
    const newRecords = []
    const start = async () => {
      await asyncForEach(records, async (record) => {
        const newArgs = {
          lang: args.lang,
          exhibition: record.id,
          per_page: 50
        }
        //  Did we have any filters that needed to be passed on from the
        //  single constituent to the objects query
        if (args.object_per_page) newArgs.per_page = args.object_per_page
        if (args.object_page) newArgs.page = args.object_page
        if (args.object_category) newArgs.category = args.object_category
        if (args.object_area) newArgs.area = args.object_area
        if (args.object_medium) newArgs.medium = args.object_medium
        record.roles = []
        record.objects = await queryObjects.getObjects(newArgs, context, levelDown + 1)
        newRecords.push(record)
      })
    }
    await start()
    records = newRecords
  }

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
  apiLogger.object(`Exhibitions query`, {
    method: 'getExhibitions',
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
exports.getExhibitions = getExhibitions

exports.getExhibition = async (args, context, initialCall = false) => {
  const startTime = new Date().getTime()
  args.ids = [args.id]
  if (args.per_page) args.object_per_page = args.per_page
  if (args.page) args.object_page = args.page
  if (args.category) args.object_category = args.category
  if (args.area) args.object_area = args.area
  if (args.medium) args.object_medium = args.medium
  delete args.per_page
  delete args.page
  delete args.category
  delete args.area
  delete args.medium
  const exhibitionsArray = await getExhibitions(args, context, 1)

  const apiLogger = logging.getAPILogger()
  apiLogger.object(`Exhibition query`, {
    method: 'getExhibition',
    args,
    context,
    initialCall,
    subCall: !initialCall,
    ms: new Date().getTime() - startTime
  })

  if (Array.isArray(exhibitionsArray)) return exhibitionsArray[0]
  return null
}

const queryObjects = require('../objects')
