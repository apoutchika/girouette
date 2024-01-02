import { useCallback, useEffect, useState } from "react";
import Switch from "react-switch";
import socketIOClient from "socket.io-client";
import Favorites from "./components/Favorites";
import Footer from "./components/Footer";
import PopinCertificate from "./components/PopinCertificate";
import Project from "./components/Project";

import "./assets/sass/main.scss";
import Header from "./components/Header";

const ENDPOINT = `http${
  window.location.protocol === "https:" ? "s" : ""
}://girouette.devel`;

const socket = socketIOClient(ENDPOINT, {
  path: "/girouettedockerdata",
  withCredentials: true,
});

const configFromLocalStorage = localStorage.getItem("config");
const defaultConfig =
  configFromLocalStorage !== null
    ? JSON.parse(configFromLocalStorage)
    : {
        favorites: [],
        scheme: "https",
        sidebar: false,
        sidebarLeft: true,
      };

type DomainsByGroup = {
  [index: string]: string[];
};
type DomainsSocketResponse = {
  [index: string]: {
    project: string;
  };
};

type Config = {
  favorites: string[];
  scheme: "http" | "https";
  sidebar: boolean;
  sidebarLeft: boolean;
};

function App() {
  const [domainsByGroup, setDomainsByGroup] = useState<DomainsByGroup>({});
  const [domains, setDomains] = useState<string[]>([]);
  const [certifPopin, setCertifPopin] = useState<boolean>(false);

  const [config, setConfig] = useState<Config>(defaultConfig);

  const { favorites, scheme, sidebar, sidebarLeft } = config;

  useEffect(() => {
    window.localStorage.setItem("config", JSON.stringify(config));
  }, [config]);

  const socketOnDisconnect = useCallback(() => {
    setDomains([]);
    setDomainsByGroup({});
  }, []);

  const socketOnDomains = useCallback((newDomains: DomainsSocketResponse) => {
    setDomains(Object.keys(newDomains));
    setDomainsByGroup(
      Object.keys(newDomains).reduce<DomainsByGroup>((acc, domain) => {
        const { project } = newDomains[domain];
        acc[project] = acc[project] || [];
        acc[project].push(domain);
        return acc;
      }, {})
    );
  }, []);

  useEffect(() => {
    socket.on("disconnect", socketOnDisconnect);
    socket.on("domains", socketOnDomains);

    return () => {
      socket.off("disconnect", socketOnDisconnect);
      socket.off("domains", socketOnDomains);
    };
  }, [socketOnDomains, socketOnDisconnect]);

  const switchFavorite = (domain: string) => () => {
    if (favorites.includes(domain)) {
      return setConfig({
        ...config,
        favorites: favorites.filter((fav) => fav !== domain),
      });
    }

    return setConfig({
      ...config,
      favorites: [...favorites, domain],
    });
  };

  return (
    <div
      className={`content ${sidebar && "with-sidebar"} ${
        !sidebarLeft && "with-sidebar--right"
      }`}
    >
      <Header toggleCertifPopin={() => setCertifPopin(!certifPopin)} />
      <section className="main-content">
        <div className="switch">
          <span className="switch__label">HTTPS</span>

          <Switch
            className="https-switch"
            offColor="#7d898d"
            onColor="#0075ff"
            onChange={() =>
              setConfig({
                ...config,
                scheme: scheme === "http" ? "https" : "http",
              })
            }
            checked={scheme === "https"}
          />
        </div>

        <ul className="projects-list wrapper">
          {Object.keys(domainsByGroup)
            .sort()
            .map((group) => (
              <Project
                key={group}
                group={group}
                socket={socket}
                domains={domainsByGroup[group].sort()}
                scheme={scheme}
                favorites={favorites}
                switchFavorite={switchFavorite}
              />
            ))}
        </ul>
      </section>

      <Footer />

      <PopinCertificate
        active={certifPopin}
        endpoint={ENDPOINT}
        toggleCertifPopin={() => setCertifPopin(!certifPopin)}
      />

      <Favorites
        favorites={favorites}
        domains={domains}
        scheme={scheme}
        toggleSidebar={() => setConfig({ ...config, sidebar: !sidebar })}
        toggleSidebarDirection={() =>
          setConfig({ ...config, sidebarLeft: !sidebarLeft })
        }
        sidebarLeft={sidebarLeft}
        active={sidebar}
      />
    </div>
  );
}

export default App;
