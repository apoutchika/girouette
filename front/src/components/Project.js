import React, { Fragment } from 'react'
import SVG from './SVG'

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
      <li className={`project-card ${this.state.off && 'is-stop'}`} key={`${group}`}>
        <div className="project-card__header">
          <h2 class="project-card__title">
            {group}
          </h2>

          {group !== 'Girouette' && (
            <a class="project-card__power" href="#top" onClick={this.off}>
              <SVG icon="power" />
            </a>
          )}
        </div>

        <ul className="project-card__list">
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
