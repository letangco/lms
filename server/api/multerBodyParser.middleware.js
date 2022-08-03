import logger from '../util/logger';

/**
 * Use to parse the data from the formData into request body
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
export function multerBodyParser(req, res, next) {
  try {
    req.body = req.body?.data ? JSON.parse(req.body.data) : {};
    return next();
  } catch (error) {
    logger.error('multerBodyParser error:', error);
    throw error;
  }
}

/**
 * Set the timeout for request
 * https://stackoverflow.com/questions/45910084/ajax-neterr-empty-response-after-waiting-for-response-for-2-mins-node-js-ser
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
export function removeExpressRequestTimeout(req, res, next) {
  req.setTimeout(0);
  next();
}
