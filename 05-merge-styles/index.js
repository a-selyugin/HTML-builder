const fs = require('fs');
const path = require('path');

const sourceDir = path.join(__dirname, 'styles');
const targetDir = path.join(__dirname, 'project-dist');

function buildCss(stylesFolder, bundleFolder) {
  fs.promises.readdir(stylesFolder, { withFileTypes: true })
    .then(filenames => filenames.map(file => checkCss(file, stylesFolder)))
    .then(cssFoldersArr => bundleCss(cssFoldersArr, bundleFolder))
    .catch(err => console.log(err));
}

// проверяет, является ли данный файл CSS, если да, то возвращаем его путь
function checkCss(cssFile, directoryName) {
  if (cssFile.isFile) {
    const fileExt = path.extname(cssFile.name);
    if (fileExt === '.css') {
      const fileToRead = path.join(directoryName, cssFile.name);
      return fileToRead;
    }
  }
}

function bundleCss(cssArr, targetFolder) {
  let cssExist = false;
  const targetFile = path.join(targetFolder, 'bundle.css');
  const writeStream = fs.createWriteStream(targetFile);
  for (let i = 0; i < cssArr.length; i += 1) {
    if (cssArr[i]){
      cssExist = true;
      const readStream = fs.createReadStream(cssArr[i], 'utf-8');
      readStream.on('data', chunk => {
        writeStream.write(chunk);
        writeStream.write('\n');
      });
    }
  }
  
  if (cssExist) {
    console.log('Bundle created!');
  } else {
    console.error('CSS files not found!');
  }
}

buildCss(sourceDir, targetDir);