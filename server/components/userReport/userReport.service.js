import User from '../user/user.model';
import CourseUser from '../courseUser/courseUser.model';
import Unit from '../unit/unit.model';
import logger from '../../util/logger';
import {
  COURSE_STATUS,
  COURSE_USER_STATUS,
  DEFAULT_PAGE_LIMIT,
  MAX_PAGE_LIMIT,
  ORDER_BY,
  UNIT_STATUS,
  UNIT_TYPE,
  USER_COURSE_ORDER_FIELDS,
  USER_REPORT_ORDER_FIELDS,
  USER_ROLES,
  USER_STATUS,
  USER_TYPE_STATUS,
} from '../../constants';
import APIError from '../../util/APIError';
import { getObjectId, validSearchString } from '../../helpers/string.helper';

/**
 * Count num users by role
 * @param {string} role
 * @returns {Promise<number>}
 */
async function countNumUsersByRole(role) {
  try {
    const counter = await User.aggregate([
      {
        $match: { status: { $in: [USER_STATUS.ACTIVE, USER_STATUS.INACTIVE] } },
      },
      {
        $lookup: {
          from: 'usertypes',
          as: 'usertypes',
          let: { type: '$type' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$_id', '$$type'] },
                    { $eq: ['$status', USER_TYPE_STATUS.ACTIVE] },
                  ]
                }
              }
            },
          ],
        },
      },
      {
        $match: {
          'usertypes.roles': role,
        },
      },
      { $group: { _id: null, totalItems: { $sum: 1 } } },
    ]);
    return counter?.[0]?.totalItems ?? 0;
  } catch (error) {
    logger.error(`UserReportService countNumUsersByRole error: ${error}`);
    throw error;
  }
}

/**
 * Count course assignments
 * @param type
 * @returns {Promise<number>}
 */
async function countNumCourseUnit(type) {
  try {
    return await Unit.countDocuments({ status: UNIT_STATUS.ACTIVE, type: type });
  } catch (error) {
    logger.error(`UserReportService countNumCourseUnit error: ${error}`);
    throw error;
  }
}

/**
 * Count course by status
 * @param status
 * @returns {Promise<number>}
 */
async function countNumUserCourses(status) {
  try {
    const result = await CourseUser.aggregate([
      {
        $match: { status: status },
      },
      {
        $lookup: {
          from: 'courses',
          localField: 'course',
          foreignField: '_id',
          as: 'course'
        }
      },
      {
        $project: {
          _id: 1,
          user: 1,
          course: { $arrayElemAt: ['$course', 0] },
        }
      },
      {
        $match: { 'course.status': COURSE_STATUS.ACTIVE },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $project: {
          _id: 1,
          user: { $arrayElemAt: ['$user', 0] },
        }
      },
      {
        $match: { 'user.status': { $in: [COURSE_STATUS.ACTIVE, COURSE_STATUS.INACTIVE] } },
      },
      { $group: { _id: null, totalCourses: { $sum: 1 } } },
    ]);
    return result?.[0]?.totalCourses ?? 0;
  } catch (error) {
    logger.error(`UserReportService countNumUserCourses error: ${error}`);
    throw error;
  }
}

/**
 * Count user assigned course by status
 * @param userId
 * @param status an array status or single string status
 * @returns {Promise<number>}
 */
async function countUserCourses(userId, status) {
  try {
    const conditions = { user: getObjectId(userId) };
    if (status instanceof Array) {
      conditions.status = { $in: status };
    } else if (typeof status === 'string') {
      conditions.status = status;
    }
    const result = await CourseUser.aggregate([
      {
        $match: conditions,
      },
      {
        $lookup: {
          from: 'courses',
          localField: 'course',
          foreignField: '_id',
          as: 'course'
        }
      },
      {
        $project: {
          _id: 1,
          user: 1,
          course: { $arrayElemAt: ['$course', 0] },
        }
      },
      {
        $match: { 'course.status': { $in: [COURSE_STATUS.ACTIVE, COURSE_STATUS.INACTIVE] } },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $project: {
          _id: 1,
          user: { $arrayElemAt: ['$user', 0] },
        }
      },
      {
        $match: { 'user.status': { $in: [USER_STATUS.ACTIVE, USER_STATUS.INACTIVE] } },
      },
      { $group: { _id: null, totalCourses: { $sum: 1 } } },
    ]);
    return result?.[0]?.totalCourses ?? 0;
  } catch (error) {
    logger.error(`UserReportService countUserCourses error: ${error}`);
    throw error;
  }
}

