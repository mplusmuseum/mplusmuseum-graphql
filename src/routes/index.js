const express = require('express')
const passport = require('passport')
const router = express.Router()
const User = require('../classes/user')
const ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn()
const Config = require('../classes/config')
const expressGraphql = require('express-graphql')
const cors = require('cors')
const {
  buildSchema
} = require('graphql')
const schema = require('../modules/schema')
const queries = require('../modules/queries')

// Break out all the seperate parts of the site
/* eslint-disable import/no-unresolved */
const config = require('./config')
const main = require('./main')
const status = require('./status')

// Note: '*' will whitelist all domains.
// If we remove the auth, we may want to lock this down.
const coorsAllowedOrigin = '*'

// bypass auth for preflight requests
// we need this because the apolloClient uses fetch which triggers a preflight request
router.options('/*', function (req, res, next) {
  res.header('Access-Control-Allow-Origin', coorsAllowedOrigin)
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With')
  res.sendStatus(200)
})

// enable cors. "credentials: true" is needed to pass auth through cors.
router.use(cors({
  origin: coorsAllowedOrigin
}))

//  Redirect to https, make sure...
//  app.enable('trust proxy')
//  is set in server.js
router.use(function (req, res, next) {
  let remoteAccess = true

  //  Because of the way we are hosting we need to do an extra weird check
  //  about coming in from outside or via a ip:port before we tie up the whole
  //  lot in a knot.
  const hostSplit = req.headers['host'].split(':')
  if (hostSplit.length > 1) {
    if (hostSplit[1] === process.env.PORT) {
      remoteAccess = false
    }
  }
  if (!(req.secure) && process.env.REDIRECT_HTTPS === 'true' && remoteAccess === true) {
    var secureUrl = 'https://' + req.headers['host'] + req.url
    res.writeHead(301, {
      Location: secureUrl
    })
    res.end()
  } else {
    next()
  }
})

// ############################################################################
//
/*
 * Always create a templateValues object that gets passed to the
 * templates. The config object from global (this allows use to
 * manipulate it here if we need to) and the user if one exists
 */
//
// ############################################################################
router.use(function (req, res, next) {
  req.templateValues = {}
  const configObj = new Config()
  req.config = configObj
  req.templateValues.config = req.config
  req.templateValues.NODE_ENV = process.env.NODE_ENV
  if (req.user === undefined) {
    req.user = null
  } else {
    //  Shortcut the roles
    if ('user_metadata' in req.user && 'roles' in req.user.user_metadata) {
      req.user.roles = req.user.user_metadata.roles
      req.user.apitoken = req.user.user_metadata.apitoken
    } else {
      req.user.roles = {
        isAdmin: false,
        isDeveloper: false,
        isStaff: false
      }
    }
  }
  req.templateValues.user = req.user

  //  If there is no Auth0 setting in config then we _must_
  //  check to see if we are setting Auth0 settings and if
  //  not, redirect to the Auth0 form.
  if (configObj.get('auth0') === null) {
    // Check to see if values are being posted to us
    if (req.method === 'POST') {
      if (
        'action' in req.body &&
        'AUTH0_DOMAIN' in req.body &&
        'AUTH0_CLIENT_ID' in req.body &&
        'AUTH0_SECRET' in req.body &&
        'AUTH0_CALLBACK_URL' in req.body &&
        'handshake' in req.body &&
        req.body.action === 'save' &&
        req.body.handshake === configObj.get('handshake')
      ) {
        const auth0 = {
          AUTH0_DOMAIN: req.body.AUTH0_DOMAIN,
          AUTH0_CLIENT_ID: req.body.AUTH0_CLIENT_ID,
          AUTH0_SECRET: req.body.AUTH0_SECRET,
          AUTH0_CALLBACK_URL: req.body.AUTH0_CALLBACK_URL
        }
        configObj.set('auth0', auth0)
        setTimeout(() => {
          global.doRestart = true
          process.exit()
        }, 500)
        return res.redirect('/wait')
      }
    }

    //  If not, check to see if we've been passed a handshake
    if ('handshake' in req.query) {
      req.templateValues.handshake = req.query.handshake
    }

    //  Set up a nice handy default callback if we are developing
    if (process.env.NODE_ENV === 'development') {
      req.templateValues.callbackUrl = `http://${process.env.HOST}:${process.env.PORT}/callback`
    }
    req.templateValues.NODE_ENV = process.env.NODE_ENV
    return res.render('config/auth0', req.templateValues)
  }
  next()
})

//  This is the resolver
const root = {
  hello: () => {
    return `world`
  },
  objects: (args) => {
    return queries.getObjects(args)
  },
  object: (args) => {
    return queries.getObject(args)
  },
  constituents: (args) => {
    return queries.getConstituents(args)
  },
  constituent: (args) => {
    return queries.getConstituent(args)
  },
  areas: (args) => {
    return queries.getAreas(args)
  },
  categories: (args) => {
    return queries.getCategories(args)
  },
  mediums: (args) => {
    return queries.getMediums(args)
  }
}

router.use('/graphql', expressGraphql({
  schema: buildSchema(schema.schema),
  rootValue: root,
  graphiql: false
}))

router.use('/playground', expressGraphql({
  schema: buildSchema(schema.schema),
  rootValue: root,
  graphiql: true
}))

// ############################################################################
//
//  Here are all the main routes
//
// ############################################################################

router.get('/', main.index)
router.get('/config', ensureLoggedIn, config.index)
router.post('/config', ensureLoggedIn, config.index)
router.get('/status', ensureLoggedIn, status.index)
router.get('/status/elasticsearch', ensureLoggedIn, status.elasticsearch)
router.get('/wait', main.wait)

// ############################################################################
//
//  Log in and log out tools
//
// ############################################################################

const configObj = new Config()
if (configObj.get('auth0') !== null) {
  const auth0Obj = configObj.get('auth0')
  router.get(
    '/login',
    passport.authenticate('auth0', {
      clientID: auth0Obj.AUTH0_CLIENT_ID,
      domain: auth0Obj.AUTH0_DOMAIN,
      redirectUri: auth0Obj.AUTH0_CALLBACK_URL,
      audience: `https://${auth0Obj.AUTH0_DOMAIN}/userinfo`,
      responseType: 'code',
      scope: 'openid profile'
    }),
    function (req, res) {
      res.redirect('/')
    }
  )

  // Perform session logout and redirect to homepage
  router.get('/logout', (req, res) => {
    req.logout()
    res.redirect('/')
  })

  // Perform the final stage of authentication and redirect to '/user'
  router.get(
    '/callback',
    passport.authenticate('auth0', {
      failureRedirect: '/'
    }),
    async function (req, res) {
      //  Update the user with extra information
      req.session.passport.user = await new User().get(req.user)
      res.redirect(req.session.returnTo || '/')
    }
  )
}

module.exports = router
