const Docker = require('dockerode')

const Promise = require('bluebird')
const docker = Promise.promisifyAll(
  new Docker({ socketPath: '/var/run/docker.sock' })
)
const get = require('lodash/get')
const cache = require('./proxyCache')
const dialog = require('./dialog')
const labelToHosts = require('./labelToHosts')

const actives = {}
const networks = new Map()

const add = async (container) => {
  // console.log(JSON.stringify(container, null, 2))
  // Not in external network
  if (Object.keys(get(container, 'NetworkSettings.Networks', [])) === 0) {
    return
  }

  const network = Object.keys(container.NetworkSettings.Networks)[0]
  const id = get(container, `NetworkSettings.Networks.${network}.NetworkID`)
  const ip = get(container, `NetworkSettings.Networks.${network}.IPAddress`)
  if (!networks.has(network)) {
    networks.set(network, id) // Add network to girouette
    await new Promise((resolve, reject) => {
      docker.getNetwork(id).connect({ Container: 'girouette' }, (err, ok) => {
        if (err) {
          reject(err)
        }

        resolve(ok)
      })
    })
  }

  labelToHosts(get(container, 'Labels')).map(({ domain, port, project }) => {
    cache.set(domain, port, ip, project)
    actives[container.Id] = actives[container.Id] || {
      toDel: false,
      domains: []
    }
    actives[container.Id].domains.push(domain)
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
        actives[id].domains.map((domain) => cache.del(domain))
        delete actives[id]
      })

    dialog.emit('domains')
  })
}

// Find Girouette container and add used networks, and run updateStatus
docker.listContainers((err, containers) => {
  if (err) {
    return console.error(err)
  }

  containers.map((container) => {
    if (container.Names[0] === '/girouette') {
      return Object.keys(get(container, 'NetworkSettings.Networks', [])).map(
        (network) => {
          const id = get(
            container,
            `NetworkSettings.Networks.${network}.NetworkID`
          )
          networks.set(network, id)
        }
      )
    }
  })

  updateStatus()
})

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

dialog.on('stop', (project) => {
  docker.listContainers((err, containers) => {
    if (err) {
      console.error(err)
    }
    containers.map((container) => {
      if (
        get(container, ['Labels', 'com.docker.compose.project']) === project
      ) {
        docker.getContainer(container.Id).stop()
      }
    })
  })
})

dialog.on('prune', async (cb) => {
  Promise.props({
    containers: docker.pruneContainersAsync(null),
    images: docker.pruneImagesAsync({ filters: { dangling: { false: true } } })
  })
    .then(({ containers, images }) => {
      cb(null, containers, images)
    })
    .catch(cb)
})
