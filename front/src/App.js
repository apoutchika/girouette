import React, { useState, useEffect } from 'react'
import socketIOClient from 'socket.io-client'
import Switch from 'react-switch'
import './App.css'
import get from 'lodash/get'
import bytes from 'bytes'

const ENDPOINT = 'https://proxy.devel'

function App() {
  const [socket, setSocket] = useState()
  const [domains, setDomains] = useState([])
  const [scheme, setScheme] = useState('https')
  const [clean, setClean] = useState(false)
  const [cleaned, setCleaned] = useState({})

  useEffect(() => {
    const socket = socketIOClient(ENDPOINT, {
      path: '/proxydockerdata',
    })

    setSocket(socket)

    socket.on('disconnect', () => {
      setDomains({})
    })
    socket.on('domains', (domains) => {
      //domains = domains.map(reverse).sort().map(reverse)
      const res = Object.keys(domains).reduce((acc, domain) => {
        const { project } = domains[domain]
        acc[project] = acc[project] || []
        acc[project].push(domain)
        return acc
      }, {})

      setDomains(res)
    })
    socket.on('prune', (data) => {
      console.log(data)
      setClean(false)
      setCleaned(data)
    })
  }, [])

  return (
    <div className="App">
      <h1>Proxy</h1>

      <div>
        HTTPS
        <Switch
          onChange={() => setScheme(scheme === 'http' ? 'https' : 'http')}
          checked={scheme === 'https'}
        />{' '}
      </div>

      <br />
      <br />
      <div>
        {!clean && (
          <button
            onClick={(e) => {
              socket.emit('prune')
              setClean(true)
            }}
            type="button"
          >
            Clean docker
          </button>
        )}
        {clean && <p>...</p>}
        {cleaned && cleaned.containers && (
          <ul>
            <li>
              Deleted containers: {get(cleaned, 'containers.nb', '?')} (
              {bytes(get(cleaned, 'containers.go', 0))})
            </li>
            <li>
              Deleted images: {get(cleaned, 'images.nb', '?')} (
              {bytes(get(cleaned, 'images.go'))})
            </li>
          </ul>
        )}
      </div>

      <ul className="cards">
        {Object.keys(domains)
          .sort()
          .map((group) => {
            return (
              <li className="card" key={`${group}`}>
                <h2>{group}</h2>
                <ul>
                  {domains[group].sort().map((domain) => {
                    return (
                      <li key={`${group}_${domain}`}>
                        <a
                          href={`${scheme}://${domain}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {scheme}://{domain}
                        </a>
                      </li>
                    )
                  })}
                </ul>
              </li>
            )
          })}
      </ul>

      <a href={ENDPOINT + '/certificate'} download>
        Download certificate
      </a>
    </div>
  )
}

export default App
