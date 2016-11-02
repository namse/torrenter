const fetch = require('node-fetch');
const cheerio = require('cheerio');
const https = require('https');
const fs = require('fs');

fs.existsSync("torrent") || fs.mkdirSync("torrent");

function fetchText(uri) {
  return fetch(uri)
  .then((response) => response.text());
}

function downloadFile(pid, uri) {
  return new Promise((resolve, reject) => {
    const dest = `torrent/${pid}.torrent`;
    const file = fs.createWriteStream(dest);
    const request = https.get(uri, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close(() => resolve());
      });
    }).on('error', (err) => {
      fs.unlink(dest);
      reject(err);
    });
  });
}

function downloadTorrentFilesFromNyaa(pids) {
  const promises = [];
  const failedPids = [];
  pids.forEach(pid => {
    const term = encodeURI(`${pid}`);
    const promise = fetchText(`https://sukebei.nyaa.se/?page=search&term=${term}&sort=2`)
    .then(text => {
      const $ = cheerio.load(text);
      const a = $('td.tlistdownload a');
      if (a) {
        const link = a.attr('href');
        if (!link) {
          console.log(`can't find torrent for pid:${pid}`);
          failedPids.push(pid);
        } else {
          console.log(link);
          return downloadFile(pid, `https:${link}`);
        }
      } else {
        console.log(`can't find torrent for pid:${pid}`);
        failedPids.push(pid);
      }
    });
    promises.push(promise);
  });
  return Promise.all(promises).then(() => ({
    failedPids,
  }));
}

module.exports = function downloadTorrentFiles(pids) {
  return downloadTorrentFilesFromNyaa(pids);
}
