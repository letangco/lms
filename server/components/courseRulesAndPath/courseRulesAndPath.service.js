import CourseRulesAndPath from './courseRulesAndPath.model';
import Unit from '../unit/unit.model';
import UserUnit from '../userUnit/userUnit.model';
import logger from '../../util/logger';
import APIError from '../../util/APIError';
import { updateCourseRulesAndPath } from '../course/course.service';
import * as UserCourseService from '../userCourse/userCourse.service';
import * as CourseUserService from '../courseUser/courseUser.service';
import {
  COURSE_RULES_AND_PATH_CALCULATE_SCORE_BY_AVERAGE_OF,
  COURSE_RULES_AND_PATH_COMPLETED_WHEN,
  COURSE_RULES_AND_PATH_SHOW_UNITS, COURSE_RULES_AND_PATH_STATUS, COURSE_STATUS, UNIT_STATUS,
  UNIT_TYPE, USER_UNIT_STATUS,
} from '../../constants';

/**
 * Create rules and path
 * @param {object} creator
 * @param {objectId} creator._id
 * @param {object} params
 * @param {string|require} params.course
 * @param {string|require} params.showUnits
 * @param {object|require} params.completedWhen
 * @param {string|require} params.completedWhen.when
 * @param {number|option} params.completedWhen.percent
 * @param {objectId[]|option} params.completedWhen.units
 * @param {objectId|option} params.completedWhen.test
 * @param {objectId|option} params.calculateScoreByAverageOf
 * @param {string|require} params.calculateScoreByAverageOf.of
 * @param {object[]|option} params.calculateScoreByAverageOf.testsAndAssignments
 * @param {objectId} params.calculateScoreByAverageOf.testsAndAssignments.unit
 * @param {number} params.calculateScoreByAverageOf.testsAndAssignments.weight
 * @param {object[]|option} params.learningPath array of object
 * @param {objectId[]|option} params.learningPath.paths array of objectId of course
 * @returns {Promise.<*>}
 */
export async function createRulesAndPath(creator, params) {
  try {
    let courseRulesAndPath = await CourseRulesAndPath.findOne({
      course: params.course,
      status: COURSE_RULES_AND_PATH_STATUS.ACTIVE,
    });
    if (courseRulesAndPath) {
      return Promise.reject(new APIError(403, [
        {
          msg: 'The course rules and path already existed',
          param: 'courseRulesAndPathExisted',
        },
      ]));
    }
    courseRulesAndPath = await CourseRulesAndPath.create({
      creator: creator._id,
      ...params,
    });
    await updateCourseRulesAndPath(params.course, courseRulesAndPath._id);
    return await CourseRulesAndPath.populate(courseRulesAndPath, [
      {
        path: 'completedWhen.units',
        select: '_id title',
      },
      {
        path: 'completedWhen.test',
        select: '_id title',
      },
      {
        path: 'calculateScoreByAverageOf.testsAndAssignments.unit',
        select: '_id title',
      },
      {
        path: 'learningPaths.paths',
        select: '_id name code',
      },
    ]);
  } catch (error) {
    logger.error('CourseRulesAndPathService createRulesAndPath error:', error);
    throw error;
  }
}

/**
 * Update Course rules and path
 * @param {objectId} id the courseRulesAndPath id
 * @param {object} params
 * @param {string|require} params.showUnits
 * @param {object|require} params.completedWhen
 * @param {string|require} params.completedWhen.when
 * @param {number|option} params.completedWhen.percent
 * @param {objectId[]|option} params.completedWhen.units
 * @param {objectId|option} params.completedWhen.test
 * @param {objectId|option} params.calculateScoreByAverageOf
 * @param {string|require} params.calculateScoreByAverageOf.of
 * @param {object[]|option} params.calculateScoreByAverageOf.testsAndAssignments
 * @param {objectId} params.calculateScoreByAverageOf.testsAndAssignments.unit
 * @param {number} params.calculateScoreByAverageOf.testsAndAssignments.weight
 * @param {object[]|option} params.learningPath array of object
 * @param {objectId[]|option} params.learningPath.paths array of objectId of course
 * @returns {Promise.<*>}
 */
