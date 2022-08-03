import redis from 'redis';
import {
  REDIS_HOST,
  REDIS_PORT,
  REDIS_PASSWORD,
} from '../config';
import logger from './logger';

const client = redis.createClient({
  host: REDIS_HOST,
  port: REDIS_PORT,
  password: REDIS_PASSWORD,
});

client.on('error', (error) => {
  logger.error('Redis client connection error:');
  logger.error(error);
});

client.on('ready', () => {
  logger.info('Redis client connection ready');
});

async function redisSet(key, value) {
  return new Promise((resolve, reject) => {
    client.set(key, value, (error) => {
      if (error) {
        console.error('redisSet error:');
        console.error(error);
        return reject(error);
      }
      return resolve();
    });
  });
}

async function redisSetHm(key, value) {
  return new Promise((resolve, reject) => {
    client.sadd(key, value, (error) => {
      if (error) {
        console.error('redisSetHm error:');
        console.error(error);
        return reject(error);
      }
      return resolve();
    });
  });
}
async function redisSetex(key, value) {
  return new Promise((resolve, reject) => {
    client.setex(key, value, (error) => {
      if (error) {
        console.error('redisSetex error:');
        console.error(error);
        return reject(error);
      }
      return resolve();
    });
  });
}
async function redisExpire(key, time) {
  return new Promise((resolve, reject) => {
    client.expire(key, time, (error) => {
      if (error) {
        console.error('redisExpire error:');
        console.error(error);
        return reject(error);
      }
      return resolve();
    });
  });
}

async function redisGet(key) {
  return new Promise((resolve, reject) => {
    client.get(key, (error, reply) => {
      if (error) {
        logger.error('redisGet error:');
        logger.error(error);
        return reject(error);
      }
      return resolve(reply);
    });
  });
}

async function redisGetHm(key) {
  return new Promise((resolve, reject) => {
    client.smembers(key, (error, reply) => {
      if (error) {
        logger.error('redisGet error:');
        logger.error(error);
        return reject(error);
      }
      return resolve(reply);
    });
  });
}

async function redisDel(key) {
  return new Promise((resolve, reject) => {
    client.del(key, (error, reply) => {
      if (error) {
        logger.error('redisDel error:');
        logger.error(error);
        return reject(error);
      }
      return resolve(reply);
    });
  });
}

async function redisFlushDB() {
  return new Promise((resolve, reject) => {
    client.flushdb((error, reply) => {
      if (error) {
        logger.error('redisFlushDB error:');
        logger.error(error);
        return reject(error);
      }
      return resolve(reply);
    });
  });
}

async function redisScan(cursor, pattern) {
  return new Promise((resolve, reject) => {
    client.scan(cursor, 'MATCH', pattern, (error, reply) => {
      if (error) {
        logger.error('redisScan error:');
        logger.error(error);
        return reject(error);
      }
      return resolve(reply);
    });
  });
}

export default {
  get: redisGet,
  set: redisSet,
  getHm: redisGetHm,
  setHm: redisSetHm,
  expire: redisExpire,
  del: redisDel,
  flushDB: redisFlushDB,
  scan: redisScan,
  update: redisSetex
};
