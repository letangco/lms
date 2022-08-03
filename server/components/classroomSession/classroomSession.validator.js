import { query, param, } from 'express-validator';
import validatorErrorHandler from '../../api/validatorErrorHandler';
import { MAX_PAGE_LIMIT, USER_EVENT_TYPE, USER_FOR_SESSION_ORDER_FIELDS } from '../../constants';

export const getClassroomSessions = [
  query('begin')
    .isISO8601()
    .withMessage('Begin time is required'),
  query('end')
    .isISO8601()
    .withMessage('End time is required'),
  param('id')
    .isMongoId()
    .withMessage('Classroom id is invalid'),
  validatorErrorHandler,
];

export const searchClassroomSessions = [
  query('firstId').optional().isMongoId().withMessage('First id is invalid'),
  query('lastId').optional().isMongoId().withMessage('Last id is invalid'),
  query('rowPerPage')
    .optional()
    .isInt({ min: 1, max: MAX_PAGE_LIMIT })
    .withMessage('Row per page must be a number'),
  param('id')
    .isMongoId()
    .withMessage('Classroom id is invalid'),
  query('types').customSanitizer(types => types?.split(',') ?? []),
  query('types.*').isIn(Object.values(USER_EVENT_TYPE)).withMessage('User type is not valid'),
  validatorErrorHandler,
];

export const getSessionUsers = [
  param('course')
    .isMongoId()
    .withMessage('Course id is invalid'),
  param('unit')
    .isMongoId()
    .withMessage('Unit id is invalid'),
  query('page')
    .isInt({ min: 1 })
    .withMessage('Page number must be a positive integer'),
  query('rowPerPage')
    .optional()
    .isInt({ min: 1, max: MAX_PAGE_LIMIT })
    .withMessage(`Row per page must be a positive integer not larger than ${MAX_PAGE_LIMIT}`),
  query('textSearch')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Text search must not larger than 200 characters'),
  query('orderBy')
    .optional()
    .isIn(['desc', 'asc'])
    .withMessage('Order by value must be "desc" or "asc"'),
  query('order')
    .optional()
    .isIn(Object.keys(USER_FOR_SESSION_ORDER_FIELDS))
    .withMessage(`Order value must be ${Object.keys(USER_FOR_SESSION_ORDER_FIELDS).join(', ')}`),
  validatorErrorHandler,
];
