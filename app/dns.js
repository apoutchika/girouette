'use strict'

const Promise = require('bluebird')
const DNS = require('native-dns')
const dns = require('dns')
const mem = require('mem')
const resolveDNS = Promise.promisify(dns.resolve)
const cache = require('./libs/dnsCache')
const isDomain = require('is-valid-domain')
const get = require('lodash/get')
const fs = require('fs')

const server = DNS.createServer()

const localTlds = get(process, 'env.TLDS', '.devel')
  .split(',')
  .filter(Boolean)
  .map((tld) => new RegExp(tld + '$'))

// save tld config for front
const defaultTld = get(process, 'env.TLDS', '.devel')
  .split(',')
  .filter(Boolean)[0]
if (defaultTld) {
  fs.writeFileSync(
    '/front/src/config.json',
    JSON.stringify({ tld: defaultTld.replace(/^\./, '') })
  )
}

const types = DNS.consts.QTYPE_TO_NAME
const typeToAnswer = {
  SOA: ({ nsname, hostmaster, expire, minttl, type, ...data }) => ({
    primary: nsname,
    admin: hostmaster,
    expiration: expire,
    minimum: minttl,
    ...data
  }),
  A: (data) => ({ address: data }),
  AAAA: (data) => ({ address: data }),
  MX: ({ priority, exchange }) => ({ priority, exchange }),
  TXT: (data) => ({ data }),
  SRV: ({ name, port, priority, weight }) => ({
    priority,
    weight,
    port,
    target: name
  }),
  NS: (data) => ({ data }),
  CNAME: (data) => ({ data })
}

const GetAnswer = (question) => {
  const key = `${question.type}_${question.name}`
  let resolved = false

  return new Promise((resolve, reject) => {
    // Send last value
    if (cache.has(key)) {
      resolve(cache.get(key))
      resolved = true
    }

    if (!isDomain(question.name)) {
      cache.set(key, [])
      return resolve([])
    }

    if (localTlds.find((tld) => question.name.match(tld))) {
      cache.set(key, [
        {
          ...question,
          address: '127.0.0.1',
          ttl: 86400 // 24h
        }
      ])
      return resolve(cache.get(key))
    }

    const type = types[question.type]
    resolveDNS(question.name, type)
      .then((answers) => {
        if (!typeToAnswer[type]) {
          return []
        }

        if (type === 'SOA') {
          const res = {
            ttl: 600,
            ...question,
            ...typeToAnswer.SOA(answers)
          }
          return [res]
        }

        return answers.map((answer) => {
          return {
            ttl: 600,
            ...question,
            ...typeToAnswer[type](answer)
          }
        })
      })
      .then((value) => {
        if (!resolved) {
          resolve(value)
        }
        return cache.set(key, value)
      })
      .catch(() => {
        if (!resolved) {
          resolve([])
        }
        return cache.set(key, [])
      })
  })
}

const getAnswer = mem(GetAnswer, {
  cacheKey: ([{ type, name }]) => {
    return `${type}_${name}`
  },
  maxAge: 300 * 1000 // 5min
})

server.on('request', (request, response) => {
  Promise.map(request.question, (question) => {
    return getAnswer(question).then((answers) => {
      answers.map((answer) => response.answer.push(answer))
    })
  })
    .catch((err) => console.error(err))
    .finally(() => {
      response.send()
    })
})

server.on('error', function (err) {
  console.error(err)
})

server.serve(5353)

module.exports.getAnswer = getAnswer
