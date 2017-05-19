const open = require('open');
const fs = require('fs');

const magnetFolder = 'magnet';
let timer = 0;
fs.readdir(magnetFolder, (err, files) => {
  files.forEach(file => {
    console.log(file);
    if (file === '.' || file === '..') {
      return;
    }
    setTimeout(() => {
      fs.readFile(`${magnetFolder}/${file}`, (err, data) => {
        if (err) throw err;
        open(data.toString());
      });
    }, timer);
    timer += 100;
  });
});
