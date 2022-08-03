import { query, param } from 'express-validator';
import validatorErrorHandler from '../../api/validatorErrorHandler';

export const getJoinUrl = [
  param('id').isMongoId().withMessage('Event id is invalid'),
  query('accessCode').optional().isLength({ min: 6, max: 6 }).withMessage('Room access code must be 6 chars'),
  validatorErrorHandler,
];
