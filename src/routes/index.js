const fs = require('fs')
const path = require('path')
const express = require('express')
const passport = require('passport')
const router = express.Router()
const User = require('../classes/user')
const ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn()
const langDir = path.join(__dirname, '../../lang/dashboard')
const Config = require('../classes/config')
const expressGraphql = require('express-graphql')
const bodyParser = require('body-parser')
const cors = require('cors')
const {
  buildSchema
} = require('graphql')
const schemaPublic = require('../modules/schema/public.js')
const schemaVendor = require('../modules/schema/vendor.js')
const queries = require('../modules/queries')
const request = require('request-promise')

// Break out all the seperate parts of the site
/* eslint-disable import/no-unresolved */
const admin = require('./admin')
const config = require('./config')
const documentation = require('./documentation')
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

  if (!req.session || !req.session.user) {
    req.templateValues.user = null
  } else {
    //  Shortcut the roles
    if ('user_metadata' in req.session.user && 'roles' in req.session.user.user_metadata) {
      req.session.user.roles = req.session.user.user_metadata.roles
      req.session.user.apitoken = req.session.user.user_metadata.apitoken
    } else {
      req.session.user.roles = {
        isAdmin: false,
        isDeveloper: false,
        isStaff: false
      }
    }
    req.templateValues.user = req.session.user
  }

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
        'elasticsearch' in req.body &&
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
        configObj.set('elasticsearch', {
          host: req.body.elasticsearch
        })
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

  //  Grab the language
  const defaultLang = 'en'
  let selectedLang = defaultLang
  const potentialLang = req.url.split('?')[0].split('/')[1]
  const validLangs = ['en', 'tc']

  if (validLangs.includes(potentialLang)) {
    selectedLang = potentialLang
  }
  req.templateValues.lang = selectedLang

  //  Read in the correct language
  const i18n = JSON.parse(fs.readFileSync(path.join(langDir, `strings.${defaultLang}.json`)))
  if (selectedLang !== defaultLang) {
    const selectedi18n = JSON.parse(fs.readFileSync(path.join(langDir, `strings.${selectedLang}.json`)))
    Object.entries(selectedi18n).forEach((branch) => {
      const key = branch[0]
      const values = branch[1]
      if (!(key in i18n)) i18n[key] = {}
      Object.assign(i18n[key], values)
    })
  }
  req.templateValues.i18n = i18n

  //  Work out what the toggle URL is
  const urlSplit = req.url.split('/')
  //  If we have a url that can be toggled
  if (urlSplit.length >= 2 && validLangs.includes(urlSplit[1])) {
    //  Swap out the language for a new one
    if (urlSplit[1] === 'en') {
      urlSplit[1] = 'tc'
    } else {
      urlSplit[1] = 'en'
    }
    const toggleURL = urlSplit.join('/')
    req.templateValues.toggleURL = toggleURL
  }

  next()
})

