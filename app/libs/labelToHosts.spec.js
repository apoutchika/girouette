const labelToHosts = require("./labelToHosts");

describe("labelToHosts", () => {
  it("should get domain from girouette.domains", () => {
    const out = labelToHosts({
      "girouette.domains": "www.toto.fr:4242,toto.com:4343",
    });
    expect(Array.isArray(out)).toBeTruthy();
    expect(out).toHaveLength(2);
    expect(out[0].domain).toBe("www.toto.fr");
    expect(out[0].port).toBe("4242");

    expect(out[1].domain).toBe("toto.com");
    expect(out[1].port).toBe("4343");
  });

  it("should get domain from girouette.domains and remove https?://", () => {
    const out = labelToHosts({
      "girouette.domains": "http://www.toto.fr:4242,https://toto.com:4343",
    });
    expect(Array.isArray(out)).toBeTruthy();
    expect(out).toHaveLength(2);
    expect(out[0].domain).toBe("www.toto.fr");
    expect(out[0].port).toBe("4242");

    expect(out[1].domain).toBe("toto.com");
    expect(out[1].port).toBe("4343");
  });

  it("should get domain from old traefik config", () => {
    const out = labelToHosts({
      "traefik.toto.rule": "Host:www.toto.fr",
      "traefik.toto.port": "4242",
    });
    expect(Array.isArray(out)).toBeTruthy();
    expect(out).toHaveLength(1);
    expect(out[0].domain).toBe("www.toto.fr");
    expect(out[0].port).toBe("4242");
  });

  it("should get domain from new traefik config", () => {
    const out = labelToHosts({
      "traefik.http.routers.toto.rule": "Host(`www.toto.fr`)",
      "traefik.http.services.toto.loadbalancer.server.port": "4242",
    });
    expect(Array.isArray(out)).toBeTruthy();
    expect(out).toHaveLength(1);
    expect(out[0].domain).toBe("www.toto.fr");
    expect(out[0].port).toBe("4242");
  });
});
