import { param, body, query } from 'express-validator';
import validatorErrorHandler from '../../api/validatorErrorHandler';
import { MAX_PAGE_LIMIT } from '../../constants';

export const deleteNotification = [
  param('id').isMongoId().withMessage('Notification id is invalid'),
  validatorErrorHandler,
];

export const getNotification = [
  param('id').isMongoId().withMessage('Notification id is invalid'),
  validatorErrorHandler,
];

export const getNotifications = [
  query('rowPerPage')
    .optional()
    .isInt({ min: 1, max: MAX_PAGE_LIMIT })
    .withMessage(`Row per page must be a positive integer not larger than ${MAX_PAGE_LIMIT}`),
  query('textSearch')
    .optional(),
  validatorErrorHandler,
];

export const updateNotification = [
  param('id').isMongoId().withMessage('Notification id is invalid'),
  body('name').optional().isLength({ max: 100 }).withMessage('Notification name cannot exceed 100 characters'),
  validatorErrorHandler,
];

export const createNotification = [
  body('name').optional().isLength({ max: 100 }).withMessage('Notification name cannot exceed 100 characters'),
  validatorErrorHandler,
];
