const Docker = require('dockerode')

const docker = new Docker({ socketPath: '/var/run/docker.sock' })
const get = require('lodash/get')
const cache = require('./cache')
const dialog = require('./dialog')

const HOSTS = 'traefik.frontend.rule'
const IP = 'NetworkSettings.Networks.traefik.IPAddress'
const PORT = 'traefik.port'

const getDomains = (domains) => {
  if (!domains) {
    return []
  }

  return domains.replace(/^Host:/, '').split(',')
}

const getData = (container) => {
  let domains = getDomains(get(container, ['Labels', HOSTS]))
  const ip = get(container, IP)
  const port = get(container, ['Labels', PORT], 80)
  return { domains, ip, port }
}

const add = (container) => {
  const { domains, ip, port } = getData(container)

  domains.map((domain) => {
    cache.set(domain, ip, port)
  })

  dialog.emit('domains')
}

const updateStatus = () => {
  docker.listContainers((err, containers) => {
    if (err) {
      return console.error(err)
    }
    containers.map(add)
  })
}

docker.getEvents(
  { filters: { type: ['container'], event: ['start', 'stop'] } },
  (err, data) => {
    if (err) {
      return console.error(err)
    }
    data.on('data', updateStatus)
  }
)

updateStatus()
