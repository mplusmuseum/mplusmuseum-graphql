const fs = require('fs')
const path = require('path')
const delay = require('delay')

exports.translation = (req, res) => {
  //  Make sure we are an admin user
  if (!req.user || !req.user.user_metadata || !req.user.user_metadata.roles || !('isAdmin' in req.user.user_metadata.roles) || req.user.user_metadata.roles.isAdmin === false) return res.redirect('/')

  const rootDir = path.join(__dirname, '..', '..', '..', 'lang', 'dashboard')

  if (req.body && req.body.action && req.body.action === 'updateTranslations') {
    //  Build up new string JSON files
    const newTransations = {}

    Object.entries(req.body).forEach((field) => {
      const key = field[0]
      const value = field[1]
      if (key !== 'action') {
        const keySplit = key.split('.')
        const topLevel = keySplit[0]
        const subLevel = keySplit[1]
        const lang = keySplit[2]

        //  Make sure all the parts are in the final newTranslations
        if (!newTransations[lang]) newTransations[lang] = {}
        if (!newTransations[lang][topLevel]) newTransations[lang][topLevel] = {}
        if (!newTransations[lang][topLevel][subLevel]) newTransations[lang][topLevel][subLevel] = value
      }
    })

    const translationsEN = newTransations.en
    const translationsTC = newTransations.tc

    fs.writeFileSync(path.join(rootDir, 'strings.en.json'), JSON.stringify(translationsEN, null, 4), 'utf-8')
    fs.writeFileSync(path.join(rootDir, 'strings.tc.json'), JSON.stringify(translationsTC, null, 4), 'utf-8')

    delay(1000)

    return res.redirect('/admin/translation')
  }

  //  Read in the english translation
  if (!fs.existsSync(path.join(rootDir, 'strings.en.json'))) return res.redirect('/')
  if (!fs.existsSync(path.join(rootDir, 'strings.tc.json'))) return res.redirect('/')

  const translationsEN = JSON.parse(fs.readFileSync(path.join(rootDir, 'strings.en.json'), 'utf-8'))
  const translationsTC = JSON.parse(fs.readFileSync(path.join(rootDir, 'strings.tc.json'), 'utf-8'))

  const masterTranslations = {}
  Object.entries(translationsEN).forEach((topLevel) => {
    const key = topLevel[0]
    const values = topLevel[1]
    if (!masterTranslations[key]) masterTranslations[key] = {}
    Object.entries(values).forEach((subLevel) => {
      const secondKey = subLevel[0]
      if (!masterTranslations[key][secondKey]) masterTranslations[key][secondKey] = {}
      if (translationsEN[key][secondKey]) masterTranslations[key][secondKey].en = translationsEN[key][secondKey]
      if (translationsTC[key][secondKey]) masterTranslations[key][secondKey].tc = translationsTC[key][secondKey]
    })
  })

  req.templateValues.masterTranslations = masterTranslations
  return res.render('admin/translation', req.templateValues)
}
