import path from 'path';
import multer from 'multer';
import slug from 'limax';
import APIError from '../../util/APIError';
import {
  MAX_COURSE_THUMBNAIL_UPLOAD_FILE_SIZE_MB,
  MAX_COURSE_VIDEO_INTRO_UPLOAD_FILE_SIZE_MB,
  MEGABYTE,
  ROOT_PATH,
  UPLOADS_DESTINATION,
} from '../../constants';
import { getCurrentDateString } from '../../helpers/string.helper';
import { mkDir } from '../../helpers/file.helper';

const storageCourseThumbnail = multer.diskStorage({
  destination: function (req, file, cb) {
    const dest = `${ROOT_PATH}/${UPLOADS_DESTINATION}/${getCurrentDateString()}/course-thumbnail`;
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
const limits = { fileSize: MAX_COURSE_THUMBNAIL_UPLOAD_FILE_SIZE_MB * MEGABYTE };
const uploadCourseThumbnail = multer({
  storage: storageCourseThumbnail,
  limits: limits,
  fileFilter: function (req, file, cb) {
    const originalName = file.originalname.toLowerCase();
    if (!originalName.match(/\.(jpg|jpeg|png|gif|ico)$/)) {
      return cb(new APIError(422, [{
        msg: `Course thumbnail is invalid, only image files (.jpg, .jpeg, .png, .gif, .ico) are allowed, max size: ${MAX_COURSE_THUMBNAIL_UPLOAD_FILE_SIZE_MB}MB`,
        param: 'courseThumbnailInvalid',
        location: 'body',
      }]));
    }
    return cb(null, true);
  },
});
export const courseThumbnailUploader = uploadCourseThumbnail.single('course-thumbnail');

const storageCourseVideoIntro = multer.diskStorage({
  destination: function (req, file, cb) {
    const dest = `${ROOT_PATH}/${UPLOADS_DESTINATION}/${getCurrentDateString()}/course-video-intro`;
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
const videoIntroLimits = { fileSize: MAX_COURSE_VIDEO_INTRO_UPLOAD_FILE_SIZE_MB * MEGABYTE };
const uploadCourseVideoIntro = multer({
  storage: storageCourseVideoIntro,
  limits: videoIntroLimits,
  fileFilter: function (req, file, cb) {
    const originalName = file.originalname.toLowerCase();
    if (!originalName.match(/\.(mp4)$/)) {
      return cb(new APIError(422, [{
        msg: `Course video intro is invalid, only mp4 files (.mp4) are allowed, max size: ${MAX_COURSE_VIDEO_INTRO_UPLOAD_FILE_SIZE_MB}MB`,
        param: 'courseVideoIntroInvalid',
        location: 'body',
      }]));
    }
    return cb(null, true);
  },
});
export const courseVideoIntroUploader = uploadCourseVideoIntro.single('course-video-intro');
