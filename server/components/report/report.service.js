import logger from '../../util/logger';
import {
 DEFAULT_PAGE_LIMIT, MAX_PAGE_LIMIT, USER_UNIT_STATUS, UNIT_TYPE, UNIT_STATUS, ORDER_BY, TEST_REPORT_ORDER_FIELDS, SURVEY_REPORT_ORDER_FIELDS, ASSIGNMENT_REPORT_ORDER_FIELDS, SCORM_REPORT_ORDER_FIELDS, COURSE_STATUS, DETAIL_TEST_REPORT_ODER_FIELDS, DETAIL_SURVEY_REPORT_ORDER_FIELDS, DETAIL_ASSIGNMENT_REPORT_ORDER_FIELDS, DETAIL_SCORM_REPORT_ORDER_FIELDS
} from '../../constants';
import Unit from '../unit/unit.model';
import Course from '../course/course.model';
import UserUnit from '../userUnit/userUnit.model';
import APIError from '../../util/APIError';
import { validSearchString, getObjectId } from '../../helpers/string.helper';
import UserQuestion from '../question/userQuestion.model';
import UserSurvey from '../survey/userSurvey.model';
import { getFileById, getFilesByConditions, getUserFile } from '../file/file.service';

/**
 * Get report Test
 * @param query
 * @param auth
 * @returns {Promise<void>}
 */
