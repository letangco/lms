import AMPQ from '../../rabbitmq/ampq';
import * as SendMailWorker from './SendMailWorker';
import * as RoomHookWorker from './roomHook.worker';
import * as ConvertMediaWorker from './convertMedia';
import logger from '../../server/util/logger';

export async function createWorkers() {
  try {
    await AMPQ.initChannel();
    // Run workers here
    SendMailWorker.run();
    ConvertMediaWorker.run();
    if (typeof process.env.NODE_APP_INSTANCE === 'undefined' || process.env.NODE_APP_INSTANCE === '0') {
      // Run only one worker
      RoomHookWorker.run();
    }
    return true;
  } catch (error) {
    logger.error('AMPQ: createWorkers initChannel error:');
    logger.error(error);
    throw error;
  }
}
