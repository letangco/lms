import { param, body, query } from 'express-validator';
import validatorErrorHandler from '../../api/validatorErrorHandler';
import {
  COURSE_STATUS,
  MAX_PAGE_LIMIT,
  UNIT_TYPE,
  USER_ROLES,
} from '../../constants';

export const getCourses = [
  query('page')
    .isInt({ min: 1 })
    .withMessage('Page number must be a positive integer'),
  query('rowPerPage')
    .optional()
    .isInt({ min: 1, max: MAX_PAGE_LIMIT })
    .withMessage(`Row per page must be a positive integer not larger than ${MAX_PAGE_LIMIT}`),
  query('textSearch').optional(),
  query('role').optional()
    .isIn(Object.values([USER_ROLES.ADMIN, USER_ROLES.INSTRUCTOR, USER_ROLES.LEARNER]))
    .withMessage('User role is not valid'),
  validatorErrorHandler,
];

export const deleteCourse = [
  param('id').isMongoId().withMessage('Course id is invalid'),
  validatorErrorHandler,
];

export const getCourse = [
  param('id').isMongoId().withMessage('Course id is invalid'),
  validatorErrorHandler,
];

export const createCourse = [
  body('name').isLength({ max: 100 }).withMessage('Course name cannot exceed 100 characters'),
  body('category').optional().isMongoId().withMessage('Course category id is not valid'),
  body('teachingLanguage').optional().isMongoId().withMessage('Course teaching language id is not valid'),
  body('description').optional().isLength({ max: 5000 }).withMessage('Course description cannot exceed 5000 characters'),
  body('code').optional().isLength({ max: 20 }).withMessage('Course code cannot exceed 20 characters'),
  body('price').optional().isInt({ min: 0 }).withMessage('Course price must be positive number'),
  body('videoIntro').optional().isLength({ max: 1000 }).withMessage('Course video intro cannot exceed 1000 characters'),
  body('status').optional().isIn(Object.values(COURSE_STATUS)).withMessage('The course status is not valid'),
  validatorErrorHandler,
];

export const updateCourse = [
  param('id').isMongoId().withMessage('Course id is invalid'),
  body('name').optional().isLength({ max: 100 }).withMessage('Course name cannot exceed 100 characters'),
  body('category').optional().isMongoId().withMessage('Course category id is not valid'),
  body('teachingLanguage').optional().isMongoId().withMessage('Course teaching language id is not valid'),
  body('description').optional().isLength({ max: 5000 }).withMessage('Course description cannot exceed 5000 characters'),
  body('code').optional().isLength({ max: 20 }).withMessage('Course code cannot exceed 20 characters'),
  body('price').optional().isInt({ min: 0 }).withMessage('Course price must be positive number'),
  body('videoIntro').optional().isLength({ max: 1000 }).withMessage('Course video intro cannot exceed 1000 characters'),
  body('status').optional().isIn(Object.values(COURSE_STATUS)).withMessage('The course status is not valid'),
  body('unset.category').optional().isBoolean().withMessage('Course category unset value must be boolean'),
  body('unset.thumbnail').optional().isBoolean().withMessage('Course thumbnail unset value must be boolean'),
  body('unset.price').optional().isBoolean().withMessage('Course price unset value must be boolean'),
  validatorErrorHandler,
];

export const getCourseUnits = [
  param('id')
    .isMongoId()
    .withMessage('Course id is invalid'),
  query('firstId').optional().isMongoId().withMessage('First id is invalid'),
  query('lastId').optional().isMongoId().withMessage('Last id is invalid'),
  query('rowPerPage')
    .optional()
    .isInt({ min: 1, max: MAX_PAGE_LIMIT })
    .withMessage('Row per page must be a number'),
  query('types').customSanitizer(types => types?.split(',') ?? []),
  query('types.*').isIn(Object.values(UNIT_TYPE)).withMessage('The unit type is invalid'),
  validatorErrorHandler,
];

export const getCourseQuestions = [
  param('id')
    .isMongoId()
    .withMessage('Course id is invalid'),
  query('firstId').optional().isMongoId().withMessage('First id is invalid'),
  query('lastId').optional().isMongoId().withMessage('Last id is invalid'),
  query('rowPerPage')
    .optional()
    .isInt({ min: 1, max: MAX_PAGE_LIMIT })
    .withMessage('Row per page must be a number'),
  validatorErrorHandler,
];

export const searchCourses = [
  query('firstId').optional().isMongoId().withMessage('First id is invalid'),
  query('lastId').optional().isMongoId().withMessage('Last id is invalid'),
  query('rowPerPage')
    .optional()
    .isInt({ min: 1, max: MAX_PAGE_LIMIT })
    .withMessage('Row per page must be a number'),
  query('exceptionIds').optional(),
  query('exceptionIds').customSanitizer(types => types?.split(',') ?? []),
  query('exceptionIds.*').isMongoId().withMessage('Course id is invalid'),
  validatorErrorHandler,
];
