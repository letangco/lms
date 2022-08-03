import mongoose from 'mongoose';
import { createWorkers } from './workers/index';
import logger from '../server/util/logger';
import { MONGO_URI } from '../server/config';

(async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true,
    });
    logger.info('Mongodb connected');
  } catch (error) {
    logger.error('Please make sure Mongodb is installed and running!');
    throw error;
  }
})();
createWorkers().then(() => {
  logger.info('Worker is running');
}).catch((error) => {
  logger.error('Worker start failed:');
  logger.error(error);
});
