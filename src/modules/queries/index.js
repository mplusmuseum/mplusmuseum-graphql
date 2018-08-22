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

const getSingleTextFromArrayByLang = (thisObj, lang) => {
  //  If we can't find the language in the object then
  //  fall back to 'en' and try again
  if (thisObj === null || thisObj === undefined) return null
  if (!(lang in thisObj) && lang !== 'en') lang = 'en'
  if (!(lang in thisObj)) return null
  return thisObj[lang]
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

/*
##########################################################
##########################################################

This is where we get all the objects

##########################################################
##########################################################
*/
exports.getObjects = async (args) => {
  const config = new Config()
  const index = 'objects_mplus'

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

  //  Check to see if we have been passed valid sort fields values, if we have
  //  then use that for a sort. Otherwise use a default one
  const keywordFields = ['objectnumber', 'displaydate']
  const validFields = ['id', 'objectnumber', 'sortnumber', 'title', 'medium', 'displaydate', 'begindate', 'enddate', 'classification.area', 'classification.category']
  const validSorts = ['asc', 'desc']
  if ('sort_field' in args && validFields.includes(args.sort_field.toLowerCase()) && 'sort' in args && (validSorts.includes(args.sort.toLowerCase()))) {
    //  To actually sort on a title we need to really sort on `title.keyword`
    let sortField = args.sort_field
    if (keywordFields.includes(sortField.toLowerCase())) sortField = `${sortField}.keyword`

    //  Special cases
    if (sortField === 'title') sortField = 'titles.text.keyword'

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

  //  If we've been sent over specific ids then we go and get just those
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

  //  Run the search
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
    match = getSingleTextFromArrayByLang(record.title, args.lang)
    delete record.titles
    if (match !== null) record.title = match

    //  Get the default value of dimensions
    match = getSingleTextFromArrayByLang(record.dimension, args.lang)
    delete record.dimensions
    if (match !== null) record.dimension = match

    //  Get the default value of credit lines
    match = getSingleTextFromArrayByLang(record.creditLine, args.lang)
    delete record.creditLines
    if (match !== null) record.creditLine = match

    //  Get the default value of medium
    match = getSingleTextFromArrayByLang(record.medium, args.lang)
    delete record.mediums
    if (match !== null) record.medium = match

    //  Clean up the area and category
    if ('classification' in record) {
      const classFields = ['area', 'category']
      const classification = {}
      classFields.forEach((field) => {
        if (field in record.classification) {
          if (!(field in classification)) classification[field] = getSingleTextFromArrayByLang(record.classification[field].areacat, args.lang)
        }
      })
      record.classification = classification
    }

    return record
  })

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