export async function getReportsTest(_page = 1, rowPerPage, options) {
  const {
    textSearch, courseId, auth, order, orderBy, status, courseStatus
  } = options;
  try {
    let page = Number(_page || 1).valueOf();
    if (page < 1) {
      page = 1;
    }
    let pageLimit = Number(rowPerPage || DEFAULT_PAGE_LIMIT).valueOf();
    if (pageLimit > MAX_PAGE_LIMIT || pageLimit < 1) {
      pageLimit = DEFAULT_PAGE_LIMIT;
    }
    const skip = (page - 1) * pageLimit;
    const sortCondition = {};
    const orderByValue = ORDER_BY[orderBy] || ORDER_BY.asc;
    if (order && TEST_REPORT_ORDER_FIELDS[order]) {
      sortCondition[TEST_REPORT_ORDER_FIELDS[order]] = orderByValue;
    } else {
      sortCondition._id = -1;
    }
    const matchCondition = { type: UNIT_TYPE.TEST, status: { $in: [UNIT_STATUS.ACTIVE, UNIT_STATUS.INACTIVE] } };
    if (typeof status === 'string' && UNIT_STATUS[status]) {
      matchCondition.status = UNIT_STATUS[status];
    }
    if (textSearch) {
      matchCondition.title = { $regex: validSearchString(textSearch) };
    }
    if (courseId) {
      matchCondition.course = getObjectId(courseId);
    }
    const conditionStatusCourse = {};
    if (typeof courseStatus === 'string' && COURSE_STATUS[courseStatus]) {
      conditionStatusCourse['course.status'] = COURSE_STATUS[courseStatus];
    }
    const aggregateConditions = [
      {
        $match: matchCondition,
      },
      {
        $lookup: {
          from: 'courses',
          localField: 'course',
          foreignField: '_id',
          as: 'course',
        }
      },
      {
        $lookup: {
          from: 'userunits',
          as: 'units',
          let: { unitId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$unit', '$$unitId'] }
                  ]
                }
              }
            },
          ],
        },
      },
      {
        $lookup: {
          from: 'userunits',
          as: 'completed',
          let: { unitId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$unit', '$$unitId'] },
                    { $eq: ['$status', USER_UNIT_STATUS.COMPLETED] },
                  ]
                }
              }
            },
          ],
        },
      },
      {
        $lookup: {
          from: 'userunits',
          as: 'failed',
          let: { unitId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$unit', '$$unitId'] },
                    { $eq: ['$status', USER_UNIT_STATUS.INACTIVE] },
                  ]
                }
              }
            },
          ],
        },
      },
      {
        $project: {
          _id: 1,
          status: 1,
          title: 1,
          createdAt: 1,
          course: { $arrayElemAt: ['$course', 0] },
          units: 1,
          completed: 1,
          failed: 1,
        }
      }, {
        $project: {
          _id: 1,
          status: 1,
          title: 1,
          createdAt: 1,
          course: {
            _id: 1,
            name: 1,
            code: 1,
            status: 1
          },
          units: 1,
          total: { $size: '$units' },
          completed: { $size: '$completed' },
          failed: { $size: '$failed' },
        }
      },
      {
        $unwind:
          {
            path: '$units',
            preserveNullAndEmptyArrays: true
          }
      },
      {
        $group: {
          _id: '$_id',
          title: { $first: '$title' },
          status: { $first: '$status' },
          createdAt: { $first: '$createdAt' },
          course: { $first: '$course' },
          total: { $first: '$total' },
          completed: { $first: '$completed' },
          failed: { $first: '$failed' },
          avg_position: {
            $avg: '$units.points'
          }
        }
      },
      {
        $match: conditionStatusCourse,
      },
      {
        $sort: sortCondition,
      },
      {
        $skip: skip,
      },
      {
        $limit: pageLimit,
      },
    ];
    const { title, course, ...matchConditionWithoutSearch } = matchCondition;
    matchConditionWithoutSearch.status = { $in: [USER_UNIT_STATUS.COMPLETED, USER_UNIT_STATUS.INACTIVE] };
    const total = await Unit.countDocuments(matchConditionWithoutSearch);
    const totalItems = await Unit.aggregate([
      {
        $match: matchCondition
      },
      {
        $lookup: {
          from: 'courses',
          localField: 'course',
          foreignField: '_id',
          as: 'course',
        }
      },
      {
        $lookup: {
          from: 'userunits',
          as: 'units',
          let: { unitId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$unit', '$$unitId'] }
                  ]
                }
              }
            },
          ],
        },
      },
      {
        $lookup: {
          from: 'userunits',
          as: 'completed',
          let: { unitId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$unit', '$$unitId'] },
                    { $eq: ['$status', USER_UNIT_STATUS.COMPLETED] },
                  ]
                }
              }
            },
          ],
        },
      },
      {
        $lookup: {
          from: 'userunits',
          as: 'failed',
          let: { unitId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$unit', '$$unitId'] },
                    { $eq: ['$status', USER_UNIT_STATUS.INACTIVE] },
                  ]
                }
              }
            },
          ],
        },
      },
      {
        $project: {
          _id: 1,
          status: 1,
          title: 1,
          createdAt: 1,
          course: { $arrayElemAt: ['$course', 0] },
          units: 1,
          completed: 1,
          failed: 1,
        }
      }, {
        $project: {
          _id: 1,
          status: 1,
          title: 1,
          createdAt: 1,
          course: {
            _id: 1,
            name: 1,
            code: 1,
            status: 1
          },
          units: 1,
          total: { $size: '$units' },
          completed: { $size: '$completed' },
          failed: { $size: '$failed' },
        }
      },
      {
        $unwind:
          {
            path: '$units',
            preserveNullAndEmptyArrays: true
          }
      },
      {
        $group: {
          _id: '$_id',
          title: { $first: '$title' },
          status: { $first: '$status' },
          createdAt: { $first: '$createdAt' },
          course: { $first: '$course' },
          total: { $first: '$total' },
          completed: { $first: '$completed' },
          failed: { $first: '$failed' },
          avg_position: {
            $avg: '$units.points'
          }
        }
      },
      {
        $match: conditionStatusCourse,
      },
      {
        $group: { _id: null, count: { $sum: 1 } }
      }
    ]);
    const totalAttempt = await UserUnit.countDocuments({
      type: UNIT_TYPE.TEST,
      status: { $in: [USER_UNIT_STATUS.COMPLETED, USER_UNIT_STATUS.INACTIVE] },
      unitStatus: { $ne: UNIT_STATUS.DELETED }
    });
    const totalPassed = await UserUnit.countDocuments({
      type: UNIT_TYPE.TEST,
      status: USER_UNIT_STATUS.COMPLETED,
      unitStatus: { $ne: UNIT_STATUS.DELETED }
    });
    const data = await Unit.aggregate(aggregateConditions);
    const avg = await UserUnit.aggregate(
      [
        { $match:
          {
            type: UNIT_TYPE.TEST,
            status: { $in: [USER_UNIT_STATUS.COMPLETED, USER_UNIT_STATUS.INACTIVE] },
            unitStatus: { $ne: UNIT_STATUS.DELETED }
          }
        },
        {
          $group:
            {
              _id: null,
              avg: { $avg: '$points' }
            }
        }
      ]
    );
    const resultTotalItems = totalItems.length ? totalItems[0].count : 0;
    return {
      data,
      currentPage: Number(_page),
      totalPage: Math.ceil(resultTotalItems / pageLimit),
      total,
      totalItems: resultTotalItems,
      totalAttempt,
      avg: avg?.length ? avg[0].avg : 0,
      totalPassed
    };
  } catch (error) {
    logger.error('getReportsTest error:', error);
    throw new APIError(500, 'Internal server error');
  }
}

/**
 * Get report Test
 * @param query
 * @param auth
 * @returns {Promise<void>}
 */
