import SVG from './SVG';

type Props = {
  favorites: string[];
  domains: string[];
  scheme: 'http' | 'https';
  toggleSidebar: () => any;
  toggleSidebarDirection: () => any;
  sidebarLeft: boolean;
  active: boolean;
};

function Favorites({
  favorites,
  domains,
  scheme,
  toggleSidebar,
  toggleSidebarDirection,
  sidebarLeft,
  active,
}: Props) {
  return (
    <div
      className={`favorites ${active && 'is-active'} ${
        !sidebarLeft && 'favorites--right'
      }`}
    >
      <button
        type="button"
        className="favorites__toggle"
        onClick={toggleSidebar}
      >
        <SVG icon="chevronRight" />
      </button>

      <div className="favorites__header">
        <SVG icon="star" />
        <h2>Favorites</h2>
      </div>

      <ul className="favorites__list">
        {favorites
          .filter((domain) => domains.includes(domain))
          .map((domain) => (
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
          ))}
      </ul>

      <button
        type="button"
        className="favorites__column-switcher"
        onClick={toggleSidebarDirection}
      >
        {!sidebarLeft ? <SVG icon="columnLeft" /> : <SVG icon="columnRight" />}
      </button>
    </div>
  );
}

export default Favorites;
