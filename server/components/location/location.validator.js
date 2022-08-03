import { param, body } from 'express-validator';
import validatorErrorHandler from '../../api/validatorErrorHandler';
import { LOCATION_STATUS } from '../../constants';

export const deleteLocation = [
  param('id').isMongoId().withMessage('Location id is invalid'),
  validatorErrorHandler,
];
export const getLocation = [
  param('id').isMongoId().withMessage('Location id is invalid'),
  validatorErrorHandler,
];

export const updateLocation = [
  param('id').isMongoId().withMessage('Location id is invalid'),
  body('name').optional().isLength({ min: 1 }).withMessage('Location name is invalid'),
  body('name').optional().isLength({ max: 100 }).withMessage('Location name cannot exceed 100 characters'),
  body('capacity').isNumeric().withMessage('Capacity must be a numeric from 1 to 100'),
  body('status')
    .isIn(Object.values(LOCATION_STATUS))
    .withMessage('Location status is invalid'),
  validatorErrorHandler,
];

export const createLocation = [
  body('name').isLength({ max: 100 }).withMessage('Location name cannot exceed 100 characters'),
  body('name').optional().isLength({ min: 1 }).withMessage('Location name is invalid'),
  body('capacity').isNumeric().withMessage('Capacity must be a numeric from 1 to 100'),
  body('status')
    .isIn(Object.values(LOCATION_STATUS))
    .withMessage('Location status is invalid'),
  validatorErrorHandler,
];
