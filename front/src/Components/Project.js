import React from 'react'

import Off from '../off.svg'
import Wait from '../wait.svg'
import Star from '../assets/svgs/star.svg'
import StarBorder from '../assets/svgs/star_border.svg'

class Project extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      off: false,
    }
    this.off = this.off.bind(this)
  }

  off(e) {
    e.preventDefault()
    if (window.confirm(`Stop ${this.props.group} ?`)) {
      this.props.socket.emit('stop', this.props.group)
      this.setState({ off: true })
    }
  }

  render() {
    const { group, domains, scheme, favorites, switchFavorite } = this.props
    return (
      <li className="card" key={`${group}`}>
        <div className="card--title">
          <h2>{group}</h2>
          {!this.state.off && (
            <a href="#top" onClick={this.off}>
              <img width="30" src={Off} alt="Stop" />
            </a>
          )}
          {this.state.off && (
            <img className="turn" width="30" src={Wait} alt="Stop" />
          )}
        </div>
        <ul>
          {domains.map((domain) => {
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
                  onClick={switchFavorite(domain)}
                >
                  <img
                    alt="Favorite"
                    src={favorites.includes(domain) ? Star : StarBorder}
                  />
                </a>
              </li>
            )
          })}
        </ul>
      </li>
    )
  }
}

export default Project
