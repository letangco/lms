/**
 * Run the scripts to create dummy data
 * @returns {Promise<boolean>}
 */
import logger from '../server/util/logger';

export default async function createDummyData() {
  try {
    if (process.env.NODE_ENV === 'production') {
      return true;
    }
    // Todo: run your scripts to create dummy data
    logger.info('createDummyData done');
    return true;
  } catch (error) {
    logger.error('createDummyData error:');
    logger.error(error);
    throw error;
  }
}
