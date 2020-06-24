import React from 'react'
import socketIOClient from 'socket.io-client'
import Switch from 'react-switch'
import './App.css'
import get from 'lodash/get'
import bytes from 'bytes'

const ENDPOINT = `https://proxy.devel`

class App extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      socket: null,
      domains: [],
      scheme: 'https',
      clean: false,
      cleaned: {},
    }
  }

  componentDidMount() {
    const socket = socketIOClient(ENDPOINT, {
      path: '/proxydockerdata',
    })

    this.setState({ socket })

    socket.on('disconnect', () => {
      this.setState({ domains: {} })
    })

    socket.on('domains', (domains) => {
      //domains = domains.map(reverse).sort().map(reverse)
      const res = Object.keys(domains).reduce((acc, domain) => {
        const { project } = domains[domain]
        acc[project] = acc[project] || []
        acc[project].push(domain)
        return acc
      }, {})

      this.setState({ domains: res })
    })
    socket.on('prune', (cleaned) => {
      this.setState({ clean: false, cleaned })
    })
  }

  render() {
    const { socket, domains, scheme, clean, cleaned } = this.state
    return (
      <div className="App">
        <h1>Proxy</h1>

        <div>
          HTTPS
          <Switch
            onChange={() =>
              this.setState({ scheme: scheme === 'http' ? 'https' : 'http' })
            }
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
                this.setState({ clean: true })
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

        <div>
          <a
            href={ENDPOINT.replace(/^https/, 'http') + '/certificate'}
            download
          >
            Download certificate
          </a>
          <ul>
            <li>Chrome: chrome://settings/certificates</li>
            <li>Firefox: about:preferences#privacy</li>
          </ul>
        </div>
      </div>
    )
  }
}

export default App