export async function getReportsSurvey(_page = 1, rowPerPage, options) {
  const {
    textSearch, courseId, order, orderBy, status, courseStatus
  } = options;
  try {
    let page = Number(_page || 1).valueOf();
    if (page < 1) {
      page = 1;
    }
    let pageLimit = Number(rowPerPage || DEFAULT_PAGE_LIMIT).valueOf();
    if (pageLimit > MAX_PAGE_LIMIT || pageLimit < 1) {
      pageLimit = DEFAULT_PAGE_LIMIT;
    }
    const skip = (page - 1) * pageLimit;
    const sortCondition = {};
    const orderByValue = ORDER_BY[orderBy] || ORDER_BY.asc;
    if (order && SURVEY_REPORT_ORDER_FIELDS[order]) {
      sortCondition[SURVEY_REPORT_ORDER_FIELDS[order]] = orderByValue;
    } else {
      sortCondition._id = -1;
    }
    const matchCondition = { type: UNIT_TYPE.SURVEY, status: { $in: [UNIT_STATUS.ACTIVE, UNIT_STATUS.INACTIVE] } };
    if (typeof status === 'string' && UNIT_STATUS[status]) {
      matchCondition.status = UNIT_STATUS[status];
    }
    if (textSearch) {
      matchCondition.title = { $regex: validSearchString(textSearch) };
    }
    if (courseId) {
      matchCondition.course = getObjectId(courseId);
    }
    const conditionStatusCourse = {};
    if (typeof courseStatus === 'string' && COURSE_STATUS[courseStatus]) {
      conditionStatusCourse['course.status'] = COURSE_STATUS[courseStatus];
    }
    const aggregateConditions = [
      {
        $match: matchCondition,
      },
      {
        $lookup: {
          from: 'courses',
          localField: 'course',
          foreignField: '_id',
          as: 'course',
        }
      },
      {
        $lookup: {
          from: 'userunits',
          as: 'units',
          let: { unitId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$unit', '$$unitId'] }
                  ]
                }
              }
            },
          ],
        },
      },
      {
        $project: {
          _id: 1,
          status: 1,
          title: 1,
          createdAt: 1,
          course: { $arrayElemAt: ['$course', 0] },
          units: 1
        }
      },
      {
        $project: {
          _id: 1,
          status: 1,
          title: 1,
          createdAt: 1,
          course: {
            _id: 1,
            name: 1,
            code: 1,
            status: 1
          },
          total: { $size: '$units' }
        }
      },
      {
        $match: conditionStatusCourse
      },
      {
        $sort: sortCondition,
      },
      {
        $skip: skip,
      },
      {
        $limit: pageLimit,
      },
    ];
    const { title, course, ...matchConditionWithoutSearch } = matchCondition;
    matchConditionWithoutSearch.status = { $in: [UNIT_STATUS.ACTIVE, UNIT_STATUS.INACTIVE] };
    const total = await Unit.countDocuments(matchConditionWithoutSearch);
    const totalItems = await Unit.aggregate([
      {
        $match: matchCondition,
      },
      {
        $lookup: {
          from: 'courses',
          localField: 'course',
          foreignField: '_id',
          as: 'course',
        }
      },
      {
        $lookup: {
          from: 'userunits',
          as: 'units',
          let: { unitId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$unit', '$$unitId'] }
                  ]
                }
              }
            },
          ],
        },
      },
      {
        $project: {
          _id: 1,
          status: 1,
          title: 1,
          createdAt: 1,
          course: { $arrayElemAt: ['$course', 0] },
          units: 1
        }
      },
      {
        $project: {
          _id: 1,
          status: 1,
          title: 1,
          createdAt: 1,
          course: {
            _id: 1,
            name: 1,
            code: 1,
            status: 1
          },
          total: { $size: '$units' }
        }
      },
      {
        $match: conditionStatusCourse
      },
      {
        $group: { _id: null, count: { $sum: 1 } }
      }
    ]);
    const resultTotalItems = totalItems.length ? totalItems[0].count : 0;
    const totalAttempt = await UserUnit.countDocuments({
      type: UNIT_TYPE.SURVEY,
      unitStatus: { $ne: UNIT_STATUS.DELETED }
    });
    const data = await Unit.aggregate(aggregateConditions);
    return {
      data,
      currentPage: Number(_page),
      totalPage: Math.ceil(resultTotalItems / pageLimit),
      total,
      totalItems: resultTotalItems,
      totalAttempt
    };
  } catch (error) {
    logger.error('getReportsSurvey error:', error);
    throw new APIError(500, 'Internal server error');
  }
}

/**
 * Get report Assignment
 * @param query
 * @param auth
 * @returns {Promise<void>}
 */
