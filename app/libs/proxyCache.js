'use strict'

const httpProxy = require('http-proxy')
const get = require('lodash/get')

let cache = {}

module.exports.clear = () => {
  cache = {}
}

module.exports.set = (domain, port, ip, project) => {
  const proxy = new httpProxy.createProxyServer({
    ws: true,
    target: `http://${ip}:${port}`,
    xfwd: true
  })

  proxy.on('error', function (err, req, res) {
    res.writeHead(500, {
      'Content-Type': 'text/plain'
    })

    res.end('Something went wrong.\n\n' + JSON.stringify(err, null, 2))
  })

  cache[domain] = {
    project,
    target: `http://${ip}:${port}`,
    proxy
  }
}

module.exports.get = (domain) => {
  return cache[domain]
}

module.exports.del = (domain) => {
  get(cache, [domain, 'proxy', 'close'], () => true)()
  delete cache[domain]
}

module.exports.domains = () => Object.keys(cache)
module.exports.all = () =>
  Object.keys(cache).reduce((acc, key) => {
    acc[key] = {
      project: cache[key].project,
      target: cache[key].target
    }
    return acc
  }, {})
