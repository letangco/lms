/**
 * The final error handler for api call
 * @param {Error} error the error from prev middleware
 * @param req
 * @param res
 * @param next
 */
import logger from '../util/logger';

// eslint-disable-next-line no-unused-vars
export default function (error, req, res, next) {
  if (!error.statusCode) {
    logger.error(error.stack);
  }
  if (error.code === 'LIMIT_FILE_SIZE') {
    res.status(422).json({
      success: false,
      errors: [
        {
          msg: 'Upload file size is exceeds the file size limit',
          param: error.field,
        },
      ],
    });
    return;
  }
  const statusCode = error.statusCode || 500;
  const payload = statusCode === 500 ? 'Internal server error' : error.errors || error.message || 'Internal server error';
  if (typeof payload === 'string') {
    res.status(statusCode).send(payload);
  } else {
    res.status(statusCode).json({
      success: false,
      errors: payload
    });
  }
}
