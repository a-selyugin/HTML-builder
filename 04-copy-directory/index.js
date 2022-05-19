const fs = require('fs');
const path = require('path');

const sourceDir = path.join(__dirname, 'files');
const targetDir = path.join(__dirname, 'files-copy');

async function makeDir(path) {
  fs.promises.mkdir(path)
    .then(() => {
      console.log('Directory created successfully');
      return false;
    }).catch(() => {
      console.log('Folder already exists!');
      return true;
    });
}

async function clearDir(target) {
  fs.promises.readdir(target)
    .then(filenames => {
      console.log('Clearing folder');
      filenames.forEach(file => {
        const fileToDelete = path.join(target, file);
        fs.unlink(fileToDelete, () => {});
      });
    });
}

async function copyFiles(source, target) {
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
    });
}

async function main(){
  await makeDir(targetDir);
  await clearDir(targetDir);
  await copyFiles(sourceDir,targetDir);
}

main();