export async function getReportsAssignment(_page = 1, rowPerPage, options) {
  const {
    textSearch, courseId, order, orderBy, status, courseStatus
  } = options;
  try {
    let page = Number(_page || 1).valueOf();
    if (page < 1) {
      page = 1;
    }
    let pageLimit = Number(rowPerPage || DEFAULT_PAGE_LIMIT).valueOf();
    if (pageLimit > MAX_PAGE_LIMIT || pageLimit < 1) {
      pageLimit = DEFAULT_PAGE_LIMIT;
    }
    const skip = (page - 1) * pageLimit;
    const sortCondition = {};
    const orderByValue = ORDER_BY[orderBy] || ORDER_BY.asc;
    if (order && ASSIGNMENT_REPORT_ORDER_FIELDS[order]) {
      sortCondition[ASSIGNMENT_REPORT_ORDER_FIELDS[order]] = orderByValue;
    } else {
      sortCondition._id = -1;
    }
    const matchCondition = { type: UNIT_TYPE.ASSIGNMENT, status: { $in: [UNIT_STATUS.ACTIVE, UNIT_STATUS.INACTIVE] } };
    if (typeof status === 'string' && UNIT_STATUS[status]) {
      matchCondition.status = UNIT_STATUS[status];
    }
    if (textSearch) {
      matchCondition.title = { $regex: validSearchString(textSearch) };
    }
    if (courseId) {
      matchCondition.course = getObjectId(courseId);
    }
    const conditionStatusCourse = {};
    if (typeof courseStatus === 'string' && COURSE_STATUS[courseStatus]) {
      conditionStatusCourse['course.status'] = COURSE_STATUS[courseStatus];
    }
    const aggregateConditions = [
      {
        $match: matchCondition,
      },
      {
        $lookup: {
          from: 'courses',
          localField: 'course',
          foreignField: '_id',
          as: 'course',
        }
      },
      {
        $lookup: {
          from: 'userunits',
          as: 'units',
          let: { unitId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$unit', '$$unitId'] }
                  ]
                }
              }
            },
          ],
        },
      },
      {
        $lookup: {
          from: 'userunits',
          as: 'units',
          let: { unitId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$unit', '$$unitId'] }
                  ]
                }
              }
            },
          ],
        },
      },
      {
        $lookup: {
          from: 'userunits',
          as: 'completed',
          let: { unitId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$unit', '$$unitId'] },
                    { $eq: ['$status', USER_UNIT_STATUS.COMPLETED] },
                  ]
                }
              }
            },
          ],
        },
      },
      {
        $project: {
          _id: 1,
          status: 1,
          title: 1,
          createdAt: 1,
          course: { $arrayElemAt: ['$course', 0] },
          units: 1,
          completed: 1
        }
      }, {
        $project: {
          _id: 1,
          status: 1,
          title: 1,
          createdAt: 1,
          course: {
            _id: 1,
            name: 1,
            code: 1,
            status: 1
          },
          units: 1,
          total: { $size: '$units' },
          completed: { $size: '$completed' }
        }
      },
      {
        $unwind:
          {
            path: '$units',
            preserveNullAndEmptyArrays: true
          }
      },
      {
        $group: {
          _id: '$_id',
          title: { $first: '$title' },
          status: { $first: '$status' },
          createdAt: { $first: '$createdAt' },
          course: { $first: '$course' },
          total: { $first: '$total' },
          completed: { $first: '$completed' },
          avg_position: {
            $avg: '$units.result.grade'
          }
        }
      },
      {
        $match: conditionStatusCourse
      },
      {
        $sort: sortCondition,
      },
      {
        $skip: skip,
      },
      {
        $limit: pageLimit,
      },
    ];
    const { title, course, ...matchConditionWithoutSearch } = matchCondition;
    matchConditionWithoutSearch.status = { $in: [UNIT_STATUS.ACTIVE, UNIT_STATUS.INACTIVE] };
    const total = await Unit.countDocuments(matchConditionWithoutSearch);
    const totalItems = await Unit.aggregate([
      {
        $match: matchCondition,
      },
      {
        $lookup: {
          from: 'courses',
          localField: 'course',
          foreignField: '_id',
          as: 'course',
        }
      },
      {
        $lookup: {
          from: 'userunits',
          as: 'units',
          let: { unitId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$unit', '$$unitId'] }
                  ]
                }
              }
            },
          ],
        },
      },
      {
        $lookup: {
          from: 'userunits',
          as: 'units',
          let: { unitId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$unit', '$$unitId'] }
                  ]
                }
              }
            },
          ],
        },
      },
      {
        $lookup: {
          from: 'userunits',
          as: 'completed',
          let: { unitId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$unit', '$$unitId'] },
                    { $eq: ['$status', USER_UNIT_STATUS.COMPLETED] },
                  ]
                }
              }
            },
          ],
        },
      },
      {
        $project: {
          _id: 1,
          status: 1,
          title: 1,
          createdAt: 1,
          course: { $arrayElemAt: ['$course', 0] },
          units: 1,
          completed: 1
        }
      }, {
        $project: {
          _id: 1,
          status: 1,
          title: 1,
          createdAt: 1,
          course: {
            _id: 1,
            name: 1,
            code: 1,
            status: 1
          },
          units: 1,
          total: { $size: '$units' },
          completed: { $size: '$completed' }
        }
      },
      {
        $unwind:
          {
            path: '$units',
            preserveNullAndEmptyArrays: true
          }
      },
      {
        $group: {
          _id: '$_id',
          title: { $first: '$title' },
          status: { $first: '$status' },
          createdAt: { $first: '$createdAt' },
          course: { $first: '$course' },
          total: { $first: '$total' },
          completed: { $first: '$completed' },
          avg_position: {
            $avg: '$units.result.grade'
          }
        }
      },
      {
        $match: conditionStatusCourse
      },
      {
        $group: { _id: null, count: { $sum: 1 } }
      }
    ]);
    const totalAttempt = await UserUnit.countDocuments({
      type: UNIT_TYPE.ASSIGNMENT,
      unitStatus: { $ne: UNIT_STATUS.DELETED }
    });
    const data = await Unit.aggregate(aggregateConditions);
    const totalPassed = await UserUnit.countDocuments({
      type: UNIT_TYPE.ASSIGNMENT,
      status: USER_UNIT_STATUS.COMPLETED,
      unitStatus: { $ne: UNIT_STATUS.DELETED }
    });
    const resultTotalItems = totalItems.length ? totalItems[0].count : 0;
    return {
      data,
      currentPage: Number(_page),
      totalPage: Math.ceil(resultTotalItems / pageLimit),
      total,
      totalItems: resultTotalItems,
      totalAttempt,
      totalPassed
    };
  } catch (error) {
    logger.error('getReportsSurvey error:', error);
    throw new APIError(500, 'Internal server error');
  }
}

