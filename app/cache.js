'use strict'

const cache = {
  'proxy.devel': '127.0.0.1:80',
}

module.exports.set = (domain, ip, port) => {
  console.log(`Add ${domain} to ${ip}:${port}`)
  cache[domain] = `${ip}:${port}`
}

module.exports.get = (domain) => {
  return cache[domain]
}

module.exports.del = (domain) => {
  console.log(`Del ${domain}`)
  delete cache[domain]
}

module.exports.domains = () => Object.keys(cache)
