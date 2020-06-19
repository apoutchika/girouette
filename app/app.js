'use strict'

const app = require('express')()
var http = require('http').createServer(app)
var io = require('socket.io')(http)
const cache = require('./cache')

require('./socket')(io)

app.use((req, res, next) => {
  res.send('coucou')
})

http.listen(8080, () => {
  console.log('> App started on http://localhost:8080')
})
