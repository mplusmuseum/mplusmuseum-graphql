/**
 * This module sets up all the config for the various logging we have and allows
 * us to create an instance of whichever one we need, currently just a tmsLogger
 */
const path = require('path')

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

const apiLogger = winston.createLogger({
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
  return apiLogger
}
