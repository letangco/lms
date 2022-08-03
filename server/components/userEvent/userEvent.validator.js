import { query, param, body } from 'express-validator';
import momentTimezone from 'moment-timezone';
import validatorErrorHandler from '../../api/validatorErrorHandler';
import { USER_EVENT_PRIVACY, USER_EVENT_TYPE } from '../../constants';

export const getUserEvents = [
  query('types').customSanitizer(types => types?.split(',') ?? []),
  query('types.*').isIn(Object.values(USER_EVENT_TYPE)).withMessage('User type is not valid'),
  query('unit').optional()
    .isMongoId()
    .withMessage('Unit id is invalid'),
  validatorErrorHandler,
];

export const getUserEvent = [
  param('id')
    .isMongoId()
    .withMessage('User event id is invalid'),
  validatorErrorHandler,
];

export const createUserEvent = [
  body('name')
    .isLength({ min: 1 })
    .withMessage('Event name is required'),
  body('time.begin')
    .isISO8601()
    .withMessage('Begin time is invalid'),
  body('time.end')
    .isISO8601()
    .withMessage('End time is invalid'),
  body('timezone').custom((timezone) => {
    if (!momentTimezone.tz.zone(timezone)) {
      throw new Error('Timezone is invalid');
    }
    return true;
  }),
  body('location').optional()
    .isLength({ max: 200 })
    .withMessage('User event location cannot exceed 200 characters'),
  body('description').optional()
    .isLength({ max: 1000 })
    .withMessage('User event description cannot exceed 1000 characters'),
  body('duration').optional()
    .isInt({ max: 1440 })
    .withMessage('User event duration cannot larger than 240'),
  body('settings').optional(),
  body('settings.accessCode')
    .optional()
    .isLength({ min: 6, max: 6 })
    .withMessage('Event access code must at least 6 chars'),
  body('settings.muteOnStart')
    .optional()
    .isBoolean().withMessage('Event setting mute on start is invalid'),
  body('settings.requireModeratorApprove')
    .optional()
    .isBoolean().withMessage('Event setting moderator approve is invalid'),
  body('settings.anyUserCanStart')
    .optional()
    .isBoolean().withMessage('Event setting any user can start is invalid'),
  body('settings.anyUserCanJoinAsModerator')
    .optional()
    .isBoolean().withMessage('Event setting any user can join as moderator is invalid'),
  body('groups')
    .optional()
    .isArray()
    .withMessage('Group must be an array of group id'),
  body('groups.*')
    .isMongoId()
    .withMessage('Group id is invalid'),
  body('courses')
    .optional()
    .isArray()
    .withMessage('Course must be an array of course id'),
  body('courses.*')
    .isMongoId()
    .withMessage('Course id is invalid'),
  body('privacy')
    .optional()
    .isIn(Object.values(USER_EVENT_PRIVACY))
    .withMessage('Privacy id is invalid'),
  body('unit')
    .optional()
    .isMongoId()
    .withMessage('Unit id is invalid'),
  validatorErrorHandler,
];

export const updateUserEvent = [
  param('id')
    .isMongoId()
    .withMessage('User event id is invalid'),
  body('name').optional()
    .isLength({ min: 1 })
    .withMessage('Event name is required'),
  body('time').optional(),
  body('time.begin').optional()
    .isISO8601()
    .withMessage('Begin time is invalid'),
  body('time.end').optional()
    .isISO8601()
    .withMessage('End time is invalid'),
  body('timezone').optional().custom((timezone) => {
    if (!momentTimezone.tz.zone(timezone)) {
      throw new Error('Timezone is invalid');
    }
    return true;
  }),
  body('location').optional()
    .isLength({ max: 200 })
    .withMessage('User event location cannot exceed 200 characters'),
  body('description').optional()
    .isLength({ max: 1000 })
    .withMessage('User event description cannot exceed 1000 characters'),
  body('duration').optional()
    .isInt({ max: 1440 })
    .withMessage('User event duration cannot larger than 240'),
  body('settings').optional(),
  body('settings.accessCode')
    .optional()
    .isLength({ min: 6, max: 6 })
    .withMessage('Event access code must at least 6 chars'),
  body('settings.muteOnStart')
    .optional()
    .isBoolean().withMessage('Event setting mute on start is invalid'),
  body('settings.requireModeratorApprove')
    .optional()
    .isBoolean().withMessage('Event setting moderator approve is invalid'),
  body('settings.anyUserCanStart')
    .optional()
    .isBoolean().withMessage('Event setting any user can start is invalid'),
  body('settings.anyUserCanJoinAsModerator')
    .optional()
    .isBoolean().withMessage('Event setting any user can join as moderator is invalid'),
  body('groups')
    .optional()
    .isArray()
    .withMessage('Group must be an array of group id'),
  body('groups.*')
    .isMongoId()
    .withMessage('Group id is invalid'),
  body('courses')
    .optional()
    .isArray()
    .withMessage('Course must be an array of course id'),
  body('courses.*')
    .isMongoId()
    .withMessage('Course id is invalid'),
  body('privacy')
    .optional()
    .isIn(Object.values(USER_EVENT_PRIVACY))
    .withMessage('Privacy id is invalid'),
  validatorErrorHandler,
];

export const deleteUserEvent = [
  param('id')
    .isMongoId()
    .withMessage('User event id is invalid'),
  validatorErrorHandler,
];
