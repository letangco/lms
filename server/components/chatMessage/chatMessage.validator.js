import { param, query } from 'express-validator';
import validatorErrorHandler from '../../api/validatorErrorHandler';
import { MAX_PAGE_LIMIT } from '../../constants';

export const addMessage = [
  param('group').isMongoId().withMessage('Chat group id is invalid'),
  validatorErrorHandler,
];

export const getUserGroupMessages = [
  param('group').isMongoId().withMessage('Chat group id is invalid'),
  query('firstId').optional().isMongoId().withMessage('First id is invalid'),
  query('lastId').optional().isMongoId().withMessage('Last id is invalid'),
  query('rowPerPage')
    .optional()
    .isInt({ min: 1, max: MAX_PAGE_LIMIT })
    .withMessage('Row per page must be a number'),
  validatorErrorHandler,
];