/**
 * Get report Scorm
 * @param query
 * @param auth
 * @returns {Promise<void>}
 */
export async function getReportsScorm(_page = 1, rowPerPage, options) {
  const {
    textSearch, courseId, auth, order, orderBy, status, courseStatus
  } = options;
  try {
    let page = Number(_page || 1).valueOf();
    if (page < 1) {
      page = 1;
    }
    let pageLimit = Number(rowPerPage || DEFAULT_PAGE_LIMIT).valueOf();
    if (pageLimit > MAX_PAGE_LIMIT || pageLimit < 1) {
      pageLimit = DEFAULT_PAGE_LIMIT;
    }
    const skip = (page - 1) * pageLimit;
    const sortCondition = {};
    const orderByValue = ORDER_BY[orderBy] || ORDER_BY.asc;
    if (order && SCORM_REPORT_ORDER_FIELDS[order]) {
      sortCondition[SCORM_REPORT_ORDER_FIELDS[order]] = orderByValue;
    } else {
      sortCondition._id = -1;
    }
    const matchCondition = { type: UNIT_TYPE.SCORM, status: { $in: [UNIT_STATUS.ACTIVE, UNIT_STATUS.INACTIVE] } };
    if (typeof status === 'string' && UNIT_STATUS[status]) {
      matchCondition.status = UNIT_STATUS[status];
    }
    if (textSearch) {
      matchCondition.title = { $regex: validSearchString(textSearch) };
    }
    if (courseId) {
      matchCondition.course = getObjectId(courseId);
    }
    const conditionStatusCourse = {};
    if (typeof courseStatus === 'string' && COURSE_STATUS[courseStatus]) {
      conditionStatusCourse['course.status'] = COURSE_STATUS[courseStatus];
    }
    const aggregateConditions = [
      {
        $match: matchCondition,
      },
      {
        $lookup: {
          from: 'courses',
          localField: 'course',
          foreignField: '_id',
          as: 'course',
        }
      },
      {
        $lookup: {
          from: 'userunits',
          as: 'units',
          let: { unitId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$unit', '$$unitId'] }
                  ]
                }
              }
            },
          ],
        },
      },
      {
        $lookup: {
          from: 'userunits',
          as: 'units',
          let: { unitId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$unit', '$$unitId'] }
                  ]
                }
              }
            },
          ],
        },
      },
      {
        $lookup: {
          from: 'userunits',
          as: 'completed',
          let: { unitId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$unit', '$$unitId'] },
                    { $eq: ['$status', USER_UNIT_STATUS.COMPLETED] },
                  ]
                }
              }
            },
          ],
        },
      },
      {
        $project: {
          _id: 1,
          status: 1,
          title: 1,
          createdAt: 1,
          course: { $arrayElemAt: ['$course', 0] },
          units: 1,
          completed: 1
        }
      }, {
        $project: {
          _id: 1,
          status: 1,
          title: 1,
          createdAt: 1,
          course: {
            _id: 1,
            name: 1,
            code: 1,
            status: 1
          },
          units: 1,
          total: { $size: '$units' },
          completed: { $size: '$completed' }
        }
      },
      {
        $unwind:
          {
            path: '$units',
            preserveNullAndEmptyArrays: true
          }
      },
      {
        $group: {
          _id: '$_id',
          title: { $first: '$title' },
          status: { $first: '$status' },
          createdAt: { $first: '$createdAt' },
          course: { $first: '$course' },
          total: { $first: '$total' },
          completed: { $first: '$completed' },
          avg_position: {
            $avg: '$units.result.grade'
          }
        }
      },
      {
        $match: conditionStatusCourse
      },
      {
        $sort: sortCondition,
      },
      {
        $skip: skip,
      },
      {
        $limit: pageLimit,
      },
    ];

    const { title, course, ...matchConditionWithoutSearch } = matchCondition;
    matchConditionWithoutSearch.status = { $in: [UNIT_STATUS.ACTIVE, UNIT_STATUS.INACTIVE] };
    const total = await Unit.countDocuments(matchConditionWithoutSearch);
    const totalItems = await Unit.aggregate([
      {
        $match: matchCondition,
      },
      {
        $lookup: {
          from: 'courses',
          localField: 'course',
          foreignField: '_id',
          as: 'course',
        }
      },
      {
        $lookup: {
          from: 'userunits',
          as: 'units',
          let: { unitId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$unit', '$$unitId'] }
                  ]
                }
              }
            },
          ],
        },
      },
      {
        $lookup: {
          from: 'userunits',
          as: 'units',
          let: { unitId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$unit', '$$unitId'] }
                  ]
                }
              }
            },
          ],
        },
      },
      {
        $lookup: {
          from: 'userunits',
          as: 'completed',
          let: { unitId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$unit', '$$unitId'] },
                    { $eq: ['$status', USER_UNIT_STATUS.COMPLETED] },
                  ]
                }
              }
            },
          ],
        },
      },
      {
        $project: {
          _id: 1,
          status: 1,
          title: 1,
          createdAt: 1,
          course: { $arrayElemAt: ['$course', 0] },
          units: 1,
          completed: 1
        }
      }, {
        $project: {
          _id: 1,
          status: 1,
          title: 1,
          createdAt: 1,
          course: {
            _id: 1,
            name: 1,
            code: 1,
            status: 1
          },
          units: 1,
          total: { $size: '$units' },
          completed: { $size: '$completed' }
        }
      },
      {
        $unwind:
          {
            path: '$units',
            preserveNullAndEmptyArrays: true
          }
      },
      {
        $group: {
          _id: '$_id',
          title: { $first: '$title' },
          status: { $first: '$status' },
          createdAt: { $first: '$createdAt' },
          course: { $first: '$course' },
          total: { $first: '$total' },
          completed: { $first: '$completed' },
          avg_position: {
            $avg: '$units.result.grade'
          }
        }
      },
      {
        $match: conditionStatusCourse
      },
      {
        $group: { _id: null, count: { $sum: 1 } }
      }
    ]);
    const totalAttempt = await UserUnit.countDocuments(matchConditionWithoutSearch);
    const data = await Unit.aggregate(aggregateConditions);
    const totalPassed = await UserUnit.countDocuments({ ...matchConditionWithoutSearch, ...{ status: USER_UNIT_STATUS.COMPLETED } });
    const resultTotalItems = totalItems.length ? totalItems[0].count : 0;
    return {
      data,
      currentPage: Number(_page),
      totalPage: Math.ceil(resultTotalItems / pageLimit),
      total,
      totalItems: resultTotalItems,
      totalAttempt,
      totalPassed
    };
  } catch (error) {
    logger.error('getReportsScorm error:', error);
    throw new APIError(500, 'Internal server error');
  }
}

