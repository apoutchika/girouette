'use strict'

const dialog = require('./libs/dialog')
const proxyCache = require('./libs/proxyCache')
const dnsCache = require('./libs/dnsCache')
const mem = require('mem')
const { getAnswer } = require('./dns')

module.exports = (io) => {
  dialog.emit('io', io)
  io.on('connection', (socket) => {
    socket.emit('domains', proxyCache.all())

    socket.on('dns', () => {
      mem.clear(getAnswer)
      dnsCache.clear()
      socket.emit('dns', true)
    })

    socket.on('stop', (domain) => {
      dialog.emit('stop', domain)
      console.log('stop', domain)
    })

    socket.on('prune', () => {
      dialog.emit('prune', (err, containers, images) => {
        if (err) {
          console.error(err)
        }
        socket.emit('prune', {
          containers: {
            nb: !containers.ContainersDeleted
              ? 0
              : containers.ContainersDeleted.length,
            go: containers.SpaceReclaimed
          },
          images: {
            nb: !images.ImagesDeleted ? 0 : images.ImagesDeleted.length,
            go: images.SpaceReclaimed
          }
        })
      })
    })
  })
}
