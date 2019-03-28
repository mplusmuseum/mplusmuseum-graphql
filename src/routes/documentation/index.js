exports.index = (req, res) => {
  req.templateValues.navOpen = 'documentation'
  if (!req.user) {
    return res.render('documentation/pleaselogin', req.templateValues)
  }
  return res.render('documentation/index', req.templateValues)
}

exports.about = (req, res) => {
  req.templateValues.navOpen = 'aboutapi'
  return res.render('documentation/about', req.templateValues)
}
