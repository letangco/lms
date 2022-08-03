import mongoose from 'mongoose';
import {
  COURSE_RULES_AND_PATH_CALCULATE_SCORE_BY_AVERAGE_OF,
  COURSE_RULES_AND_PATH_COMPLETED_WHEN,
  COURSE_RULES_AND_PATH_SHOW_UNITS,
  COURSE_RULES_AND_PATH_STATUS,
} from '../../constants';

/**
 * @swagger
 * definitions:
 *  CourseRulesAndPath:
 *    type: object
 *    properties:
 *      _id:
 *        type: string
 *      creator:
 *        type: string
 *      course:
 *        type: string
 *      showUnits:
 *        type: string
 *      completedWhen:
 *        type: object
 *        properties:
 *          when:
 *            type: string
 *          percent:
 *            type: number
 *          units:
 *            type: array
 *            items:
 *              type: string
 *          test:
 *            type: string
 *      calculateScoreByAverageOf:
 *        type: object
 *        properties:
 *          of:
 *            type: string
 *          units:
 *            type: array
 *            items:
 *              type: string
 *          tests:
 *            type: array
 *            items:
 *              type: string
 *      learningPaths:
 *        type: array
 *        items:
 *          type: object
 *          properties:
 *            paths:
 *              type: array
 *              items:
 *                type: string
 *      status:
 *        type: string
 */
const CourseRulesAndPathSchema = new mongoose.Schema({
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
    index: 1,
  },
  showUnits: {
    type: String,
    enum: Object.values(COURSE_RULES_AND_PATH_SHOW_UNITS),
    default: COURSE_RULES_AND_PATH_SHOW_UNITS.IN_ANY_ORDER,
  },
  completedWhen: {
    when: {
      type: String,
      enum: Object.values(COURSE_RULES_AND_PATH_COMPLETED_WHEN),
      default: COURSE_RULES_AND_PATH_COMPLETED_WHEN.ALL_UNITS_ARE_COMPLETED,
    },
    percent: {
      type: Number,
      default: 0,
      min: 0,
      max: 99.9,
    },
    units: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Unit' }],
    test: { type: mongoose.Schema.Types.ObjectId, ref: 'Unit' },
  },
  calculateScoreByAverageOf: {
    of: {
      type: String,
      enum: Object.values(COURSE_RULES_AND_PATH_CALCULATE_SCORE_BY_AVERAGE_OF),
      default: COURSE_RULES_AND_PATH_CALCULATE_SCORE_BY_AVERAGE_OF.ALL_TESTS_AND_ASSIGNMENTS,
    },
    testsAndAssignments: [{
      unit: { type: mongoose.Schema.Types.ObjectId, ref: 'Unit' },
      weight: {
        type: Number,
        default: 1,
        min: 1,
        max: 20,
      },
    }],
  },
  learningPaths: [
    {
      paths: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
    },
  ],
  status: {
    type: String,
    enum: Object.values(COURSE_RULES_AND_PATH_STATUS),
    default: COURSE_RULES_AND_PATH_STATUS.ACTIVE,
  },
}, {
  timestamps: true,
});

CourseRulesAndPathSchema.set('toJSON', {
  transform(doc, ret, options) { // eslint-disable-line no-unused-vars
    delete ret.__v;
    delete ret.creator;
    delete ret.status;
    delete ret.createdAt;
    delete ret.updatedAt;
  },
});

export default mongoose.model('CourseRulesAndPath', CourseRulesAndPathSchema);
