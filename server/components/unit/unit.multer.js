import path from 'path';
import multer from 'multer';
import slug from 'limax';
import {
  MAX_UPLOAD_FILE_SIZE_BYTE,
  ROOT_PATH,
  UPLOADS_DESTINATION,
} from '../../constants';
import { getCurrentDateString } from '../../helpers/string.helper';
import { mkDir } from '../../helpers/file.helper';

const storageUnitCourse = multer.diskStorage({
  destination: function (req, file, cb) {
    const dest = `${ROOT_PATH}/${UPLOADS_DESTINATION}/${getCurrentDateString()}/unit-course`;
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
const limits = { fileSize: MAX_UPLOAD_FILE_SIZE_BYTE };
const uploadUnitCourse = multer({
  storage: storageUnitCourse,
  limits: limits,
  fileFilter: function (req, file, cb) {
    return cb(null, true);
  },
});
export const unitCourseUploader = uploadUnitCourse.single('unit-course');
