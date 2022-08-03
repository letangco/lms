import momentTimezone from 'moment-timezone';
import { body, query, param } from 'express-validator';
import validatorErrorHandler from '../../api/validatorErrorHandler';
import {
  MAX_PAGE_LIMIT,
  USER_BIO_NAME_MAX_LENGTH,
  USER_EMAIL_MAX_LENGTH,
  USER_FIRST_NAME_MAX_LENGTH,
  USER_LAST_NAME_MAX_LENGTH,
  USER_MIN_PASSWORD_LENGTH, USER_ROLES,
  USER_STATUS,
  USERNAME_MAX_LENGTH,
} from '../../constants';
import * as UserService from './user.service';

export const userLoginValidator = [
  body('email').isEmail().withMessage('Email is invalid'),
  body('password').isLength({ min: USER_MIN_PASSWORD_LENGTH }).withMessage([
    'Password must be at least %s chars long',
    [USER_MIN_PASSWORD_LENGTH]
  ]),
  validatorErrorHandler,
];

export const deleteUserValidator = [
  param('id').isMongoId().withMessage('User id is invalid'),
  validatorErrorHandler,
];

export const getUserInfo = [
  param('id').isMongoId().withMessage('User id is invalid'),
  validatorErrorHandler,
];

export const permanentlyDeleteUserValidator = [
  param('id').isMongoId().withMessage('User id is invalid'),
  validatorErrorHandler,
];

export const createUser = [
  body('email')
    .isEmail().withMessage('User email is invalid')
    .isLength({ max: USER_EMAIL_MAX_LENGTH })
    .withMessage([
      'User email cannot exceed %s characters',
      [USER_EMAIL_MAX_LENGTH]
    ])
    .custom(async (email) => {
      if (await UserService.emailUsed(email)) {
        throw new Error('Email is already using by someone');
      }
      return true;
    }),
  body('firstName')
    .isLength({ max: USER_FIRST_NAME_MAX_LENGTH })
    .withMessage([
      'User first name cannot exceed %s characters',
      [USER_FIRST_NAME_MAX_LENGTH]
    ]),
  body('lastName')
    .isLength({ max: USER_LAST_NAME_MAX_LENGTH })
    .withMessage([
      'User last name cannot exceed %s characters',
      [USER_LAST_NAME_MAX_LENGTH]
    ]),
  body('bio').optional()
    .isLength({ max: USER_BIO_NAME_MAX_LENGTH })
    .withMessage([
      'User bio cannot exceed %s characters',
      [USER_BIO_NAME_MAX_LENGTH]
    ]),
  body('password').isLength({ min: USER_MIN_PASSWORD_LENGTH }).withMessage([
    'Password must be at least %s characters',
    [USER_MIN_PASSWORD_LENGTH]
  ]),
  body('timezone').custom((timezone) => {
    if (!momentTimezone.tz.zone(timezone)) {
      throw new Error('User timezone is invalid');
    }
    return true;
  }),
  body('language')
    .isMongoId()
    .withMessage('User language is invalid'),
  body('type')
    .isMongoId()
    .withMessage('User type is invalid'),
  body('status')
    .isIn(Object.values(USER_STATUS))
    .withMessage('User status is invalid'),
  validatorErrorHandler,
];

