const app = require("express")();
const serveStatic = require("serve-static");
const http = require("http").createServer(app);
const rootCA = require("/data/rootCA.json");

const io = require("socket.io")(http, {
  path: "/girouettedockerdata",
  cors: {
    origin: true,
    credentials: true,
  },
});

require("./socket")(io);

app.get("/certificate", (_req, res) => {
  res.setHeader("Content-type", "application/octet-stream");
  res.setHeader(
    "Content-disposition",
    "attachment; filename=GirouetteRootCA.crt"
  );
  res.send(Buffer.from(rootCA.crt));
});

app.get("/config", (_req, res) => {
  const { DNS, TLD, TLDS, DNSMASQ } = process.env;
  res.json({
    dns: DNS,
    tld: TLD,
    tlds: TLDS,
    dnsmasq: DNSMASQ,
  });
});

if (process.env.NODE_ENV !== "development") {
  app.use("/", serveStatic("/front/dist/", { index: ["index.html"] }));
} else {
  app.get("/", (_req, res) => {
    res.redirect("https://girouettedev.devel");
  });
}

app.use((_req, res) => {
  res.status(404).send("404");
});

http.listen(8080, () => {
  console.log("> App started on http://localhost:8080");
});
