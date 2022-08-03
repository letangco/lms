import { param, body, query } from 'express-validator';
import validatorErrorHandler from '../../api/validatorErrorHandler';
import {
  MAX_PAGE_LIMIT, SESSION_USER_ATTENDANCE,
  SESSION_USER_GRADE_STATUS,
} from '../../constants';

export const deleteSessionUser = [
  param('id').isMongoId().withMessage('Session user id is invalid'),
  validatorErrorHandler,
];

export const getSessionUser = [
  param('id').isMongoId().withMessage('Session user id is invalid'),
  validatorErrorHandler,
];

export const createSessionUser = [
  body('session').isMongoId().withMessage('Session id is invalid'),
  body('user').isMongoId().withMessage('User id is invalid'),
  body('unit').isMongoId().withMessage('Unit id is invalid'),
  validatorErrorHandler,
];

export const registrySessionUser = [
  body('session').isMongoId().withMessage('Session id is invalid'),
  body('unit').isMongoId().withMessage('Unit id is invalid'),
  validatorErrorHandler,
];

export const removeRegistrySessionUser = [
  param('id').isMongoId().withMessage('Session user id is invalid'),
  validatorErrorHandler,
];

export const getSessionUsers = [
  param('id')
    .isMongoId()
    .withMessage('Session id is invalid'),
  query('page')
    .isInt({ min: 1 })
    .withMessage('Page number must be a positive integer'),
  query('rowPerPage')
    .optional()
    .isInt({ min: 1, max: MAX_PAGE_LIMIT })
    .withMessage(`Row per page must be a positive integer not larger than ${MAX_PAGE_LIMIT}`),
  validatorErrorHandler,
];

export const updateSessionUser = [
  param('id').isMongoId().withMessage('Session user id is invalid'),
  body('session').optional()
    .isMongoId().withMessage('Session id is invalid'),
  body('grade').optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Session user grade must be integer and between 0 and 100'),
  body('gradeStatus').optional()
    .isIn(Object.values(SESSION_USER_GRADE_STATUS))
    .withMessage('Grade status is invalid'),
  body('gradeComment').optional()
    .isLength({ max: 5000 })
    .withMessage('Comment cannot exceed 5000 characters'),
  body('attendance').optional()
    .isObject()
    .withMessage('Attendance must be an object'),
  body('attendance.status').optional()
    .isIn(Object.values(SESSION_USER_ATTENDANCE))
    .withMessage('Attendance status is invalid'),
  body('attendance.timeJoined').optional()
    .isInt()
    .withMessage('Attendance time join is invalid'),
  body('attendance.timeLeft').optional()
    .isInt()
    .withMessage('Attendance time left is invalid'),
  validatorErrorHandler,
];

export const bulkUpdateSessionUser = [
  body('ids').isArray(),
  body('ids.*').isMongoId().withMessage('Session user id is invalid'),
  body('attendance').optional()
    .isObject()
    .withMessage('Attendance must be an object'),
  body('attendance.status').optional()
    .isIn(Object.values(SESSION_USER_ATTENDANCE))
    .withMessage('Attendance status is invalid'),
  body('attendance.timeJoined').optional()
    .isInt()
    .withMessage('Attendance time join is invalid'),
  body('attendance.timeLeft').optional()
    .isInt()
    .withMessage('Attendance time left is invalid'),
  validatorErrorHandler,
];
