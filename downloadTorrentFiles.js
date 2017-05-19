const fetch = require('node-fetch');
const cheerio = require('cheerio');
const http = require('http');
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
    const request = http.get(uri, (response) => {
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

function getParams(query) {
  if (!query) {
    return {};
  }

  return (/^[?#]/.test(query) ? query.slice(1) : query)
    .split('&')
    .reduce((params, param) => {
      let [ key, value ] = param.split('=');
      params[key] = value ? decodeURIComponent(value.replace(/\+/g, ' ')) : '';
      return params;
    }, {});
};

const sites = [{
  generateUrl: (term) => `http://www.kukudas.com/bbs/board.php?bo_table=JAV1A&stx=${term}`,
  getDownloadLink: (html) => {
    const $ = cheerio.load(html);
    const a = $('.list-img a')[0];
    if (!a) {
      return Promise.reject();
    }
    const link = a.attribs.href;
    if (!link) {
      return Promise.reject();
    }
    const {
      wr_id,
    } = getParams(link);
    return Promise.resolve(`http://www.kukudas.com/bbs/download.php?bo_table=JAV1A&wr_id=${wr_id}`);
  },
}, {
  generateUrl: (term) => `http://totoria.org/bbs/search.php?stx=${term}`,
  getDownloadLink: (html) => {
    const $ = cheerio.load(html);
    const a = $('.img-item > a')[0];
    if (!a) {
      return Promise.reject();
    }
    const link = a.attribs.href;
    if (!link) {
      return Promise.reject();
    }
    const {
      wr_id,
    } = getParams(link);
    return Promise.resolve(`http://totoria.org/bbs/download.php?bo_table=javcensored&wr_id=${wr_id}`);
  },
}];

function downloadTorrentFilesWithSite(site, pids) {
  const promises = [];
  const failedPids = [];
  const {
    generateUrl,
    getDownloadLink,
  } = site;
  pids.forEach((pid) => {
    const term = encodeURI(`${pid}`);
    const url = generateUrl(term);
    const promise = fetchText(url)
    .then(html => getDownloadLink(html))
    .then(link => downloadFile(pid, link))
    .catch(() => {
      console.log(`fail, ${pid}`);
      failedPids.push(pid);
    });
    promises.push(promise);
  });
  return Promise.all(promises).then(() => failedPids);
}

module.exports = function downloadTorrentFiles(pids) {
  let previousPromise = Promise.resolve(pids);
  sites.forEach((site) => {
    previousPromise = previousPromise.then((failedPids) => {
      return downloadTorrentFilesWithSite(site, failedPids)
    });
  });
  return previousPromise;
}
