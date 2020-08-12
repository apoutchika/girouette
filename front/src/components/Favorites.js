import React from 'react'
import SVG from './SVG'

class Favorites extends React.Component {
  constructor(props) {
    super(props)
    this.off = this.off.bind(this)
  }

  off(e) {
    e.preventDefault()
    if (window.confirm(`Stop ${this.props.group} ?`)) {
      this.props.socket.emit('stop', this.props.group)
    }
  }

  render() {
    const { favorites, domains, scheme, toggleSidebar, active } = this.props

    return (
      <div className={`favorites ${active && 'is-active'}`}>
        <button className="favorites__toggle" onClick={toggleSidebar}>
          toggle
        </button>
        <div className="favorites__header">
          <SVG icon="star" />
          <h2>Favorites</h2>
        </div>

        <ul className="favorites__list">
          {favorites
            .filter((domain) => domains.includes(domain))
            .map((domain) => {
              return (
                <li className="favorites__list__item" key={domain}>
                  <a
                    className="favorites__list__link"
                    href={`${scheme}://${domain}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {`${scheme}://${domain}`}
                  </a>
                </li>
              )
            })}
        </ul>
      </div>
    )
  }
}

export default Favorites
