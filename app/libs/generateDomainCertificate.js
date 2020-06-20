'use strict'

const forge = require('node-forge')
const getSerialNumber = require('./generateSerialNumber')
const rootCA = require('/data/rootCA.json')

const publicKey = forge.pki.publicKeyFromPem(rootCA.publicKey)
const privateKey = forge.pki.privateKeyFromPem(rootCA.privateKey)

module.exports = (domain) => {
  const site = forge.pki.createCertificate()

  site.publicKey = publicKey
  site.serialNumber = getSerialNumber()
  site.validity.notBefore = new Date()
  site.validity.notAfter.setFullYear(site.validity.notBefore.getFullYear() + 5)

  site.setExtensions([
    { name: 'subjectAltName', altNames: [{ type: 2, value: domain }] }
  ])
  site.setSubject([{ name: 'commonName', value: domain }])
  site.setIssuer([
    { name: 'organizationName', value: '00 Super Proxy Root' },
    { name: 'commonName', value: 'superproxy.com' }
  ])

  site.sign(privateKey, forge.md.sha256.create())

  return forge.pki.certificateToPem(site)
}
