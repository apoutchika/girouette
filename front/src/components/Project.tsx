import { useState } from "react";
import SVG from "./SVG";

type Props = {
  socket: any;
  group: string;
  domains: string[];
  scheme: "http" | "https";
  favorites: string[];
  switchFavorite: (domain: string) => any;
};

function Project({
  socket,
  group,
  domains,
  scheme,
  favorites,
  switchFavorite,
}: Props) {
  const [off, setOff] = useState<boolean>(false);

  const stop = () => {
    if (window.confirm(`Stop ${group} ?`)) {
      socket.emit("stop", group);
      setOff(true);
    }
  };

  return (
    <li
      className={`project-card ${off && "is-stop"} ${
        group === "Girouette" && "is-girouette"
      }`}
      key={`${group}`}
    >
      <div className="project-card__header">
        <h2 className="project-card__title">{group}</h2>

        {group !== "Girouette" && (
          <button type="button" className="project-card__power" onClick={stop}>
            <SVG icon="power" />
          </button>
        )}
      </div>

      <ul className="project-card__list">
        {domains.map((domain) => (
          <li key={`${group}_${domain}`} className="project-card__item">
            <a
              href={`${scheme}://${domain}`}
              target="_blank"
              rel="noopener noreferrer"
              className="project-card__link"
            >
              {`${scheme}://${domain}`}
            </a>

            <button
              type="button"
              className="project-card__favorite"
              onClick={switchFavorite(domain)}
            >
              <SVG icon={favorites.includes(domain) ? "star" : "star-o"} />
            </button>
          </li>
        ))}
      </ul>
    </li>
  );
}

export default Project;
