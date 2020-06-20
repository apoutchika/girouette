'use strict'

const proxy = require('express-http-proxy')

let cache = {}

module.exports.clear = () => {
  cache = {}
}

module.exports.set = (domain, ip, port) => {
  console.log(`Add ${domain} to ${ip}:${port}`)
  cache[domain] = proxy(`${ip}:${port}`)
}

module.exports.get = (domain) => {
  return cache[domain]
}

module.exports.del = (domain) => {
  console.log(`Del ${domain}`)
  delete cache[domain]
}

module.exports.domains = () => Object.keys(cache)
