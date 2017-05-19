const fetch = require('node-fetch');
const cheerio = require('cheerio');
const fs = require('fs');

fs.existsSync("magnet") || fs.mkdirSync("magnet");

function fetchText(uri) {
  return fetch(uri)
  .then((response) => response.text());
}

function saveMagnets(pid, magnet) {
  return new Promise((resolve, reject) => {
    const dest = `magnet/${pid}.magnet`;
    fs.writeFile(dest, magnet, (err) => {
      if(err) {
        return reject(err);
      }
      resolve();
    });
  });
}

function fetchMagnetsFromBTKU(pids) {
  const promises = [];
  const failedPids = [];
  pids.forEach(pid => {
    const param = encodeURI(`"${pid}"`);
    const promise = fetchText(`http://ko.btku.org/q/${param}/?sort=hot`)
    .then(text => {
      const $ = cheerio.load(text);
      const a = $('span.downLink a')[1]; // first is QR. so I call next, it is Magnet.
      if (!a) {
        failedPids.push(pid);
        return;
      }
      const link = a.attribs.href;
      if (!link) {
        failedPids.push(pid);
        return;
      }
      return saveMagnets(pid, link);
    });
    promises.push(promise);
  });
  return Promise.all(promises).then(() => ({
    failedPids,
  }));
}

module.exports = function fetchMagnets(pids) {
  return fetchMagnetsFromBTKU(pids);
}