//  This is the resolver
const root = {
  hello: (args, context) => {
    return `world`
  },
  killCache: (args, context) => {
    if (context.isDashboard === true || context.isSelf === true) {
      delete global.queryCache
      return true
    } else {
      return false
    }
  },
  objects: (args, context) => {
    /* eslint-disable import/no-unresolved */
    return queries.objects.getObjects(args, context, undefined, true)
  },
  randomobjects: (args, context) => {
    /* eslint-disable import/no-unresolved */
    return queries.objects.getRandomObjects(args, context, undefined, true)
  },
  object: (args, context) => {
    return queries.objects.getObject(args, context, true)
  },
  updateTags: (args, context) => {
    return queries.objects.updateTags(args, context, true)
  },
  constituents: (args, context) => {
    return queries.constituents.getConstituents(args, context, undefined, true)
  },
  constituent: (args, context) => {
    return queries.constituents.getConstituent(args, context, true)
  },
  exhibitions: (args, context) => {
    return queries.exhibitions.getExhibitions(args, context, undefined, true)
  },
  exhibition: (args, context) => {
    return queries.exhibitions.getExhibition(args, context, true)
  },
  concepts: (args, context) => {
    return queries.concepts.getConcepts(args, context, undefined, true)
  },
  concept: (args, context) => {
    return queries.concepts.getConcept(args, context, true)
  },
  bibliographies: (args, context) => {
    return queries.bibliographies.getBibliographies(args, context, undefined, true)
  },
  bibliography: (args, context) => {
    return queries.bibliographies.getBibliography(args, context, true)
  },
  areas: (args, context) => {
    return queries.common.getAreas(args, context, undefined, true)
  },
  categories: (args, context) => {
    return queries.common.getCategories(args, context, undefined, true)
  },
  archivalLevels: (args, context) => {
    return queries.common.getArchivalLevels(args, context, undefined, true)
  },
  statuses: (args, context) => {
    return queries.common.getStatuses(args, context, undefined, true)
  },
  names: (args, context) => {
    return queries.common.getNames(args, context, undefined, true)
  },
  collectionTypes: (args, context) => {
    return queries.common.getCollectionTypes(args, context, undefined, true)
  },
  collectionCodes: (args, context) => {
    return queries.common.getCollectionCodes(args, context, undefined, true)
  },
  fonds: (args, context) => {
    return queries.common.getCollectionCodes(args, context, undefined, true)
  },
  collectionNames: (args, context) => {
    return queries.common.getCollectionNames(args, context, undefined, true)
  },
  departments: (args, context) => {
    return queries.common.getDepartments(args, context, undefined, true)
  },
  styles: (args, context) => {
    return queries.common.getStyles(args, context, undefined, true)
  },
  mediums: (args, context) => {
    return queries.common.getMediums(args, context, undefined, true)
  },
  tags: (args, context) => {
    return queries.common.getTags(args, context, undefined, true)
  },
  makertypes: (args, context) => {
    return queries.common.getMakerTypes(args, context, undefined, true)
  },
  conActiveCities: (args, context) => {
    return queries.common.getConActiveCities(args, context, undefined, true)
  },
  conBirthCities: (args, context) => {
    return queries.common.getConBirthCities(args, context, undefined, true)
  },
  conDeathCities: (args, context) => {
    return queries.common.getConDeathCities(args, context, undefined, true)
  },
  genders: (args, context) => {
    return queries.common.getGenders(args, context, undefined, true)
  },
  nationalities: (args, context) => {
    return queries.common.getNationalities(args, context, undefined, true)
  },
  conRegions: (args, context) => {
    return queries.common.getConRegions(args, context, undefined, true)
  },
  conTypes: (args, context) => {
    return queries.common.getConTypes(args, context, undefined, true)
  },
  conRoles: (args, context) => {
    return queries.common.getConRoles(args, context, undefined, true)
  },
  lenses: (args, context) => {
    return queries.common.getLenses(args, context, undefined, true)
  },
  createLens: (args, context) => {
    return queries.common.createLens(args, context, undefined, true)
  },
  updateLens: (args, context) => {
    return queries.common.updateLens(args, context, undefined, true)
  },
  deleteLens: (args, context) => {
    return queries.common.deleteLens(args, context, undefined, true)
  },
  lookup: (args, context) => {
    return queries.common.getLookup(args, context, undefined, true)
  },
  timeline: (args, context) => {
    return queries.timeline.getTimeline(args, context, undefined, true)
  },
  factoids: (args, context) => {
    return queries.factoids.getFactoids(args, context, undefined, true)
  },
  randoms: (args, context) => {
    return queries.randoms.getRandoms(args, context, undefined, true)
  }
}

const getGrpObj = (isPlayground, isVendor, token, query) => {
  const grpObj = {
    schema: buildSchema(schemaPublic.schema),
    rootValue: root,
    context: {
      token,
      query
    },
    graphiql: isPlayground
  }
  if (isVendor) {
    grpObj.schema = buildSchema(schemaVendor.schema)
    grpObj.context.isPublic = true
    grpObj.context.isVendor = true
  } else {
    grpObj.schema = buildSchema(schemaPublic.schema)
    grpObj.context.isPublic = true
    grpObj.context.isVendor = false
  }
  const configObj = new Config()
  grpObj.context.isDashboard = false
  grpObj.context.isSelf = false
  if (configObj.dashboard && configObj.dashboard.handshake && configObj.dashboard.handshake === token) {
    grpObj.context.isDashboard = true
  }
  if (configObj.handshake && configObj.handshake === token) {
    grpObj.context.isSelf = true
    grpObj.context.noCache = true
  }
  return grpObj
}

