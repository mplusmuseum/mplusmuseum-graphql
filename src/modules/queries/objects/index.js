const Config = require('../../../classes/config')
const elasticsearch = require('elasticsearch')
const common = require('../common.js')
const logging = require('../../logging')
const RandomGen = require('random-seed')
const delay = require('delay')

const addCollectionInformation = async (lang, objects) => {
  const config = new Config()
  const cacheable = true
  const baseTMS = config.get('baseTMS')
  if (baseTMS === null) return objects
  const index = `objects_${baseTMS}`

  // go get a map of the collections stuff
  if (!global.collectionMap || global.collectionMap.expire >= new Date().getTime()) {
    const pushThis = {
      match: {}
    }
    const must = []
    pushThis.match[`classification.archivalLevel.areacat.en.keyword`] = 'Fonds'
    must.push(pushThis)
    const body = {
      from: 0,
      size: 60,
      query: {
        bool: {
          must
        }
      }
    }

    const objects = await common.doCacheQuery(cacheable, index, body)

    if (objects.hits && objects.hits.hits) {
      global.collectionMap = {
        expires: new Date().getTime() + (60 * 60 * 1000),
        collections: {}
      }
      objects.hits.hits.forEach((obj) => {
        const object = obj._source
        //  Grab the titles
        let titleEN = null
        let titleTC = null
        if (object.title) {
          if (object.title.en) titleEN = object.title.en
          if (object.title['zh-hant']) titleTC = object.title['zh-hant']
        }
        if (lang === 'en') {
          global.collectionMap.collections[object.collectionCode] = {
            id: object.id,
            title: titleEN,
            titleOther: titleTC
          }
        } else {
          global.collectionMap.collections[object.collectionCode] = {
            id: object.id,
            title: titleTC,
            titleOther: titleEN
          }
          if (titleTC === null) {
            global.collectionMap.collections[object.collectionCode].title = titleEN
            global.collectionMap.collections[object.collectionCode].titleOther = null
          }
        }
      })
    }
  }

  return objects.map((object) => {
    object.collection = {
      code: object.collectionCode,
      type: object.collectionType,
      objectId: null,
      title: null,
      titleOther: null
    }
    if (global.collectionMap && global.collectionMap.collections && global.collectionMap.collections[object.collectionCode]) {
      object.collection.objectId = global.collectionMap.collections[object.collectionCode].id
      object.collection.title = global.collectionMap.collections[object.collectionCode].title
      object.collection.titleOther = global.collectionMap.collections[object.collectionCode].titleOther
    }
    return object
  })
}

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
const getObjects = async (args, context, levelDown = 2, initialCall = false) => {
  const startTime = new Date().getTime()
  const config = new Config()
  const baseTMS = config.get('baseTMS')
  let cacheable = true
  //  If we are the dashboard (or ourself) don't use a cached query
  if (context.isSelf || context.isDashboard) cacheable = false
  if (context.noCache) cacheable = false

  if (baseTMS === null) return []

  const index = `objects_${baseTMS}`

  //  Set up the client
  let page = common.getPage(args)
  let perPage = common.getPerPage(args)

  const body = {
    from: page * perPage,
    size: perPage
  }

  //  Check to see if we have been passed valid sort fields values, if we have
  //  then use that for a sort. Otherwise use a default one
  const keywordFields = ['objectnumber', 'displaydate', 'sortnumber']
  const validFields = ['id', 'artint', 'objectnumber', 'sortnumber', 'title', 'medium', 'displaydate', 'begindate', 'enddate', 'popularcount', 'area', 'category', 'archivalLevel']
  const validSorts = ['asc', 'desc']
  if ('sort_field' in args && validFields.includes(args.sort_field.toLowerCase()) && 'sort' in args && (validSorts.includes(args.sort.toLowerCase()))) {
    //  To actually sort on a title we need to really sort on `title.keyword`
    let sortField = args.sort_field
    if (keywordFields.includes(sortField.toLowerCase())) sortField = `${sortField}.keyword`

    //  Special cases
    if (sortField === 'title') sortField = `title.${args.lang}.keyword`
    if (sortField === 'medium') sortField = `medium.${args.lang}.keyword`
    if (sortField === 'area') sortField = `areas.lang.${args.lang}.title.keyword`
    if (sortField === 'category') sortField = `category.lang.${args.lang}.title.keyword`
    if (sortField === 'archivalLevel') sortField = `archivalLevel.lang.${args.lang}.title.keyword`

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

  //  If we have been told to prioritse Images, then we add that to the sort now
  if ('prioritiseImages' in args && args.prioritiseImages === true) {
    if (!body.sort) body.sort = []
    body.sort.unshift({
      imageSortScore: {
        order: 'desc'
      }
    })
  }

  //  If we have been told to prioritse Archives, then we add that to the sort now
  if ('prioritiseArchives' in args && args.prioritiseArchives === true) {
    if (!body.sort) body.sort = []
    body.sort.unshift({
      archivalLevelScore: {
        order: 'desc'
      }
    })
  }

  const must = []

  // Do the publicAccess toggle
  if ('publicAccess' in args) {
    must.push({
      match: {
        'publicAccess': args.publicAccess
      }
    })
  }

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

  if ('title' in args && args.title !== '') {
    cacheable = false
    must.push({
      multi_match: {
        query: args.title,
        type: 'best_fields',
        fields: [`title.en.keyword`, `titleSlug.en.keyword`, `title.zh-hant.keyword`, `titleSlug.zh-hant.keyword`],
        operator: 'or'
      }
    })
  }

  if ('objectNumber' in args && args.objectNumber !== '') {
    must.push({
      multi_match: {
        query: args.objectNumber,
        type: 'best_fields',
        fields: [`objectNumber.keyword`, `objectNumberSlug.keyword`],
        operator: 'or'
      }
    })
  }

  if ('area' in args && args.area !== '') {
    must.push({
      multi_match: {
        query: args.area,
        type: 'best_fields',
        fields: [`areas.lang.${args.lang}.title.keyword`, `areas.lang.${args.lang}.slug.keyword`],
        operator: 'or'
      }
    })
  }

  if ('category' in args && args.category !== '') {
    must.push({
      multi_match: {
        query: args.category,
        type: 'best_fields',
        fields: [`category.lang.${args.lang}.title.keyword`, `category.lang.${args.lang}.slug.keyword`],
        operator: 'or'
      }
    })
  }

  if ('archivalLevel' in args && args.archivalLevel !== '') {
    must.push({
      multi_match: {
        query: args.archivalLevel,
        type: 'best_fields',
        fields: [`archivalLevel.lang.${args.lang}.title.keyword`, `archivalLevel.lang.${args.lang}.slug.keyword`],
        operator: 'or'
      }
    })
  }

  if ('medium' in args && args.medium !== '') {
    must.push({
      multi_match: {
        query: args.medium,
        type: 'best_fields',
        fields: [`medium.${args.lang}.keyword`, `mediumSlug.${args.lang}.keyword`],
        operator: 'or'
      }
    })
  }

  if ('tags' in args && Array.isArray(args.tags)) {
    //  If there isn't a lens then we can just go find it
    if (!args.lens) {
      must.push({
        terms: {
          'tags.keyword': args.tags
        }
      })
    } else {
      //  We now have to filter by lens
      const should = []
      const langs = ['en', 'zh-hant']
      langs.forEach((lang) => {
        const term = {}
        term[`fullTags.lens.${args.lens}.lang.${lang}.keyword`] = args.tags
        should.push({
          terms: term
        })
      })
      must.push({
        bool: {
          should
        }
      })
    }
  }

  if ('objectName' in args && args.objectName !== '') {
    must.push({
      multi_match: {
        query: args.objectNumber,
        type: 'best_fields',
        fields: [`objectName.${args.lang}.keyword`, `objectNameSlug.${args.lang}.keyword`],
        operator: 'or'
      }
    })
  }

  if ('objectStatus' in args && args.objectStatus !== '') {
    must.push({
      multi_match: {
        query: args.objectStatus,
        type: 'best_fields',
        fields: ['objectStatus.en.keyword', 'objectStatus.zh-hant.keyword'],
        operator: 'or'
      }
    })
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

  let inDate = 'both'
  if (args.inDate && (args.inDate === 'begin' || args.inDate === 'end')) {
    inDate = args.inDate
  }

  //  Min
  if ('minDate' in args) {
    //  If we need the start date to be within the range, then we check that
    if (inDate === 'both' || inDate === 'begin') {
      must.push({
        range: {
          'beginDate': {
            gte: args.minDate
          }
        }
      })
    }
    //  If we need the end date to be within the range, then we check that
    if (inDate === 'both' || inDate === 'end') {
      must.push({
        range: {
          'endDate': {
            gte: args.minDate
          }
        }
      })
    }
  }

  //  Min
  if ('maxDate' in args) {
    //  If we need the start date to be within the range, then we check that
    if (inDate === 'both' || inDate === 'begin') {
      must.push({
        range: {
          'beginDate': {
            lte: args.maxDate
          }
        }
      })
    }
    //  If we need the end date to be within the range, then we check that
    if (inDate === 'both' || inDate === 'end') {
      must.push({
        range: {
          'endDate': {
            lte: args.maxDate
          }
        }
      })
    }
  }

  if ('collectionType' in args && args.collectionType !== '') {
    must.push({
      match: {
        'collectionType': args.collectionType
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

  if ('fonds' in args && args.fonds !== '') {
    must.push({
      match: {
        'collectionCode': args.fonds
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

  if ('constituents' in args && Array.isArray(args.constituents)) {
    must.push({
      terms: {
        'consituents.ids': args.constituents
      }
    })
  }

  if ('bibliography' in args && args.bibliography !== '') {
    must.push({
      match: {
        'references.ids': args.bibliography
      }
    })
  }

  if ('bibliographies' in args && Array.isArray(args.bibliographies)) {
    must.push({
      terms: {
        'references.ids': args.bibliographies
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

  if ('keyword' in args && args.keyword !== '') {
    //  Don't cache when doing keyword searches
    cacheable = false
    must.push({
      multi_match: {
        query: args.keyword,
        type: 'best_fields',
        fields: ['title.en', 'title.zh-hant', 'baselineDescription.en', 'baselineDescription.zh-hant', 'classification.area.areacat.en', 'classification.area.areacat.zh-hant', 'classification.category.areacat.en', 'classification.category.areacat.zh-hant', 'classification.archivalLevel.areacat.en', 'classification.archivalLevel.areacat.zh-hant', 'creditLine.en', 'creditLine.zh-hant', 'displayDate.en', 'displayDate.zh-hant', 'exhibition.exhibitionLabelText.en.labels.text', 'exhibition.exhibitionLabelText.zh-hant.labels.text', 'images.AltText', 'images.AltTextTC', 'images.Copyright', 'medium.en', 'medium.zh-hant', 'objectNumber', 'objectNumber.keyword', 'objectStatus.en', 'objectStatus.zh-hant', 'title.en', 'title.zh-hant'],
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
  } else {
    //  If we haven't been sent a color to search for, remove
    //  these from the args
    delete args.color_threshold
    delete args.color_source
  }

  //  If we've been sent a hue then it's a fair guess that
  //  we've been sent some colour information to search
  if ('hue' in args && args.hue !== '' && args.hue.length > 0) {
    //  First get the hue that we know we have
    const hues = args.hue
    let lums = []
    let sats = []

    //  Now grab the possible luminosity values
    if ('luminosity' in args && args.luminosity !== '') {
      lums = args.luminosity
    }
    if (lums.length === 0) lums = [50] // default

    //  Now grab the possible saturation values
    if ('saturation' in args && args.saturation !== '') {
      sats = args.saturation
    }
    if (sats.length === 0) sats = [30] // default

    //  We're going to track our way through the arrays
    //  this is a bit of an odd way to do it but it
    //  actually make sense believe me
    let arrayPosCounter = 0
    const hslShoulds = []
    hues.forEach((hue) => {
      //  Either get the matching lums, or the first one
      let thisLum = lums[0]
      if (arrayPosCounter < lums.length) {
        thisLum = lums[arrayPosCounter]
      }
      //  Either get the sats, or the first one
      let thisSat = sats[0]
      if (arrayPosCounter < sats.length) {
        thisSat = sats[arrayPosCounter]
      }

      const colourSearch = {
        bool: {
          must: [{
            range: {
              'colorHSLInt.h': {
                gte: hue - 30,
                lte: hue + 30
              }
            }
          },
          {
            range: {
              'colorHSLInt.l': {
                gte: thisLum - 25,
                lte: thisLum + 25
              }
            }
          },
          {
            range: {
              'colorHSLInt.s': {
                gte: thisSat
              }
            }
          }
          ]
        }
      }
      hslShoulds.push(colourSearch)
      arrayPosCounter++
    })
    //  Don't cache colour searches
    cacheable = false
    must.push({
      bool: {
        should: hslShoulds
      }
    })
  } else {
    //  If we haven't been sent a hue to search for, remove
    //  these from the args
    delete args.hsl_range
  }
  if (args.hue && args.hue.length === 0) delete args.hue
  if (args.hue && args.luminosity.length === 0) delete args.luminosity
  if (args.hue && args.hue.saturation === 0) delete args.saturation

  if (args.isRecommended) {
    must.push({
      match: {
        'isRecommended': args.isRecommended
      }
    })
  }

  //  Check to see if we have missing images or not
  if ('missingPrimaryImage' in args) {
    if (args.missingPrimaryImage === true) {
      must.push({
        bool: {
          must_not: {
            exists: {
              field: 'color.predominant'
            }
          },
          must: {
            match: {
              'remote.status': 'ok'
            }
          }
        }
      })
    } else {
      must.push({
        bool: {
          must: [{
            match: {
              'remote.status': 'ok'
            }
          },
          {
            exists: {
              field: 'color.predominant'
            }
          }
          ]
        }
      })
    }
  }

  if ('exhibition' in args && args.exhibition !== '') {
    must.push({
      match: {
        'exhibition.ids': args.exhibition
      }
    })
  }

  //  Check to see if we have missing images or not
  if ('hasImage' in args) {
    must.push({
      match: {
        'withImage': args.hasImage
      }
    })
  }

  if (args.withBlurb) {
    must.push({
      bool: {
        should: [{
          exists: {
            field: `recommendedBlurb.en`
          }
        }, {
          exists: {
            field: `recommendedBlurb.zh-hant`
          }
        }]
      }
    })
  }

  const notObjectNames = ['Fonds', 'Series', 'Sub-fonds', 'Sub-subseries', 'Subseries']
  const notObjects = notObjectNames.map((name) => {
    return {
      term: {
        'classification.archivalLevel.areacat.en.keyword': name
      }
    }
  })

  //  Check for objects or not objects
  if (args.onlyObjects && args.onlyObjects === true) {
    must.push({
      bool: {
        must_not: notObjects
      }
    })
  }

  if (args.onlyNotObjects && args.onlyNotObjects === true) {
    must.push({
      bool: {
        should: notObjects
      }
    })
  }

  //  If this query is too specific then don't cache it
  if (must.length > 6) {
    cacheable = false
  }

  if (must.length > 0) {
    body.query = {
      bool: {
        must
      }
    }
  }

  //  If we are supposed to shuffle, then do that and set up the seed here
  if ('shuffle' in args && args.shuffle === true) {
    let gen = new RandomGen()
    if (args.shuffleSeed) {
      gen = new RandomGen(args.shuffleSeed)
    }
    const seed = gen.random().toString()
    body.query = {
      function_score: {
        query: body.query,
        random_score: {
          seed,
          field: 'popularCount'
        }
      }
    }
    delete body.sort
  }

  // console.log(JSON.stringify(body, null, 4))

  //  Run the search
  const objects = await common.doCacheQuery(cacheable, index, body)
  let total = null
  if (objects.hits.total) total = objects.hits.total
  let records = objects.hits.hits.map((hit) => hit._source).map((record) => {
    return record
  })

  //  Grab the language specific stuff
  records = records.map((record) => {
    //  Titles
    let match = null
    let otherMatch = null

    //  Get the default value of title
    match = common.getSingleTextFromArrayByLang(record.title, args.lang)
    otherMatch = common.getSingleTextFromArrayByNotLang(record.title, args.lang)

    delete record.title
    if (match !== null) record.title = match
    if (otherMatch !== null) record.titleOther = otherMatch

    //  Get the default value of display date
    match = common.getSingleTextFromArrayByLang(record.displayDate, args.lang)
    otherMatch = common.getSingleTextFromArrayByNotLang(record.displayDate, args.lang)
    delete record.displayDate
    if (match !== null) record.displayDate = match
    if (otherMatch !== null) record.displayDateOther = otherMatch

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

    //  Get the default value of objectName
    match = common.getSingleTextFromArrayByLang(record.objectName, args.lang)
    delete record.objectName
    if (match !== null) record.objectName = match

    //  Get the default value of objectStatus
    match = common.getSingleTextFromArrayByLang(record.objectStatus, args.lang)
    delete record.objectStatus
    if (match !== null) record.objectStatus = match

    //  Get the default value of archiveDescription
    match = common.getSingleTextFromArrayByLang(record.archiveDescription, args.lang)
    delete record.archiveDescription
    if (match !== null) record.archiveDescription = match

    //  Get the default value of scopeNContent
    match = common.getSingleTextFromArrayByLang(record.scopeNContent, args.lang)
    delete record.scopeNContent
    if (match !== null) record.scopeNContent = match

    //  Get the default value of scopeNContentHTML
    match = common.getSingleTextFromArrayByLang(record.scopeNContentHTML, args.lang)
    delete record.scopeNContentHTML
    if (match !== null) record.scopeNContentHTML = match

    //  Get the default value of baselineDescription
    match = common.getSingleTextFromArrayByLang(record.baselineDescription, args.lang)
    delete record.baselineDescription
    if (match !== null) record.baselineDescription = match

    //  Get the default value of baselineDescriptionHTML
    match = common.getSingleTextFromArrayByLang(record.baselineDescriptionHTML, args.lang)
    delete record.baselineDescriptionHTML
    if (match !== null) record.baselineDescriptionHTML = match

    //  Get the default value of inscription
    match = common.getSingleTextFromArrayByLang(record.inscription, args.lang)
    delete record.inscription
    if (match !== null) record.inscription = match

    //  Get the default value of recommendedBlurb
    match = common.getSingleTextFromArrayByLang(record.recommendedBlurb, args.lang)
    delete record.recommendedBlurb
    if (match !== null) record.recommendedBlurb = match

    //  Get the default value of blurbExternalUrl
    match = common.getSingleTextFromArrayByLang(record.blurbExternalUrl, args.lang)
    delete record.blurbExternalUrl
    if (match !== null) record.blurbExternalUrl = match

    //  Clean up the area and category
    if (record.classification) {
      const classFields = ['area', 'category', 'archivalLevel']
      const classification = {}
      classFields.forEach((field) => {
        if (field in record.classification) {
          if (!(field in classification)) classification[field] = []
          record.classification[field].forEach((thing) => {
            classification[field].push(common.getSingleTextFromArrayByLang(thing.areacat, args.lang))
          })
        }
      })
      record.classification = classification
    }
    return record
  })

  //  Now we have all the objects we want to get the constituents for those objects
  let constituentsIds = []
  records = records.map((record) => {
    if (record.consituents && record.consituents.ids) {
      let ids = record.consituents.ids
      if (!Array.isArray(ids)) ids = [ids]
      ids.forEach((id) => {
        if (!constituentsIds.includes(id)) constituentsIds.push(id)
      })
    }

    //  unpack the consituents
    if (record.idsToRoleRank) {
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

    //  We also need to get the maker roles
    const makerRoles = await common.getMakerRoles(`config_ismakers_${baseTMS}`)

    //  Now I want to turn those constituents into a map so I can quickly look them up
    const constituentsMap = {}
    constituents.forEach((constituent) => {
      constituentsMap[constituent.id] = constituent
    })

    records = records.map((record) => {
      let newConstituents = []
      //  Now we want to look through the idsToRoleRank so we can
      //  *explode* or populate them with the full consituent information we have
      if (record.consituents && record.consituents.idsToRoleRank) {
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
            newConstituent.isMakerOfObject = false
            if (roleRank.role in makerRoles && makerRoles[roleRank.role] === 'true') newConstituent.isMakerOfObject = true
            newConstituents.push(newConstituent)
          }
        })
      }
      newConstituents = newConstituents.filter(Boolean)
      if (newConstituents.length === 0) newConstituents = null
      //  Check to see if we have a maker, and if not turn a manufacturing maker into one
      if (newConstituents) {
        let foundMaker = false
        let manufacturerID = null
        newConstituents.forEach((constituent) => {
          if (constituent.isMakerOfObject) foundMaker = true
          if (constituent.role === 'Manufacturer') manufacturerID = constituent.id
          if (constituent.role === '製造商') manufacturerID = constituent.id
        })

        //  If we didn't find a maker and we do have a manufacture then we set them as the maker
        if (foundMaker === false && manufacturerID !== null) {
          foundMaker = true
          newConstituents = newConstituents.map((constituent) => {
            if (constituent.id === manufacturerID) constituent.isMakerOfObject = true
            return constituent
          })
        }

        //  If we _still_ haven't found a maker, then force the 1st constituent to be the maker
        if (foundMaker === false) {
          newConstituents[0].isMakerOfObject = true
        }
      }
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

  // Now we want to get the bibliographies
  let bibliographiesIds = []
  records.forEach((record) => {
    if (record.references && record.references.ids) {
      record.references.ids.forEach((id) => {
        if (!bibliographiesIds.includes(id)) bibliographiesIds.push(id)
      })
    }
  })

  //  If we have some then we need to go and get the records
  if (bibliographiesIds.length !== 0) {
    const newArgs = {
      ids: bibliographiesIds
    }
    const bibliographies = await queryBibliographies.getBibliographies(newArgs, context, levelDown + 1)
    const bibliographiesMap = {}
    bibliographies.forEach((bibliography) => {
      bibliographiesMap[bibliography.id] = bibliography
    })

    //  Now we go back through the records subbing in the full information
    records = records.map((record) => {
      if (record.references && record.references.ids) {
        const newBibliographies = []
        let idsToReference = {}
        if (record.references.idsToReference) idsToReference = JSON.parse(record.references.idsToReference)
        record.references.ids.forEach((id) => {
          if (bibliographiesMap[id]) {
            const newBib = JSON.parse(JSON.stringify(bibliographiesMap[id]))
            if (idsToReference[id]) newBib.pageNumber = idsToReference[id]
            newBibliographies.push(newBib)
          }
        })
        if (newBibliographies.length !== 0) record.bibliographies = newBibliographies
      }
      return record
    })
  }

  //  Unpack the related object ids
  records = records.map((record) => {
    if (record.relatedObjectIds && record.relatedObjectIds.idsToRelationship) {
      //  Just send back the expanded JSON
      record.relatedObjects = JSON.parse(record.relatedObjectIds.idsToRelationship)
    }
    return record
  })

  //  Now sort out all the images stuff
  records = records.map((record) => {
    let originalImages = {}
    if (record.images) {
      originalImages = JSON.parse(JSON.stringify(record.images))
    }
    const originalImagesMap = {}
    Object.entries(originalImages).forEach((original) => {
      const image = original[1]
      if (image.src) {
        originalImagesMap[image.src] = image
      }
    })
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

        if (args.lang === 'en') {
          if (originalImagesMap[image.src] && originalImagesMap[image.src].AltText) {
            altText = originalImagesMap[image.src].AltText
          } else {
            if (image.AltText) {
              altText = image.AltText
            }
          }
        } else {
          if (originalImagesMap[image.src] && originalImagesMap[image.src].AltTextTC) {
            altText = originalImagesMap[image.src].AltTextTC
          } else {
            if (image.AltTextTC) {
              altText = image.AltTextTC
            } else {
              if (image.AltText) altText = image.AltText
            }
          }
        }
        image.altText = altText

        //  Grab the mediaUse
        //  If we have MediaUse is the remote data we have, then use it
        if (originalImagesMap[image.src] && originalImagesMap[image.src].mediaUse) {
          image.mediaUse = originalImagesMap[image.src].mediaUse
        } else {
          if (image.MediaUse) {
            image.mediaUse = image.MediaUse
          }
        }

        //  If it's an array, FOR THE MOMENT we return just the first one
        if (Array.isArray(image.mediaUse)) {
          if (image.mediaUse.length === 0) {
            image.mediaUse = null
          } else {
            image.mediaUse = image.mediaUse[0]
          }
        }
        image.rank = parseInt(image.rank, 10)

        //  Clean up all the unwanted fields
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

  //  Add the collections data
  records = await addCollectionInformation(args.lang, records)

  //  Clean up baseline descriptions
  records = records.map((record) => {
    if (Array.isArray(record.baselineDescription)) {
      record.baselineDescription = record.baselineDescription.join('\r\n\r\n')
    }
    return record
  })

  records = records.map((record) => {
    if (Array.isArray(record.baselineDescriptionHTML)) {
      record.baselineDescriptionHTML = record.baselineDescriptionHTML.join('\r\n\r\n')
    }
    return record
  })

  //  Sort out the fullTags
  records = records.map((record) => {
    const newFullTags = []
    if (record.fullTags && record.fullTags.lens) {
      Object.entries(record.fullTags.lens).forEach((lensKV) => {
        const thisLens = {
          lens: lensKV[0],
          langs: []
        }
        if (lensKV[1].lang) {
          Object.entries(lensKV[1].lang).forEach((langKV) => {
            thisLens.langs.push({
              lang: langKV[0],
              tags: langKV[1]
            })
          })
        }
        newFullTags.push(thisLens)
      })
    }
    record.fullTags = newFullTags
    return record
  })

  //  Turn collectionCode into fonds
  records = records.map((record) => {
    record.fonds = record.collectionCode
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
  apiLogger.object(`Objects query`, {
    method: 'getObjects',
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
exports.getObjects = getObjects

const getRandomObjects = async (args, context, initialCall = false) => {
  const startTime = new Date().getTime()
  const cacheable = true
  const config = new Config()
  const baseTMS = config.get('baseTMS')
  if (baseTMS === null) return []

  const index = `randomobjects_${baseTMS}`

  //  Set up the client
  const page = common.getPage(args)
  const perPage = common.getPerPage(args)
  const body = {
    from: page * perPage,
    size: perPage
  }

  const results = await common.doCacheQuery(cacheable, index, body)
  args.ids = []
  if (results && results.hits && results.hits.hits) {
    const randomIds = results.hits.hits.map((hit) => hit._source)[0]
    if (randomIds.ids) args.ids = randomIds.ids
  }
  const objectArray = await getObjects(args, context, 2)

  const apiLogger = logging.getAPILogger()
  apiLogger.object(`Object query`, {
    method: 'getRandomObject',
    args,
    context,
    initialCall,
    subCall: !initialCall,
    ms: new Date().getTime() - startTime
  })

  if (Array.isArray(objectArray)) return objectArray
  return null
}
exports.getRandomObjects = getRandomObjects

const getObject = async (args, context, initialCall = false) => {
  const startTime = new Date().getTime()
  if (args.id) args.ids = [args.id]
  if (args.objectNumber) args.objectNumber = args.objectNumber
  const objectArray = await getObjects(args, context, 2)

  const apiLogger = logging.getAPILogger()
  apiLogger.object(`Object query`, {
    method: 'getObject',
    args,
    context,
    initialCall,
    subCall: !initialCall,
    ms: new Date().getTime() - startTime
  })

  //  If we didn't get an array back then we return nothing
  if (!Array.isArray(objectArray)) return null

  //  Grab the object
  const thisObject = objectArray[0]

  //  Check to see if we need to get any related objects
  if (thisObject && thisObject.relatedObjectIds && thisObject.relatedObjectIds.idsToRelationship && thisObject.relatedObjectIds.ids) {
    //  Build a lookup map of the ids to types
    const objectRelationships = {}
    JSON.parse(thisObject.relatedObjectIds.idsToRelationship).forEach((obj) => {
      objectRelationships[parseInt(obj.id, 10)] = {
        relatedType: obj.relatedType,
        selfType: obj.selfType
      }
    })
    //  Go grab all the related objects
    const newArgs = JSON.parse(JSON.stringify(args))
    newArgs.ids = thisObject.relatedObjectIds.ids
    delete newArgs.id

    const relatedObjects = await getObjects(newArgs, context, 2)

    //  Tuck in the types from the map
    thisObject.relatedObjects = relatedObjects.map((obj) => {
      if (objectRelationships[obj.id]) {
        if (objectRelationships[obj.id].relatedType) obj.relatedType = objectRelationships[obj.id].relatedType
        if (objectRelationships[obj.id].selfType) obj.selfType = objectRelationships[obj.id].selfType
      }
      return obj
    })
  }

  //  Update the popularCount
  const config = new Config()
  const elasticsearchConfig = config.get('elasticsearch')
  const esclient = new elasticsearch.Client(elasticsearchConfig)
  const baseTMS = config.get('baseTMS')
  if (baseTMS === null) return []

  const index = `objects_${baseTMS}`
  const type = 'object'

  //  If there isn't a "popularCount" field then we need to add one
  if (thisObject && !thisObject.popularCount) {
    esclient.update({
      index,
      type,
      id: thisObject.id,
      body: {
        doc: {
          id: thisObject.id,
          popularCount: 1
        },
        doc_as_upsert: true
      }
    })
  } else {
    if (thisObject) {
      esclient.update({
        index,
        type,
        id: thisObject.id,
        body: {
          script: 'ctx._source.popularCount += 1'
        }
      })
    }
  }
  return thisObject
}
exports.getObject = getObject

const updateTags = async (args, context, initialCall = false) => {
  // const startTime = new Date().getTime()

  //  Update the popularCount
  const config = new Config()
  const elasticsearchConfig = config.get('elasticsearch')
  const esclient = new elasticsearch.Client(elasticsearchConfig)
  const baseTMS = config.get('baseTMS')
  if (baseTMS === null) return []

  const index = `objects_${baseTMS}`
  const type = 'object'

  const fullTags = JSON.parse(args.tags)
  const tags = []

  // Grab all the tags for a simple tags array
  Object.entries(fullTags.tags.lens).forEach((lensKV) => {
    Object.entries(lensKV[1].lang).forEach((langKV) => {
      langKV[1].forEach((tag) => {
        if (!(tag in tags)) tags.push(tag)
      })
    })
  })

  //  Set the tags in the object
  esclient.update({
    index,
    type,
    id: args.id,
    body: {
      doc: {
        id: args.id,
        tags,
        fullTags: fullTags.tags
      },
      doc_as_upsert: true
    }
  })

  await delay(2000)

  const newArgs = JSON.parse(JSON.stringify(args))
  delete newArgs.tags

  //  Don't cache this one
  context.noCache = true
  const thisObject = await getObject(newArgs, context)
  return thisObject
}
exports.updateTags = updateTags

const queryBibliographies = require('../bibliographies')
const queryConcepts = require('../concepts')
const queryConstituents = require('../constituents')
const queryExhibitions = require('../exhibitions')
