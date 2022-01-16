const tls = require('tls');
const generateDomainCertificate = require('./generateDomainCertificate');
const rootCA = require('/data/rootCA.json');

const domains = new Map();

module.exports = (domain, cb) => {
  if (!domains.has(domain)) {
    console.log('Create ssl for', domain);
    domains.set(domain, generateDomainCertificate(domain));
  }

  cb(
    null,
    tls.createSecureContext({
      key: rootCA.privateKey,
      cert: domains.get(domain),
    }),
  );
};
