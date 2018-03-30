const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '../.env') })
const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const fs = require('fs')
const exphbs = require('express-handlebars')
const marked = require('marked')
const { graphqlExpress, graphiqlExpress } = require('apollo-server-express')
const auth = require('http-auth')
const basic = auth.basic({
  realm: 'Private area',
  file: path.join(__dirname + '/../.htpasswd')
})

// Note: '*' will whitelist all domains.
// If we remove the auth, we may want to lock this down.
const coorsAllowedOrigin = '*'

import schema from './schema'

import connectES from './connectors/elasticsearchConnector'

const start = async () => {
  const elasticsearch = await connectES()

  /*
   *  Set up bare bones express framework so we can serve a homepage
   */
  const app = express()
  const hbs = exphbs.create({
    extname: '.html'
  })
  app.engine('html', hbs.engine)
  app.set('view engine', 'html')
  app.set('views', path.join(__dirname + '/../src/templates'))

  /*
   * Redirect to https if we aren't already and the flag is set in .env
   */
  app.use(function (req, res, next) {
    if (!(req.secure === true) && process.env.REDIRECT_HTTPS === true) {
      var secureUrl = 'https://' + req.headers['host'] + req.url
      res.writeHead(301, { Location: secureUrl })
      res.end()
    } else {
      next()
    }
  })

  // bypass auth for preflight requests
  // we need this because the apolloClient uses fetch which triggers a preflight request
  app.options('/*', function (req, res, next) {
    res.header('Access-Control-Allow-Origin', coorsAllowedOrigin)
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    res.header(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization, Content-Length, X-Requested-With'
    )
    res.sendStatus(200)
  })

  // now use auth (this should come after the "options" method bypass)
  app.use(auth.connect(basic))

  // enable cors. "credentials: true" is needed to pass auth through cors.
  app.use(
    cors({
      origin: coorsAllowedOrigin,
      credentials: true
    })
  )

  //  The homepage. To keep things super simple(ish) the actual page contents
  //  is in a markdown file.
  //  TODO: Sort out the build process so it actually puts the templates
  //  and markdown into the `build` folder rather than reading from `src`
  app.get('/', function (req, res) {
    const templateValues = {}
    const mdFile = path.join(__dirname + '/../src/templates/index.md')
    const indexMarkdown = fs.readFileSync(mdFile, 'utf-8')
    templateValues.content = marked(indexMarkdown)
    return res.render('index', templateValues)
  })

  app.use(
    '/graphql',
    bodyParser.json(),
    graphqlExpress({
      context: { elasticsearch },
      schema
    })
  )

  app.use(
    '/api-explorer',
    graphiqlExpress({
      endpointURL: './graphql'
    })
  )

  const { GRAPHQL_HOST = 'localhost', GRAPHQL_PORT = 3000 } = process.env

  app.listen(GRAPHQL_PORT, GRAPHQL_HOST, () => {
    console.log(`GraphQL listening on ${GRAPHQL_HOST}:${GRAPHQL_PORT}`)
  })
}

start()
