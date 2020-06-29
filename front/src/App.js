import React from 'react'
import socketIOClient from 'socket.io-client'
import Switch from 'react-switch'
import './App.css'
import get from 'lodash/get'
import bytes from 'bytes'

import Star from './star.svg'
import StarBorder from './star_border.svg'

const ENDPOINT = `https://proxy.devel`

class App extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      domainsByGroup: {},
      domains: [],
      favorites: [],
      socket: null,
      scheme: 'https',
      clean: false,
      cleaned: {},
    }

    this.saveFavories = this.saveFavories.bind(this)
  }

  componentDidMount() {
    this.getFavorites()

    const socket = socketIOClient(ENDPOINT, {
      path: '/proxydockerdata',
    })

    this.setState({ socket })

    socket.on('disconnect', () => {
      this.setState({ domainsByGroup: {}, domains: [] })
    })

    socket.on('domains', (domains) => {
      this.setState({ domains: Object.keys(domains) })
      const domainsByGroup = Object.keys(domains).reduce((acc, domain) => {
        const { project } = domains[domain]
        acc[project] = acc[project] || []
        acc[project].push(domain)
        return acc
      }, {})

      this.setState({ domainsByGroup })
    })

    socket.on('prune', (cleaned) => {
      this.setState({ clean: false, cleaned })
    })
  }

  getFavorites() {
    try {
      if (window.localStorage.getItem('favorites')) {
        const favorites = JSON.parse(window.localStorage.getItem('favorites'))
        this.setState({ favorites })
      }
    } catch (e) {
      console.error(e)
    }
  }

  saveFavories() {
    window.localStorage.setItem(
      'favorites',
      JSON.stringify(this.state.favorites)
    )
  }

  switchFavorite(domain) {
    return (e) => {
      e.preventDefault()

      if (this.state.favorites.includes(domain)) {
        return this.setState(
          {
            favorites: this.state.favorites.filter((fav) => fav !== domain),
          },
          this.saveFavories
        )
      }

      this.setState(
        {
          favorites: [...this.state.favorites, domain],
        },
        this.saveFavories
      )
    }
  }

  render() {
    const {
      socket,
      favorites,
      domains,
      domainsByGroup,
      scheme,
      clean,
      cleaned,
    } = this.state
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
          <ul className="favorites">
            {favorites
              .filter((domain) => domains.includes(domain))
              .map((domain) => {
                return (
                  <li key={domain}>
                    <a
                      href={`${scheme}://${domain}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <img alt="Favorite" src={Star} />
                      {`${scheme}://${domain}`}
                    </a>
                  </li>
                )
              })}
          </ul>
        </div>

        <br />
        <br />
        <ul className="cards">
          {Object.keys(domainsByGroup)
            .sort()
            .map((group) => {
              return (
                <li className="card" key={`${group}`}>
                  <h2>{group}</h2>
                  <ul>
                    {domainsByGroup[group].sort().map((domain) => {
                      return (
                        <li key={`${group}_${domain}`}>
                          <a
                            href={`${scheme}://${domain}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {scheme}://{domain}
                          </a>
                          <a
                            href="#top"
                            className="favorite-link"
                            onClick={this.switchFavorite(domain)}
                          >
                            <img
                              alt="Favorite"
                              src={
                                this.state.favorites.includes(domain)
                                  ? Star
                                  : StarBorder
                              }
                            />
                          </a>
                        </li>
                      )
                    })}
                  </ul>
                </li>
              )
            })}
        </ul>

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

        <br />
        <br />

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
