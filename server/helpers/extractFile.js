import APIError from '../util/APIError';

var fs = require('fs');
var parseString = require('xml2js').parseString;
const { unzip } = require('zip-unzip-promise');
const path = require('path');
import File from '../components/file/file.model';

export async function extraFile(data) {
  try {
  if (fs.existsSync(data.file)) {
    const filename = getFile(data.file);
    const dir = path.join(__dirname, `../../${data.file}`);
    const outputPath = path.join(__dirname, `../../${filename}`);
    await unzip(dir, outputPath);
    return await readFileScorm(data.file.split('.')[0], data._id);
  }
  } catch (error) {
    await File.deleteOne({
      _id: data._id
    });
    console.log('error extraFile: ', error);
    throw error;
  }
}

export async function readFileScorm(path, _id) {
  try {
    if (fs.existsSync(`${path}/imsmanifest.xml`)) {
      const data = await readFile(`${path}/imsmanifest.xml`);
      return parseString(data, async function (err, result) {
        if (err) {
          throw err;
        }
        if (result?.manifest?.resources[0]?.resource?.[0]?.['$']?.href) {
          return File.updateOne({
            _id
          }, {
            $set: {
              pathView: `${path}/${result?.manifest?.resources[0]?.resource?.[0]?.['$']?.href}`
            }
          });
        } else {
          return Promise.reject(new APIError(403, [
            {
              msg: 'This is not a valid SCORM file or invalid version',
              param: 'invalidScormFile',
            },
          ]));
        }
      });
    }
    return Promise.reject(new APIError(403, [
      {
        msg: 'This is not a valid SCORM file or invalid version',
        param: 'invalidScormFile',
      },
    ]));
  } catch (error) {
    console.log('error readFileScorm: ', error);
    throw error;
  }
}

async function readFile(path) {
  return new Promise((resolve, reject) => {
    fs.readFile(path, 'utf8', function (err, data) {
      if (err) {
        reject(err);
      }
      resolve(data);
    });
  });
}

function getFile(filePath) {
  return filePath.substr(filePath.lastIndexOf('\\') + 1).split('.')[0];
}
export async function removeFile(file) {
  if (fs.existsSync(file)) {
    await fs.unlinkSync(file);
  }
}
