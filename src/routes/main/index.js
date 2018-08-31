const decortation = require('../../modules/decoration')

exports.index = (req, res) => {
  if ('dashboard' in req.config) {
    return res.redirect(req.config.dashboard.host)
  }

  if (req.user === null) {
    const design = decortation.pickLoggedOutDesign()
    req.templateValues.design = design
    return res.render('main/pleaselogin', req.templateValues)
  }

  //  Send staff and admin user to the stats page
  if (req.user.roles.isStaff === true || req.user.roles.isAdmin) {
    return res.redirect('/config')
  }
  //  TODO: redirect to dashboard if we know the URL
  if ('dashboard' in req.config) {
    return res.redirect(req.config.dashboard.host)
  }
  return res.render('main/pleaselogin', req.templateValues)
}

exports.wait = (req, res) => {
  const design = decortation.pickLoggedOutDesign()
  req.templateValues.design = design
  return res.render('config/wait', req.templateValues)
}
