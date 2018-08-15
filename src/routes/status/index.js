exports.index = (req, res) => {
  if (req.user.roles.isAdmin !== true) {
    return res.redirect('/')
  }
  return res.render('status/index', req.templateValues)
}

exports.elasticsearch = (req, res) => {
  if (req.user.roles.isAdmin !== true) {
    return res.redirect('/')
  }
  req.templateValues.elasticsearchping = global.elasticsearchping
  return res.render('status/elasticsearch', req.templateValues)
}
