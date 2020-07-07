'use strict'

const http = require('http')
const https = require('https')
const cache = require('./libs/proxyCache')
const SNICallback = require('./libs/SNICallback')

const app = (req, res) => {
  const hostname = cache.get(req.headers.host)
  if (!hostname) {
    res.statusCode = 404
    res.statusMessage = 'Not found'
    return res.end('404')
  }
  hostname.proxy.web(req, res)
}

const upgrade = function (req, socket, head) {
  const hostname = cache.get(req.headers.host)
  hostname.proxy.ws(req, socket, head)
}

const httpServer = http.createServer(app)
const httpsServer = https.createServer({ SNICallback }, app)

httpServer.on('upgrade', upgrade)
httpsServer.on('upgrade', upgrade)

httpServer.listen(80)
httpsServer.listen(443)
