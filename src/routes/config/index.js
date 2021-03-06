const Config = require('../../classes/config')

exports.index = (req, res) => {
  if (req.user.roles.isAdmin !== true) {
    return res.redirect('/')
  }

  if ('action' in req.body) {
    const config = new Config()

    //  ADD/UPDATE DASHBOARD
    if (req.body.action === 'updatedashboard' && 'dashboard' in req.body && req.body.dashboard !== '' && 'handshake' in req.body && req.body.handshake !== '') {
      let host = req.body.dashboard
      if (host[host.length - 1] !== '/') host = `${host}/`
      config.set('dashboard', {
        host,
        handshake: req.body.handshake
      })
      // const pingtools = require('../../modules/pingtools')
      // pingtools.pingDashboard()
      return res.redirect('/config')
    }

    //  ADD/UPDATE ELASTIC SEARCH
    if (req.body.action === 'updateelasticsearch' && 'elasticsearch' in req.body && req.body.elasticsearch !== '') {
      config.set('elasticsearch', {
        host: req.body.elasticsearch
      })
      config.set('baseTMS', req.body.baseTMS)
      const pingtools = require('../../modules/pingtools')
      pingtools.pingES()

      return res.redirect('/config')
    }
  }

  //  Get the domain we are going to be connected to
  req.templateValues.host = req.headers.host

  return res.render('config/index', req.templateValues)
}
