exports.index = (req, res) => {
  req.templateValues.navOpen = 'documentation'

  //  If we don't have a lang in the parameters then we need to redirect
  if (!req.params.lang) {
    //  If we have a logged in user then use what they have as their
    //  default language, otherwise...
    let lang = 'en'
    if (req.templateValues.user && req.templateValues.user.user_metadata && req.templateValues.user.user_metadata.lang) {
      lang = req.templateValues.user.user_metadata.lang
    }
    return res.redirect(`/${lang}${req.path}`)
  }

  let isVendor = false
  let loadFile = 'public'

  if (req.templateValues.user && req.templateValues.user.roles && 'isVendor' in req.templateValues.user.roles) {
    isVendor = req.templateValues.user.roles.isVendor
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
