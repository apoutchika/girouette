import React from 'react'
import socketIOClient from 'socket.io-client'
import Switch from 'react-switch'
import './App.css'

import Project from './Components/Project'
import Favorites from './Components/Favorites'
import CleanDocker from './Components/CleanDocker'
import CleanDns from './Components/CleanDns'

const ENDPOINT = `https://girouette.devel`

class App extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      domainsByGroup: {},
      domains: [],
      favorites: [],
      socket: null,
      scheme: 'https',
    }

    this.saveFavorites = this.saveFavorites.bind(this)
    this.switchFavorite = this.switchFavorite.bind(this)
  }

  componentDidMount() {
    this.getFavorites()

    const socket = socketIOClient(ENDPOINT, {
      path: '/girouettedockerdata',
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

  saveFavorites() {
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
          this.saveFavorites
        )
      }

      this.setState(
        {
          favorites: [...this.state.favorites, domain],
        },
        this.saveFavorites
      )
    }
  }

  render() {
    const { domains, domainsByGroup, favorites, scheme, socket } = this.state
    return (
      <div className="App">
        <h1>Girouette</h1>

        <div>
          HTTPS
          <Switch
            onChange={() =>
              this.setState({ scheme: scheme === 'http' ? 'https' : 'http' })
            }
            checked={scheme === 'https'}
          />{' '}
        </div>

        <Favorites favorites={favorites} domains={domains} scheme={scheme} />

        <ul className="cards">
          {Object.keys(domainsByGroup)
            .sort()
            .map((group) => {
              return (
                <Project
                  key={group}
                  group={group}
                  socket={socket}
                  domains={domainsByGroup[group].sort()}
                  scheme={scheme}
                  favorites={favorites}
                  switchFavorite={this.switchFavorite}
                />
              )
            })}
        </ul>

        <CleanDocker socket={socket} />
        <CleanDns socket={socket} />

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
