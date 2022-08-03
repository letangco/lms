const libre = require('libreoffice-convert');
const path = require('path');
const fs = require('fs');
const extend = '.pdf';
export async function convertPDFLibs(data) {
  return new Promise((resolve) => {
    const filename = getFile(data.file)
    let dir = path.join(__dirname, '../../' + data.file)
    const outputPath = path.join(__dirname, '../../' + filename + extend);
    const enterPath = fs.readFileSync(dir);
    libre.convert(enterPath, extend, undefined, async (err, done) => {
      if (err) {
        resolve(data.file)
      }
      fs.writeFileSync(outputPath, done);
      let link = checkChangeFormat(data.file)
      resolve(link)
    });
  })
}
function getFile(filePath) {
  return filePath.substr(filePath.lastIndexOf('\\') + 1).split('.')[0];
}

function checkChangeFormat(file){
  file = file.split(".");
  return file[0]+".pdf";
}
