import { param } from 'express-validator';
import validatorErrorHandler from '../../api/validatorErrorHandler';

export const deactivateTimezone = [
  param('id').isMongoId().withMessage('Timezone id is invalid'),
  validatorErrorHandler,
];

export const activateTimezone = [
  param('id').isMongoId().withMessage('Timezone id is invalid'),
  validatorErrorHandler,
];
