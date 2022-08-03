import { body, query } from 'express-validator';
import validatorErrorHandler from '../../api/validatorErrorHandler';
import {
  TITLE_MAX_LENGTH
} from '../../constants';
export const createQuestion = [
  body('title')
    .isLength({ max: TITLE_MAX_LENGTH })
    .withMessage([
      'Title cannot exceed %s characters',
      [TITLE_MAX_LENGTH]
    ]),
  // body('course')
  //   .isMongoId()
  //   .withMessage('Course id is invalid'),
  validatorErrorHandler,
];

export const updateQuestion = [
  query('id').isMongoId().withMessage('Question id is invalid'),
  body('title')
    .isLength({ max: TITLE_MAX_LENGTH })
    .withMessage([
      'Title cannot exceed %s characters',
      [TITLE_MAX_LENGTH]
    ]),
  validatorErrorHandler,
];

export const deleteQuestion = [
  query('id').isMongoId().withMessage('Question id is invalid'),
  validatorErrorHandler,
];
