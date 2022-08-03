import { validationResult } from 'express-validator';
import logger from '../util/logger';
/**
 * @swagger
 * definitions:
 *   ValidatorErrorItem:
 *     type: object
 *     properties:
 *       value:
 *         type: string
 *         description: The value got on request
 *       msg:
 *         type: string
 *         description: The error message
 *       param:
 *         type: string
 *         description: The key of value
 *       location:
 *         type: string
 *         description: The location of value
 */

/**
 * @swagger
 * definitions:
 *   ValidatorError:
 *     type: object
 *     properties:
 *       success:
 *         type: boolean
 *       errors:
 *         type: array
 *         items:
 *           $ref: "#/definitions/ValidatorErrorItem"
 */
export default function validatorErrorHandler(req, res, next) {
  // Finds the validation errors in this request
  // and wraps them in an object with handy functions
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const arrayErrors = Object.values(errors.mapped());
    arrayErrors.forEach((error) => {
      const msg = error.msg;
      if (typeof msg === 'string') {
        error.msg = res.__(error.msg) || error.msg;
      } else if (msg instanceof Array) {
        try {
          error.msg = res.__(error.msg[0], ...error.msg[1]) || error.msg;
        } catch (e) {
          logger.error('validatorErrorHandler set language failed:');
          logger.error(error.msg);
          logger.error(e);
        }
      }
      error.msg = res.__(error.msg) || error.msg;
    });
    return res.status(422).json({
      success: false,
      errors: arrayErrors,
    });
  }
  return next();
}
