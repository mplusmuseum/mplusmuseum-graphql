const Config = require('../../../classes/config')
const common = require('../common.js')
const logging = require('../../logging')

/*
##########################################################
##########################################################

This is where we get all the bibliographies

##########################################################
##########################################################
*/
const getBibliographies = async (args, context, levelDown = 3, initialCall = false) => {
  const startTime = new Date().getTime()
  const config = new Config()
  const baseTMS = config.get('baseTMS')
  if (baseTMS === null) return []

  const index = `bibiolographicdata_${baseTMS}`

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
  const keywordFields = []
  const validFields = ['id', 'title']
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

  //  Sigh, very bad way to add filters
  //  NOTE: This doesn't combine filters
  if ('ids' in args && Array.isArray(args.ids)) {
    must.push({
      terms: {
        id: args.ids
      }
    })
  }

  //  If this query is too specific then don't cache it
  if (must.length > 4) {
    cacheable = false
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
    return record
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
  apiLogger.object(`Bibliographies query`, {
    method: 'getBibliographies',
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
exports.getBibliographies = getBibliographies

exports.getBibliography = async (args, context, initialCall = false) => {
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
  const bibliographiesArray = await getBibliographies(args, context, 1)

  const apiLogger = logging.getAPILogger()
  apiLogger.object(`Bibliographies query`, {
    method: 'getBibliography',
    args,
    context,
    initialCall,
    subCall: !initialCall,
    ms: new Date().getTime() - startTime
  })

  if (Array.isArray(bibliographiesArray)) return bibliographiesArray[0]
  return null
}
