exports.index = (req, res) => {
  return res.redirect('/en/documentation/about')
}

exports.wait = (req, res) => {
  return res.render('config/wait', req.templateValues)
}
