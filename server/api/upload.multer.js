import path from 'path';
import multer from 'multer';
import slug from 'limax';
import APIError from '../util/APIError';
import {
  MAX_UPLOAD_FILE_SYSTEM_SIZE_MB,
  MEGABYTE,
  ROOT_PATH,
  UPLOADS_DESTINATION,
} from '../constants';
import { mkDir } from '../helpers/file.helper';

const storageSystem = multer.diskStorage({
  destination: function (req, file, cb) {
    const dest = `${ROOT_PATH}/${UPLOADS_DESTINATION}/system`;
    mkDir(dest);
    cb(null, dest);
  },
  filename: async function (req, file, cb) {
    const originalName = file.originalname;
    const fileExtension = path.extname(originalName) || '';
    const slugName = slug(path.basename(file.originalname, fileExtension), { lowercase: true });
    const finalName = `${slugName}-${Date.now()}${fileExtension}`;
    cb(null, finalName);
  }
});
const limits = { fileSize: MAX_UPLOAD_FILE_SYSTEM_SIZE_MB * MEGABYTE };
const uploadSystem = multer({
  storage: storageSystem,
  limits: limits,
  fileFilter: function (req, file, cb) {
    const originalName = file.originalname.toLowerCase();
    if (!originalName.match(/\.(jpg|jpeg|png|gif|ico|svg)$/)) {
      return cb(new APIError(422, [{
        msg: `Image is invalid, only image files (.jpg, .jpeg, .png, .gif, .ico, .svg) are allowed, max size: ${MAX_UPLOAD_FILE_SYSTEM_SIZE_MB}MB`,
        param: 'uploadSystem',
        location: 'body',
      }]));
    }
    return cb(null, true);
  },
});
export const uploadMulter = uploadSystem.any();
