import User from '../user/user.model';
import Course from '../course/course.model';
import CourseUser from '../courseUser/courseUser.model';
import logger from '../../util/logger';
import {
  CATEGORY_STATUS,
  COURSE_REPORT_FILTER_FIELDS,
  COURSE_REPORT_ORDER_FIELDS,
  COURSE_STATUS,
  COURSE_USER_ORDER_FIELDS_SORT,
  COURSE_USER_STATUS,
  DEFAULT_PAGE_LIMIT,
  MAX_PAGE_LIMIT, ORDER_BY, USER_ROLES,
  USER_STATUS,
} from '../../constants';
import APIError from '../../util/APIError';
import { getObjectId, validSearchString } from '../../helpers/string.helper';
import { getImageSize } from '../../helpers/resize';

/**
 * Count num courses
 * @returns {Promise<number>}
 */
async function countNumCourses(conditions) {
  try {
    return await Course.countDocuments(conditions);
  } catch (error) {
    logger.error(`CourseReportService countNumCourses error: ${error}`);
    throw error;
  }
}

/**
 * Count course by status
 * @param status
 * @param userRole
 * @returns {Promise<number>}
 */
async function countNumUserCourses(status, userRole, typeCourse) {
  try {
    const conditions = { userRole: userRole };
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
        $match: {
          'course.status': { $in: [COURSE_STATUS.ACTIVE, COURSE_STATUS.INACTIVE] },
          'course.parent': { $exists: typeCourse === COURSE_REPORT_FILTER_FIELDS.COURSE ? false : true },
        },
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
        $match: { 'user.status': USER_STATUS.ACTIVE },
      },
      { $group: { _id: null, totalCourses: { $sum: 1 } } },
    ]);
    return result?.[0]?.totalCourses ?? 0;
  } catch (error) {
    logger.error(`CourseReportService countNumUserCourses error: ${error}`);
    throw error;
  }
}

/**
 * Count course learners by status
 * @param courseId
 * @param status an array status or single string status
 * @param userRole
 * @returns {Promise<number>}
 */
async function countCourseLearners(courseId, status, userRole) {
  try {
    const conditions = { course: getObjectId(courseId), userRole: userRole };
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
    logger.error(`CourseReportService countCourseLearners error: ${error}`);
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
    logger.error(`CourseReportService addUserPoints error: ${error}`);
    throw error;
  }
}

/**
 * Get course report summaries
 * @returns {Promise<{courses: number, assignedLearners: number, completedLearners: number, learnersInProgress: number}>}
 */
export async function getCourseReportSummaries(typeCourse) {
  try {
    const conditions = {
      status: { $in: [COURSE_STATUS.ACTIVE, COURSE_STATUS.INACTIVE] }
    };
    if (Object.keys(COURSE_REPORT_FILTER_FIELDS).includes(typeCourse)) {
      if (typeCourse === COURSE_REPORT_FILTER_FIELDS.INTAKE) {
        conditions.parent = { $ne: null };
      } else {
        conditions.parent = null;
      }
    }
    return {
      courses: await countNumCourses(conditions),
      assignedLearners: await countNumUserCourses([COURSE_USER_STATUS.IN_PROGRESS, COURSE_USER_STATUS.ACTIVE, COURSE_USER_STATUS.COMPLETED], USER_ROLES.LEARNER, typeCourse),
      completedLearners: await countNumUserCourses(COURSE_USER_STATUS.COMPLETED, USER_ROLES.LEARNER, typeCourse),
      learnersInProgress: await countNumUserCourses(COURSE_USER_STATUS.IN_PROGRESS, USER_ROLES.LEARNER, typeCourse),
    };
  } catch (error) {
    logger.error(`CourseReportService getCourseReportSummaries error: ${error}`);
    throw error;
  }
}

/**
 * Get courses
 * @param _page
 * @param rowPerPage
 * @param textSearch
 * @returns {Promise<{totalItems: *, data: *, totalPage: *, currentPage: *}>}
 */
