const Config = require('../../../classes/config')
const elasticsearch = require('elasticsearch')
const common = require('../common.js')

const cleanObjectColor = (object) => {
  const newObject = object

  //  Set up the defaults
  if (!('color' in newObject)) newObject.color = {}
  if (!('predominant' in newObject.color)) newObject.color.predominant = '{}'
  if (!('search' in newObject.color)) newObject.color.search = {}
  if (!('google' in newObject.color.search)) newObject.color.search.google = []
  if (!('cloudinary' in newObject.color.search)) newObject.color.search.cloudinary = []

  //  convert to the format we want
  const newPredominant = []
  Object.entries(JSON.parse(newObject.color.predominant)).forEach((entry) => {
    newPredominant.push({
      color: entry[0],
      value: entry[1]
    })
  })
  newObject.color.predominant = newPredominant

  const newGoogle = []
  Object.entries(newObject.color.search.google).forEach((entry) => {
    newGoogle.push({
      color: entry[0],
      value: entry[1]
    })
  })
  newObject.color.search.google = newGoogle

  const newCloudinary = []
  Object.entries(newObject.color.search.cloudinary).forEach((entry) => {
    newCloudinary.push({
      color: entry[0],
      value: entry[1]
    })
  })
  newObject.color.search.cloudinary = newCloudinary
  if (newObject.color.predominant.length === 0) newObject.color.predominant = null
  if (newObject.color.search.google.length === 0) newObject.color.search.google = null
  if (newObject.color.search.cloudinary.length === 0) newObject.color.search.cloudinary = null
  return newObject
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
  const page = common.getPage(args)
  const perPage = common.getPerPage(args)
  const body = {
    from: page * perPage,
    size: perPage
  }

  //  Check to see if we have been passed valid sort fields values, if we have
  //  then use that for a sort. Otherwise use a default one
  const keywordFields = ['objectnumber', 'displaydate', 'sortnumber']
  const validFields = ['id', 'objectnumber', 'sortnumber', 'title', 'medium', 'displaydate', 'begindate', 'enddate', 'classification.area', 'classification.category']
  const validSorts = ['asc', 'desc']
  if ('sort_field' in args && validFields.includes(args.sort_field.toLowerCase()) && 'sort' in args && (validSorts.includes(args.sort.toLowerCase()))) {
    //  To actually sort on a title we need to really sort on `title.keyword`
    let sortField = args.sort_field
    if (keywordFields.includes(sortField.toLowerCase())) sortField = `${sortField}.keyword`

    //  Special cases
    if (sortField === 'title') sortField = `title.${args.lang}.keyword`
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
        fields: ['title.en', 'title.zh-hant', 'classification.area.areacat.en', 'classification.area.areacat.zh-hant', 'classification.category.areacat.en', 'classification.category.areacat.zh-hant', 'creditLine.en', 'creditLine.zh-hant', 'displayDate.en', 'displayDate.zh-hant', 'exhibition.exhibitionLabelText.en.labels.text', 'exhibition.exhibitionLabelText.zh-hant.labels.text', 'images.AltText', 'images.AltTextTC', 'images.Copyright', 'medium.en', 'medium.zh-hant', 'objectStatus.en', 'objectStatus.zh-hant', 'title.en', 'title.zh-hant'],
        operator: 'or'
      }
    })
  }

  if ('color' in args && args.color !== '') {
    const googleColors = ['gray',
      'black',
      'orange',
      'brown',
      'white',
      'yellow',
      'teal',
      'blue',
      'green',
      'red',
      'pink',
      'purple'
    ]
    const cloudinaryColors = ['white',
      'gray',
      'black',
      'orange',
      'brown',
      'yellow',
      'teal',
      'lightblue',
      'green',
      'olive',
      'red',
      'blue',
      'pink',
      'purple',
      'lime',
      'cyan'
    ]

    let newThreshold = 75.0
    if (Number(args.color_threshold) && args.color_threshold >= 0.0 && args.color_threshold <= 100) {
      newThreshold = args.color_threshold
    }

    if (args.color_source === 'google' && googleColors.includes(args.color)) {
      const colorFilter = {}
      colorFilter[`color.search.google.${args.color}`] = {
        gte: newThreshold
      }
      must.push({
        range: colorFilter
      })
    }
    if (args.color_source === 'cloudinary' && cloudinaryColors.includes(args.color)) {
      const colorFilter = {}
      colorFilter[`color.search.cloudinary.${args.color}`] = {
        gte: newThreshold
      }
      must.push({
        range: colorFilter
      })
    }
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
    match = common.getSingleTextFromArrayByLang(record.title, args.lang)
    delete record.title
    if (match !== null) record.title = match

    //  Get the default value of display date
    match = common.getSingleTextFromArrayByLang(record.displayDate, args.lang)
    delete record.displayDate
    if (match !== null) record.displayDate = match

    //  Get the default value of dimensions
    match = common.getSingleTextFromArrayByLang(record.dimension, args.lang)
    delete record.dimension
    if (match !== null) record.dimension = match

    //  Get the default value of credit lines
    match = common.getSingleTextFromArrayByLang(record.creditLine, args.lang)
    delete record.creditLine
    if (match !== null) record.creditLine = match

    //  Get the default value of medium
    match = common.getSingleTextFromArrayByLang(record.medium, args.lang)
    delete record.medium
    if (match !== null) record.medium = match

    //  Clean up the area and category
    if ('classification' in record) {
      const classFields = ['area', 'category']
      const classification = {}
      classFields.forEach((field) => {
        if (field in record.classification) {
          if (!(field in classification)) classification[field] = common.getSingleTextFromArrayByLang(record.classification[field].areacat, args.lang)
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
    const constituents = await queryConstituents.getConstituents(newArgs, context, levelDown + 1)

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
    const exhibitions = await queryExhibitions.getExhibitions(newArgs, context, levelDown + 1)

    //  Now I want to turn those exhibitions into a map so I can quickly look them up
    exhibitions.forEach((exhibition) => {
      exhibitionsMap[exhibition.id] = exhibition
    })
  }

  //  Now go put the exhibition data back into the objects
  records = records.map((record) => {
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
      exhibitions: JSON.parse(JSON.stringify(newExhibitions))
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
    delete record.exhibition
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
    const concepts = await queryConcepts.getConcepts(newArgs, context, levelDown + 1)

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

  //  Now sort out all the images stuff
  records = records.map((record) => {
    if (record.images) delete record.images
    if (record.remote) {
      const imagesObj = JSON.parse(record.remote.images)
      const newImages = []
      Object.entries(imagesObj).forEach((imageObj) => {
        const image = imageObj[1]
        newImages.push(image)
      })
      record.images = newImages.map((image) => {
        //  If we aren't a vendor and the publicAccess is false, return false now
        if (context.isVendor !== true && image.publicAccess && image.publicAccess !== true) {
          return false
        }
        //  Grab the language part
        let altText = null
        if (args.lang === 'en' && image.AltText) {
          altText = image.AltText
        } else {
          if (image.AltTextTC) {
            altText = image.AltTextTC
          } else {
            if (image.AltText) altText = image.AltText
          }
        }
        image.altText = altText

        //  Clean up all the unwanted fields
        image.mediaUse = image.MediaUse
        image.rank = parseInt(image.rank, 10)
        delete image.MediaUse
        delete image.AltText
        delete image.AltTextTC
        delete image.original_image_src
        delete image.src

        return image
      }).filter(Boolean) // get rid of all the false records
      delete record.remote
    }

    record = cleanObjectColor(record)
    return record
  })

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

const queryConcepts = require('../concepts')
const queryConstituents = require('../constituents')
const queryExhibitions = require('../exhibitions')
