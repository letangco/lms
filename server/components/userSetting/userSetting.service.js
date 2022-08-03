import UserSetting from './userSetting.model';
import Zoom from '../zoom/zoomConfig.model';
import logger from '../../util/logger';
import APIError from '../../util/APIError';
import {
  ROOM_CLIENT_TITLE,
  ROOM_FAVICON,
  ROOM_LOGO,
  ROOM_MOBILE_LOGO,
  ROOM_PLAYBACK_COPYRIGHT,
  ROOM_PLAYBACK_LOGO,
  ROOM_PRE_SLIDE,
  ROOM_WELCOME_MESSAGE,
  UPLOAD_GET_HOST,
} from '../../config';
/**
 * Update user settings for room
 * @param userId User id
 * @param settings
 * @param settings.playbackLogo
 * @param settings.playbackCopyright
 * @param settings.mobileLogo
 * @param settings.clientTitle
 * @param settings.favicon
 * @param settings.logo
 * @param settings.welcome
 * @param settings.preSlide
 * @returns {Promise.<*>} Return avatar url or an APIError
 */
export async function updateUserSettings(user, key, data) {
  if (!user) {
    return Promise.reject(new APIError(404, 'User not found'));
  }
  if (!key) {
    return Promise.reject(new APIError(404, 'Key config not found'));
  }
  try {
    switch (key) {
      case 'BASIC_SETTING':
        await this.updateBasicSetting(user, data);
        break;
      default:
        await UserSetting.updateOne({ user, key }, { $set: { value: data }}, { upsert: true });
        break;
    }
    return true;
  } catch (error) {
    logger.error(`UserSetting updateUserSettings error: ${error}`);
    throw error;
  }
}

export async function updateBasicSetting(user, data) {
  try {
    Object.keys(data).map(async (key) => {
      const value = data[key];
      await UserSetting.updateOne({ user, key }, { $set: { value } }, { upsert: true });
    });

    return true;
  } catch (error) {
    logger.error(`UserSetting updateBasicSetting error: ${error}`);
    throw error;
  }
}

export async function createSetting(user, key, data) {
  if (!user) {
    return Promise.reject(new APIError(404, 'User not found'));
  }
  try {
    switch (key.type) {
      case 'BASIC_SETTING':
        await this.updateBasicSetting(user, data);
        break;
      default:
        await UserSetting.updateOne({ user, key }, { $set: { value: data } }, { upsert: true });
        break;
    }
    return true;
  } catch (error) {
    logger.error(`UserSetting updateUserSettings error: ${error}`);
    throw error;
  }
}
export async function getSetting(type) {
  if (!type) {
    return Promise.reject(new APIError(404, 'Type not found'));
  }
  try {
    switch (type) {
      case 'BASIC_SETTING':
        return await this.getBasicSetting();
      default:
        return await UserSetting.findOne({
          key: type
        });
    }
  } catch (error) {
    logger.error(`UserSetting getSetting error: ${error}`);
    throw error;
  }
}
export async function getSettingMetaData() {
  try {
    return await UserSetting.find({
      key: { $in: ['name', 'description', 'logo', 'favicon', 'timezone', 'banner'] }
    });
  } catch (error) {
    logger.error(`UserSetting getSettingMetaData error: ${error}`);
    throw error;
  }
}

export async function getBasicSetting() {
  try {
    return await UserSetting.find({
      key: { $in: ['name', 'description', 'logo', 'favicon', 'conferences', 'bbb', 'timezone', 'banner'] }
    });
  } catch (error) {
    logger.error(`UserSetting getBasicSetting error: ${error}`);
    throw error;
  }
}

export async function getUserSetting(conditions) {
  return UserSetting.findOne(conditions);
}

export async function addZoom(conditions) {
  return UserSetting.findOne(conditions);
}

export async function checkTokenZoomWebHook(token) {
  return !!await Zoom.findOne({
    'zoom_webhook': token
  }).lean();
}

export function validateUserSetting(settings) {
  if (!settings) {
    settings = {};
  }
  const logo = settings.logo ? `${UPLOAD_GET_HOST}/${settings.logo}` : ROOM_LOGO;
  const mobileLogo = settings.mobileLogo ? `${UPLOAD_GET_HOST}/${settings.mobileLogo}` : ROOM_MOBILE_LOGO;
  const favicon = settings.favicon ? `${UPLOAD_GET_HOST}/${settings.favicon}` : ROOM_FAVICON;
  const playbackLogo = settings.playbackLogo ? `${UPLOAD_GET_HOST}/${settings.playbackLogo}` : ROOM_PLAYBACK_LOGO;
  const preSlide = settings.preSlide ? `${UPLOAD_GET_HOST}/${settings.preSlide}` : ROOM_PRE_SLIDE;
  const clientTitle = settings.clientTitle ? `${settings.clientTitle} - ${ROOM_CLIENT_TITLE}` : ROOM_CLIENT_TITLE;
  const playbackCopyright = settings.playbackCopyright ? `${settings.playbackCopyright} - ${ROOM_PLAYBACK_COPYRIGHT}` : ROOM_PLAYBACK_COPYRIGHT;
  const defaultWelcome = `
        ${ROOM_WELCOME_MESSAGE}
        <br/>
  `;
  const welcome = settings.welcome
    ? `${defaultWelcome}<br/><br/>${settings.welcome}`
    : defaultWelcome;
  return {
    logo: logo,
    mobileLogo: mobileLogo,
    favicon: favicon,
    playbackLogo: playbackLogo,
    preSlide: preSlide,
    clientTitle: clientTitle,
    playbackCopyright: playbackCopyright,
    welcome: welcome,
  };
}
