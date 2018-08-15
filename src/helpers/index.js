const moment = require('moment')

exports.ifIndexDivisibleBy = (index, divisor, options) => {
  if ((index + 1) % divisor === 0 && index > 0) {
    return options.fn(this)
  }
  return options.inverse(this)
}

exports.ifIndexNotDivisibleBy = (index, divisor, options) => {
  if ((index + 1) % divisor !== 0 && index > 0) {
    return options.fn(this)
  }
  return options.inverse(this)
}

exports.indexOf = (context, ndx, options) => options.fn(context[ndx])

exports.ifEven = (n, options) => {
  if (n % 2 === 0 || n === 0) {
    return options.fn(this)
  }
  return options.inverse(this)
}

exports.ifOdd = (n, options) => {
  if (n % 2 !== 0 && n > 0) {
    return options.fn(this)
  }
  return options.inverse(this)
}

exports.ifEqual = (v1, v2, options) => {
  if (v1 === v2) {
    return options.fn(this)
  }
  return options.inverse(this)
}

exports.ifNotEqual = (v1, v2, options) => {
  if (v1 !== v2) {
    return options.fn(this)
  }
  return options.inverse(this)
}

exports.ifgt = (v1, v2, options) => {
  if (v1 > v2) {
    return options.fn(this)
  }
  return options.inverse(this)
}

exports.ifgte = (v1, v2, options) => {
  if (v1 >= v2) {
    return options.fn(this)
  }
  return options.inverse(this)
}

exports.iflt = (v1, v2, options) => {
  if (v1 < v2) {
    return options.fn(this)
  }
  return options.inverse(this)
}

exports.iflte = (v1, v2, options) => {
  if (v1 <= v2) {
    return options.fn(this)
  }
  return options.inverse(this)
}

exports.ifEqualNumbers = (v1, v2, options) => {
  if (parseInt(v1, 10) === parseInt(v2, 10)) {
    return options.fn(this)
  }
  return options.inverse(this)
}

exports.ifIsNotNull = (v1, options) => {
  if (v1 !== null) {
    return options.fn(this)
  }
  return options.inverse(this)
}

exports.and = (v1, v2) => {
  return v1 && v2
}

exports.or = (v1, v2) => {
  return v1 || v2
}

exports.prettyNumber = x => {
  if (x === null || x === undefined) return ''
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

exports.dumpThis = object => {
  console.log(object)
  return ''
}

exports.dumpJSON = object => {
  let pre = "<pre class='admin_view'>"
  pre += JSON.stringify(object, null, 4)
  pre += '</pre>'
  return pre
}

exports.elasticsearchStatus = () => {
  if (!('elasticsearchping' in global)) {
    return '<span class="warn">Not connected</span>'
  }
  //  Find out when the last successful connection was
  const valid = global.elasticsearchping.filter((ping) => {
    return ping.valid
  })
  if (valid.length === 0) {
    return '<span class="alert">Disconnected</span>'
  }

  const mostRecentValid = valid[0]
  const diff = new Date().getTime() - mostRecentValid.timestamp
  //  If the last valid connection was more than 5 minutes ago
  //  then say we are disconnected
  if (diff > 5 * 60 * 1000) {
    return '<span class="alert">Disconnected</span>'
  }
  const pings = valid.map((ping) => {
    return ping.ms
  })
  const averagePing = Math.floor(pings.reduce((p, c) => p + c, 0) / pings.length)
  return `<span class="good">Ave ping: ${averagePing}ms</span>`
}

exports.timeAgo = backThen => {
  if (backThen === null || backThen === undefined) return ''
  return moment(backThen).fromNow()
}