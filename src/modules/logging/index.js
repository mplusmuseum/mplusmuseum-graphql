/**
 * This module sets up all the config for the various logging we have and allows
 * us to create an instance of whichever one we need, currently just a tmsLogger
 */
const Config = require('../../classes/config')
const path = require('path')
const elasticsearch = require('elasticsearch')

const rootDir = __dirname

// Set logging up
const winston = require('winston')
const DailyRotateFile = require('winston-daily-rotate-file')
const {
  format
} = require('winston')
const {
  combine,
  timestamp,
  printf
} = format

const tsFormat = () => (new Date()).toLocaleTimeString()

const myFormat = printf(info => {
  const timestamp = info.timestamp
  delete info.timestamp
  return `${timestamp} [${info.level}]: ${JSON.stringify(info)}`
})

const apiLoggerFile = winston.createLogger({
  levels: {
    fail: 0,
    object: 1,
    collection: 2
  },
  level: 'fail',
  format: combine(
    timestamp(),
    myFormat
  ),
  transports: [
    new DailyRotateFile({
      filename: path.join(rootDir, '../../../logs/api/results-%DATE%.log'),
      level: 'collection',
      prepend: true,
      datePattern: 'YYYY-MM-DD',
      maxFiles: '28d',
      timestamp: tsFormat
    }),
    new winston.transports.Console({
      level: 'fail',
      json: true,
      timestamp: tsFormat
    })
  ]
})

// const config = new Config()
// const elasticsearchConfig = config.get('elasticsearch')
class ESLogger {
  object (name, data) {
    /*
    const config = new Config()
    const elasticsearchConfig = config.get('elasticsearch')
    if (elasticsearchConfig === null) {
      return
    }
    const esclient = new elasticsearch.Client(elasticsearchConfig)
    const baseTMS = config.get('baseTMS')

    if (baseTMS !== null) {
      const index = `logs_${baseTMS}_graphql`
      data.name = name
      data.datetime = new Date()
      data.timestamp = data.datetime.getTime()

      esclient.update({
        index,
        type: 'log',
        id: data.timestamp,
        body: {
          doc: data,
          doc_as_upsert: true
        }
      })
    }
    */
  }
}

/**
 * Gets us access to the TMS logger, which has 4 levels of logging;
 * page, pre, post and fail
 * object is used when deal with objects
 * collection is when we deal with collections
 * fail is when we failed to do something
 * A sample log may look like...
 * tmsLogger.object('fetched', {id: 1234, ms: 24})
 */
exports.getAPILogger = () => {
  const config = new Config()
  const elasticsearchConfig = config.get('elasticsearch')
  if (elasticsearchConfig === null) {
    return apiLoggerFile
  }
  return new ESLogger()
}

exports.createIndex = async () => {
  const config = new Config()
  const elasticsearchConfig = config.get('elasticsearch')
  if (elasticsearchConfig === null) {
    return
  }
  const esclient = new elasticsearch.Client(elasticsearchConfig)
  const baseTMS = config.get('baseTMS')

  if (baseTMS !== null) {
    const index = `logs_${baseTMS}_graphql`
    const exists = await esclient.indices.exists({
      index
    })
    if (exists === false) {
      await esclient.indices.create({
        index
      })
    }
  }
}

const cullLogs = () => {
  console.log('culling logs')
}

exports.startCulling = () => {
  //  Remove the old interval timer
  clearInterval(global.cullLogs)
  global.elasticsearchTmr = setInterval(() => {
    cullLogs()
  }, 1000 * 60 * 60 * 24) // Once a day, cull the old logs
  cullLogs()
}
