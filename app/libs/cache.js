'use strict'

const httpProxy = require('http-proxy')

let cache = {}

module.exports.clear = () => {
  cache = {}
}

module.exports.set = (domain, port, ip, project) => {
  const proxy = new httpProxy.createProxyServer({
    ws: true,
    target: `http://${ip}:${port}`
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
