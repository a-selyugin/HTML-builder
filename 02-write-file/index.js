const fs = require('fs');
const path = require('path');
const readline = require('readline');

const { stdin: input, stdout: output } = process;
const fileDir = path.join(__dirname, 'output.txt');

const writeStream = fs.createWriteStream(fileDir);
const rl = readline.createInterface({ input, output });

output.write('Привет! Начинай вводить текст :) \n');
rl.on('line', input => {
  if (input === 'exit') {
    output.write('Заканчиваем процесс, спасибо!');
    rl.close();
  } else {
    writeStream.write(input + '\n');
  }
});
rl.on('SIGINT', () => {
  output.write('Заканчиваем процесс, спасибо!');
  rl.close();
});