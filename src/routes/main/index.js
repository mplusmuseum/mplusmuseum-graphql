const decortation = require('../../modules/decoration')

exports.index = (req, res) => {
  req.templateValues.design = decortation.pickLoggedOutDesign()

  if (req.user === null) {
    return res.render('main/pleaselogin', req.templateValues)
  }

  //  Send staff and admin user to the stats page
  if (req.user.roles.isStaff === true || req.user.roles.isAdmin) {
    return res.redirect('/config')
  }

  if (req.config.dashboard && req.config.dashboard.host) {
    req.templateValues.developerURL = req.config.dashboard.host
  }
  return res.render('main/developer', req.templateValues)
}

exports.wait = (req, res) => {
  const design = decortation.pickLoggedOutDesign()
  req.templateValues.design = design
  return res.render('config/wait', req.templateValues)
}
