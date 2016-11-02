const open = require('open');
const fs = require('fs');

const magnetFolder = 'magnet';
fs.readdir(magnetFolder, (err, files) => {
  files.forEach(file => {
    console.log(file);
    if (file === '.' || file === '..') {
      return;
    }
    fs.readFile(`${magnetFolder}/${file}`, (err, data) => {
      if (err) throw err;
      open(data.toString());
    });
  });
});