export async function updateRulesAndPath(id, params) {
  try {
    const validFields = ['showUnits', 'completedWhen', 'calculateScoreByAverageOf', 'learningPaths'];
    const updateValues = {};
    validFields.forEach((validField) => {
      if (params[validField]) {
        updateValues[validField] = params[validField];
      }
    });
    if (Object.keys(updateValues).length > 0) {
      const updateResult = await CourseRulesAndPath.updateOne({
        _id: id,
      }, {
        $set: updateValues,
      });
      if (!updateResult.nModified) {
        return Promise.reject(new APIError(304, 'Not Modified'));
      }
      return await CourseRulesAndPath.findOne({
        _id: id,
      }).populate([
        {
          path: 'completedWhen.units',
          select: '_id title',
        },
        {
          path: 'completedWhen.test',
          select: '_id title',
        },
        {
          path: 'calculateScoreByAverageOf.testsAndAssignments.unit',
          select: '_id title',
        },
        {
          path: 'learningPaths.paths',
          select: '_id name code',
        },
      ]);
    }
    return Promise.reject(new APIError(304, 'Not Modified'));
  } catch (error) {
    logger.error('CourseRulesAndPathService updateRulesAndPath error:', error);
    throw error;
  }
}

/**
 * Get rules and path detail
 * @param id the courseRulesAndPath id
 * @returns {Promise.<*>}
 */
export async function getRulesAndPath(id) {
  try {
    return await CourseRulesAndPath.findOne({
      _id: id,
      status: COURSE_RULES_AND_PATH_STATUS.ACTIVE,
    }).populate([
      {
        path: 'completedWhen.units',
        select: 'title',
        match: { status: UNIT_STATUS.ACTIVE },
      },
      {
        path: 'completedWhen.test',
        select: 'title',
        match: { status: UNIT_STATUS.ACTIVE },
      },
      {
        path: 'calculateScoreByAverageOf.testsAndAssignments.unit',
        select: 'title',
        match: { status: UNIT_STATUS.ACTIVE },
      },
      {
        path: 'learningPaths.paths',
        select: 'name code',
        match: { status: COURSE_STATUS.ACTIVE },
      },
    ]);
  } catch (error) {
    logger.error('CourseRulesAndPathService getRulesAndPath error:', error);
    throw error;
  }
}

/**
 * Get rules and path show units option
 * @param courseId the course id
 * @returns {Promise.<*>}
 */
export async function getRulesAndPathShowUnitsOption(courseId) {
  try {
    if (!courseId) {
      return COURSE_RULES_AND_PATH_SHOW_UNITS.IN_ANY_ORDER;
    }
    const courseRulesAndPath = await CourseRulesAndPath.findOne({
      course: courseId,
      status: COURSE_RULES_AND_PATH_STATUS.ACTIVE,
    });
    return courseRulesAndPath?.showUnits ?? COURSE_RULES_AND_PATH_SHOW_UNITS.IN_ANY_ORDER;
  } catch (error) {
    logger.error('CourseRulesAndPathService getRulesAndPathShowUnitsOption error:', error);
    throw error;
  }
}

/**
 * Check user completed course yet
 * @param user
 * @param user._id the user id
 * @param courseId the course id
 * @returns {Promise.<*>}
 */
