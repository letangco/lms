 import * as UserSetting from './userSetting.service';
import { ROOT_PATH, UPLOADS_DESTINATION } from '../../constants';
import { resizeImage } from '../../helpers/resize';
export async function createSetting(req, res, next) {
  try {
    let body = req.body
    if (req.files?.length) {
      req.files.map( file => {
        body[file.fieldname] = `${UPLOADS_DESTINATION}/system/${file.filename}`;
        resizeImage(`${UPLOADS_DESTINATION}/system/${file.filename}`);
      });
    }
    const settings = await UserSetting.updateUserSettings(req?.auth?._id, req.query.type, req.body);
    return res.json({
      success: true,
      payload: settings,
    });
  } catch (error) {
    return next(error);
  }
}

export async function getSetting(req, res, next) {
  try {
    return res.json({
      success: true,
      payload: await UserSetting.getSetting(req.params.type),
    });
  } catch (error) {
    return next(error);
  }
}

export async function getSettingMetaData(req, res, next) {
  try {
    return res.json({
      success: true,
      payload: await UserSetting.getSettingMetaData(),
    });
  } catch (error) {
    return next(error);
  }
}
