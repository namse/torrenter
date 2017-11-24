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

function extractMagnet(link) {
  return fetchText(link)
  .then((text) => {
    let magnet = text.match(/magnet(.*?)"/)[0];
    magnet = magnet.substring(0, magnet.length - 1);
    return magnet;
  })
}

function fetchMagnetsFromBTKU(pids) {
  const promises = [];
  const failedPids = [];
  pids.forEach(pid => {
    const param = encodeURI(`"${pid}"`);
    const promise = fetchText(`http://www.btmp4.net/search/${param}/?sort=hot`)
    .then(text => {
      const $ = cheerio.load(text);
      const as = $('a');
      let a;
      for (let i = 0; i < as.length; i += 1) {
        const tempA = $('a')[i];
        if (tempA.attribs.href.indexOf('http://www.btmp4.net/h/') >= 0) {
          a = tempA;
          break;
        }
      }
      if (!a) {
        failedPids.push(pid);
        return;
      }
      const link = a.attribs.href;
      if (!link) {
        failedPids.push(pid);
        return;
      }
      return extractMagnet(link)
      .then((magnet) => saveMagnets(pid, magnet));
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
