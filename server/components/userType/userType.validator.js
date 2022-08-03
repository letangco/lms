import { body, query, param } from 'express-validator';
import validatorErrorHandler from '../../api/validatorErrorHandler';
import { MAX_PAGE_LIMIT, USER_ROLES } from '../../constants';

export const createUserUnit = [
  body('name').isLength({ max: 100 }).withMessage('The name must be set and not exceed 100 characters'),
  body('defaultRole').isIn(Object.values(USER_ROLES)).withMessage('The default user role is not valid'),
  body('userTypeUnits')
    .isArray()
    .withMessage('The user type units must be an array'),
  body('userTypeUnits.*')
    .isMongoId()
    .withMessage('The user type units is not valid'),
  validatorErrorHandler,
];

export const getUserTypes = [
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

export const getUserTypeList = [
  query('firstId').optional().isMongoId().withMessage('First id is invalid'),
  query('lastId').optional().isMongoId().withMessage('Last id is invalid'),
  query('rowPerPage')
    .optional()
    .isInt({ min: 1, max: MAX_PAGE_LIMIT })
    .withMessage('Row per page must be a number'),
  validatorErrorHandler,
];

export const updateUserType = [
  param('id').isMongoId().withMessage('User id is invalid'),
  body('name').optional().isLength({ max: 100 }).withMessage('The name must not exceed 100 characters'),
  body('defaultRole').optional().isIn(Object.values(USER_ROLES)).withMessage('The default user role is not valid'),
  body('userTypeUnits').optional()
    .isArray()
    .withMessage('The user type units must be an array'),
  body('userTypeUnits.*')
    .isMongoId()
    .withMessage('The user type unit id is not valid'),
  validatorErrorHandler,
];

export const deleteUserType = [
  param('id').isMongoId().withMessage('User id is invalid'),
  validatorErrorHandler,
];

export const getUserType = [
  param('id').isMongoId().withMessage('User id is invalid'),
  validatorErrorHandler,
];
