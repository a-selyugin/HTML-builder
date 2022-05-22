const fs = require('fs');
const path = require('path');

const projDist = path.join(__dirname, 'project-dist');
const stylesFolder = path.join(__dirname, 'styles');
const assetsFolder = path.join(__dirname, 'assets');

//
// Создаем папку, и если она уже есть и не пустая, то удаляем все содержимое, 
// потом выполняем все остальные функции по очереди
//

function main() {
  fs.promises.mkdir(projDist)
    .then(() => {
      console.log(`${projDist} created successfully`);
    }).catch(err => {
      console.log(err);
    }).then(() => buildCss())
    .then(() => recursiveCopy(assetsFolder, 'assets', projDist));
}

//
// Собираем style.css
//

function buildCss() {
  fs.promises.readdir(stylesFolder, { withFileTypes: true })
    .then(filenames => filenames.map(file => checkCss(file, stylesFolder)))
    .then(cssFoldersArr => bundleCss(cssFoldersArr, projDist))
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
  const targetFile = path.join(targetFolder, 'style.css');
  const writeStream = fs.createWriteStream(targetFile);
  for (let i = 0; i < cssArr.length; i += 1) {
    if (cssArr[i]){
      cssExist = true;
      const readStream = fs.createReadStream(cssArr[i], 'utf-8');
      readStream.pipe(writeStream);
    }
  }
  if (cssExist) {
    console.log('Style.css created!');
  } else {
    console.error('CSS files not found!');
  }
}

//
// Рекурсивно копирует папку assets
//


function recursiveCopy(source, sourceFolderName, target) {
  const targetPath = path.join(target, sourceFolderName);
  fs.promises.mkdir(targetPath)
    .then(() => {
      console.log(`${targetPath} created successfully`);
    }).catch(err => {
      console.log(err);
    }).then(() => {
      fs.promises.readdir(source, { withFileTypes: true})
        .then(filenames => {
          filenames.forEach(file => {
            if (file.isDirectory()) {
              const sourceFolder = path.join(source, file.name);
              const newFolder = path.join(targetPath);
              recursiveCopy(sourceFolder, file.name, newFolder);
            }
          });
        });
    })
    .then(() => copyIfFiles(source, targetPath));
} 

function copyIfFiles(source, target) {
  fs.promises.readdir(source, { withFileTypes: true })
    .then(filenames => {
      filenames.forEach(file => {
        if (file.isFile()) {
          const sourceFile = path.join(source, file.name);
          const targetFile = path.join(target, file.name);
          fs.promises.copyFile(sourceFile, targetFile)
            .catch(function(error) {
              console.log(error);
            });
        }
      });
    }).catch(err => console.log(err));
}


fs.promises.rm(projDist, { recursive: true, force: true }, () => {console.log(`${projDist} cleared!`);}).then(() => main());
