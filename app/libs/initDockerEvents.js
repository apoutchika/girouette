const Docker = require('dockerode');

const Promise = require('bluebird');

const docker = Promise.promisifyAll(
  new Docker({ socketPath: '/var/run/docker.sock' }),
);
const get = require('lodash/get');
const cache = require('./proxyCache');
const dialog = require('./dialog');
const labelToHosts = require('./labelToHosts');

const actives = new Map();

const getContainer = (id) => new Promise((resolve, reject) => {
  docker.getContainer(id).inspect((err, container) => {
    if (err) {
      return reject(err);
    }

    return resolve(container);
  });
});

const add = async (id) => {
  const container = await getContainer(id).catch(console.error);
  if (!container) {
    return false;
  }

  const hosts = labelToHosts(get(container, 'Config.Labels'));
  if (hosts.length === 0) {
    return false;
  }

  const ip = get(container, 'NetworkSettings.Networks.girouette.IPAddress');

  // Add girouette network if not exists
  if (!ip) {
    return docker
      .getNetwork('girouette')
      .connect({ Container: id }, (err, ok) => {
        if (err) {
          return console.error(err);
        }

        add(id).catch(console.error);
      });
  }

  const domains = [];
  hosts.forEach(({ domain, port, project }) => {
    cache.set(domain, port, ip, project);
    domains.push(domain);
  });

  actives.set(container.Id, domains);
  return dialog.emit('domains');
};

docker.listContainers((err, containers) => {
  if (err) {
    return console.error(err);
  }

  return containers.forEach((container) => {
    add(container.Id).catch(console.error);
  });
});

const createEvent = (types, cb) => {
  docker.getEvents(
    { filters: { type: ['container'], event: types } },
    (err, data) => {
      if (err) {
        return console.error(err);
      }
      return data.on('data', (bufferData) => {
        try {
          const container = JSON.parse(bufferData.toString());
          cb(container.id);
        } catch (containerErr) {
          console.error(containerErr);
        }
      });
    },
  );
};

createEvent(['start'], (id) => add(id));
createEvent(['stop', 'kill'], (id) => {
  if (actives.has(id)) {
    actives.get(id).map((domain) => cache.del(domain));
    actives.delete(id);
    return dialog.emit('domains');
  }
  return false;
});

dialog.on('stop', (project) => {
  docker.listContainers((err, containers) => {
    if (err) {
      console.error(err);
    }

    return containers.forEach((container) => {
      if (
        get(container, ['Labels', 'com.docker.compose.project']) === project
      ) {
        docker.getContainer(container.Id).stop();
      }
    });
  });
});
