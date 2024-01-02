const get = require("lodash/get");

const getProject = (labels, domain) => {
  const defaultProject = domain
    .split(".")
    .reverse()
    .slice(0, 2)
    .reverse()
    .join(".");
  return get(
    labels,
    ["girouette.group"],
    get(labels, ["com.docker.compose.project"], defaultProject)
  );
};

module.exports = (labels) => {
  // domains label (with s)
  if (labels["girouette.domains"]) {
    return labels["girouette.domains"].split(",").map((domainAndPort) => {
      const [domain, port] = domainAndPort
        .replace(/^https?:\/\//, "")
        .split(":");
      return {
        project: getProject(labels, domain),
        domain,
        port: port || 80,
      };
    });
  }

  // domain label (without s)
  if (labels["girouette.domain"]) {
    return labels["girouette.domain"].split(",").map((domainAndPort) => {
      const [domain, port] = domainAndPort
        .replace(/^https?:\/\//, "")
        .split(":");
      return {
        project: getProject(labels, domain),
        domain,
        port: port || 80,
      };
    });
  }

  // traefik fallback
  const defaultTraefikPort = get(labels, ["traefik.port"], 80);

  let hosts = Object.keys(labels)
    .filter((name) => name.match(/^traefik\.http\.routers/))
    .filter((name) => name.match(/\.rule$/))
    .map((name) => name.replace(/^traefik\.http\.routers\.(.+)\.rule$/, "$1"))
    .reduce((acc, segment) => {
      labels[`traefik.http.routers.${segment}.rule`]
        .replace(/`/g, "")
        .replace(/^Host\(/, "")
        .replace(/\)/, "")
        .split(",")
        .forEach((domain) => {
          acc.push({
            project: getProject(labels, domain),
            domain,
            port: get(
              labels,
              `traefik.http.services.${segment}.loadbalancer.server.port`,
              defaultTraefikPort
            ),
          });
        });
      return acc;
    }, []);

  if (hosts.length > 0) return hosts;

  return Object.keys(labels)
    .filter((name) => name.match(/^traefik\./))
    .filter((name) => name.match(/\.rule$/))
    .map((name) => name.replace(/^traefik\.(.+)\.rule$/, "$1"))
    .reduce((acc, segment) => {
      labels[`traefik.${segment}.rule`]
        .replace(/^Host:/, "")
        .split(",")
        .forEach((domain) => {
          acc.push({
            project: getProject(labels, domain),
            domain,
            port: get(labels, `traefik.${segment}.port`, defaultTraefikPort),
          });
        });
      return acc;
    }, []);
};
