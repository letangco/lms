import { param, body } from 'express-validator';
import validatorErrorHandler from '../../api/validatorErrorHandler';
import {
  COURSE_RULES_AND_PATH_CALCULATE_SCORE_BY_AVERAGE_OF,
  COURSE_RULES_AND_PATH_COMPLETED_WHEN,
  COURSE_RULES_AND_PATH_SHOW_UNITS
} from '../../constants';

export const createRulesAndPath = [
  param('showUnits').optional()
    .isIn(Object.values(COURSE_RULES_AND_PATH_SHOW_UNITS))
    .withMessage('Show units option is invalid'),
  body('completedWhen').optional(),
  body('completedWhen.when').optional()
    .isIn(Object.values(COURSE_RULES_AND_PATH_COMPLETED_WHEN))
    .withMessage('Course completed option is invalid'),
  body('completedWhen.percent').optional()
    .isFloat({ min: 0, max: 99.9 })
    .withMessage('Course completed percent option must be a positive number not larger than 99.9'),
  body('completedWhen.units').optional(),
  body('completedWhen.units.*')
    .isMongoId()
    .withMessage('Course completed units option is invalid'),
  body('completedWhen.test').optional()
    .isMongoId()
    .withMessage('Course completed test option is invalid'),
  body('calculateScoreByAverageOf').optional(),
  body('calculateScoreByAverageOf.of').optional()
    .isIn(Object.values(COURSE_RULES_AND_PATH_CALCULATE_SCORE_BY_AVERAGE_OF))
    .withMessage('Course calculate score option is invalid'),
  body('calculateScoreByAverageOf.testsAndAssignments').optional(),
  body('calculateScoreByAverageOf.testsAndAssignments.*')
    .optional()
    .isObject().withMessage('Course calculate score, tests and assignments items must be an object'),
  body('calculateScoreByAverageOf.testsAndAssignments.*.unit')
    .isMongoId()
    .withMessage('Course calculate score, tests and assignments unit id option is invalid'),
  body('calculateScoreByAverageOf.testsAndAssignments.*.weight')
    .isInt({ min: 1, max: 20 })
    .withMessage('Course calculate score, tests and assignments weight option must be positive integer'),
  body('learningPaths').optional(),
  body('learningPaths.*').optional().isObject().withMessage('Course learning path items must be an object'),
  body('learningPaths.*.paths').optional().isArray().withMessage('Course learning path items property paths must be an array'),
  body('learningPaths.*.paths.*')
    .isMongoId()
    .withMessage('Course learning path, course id is invalid'),
  validatorErrorHandler,
];

export const updateRulesAndPath = [
  param('id')
    .isMongoId()
    .withMessage('Rules and Path id is invalid'),
  param('showUnits').optional()
    .isIn(Object.values(COURSE_RULES_AND_PATH_SHOW_UNITS))
    .withMessage('Show units option is invalid'),
  body('completedWhen').optional(),
  body('completedWhen.when').optional()
    .isIn(Object.values(COURSE_RULES_AND_PATH_COMPLETED_WHEN))
    .withMessage('Course completed option is invalid'),
  body('completedWhen.percent').optional()
    .isFloat({ min: 0, max: 99.9 })
    .withMessage('Course completed percent option must be a positive number not larger than 99.9'),
  body('completedWhen.units').optional(),
  body('completedWhen.units.*')
    .isMongoId()
    .withMessage('Course completed units option is invalid'),
  body('completedWhen.test').optional()
    .isMongoId()
    .withMessage('Course completed test option is invalid'),
  body('calculateScoreByAverageOf').optional(),
  body('calculateScoreByAverageOf.of').optional()
    .isIn(Object.values(COURSE_RULES_AND_PATH_CALCULATE_SCORE_BY_AVERAGE_OF))
    .withMessage('Course calculate score option is invalid'),
  body('calculateScoreByAverageOf.testsAndAssignments').optional(),
  body('calculateScoreByAverageOf.testsAndAssignments.*')
    .optional()
    .isObject().withMessage('Course calculate score, tests and assignments items must be an object'),
  body('calculateScoreByAverageOf.testsAndAssignments.*.unit')
    .isMongoId()
    .withMessage('Course calculate score, tests and assignments unit id option is invalid'),
  body('calculateScoreByAverageOf.testsAndAssignments.*.weight')
    .isInt({ min: 1, max: 20 })
    .withMessage('Course calculate score, tests and assignments weight option must be positive integer'),
  body('learningPaths').optional(),
  body('learningPaths.*').optional().isObject().withMessage('Course learning path items must be an object'),
  body('learningPaths.*.paths').optional().isArray().withMessage('Course learning path items property paths must be an array'),
  body('learningPaths.*.paths.*')
    .isMongoId()
    .withMessage('Course learning path, course id is invalid'),
  validatorErrorHandler,
];

export const getRulesAndPath = [
  param('id')
    .isMongoId()
    .withMessage('Rules and Path id is invalid'),
  validatorErrorHandler,
];