export const updateUserProfile = [
  // body('email').optional()
  //   .isEmail().withMessage('User email is invalid')
  //   .isLength({ max: USER_EMAIL_MAX_LENGTH })
  //   .withMessage([
  //     'User email cannot exceed %s characters',
  //     [USER_EMAIL_MAX_LENGTH]
  //   ])
  //   .custom(async (email) => {
  //     if (await UserService.emailUsed(email)) {
  //       throw new Error('Email is already using by someone');
  //     }
  //     return true;
  //   }),
  // body('username').optional()
  //   .isSlug().withMessage('Username is invalid')
  //   .isLength({ max: USERNAME_MAX_LENGTH })
  //   .withMessage([
  //     'Username cannot exceed %s characters',
  //     [USERNAME_MAX_LENGTH]
  //   ])
  //   .custom(async (username) => {
  //     if (await UserService.usernameUsed(username)) {
  //       throw new Error('Username is already using by someone');
  //     }
  //     return true;
  //   }),
  body('firstName').optional()
    .isLength({ max: USER_FIRST_NAME_MAX_LENGTH })
    .withMessage([
      'User first name cannot exceed %s characters',
      [USER_FIRST_NAME_MAX_LENGTH]
    ]),
  body('lastName').optional()
    .isLength({ max: USER_LAST_NAME_MAX_LENGTH })
    .withMessage([
      'User last name cannot exceed %s characters',
      [USER_LAST_NAME_MAX_LENGTH]
    ]),
  body('bio').optional()
    .isLength({ max: USER_BIO_NAME_MAX_LENGTH })
    .withMessage([
      'User bio cannot exceed %s characters',
      [USER_BIO_NAME_MAX_LENGTH]
    ]),
  body('password').optional().isLength({ min: USER_MIN_PASSWORD_LENGTH }).withMessage([
    'Password must be at least %s characters',
    [USER_MIN_PASSWORD_LENGTH]
  ]),
  body('timezone').optional().custom((timezone) => {
    if (!momentTimezone.tz.zone(timezone)) {
      throw new Error('User timezone is invalid');
    }
    return true;
  }),
  body('language').optional()
    .isMongoId()
    .withMessage('User language is invalid'),
  body('status').optional()
    .isIn(Object.values(USER_STATUS))
    .withMessage('User status is invalid'),
  validatorErrorHandler,
];
export const adminUpdateUserProfile = [
  param('id').isMongoId().withMessage('User id is invalid'),
  // body('email').optional()
  //   .isEmail().withMessage('User email is invalid')
  //   .isLength({ max: USER_EMAIL_MAX_LENGTH })
  //   .withMessage([
  //     'User email cannot exceed %s characters',
  //     [USER_EMAIL_MAX_LENGTH]
  //   ])
  //   .custom(async (email) => {
  //     if (await UserService.emailUsed(email)) {
  //       throw new Error('Email is already using by someone');
  //     }
  //     return true;
  //   }),
  // body('username').optional()
  //   .isSlug().withMessage('Username is invalid')
  //   .isLength({ max: USERNAME_MAX_LENGTH })
  //   .withMessage([
  //     'Username cannot exceed %s characters',
  //     [USERNAME_MAX_LENGTH]
  //   ])
  //   .custom(async (username) => {
  //     if (await UserService.usernameUsed(username)) {
  //       throw new Error('Username is already using by someone');
  //     }
  //     return true;
  //   }),
  body('firstName').optional()
    .isLength({ max: USER_FIRST_NAME_MAX_LENGTH })
    .withMessage([
      'User first name cannot exceed %s characters',
      [USER_FIRST_NAME_MAX_LENGTH]
    ]),
  body('lastName').optional()
    .isLength({ max: USER_LAST_NAME_MAX_LENGTH })
    .withMessage([
      'User last name cannot exceed %s characters',
      [USER_LAST_NAME_MAX_LENGTH]
    ]),
  body('bio').optional()
    .isLength({ max: USER_BIO_NAME_MAX_LENGTH })
    .withMessage([
      'User bio cannot exceed %s characters',
      [USER_BIO_NAME_MAX_LENGTH]
    ]),
  body('password').optional().isLength({ min: USER_MIN_PASSWORD_LENGTH }).withMessage([
    'Password must be at least %s characters',
    [USER_MIN_PASSWORD_LENGTH]
  ]),
  body('timezone').optional().custom((timezone) => {
    if (!momentTimezone.tz.zone(timezone)) {
      throw new Error('User timezone is invalid');
    }
    return true;
  }),
  body('language').optional()
    .isMongoId()
    .withMessage('User language is invalid'),
  body('type').optional()
    .isMongoId()
    .withMessage('User type is invalid'),
  body('status').optional()
    .isIn(Object.values(USER_STATUS))
    .withMessage('User status is invalid'),
  validatorErrorHandler,
];

export const searchUsers = [
  query('firstId').optional().isMongoId().withMessage('First id is invalid'),
  query('lastId').optional().isMongoId().withMessage('Last id is invalid'),
  query('rowPerPage')
    .optional()
    .isInt({ min: 1, max: MAX_PAGE_LIMIT })
    .withMessage('Row per page must be a number'),
  query('roles').customSanitizer(roles => roles?.split(',') ?? []),
  query('roles.*').isIn([USER_ROLES.INSTRUCTOR, USER_ROLES.LEARNER]).withMessage('User role is not valid'),
  validatorErrorHandler,
];

export const getUsers = [
  query('page')
    .isInt({ min: 1 })
    .withMessage('Page number must be a positive integer'),
  query('rowPerPage')
    .optional()
    .isInt({ min: 1, max: MAX_PAGE_LIMIT })
    .withMessage(`Row per page must be a positive integer not larger than ${MAX_PAGE_LIMIT}`),
  query('textSearch')
    .optional(),
  validatorErrorHandler,
];
export const userTrackingLoginValidator = [
  query('begin')
      .isISO8601()
      .withMessage('Begin time is required'),
  query('end')
      .isISO8601()
      .withMessage('End time is required'),
  validatorErrorHandler,
];

export const forgotPassword = [
  body('email').isEmail().withMessage('Email is not valid'),
  validatorErrorHandler,
];

export const verifyForgotPassword = [
  body('newPassword').isLength({ min: USER_MIN_PASSWORD_LENGTH }).withMessage(`New password must be at least ${USER_MIN_PASSWORD_LENGTH} chars long`),
  validatorErrorHandler,
];

export const verifyImportUser = [
  body('data').isArray().withMessage('File import is not empty'),
  validatorErrorHandler,
];

export const verifyImport = [
  body('data').isObject().withMessage('File import is not empty'),
  validatorErrorHandler,
];
