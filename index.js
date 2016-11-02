const name = process.argv[2];
const fetchPids = require('./fetchPids');
const fetchMagnets = require('./fetchMagnets');
const downloadTorrentFiles = require('./downloadTorrentFiles');
fetchPids(name)
.then(pids => {
  console.log(pids);
  return fetchMagnets(pids);
})
.then(({failedPids}) => {
  console.log('failed pids in magnet');
  console.log(failedPids);
  return downloadTorrentFiles(failedPids);
})
.then(({failedPids}) => {
  console.log('failed pids in torrent file');
  console.log(failedPids);
})
.catch(err => console.log(err));
