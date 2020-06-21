'use strict'

const app = require('express')()
const RSS = require('rss')
const http = require('http').createServer(app)
const rootCA = require('/data/rootCA.json')
const cache = require('./libs/cache')

const io = require('socket.io')(http, {
  path: '/proxydockerdata'
})

require('./socket')(io)

app.get('/certificate', (req, res) => {
  res.setHeader('Content-type', 'application/octet-stream')
  res.setHeader('Content-disposition', 'attachment; filename=rootCA.crt')
  res.send(Buffer.from(rootCA.crt))
})

app.get('/rss.xml', (req, res) => {
  const feed = new RSS({
    title: 'Proxy',
    feed_url: 'https://proxy.devel/rss.xml',
    site_url: 'https://proxy.devel'
  })

  const domains = cache.all()
  Object.keys(domains).map((domain) => {
    feed.item({
      title: domain,
      url: 'https://' + domain
    })
  })

  res.send(feed.xml())
})

app.use((req, res, next) => {
  res.redirect('https://proxydev.devel')
})

http.listen(8080, () => {
  console.log('> App started on http://localhost:8080')
})
