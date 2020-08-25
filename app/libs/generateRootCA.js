'use strict'

const forge = require('node-forge')
const getSerialNumber = require('./generateSerialNumber')

module.exports = () => {
  const { privateKey, publicKey } = forge.pki.rsa.generateKeyPair(2048)

  const cert = forge.pki.createCertificate()

  cert.publicKey = publicKey
  cert.serialNumber = getSerialNumber()
  cert.validity.notBefore = new Date()
  cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1)

  const attrs = [
    { name: 'organizationName', value: 'Girouette' },
    { name: 'commonName', value: 'Girouette Authority' }
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
          value: 'girouette.devel'
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
