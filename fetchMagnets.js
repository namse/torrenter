const fetch = require('node-fetch');
const cheerio = require('cheerio');

function fetchText(uri) {
  return fetch(uri)
  .then((response) => response.text());
}

function fetchMagnetsFromBTKU(pids) {
  const promises = [];
  const magnets = [];
  const failedPids = [];
  pids.forEach(pid => {
    const param = encodeURI(`"${pid}"`);
    const promise = fetchText(`http://ko.btku.org/q/${param}/?sort=hot`)
    .then(text => {
      const $ = cheerio.load(text);
      const a = $('span.downLink a').next(); // first is QR. so I call next, it is Magnet.
      if (a) {
        const link = a.attr('href');
        if (!link) {
          console.log(`can't find magnet for pid:${pid}`);
          failedPids.push(pid);
        } else {
          magnets.push(link);
        }
      } else {
        console.log(`can't find magnet for pid:${pid}`);
        failedPids.push(pid);
      }
    });
    promises.push(promise);
  });
  return Promise.all(promises).then(() => ({
    magnets,
    failedPids,
  }));
}

module.exports = function fetchMagnets(pids) {
  return fetchMagnetsFromBTKU(pids);
}