export async function getCourses(_page, rowPerPage, textSearch, order, orderBy, status, category, typeCourse) {
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
    const orderByValue = ORDER_BY[orderBy] || ORDER_BY.asc;
    const sortCondition = {};
    if (order && COURSE_REPORT_ORDER_FIELDS[order]) {
      sortCondition[COURSE_REPORT_ORDER_FIELDS[order]] = orderByValue;
    } else {
      sortCondition._id = -1;
    }
    const queryConditions = {
      status: { $in: [COURSE_STATUS.ACTIVE, COURSE_STATUS.INACTIVE] },
    };
    if (typeof textSearch === 'string' && textSearch) {
      queryConditions.$or = [
        { name: { $regex: validSearchString(textSearch) } },
        { code: { $regex: validSearchString(textSearch) } }
      ];
    }
    if (typeof status === 'string' && COURSE_STATUS[status]) {
      queryConditions.status = { $in: [COURSE_STATUS[status]] };
    }
    if (typeof category === 'string' && category) {
      queryConditions.category = getObjectId(category);
    }
    if (Object.keys(COURSE_REPORT_FILTER_FIELDS).includes(typeCourse)) {
      if (typeCourse === COURSE_REPORT_FILTER_FIELDS.INTAKE) {
        queryConditions.parent = { $ne: null };
      } else {
        queryConditions.parent = null;
      }
    }
    const aggregateConditions = [
      {
        $match: queryConditions,
      },
      {
        $lookup: {
          from: 'categories',
          localField: 'category',
          foreignField: '_id',
          as: 'category',
        }
      },
      {
        $lookup: {
          from: 'courses',
          let: { parent: '$parent' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$_id', '$$parent'] },
                  ]
                }
              }
            },
            {
              $project: {
                _id: 1,
                code: 1,
                thumbnail: 1,
              }
            }
          ],
          as: 'parent'
        }
      },
      {
        $lookup: {
          from: 'courseusers',
          as: 'assignedLearners',
          let: { courseId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$course', '$$courseId'] },
                    { $in: ['$status', [COURSE_USER_STATUS.ACTIVE, COURSE_USER_STATUS.COMPLETED, COURSE_USER_STATUS.IN_PROGRESS]] },
                    { $eq: ['$userRole', USER_ROLES.LEARNER] },
                  ]
                }
              }
            },
            {
              $lookup: {
                from: 'users',
                let: { userId: '$user' },
                as: 'userInfo',
                pipeline: [
                  {
                    $match:
                    {
                      $expr:
                      {
                        $and: [
                          { $eq: ['$_id', '$$userId'] },
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
                userInfo: { $ifNull: [{ $arrayElemAt: ['$userInfo', 0] }, { _id: '$user', missingUser: true }] }
              }
            },
            { $match: { 'userInfo.missingUser': null } },
            { $project: { _id: 1 } }
          ],
        },
      },
      {
        $lookup: {
          from: 'courseusers',
          as: 'completedLearners',
          let: { courseId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$course', '$$courseId'] },
                    { $eq: ['$status', COURSE_USER_STATUS.COMPLETED] },
                    { $eq: ['$userRole', USER_ROLES.LEARNER] },
                  ]
                }
              }
            },
            {
              $lookup: {
                from: 'users',
                let: { userId: '$user' },
                as: 'userInfo',
                pipeline: [
                  {
                    $match:
                        {
                          $expr:
                              {
                                $and: [
                                  { $eq: ['$_id', '$$userId'] },
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
                userInfo: { $ifNull: [{ $arrayElemAt: ['$userInfo', 0] }, { _id: '$user', missingUser: true }] }
              }
            },
            { $match: { 'userInfo.missingUser': null } },
            { $project: { _id: 1 } }
          ],
        },
      },
      {
        $project: {
          _id: 1,
          status: 1,
          name: 1,
          code: 1,
          category: { $arrayElemAt: ['$category', 0] },
          thumbnail: 1,
          courseParent: { $arrayElemAt: ['$parent', 0] },
          assignedLearners: { $size: '$assignedLearners' },
          completedLearners: { $size: '$completedLearners' },
        }
      },
      {
        $project: {
          _id: 1,
          status: 1,
          name: 1,
          code: 1,
          category: {
            _id: 1,
            name: 1
          },
          thumbnail: 1,
          courseParent: {
            _id: 1,
            code: 1,
            thumbnail: 1
          },
          assignedLearners: 1,
          completedLearners: 1,
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
    let courses = await Course.aggregate(aggregateConditions);
    const totalItems = await Course.countDocuments(queryConditions);
    courses = courses.map((course) => {
      if (course.thumbnail) {
        course.thumbnail = getImageSize(course.thumbnail);
      } else if (course?.courseParent?.thumbnail) {
        course.thumbnail = getImageSize(course?.courseParent?.thumbnail);
      }
      if (course?.courseParent?.thumbnail) {
        course.courseParent.thumbnail = getImageSize(course.courseParent.thumbnail);
      }
      // course.assignedLearners = await countCourseLearners(course._id, [COURSE_USER_STATUS.ACTIVE, COURSE_USER_STATUS.COMPLETED, COURSE_USER_STATUS.IN_PROGRESS], USER_ROLES.LEARNER);
      // course.completedLearners = await countCourseLearners(course._id, COURSE_USER_STATUS.COMPLETED, USER_ROLES.LEARNER);
      return course;
    });
    return {
      data: courses,
      currentPage: page,
      totalPage: Math.ceil(totalItems / pageLimit),
      totalItems: totalItems,
    };
  } catch (error) {
    logger.error(`CourseReportService getCourses error: ${error}`);
    throw error;
  }
}

/**
 * Get course detail
 * @param courseId
 * @returns {Promise<*>}
 */
export async function getCourse(courseId) {
  try {
    const queryConditions = {
      _id: courseId,
      status: { $in: [COURSE_STATUS.ACTIVE, COURSE_STATUS.INACTIVE] },
    };
    let course = await Course
      .findOne(queryConditions)
      .populate([
        {
          path: 'category',
          select: 'name',
          match: { status: CATEGORY_STATUS.ACTIVE },
        },
        {
          path: 'parent',
          select: '_id thumbnail name code',
          match: { status: { $in: [COURSE_STATUS.ACTIVE, COURSE_STATUS.INACTIVE] } },
        },
      ]);
    if (!course) {
      return new Promise.reject(new APIError(404, 'Course not found'));
    }
    course = course.toJSON();
    if (!course?.thumbnail && course?.parent?.thumbnail) {
      course.thumbnail = course.parent.thumbnail;
    }
    const coursesPromise = await Promise.all([
      Course.countDocuments({ parent: course._id, status: COURSE_STATUS.ACTIVE }),
      countCourseLearners(course._id, [COURSE_USER_STATUS.ACTIVE, COURSE_USER_STATUS.COMPLETED, COURSE_USER_STATUS.IN_PROGRESS], USER_ROLES.LEARNER),
      countCourseLearners(course._id, COURSE_USER_STATUS.COMPLETED, USER_ROLES.LEARNER),
      countCourseLearners(course._id, COURSE_USER_STATUS.IN_PROGRESS, USER_ROLES.LEARNER),
      countCourseLearners(course._id, [COURSE_USER_STATUS.ACTIVE, COURSE_USER_STATUS.COMPLETED, COURSE_USER_STATUS.IN_PROGRESS], USER_ROLES.INSTRUCTOR),
    ]);
    course.intakeCount = coursesPromise[0];
    course.assignedLearners = coursesPromise[1];
    course.completedLearners = coursesPromise[2];
    course.learnersInProgress = coursesPromise[3];
    course.instructors = coursesPromise[4];
    return course;
  } catch (error) {
    logger.error(`CourseReportService getCourse error: ${error}`);
    throw error;
  }
}

/**
 * Get course's users report
 * @param courseId
 * @param _page
 * @param rowPerPage
 * @returns {Promise<{totalItems: *, data: *, totalPage: *, currentPage: *}>}
 */
export async function getCourseUsersReport(courseId, _page, rowPerPage, order, orderBy, status, userRole) {
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
    if (order && COURSE_USER_ORDER_FIELDS_SORT[order]) {
      sortCondition[COURSE_USER_ORDER_FIELDS_SORT[order]] = orderByValue;
    } else {
      sortCondition._id = -1;
    }
    const queryConditions = {
      course: getObjectId(courseId),
      status: { $ne: COURSE_USER_STATUS.DELETED },
    };
    if (USER_ROLES[userRole]) {
      queryConditions.userRole = USER_ROLES[userRole];
    }
    const conditionsStatusUser = {
      'user.status': { $in: [USER_STATUS.ACTIVE, USER_STATUS.INACTIVE] }
    };
    if (USER_STATUS[status]) {
      conditionsStatusUser['user.status'] = USER_STATUS[status];
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
        $match: conditionsStatusUser,
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
        $match: conditionsStatusUser,
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
    logger.error(`CourseReportService getCourseUsersReport error: ${error}`);
    throw error;
  }
}

export async function getIntakesByCourse(id, _page, rowPerPage, textSearch, order, orderBy, status, category) {
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
    const orderByValue = ORDER_BY[orderBy] || ORDER_BY.asc;
    const sortConditions = {};
    if (order && COURSE_REPORT_ORDER_FIELDS[order]) {
      sortConditions[COURSE_REPORT_ORDER_FIELDS[order]] = orderByValue;
    } else {
      sortConditions._id = 1;
    }
    const queryConditions = {
      status: { $in: [COURSE_STATUS.ACTIVE, COURSE_STATUS.INACTIVE] },
      parent: getObjectId(id)
    };
    if (typeof textSearch === 'string' && textSearch) {
      queryConditions.$or = [
        { name: { $regex: validSearchString(textSearch) } },
        { code: { $regex: validSearchString(textSearch) } }
      ];
    }
    if (typeof status === 'string' && COURSE_STATUS[status]) {
      queryConditions.status = { $in: [COURSE_STATUS[status]] };
    }
    if (typeof category === 'string' && category) {
      queryConditions.category = getObjectId(category);
    }
    const aggregateConditions = [
      {
        $match: queryConditions,
      },
      {
        $lookup: {
          from: 'categories',
          localField: 'category',
          foreignField: '_id',
          as: 'category',
        }
      },
      {
        $lookup: {
          from: 'courseusers',
          as: 'assignedLearners',
          let: { courseId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$course', '$$courseId'] },
                    { $in: ['$status', [COURSE_USER_STATUS.ACTIVE, COURSE_USER_STATUS.COMPLETED, COURSE_USER_STATUS.IN_PROGRESS]] },
                    { $eq: ['$userRole', USER_ROLES.LEARNER] },
                  ]
                }
              }
            },
            {
              $lookup: {
                from: 'users',
                let: { userId: '$user' },
                as: 'userInfo',
                pipeline: [
                  {
                    $match:
                    {
                      $expr:
                      {
                        $and: [
                          { $eq: ['$_id', '$$userId'] },
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
                userInfo: { $ifNull: [{ $arrayElemAt: ['$userInfo', 0] }, { _id: '$user', missingUser: true }] }
              }
            },
            { $match: { 'userInfo.missingUser': null } },
            { $project: { _id: 1 } }
          ],
        },
      },
      {
        $lookup: {
          from: 'courseusers',
          as: 'completedLearners',
          let: { courseId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$course', '$$courseId'] },
                    { $eq: ['$status', COURSE_USER_STATUS.COMPLETED] },
                    { $eq: ['$userRole', USER_ROLES.LEARNER] },
                  ]
                }
              }
            },
            {
              $lookup: {
                from: 'users',
                let: { userId: '$user' },
                as: 'userInfo',
                pipeline: [
                  {
                    $match:
                        {
                          $expr:
                              {
                                $and: [
                                  { $eq: ['$_id', '$$userId'] },
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
                userInfo: { $ifNull: [{ $arrayElemAt: ['$userInfo', 0] }, { _id: '$user', missingUser: true }] }
              }
            },
            { $match: { 'userInfo.missingUser': null } },
            { $project: { _id: 1 } }
          ],
        },
      },
      {
        $project: {
          _id: 1,
          status: 1,
          name: 1,
          code: 1,
          category: { $arrayElemAt: ['$category', 0] },
          thumbnail: 1,
          assignedLearners: { $size: '$assignedLearners' },
          completedLearners: { $size: '$completedLearners' },
        }
      },
      {
        $project: {
          _id: 1,
          status: 1,
          name: 1,
          code: 1,
          category: {
            _id: 1,
            name: 1
          },
          thumbnail: 1,
          courseParent: {
            _id: 1,
            code: 1,
            thumbnail: 1
          },
          assignedLearners: 1,
          completedLearners: 1,
        }
      },
      {
        $sort: sortConditions,
      },
      {
        $skip: skip,
      },
      {
        $limit: pageLimit,
      },
    ];
    let intakes = await Course.aggregate(aggregateConditions);
    const totalItems = await Course.countDocuments(queryConditions);
    intakes = intakes.map((course) => {
      if (course.thumbnail) {
        course.thumbnail = getImageSize(course.thumbnail);
      } else if (course?.courseParent?.thumbnail) {
        course.thumbnail = getImageSize(course?.courseParent?.thumbnail);
      }
      if (course?.courseParent?.thumbnail) {
        course.courseParent.thumbnail = getImageSize(course.courseParent.thumbnail);
      }
      return course;
    });
    return {
      data: intakes,
      currentPage: page,
      totalPage: Math.ceil(totalItems / pageLimit),
      totalItems: totalItems,
    };
  } catch (error) {
    logger.error(`CourseReportService getIntakesByCourse error: ${error}`);
    throw error;
  }
}
