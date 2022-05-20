const fs = require('fs');
const path = require('path');

const sourceDir = path.join(__dirname, 'files');
const targetDir = path.join(__dirname, 'files-copy');

function copyFilesToDir(sourcePath, targetPath, copyFunc) {
  fs.promises.mkdir(targetPath)
    .then(() => {
      console.log('Directory created successfully');
    }).catch(() => {
      console.log('Folder already exists! Clearing!');
      clearDir(targetPath);
    }).then(() => copyFunc(sourcePath, targetPath));
}

function clearDir(target) {
  fs.promises.readdir(target)
    .then(filenames => {
      console.log('Folder cleared');
      filenames.forEach(file => {
        const fileToDelete = path.join(target, file);
        fs.unlink(fileToDelete, () => {});
      });
    }).catch(err => console.log(err));
  
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

copyFilesToDir(sourceDir, targetDir, copyFiles);
