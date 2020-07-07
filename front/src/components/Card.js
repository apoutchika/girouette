import React from 'react'

import Star from '../assets/svgs/star.svg'
import StarBorder from '../assets/svgs/star_border.svg'

class Card extends React.Component {
  render() {
    const { group, domainsByGroup, scheme, switchFavorite, favorite } = this.props

    return (
      <div className="card">
        <h2 className="card__title">
          {group}
        </h2>
        
        <ul className="card__list">
          {domainsByGroup[group].sort().map((domain) => {
            let subDomain = domain.substr(0, domain.indexOf('.'))

            return (
              <li className="card__list__item" key={`${group}_${domain}`}>
                <a
                  href={`${scheme}://${domain}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  { !group.includes(subDomain) ? (
                    <span className="label">
                      {subDomain}
                    </span>
                    ) : null}
                  {scheme}://{domain}
                </a>
                <span
                  className="favorite-link"
                  onClick={() => { switchFavorite(domain) }}
                >
                  <img
                    alt="Favorite"
                    src={
                      favorite.includes(domain)
                        ? Star
                        : StarBorder
                    }
                  />
                </span>
              </li>
            )
          })}
        </ul>
      </div>
    )
  }
}

export default Card
