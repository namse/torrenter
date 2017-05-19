const name = process.argv[2];
const fetchPids = require('./fetchPids');
const fetchMagnets = require('./fetchMagnets');
const downloadTorrentFiles = require('./downloadTorrentFiles');
fetchPids(name)
.then(pids => {
  console.log(`product id total number : ${pids.length}`);
  return downloadTorrentFiles(pids);
})
.then((failedPids) => {
  return fetchMagnets(failedPids);
})
.then(({failedPids}) => {
  console.log(`failed pid total number : ${failedPids.length}`);
  console.log(failedPids);
})
.catch(err => console.log(err));
