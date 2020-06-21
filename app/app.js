'use strict'

const app = require('express')()
const http = require('http').createServer(app)
const rootCA = require('/data/rootCA.json')

const io = require('socket.io')(http, {
  path: '/proxydockerdata'
})

require('./socket')(io)

app.get('/certificate', (req, res) => {
  res.setHeader('Content-type', 'application/octet-stream')
  res.setHeader('Content-disposition', 'attachment; filename=rootCA.crt')
  res.send(Buffer.from(rootCA.crt))
})

app.use((req, res, next) => {
  res.redirect('https://proxydev.devel')
})

http.listen(8080, () => {
  console.log('> App started on http://localhost:8080')
})
