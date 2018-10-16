const csv = require('csvtojson')
const fs = require('fs')
const path = require('path')
const logging = require('../../logging')

/*
##########################################################
##########################################################

Do the timeline

##########################################################
##########################################################
*/
exports.getTimeline = async (args, context, levelDown = 3, initialCall = false) => {
  const startTime = new Date().getTime()
  let timeline = []
  if (context.isVendor !== true) return timeline
  // Try and load the file
  const filename = path.join(__dirname, '..', '..', '..', '..', 'data', 'SiggOnlineTimeline.csv')

  if (fs.existsSync(filename)) {
    const timelineJSON = await csv().fromFile(filename)
    timeline = timelineJSON.map((entry) => {
      let useLang = args.lang
      if (useLang === 'en') {
        useLang = 'EN'
      } else {
        useLang = 'TC'
      }
      entry.title = entry[`title${useLang}`]
      entry.paragraph = entry[`paragraph${useLang}`]
      entry.imageTitle = entry[`imageTitle${useLang}`]
      entry.imagesObjectId = parseInt(entry.imageObjectId, 10)
      if (isNaN(entry.imagesObjectId)) delete entry.imagesObjectId
      return entry
    })
  }

  //  Now get the imagesObjectIds
  const objectIds = timeline.map((time) => {
    return time.imagesObjectId
  }).filter(Boolean)
  const newArgs = {
    lang: args.lang,
    per_page: 500,
    ids: objectIds
  }
  const objects = await queryObjects.getObjects(newArgs, context, 3)

  //  Create the map
  const objectsMap = {}
  objects.forEach((object) => {
    objectsMap[object.id] = object
  })
  timeline = timeline.map((time) => {
    if (time.imagesObjectId in objectsMap) {
      if (objectsMap[time.imagesObjectId].images) time.images = objectsMap[time.imagesObjectId].images
      if (objectsMap[time.imagesObjectId].color) time.color = objectsMap[time.imagesObjectId].color
    }
    return time
  })

  const apiLogger = logging.getAPILogger()
  apiLogger.object(`Timeline query`, {
    method: 'getTimeline',
    args,
    context,
    levelDown,
    initialCall,
    subCall: !initialCall,
    records: timeline.length,
    ms: new Date().getTime() - startTime
  })

  return timeline
}

const queryObjects = require('../objects')