export async function checkCourseCompleted(user, courseId) {
  try {
    const courseRulesAndPath = await CourseRulesAndPath.findOne({
      course: courseId,
      status: COURSE_RULES_AND_PATH_STATUS.ACTIVE,
    }).populate([
      {
        path: 'completedWhen.units',
        select: 'title',
        match: { status: UNIT_STATUS.ACTIVE },
      },
      {
        path: 'completedWhen.test',
        select: 'title',
        match: { status: UNIT_STATUS.ACTIVE },
      },
    ]);
    const unitCompletedPercent = await UserCourseService.getUnitCompleted(courseId, user);
    await CourseUserService.setCourseCompletedPercent(user._id, courseId, unitCompletedPercent);
    // Read course complete rules
    // Check condition for each type
    const completedWhen = courseRulesAndPath?.completedWhen?.when ?? COURSE_RULES_AND_PATH_COMPLETED_WHEN.ALL_UNITS_ARE_COMPLETED;
    switch (completedWhen) {
      case COURSE_RULES_AND_PATH_COMPLETED_WHEN.ALL_UNITS_ARE_COMPLETED:
        const { unitsCompleted, totalUnits } = await UserCourseService.countCourseUnitsAndUnitsUserCompleted(courseId, user);
        return unitsCompleted >= totalUnits;
      case COURSE_RULES_AND_PATH_COMPLETED_WHEN.A_PERCENTAGE_OF_UNIT_ARE_COMPLETED:
        const requiredPercent = courseRulesAndPath?.completedWhen?.percent ?? 0;
        return unitCompletedPercent >= requiredPercent;
      case COURSE_RULES_AND_PATH_COMPLETED_WHEN.SELECTED_UNITS_ARE_COMPLETED:
        // Check all selected units are completed yet
        const unitsMustToComplete = courseRulesAndPath?.completedWhen?.units?.filter(unit => !!unit._id)?.map(unit => unit._id) ?? [];
        return await UserCourseService.isAllUnitsCompleted(user, unitsMustToComplete);
      case COURSE_RULES_AND_PATH_COMPLETED_WHEN.SELECTED_TEST_IS_PASSED:
        // Check the selected test is completed yet
        const testMustToComplete = courseRulesAndPath?.completedWhen?.test?._id ?? null;
        return await UserCourseService.isUnitCompleted(user, testMustToComplete);
      default:
        return false;
    }
  } catch (error) {
    logger.error('CourseRulesAndPathService checkCourseCompleted error:', error);
    throw error;
  }
}

async function getAverageScoreOfUnits(userId, courseId, types) {
  if (!types) {
    throw new Error('Please provide unit types');
  }
  try {
    const conditions = { course: courseId };
    if (types instanceof Array) {
      conditions.type = { $in: types };
    } else {
      conditions.type = types;
    }
    const numUnits = await Unit.countDocuments({ ...conditions, status: UNIT_STATUS.ACTIVE });
    const userUnits = await UserUnit.find({ ...conditions, user: userId, status: { $ne: USER_UNIT_STATUS.INACTIVE } }, 'points');
    if (!userUnits?.length || numUnits === 0) {
      return 0;
    }
    let score = 0;
    userUnits.forEach((userUnit) => {
      score += userUnit?.points ?? 0;
    });
    return (score / numUnits);
  } catch (error) {
    logger.error(`CourseRulesAndPathService getAverageScoreOfUnits error: ${error}`);
    throw error;
  }
}

/**
 * Get user average points of tests and assignments have been choose
 * @param {object} userId
 * @param {object[]} testsAndAssignments
 * @param {objectId} testsAndAssignments.unit
 * @param {number} testsAndAssignments.weight
 * @returns {Promise<number>}
 */
async function getUserAverageScoreOfTestsAndAssignments(userId, testsAndAssignments) {
  if (!userId) {
    throw new Error('Please provide user id');
  }
  if (!testsAndAssignments) {
    throw new Error('Please provide tests and assignments');
  }
  try {
    let totalWeight = 0;
    const units = testsAndAssignments.map((testsAndAssignment) => {
      totalWeight += testsAndAssignment.weight;
      return testsAndAssignment.unit;
    });
    if (totalWeight === 0) {
      return 0;
    }
    const conditions = { user: userId, unit: { $in: units } };
    const userUnits = await UserUnit.find(conditions, 'points unit');
    if (!userUnits?.length) {
      return 0;
    }
    let score = 0;
    const objectUserUnits = {};
    userUnits.forEach((userUnit) => {
      objectUserUnits[userUnit.unit] = userUnit;
    });
    testsAndAssignments.forEach((testsAndAssignment) => {
      const userUnit = objectUserUnits[testsAndAssignment.unit];
      const points = userUnit?.points ?? 0;
      const weight = testsAndAssignment?.weight ?? 1;
      score += (points * weight);
    });
    return (score / totalWeight);
  } catch (error) {
    logger.error(`CourseRulesAndPathService getUserAverageScoreOfTestsAndAssignments error: ${error}`);
    throw error;
  }
}