/**
 * Add user points
 * @param userId
 * @param points
 * @returns {Promise<boolean>}
 */
export async function addUserPoints(userId, points) {
  try {
    if (!points) {
      return false;
    }
    await User.updateOne({
      _id: userId,
    }, {
      $inc: {
        points: points,
      },
    });
    return true;
  } catch (error) {
    logger.error(`UserReportService addUserPoints error: ${error}`);
    throw error;
  }
}

/**
 * Get user report summaries
 * @returns {Promise<{completedCourses: number, learners: number, courseAssignments: number, coursesInProgress: number}>}
 */
export async function getUserReportSummaries() {
  try {
    return {
      learners: await countNumUsersByRole(USER_ROLES.LEARNER),
      courseAssignments: await countNumCourseUnit(UNIT_TYPE.ASSIGNMENT),
      completedCourses: await countNumUserCourses(COURSE_USER_STATUS.COMPLETED),
      coursesInProgress: await countNumUserCourses(COURSE_USER_STATUS.ACTIVE),
    };
  } catch (error) {
    logger.error(`UserReportService getUserReportSummaries error: ${error}`);
    throw error;
  }
}

/**
 * Get users
 * @param _page
 * @param rowPerPage
 * @param textSearch
 * @returns {Promise<{totalItems: *, data: *, totalPage: *, currentPage: *}>}
 */
