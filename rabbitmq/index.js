import AMPQ from './ampq';
import {
  WORKER_NAME,
} from '../server/constants';
import logger from '../server/util/logger';

export async function createQueue() {
  try {
    await AMPQ.initChannel();
    AMPQ.initQueue(WORKER_NAME.SEND_MAIL);
    AMPQ.initQueue(WORKER_NAME.CONVERT_MEDIA);
    AMPQ.initQueue(WORKER_NAME.ROOM_HOOK);
    AMPQ.initQueue(WORKER_NAME.ROOM_RECORDED_HOOK);
    logger.info('AMPQ queue initialized');
    return true;
  } catch (error) {
    logger.error('AMPQ: createQueue initChannel error:');
    logger.error(error);
    throw error;
  }
}
