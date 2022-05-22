const fs = require('fs');
const path = require('path');

const sourceDir = path.join(__dirname, 'files');
const targetDir = path.join(__dirname, 'files-copy');

function copyFilesToDir(sourcePath, targetPath, copyFunc) {
  fs.promises.mkdir(targetPath)
    .then(() => {
      console.log('Directory created successfully');
    }).catch((err) => {
      console.log(err);
    }).then(() => copyFunc(sourcePath, targetPath));
}

function copyFiles(source, target) {
  fs.promises.readdir(source, { withFileTypes: true })
    .then(filenames => {
      filenames.forEach(file => {
        if (file.isFile) {
          const sourceFile = path.join(source, file.name);
          const targetFile = path.join(target, file.name);
          fs.promises.copyFile(sourceFile, targetFile)
            .catch(function(error) {
              console.log(error);
            });
        }
      });
      console.log('All files copied!');
    }).catch(err => console.log(err));
}

fs.promises.rm(targetDir, { recursive: true, force: true }, () => {})
  .then(() => {copyFilesToDir(sourceDir, targetDir, copyFiles);});