'use strict'

const cache = new Map()
const MAX = 500

module.exports = {
  has: (key) => cache.has(key),
  get: (key) => cache.get(key),
  set: (key, value) => {
    cache.delete(key) // delete for push on end of Map keys
    const res = cache.set(key, value)
    if (cache.size > MAX) {
      cache.delete(cache.keys().next().value) // delete first (old used)
    }

    return res
  }
}