export async function getReportTest(id, _page = 1, rowPerPage, options) {
  const { order, orderBy, status } = options;
  try {
    let page = Number(_page || 1).valueOf();
    if (page < 1) {
      page = 1;
    }
    let pageLimit = Number(rowPerPage || DEFAULT_PAGE_LIMIT).valueOf();
    if (pageLimit > MAX_PAGE_LIMIT || pageLimit < 1) {
      pageLimit = MAX_PAGE_LIMIT;
    }
    const sortCondition = {};
    const orderByValue = ORDER_BY[orderBy] || ORDER_BY.asc;
    if (order && DETAIL_TEST_REPORT_ODER_FIELDS[order]) {
      sortCondition[DETAIL_TEST_REPORT_ODER_FIELDS[order]] = orderByValue;
    } else {
      sortCondition._id = -1;
    }
    const skip = (page - 1) * pageLimit;
    const conditions = { unit: getObjectId(id) };
    if (typeof status === 'string' && USER_UNIT_STATUS[status]) {
      conditions.status = USER_UNIT_STATUS[status];
    }
    const aggregateConditions = [
      {
        $match: conditions,
      },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'users',
        }
      },
      {
        $lookup: {
          from: 'countunits',
          as: 'units',
          let: { unitId: '$unit', userId: '$user' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$unit', '$$unitId'] },
                    { $eq: ['$user', '$$userId'] },
                  ]
                }
              }
            },
          ],
        },
      },
      {
        $project: {
          _id: 1,
          title: 1,
          points: 1,
          status: 1,
          unit: { $arrayElemAt: ['$units', 0] },
          user: { $arrayElemAt: ['$users', 0] }
        }
      },
      {
        $project: {
          _id: 1,
          title: 1,
          points: 1,
          status: 1,
          unit: {
            _id: 1,
            count: 1,
            start_time: 1,
            end_time: 1,
          },
          user: {
            _id: 1,
            email: 1,
            fullName: 1,
            status: 1
          }
        }
      },
      {
        $sort: sortCondition,
      },
      {
        $skip: skip,
      },
      {
        $limit: pageLimit,
      },
    ];
    const data = await UserUnit.aggregate(aggregateConditions);
    const total = await UserUnit.countDocuments(conditions);
    const totalPassed = await UserUnit.countDocuments({ unit: id, status: USER_UNIT_STATUS.COMPLETED });
    const unitInfo = await Unit.findById(id, '_id title course');
    const courseInfo = await Course.findById(unitInfo.course);
    return {
      data,
      unitInfo,
      courseInfo: courseInfo ? courseInfo.toJSON() : {},
      totalPassed,
      totalItems: total,
      currentPage: Number(_page),
      totalPage: Math.ceil(total / pageLimit)
    };
  } catch (error) {
    logger.error('getReportTest error:', error);
    throw new APIError(500, 'Internal server error');
  }
}

