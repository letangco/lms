import sharp from 'sharp';
import { promisify } from 'util';
import { getFileName, getPathWithoutName, getDimensions } from './file.helper';
import { IMAGE_DIMENSION } from '../constants';
const sizeOf = promisify(require('image-size'));
import { UPLOAD_GET_HOST } from '../config';
const fs = require('fs')
export const resizeImage = async (e) => {
  try {
    const dimensions = await sizeOf(e);
    const filename = getFileName(e);
    const path = getPathWithoutName(e);
    IMAGE_DIMENSION.map(item => {
      if (dimensions.width > item) {
        const dimension = getDimensions(dimensions, item);
        sharp(e)
          .resize(parseInt(dimension.width), parseInt(dimension.height))
          .toFile(`${path}/${dimension.width}-${filename}`);
      }
    });
  } catch (error) {
    console.log('error resizeimage: ', error)
  }
}
export function getImageSize(e){
  try {
    const result = {};
    const filename = getFileName(e);
    const path = getPathWithoutName(e);
    IMAGE_DIMENSION.map(async item => {
      const pathNew = `${path}/${item}-${filename}`;
      if (fs.existsSync(pathNew)) {
        result[item] = `${UPLOAD_GET_HOST}/${pathNew}`;
      }
    });
    result.root = `${UPLOAD_GET_HOST}/${e}`;
    return result;
  } catch (error) {
    console.log('error resizeimage: ', error);
  }
}
