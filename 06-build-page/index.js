const fs = require('fs');
const path = require('path');

const projDist = path.join(__dirname, 'project-dist');
const stylesFolder = path.join(__dirname, 'styles');
const assetsFolder = path.join(__dirname, 'assets');
const componentsFolder = path.join(__dirname, 'components');
const templateHtml = path.join(__dirname, 'template.html');
const indexHtml = path.join(projDist, 'index.html');

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
    .then(() => recursiveCopy(assetsFolder, 'assets', projDist))
    .then(() => createCompArray(componentsFolder));
}

//
// Читаем папку components и добавляем все содержимое HTML в массив объектов
//

// Сперва ищем все файлы компонентов в source, создаем массив объектов с данными о компонентах
function createCompArray (source) {
  fs.readdir(source,
    { withFileTypes: true },
    (err, files) => {
      if (err) console.log(err);
      else {
        const compArray = [];
        files.forEach(file => {
          if (file.isFile()) {
            const fileExt = path.extname(file.name);
            const fileName = file.name.substring(0, file.name.lastIndexOf('.'));
            const filePath = path.join(source, file.name);
            if (fileExt === '.html'){
              fs.readFile(filePath, 
                (err, data) => {
                  if (err) console.log(err);
                  else {
                    const compInstance = {
                      name: fileName,
                      content: data.toString(),
                    };
                    compArray.push(compInstance);
                    processTemplateHTML(compArray);
                  }
                });
            }
          }
        });
      }
    });
}

// Имея массив компонентов, читаем template.html, ищем все упоминания компонентов и вставляем их вместо шаблонных тегов
// и пишем все в файл index.html

function processTemplateHTML(arrayOfComponents){
  const input = fs.createReadStream(templateHtml, 'utf-8');
  const output = fs.createWriteStream(indexHtml);

  input.on('data', chunk => {
    let string = chunk.toString();
    let componentFound;
    do {
      componentFound = false;
      const startOfSubstring = string.indexOf('{{');
      if (startOfSubstring !== -1) {
        const endOfSubstring = string.indexOf('}}', startOfSubstring);
        const componentName = string.substring(startOfSubstring + 2, endOfSubstring).trim();
        const substr = string.substring(startOfSubstring, endOfSubstring + 2);
        for (let i = 0; i < arrayOfComponents.length; i += 1) {
          if (componentName === arrayOfComponents[i].name){
            string = string.replace(substr, arrayOfComponents[i].content);
          }
        }
        componentFound = true;
      }
    } while (componentFound);
    output.write(string);
  });
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
  for (let i = cssArr.length - 1; i >= 0; i -= 1) {
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
    console.log('Style.css created!');
  } else {
    console.error('CSS files not found!');
  }
}

//
// Рекурсивно копируем папку assets
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

// тело функции: удаляем существующую папку poject-dist и создаем запускаем main()
fs.promises.rm(projDist, { recursive: true, force: true }, () => {console.log(`${projDist} cleared!`);}).then(() => main());
