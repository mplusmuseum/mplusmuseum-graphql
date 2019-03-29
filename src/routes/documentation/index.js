exports.index = (req, res) => {
  req.templateValues.navOpen = 'documentation'
  if (!req.user) {
    return res.render('documentation/pleaselogin', req.templateValues)
  }

  let isVendor = false
  let loadFile = 'public'

  if (req.user && req.user.roles && 'isVendor' in req.user.roles) {
    isVendor = req.user.roles.isVendor
  }
  if (isVendor) loadFile = 'vendors'
  const Queries = require(`../../classes/queries/${loadFile}.js`)
  req.templateValues.queries = new Queries()

  req.templateValues.config.graphql = {
    host: req.templateValues.config.auth0.AUTH0_CALLBACK_URL.replace('/callback', '')
  }

  return res.render('documentation/index', req.templateValues)
}

exports.about = (req, res) => {
  req.templateValues.navOpen = 'aboutapi'
  return res.render('documentation/about', req.templateValues)
}

exports.termsofuse = (req, res) => {
  req.templateValues.navOpen = 'termsofuse'
  return res.render('documentation/termsofuse', req.templateValues)
}
