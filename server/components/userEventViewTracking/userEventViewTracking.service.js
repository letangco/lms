import UserEventViewTracking from './userEventViewTracking.model';
import logger from '../../util/logger';

/**
 * Create user event view tracking
 * @param data
 * @param data.event
 * @param data.user
 * @param data.internalMeetingId
 * @param data.timeJoined
 * @param data.timeLeft
 * @param data.duration
 * @returns {Promise.<*>}
 */
export async function createUserEventViewTracking(data) {
  try {
    await UserEventViewTracking.create(data);
    return true;
  } catch (error) {
    logger.error(`UserEventViewTrackingService createUserEventViewTracking error: ${error}`);
    throw error;
  }
}

export async function deleteUserEventViewTrackingByConditions(conditions) {
  try {
    await UserEventViewTracking.deleteMany(conditions);
    return true;
  } catch (error) {
    logger.error(`UserEventViewTrackingService deleteUserEventViewTrackingByConditions error: ${error}`);
    throw error;
  }
}
