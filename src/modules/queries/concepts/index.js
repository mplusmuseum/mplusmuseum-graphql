const Config = require('../../../classes/config')
const elasticsearch = require('elasticsearch')
const common = require('../common.js')
const logging = require('../../logging')

/*
##########################################################
##########################################################

This is where we get all the concepts

##########################################################
##########################################################
*/
const getConcepts = async (args, context, levelDown = 3, initialCall = false) => {
  const startTime = new Date().getTime()
  const config = new Config()
  const index = 'concepts_mplus'

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

  //  Check to see if we have been passed valid sort fields values, if we have
  //  then use that for a sort. Otherwise use a default one
  const keywordFields = []
  const validFields = ['id', 'title', 'begindate', 'enddate']
  const validSorts = ['asc', 'desc']
  if ('sort_field' in args && validFields.includes(args.sort_field.toLowerCase()) && 'sort' in args && (validSorts.includes(args.sort.toLowerCase()))) {
    //  To actually sort on a title we need to really sort on `title.keyword`
    let sortField = args.sort_field
    if (keywordFields.includes(sortField.toLowerCase())) sortField = `${sortField}.keyword`

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

  //  Only get those who are public access
  if (context.isVendor !== true) {
    must.push({
      match: {
        'publicAccess': true
      }
    })
  }

  //  Sigh, very bad way to add filters
  //  NOTE: This doesn't combine filters
  if ('ids' in args && Array.isArray(args.ids)) {
    must.push({
      terms: {
        id: args.ids
      }
    })
  }

  if ('conceptUse' in args && args.conceptUse !== '') {
    must.push({
      match: {
        'conceptUse.keyword': args.conceptUse
      }
    })
  }

  if ('beginDate' in args && args.beginDate !== '') {
    must.push({
      match: {
        'beginDate': args.beginDate
      }
    })
  }

  if ('endDate' in args && args.endDate !== '') {
    must.push({
      match: {
        'endDate': args.endDate
      }
    })
  }

  if ('title' in args && args.title !== '') {
    must.push({
      multi_match: {
        query: args.title,
        type: 'best_fields',
        fields: ['title.en', 'title.zh-hant'],
        operator: 'or'
      }
    })
  }

  if ('keyword' in args && args.title !== '') {
    must.push({
      multi_match: {
        query: args.keyword,
        type: 'best_fields',
        fields: ['title.en', 'title.zh-hant', 'conceptUse', 'description.en', 'description.zh-hant', 'displayDate', 'timeline'],
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
  const results = await esclient.search({
    index,
    body
  }).catch((err) => {
    console.error(err)
  })

  let total = null
  if (results.hits.total) total = results.hits.total

  let records = results.hits.hits.map((hit) => hit._source).map((record) => {
    //  Now get the title
    if (record.title) {
      let useLang = args.lang
      if (!(useLang in record.title)) {
        if ('en' in record.title) {
          useLang = 'en'
        } else {
          if ('zh-hant' in record.title && record.title['zh-hant'].length) {
            useLang = 'zh-hant'
          }
        }
      }
      if (useLang in record.title) {
        record.title = record.title[useLang]
      }
    }

    //  Now get the title
    if (record.description) {
      let useLang = args.lang
      if (!(useLang in record.description)) {
        if ('en' in record.description) {
          useLang = 'en'
        } else {
          if ('zh-hant' in record.description && record.description['zh-hant'].length) {
            useLang = 'zh-hant'
          }
        }
      }
      if (useLang in record.description) {
        record.description = record.description[useLang]
      }
    }

    return record
  })

  //  If we are in here the 1st time, then we get more info about the objects
  //  but if we are any deeper levels down then we don't want to go and fetch any more
  async function asyncForEach(array, callback) {
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
          concept: record.id,
          per_page: 500
        }
        //  Did we have any filters that needed to be passed on from the
        //  single constituent to the objects query
        if (args.object_per_page) newArgs.per_page = args.object_per_page
        if (args.object_page) newArgs.page = args.object_page
        if (args.object_category) newArgs.category = args.object_category
        if (args.object_area) newArgs.area = args.object_area
        if (args.object_medium) newArgs.medium = args.object_medium
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
  apiLogger.object(`Concepts query`, {
    method: 'getConcepts',
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
exports.getConcepts = getConcepts

exports.getConcept = async (args, context, initialCall = false) => {
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
  const conceptsArray = await getConcepts(args, context, 1)

  const apiLogger = logging.getAPILogger()
  apiLogger.object(`Concept query`, {
    method: 'getConcept',
    args,
    context,
    initialCall,
    subCall: !initialCall,
    ms: new Date().getTime() - startTime
  })

  if (Array.isArray(conceptsArray)) return conceptsArray[0]
  return null
}

const queryObjects = require('../objects')