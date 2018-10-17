exports.index = (req, res) => {
  return res.render('status/index', req.templateValues)
}

exports.elasticsearch = (req, res) => {
  req.templateValues.elasticsearchping = global.elasticsearchping
  return res.render('status/elasticsearch', req.templateValues)
}
