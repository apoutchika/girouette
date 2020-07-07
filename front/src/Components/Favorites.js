import React from 'react'

import Star from '../star.svg'

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
    const { favorites, domains, scheme } = this.props
    return (
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
    )
  }
}

export default Favorites