/**
 * Calculate user course score by average of
 * @param userId the user id
 * @param courseId the course id
 * @returns {Promise.<*>}
 */
export async function calculateUserCourseScoreByAverageOf(userId, courseId) {
  try {
    const courseRulesAndPath = await CourseRulesAndPath.findOne({
      course: courseId,
      status: COURSE_RULES_AND_PATH_STATUS.ACTIVE,
    });
    const of = courseRulesAndPath?.calculateScoreByAverageOf?.of ?? COURSE_RULES_AND_PATH_CALCULATE_SCORE_BY_AVERAGE_OF.ALL_TESTS_AND_ASSIGNMENTS;
    switch (of) {
      case COURSE_RULES_AND_PATH_CALCULATE_SCORE_BY_AVERAGE_OF.ALL_TESTS_AND_ASSIGNMENTS:
        return await getAverageScoreOfUnits(userId, courseId, [UNIT_TYPE.TEST, UNIT_TYPE.ASSIGNMENT]);
      case COURSE_RULES_AND_PATH_CALCULATE_SCORE_BY_AVERAGE_OF.TESTS_ONLY:
        return await getAverageScoreOfUnits(userId, courseId, [UNIT_TYPE.TEST]);
      case COURSE_RULES_AND_PATH_CALCULATE_SCORE_BY_AVERAGE_OF.TESTS_AND_ASSIGNMENTS_CHOOSE:
        const testsAndAssignments = courseRulesAndPath?.calculateScoreByAverageOf?.testsAndAssignments ?? [];
        // Get avg points of tests and assignments have been choose
        return await getUserAverageScoreOfTestsAndAssignments(userId, testsAndAssignments);
      default:
        return 0;
    }
  } catch (error) {
    logger.error('CourseRulesAndPathService calculateUserCourseScoreByAverageOf error:', error);
    throw error;
  }
}

/**
 * Check course learning paths is completed
 * @param user
 * @param user._id the user id
 * @param courseId the course id
 * @returns {Promise.<*>}
 */
export async function checkCourseLearningPath(courseId, user) {
  try {
    const courseRulesAndPath = await CourseRulesAndPath.findOne({
      course: courseId,
      status: COURSE_RULES_AND_PATH_STATUS.ACTIVE,
    }).populate([
      {
        path: 'learningPaths.paths',
        select: 'name code',
        match: { status: COURSE_STATUS.ACTIVE },
      },
    ]);
    let learningPaths = courseRulesAndPath?.learningPaths?.map((learningPath) => {
      const paths = learningPath?.paths?.filter(path => !!path._id);
      return paths.length ? paths : null;
    }) ?? [];
    learningPaths = learningPaths.filter(learningPath => learningPath !== null);
    if (!learningPaths || learningPaths?.length === 0) {
      return true;
    }
    const length = learningPaths.length;
    let index = 0;
    for (; index < length; index += 1) {
      // eslint-disable-next-line no-await-in-loop
      const paths = learningPaths?.[index]?.map(learningPath => learningPath._id) ?? [];
      if (!paths.length || await CourseUserService.isAllCoursesCompleted(user, paths)) {
        return true;
      }
    }
    return false;
  } catch (error) {
    logger.error('CourseRulesAndPathService checkCourseLearningPath error:', error);
    throw error;
  }
}
