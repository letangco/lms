import { body, param } from 'express-validator';
import validatorErrorHandler from '../../api/validatorErrorHandler';
import { USER_ROLES, USER_TYPE_UNIT_METHODS, USER_TYPE_UNIT_STATUS } from '../../constants';

export const createUserTypeUnit = [
  body('name').isLength({ max: 100 }).withMessage('The name must be set and not exceed 100 characters'),
  body('method').optional().isIn(Object.values(USER_TYPE_UNIT_METHODS)).withMessage('The method is not valid'),
  body('apiRoute').optional().isLength({ max: 1000 }).withMessage('The api route must be set and not exceed 1000 characters'),
  body('clientRoute').optional().isLength({ max: 1000 }).withMessage('The client route must be set and not exceed 1000 characters'),
  body('parent').optional().isMongoId().withMessage('The parent id is not valid'),
  body('role').optional().isIn(Object.values(USER_ROLES)).withMessage('The role is not valid'),
  body('status').isIn(Object.values(USER_TYPE_UNIT_STATUS)).withMessage('The type unit is not valid'),
  validatorErrorHandler,
];

export const updateUserTypeUnit = [
  param('id').isMongoId().withMessage('User type unit id is invalid'),
  body('name').isLength({ max: 100 }).withMessage('The name must be set and not exceed 100 characters'),
  body('method').optional().isIn(Object.values(USER_TYPE_UNIT_METHODS)).withMessage('The method is not valid'),
  body('apiRoute').optional().isLength({ max: 1000 }).withMessage('The api route must be set and not exceed 1000 characters'),
  body('clientRoute').optional().isLength({ max: 1000 }).withMessage('The client route must be set and not exceed 1000 characters'),
  body('parent').optional().isMongoId().withMessage('The parent id is not valid'),
  body('role').optional().isIn(Object.values(USER_ROLES)).withMessage('The role is not valid'),
  body('status').optional().isIn(Object.values(USER_TYPE_UNIT_STATUS)).withMessage('The type unit is not valid'),
  validatorErrorHandler,
];

export const deleteUserTypeUnit = [
  param('id').isMongoId().withMessage('User type unit id is invalid'),
  validatorErrorHandler,
];
