import { body, query, param } from 'express-validator';
import validatorErrorHandler from '../../api/validatorErrorHandler';
import {FILE_SHARE_TYPE} from "../../constants";

export const getById = [
  param('id').isMongoId().withMessage('File id is invalid'),
  validatorErrorHandler
];

export const editById = [
  param('id').isMongoId().withMessage('File id is invalid'),
  body('title').optional().isLength({ min: 1 }).withMessage('Survey is required'),
  body('share.type').isIn(Object.values(FILE_SHARE_TYPE)),
  validatorErrorHandler
];

