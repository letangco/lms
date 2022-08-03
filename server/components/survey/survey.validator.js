import { body, query } from 'express-validator';
import validatorErrorHandler from '../../api/validatorErrorHandler';
import {
  TITLE_MAX_LENGTH
} from '../../constants';
export const createSurvey = [
  body('title')
    .isLength({ max: TITLE_MAX_LENGTH })
    .withMessage([
      'Title cannot exceed %s characters',
      [TITLE_MAX_LENGTH]
    ]),
  body('course')
    .isMongoId()
    .withMessage('Course id is invalid'),
  body('type')
    .isString()
    .withMessage('Type type is invalid'),
  validatorErrorHandler,
];

export const updateSurvey = [
  query('id').isMongoId().withMessage('Survey id is invalid'),
  body('title')
    .isLength({ max: TITLE_MAX_LENGTH })
    .withMessage([
      'Title cannot exceed %s characters',
      [TITLE_MAX_LENGTH]
    ]),
  validatorErrorHandler,
];

export const deleteSurvey = [
  query('id').isMongoId().withMessage('Survey id is invalid'),
  validatorErrorHandler,
];
