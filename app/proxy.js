'use strict'

const app = require('express')()
const cache = require('./cache')
const proxy = require('express-http-proxy')

app.use((req, res, next) => {
  const to = cache.get(req.hostname)
  if (!to) {
    return res.sendStatus(404)
  }

  return proxy(to)(req, res, next)
})

app.listen(80, () => {
  console.log('> Proxy started on http://localhost:80')
})
