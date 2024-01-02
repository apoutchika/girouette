const fs = require("fs-extra");
const generateRootCA = require("./generateRootCA");

if (!fs.pathExistsSync("/data/rootCA.json")) {
  const rootCA = generateRootCA();
  fs.writeFileSync("/data/rootCA.json", JSON.stringify(rootCA, null, 2));
}
