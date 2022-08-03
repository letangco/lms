import { header, body, param } from 'express-validator';
import validatorErrorHandler from '../../api/validatorErrorHandler';
import * as UserSettingService from '../userSetting/userSetting.service';
import { ZOOM_STATUS } from '../../constants';

export const verifyAuth = [
  header('authorization').custom(async (token) => {
    if (!await UserSettingService.checkTokenZoomWebHook(token)) {
      throw new Error('Your permission denied');
    }
    return true;
  }),
  validatorErrorHandler,
];

export const deleteZoom = [
  param('id').isMongoId().withMessage('Zoom id is invalid'),
  validatorErrorHandler,
];
export const getZoom = [
  param('id').isMongoId().withMessage('Zoom id is invalid'),
  validatorErrorHandler,
];

export const updateZoom = [
  param('id').isMongoId().withMessage('Zoom id is invalid'),
  body('zoom_client').optional().isLength({ min: 1 }).withMessage('Client Id is invalid'),
  body('zoom_key').optional().isLength({ min: 1 }).withMessage('Key is invalid'),
  body('zoom_sec').optional().isLength({ min: 1 }).withMessage('Secret key is invalid'),
  body('status')
    .isIn(Object.values(ZOOM_STATUS))
    .withMessage('Zoom status is invalid'),
  validatorErrorHandler,
];

export const createZoom = [
  body('zoom_client').optional().isLength({ min: 1 }).withMessage('Client Id is invalid'),
  body('zoom_key').optional().isLength({ min: 1 }).withMessage('Key is invalid'),
  body('zoom_sec').optional().isLength({ min: 1 }).withMessage('Secret key is invalid'),
  body('status')
    .isIn(Object.values(ZOOM_STATUS))
    .withMessage('Zoom status is invalid'),
  validatorErrorHandler,
];
