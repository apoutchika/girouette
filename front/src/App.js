import React, { useState, useEffect } from 'react'
import socketIOClient from 'socket.io-client'
import Switch from 'react-switch'
import './App.css'

const ENDPOINT = 'https://proxy.devel'

function App() {
  const [domains, setDomains] = useState([])
  const [scheme, setScheme] = useState('https')

  useEffect(() => {
    const socket = socketIOClient(ENDPOINT)
    socket.on('disconnect', () => {
      setDomains({})
    })
    socket.on('domains', (domains) => {
      //domains = domains.map(reverse).sort().map(reverse)
      const res = domains.reduce((acc, domain) => {
        const [tld, name] = domain.split('.').reverse()
        acc[`${name}.${tld}`] = acc[`${name}.${tld}`] || []
        acc[`${name}.${tld}`].push(domain)
        return acc
      }, {})

      setDomains(res)
    })
  }, [])

  return (
    <div className="App">
      <h1>Proxy</h1>

      <div>
        HTTPS 23
        <Switch
          onChange={() => setScheme(scheme === 'http' ? 'https' : 'http')}
          checked={scheme === 'https'}
        />{' '}
      </div>

      <ul className="cards">
        {Object.keys(domains).map((group) => {
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
        Télécharger le certificat
      </a>
    </div>
  )
}

export default App
