'use strict'

const fs = require('fs-extra')
const forge = require('node-forge')
const getSerialNumber = require('./generateSerialNumber')

module.exports = () => {
  const { privateKey, publicKey } = forge.pki.rsa.generateKeyPair(2048)

  const rootCAKey = forge.pki.privateKeyToPem(privateKey)
  const rootCAPub = forge.pki.publicKeyToPem(publicKey)
  fs.writeFileSync('./rootCA.key', rootCAKey)
  fs.writeFileSync('./rootCA.pub', rootCAPub)

  const cert = forge.pki.createCertificate()

  cert.publicKey = publicKey
  cert.serialNumber = getSerialNumber()
  cert.validity.notBefore = new Date()
  cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 10)

  const attrs = [
    { name: 'organizationName', value: '00 Super Proxy Root' },
    { name: 'commonName', value: 'superproxy.com' }
  ]

  cert.setSubject(attrs)
  cert.setIssuer(attrs)
  cert.setExtensions([
    {
      name: 'basicConstraints',
      cA: true
    },
    {
      name: 'keyUsage',
      keyCertSign: true,
      digitalSignature: true,
      nonRepudiation: true,
      keyEncipherment: true,
      dataEncipherment: true
    },
    {
      name: 'subjectAltName',
      altNames: [
        {
          type: 2,
          value: 'superproxy.com'
        }
      ]
    }
  ])

  cert.sign(privateKey, forge.md.sha256.create())

  var crt = forge.pki.certificateToPem(cert)

  return {
    publicKey: forge.pki.publicKeyToPem(publicKey),
    privateKey: forge.pki.privateKeyToPem(privateKey),
    crt
  }
}
