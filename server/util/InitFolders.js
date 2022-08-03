import execa from 'execa';
import logger from './logger';
import { USER_AVATAR_DESTINATION } from '../components/user/user.multer';
import { mkDir } from '../helpers/file.helper';

const path = require('path');
const fs = require('fs');

const RELEASE_PATH = path.resolve(__dirname, '../../release');

export function initUploadFolders() {
  try {
    mkDir(USER_AVATAR_DESTINATION);
  } catch (error) {
    logger.error('initUserAvatarFolder error');
    logger.error(error.message);
  }
}

export function initFolderRelease() {
  try {
    if (!fs.existsSync(RELEASE_PATH)) {
      execa.commandSync(`mkdir -p ${RELEASE_PATH}`);
    }
  } catch (error) {
    logger.error('initFolderRelease error');
    logger.error(error.message);
  }
}

export default function initFolder() {
  try {
    initUploadFolders();
    initFolderRelease();
  } catch (error) {
    logger.error('initFolder error');
    logger.error(error.message);
  }
}
