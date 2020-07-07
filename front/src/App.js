import React from 'react'
import socketIOClient from 'socket.io-client'
import Switch from 'react-switch'
import get from 'lodash/get'
import bytes from 'bytes'
import Card from './components/Card'
import './assets/sass/main.scss'

import Star from './assets/svgs/star.svg'

const ENDPOINT = `https://proxy.devel`

class App extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            popinCertif: false,
            domainsByGroup: {},
            domains: [],
            favorites: [],
            socket: null,
            scheme: 'https',
            clean: false,
            cleaned: {},
        }

        this.saveFavories = this.saveFavories.bind(this)
        this.switchFavorite = this.switchFavorite.bind(this)
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
        if (this.state.favorites.includes(domain)) {
            return this.setState({
                favorites: this.state.favorites.filter((fav) => fav !== domain),
            }, this.saveFavories)
        }

        this.setState({
            favorites: [...this.state.favorites, domain],
        }, this.saveFavories)
    }

    togglePopinCertif() {
        this.state({
            popinCertif: !this.state.popinCertif
        })
    }

    render() {
        const {popinCertif, socket, favorites, domains, domainsByGroup, scheme, clean, cleaned} = this.state

        return (
            <div className="App">
                <header className="header">
                    <h1 classNme="header__logo">
                        Proxy
                    </h1>

                    <button
                        className="header__certificate"
                        onClick={this.togglePopinCertif}
                    >
                        Activate certificate
                    </button>

                    <button
                        className="header__docker btn btn--rich"
                        type="button"
                        onClick={(e) => {
                            socket.emit('prune')
                            this.setState({ clean: true })
                        }}
                    >
                        Clean Docker
                    </button>
                </header>

                <div>
                    HTTPS
                    <Switch
                        onChange={() =>
                            this.setState({ scheme: scheme === 'http' ? 'https' : 'http' })
                        }
                        checked={scheme === 'https'}
                    />
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
                            <Card
                                key={group}
                                group={group}
                                domainsByGroup={domainsByGroup}
                                scheme={scheme}
                                switchFavorite={this.switchFavorite}
                                favorite={favorites}
                            />
                        )
                    })}
                </ul>

                <br />
                <br />

                <div>
                    {clean && <p>...</p>}

                    {cleaned && cleaned.containers && (
                        <ul>
                            <li>
                                Deleted containers: {get(cleaned, 'containers.nb', '?')} ({bytes(get(cleaned, 'containers.go', 0))})
                            </li>

                            <li>
                                Deleted images: {get(cleaned, 'images.nb', '?')} ({bytes(get(cleaned, 'images.go'))})
                            </li>
                        </ul>
                    )}
                </div>

                <br />
                <br />

                <div>
                    <a href={ENDPOINT.replace(/^https/, 'http') + '/certificate'} download>
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
