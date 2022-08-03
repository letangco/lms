import path from 'path';
import multer from 'multer';
import slug from 'limax';
import {
  MAX_UPLOAD_FILE_SIZE_MB,
  MEGABYTE,
  ROOT_PATH,
  UPLOADS_DESTINATION,
} from '../../constants';
import { getCurrentDateString } from '../../helpers/string.helper';
import { mkDir } from '../../helpers/file.helper';
import APIError from '../../util/APIError';
export const UploadImageMediumDestination = path.resolve(__dirname, '../../../uploads/medium');
export const UploadImageSmallDestination = path.resolve(__dirname, '../../../uploads/small');

const storageFiles = multer.diskStorage({
  destination: function (req, file, cb) {
    const dest = `${ROOT_PATH}/${UPLOADS_DESTINATION}/${getCurrentDateString()}/course-file`;
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
const limits = { fileSize: MAX_UPLOAD_FILE_SIZE_MB * MEGABYTE };
const uploadFile = multer({
  storage: storageFiles,
  limits: limits,
  fileFilter: function (req, file, cb) {
    const originalName = file.originalname.toLowerCase();
    if (!originalName.match(/\.(ppt|pptx|doc|docx|xls|xlsx|pdf|csv|epub|gz:|sql|gif|jpg|jpeg|png|heic|mp4|webm|ogg|ogv|avi|mpeg|mpg|mov|wmv|3gp|flv|mp3|aac|ogg|wav|mpeg|webm|wave|wma|ra|aif|aiff|zip|swf|ogg|oga|mogg|mp-17|aac|wav|mpeg|webm|wave|wma|ra|aif|aiff)$/)) {
      return cb(new APIError(422, [{
        msg: `File upload is invalid, accepted files (ppt|pptx|doc|docx|xls|xlsx|pdf|csv|epub|gz:|sql|gif|jpg|jpeg|png|heic|mp4|webm|ogg|ogv|avi|mpeg|mpg|mov|wmv|3gp|flv|mp3|aac|ogg|wav|mpeg|webm|wave|wma|ra|aif|aiff|zip|swf|ogg|oga|mogg|mp-17|aac|wav|mpeg|webm|wave|wma|ra|aif|aiff) are allowed, max size: ${ MAX_UPLOAD_FILE_SIZE_MB}MB`,
        param: 'fileUploadInvalid',
        location: 'body',
      }]));
    }
    return cb(null, true);
  },
});

const storageUserFiles = multer.diskStorage({
  destination: function (req, file, cb) {
    const dest = `${ROOT_PATH}/${UPLOADS_DESTINATION}/${getCurrentDateString()}/users-file`;
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
const uploadFileUser = multer({
  storage: storageUserFiles,
  limits: limits,
  fileFilter: function (req, file, cb) {
    const originalName = file.originalname.toLowerCase();
    if (!originalName.match(/\.(ppt|pptx|doc|docx|xls|xlsx|pdf|gif|jpg|jpeg|png|zip|mp4|webm|ogg|ogv|avi|mpeg|mpg|mov|wmv|3gp|flv|mp3|aac|ogg|wav|mpeg|webm|wave|wma|ra|aif|aiff)$/)) {
      return cb(new APIError(422, [{
        msg: `File upload is invalid, accepted files (ppt|pptx|doc|docx|xls|xlsx|pdf|gif|jpg|jpeg|png|zip|mp4|webm|ogg|ogv|avi|mpeg|mpg|mov|wmv|3gp|flv|mp3|aac|ogg|wav|mpeg|webm|wave|wma|ra|aif|aiff) are allowed, max size: ${ MAX_UPLOAD_FILE_SIZE_MB}MB`,
        param: 'fileUploadInvalid',
        location: 'body',
      }]));
    }
    return cb(null, true);
  },
});
export const fileUploader = uploadFile.single('course-file');
export const fileUploaderUser = uploadFileUser.single('users-file');
