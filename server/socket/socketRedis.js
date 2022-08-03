/**
 * Entry point for socket
 *
 */
import SocketIO from 'socket.io';
import redisAdapter from 'socket.io-redis';

import { REDIS_HOST, REDIS_PORT } from '../config';
import ChatNamespace from './chat/chat.namespace';
import logger from '../util/logger';

export default class SocketRedis {
  static chatNamespace;

  constructor(httpServer) {
    const io = new SocketIO(httpServer, { transports: ['websocket', 'polling'] });
    io.adapter(redisAdapter({ host: REDIS_HOST, port: REDIS_PORT }));
    this.io = io;
  }

  run() {
    const chatNamespace = new ChatNamespace(this.io);
    chatNamespace.run();
    SocketRedis.chatNamespace = chatNamespace;
    logger.info('Socket Redis is running...');
  }
}

