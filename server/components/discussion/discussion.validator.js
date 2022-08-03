import { param, body, query } from 'express-validator';
import validatorErrorHandler from '../../api/validatorErrorHandler';
import { MAX_PAGE_LIMIT } from '../../constants';

export const deleteDiscussion = [
  param('id').isMongoId().withMessage('Discussion id is invalid'),
  validatorErrorHandler,
];
export const deleteDiscussionComment = [
  param('id').isMongoId().withMessage('Discussion comment id is invalid'),
  validatorErrorHandler,
];

export const getDiscussion = [
  param('id').isMongoId().withMessage('Discussion id is invalid'),
  validatorErrorHandler,
];
export const getDiscussionComment = [
  param('id').isMongoId().withMessage('Discussion id is invalid'),
  validatorErrorHandler,
];

export const getDiscussionComments = [
  query('discussion').isMongoId().withMessage('Discussion id is invalid'),
  validatorErrorHandler,
];

export const getDiscussions = [
  query('rowPerPage')
    .optional()
    .isInt({ min: 1, max: MAX_PAGE_LIMIT })
    .withMessage(`Row per page must be a positive integer not larger than ${MAX_PAGE_LIMIT}`),
  query('textSearch')
    .optional(),
  query('course').isMongoId().withMessage('Course id is invalid'),
  validatorErrorHandler,
];

export const updateDiscussion = [
  param('id').isMongoId().withMessage('Discussion id is invalid'),
  body('description').optional().isLength({ max: 10000 }).withMessage('Discussion description cannot exceed 10000 characters'),
  validatorErrorHandler,
];

export const updateDiscussionComment = [
  param('id').isMongoId().withMessage('Discussion comment id is invalid'),
  body('description').optional().isLength({ max: 10000 }).withMessage('Discussion comment cannot exceed 10000 characters'),
  validatorErrorHandler,
];

export const createDiscussion = [
  body('name').optional().isLength({ max: 500 }).withMessage('Discussion name cannot exceed 500 characters'),
  body('description').optional().isLength({ max: 10000 }).withMessage('Discussion description cannot exceed 10000 characters'),
  body('course').isMongoId().withMessage('Course id is invalid'),
  validatorErrorHandler,
];

export const createDiscussionComment = [
  body('description').optional().isLength({ max: 10000 }).withMessage('Discussion comment cannot exceed 10000 characters'),
  body('discussion').isMongoId().withMessage('Discussion id is invalid'),
  validatorErrorHandler,
];
