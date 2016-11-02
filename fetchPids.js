const fetch = require('node-fetch');
const cheerio = require('cheerio');

function fetchText(uri) {
  return fetch(uri)
  .then((response) => response.text());
}

function getIdx(name) {
  return fetchText(`https://hentaku.net/star/${encodeURI(name)}`)
  .then((text) => {
    const idxPattern = /idx=(\d+)/
    const idx = text.match(idxPattern)[1];
    if (!idx) {
      throw new Error("그런 배우 없다.");
    }
    return idx;
  });
}

function fetchTotalPageLength(idx, currentPage = 1) {
  return new Promise((resolve, reject) => {
    fetchText(`https://hentaku.net/data/StarInfo2.php?type=1&idx=${idx}&page=${currentPage}`)
    .then(text => {
      const $ = cheerio.load(text);
      const nextLink = $('.next').attr('href');
      const pagePattern = /page=(\d+)/
      const pageLength = nextLink.match(pagePattern)[1];
      if (currentPage + 10 >= pageLength) {
        return resolve({
          isSuccess: true,
          pageLength,
        });
      } else {
        return resolve({
          isSuccess: false,
          pageLength,
        });
      }
    });
  })
  .then(({isSuccess, pageLength}) => {
    return isSuccess ? pageLength : fetchTotalPageLength(idx, pageLength);
  });
}

function fetchAllProductID(idx, totalPageLength) {
  const promises = [];
  const pids = [];
  for (let i = 1; i <= totalPageLength; i++) {
    const promise = fetchText(`https://hentaku.net/data/StarInfo2.php?type=1&idx=${idx}&page=${i}`)
    .then(text => {
      const $ = cheerio.load(text);
      $('td[id=pid]').each((i, elem) => {
        pids.push($(elem).text());
      });
    });
    promises.push(promise);
  }
  return Promise.all(promises).then(() => pids);
}

module.exports =  function fetchPids(name) {
  return getIdx(name)
  .then(idx => {
    return fetchTotalPageLength(idx)
    .then(totalPageLength => {
      console.log(`totalPageLength : ${totalPageLength}`);
      return fetchAllProductID(idx, totalPageLength);
    });
  });
}
