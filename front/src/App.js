import React, { useState, useEffect } from 'react'
import socketIOClient from 'socket.io-client'
import './App.css'

const ENDPOINT = 'http://proxy.devel'

function App() {
  const [domains, setDomains] = useState([])

  useEffect(() => {
    const socket = socketIOClient(ENDPOINT)
    socket.on('domains', (domains) => {
      //domains = domains.map(reverse).sort().map(reverse)
      let res = {}
      domains.map((domain) => {
        const [tld, name] = domain.split('.').reverse()
        res[`${name}.${tld}`] = res[`${name}.${tld}`] || []
        res[`${name}.${tld}`].push(domain)
      })

      setDomains(res)
    })
  }, [])

  return (
    <div className="App">
      <h1>Proxy</h1>
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
                        href={`http://${domain}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        http://{domain}
                      </a>
                    </li>
                  )
                })}
              </ul>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export default App
