const Config = require('../../../classes/config')
const common = require('../common.js')
const logging = require('../../logging')
const request = require('request-promise')
/*
##########################################################
##########################################################

This is where we get all the constituents

##########################################################
##########################################################
*/
const getConstituents = async (args, context, levelDown = 3, initialCall = false) => {
  const startTime = new Date().getTime()
  const config = new Config()
  const baseTMS = config.get('baseTMS')
  if (baseTMS === null) return []

  const index = `constituents_${baseTMS}`

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
  const keywordFields = ['activeCity', 'birthCity', 'deathCity', 'gender', 'nationality', 'region', 'type']
  const validFields = ['id', 'name', 'alphasortname', 'gender', 'begindate', 'enddate', 'activecity', 'birthcity', 'deathcity', 'type', 'nationality', 'region', 'objectcount', 'objectcountpublic']
  const validSorts = ['asc', 'desc']
  if ('sort_field' in args && validFields.includes(args.sort_field.toLowerCase()) && 'sort' in args && (validSorts.includes(args.sort.toLowerCase()))) {
    //  To actually sort on a title we need to really sort on `title.keyword`
    let sortField = args.sort_field
    if (keywordFields.includes(sortField.toLowerCase())) sortField = `${sortField}.keyword`

    //  Special cases
    if (sortField === 'gender') sortField = `gender.${args.lang}.keyword`
    if (sortField === 'activeCity') sortField = `activeCity.${args.lang}.keyword`
    if (sortField === 'birthCity') sortField = `birthCity.${args.lang}.keyword`
    if (sortField === 'deathCity') sortField = `deathCity.${args.lang}.keyword`
    if (sortField === 'nationality') sortField = `nationality.${args.lang}.keyword`
    if (sortField === 'region') sortField = `region.${args.lang}.keyword`
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

  // Do the publicAccess toggle
  if ('publicAccess' in args) {
    must.push({
      match: {
        'publicAccess': args.publicAccess
      }
    })
  }

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

  if ('slug' in args) {
    must.push({
      match: {
        'slug.keyword': args.slug
      }
    })
  }

  if ('isMaker' in args) {
    must.push({
      match: {
        isMaker: args.isMaker
      }
    })
  }

  if ('category' in args) {
    must.push({
      match: {
        'categories.keyword': args.category
      }
    })
  }

  if ('area' in args) {
    must.push({
      match: {
        'areas.keyword': args.area
      }
    })
  }

  if ('collectionName' in args) {
    must.push({
      match: {
        'collections.keyword': args.collectionName
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

  if ('role' in args && args.role !== '') {
    const pushThis = {
      match: {}
    }
    pushThis.match[`roles.keyword`] = args.role
    must.push(pushThis)
  }

  if ('type' in args && args.type !== '') {
    const pushThis = {
      match: {}
    }
    pushThis.match[`type.keyword`] = args.type
    must.push(pushThis)
  }

  if ('activeCity' in args && args.activeCity !== '') {
    const pushThis = {
      match: {}
    }
    if (args.lang && args.lang !== 'en') {
      pushThis.match[`activeCity.zh-hant.keyword`] = args.activeCity
    } else {
      pushThis.match[`activeCity.en.keyword`] = args.activeCity
    }
    must.push(pushThis)
  }

  if ('birthCity' in args && args.birthCity !== '') {
    const pushThis = {
      match: {}
    }
    if (args.lang && args.lang !== 'en') {
      pushThis.match[`birthCity.zh-hant.keyword`] = args.birthCity
    } else {
      pushThis.match[`birthCity.en.keyword`] = args.birthCity
    }
    must.push(pushThis)
  }

  if ('deathCity' in args && args.deathCity !== '') {
    const pushThis = {
      match: {}
    }
    if (args.lang && args.lang !== 'en') {
      pushThis.match[`deathCity.zh-hant.keyword`] = args.deathCity
    } else {
      pushThis.match[`deathCity.en.keyword`] = args.deathCity
    }
    must.push(pushThis)
  }

  if ('nationality' in args && args.nationality !== '') {
    const pushThis = {
      match: {}
    }
    if (args.lang && args.lang !== 'en') {
      pushThis.match[`nationality.zh-hant.keyword`] = args.nationality
    } else {
      pushThis.match[`nationality.en.keyword`] = args.nationality
    }
    must.push(pushThis)
  }

  if ('region' in args && args.region !== '') {
    const pushThis = {
      match: {}
    }
    if (args.lang && args.lang !== 'en') {
      pushThis.match[`region.zh-hant.keyword`] = args.region
    } else {
      pushThis.match[`region.en.keyword`] = args.region
    }
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

  if ('name' in args && args.name !== '') {
    must.push({
      multi_match: {
        query: args.name,
        type: 'best_fields',
        fields: ['name.en.displayName', 'name.zh-hant.displayName'],
        operator: 'or'
      }
    })
  }

  if ('nameX' in args && args.nameX !== '') {
    const pushThis = {
      match: {}
    }
    if (args.lang && args.lang !== 'en') {
      pushThis.match[`name.zh-hant.displayName.keyword`] = args.nameX
    } else {
      pushThis.match[`name.en.displayName.keyword`] = args.nameX
    }
    must.push(pushThis)
  }

  if ('keyword' in args && args.title !== '') {
    must.push({
      multi_match: {
        query: args.keyword,
        type: 'best_fields',
        fields: ['name.en.displayName', 'name.zh-hant.displayName', 'activeCity.en', 'activeCity.zh-hant', 'birthCity.en', 'birthCity.zh-hant', 'deathCity.en', 'deathCity.zh-hant', 'displayBio.en', 'displayBio.zh-hant', 'exhibitions.biographies.en.text', 'exhibitions.biographies.zh-hant.text', 'nationality.en', 'nationality.zh-hant', 'region.en', 'region.zh-hant', 'type'],
        operator: 'or'
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

  // console.log(JSON.stringify(body, null, 4))

  //  Run the search
  const results = await common.doCacheQuery(cacheable, index, body)

  let total = null
  if (results.hits.total) total = results.hits.total

  let records = results.hits.hits.map((hit) => hit._source).map((record) => {
    //  Grab the name
    let newName = null
    let newAlphaName = null
    const displayNameObj = {}

    if (record.name) {
      Object.entries(record.name).forEach((entry) => {
        if (entry[1].displayName) {
          displayNameObj[entry[0]] = entry[1].displayName
        }
      })

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

    //  Get the other name
    const nameOther = common.getSingleTextFromArrayByNotLang(displayNameObj, args.lang)
    if (nameOther) record.nameOther = nameOther

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
    record.gender = common.getSingleTextFromArrayByLang(record.gender, args.lang)
    record.displayBio = common.getSingleTextFromArrayByLang(record.displayBio, args.lang)
    record.nationality = common.getSingleTextFromArrayByLang(record.nationality, args.lang)
    record.region = common.getSingleTextFromArrayByLang(record.region, args.lang)
    record.activeCity = common.getSingleTextFromArrayByLang(record.activeCity, args.lang)
    record.birthCity = common.getSingleTextFromArrayByLang(record.birthCity, args.lang)
    record.deathCity = common.getSingleTextFromArrayByLang(record.deathCity, args.lang)
    record.biography = common.getSingleTextFromArrayByLang(record.biography, args.lang)

    //  Fill things with deafult language if null
    if (args.lang !== 'en') {
      if (!record.biography) common.getSingleTextFromArrayByLang(record.biography, 'en')
    }

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
          per_page: 999
        }
        //  Did we have any filters that needed to be passed on from the
        //  single constituent to the objects query
        if (args.object_per_page) newArgs.per_page = args.object_per_page
        if (args.object_page) newArgs.page = args.object_page
        if (args.object_category) newArgs.category = args.object_category
        if (args.object_area) newArgs.area = args.object_area
        if (args.object_medium) newArgs.medium = args.object_medium
        if (args.publicAccess) newArgs.publicAccess = args.publicAccess
        record.roles = []
        record.objects = await queryObjects.getObjects(newArgs, context, levelDown + 1)
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

  //  Unfold the aggregrate counts
  let lang = 'en'
  if (args.lang) lang = args.lang
  records.forEach((thisConstituent) => {
    if (thisConstituent.aggregateCounts) {
      const aggregateCounts = JSON.parse(thisConstituent.aggregateCounts)
      if (aggregateCounts.lang[lang]) {
        if (aggregateCounts.lang[lang].categoriesAgg) {
          thisConstituent.categories = []
          Object.entries(aggregateCounts.lang[lang].categoriesAgg).forEach((data) => {
            thisConstituent.categories.push({
              title: data[1].title,
              slug: data[1].slug,
              count: data[1].count
            })
          })
        }
        if (aggregateCounts.lang[lang].areasAgg) {
          thisConstituent.areas = []
          Object.entries(aggregateCounts.lang[lang].areasAgg).forEach((data) => {
            thisConstituent.areas.push({
              title: data[1].title,
              slug: data[1].slug,
              count: data[1].count
            })
          })
        }
        if (aggregateCounts.lang[lang].collectionAgg) {
          thisConstituent.collectionNames = []
          Object.entries(aggregateCounts.lang[lang].collectionAgg).forEach((data) => {
            thisConstituent.collectionNames.push({
              title: data[1].title,
              slug: data[1].slug,
              count: data[1].count
            })
          })
        }
      }
    }
    if (thisConstituent.categories && thisConstituent.categories.length === 0) thisConstituent.categories = null
    if (thisConstituent.areas && thisConstituent.areas.length === 0) thisConstituent.areas = null
    if (thisConstituent.collectionNames && thisConstituent.collectionNames.length === 0) thisConstituent.collectionNames = null
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
  apiLogger.object(`Constituents query`, {
    method: 'getConstituents',
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
exports.getConstituents = getConstituents

exports.getConstituent = async (args, context, initialCall = false) => {
  const startTime = new Date().getTime()
  if (args.id) args.ids = [args.id]
  if (args.slug) args.slug = args.slug
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

  const apiLogger = logging.getAPILogger()
  apiLogger.object(`Constituent query`, {
    method: 'getConstituent',
    args,
    context,
    initialCall,
    subCall: !initialCall,
    ms: new Date().getTime() - startTime
  })

  if (Array.isArray(constituentArray)) {
    const thisConstituent = constituentArray[0]
    if (thisConstituent) {
      //  Now wee if there's a story URL, and we've asked for the story URL
      //  If we have a storyURL and we have been asked for a storyURL then go get the data
      if (thisConstituent.storyUrl && context.query.indexOf('storyUrl') >= 0) {
        let url = thisConstituent.storyUrl
        if (args.lang !== 'en') url = url.replace('/en/', '/tc/')
        //  Grab the data from the story page
        const body = await fetchPage(url)
        //  Try and get the title
        thisConstituent.storyTitle = null
        const titleSplit = body.split('og:title" content="')
        if (titleSplit.length > 1) {
          thisConstituent.storyTitle = titleSplit[1].split('"')[0].replace(' - M+ Stories', '').replace(' - M+故事', '').replace(/&#39;/g, "'")
        }

        thisConstituent.storyImage = null
        const imageSplit = body.split('og:image" content="')
        if (imageSplit.length > 1) {
          thisConstituent.storyImage = imageSplit[1].split('"')[0]
        }
      }
    }
    return thisConstituent
  }
  return null
}

const fetchPage = async (url) => {
  if (global.urlCache && global.urlCache[url] && global.urlCache[url].expire > new Date().getTime()) {
    const deepStringResult = JSON.stringify(global.urlCache[url].body)
    return JSON.parse(deepStringResult)
  }

  return request({
    url,
    method: 'GET'
  })
    .then(response => {
      if (!global.urlCache) global.urlCache = {}
      const deepStringReponse = JSON.stringify(response)
      const cacheExpiresLimitMins = 60 * 24 // Cache for 60 * 24 minutes
      global.urlCache[url] = {
        expire: new Date().getTime() + (cacheExpiresLimitMins * 60 * 1000),
        body: JSON.parse(deepStringReponse)
      }
      return response
    })
    .catch(error => {
      console.log(error)
      return null
    })
}
const queryObjects = require('../objects')
