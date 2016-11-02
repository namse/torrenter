const name = process.argv[2];
const fetchPids = require('./fetchPids');
const fetchMagnets = require('./fetchMagnets');
fetchPids(name)
.then(pids => {
  console.log(pids);
  return fetchMagnets(pids);
})
.then(magnets => {
  console.log(magnets);
})
.catch(err => console.log(err));