export async function getUsers(_page, rowPerPage, textSearch, order, orderBy, status, type) {
  try {
    let page = Number(_page || 1).valueOf();
    if (page < 1) {
      page = 1;
    }
    let pageLimit = Number(rowPerPage || DEFAULT_PAGE_LIMIT).valueOf();
    if (pageLimit > MAX_PAGE_LIMIT || pageLimit < 1) {
      pageLimit = MAX_PAGE_LIMIT;
    }
    const skip = (page - 1) * pageLimit;
    const sortCondition = {};
    const orderByValue = ORDER_BY[orderBy] || ORDER_BY.asc;
    if (order && USER_REPORT_ORDER_FIELDS[order]) {
      sortCondition[USER_REPORT_ORDER_FIELDS[order]] = orderByValue;
    } else {
      sortCondition._id = -1;
    }
    const queryConditions = {
      status: { $in: [USER_STATUS.ACTIVE, USER_STATUS.INACTIVE] },
    };
    if (typeof status === 'string' && USER_STATUS[status]) {
      queryConditions.status = { $in: [USER_STATUS[status]] };
    }
    if (typeof type === 'string') {
      queryConditions.type = getObjectId(type);
    }
    if (typeof textSearch === 'string' && textSearch) {
      queryConditions.$or = [
        { fullName: { $regex: validSearchString(textSearch) } },
        { email: { $regex: validSearchString(textSearch) } }
      ];
    }
    const aggregateConditions = [
      {
        $match: queryConditions,
      },
      {
        $lookup: {
          from: 'usertypes',
          localField: 'type',
          foreignField: '_id',
          as: 'type'
        }
      },
      {
        $lookup: {
          from: 'courseusers',
          as: 'assignedCourses',
          let: { userId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$user', '$$userId'] },
                    { $in: ['$status', [COURSE_USER_STATUS.ACTIVE, COURSE_USER_STATUS.COMPLETED, COURSE_USER_STATUS.IN_PROGRESS]] },
                    { $eq: ['$userRole', USER_ROLES.LEARNER] },
                  ]
                }
              }
            },
            {
              $lookup: {
                from: 'courses',
                let: { courseId: '$course' },
                as: 'courseInfo',
                pipeline: [
                  {
                    $match:
                        {
                          $expr:
                              {
                                $and: [
                                  { $eq: ['$_id', '$$courseId'] },
                                  { $in: ['$status', ['ACTIVE', 'INACTIVE']] },
                                ]
                              }
                        }
                  }
                ],
              }
            },
            {
              $project: {
                _id: 1,
                courseInfo: { $ifNull: [{ $arrayElemAt: ['$courseInfo', 0] }, { _id: '$course', missingCourse: true }] }
              }
            },
            { $match: { 'courseInfo.missingCourse': null } },
            { $project: { _id: 1 } }
          ],
        },
      },
      {
        $lookup: {
          from: 'courseusers',
          as: 'completedCourses',
          let: { userId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$user', '$$userId'] },
                    { $eq: ['$status', COURSE_USER_STATUS.COMPLETED] },
                    { $eq: ['$userRole', USER_ROLES.LEARNER] },
                  ]
                }
              }
            },
            {
              $lookup: {
                from: 'courses',
                let: { courseId: '$course' },
                as: 'courseInfo',
                pipeline: [
                  {
                    $match:
                        {
                          $expr:
                              {
                                $and: [
                                  { $eq: ['$_id', '$$courseId'] },
                                  { $in: ['$status', ['ACTIVE', 'INACTIVE']] },
                                ]
                              }
                        }
                  }
                ],
              }
            },
            {
              $project: {
                _id: 1,
                courseInfo: { $ifNull: [{ $arrayElemAt: ['$courseInfo', 0] }, { _id: '$course', missingCourse: true }] }
              }
            },
            { $match: { 'courseInfo.missingCourse': null } },
            { $project: { _id: 1 } }
          ],
        },
      },
      {
        $project: {
          _id: 1,
          status: 1,
          fullName: 1,
          firstName: 1,
          lastName: 1,
          email: 1,
          points: 1,
          createdAt: 1,
          type: { $arrayElemAt: ['$type', 0] },
          assignedCourses: { $size: '$assignedCourses' },
          completedCourses: { $size: '$completedCourses' },
        }
      },
      {
        $project: {
          _id: 1,
          status: 1,
          fullName: 1,
          firstName: 1,
          lastName: 1,
          email: 1,
          points: 1,
          createdAt: 1,
          type: {
            _id: 1,
            name: 1,
          },
          assignedCourses: 1,
          completedCourses: 1,
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
    const totalItems = await User.countDocuments(queryConditions);
    const users = await User.aggregate(aggregateConditions);
    return {
      data: users,
      currentPage: page,
      totalPage: Math.ceil(totalItems / pageLimit),
      totalItems: totalItems,
    };
  } catch (error) {
    logger.error(`UserReportService getUsers error: ${error}`);
    throw error;
  }
}

/**
 * Get user detail
 * @param userId
 * @returns {Promise<*>}
 */
export async function getUser(userId) {
  try {
    const queryConditions = {
      _id: userId,
      status: { $in: [USER_STATUS.ACTIVE, USER_STATUS.INACTIVE] },
    };
    let user = await User
      .findOne(queryConditions)
      .populate([
        {
          path: 'type',
          select: 'name',
        },
      ]);
    if (!user) {
      return new Promise.reject(new APIError(404, 'User not found'));
    }
    user = user.toJSON();
    user.coursesInProgress = await countUserCourses(user._id, COURSE_USER_STATUS.IN_PROGRESS);
    user.completedCourses = await countUserCourses(user._id, COURSE_USER_STATUS.COMPLETED);
    user.coursesNotStarted = await countUserCourses(user._id, COURSE_USER_STATUS.ACTIVE);
    return user;
  } catch (error) {
    logger.error(`UserReportService getUser error: ${error}`);
    throw error;
  }
}

