import { query, body, param } from 'express-validator';
import validatorErrorHandler from '../../api/validatorErrorHandler';
import { CHAT_GROUP_TYPE } from '../../constants';

export const createGroup = [
  body('users').optional().isArray().withMessage('Users must be a list of user id'),
  body('users.*').isMongoId().withMessage('User id is invalid'),
  validatorErrorHandler,
];

export const updateGroup = [
  param('id').isMongoId().withMessage('Group id is invalid'),
  body('name').isLength({ min: 1 }).withMessage('Group name is required'),
  validatorErrorHandler,
];

export const getUserGroup = [
  param('id').isMongoId().withMessage('Group id is invalid'),
  validatorErrorHandler,
];

export const getUserGroups = [
  query('textSearch')
    .optional(),
  query('firstTime').optional().isISO8601().withMessage('First time must be date string'),
  query('lastTime').optional().isISO8601().withMessage('Last time must be date string'),
  query('rowPerPage')
    .optional()
    .isNumeric()
    .withMessage('Row per page must be a number'),
    validatorErrorHandler,
  query('type')
    .optional()
    .isIn(Object.values(CHAT_GROUP_TYPE))
    .withMessage('Chat group type to load is invalid'),
    validatorErrorHandler,
];
export const resetUnreadMessage = [
  param('id').isMongoId().withMessage('Group id is invalid'),
  validatorErrorHandler,
];
