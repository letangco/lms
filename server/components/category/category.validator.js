import { param, body } from 'express-validator';
import validatorErrorHandler from '../../api/validatorErrorHandler';

export const deleteCategory = [
  param('id').isMongoId().withMessage('Category id is invalid'),
  validatorErrorHandler,
];

export const updateCategory = [
  param('id').isMongoId().withMessage('Category id is invalid'),
  body('name').optional().isLength({ max: 100 }).withMessage('Category name cannot exceed 100 characters'),
  body('parent').optional().isMongoId().withMessage('Category parent id is not valid'),
  validatorErrorHandler,
];

export const createCategory = [
  body('name').isLength({ max: 100 }).withMessage('Category name cannot exceed 100 characters'),
  body('parent').optional().isMongoId().withMessage('Category parent id is not valid'),
  validatorErrorHandler,
];
