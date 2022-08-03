/**
 * The main config file
 */
import logger from './util/logger';

export const SERVER_PORT = process.env.SERVER_PORT;
let serverOrigin = process.env.SERVER_ORIGIN || '*';
try {
  serverOrigin = JSON.parse(serverOrigin);
} catch (e) {
  logger.info(`Server Origin is ${serverOrigin}`);
}
export const CORS_OPTIONS = {
  // Find and fill your options here: https://github.com/expressjs/cors#configuration-options
  origin: serverOrigin,
  methods: 'GET,PUT,POST,DELETE',
  allowedHeaders: 'Origin,X-Requested-With,Content-Type,Accept,Authorization,Accept-Language,Role',
};
export const API_DOCS_HOST = process.env.API_DOCS_HOST;
export const UPLOAD_GET_HOST = process.env.UPLOAD_GET_HOST;
export const USE_EXPRESS_HOST_STATIC_FILE = process.env.USE_EXPRESS_HOST_STATIC_FILE === 'true';

export const MONGO_URI = process.env.MONGO_URI;
export const REDIS_HOST = process.env.REDIS_HOST;
export const REDIS_PORT = process.env.REDIS_PORT;
export const REDIS_PASSWORD = process.env.REDIS_PASSWORD;
export const RABBITMQ_URI = process.env.RABBITMQ_URI;
export const RABBITMQ_PREFIX = process.env.RABBITMQ_PREFIX; // Use to prevent queue name duplicated
export const ELASTIC_SEARCH_HOST = process.env.ELASTIC_SEARCH_HOST;

export const USER_JWT_SECRET_KEY = process.env.USER_JWT_SECRET_KEY;

export const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
export const SENDGRID_VERIFY_KEY = process.env.SENDGRID_VERIFY_KEY;
export const SENDER_EMAIL = process.env.SENDER_EMAIL;
export const SENDER_NAME = process.env.SENDER_NAME;
export const SUPER_ADMIN = {
  FIRST_NAME: process.env.SUPER_ADMIN_FIRST_NAME,
  LAST_NAME: process.env.SUPER_ADMIN_LAST_NAME,
  USERNAME: process.env.SUPER_ADMIN_USERNAME,
  EMAIL: process.env.SUPER_ADMIN_EMAIL,
};
export const CLIENT_HOST = process.env.CLIENT_HOST;

export const ROOM_ENDPOINT = process.env.ROOM_ENDPOINT;
export const ROOM_SECRET = process.env.ROOM_SECRET;
export const ROOM_ORIGIN_VERSION = process.env.ROOM_ORIGIN_VERSION;
export const ROOM_ORIGIN_SERVER_NAME = process.env.ROOM_ORIGIN_SERVER_NAME;
export const ROOM_HOOK_CALLBACK_URL = process.env.ROOM_HOOK_CALLBACK_URL;
export const ROOM_HOOK_RECORDED_CALLBACK_URL = process.env.ROOM_HOOK_RECORDED_CALLBACK_URL;
export const ROOM_LOGOUT_BASE_URL = process.env.ROOM_LOGOUT_BASE_URL;
export const ROOM_FRONTEND_SHARE_URL = process.env.ROOM_FRONTEND_SHARE_URL;
export const ROOM_ENDPOINTS = JSON.parse(process.env.ROOM_ENDPOINTS || '[]');
export const ROOM_LOGO = process.env.ROOM_LOGO;
export const ROOM_MOBILE_LOGO = process.env.ROOM_MOBILE_LOGO;
export const ROOM_CLIENT_TITLE = process.env.ROOM_CLIENT_TITLE;
export const ROOM_FAVICON = process.env.ROOM_FAVICON;
export const ROOM_PLAYBACK_LOGO = process.env.ROOM_PLAYBACK_LOGO;
export const ROOM_PLAYBACK_COPYRIGHT = process.env.ROOM_PLAYBACK_COPYRIGHT;
export const ROOM_PRE_SLIDE = process.env.ROOM_PRE_SLIDE;
export const ROOM_WELCOME_MESSAGE = process.env.ROOM_WELCOME_MESSAGE;
