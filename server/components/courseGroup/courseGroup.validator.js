import { param, body, query } from 'express-validator';
import validatorErrorHandler from '../../api/validatorErrorHandler';
import { MAX_PAGE_LIMIT } from '../../constants';

export const deleteGroup = [
  param('id').isMongoId().withMessage('Group id is invalid'),
  validatorErrorHandler,
];

export const deleteUserGroup = [
  param('id').isMongoId().withMessage('User id is invalid'),
  validatorErrorHandler,
];

export const getGroup = [
  param('id').isMongoId().withMessage('Group id is invalid'),
  validatorErrorHandler,
];

export const getGroups = [
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

export const getUserGroups = [
  query('rowPerPage')
    .optional()
    .isInt({ min: 1, max: MAX_PAGE_LIMIT })
    .withMessage(`Row per page must be a positive integer not larger than ${MAX_PAGE_LIMIT}`),
  query('group')
    .optional()
    .isMongoId()
    .withMessage('Group id is invalid'),
  query('rowPerPage')
    .optional()
    .isInt({ min: 1, max: MAX_PAGE_LIMIT })
    .withMessage(`Row per page must be a positive integer not larger than ${MAX_PAGE_LIMIT}`),
  query('textSearch')
    .optional(),
  validatorErrorHandler,
];

export const updateGroup = [
  param('id').isMongoId().withMessage('Group id is invalid'),
  body('name').optional().isLength({ max: 100 }).withMessage('Group name cannot exceed 100 characters'),
  body('description').optional().isLength({ max: 1000 }).withMessage('Group description cannot exceed 1000 characters'),
  body('course').isMongoId().withMessage('Course id is invalid'),
  body('key').optional()
    .isSlug().withMessage('Group key must be a slug with maximum 20 characters')
    .isLength({ max: 20 })
    .withMessage('Group key must be a slug with maximum 20 characters'),
  validatorErrorHandler,
];

export const updateUsesGroup = [
  param('id').isMongoId().withMessage('User group id is invalid'),
  body('user').isMongoId().withMessage('Course id is invalid'),
  body('group').isMongoId().withMessage('Course id is invalid'),
  validatorErrorHandler,
];

export const createGroup = [
  body('name').isLength({ max: 100 }).withMessage('Group name cannot exceed 100 characters'),
  body('description').optional().isLength({ max: 1000 }).withMessage('Group description cannot exceed 1000 characters'),
  body('course').isMongoId().withMessage('Course id is invalid'),
  body('key').optional()
    .isSlug().withMessage('Group key must be a slug with maximum 20 characters')
    .isLength({ max: 20 })
    .withMessage('Group key must be a slug with maximum 20 characters'),
  validatorErrorHandler,
];

export const createUserGroup = [
  body('user').isMongoId().withMessage('Course id is invalid'),
  body('group').isMongoId().withMessage('Course id is invalid'),
  validatorErrorHandler,
];
