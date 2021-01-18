'use strict'

const app = require('express')()
const serveStatic = require('serve-static')
const http = require('http').createServer(app)
const rootCA = require('/data/rootCA.json')

const io = require('socket.io')(http, {
  path: '/girouettedockerdata',
  cors: {
    origin: true,
    credentials: true
  }
})

require('./socket')(io)

app.get('/certificate', (req, res) => {
  res.setHeader('Content-type', 'application/octet-stream')
  res.setHeader(
    'Content-disposition',
    'attachment; filename=GirouetteRootCA.crt'
  )
  res.send(Buffer.from(rootCA.crt))
})

if (process.env.NODE_ENV !== 'development') {
  app.use('/', serveStatic('/front/build/', { index: ['index.html'] }))
} else {
  app.get('/', (req, res, next) => {
    res.redirect('https://girouettedev.devel')
  })
}

app.use((req, res, next) => {
  res.status(404).send('404')
})

http.listen(8080, () => {
  console.log('> App started on http://localhost:8080')
})