const getIsVendor = async (token) => {
  let isVendor = false

  const configObj = new Config()
  if (!configObj.dashboard || !configObj.dashboard.host || !configObj.dashboard.handshake) return false
  //  If we have called the api with the dashboards handshake, then we are a vendor
  if (configObj.handshake === token) return true
  if (configObj.dashboard.handshake === token) return true

  //  Now check in the gloabls to see if we have it
  if (token in global.tokens) {
    //  If the check is still in the expires limit the just use it
    if (new Date().getTime() < global.tokens[token].expires) {
      return global.tokens[token].isVendor
    }
  }

  const payload = {
    token
  }
  const options = {
    method: 'POST',
    url: `${configObj.dashboard.host}api/checkToken`,
    headers: {
      'content-type': 'application/json',
      Authorization: `bearer ${configObj.dashboard.handshake}`
    },
    json: payload
  }
  const rtnObj = await request(options)
    .then(response => {
      return response
    })
    .catch(error => {
      return [error]
    })

  // If we've been given an array back, then an error happened, so lets say this isn't a vendor
  if (Array.isArray(rtnObj)) {
    //  TODO: put the token in the globals saying it's not a vendor
    global.tokens[token] = {
      valid: false,
      isVendor: false,
      expires: (new Date().getTime()) + (86400 * 1000)
    }
    return false
  }

  if (rtnObj.status && rtnObj.status === 'ok' && rtnObj.roles && 'isVendor' in rtnObj.roles && rtnObj.expires_in) {
    //  TODO: put the toke and result into globals
    isVendor = rtnObj.roles.isVendor
    global.tokens[token] = {
      valid: true,
      isVendor,
      expires: (new Date().getTime()) + (parseInt(rtnObj.expires_in, 10) * 1000)
    }
    return isVendor
  }

  global.tokens[token] = {
    valid: false,
    isVendor: false,
    expires: (new Date().getTime) + (86400 * 1000)
  }
  return isVendor
}

router.use('/graphql', bodyParser.json(), expressGraphql(async (req) => {
  let token = null
  if (req && req.headers && req.headers.authorization) {
    const tokenSplit = req.headers.authorization.split(' ')
    if (tokenSplit[1]) token = tokenSplit[1]
  }
  const isVendor = await getIsVendor(token)
  return (getGrpObj(false, isVendor, token, req.body.query))
}))

router.use('/:token/playground', bodyParser.json(), expressGraphql(async (req) => {
  const isVendor = await getIsVendor(req.params.token)
  return (getGrpObj(true, isVendor, req.params.token, req.body.query))
}))

// ############################################################################
//
//  Here are all the main routes
//
// ############################################################################

router.get('/', main.index)
router.get('/admin/translation', ensureLoggedIn, admin.translation)
router.post('/admin/translation', ensureLoggedIn, admin.translation)
router.get('/config', ensureLoggedIn, config.index)
router.post('/config', ensureLoggedIn, config.index)
router.get('/status', ensureLoggedIn, status.index)
router.get('/status/elasticsearch', ensureLoggedIn, status.elasticsearch)
router.get('/wait', main.wait)

router.get('/documentation', documentation.index)
router.get('/:lang/documentation', documentation.index)
router.get('/:lang/documentation/about', documentation.about)
router.get('/:lang/documentation/termsofuse', documentation.termsofuse)

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
    if (req.session.passport) {
      req.session.passport.user = null
      delete req.session.passport.user
    }
    delete req.session.passport

    req.session.user = null
    delete req.session.user

    req.session.save()
    req.session.destroy(function (err) {
      res.clearCookie('connect.sid')
      setTimeout(() => {
        res.redirect(307, '/')
      }, 1000)
      if (err) {
        setTimeout(() => {
          res.redirect(307, '/')
        }, 1000)
      }
    })
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
      req.session.user = await new User().get(req.user)
      req.session.save()
      let pow = JSON.stringify(req.session.user)
      pow = JSON.parse(pow)
      req.session.save()
      return setTimeout(() => {
        req.session.save()
        console.log(`Logging in >> ${pow.user_id}`)
        req.session.save()
        res.redirect(307, '/en/documentation')
      }, 2500)
    }
  )
}

module.exports = router
