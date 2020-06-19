'use strict'

const EventEmitter = require('events')

const cache = require('./cache')

const dialog = new EventEmitter()
let io

dialog.on('io', (newIo) => {
  console.log('Set IO')
  io = newIo
})

dialog.on('domains', () => {
  if (io) {
    io.emit('domains', cache.domains())
  }
})

module.exports = dialog
