'use strict'

const tls = require('tls')
const generateDomainCertificate = require('./generateDomainCertificate')
const rootCA = require('/data/rootCA.json')

const domains = {}

module.exports = (domain, cb) => {
  if (!domains[domain]) {
    domains[domain] = generateDomainCertificate(domain)
  }

  cb(
    null,
    tls.createSecureContext({
      key: rootCA.privateKey,
      cert: domains[domain]
    })
  )
}
