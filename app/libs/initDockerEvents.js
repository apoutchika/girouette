const Docker = require('dockerode')

const docker = new Docker({ socketPath: '/var/run/docker.sock' })
const get = require('lodash/get')
const cache = require('./cache')
const dialog = require('./dialog')
const labelToHosts = require('./labelToHosts')

const actives = {}

const add = (container) => {
  let ip = get(container, 'NetworkSettings.Networks.proxy.IPAddress')
  if (!ip) {
    ip = get(container, 'NetworkSettings.Networks.traefik.IPAddress')
  }

  labelToHosts(get(container, 'Labels')).map(({ domain, port, project }) => {
    cache.set(domain, port, ip, project)
    actives[container.Id] = {
      toDel: false,
      domain
    }
  })
}

const updateStatus = (data) => {
  Object.keys(actives).map((id) => {
    actives[id].toDel = true
  })

  docker.listContainers((err, containers) => {
    if (err) {
      return console.error(err)
    }

    containers.map((container) => {
      const id = container.Id
      if (actives[id]) {
        actives[id].toDel = false
        return
      }
      add(container)
    })

    Object.keys(actives)
      .filter((id) => actives[id].toDel)
      .map((id) => {
        cache.del(actives[id].domain)
        delete actives[id]
      })

    dialog.emit('domains')
  })
}

docker.getEvents(
  { filters: { type: ['container'], event: ['start', 'stop'] } },
  (err, data) => {
    if (err) {
      return console.error(err)
    }
    data.on('data', (data) => {
      updateStatus()
    })
  }
)

updateStatus()

dialog.on('prune', (cb) => {
  docker.pruneContainers(null, (err, dataContainer) => {
    if (err) {
      return cb(err)
    }
    docker.pruneImages(
      { filters: { dangling: { false: true } } },
      (err, dataImages) => {
        if (err) {
          return cb(err)
        }

        cb(null, dataContainer, dataImages)
      }
    )
  })
})
