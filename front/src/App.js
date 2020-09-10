import React from 'react'
import socketIOClient from 'socket.io-client'
import Switch from 'react-switch'
import SVG from './components/SVG'
import Project from './components/Project'
import Favorites from './components/Favorites'
import CleanDocker from './components/CleanDocker'
import CleanDns from './components/CleanDns'
import PopinCertificate from './components/PopinCertificate'
import config from './config'

import Logo from './assets/svgs/logo.svg'
import './assets/sass/main.scss'

const ENDPOINT = `http${
  window.location.protocol === 'https:' ? 's' : ''
}://girouette.${config.tld}`

class App extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      domainsByGroup: {},
      domains: [],
      favorites: [],
      socket: null,
      scheme: 'https',
      certifPopin: false,
      sidebar: localStorage.getItem('girouetteSidebar') ? JSON.parse(localStorage.getItem('girouetteSidebar')) : false,
      sidebarLeft: localStorage.getItem('girouetteSidebarLeft') ? JSON.parse(localStorage.getItem('girouetteSidebarLeft')) : true,
    }

    this.saveFavorites = this.saveFavorites.bind(this)
    this.switchFavorite = this.switchFavorite.bind(this)
    this.toggleCertifPopin = this.toggleCertifPopin.bind(this)
    this.toggleSidebar = this.toggleSidebar.bind(this)
    this.toggleSidebarDirection = this.toggleSidebarDirection.bind(this)
  }

  componentDidMount() {
    this.getFavorites()

    const scheme = window.localStorage.getItem('scheme')
    if (scheme) {
      this.setState({ scheme })
    }

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

  toggleCertifPopin() {
    this.setState({
      certifPopin: !this.state.certifPopin,
    })
  }

  toggleSidebar() {
    localStorage.setItem('girouetteSidebar', !this.state.sidebar)
    this.setState({
      sidebar: !this.state.sidebar,
    })
  }

  toggleSidebarDirection() {
    localStorage.setItem('girouetteSidebarLeft', !this.state.sidebarLeft)
    this.setState({
      sidebarLeft: !this.state.sidebarLeft,
    })
  }

  render() {
    const {
      domains,
      domainsByGroup,
      favorites,
      scheme,
      socket,
      certifPopin,
      sidebar,
      sidebarLeft
    } = this.state

    return (
      <div className={`content ${sidebar && 'with-sidebar'} ${!sidebarLeft && 'with-sidebar--right'}`}>
        <header className="header">
          <div className="header__logo">
            <img src={Logo} alt="" />
            <h1>Girouette</h1>
          </div>

          <button
            className="header__certificate btn btn--reverse"
            onClick={this.toggleCertifPopin}
          >
            <SVG icon="key" extraClass="small-icon" />
            Certificate
          </button>

          <CleanDns socket={socket} />
          <CleanDocker socket={socket} />
        </header>

        <section className="main-content">
          <div className="switch">
            <span className="switch__label">
              HTTPS
            </span>

            <Switch
              className='https-switch'
              offColor='#7d898d'
              onColor='#0075ff'
              onChange={() =>
                this.setState({
                  scheme: scheme === 'http' ? 'https' : 'http'
                }, () => {
                  window.localStorage.setItem('scheme', this.state.scheme)
                })
              }
              checked={scheme === 'https'}
            />
          </div>

          <ul className="projects-list wrapper">
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
        </section>

        <footer className="footer">
          <ul>
            <li>
              <a
                href="https://www.girouette.dev"
                rel="noopener noreferrer"
                target="_blank"
              >
                Girouette.dev
              </a>
            </li>
            <li>
              <a
                href="https://github.com/apoutchika/girouette"
                rel="noopener noreferrer"
                target="_blank"
              >
                Github
              </a>
            </li>
          </ul>
        </footer>

        <PopinCertificate
          active={certifPopin}
          endpoint={ENDPOINT}
          toggleCertifPopin={this.toggleCertifPopin}
        />

        <Favorites favorites={favorites} domains={domains} scheme={scheme} toggleSidebar={this.toggleSidebar} toggleSidebarDirection={this.toggleSidebarDirection} sidebarLeft={sidebarLeft} active={sidebar} />
      </div>
    )
  }
}

export default App
