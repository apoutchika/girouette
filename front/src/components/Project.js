import React from 'react'
import SVG from './SVG'

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
      <li className={`project-card ${this.state.off && 'is-stop'} ${group === 'Girouette' && 'is-girouette'}`} key={`${group}`}>
        <div className="project-card__header">
          <h2 className="project-card__title">
            {group}
          </h2>

          {group !== 'Girouette' && (
            <button className="project-card__power" onClick={this.off}>
              <SVG icon="power" />
            </button>
          )}
        </div>

        <ul className="project-card__list">
          {domains.map((domain) => {
            return (
              <li key={`${group}_${domain}`} className="project-card__item">
                <a
                  href={`${scheme}://${domain}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="project-card__link"
                >
                  {scheme}://{domain}
                </a>

                <button
                  className="project-card__favorite"
                  onClick={switchFavorite(domain)}
                >
                  <SVG icon={ favorites.includes(domain) ? 'star' : 'star-o' } />
                </button>
              </li>
            )
          })}
        </ul>
      </li>
    )
  }
}

export default Project
