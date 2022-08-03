import mongoose from 'mongoose';
import Express from 'express';
import path from 'path';
import app from './api/index';
import {
  SERVER_PORT,
  MONGO_URI,
  USE_EXPRESS_HOST_STATIC_FILE,
} from './config';
import logger from './util/logger';
import createDummyData from '../mongo/createDummyData';
import createInitialData from '../mongo/createInitialData';
import initFolder from './util/InitFolders';
import Redis from './util/Redis';
import { createQueue } from '../rabbitmq';
import Socket from './socket/socket';

initFolder();

(async () => {
  await createQueue();
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    });
    logger.info('Mongodb connected');
    await Redis.flushDB();
    await createDummyData();
    await createInitialData();

    if (USE_EXPRESS_HOST_STATIC_FILE === true) {
      app.use('/uploads', Express.static(path.resolve(__dirname, '../uploads')));
      app.use('/static', Express.static(path.resolve(__dirname, '../static')));
      app.use('/cache', Express.static(path.resolve(__dirname, '../cache')));
      app.use('/resource', Express.static(path.resolve(__dirname, '../resource')));
      app.use('/export', Express.static(path.resolve(__dirname, '../export')));
    }

    const server = app.listen(SERVER_PORT, (error) => {
      if (error) {
        logger.error('Cannot start backend services:');
        logger.error(error);
      } else {
        logger.info(`Backend service is running on port: ${SERVER_PORT}${process.env.NODE_APP_INSTANCE ? ` on core ${process.env.NODE_APP_INSTANCE}` : ''}!`);
      }
    });

    // Run socket on 1 thread
    if ((typeof process.env.NODE_APP_INSTANCE === 'undefined' || process.env.NODE_APP_INSTANCE === '0')) {
      logger.info('SOCKET LISTENING...');
      const socketService = new Socket(server);
      socketService.run();
    }
  } catch (error) {
    logger.error('Please make sure Mongodb is installed and running!');
    logger.error(error);
    throw error;
  }
})();

export default app;
