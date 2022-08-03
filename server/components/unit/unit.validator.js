import { body, param, query } from 'express-validator';
import validatorErrorHandler from '../../api/validatorErrorHandler';
import {
  TITLE_MAX_LENGTH
} from '../../constants';

export const createUnit = [
  body('title')
    .isLength({ max: TITLE_MAX_LENGTH })
    .withMessage([
      'Title cannot exceed %s characters',
      [TITLE_MAX_LENGTH]
    ]),
  body('course')
    .isMongoId()
    .withMessage('Course type is invalid'),
  validatorErrorHandler,
];

export const updateUnit = [
  query('id').isMongoId().withMessage('Unit id is invalid'),
  body('title')
    .isLength({ max: TITLE_MAX_LENGTH })
    .withMessage([
      'Title cannot exceed %s characters',
      [TITLE_MAX_LENGTH]
    ]),
  validatorErrorHandler,
];

export const quickUpdateUnit = [
  query('id').isMongoId().withMessage('Unit id is invalid'),
  body('title').optional()
    .isLength({ max: TITLE_MAX_LENGTH })
    .withMessage([
      'Title cannot exceed %s characters',
      [TITLE_MAX_LENGTH]
    ]),
  validatorErrorHandler,
];

export const saveClassroom = [
  param('id').isMongoId().withMessage('Unit id is invalid'),
  validatorErrorHandler,
];

export const deleteUnit = [
  query('id').isMongoId().withMessage('Unit id is invalid'),
  validatorErrorHandler,
];
