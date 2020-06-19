'use strict'

const dialog = require('./dialog')
const cache = require('./cache')

module.exports = (io) => {
  dialog.emit('io', io)
  io.on('connection', (socket) => {
    socket.emit('domains', cache.domains())
  })
}
