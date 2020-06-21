'use strict'

const EventEmitter = require('events')

const cache = require('./cache')

const dialog = new EventEmitter()
let io

dialog.on('io', (newIo) => {
  io = newIo
})

dialog.on('domains', () => {
  if (io) {
    io.emit('domains', cache.all())
  }
})

module.exports = dialog