/**
 * Get user's courses report
 * @param userId
 * @param _page
 * @param rowPerPage
 * @returns {Promise<{totalItems: *, data: *, totalPage: *, currentPage: *}>}
 */
export async function getUserCoursesReport(userId, _page, rowPerPage, order, orderBy, status, userRole) {
  try {
    let page = Number(_page || 1).valueOf();
    if (page < 1) {
      page = 1;
    }
    let pageLimit = Number(rowPerPage || DEFAULT_PAGE_LIMIT).valueOf();
    if (pageLimit > MAX_PAGE_LIMIT || pageLimit < 1) {
      pageLimit = MAX_PAGE_LIMIT;
    }
    const skip = (page - 1) * pageLimit;
    const sortCondition = {};
    const orderByValue = ORDER_BY[orderBy] || ORDER_BY.asc;
    if (order && USER_COURSE_ORDER_FIELDS[order]) {
      sortCondition[USER_COURSE_ORDER_FIELDS[order]] = orderByValue;
    } else {
      sortCondition._id = -1;
    }
    const queryConditions = {
      user: getObjectId(userId),
      status: { $ne: COURSE_USER_STATUS.DELETED },
    };
    if (USER_ROLES[userRole]) {
      queryConditions.userRole = USER_ROLES[userRole];
    }
    const conditionCourseStatus = { 'course.status': { $in: [COURSE_STATUS.ACTIVE, COURSE_STATUS.INACTIVE] } };
    if (typeof status === 'string' && COURSE_STATUS[status]) {
      conditionCourseStatus['course.status'] = COURSE_STATUS[status];
    }
    let totalItems = await CourseUser.aggregate([
      {
        $match: queryConditions,
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
        $project: {
          _id: 1,
          user: 1,
          course: { $arrayElemAt: ['$course', 0] },
        }
      },
      {
        $match: conditionCourseStatus,
      },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $project: {
          _id: 1,
          user: { $arrayElemAt: ['$user', 0] },
        }
      },
      {
        $match: { 'user.status': { $in: [USER_STATUS.ACTIVE, USER_STATUS.INACTIVE] } },
      },
      { $group: { _id: null, totalCourses: { $sum: 1 } } },
    ]);
    totalItems = totalItems?.[0]?.totalCourses ?? 0;
    const courseUsers = await CourseUser.aggregate([
      {
        $match: queryConditions,
      },
      {
        $lookup: {
          from: 'courses',
          localField: 'course',
          foreignField: '_id',
          as: 'course'
        }
      },
      {
        $project: {
          _id: 1,
          user: 1,
          progress: 1,
          score: 1,
          userRole: 1,
          enrolledDate: 1,
          completionDate: 1,
          course: { $arrayElemAt: ['$course', 0] },
        }
      },
      {
        $project: {
          _id: 1,
          user: 1,
          progress: 1,
          score: 1,
          userRole: 1,
          enrolledDate: 1,
          completionDate: 1,
          course: {
            _id: 1,
            name: 1,
            status: 1,
          },
        }
      },
      {
        $match: conditionCourseStatus,
      },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $project: {
          _id: 1,
          progress: 1,
          score: 1,
          userRole: 1,
          enrolledDate: 1,
          completionDate: 1,
          course: 1,
          user: { $arrayElemAt: ['$user', 0] },
        }
      },
      {
        $match: { 'user.status': { $in: [USER_STATUS.ACTIVE, USER_STATUS.INACTIVE] } },
      },
      {
        $project: {
          _id: 1,
          progress: 1,
          score: 1,
          userRole: 1,
          enrolledDate: 1,
          completionDate: 1,
          course: 1,
          user: {
            _id: 1,
            fullName: 1,
            status: 1,
          },
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
    ]);
    return {
      data: courseUsers,
      currentPage: page,
      totalPage: Math.ceil(totalItems / pageLimit),
      totalItems: totalItems,
    };
  } catch (error) {
    logger.error(`UserReportService getUserCoursesReport error: ${error}`);
    throw error;
  }
}
