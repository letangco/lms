import { param, body, query } from 'express-validator';
import validatorErrorHandler from '../../api/validatorErrorHandler';
import { COURSE_USER_ORDER_FIELDS, MAX_PAGE_LIMIT, USER_ROLES } from '../../constants';

export const deleteCourseUser = [
  param('id').isMongoId().withMessage('Course-user id is invalid'),
  validatorErrorHandler,
];

export const getCourseUsers = [
  param('id')
    .isMongoId()
    .withMessage('Course-user id is invalid'),
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
    .isIn(Object.keys(COURSE_USER_ORDER_FIELDS))
    .withMessage(`Order value must be ${Object.keys(COURSE_USER_ORDER_FIELDS).join(', ')}`),
  validatorErrorHandler,
];

export const createCourseUser = [
  body('course').isMongoId().withMessage('Course id is invalid'),
  body('user').isMongoId().withMessage('User id is invalid'),
  validatorErrorHandler,
];

export const updateCourseUser = [
  param('id').isMongoId().withMessage('Course user id is invalid'),
  body('userRole').optional()
    .isIn([USER_ROLES.INSTRUCTOR, USER_ROLES.LEARNER]).withMessage('User role is invalid'),
  validatorErrorHandler,
];

export const searchCourseUsers = [
  query('courseId').isMongoId().withMessage('Course id is invalid'),
  query('firstId').optional().isMongoId().withMessage('First id is invalid'),
  query('lastId').optional().isMongoId().withMessage('Last id is invalid'),
  query('rowPerPage')
    .optional()
    .isInt({ min: 1, max: MAX_PAGE_LIMIT })
    .withMessage('Row per page must be a number'),
  query('roles').customSanitizer(roles => roles?.split(',') ?? []),
  query('roles.*').isIn([USER_ROLES.INSTRUCTOR, USER_ROLES.LEARNER]).withMessage('User role is not valid'),
  validatorErrorHandler,
];
