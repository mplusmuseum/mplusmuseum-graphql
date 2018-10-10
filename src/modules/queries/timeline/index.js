const csv = require('csvtojson')
const fs = require('fs')
const path = require('path')

/*
##########################################################
##########################################################

Do the timeline

##########################################################
##########################################################
*/
exports.getTimeline = async (args, context) => {
  let timeline = []
  if (context.isVendor !== true) return timeline
  // Try and load the file
  const filename = path.join(__dirname, '..', '..', '..', '..', 'data', 'SiggOnlineTimeline.csv')
  console.log(filename)
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
      return entry
    })
  }

  return timeline
}
