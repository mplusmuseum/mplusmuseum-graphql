const elasticsearch = require('elasticsearch')
const Config = require('../../classes/config')

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

const getSingleTextFromArrayByLang = (thisArray, lang) => {
  let match = null

  //  Defensive code
  if (thisArray === null || thisArray === undefined) return null
  if (!Array.isArray(thisArray)) return thisArray

  thisArray.forEach((thing) => {
    if (thing.lang === 'en' && 'text' in thing) match = thing.text
  })
  thisArray.forEach((thing) => {
    if (thing.lang === lang && 'text' in thing) match = thing.text
  })
  return match
}

const getAggregates = async (args, index) => {
  const config = new Config()

  //  Grab the elastic search config details
  const elasticsearchConfig = config.get('elasticsearch')
  if (elasticsearchConfig === null) {
    return []
  }

  //  Set up the client
  const esclient = new elasticsearch.Client(elasticsearchConfig)
  const page = getPage(args)
  const perPage = getPerPage(args)
  const body = {
    from: page * perPage,
    size: perPage
  }
  body.query = {
    'term': {
      'lang.keyword': args.lang
    }
  }
  body.sort = [{
    'count': {
      'order': 'desc'
    }
  }]

  const areas = await esclient.search({
    index,
    body
  }).catch((err) => {
    console.error(err)
  })
  let records = areas.hits.hits.map((hit) => hit._source).map((record) => {
    return record
  })
  return records
}

exports.getAreas = async (args) => {
  return getAggregates(args, 'object_areas_mplus')
}

exports.getCategories = async (args) => {
  return getAggregates(args, 'object_categories_mplus')
}

exports.getMediums = async (args) => {
  return getAggregates(args, 'object_mediums_mplus')
}

const getItems = async (args, index) => {
  const config = new Config()

  //  Grab the elastic search config details
  const elasticsearchConfig = config.get('elasticsearch')
  if (elasticsearchConfig === null) {
    return []
  }

  //  Set up the client
  const esclient = new elasticsearch.Client(elasticsearchConfig)
  const page = getPage(args)
  const perPage = getPerPage(args)
  const body = {
    from: page * perPage,
    size: perPage
  }

  //  Sort by count if the index is one of these
  const sortIfIndex = ['objects_mplus']
  if (sortIfIndex.includes(index)) {
    //  Check to see if we have been passed valid sort fields values, if we have
    //  then use that for a sort. Otherwise use a default one
    const validFields = ['id']
    const keywordFields = []
    const validSorts = ['asc', 'desc']
    if ('sort_field' in args && validFields.includes(args.sort_field.toLowerCase()) && 'sort' in args && (validSorts.includes(args.sort.toLowerCase()))) {
      //  To actually sort on a title we need to really sort on `title.keyword`
      let sortField = args.sort_field
      if (keywordFields.includes(sortField)) sortField = `${sortField}.keyword`
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
  }

  if (index === 'objects_mplus') {
    if (
      ('ids' in args && Array.isArray(args.ids))
    ) {
      const must = []

      if ('ids' in args && Array.isArray(args.ids)) {
        must.push({
          terms: {
            id: args.ids
          }
        })
      }

      body.query = {
        bool: {
          must
        }
      }
    }
  }

  const objects = await esclient.search({
    index,
    body
  }).catch((err) => {
    console.error(err)
  })

  let records = objects.hits.hits.map((hit) => hit._source).map((record) => {
    return record
  })

  //  Grab the language specific stuff
  records = records.map((record) => {
    //  Titles
    let match = null

    //  Get the default value of title
    match = getSingleTextFromArrayByLang(record.titles, args.lang)
    delete record.titles
    if (match !== null) record.title = match

    //  Get the default value of dimensions
    match = getSingleTextFromArrayByLang(record.dimensions, args.lang)
    delete record.dimensions
    if (match !== null) record.dimensions = match

    //  Get the default value of credit lines
    match = getSingleTextFromArrayByLang(record.creditLines, args.lang)
    delete record.creditLines
    if (match !== null) record.creditLine = match

    //  Get the default value of medium
    match = getSingleTextFromArrayByLang(record.mediums, args.lang)
    delete record.mediums
    if (match !== null) record.medium = match

    return record
  })

  return records
}

exports.getObjects = async (args) => {
  const records = await getItems(args, 'objects_mplus')
  return records
}

const getObject = async (args) => {
  const config = new Config()

  //  Grab the elastic search config details
  const elasticsearchConfig = config.get('elasticsearch')
  if (elasticsearchConfig === null) {
    return []
  }

  //  Set up the client
  const esclient = new elasticsearch.Client(elasticsearchConfig)
  const id = args.id
  const index = 'objects_mplus'
  const type = 'objects'

  const object = await esclient.get({
    index,
    type,
    id
  }).catch((err) => {
    //  Dont log the error if this is a "good" error, i.e. we simple didn't find
    //  a record, no need to spam the error logs
    if (!('body' in err && 'found' in err.body && err.body.found === false)) {
      console.error(err)
    }
  })

  if (object !== undefined && object !== null && 'found' in object && object.found === true) {
    const newObject = object._source
    let match = null
    //  Get the default value of title
    match = getSingleTextFromArrayByLang(newObject.titles, args.lang)
    delete newObject.titles
    if (match !== null) newObject.title = match

    //  Get the default value of dimensions
    match = getSingleTextFromArrayByLang(newObject.dimensions, args.lang)
    delete newObject.dimensions
    if (match !== null) newObject.dimensions = match

    //  Get the default value of credit lines
    match = getSingleTextFromArrayByLang(newObject.creditLines, args.lang)
    delete newObject.creditLines
    if (match !== null) newObject.creditLine = match

    //  Get the default value of medium
    match = getSingleTextFromArrayByLang(newObject.mediums, args.lang)
    delete newObject.mediums
    if (match !== null) newObject.medium = match
    return newObject
  }

  return null
}
exports.getObject = getObject