export async function getReportSurvey(id, _page = 1, rowPerPage, options) {
  const {
    auth,
    order,
    orderBy,
    status
  } = options;
  try {
    let page = Number(_page || 1).valueOf();
    if (page < 1) {
      page = 1;
    }
    let pageLimit = Number(rowPerPage || DEFAULT_PAGE_LIMIT).valueOf();
    if (pageLimit > MAX_PAGE_LIMIT || pageLimit < 1) {
      pageLimit = MAX_PAGE_LIMIT;
    }
    const sortCondition = {};
    const orderByValue = ORDER_BY[orderBy] || ORDER_BY.asc;
    if (order && DETAIL_SURVEY_REPORT_ORDER_FIELDS[order]) {
      sortCondition[DETAIL_SURVEY_REPORT_ORDER_FIELDS[order]] = orderByValue;
    } else {
      sortCondition._id = -1;
    }
    const skip = (page - 1) * pageLimit;
    const conditions = { unit: getObjectId(id) };
    if (typeof status === 'string' && USER_UNIT_STATUS[status]) {
      conditions.status = USER_UNIT_STATUS[status];
    }
    const aggregateConditions = [
      {
        $match: conditions,
      },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'users',
        }
      },
      {
        $project: {
          _id: 1,
          title: 1,
          status: 1,
          createdAt: 1,
          user: { $arrayElemAt: ['$users', 0] }
        }
      },
      {
        $project: {
          _id: 1,
          title: 1,
          status: 1,
          createdAt: 1,
          user: {
            _id: 1,
            email: 1,
            fullName: 1,
            status: 1
          }
        }
      },
      {
        $sort: sortCondition,
      },
      {
        $skip: skip,
      },
      {
        $limit: pageLimit,
      },
    ];
    const data = await UserUnit.aggregate(aggregateConditions);
    const total = await UserUnit.countDocuments(conditions);
    const unitInfo = await Unit.findById(id, '_id title course');
    const courseInfo = await Course.findById(unitInfo.course);
    return {
      data,
      unitInfo,
      courseInfo: courseInfo ? courseInfo.toJSON() : {},
      totalItems: total,
      currentPage: Number(_page),
      totalPage: Math.ceil(total / pageLimit)
    };
  } catch (error) {
    logger.error('getReportSurvey error:', error);
    throw new APIError(500, 'Internal server error');
  }
}

export async function getReportAssignment(id, _page = 1, rowPerPage, options) {
  const {
    order,
    orderBy,
    status
  } = options;
  try {
    let page = Number(_page || 1).valueOf();
    if (page < 1) {
      page = 1;
    }
    let pageLimit = Number(rowPerPage || DEFAULT_PAGE_LIMIT).valueOf();
    if (pageLimit > MAX_PAGE_LIMIT || pageLimit < 1) {
      pageLimit = MAX_PAGE_LIMIT;
    }
    const sortCondition = {};
    const orderByValue = ORDER_BY[orderBy] || ORDER_BY.asc;
    if (order && DETAIL_ASSIGNMENT_REPORT_ORDER_FIELDS[order]) {
      sortCondition[DETAIL_ASSIGNMENT_REPORT_ORDER_FIELDS[order]] = orderByValue;
    } else {
      sortCondition._id = -1;
    }
    const skip = (page - 1) * pageLimit;
    const conditions = { unit: getObjectId(id) };
    if (typeof status === 'string' && USER_UNIT_STATUS[status]) {
      conditions.status = USER_UNIT_STATUS[status];
    }
    const aggregateConditions = [
      {
        $match: conditions,
      },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'users',
        }
      },
      {
        $project: {
          _id: 1,
          title: 1,
          result: 1,
          complete: 1,
          status: 1,
          createdAt: 1,
          user: { $arrayElemAt: ['$users', 0] }
        }
      },
      {
        $project: {
          _id: 1,
          title: 1,
          result: 1,
          complete: 1,
          status: 1,
          createdAt: 1,
          user: {
            _id: 1,
            email: 1,
            fullName: 1,
            status: 1
          }
        }
      },
      {
        $sort: sortCondition,
      },
      {
        $skip: skip,
      },
      {
        $limit: pageLimit,
      },
    ];
    let data = await UserUnit.aggregate(aggregateConditions);
    data = await Promise.all(data?.map( async item => {
      if (item?.result?.attachment?.length) {
        item.result.attachment = await getUserFile(item.result.attachment);
      }
      return item;
    }));
    const total = await UserUnit.countDocuments(conditions);
    const unitInfo = await Unit.findById(id, '_id title course');
    const courseInfo = await Course.findById(unitInfo.course);
    return {
      data: data,
      unitInfo,
      courseInfo: courseInfo ? courseInfo.toJSON() : {},
      totalItems: total,
      currentPage: Number(_page),
      totalPage: Math.ceil(total / pageLimit)
    };
  } catch (error) {
    logger.error('getReportScorm error:', error);
    throw new APIError(500, 'Internal server error');
  }
}

