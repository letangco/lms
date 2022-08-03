import { param, query } from 'express-validator';
import validatorErrorHandler from '../../api/validatorErrorHandler';
import {
  MAX_PAGE_LIMIT,
} from '../../constants';

export const getCourses = [
  query('page')
    .isInt({ min: 1 })
    .withMessage('Page number must be a positive integer'),
  query('rowPerPage')
    .optional()
    .isInt({ min: 1, max: MAX_PAGE_LIMIT })
    .withMessage(`Row per page must be a positive integer not larger than ${MAX_PAGE_LIMIT}`),
  query('textSearch')
    .optional(),
  validatorErrorHandler,
];

export const getCourseUsersReport = [
  param('id').isMongoId().withMessage('Course id is invalid'),
  query('page')
    .isInt({ min: 1 })
    .withMessage('Page number must be a positive integer'),
  query('rowPerPage')
    .optional()
    .isInt({ min: 1, max: MAX_PAGE_LIMIT })
    .withMessage(`Row per page must be a positive integer not larger than ${MAX_PAGE_LIMIT}`),
  validatorErrorHandler,
];

export const getCourse = [
  param('id').isMongoId().withMessage('Course id is invalid'),
  validatorErrorHandler,
];
