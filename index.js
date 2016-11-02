const name = process.argv[2];
const fetchPids = require('./fetchPids');

fetchPids(name)
.then(pids => {
  console.log(pids);
})
.catch(err => console.log(err));