export async function getReportScorm(id, _page = 1, rowPerPage, options) {
  const {
    auth,
    order,
    orderBy,
    status
  } = options;
  try {
    let page = Number(_page || 1).valueOf();
    if (page < 1) {
      page = 1;
    }
    let pageLimit = Number(rowPerPage || DEFAULT_PAGE_LIMIT).valueOf();
    if (pageLimit > MAX_PAGE_LIMIT || pageLimit < 1) {
      pageLimit = MAX_PAGE_LIMIT;
    }
    const sortCondition = {};
    const orderByValue = ORDER_BY[orderBy] || ORDER_BY.asc;
    if (order && DETAIL_SCORM_REPORT_ORDER_FIELDS[order]) {
      sortCondition[DETAIL_SCORM_REPORT_ORDER_FIELDS[order]] = orderByValue;
    } else {
      sortCondition._id = -1;
    }
    const skip = (page - 1) * pageLimit;
    const conditions = { unit: getObjectId(id) };
    if (typeof status === 'string' && USER_UNIT_STATUS[status]) {
      conditions.status = USER_UNIT_STATUS[status];
    }
    const aggregateConditions = [
      {
        $match: conditions,
      },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'users',
        }
      },
      {
        $project: {
          _id: 1,
          title: 1,
          result: 1,
          complete: 1,
          status: 1,
          createdAt: 1,
          user: { $arrayElemAt: ['$users', 0] }
        }
      },
      {
        $project: {
          _id: 1,
          title: 1,
          result: 1,
          complete: 1,
          status: 1,
          createdAt: 1,
          user: {
            _id: 1,
            email: 1,
            fullName: 1,
            status: 1
          }
        }
      },
      {
        $sort: sortCondition,
      },
      {
        $skip: skip,
      },
      {
        $limit: pageLimit,
      },
    ];
    const data = await UserUnit.aggregate(aggregateConditions);
    const total = await UserUnit.countDocuments(conditions);
    const unitInfo = await Unit.findById(id, '_id title course');
    const courseInfo = await Course.findById(unitInfo.course);
    return {
      data,
      unitInfo,
      courseInfo: courseInfo ? courseInfo.toJSON() : {},
      totalItems: total,
      currentPage: Number(_page),
      totalPage: Math.ceil(total / pageLimit)
    };
  } catch (error) {
    logger.error('getReportScorm error:', error);
    throw new APIError(500, 'Internal server error');
  }
}
export async function getReportTestDetail(id) {
  try {
    const unitUser = await UserUnit.findById(id).populate([{
        path: 'user',
        select: 'firstName lastName fullName username avatar status',
      },
      { path: 'snapshot' }
    ]);
    if (!unitUser) {
      return Promise.reject(new APIError(403, [
        {
          msg: 'Report not found',
          param: 'reportNotFound',
        },
      ]));
    }
    unitUser.result = await UserQuestion.find({
      course: unitUser.course,
      unit: unitUser.unit,
      user: unitUser.user
    }).lean();
    unitUser.result = await Promise.all(unitUser.result?.map( async result => {
      if (result?.config?.file) {
        result.file = await getFileById(result?.config?.file);
      }
      return result;
    }));
    return unitUser;
  } catch (error) {
    logger.error('getReportTestDetail error:', error);
    throw new APIError(500, 'Internal server error');
  }
}

export async function getReportSurveyDetail(id, auth) {
  try {
    const unitUser = await UserUnit.findById(id).populate({
      path: 'user',
      select: 'firstName lastName fullName username avatar status',
    });
    if (!unitUser) {
      return Promise.reject(new APIError(403, [
        {
          msg: 'Report not found',
          param: 'reportNotFound',
        },
      ]));
    }
    unitUser.result = await UserSurvey.find({
      course: unitUser.course,
      unit: unitUser.unit,
      user: unitUser.user
    });
    return unitUser;
  } catch (error) {
    logger.error('getReportTestDetail error:', error);
    throw new APIError(500, 'Internal server error');
  }
}
export async function getReportAssignmentDetail(id, auth) {
  try {
    const userUnit = await UserUnit.findById(id).populate({
      path: 'user',
      select: 'firstName lastName fullName username avatar status',
    });
    userUnit.assignment = userUnit?.result;
    if (userUnit?.result?.file) {
      userUnit.assignment.file = await getUserFile(userUnit?.result?.file);
    }
    return userUnit;
  } catch (error) {
    logger.error('getReportTestDetail error:', error);
    throw new APIError(500, 'Internal server error');
  }
}

export async function getReportScormDetail(id, auth) {
  try {
    const userUnit = await UserUnit.findById(id).populate({
      path: 'user',
      select: 'firstName lastName fullName username avatar status',
    });
    userUnit.scorm = userUnit?.result;
    return userUnit;
  } catch (error) {
    logger.error('getReportScormDetail error:', error);
    throw new APIError(500, 'Internal server error');
  }
}
