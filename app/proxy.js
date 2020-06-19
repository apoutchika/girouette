'use strict'

const http = require('http')
const https = require('https')
const tls = require('tls')
const app = require('express')()
const cache = require('./cache')
const fs = require('fs')
const selfsigned = require('selfsigned')

app.use((req, res, next) => {
  const hostnameProxy = cache.get(req.hostname)
  if (!hostnameProxy) {
    return res.sendStatus(404)
  }

  return hostnameProxy(req, res, next)
})

const domains = {}
const httpsOptions = {
  SNICallback: function (domain, cb) {
    if (domains[domain]) {
      cb(null, domains[domain])
      return domains[domain]
    }

    const attrs = [{ name: 'commonName', value: domain }]
    const pems = selfsigned.generate(attrs, { days: 365 })

    domains[domain] = tls.createSecureContext({
      key: pems.private,
      cert: pems.cert,
    })

    cb(null, domains[domain])
    return domains[domain]
  },
}

const httpServer = http.createServer(app)
const httpsServer = https.createServer(httpsOptions, app)

httpServer.listen(80)
httpsServer.listen(443)
