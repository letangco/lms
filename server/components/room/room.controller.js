import * as RoomService from './room.service';
import { WORKER_NAME } from '../../constants';
import AMPQ from '../../../rabbitmq/ampq';
/**
 * Get room join url
 * @returns {Promise.<*>}
 */
export async function getJoinUrl(req, res, next) {
  try {
    const user = req.auth;
    const {
      id,
    } = req.params;
    const {
      accessCode,
    } = req.query;
    const result = await RoomService.getUserEventJoinUrl(user, id, {
      accessCode: accessCode,
    });
    return res.json({
      success: true,
      payload: result,
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * Hook for event during meeting
 * @returns {Promise.<*>}
 */
export async function callRoomHook(req, res, next) {
  try {
    AMPQ.sendDataToQueue(WORKER_NAME.ROOM_HOOK, req.body);
    return res.json(true);
  } catch (error) {
    return next(error);
  }
}

/**
 * Hook for event rap-publish-ended
 * @returns {Promise.<*>}
 */
export async function callRoomRecordedHook(req, res, next) {
  try {
    AMPQ.sendDataToQueue(WORKER_NAME.ROOM_RECORDED_HOOK, req.body);
    return res.json(true);
  } catch (error) {
    return next(error);
  }
}
