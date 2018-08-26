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

exports.getAreas = async (args) => {
  return getAggregates(args, `classification.area.areacat.${args.lang}.keyword`, 'objects_mplus')
}

exports.getCategories = async (args) => {
  return getAggregates(args, `classification.category.areacat.${args.lang}.keyword`, 'objects_mplus')
}

exports.getMediums = async (args) => {
  return getAggregates(args, `medium.${args.lang}.keyword`, 'objects_mplus')
}

/*
##########################################################
##########################################################

This is where we get all the objects

##########################################################
##########################################################
*/
const getObjects = async (args, levelsDown = 2) => {
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
    if (sortField === 'medium') sortField = `medium.${args.lang}.keyword`
    if (sortField === 'classification.area') sortField = `classification.area.areacat.${args.lang}.keyword`
    if (sortField === 'classification.category') sortField = `classification.category.areacat.${args.lang}.keyword`

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

  if ('classification.area' in args && args.area !== '') {
    const pushThis = {
      match: {}
    }
    pushThis.match[`classification.area.areacat.${args.lang}.keyword`] = args.area
    must.push(pushThis)
  }

  if ('classification.category' in args && args.category !== '') {
    const pushThis = {
      match: {}
    }
    pushThis.match[`classification.category.areacat.${args.lang}.keyword`] = args.category
    must.push(pushThis)
  }

  if ('medium' in args && args.medium !== '') {
    const pushThis = {
      match: {}
    }
    pushThis.match[`medium.${args.lang}.keyword`] = args.medium
    must.push(pushThis)
  }

  if ('displayDate' in args && args.displayDate !== '') {
    must.push({
      match: {
        'displayDate': args.displayDate
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

  if ('constituent' in args && args.constituent !== '') {
    must.push({
      match: {
        'consituents.ids': args.constituent
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

  //  If we are in here the 1st time, then we get more info about the constituents
  //  but if we are any deeper levels down then we don't want to go and fetch any more
  if (levelsDown <= 2) {
    //  Now that we have all the objects, we want to get all the constituents connected to them
    const constituentsIds = []
    records = records.map((record) => {
      if ('consituents' in record && 'ids' in record.consituents) {
        let ids = record.consituents.ids
        if (!Array.isArray(ids)) ids = [ids]
        ids.forEach((id) => {
          if (!constituentsIds.includes(id)) constituentsIds.push(id)
        })
      }

      //  unpack the consituents
      if ('idsToRoleRank' in record) {
        record.idsToRoleRank = JSON.parse(record.idsToRoleRank)
      }
      return record
    })

    //  If we don't have any constituents just return the records
    if (constituentsIds.length === 0) return records
    const newArgs = {
      lang: args.lang,
      ids: constituentsIds,
      per_page: 200
    }
    const constituents = await getConstituents(newArgs, levelsDown + 1)

    //  Now we have the information we need to pop the info back
    //  into the object. First we'll build an index
    const constituentsMap = {}
    constituents.forEach((constituent) => {
      constituentsMap[constituent.id] = constituent
    })

    records = records.map((record) => {
      const newConsituents = []
      if ('consituents' in record && 'ids' in record.consituents && 'idsToRoleRank' in record.consituents) {
        const idsToRoleRank = JSON.parse(record.consituents.idsToRoleRank)
        let ids = record.consituents.ids
        if (!Array.isArray(ids)) ids = [ids]
        ids.forEach((id) => {
          if (id in constituentsMap) {
            const newConsituent = JSON.parse(JSON.stringify(constituentsMap[id]))
            if (id in idsToRoleRank && 'rank' in idsToRoleRank[id]) newConsituent.rank = idsToRoleRank[id].rank
            if (id in idsToRoleRank && 'role' in idsToRoleRank[id]) {
              const roles = idsToRoleRank[id].role
              if (args.lang in roles) {
                newConsituent.role = roles[args.lang]
              } else {
                if ('en' in roles) {
                  newConsituent.role = roles.en
                }
              }
            }
            newConsituents.push(newConsituent)
          }
        })
      }
      record.constituents = newConsituents
      delete record.consituents
      return record
    })
  }

  // console.log(records)
  return records
}
exports.getObjects = getObjects

const getObject = async (args) => {
  args.ids = [args.id]
  const objectArray = await getObjects(args, 1)
  if (Array.isArray(objectArray)) return objectArray[0]
  return null
}
exports.getObject = getObject

/*
##########################################################
##########################################################

This is where we get all the constituents

##########################################################
##########################################################
*/
const getConstituents = async (args, levelsDown = 3) => {
  const config = new Config()
  const index = 'constituents_mplus'

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
  const keywordFields = ['gender', 'nationality']
  const validFields = ['id', 'name', 'alphasortname', 'gender', 'begindate', 'enddate', 'nationality']
  const validSorts = ['asc', 'desc']
  if ('sort_field' in args && validFields.includes(args.sort_field.toLowerCase()) && 'sort' in args && (validSorts.includes(args.sort.toLowerCase()))) {
    //  To actually sort on a title we need to really sort on `title.keyword`
    let sortField = args.sort_field
    if (keywordFields.includes(sortField.toLowerCase())) sortField = `${sortField}.keyword`

    //  Special cases
    if (sortField === 'name') sortField = `name.${args.lang}.displayname.keyword`
    if (sortField === 'alphaSortName') sortField = `name.${args.lang}.alphasort.keyword`

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

  if ('gender' in args && args.gender !== '') {
    const pushThis = {
      match: {}
    }
    pushThis.match[`gender.keyword`] = args.gender
    must.push(pushThis)
  }

  if ('nationality' in args && args.nationality !== '') {
    const pushThis = {
      match: {}
    }
    pushThis.match[`nationality.keyword`] = args.nationality
    must.push(pushThis)
  }

  if ('beginDate' in args && args.beginDate !== '') {
    must.push({
      match: {
        'beginDate': parseInt(args.beginDate, 10)
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

  let records = results.hits.hits.map((hit) => hit._source).map((record) => {
    //  Grab the name
    record.name = getSingleTextFromArrayByLang(record.name, args.lang)
    if (record.name !== null) {
      //  The order here is important, as the display name will
      //  write over the record.name information
      if ('alphasort' in record.name) {
        record.alphaSortName = record.name.alphasort
      } else {
        record.alphaSortName = null
      }
      if ('displayname' in record.name) {
        record.name = record.name.displayname
      } else {
        record.name = null
      }
    }

    //  Grab the bio
    record.displayBio = getSingleTextFromArrayByLang(record.displayBio, args.lang)
    return record
  })

  //  If we are in here the 1st time, then we get more info about the objects
  //  but if we are any deeper levels down then we don't want to go and fetch any more
  async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array)
    }
  }

  if (levelsDown <= 2) {
    const newRecords = []
    const start = async () => {
      await asyncForEach(records, async (record) => {
        const newArgs = {
          lang: args.lang,
          constituent: record.id,
          per_page: 200
        }
        record.roles = []
        record.objects = await getObjects(newArgs, levelsDown + 1)
        record.objects.forEach((object) => {
          if ('consituents' in object && 'idsToRoleRank' in object.consituents) {
            const rankRoles = JSON.parse(object.consituents.idsToRoleRank)
            if (record.id in rankRoles) {
              const rankRole = rankRoles[record.id]
              if ('role' in rankRole) {
                let thisRole = null
                if (args.lang in rankRole.role) {
                  thisRole = rankRole.role[args.lang]
                } else {
                  thisRole = rankRole.role['en']
                }
                if (thisRole !== null && thisRole !== undefined && thisRole !== '') {
                  if (!record.roles.includes(thisRole)) record.roles.push(thisRole)
                }
              }
            }
          }
        })
        newRecords.push(record)
      })
    }
    await start()
    records = newRecords
  }

  // console.log(records)
  return records
}
exports.getConstituents = getConstituents

exports.getConstituent = async (args) => {
  args.ids = [args.id]
  const constituentArray = await getConstituents(args, 1)
  if (Array.isArray(constituentArray)) return constituentArray[0]
  return null
}