const fs = require('fs');
const path = require('path');

const { stdout } = process;

const fileDir = path.join(__dirname, 'text.txt');
const readStream = fs.createReadStream(fileDir, 'utf-8');

readStream.on('data', chunk => stdout.write(chunk));
readStream.on('error', error => console.log('Error', error.message));