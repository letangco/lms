import execa from 'execa';
const path = require('path');
const fs = require('fs');
export async function convertLibs(data) {
  try {
  if (fs.existsSync(data.file)) {
    const filename = getFile(data.file);
    let dir = path.join(__dirname, '../../' + data.file);
    const outputPath = path.join(__dirname, '../../' + filename + data.fileType);
    execa.commandSync(`ffmpeg -i ${dir} ${outputPath}`);
    return checkChangeFormat(data.file);
  }
  } catch (error) {
    console.log("Error convert audio : ", error)
  }
}

function getFile(filePath) {
  return filePath.substr(filePath.lastIndexOf('\\') + 1).split('.')[0];
}
export async function removeFile(file) {
  if (fs.existsSync(file)) {
    await fs.unlinkSync(file);
  }
}

function checkChangeFormat(file){
  file = file.split(".");
  return file[0]+".mp4";
}
