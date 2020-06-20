'use strict'

const http = require('http')
const https = require('https')
const app = require('express')()
const cache = require('./libs/cache')
const SNICallback = require('./libs/SNICallback')

app.use((req, res, next) => {
  const hostnameProxy = cache.get(req.hostname)
  if (!hostnameProxy) {
    return res.sendStatus(404)
  }

  return hostnameProxy(req, res, next)
})

const httpServer = http.createServer(app)
const httpsServer = https.createServer({ SNICallback }, app)

httpServer.listen(80)
httpsServer.listen(443)
