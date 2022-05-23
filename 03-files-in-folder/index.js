const fs = require('fs');
const path = require('path');
const { readdir, stat } = fs;
const fileDir = path.join(__dirname, 'secret-folder');

readdir(fileDir,
  { withFileTypes: true },
  (err, files) => {
    if (err)
      console.log(err);
    else {
      files.forEach(file => {
        if (file.isFile()){
          const fileName = file.name.substring(0, file.name.lastIndexOf('.'));
          const fileExt = path.extname(file.name).substring(1);
          stat(path.join(fileDir, file.name), (err,stats) => {
            if (err) {
              console.log(err);
            } else {
              const fileSize = (stats.size / 1024).toFixed(3) + 'kb';
              console.log(fileName, '-', fileExt, '-', fileSize);
            }
          });
        }
      });
    }
  }); 
