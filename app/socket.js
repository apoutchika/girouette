'use strict'

const dialog = require('./libs/dialog')
const cache = require('./libs/cache')

module.exports = (io) => {
  dialog.emit('io', io)
  io.on('connection', (socket) => {
    socket.emit('domains', cache.domains())
  })
}
