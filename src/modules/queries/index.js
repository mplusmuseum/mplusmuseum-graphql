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
const getObjects = async (args, context, levelDown = 2) => {
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
  //  Make sure the item is public access
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

  if ('area' in args && args.area !== '') {
    const pushThis = {
      match: {}
    }
    pushThis.match[`classification.area.areacat.${args.lang}.keyword`] = args.area
    must.push(pushThis)
  }

  if ('category' in args && args.category !== '') {
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

  if ('exhibition' in args && args.exhibition !== '') {
    must.push({
      match: {
        'exhibition.ids': args.exhibition
      }
    })
  }

  if ('concept' in args && args.concept !== '') {
    must.push({
      match: {
        'relatedConceptIds': args.concept
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
    delete record.title
    if (match !== null) record.title = match

    //  Get the default value of display date
    match = getSingleTextFromArrayByLang(record.displayDate, args.lang)
    delete record.displayDate
    if (match !== null) record.displayDate = match

    //  Get the default value of dimensions
    match = getSingleTextFromArrayByLang(record.dimension, args.lang)
    delete record.dimension
    if (match !== null) record.dimension = match

    //  Get the default value of credit lines
    match = getSingleTextFromArrayByLang(record.creditLine, args.lang)
    delete record.creditLine
    if (match !== null) record.creditLine = match

    //  Get the default value of medium
    match = getSingleTextFromArrayByLang(record.medium, args.lang)
    delete record.medium
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

  //  Now we have all the objects we want to get the constituents for those objects
  let constituentsIds = []
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
  constituentsIds = constituentsIds.filter(Boolean)

  //  If there are no constituens to get then we can just return the records
  if (constituentsIds.length !== 0) {
    //  If we are from a single record then we want to get the constituents, *and* all the
    //  objects belonging to those constitues, including constituents.
    const newArgs = {
      lang: args.lang,
      ids: constituentsIds,
      per_page: 200
    }
    const constituents = await getConstituents(newArgs, context, levelDown + 1)

    //  Now I want to turn those constituents into a map so I can quickly look them up
    const constituentsMap = {}
    constituents.forEach((constituent) => {
      constituentsMap[constituent.id] = constituent
    })

    records = records.map((record) => {
      let newConstituents = []
      //  Now we want to look through the idsToRoleRank so we can
      //  *explode* or populate them with the full consituent information we have
      let idsToRoleRank = JSON.parse(record.consituents.idsToRoleRank)
      //  Grab the correct language for the roles
      idsToRoleRank = idsToRoleRank.map((roleRank) => {
        let newRole = null
        if (newRole === null && 'roles' in roleRank && args.lang in roleRank.roles) newRole = roleRank.roles[args.lang]
        if (newRole === null && 'roles' in roleRank && 'en' in roleRank.roles) newRole = roleRank.roles['en']
        roleRank.role = newRole
        delete roleRank.roles
        return roleRank
      })

      idsToRoleRank.forEach((roleRank) => {
        if (roleRank.id in constituentsMap) {
          const newConstituent = JSON.parse(JSON.stringify(constituentsMap[roleRank.id]))
          newConstituent.rank = roleRank.rank
          newConstituent.role = roleRank.role
          newConstituents.push(newConstituent)
        }
      })
      newConstituents = newConstituents.filter(Boolean)
      if (newConstituents.length === 0) newConstituents = null
      record.constituents = newConstituents
      delete record.consituents
      return record
    })
  }

  //  And we do the same all over again with exhibitions
  let exhibitionsIds = []
  records.forEach((record) => {
    // console.log(record)
    if (record.exhibition && record.exhibition.ids) {
      let ids = record.exhibition.ids
      if (!Array.isArray(ids)) ids = [ids]
      ids.forEach((id) => {
        if (!exhibitionsIds.includes(id)) exhibitionsIds.push(id)
      })
    }
  })
  exhibitionsIds = exhibitionsIds.filter(Boolean)

  //  If we have some exhibitions, lets try to put them back into the obejcts
  const exhibitionsMap = {}
  if (exhibitionsIds.length !== 0) {
    //  If we are from a single record then we want to get the exhibitions, *and* all the
    //  objects belonging to those exhibitions, including exhibitions.
    const newArgs = {
      lang: args.lang,
      ids: exhibitionsIds,
      per_page: 200
    }
    const exhibitions = await getExhibitions(newArgs, context, levelDown + 1)

    //  Now I want to turn those exhibitions into a map so I can quickly look them up
    exhibitions.forEach((exhibition) => {
      exhibitionsMap[exhibition.id] = exhibition
    })
  }

  //  Now go put the exhibition data back into the objects
  records = records.map((record) => {
    // console.log(record)
    const newExhibitions = []
    //  Get a map of the sections
    let exhibitionSections = []
    const exhibitionSectionsMap = {}
    if (record.exhibition && record.exhibition.sections) {
      exhibitionSections = JSON.parse(record.exhibition.sections)
    }
    //  Turn the array into a map
    exhibitionSections.forEach((section) => {
      Object.entries(section).forEach((entry) => {
        exhibitionSectionsMap[entry[0]] = entry[1]
      })
    })
    if (record.exhibition && record.exhibition.ids) {
      let ids = record.exhibition.ids
      if (!Array.isArray(ids)) ids = [ids]
      ids.forEach((id) => {
        if (id in exhibitionsMap) {
          const newExhibition = exhibitionsMap[id]
          if (id in exhibitionSectionsMap) {
            newExhibition.section = exhibitionSectionsMap[id]
          }
          newExhibitions.push(newExhibition)
        }
      })
    }
    record.exhibitions = {
      exhibitions: newExhibitions
    }

    //  Now we've got to pick the right language of the labels
    if (record.exhibition && record.exhibition.exhibitionLabelText) {
      let useLang = args.lang
      if (!(useLang in record.exhibition.exhibitionLabelText)) {
        if ('en' in record.exhibition.exhibitionLabelText) {
          useLang = 'en'
        } else {
          if ('zh-hant' in record.exhibition.exhibitionLabelText) {
            useLang = 'zh-hant'
          }
        }
      }
      if (useLang in record.exhibition.exhibitionLabelText) {
        if ('labels' in record.exhibition.exhibitionLabelText[useLang]) {
          record.exhibitions.labels = record.exhibition.exhibitionLabelText[useLang].labels
        }
      }
    }

    return record
  })

  // Grab the concepts for those objects
  let conceptsIds = []
  records = records.map((record) => {
    if ('relatedConceptIds' in record) {
      let ids = record.relatedConceptIds
      if (!Array.isArray(ids)) ids = [ids]
      ids.forEach((id) => {
        if (!conceptsIds.includes(id)) conceptsIds.push(id)
      })
    }
    return record
  })
  conceptsIds = conceptsIds.filter(Boolean)

  //  If there are no constituens to get then we can just return the records
  if (conceptsIds.length !== 0) {
    //  If we are from a single record then we want to get the constituents, *and* all the
    //  objects belonging to those constitues, including constituents.
    const newArgs = {
      lang: args.lang,
      ids: conceptsIds,
      per_page: 200
    }
    const concepts = await getConcepts(newArgs, context, levelDown + 1)

    //  Now I want to turn those constituents into a map so I can quickly look them up
    const conceptsMap = {}
    concepts.forEach((concept) => {
      conceptsMap[concept.id] = concept
    })

    records = records.map((record) => {
      let newConcepts = []
      if ('relatedConceptIds' in record) {
        let ids = record.relatedConceptIds
        if (!Array.isArray(ids)) ids = [ids]
        ids.forEach((id) => {
          newConcepts.push(conceptsMap[id])
        })
      }
      newConcepts = newConcepts.filter(Boolean)
      if (newConcepts.length === 0) newConcepts = null
      record.concepts = newConcepts
      return record
    })
  }

  return records
}
exports.getObjects = getObjects

const getObject = async (args, context) => {
  args.ids = [args.id]
  const objectArray = await getObjects(args, context, 2)
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
const getConstituents = async (args, context, levelDown = 3) => {
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
  const keywordFields = ['nationality']
  const validFields = ['id', 'name', 'alphasortname', 'gender', 'begindate', 'enddate', 'nationality']
  const validSorts = ['asc', 'desc']
  if ('sort_field' in args && validFields.includes(args.sort_field.toLowerCase()) && 'sort' in args && (validSorts.includes(args.sort.toLowerCase()))) {
    //  To actually sort on a title we need to really sort on `title.keyword`
    let sortField = args.sort_field
    if (keywordFields.includes(sortField.toLowerCase())) sortField = `${sortField}.keyword`

    //  Special cases
    if (sortField === 'gender') sortField = `gender.${args.lang}.keyword`
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

  if ('gender' in args && args.gender !== '') {
    const pushThis = {
      match: {}
    }
    pushThis.match[`gender.${args.lang}.keyword`] = args.gender
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
    let newName = null
    let newAlphaName = null
    if (record.name) {
      let useLang = args.lang
      if (!(useLang in record.name)) {
        if ('en' in record.name) {
          useLang = 'en'
        } else {
          if ('zh-hant' in record.name) {
            useLang = 'zh-hant'
          }
        }
      }

      if (useLang in record.name) {
        //  Grab the alpha sort name
        if (record.name[useLang].alphasort) {
          newAlphaName = record.name[useLang].alphasort
        }
        if (record.name[useLang].displayName) {
          newName = record.name[useLang].displayName
        } else {
          newName = newAlphaName
        }
      }
    }
    record.name = newName
    record.alphaSortName = newAlphaName

    //  Get the exhibition Bios
    if (record.exhibitions && record.exhibitions.biographies) {
      let useLang = args.lang
      if (!(useLang in record.exhibitions.biographies)) {
        if ('en' in record.exhibitions.biographies) {
          useLang = 'en'
        } else {
          if ('zh-hant' in record.exhibitions.biographies) {
            useLang = 'zh-hant'
          }
        }
      }

      if (useLang in record.exhibitions.biographies) {
        record.exhibitionBios = record.exhibitions.biographies[useLang]
      }
    }

    //  Get the rest of the data by language
    record.gender = getSingleTextFromArrayByLang(record.gender, args.lang)
    record.displayBio = getSingleTextFromArrayByLang(record.displayBio, args.lang)
    record.nationality = getSingleTextFromArrayByLang(record.nationality, args.lang)
    record.region = getSingleTextFromArrayByLang(record.region, args.lang)
    record.activeCity = getSingleTextFromArrayByLang(record.activeCity, args.lang)
    record.birthCity = getSingleTextFromArrayByLang(record.birthCity, args.lang)
    record.deathCity = getSingleTextFromArrayByLang(record.deathCity, args.lang)
    // record.endDate = getSingleTextFromArrayByLang(record.deathyear, args.lang)

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
          constituent: record.id,
          per_page: 500
        }
        //  Did we have any filters that needed to be passed on from the
        //  single constituent to the objects query
        if (args.object_per_page) newArgs.per_page = args.object_per_page
        if (args.object_page) newArgs.page = args.object_page
        if (args.object_category) newArgs.category = args.object_category
        if (args.object_area) newArgs.area = args.object_area
        if (args.object_medium) newArgs.medium = args.object_medium
        record.roles = []
        record.objects = await getObjects(newArgs, context, levelDown + 1)
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

  //  Loop through the records to pop the roles into the constituents
  records.forEach((record) => {
    //  If we have a list of objects for this constituent then loop through them
    if ('objects' in record) {
      record.objects.forEach((object) => {
        //  Now see all the constituents in each object
        if ('constituents' in object) {
          object.constituents.forEach((constituent) => {
            //  If the constituent for this objects matches the one from out record
            //  then we have another role for them
            if ('role' in constituent && 'id' in constituent && constituent.id === record.id) {
              //  But only if we don't already have it
              if (!record.roles.includes(constituent.role)) {
                record.roles.push(constituent.role)
              }
            }
          })
        }
      })
    }
  })
  return records
}
exports.getConstituents = getConstituents

exports.getConstituent = async (args, context) => {
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
  const constituentArray = await getConstituents(args, context, 1)
  if (Array.isArray(constituentArray)) return constituentArray[0]
  return null
}

/*
##########################################################
##########################################################

This is where we get all the exhibitions

##########################################################
##########################################################
*/
const getExhibitions = async (args, context, levelDown = 3) => {
  console.log(context.isVendor)
  const config = new Config()
  const index = 'exhibitions_mplus'

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
    //  Get the rest of the data by language
    record.title = getSingleTextFromArrayByLang(record.title, args.lang)
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
          per_page: 500
        }
        //  Did we have any filters that needed to be passed on from the
        //  single constituent to the objects query
        if (args.object_per_page) newArgs.per_page = args.object_per_page
        if (args.object_page) newArgs.page = args.object_page
        if (args.object_category) newArgs.category = args.object_category
        if (args.object_area) newArgs.area = args.object_area
        if (args.object_medium) newArgs.medium = args.object_medium
        record.roles = []
        record.objects = await getObjects(newArgs, context, levelDown + 1)
        newRecords.push(record)
      })
    }
    await start()
    records = newRecords
  }

  return records
}
exports.getExhibitions = getExhibitions

exports.getExhibition = async (args, context) => {
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
  if (Array.isArray(exhibitionsArray)) return exhibitionsArray[0]
  return null
}

/*
##########################################################
##########################################################

This is where we get all the concepts

##########################################################
##########################################################
*/
const getConcepts = async (args, context, levelDown = 3) => {
  console.log(context.isVendor)
  const config = new Config()
  const index = 'concepts_mplus'

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
        record.objects = await getObjects(newArgs, context, levelDown + 1)
        newRecords.push(record)
      })
    }
    await start()
    records = newRecords
  }

  return records
}
exports.getConcepts = getConcepts

exports.getConcept = async (args, context) => {
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
  if (Array.isArray(conceptsArray)) return conceptsArray[0]
  return null
}
