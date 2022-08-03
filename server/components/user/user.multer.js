import path from 'path';
import multer from 'multer';
import slug from 'limax';
import APIError from '../../util/APIError';
import {
  MAX_USER_AVATAR_UPLOAD_FILE_SIZE_MB,
  MEGABYTE,
  ROOT_PATH,
  UPLOADS_DESTINATION,
} from '../../constants';
import { getCurrentDateString } from '../../helpers/string.helper';
import { mkDir } from '../../helpers/file.helper';

const storageUserAvatar = multer.diskStorage({
  destination: function (req, file, cb) {
    const dest = `${ROOT_PATH}/${UPLOADS_DESTINATION}/${getCurrentDateString()}/user-avatar/${req.auth._id}`;
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
const limits = { fileSize: MAX_USER_AVATAR_UPLOAD_FILE_SIZE_MB * MEGABYTE };
const uploadUserAvatar = multer({
  storage: storageUserAvatar,
  limits: limits,
  fileFilter: function (req, file, cb) {
    const originalName = file.originalname.toLowerCase();
    if (!originalName.match(/\.(jpg|jpeg|png|gif|ico)$/)) {
      return cb(new APIError(422, [{
        msg: `User avatar file is invalid, only image files are allowed, max size: ${MAX_USER_AVATAR_UPLOAD_FILE_SIZE_MB}MB`,
        param: 'userAvatarInvalid',
        location: 'body',
      }]));
    }
    return cb(null, true);
  },
});
export const userProfileUploader = uploadUserAvatar.single('user-avatar');
