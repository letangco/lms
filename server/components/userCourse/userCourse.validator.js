import { query } from 'express-validator';
import validatorErrorHandler from '../../api/validatorErrorHandler';

export const getUnit = [
  query('id').isMongoId().withMessage('Unit id is invalid'),
  validatorErrorHandler,
];
export const getQuestion = [
  query('question').isMongoId().withMessage('Question id is invalid'),
  validatorErrorHandler,
];
export const getSurvey = [
  query('survey').isMongoId().withMessage('Survey id is invalid'),
  validatorErrorHandler,
];
export const getCourse = [
  query('id').isMongoId().withMessage('Course id is invalid'),
  validatorErrorHandler,
];
