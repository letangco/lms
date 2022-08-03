import path from 'path';
import multer from 'multer';
import slug from 'limax';
import {
  MAX_CHAT_MESSAGE_UPLOAD_FILE_SIZE_MB,
  MEGABYTE,
  ROOT_PATH,
  UPLOADS_DESTINATION,
} from '../../constants';
import { getCurrentDateString } from '../../helpers/string.helper';
import { mkDir } from '../../helpers/file.helper';

const storageFiles = multer.diskStorage({
  destination: function (req, file, cb) {
    const dest = `${ROOT_PATH}/${UPLOADS_DESTINATION}/${getCurrentDateString()}/chat-message-files`;
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
const limits = { fileSize: MAX_CHAT_MESSAGE_UPLOAD_FILE_SIZE_MB * MEGABYTE };
const uploadFile = multer({
  storage: storageFiles,
  limits: limits,
});

export const messageFileUploader = uploadFile.array('message-files');
