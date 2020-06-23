'use strict'

const dialog = require('./libs/dialog')
const cache = require('./libs/cache')

module.exports = (io) => {
  dialog.emit('io', io)
  io.on('connection', (socket) => {
    socket.emit('domains', cache.all())
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
