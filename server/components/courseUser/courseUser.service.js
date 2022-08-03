import CourseUser from './courseUser.model';
import Group from '../courseGroup/courseGroup.model';
import { getUnitsByConditions } from '../unit/unit.service';
import { getUserEventsByCondition } from '../userEvent/userEvent.service';
import User from '../user/user.model';
import logger from '../../util/logger';
import APIError from '../../util/APIError';
import {
  DEFAULT_PAGE_LIMIT,
  ORDER_BY,
  MAX_PAGE_LIMIT,
  USER_ROLES,
  USER_STATUS,
  COURSE_USER_ORDER_FIELDS,
  COURSE_USER_STATUS, COURSE_STATUS, USER_TYPE_STATUS,
  NOTIFICATION_EVENT, GROUP_STATUS, UNIT_TYPE, USER_EVENT, COURSE_ORDER_FIELDS, EVENT_LOGS, EVENT_LOGS_TYPE
} from '../../constants';
import * as UserService from '../user/user.service';
import * as CourseRulesAndPathService from '../courseRulesAndPath/courseRulesAndPath.service';
import UserLogin from '../user/userLogin.model';
import { getCourse, getCourseById } from '../course/course.service';
import { getNotificationByKey, formatNotification } from '../notification/notificaition.service';
import { getObjectId, validSearchString } from '../../helpers/string.helper';
import { UPLOAD_GET_HOST } from '../../config';
import { removeMemberFromGroup } from '../chatGroup/chatGroup.service';
import { getUserType, getUserTypeByConditions } from '../userType/userType.service';
import { createSessionUser } from '../sessionUser/sessionUser.service';
import { getImageSize } from '../../helpers/resize';
import { createLogs } from '../logs/logs.service';

export async function getUserCourse(course, user) {
  try {
    return await CourseUser.findOne({
      user,
      course
    });
  } catch (error) {
    logger.error('CourseUserService getUserCourse error:', error);
    throw error;
  }
}

/**
 * Create new course user
 * @param creator
 * @param creator._id
 * @param params
 * @param params.course
 * @param params.user
 * @returns {Promise.<boolean>}
 */
export async function createCourseUser(creator, params) {
  try {
    const courseUser = await CourseUser.findOne({
      user: params.user,
      course: params.course,
      status: { $nin: [COURSE_USER_STATUS.DELETED, COURSE_USER_STATUS.INACTIVE] },
    });
    if (courseUser) {
      return Promise.reject(new APIError(403, [
        {
          msg: 'User already assign to course',
          param: 'userAssigned',
        }
      ]));
    }
    const user = await UserService.getUser(params.user, {
      path: 'type',
      select: 'roles name',
      match: { status: USER_TYPE_STATUS.ACTIVE },
    });
    if (!user) {
      return Promise.reject(new APIError(403, [
        {
          msg: 'User not found',
          param: 'userNotFound',
        }
      ]));
    }
    const userRoles = user.type?.roles ?? [];
    const isInstructor = userRoles.indexOf(USER_ROLES.INSTRUCTOR) !== -1;
    const isLearner = userRoles.indexOf(USER_ROLES.LEARNER) !== -1;
    if (!isInstructor && !isLearner) {
      return Promise.reject(new APIError(403, [
        {
          msg: 'User role is invalid',
          param: 'userRoleInvalid',
        }
      ]));
    }
    const userRole = isInstructor ? USER_ROLES.INSTRUCTOR : USER_ROLES.LEARNER;
    const newCourseUser = await CourseUser.create({
      creator: creator._id,
      ...params,
      userRole: userRole,
    });
    if (newCourseUser) {
      if (userRole === USER_ROLES.LEARNER) {
        const units = await getUnitsByConditions({
          course: params.course,
          type: UNIT_TYPE.LIVESTREAMING
        });
        if (units?.length) {
          units?.map(async unit => {
            const events = await getUserEventsByCondition({
              unit: unit._id,
              optionUser: USER_EVENT.ALL
            });
            if (events?.length) {
              events.map(async event => {
                await createSessionUser(
                    creator._id,
                    {
                      user: params.user,
                      session: event._id,
                      unit: unit._id
                    }
                );
                return;
              });
            }
            return;
          });
        }
      }
      const courseInfo = await getCourseById(params.course);
      const notifications = await getNotificationByKey(courseInfo?.parent ? NOTIFICATION_EVENT.ADD_TO_INTAKE : NOTIFICATION_EVENT.ADD_TO_COURSE);
      if (JSON.stringify(notifications) !== '{}') {
        const notification = notifications[userRole] || notifications.ALL;
        if (notification) {
          await formatNotification(notification, {
            userInfo: {
              firstName: user.firstName,
              lastName: user.lastName,
              fullName: user.fullName,
              email: user.email,
            },
            courseInfo: await getCourseById(params.course),
            email: user.email
          });
        }
      }
      createLogs({
        event: EVENT_LOGS.ADD_USER_TO_INTAKE,
        type: EVENT_LOGS_TYPE.ADD,
        user: creator?._id,
        data: {
          course: courseInfo._id,
          user: user?._id
        }
      });
      return await CourseUser.populate(newCourseUser, {
        path: 'user',
        select: 'firstName lastName fullName username avatar status',
      });
    }
    return null;
  } catch (error) {
    logger.error('CourseUserService createCourseUser error:', error);
    throw error;
  }
}

/**
 * Update course user
 * @param auth
 * @param id the courseUser id
 * @param params
 * @param params.userRole
 * @returns {Promise.<boolean>}
 */
export async function updateCourseUser(auth, id, params) {
  try {
    const courseUser = await CourseUser.findOne({ _id: id });
    if (!courseUser) {
      return Promise.reject(new APIError(403, [
        {
          msg: 'Course not found',
          param: 'courseUserNotFound',
        }
      ]));
    }
    const user = await UserService.getUser(courseUser.user, {
      path: 'type',
      select: 'roles name',
      match: { status: USER_TYPE_STATUS.ACTIVE },
    });
    if (!user) {
      return Promise.reject(new APIError(403, [
        {
          msg: 'User not found',
          param: 'userNotFound',
        }
      ]));
    }
    const userRoles = user.type?.roles ?? [];
    if (userRoles.indexOf(params.userRole) !== -1
      && [USER_ROLES.INSTRUCTOR, USER_ROLES.LEARNER].indexOf(params.userRole) !== -1) {
      await CourseUser.updateOne({
        _id: id,
      }, {
        userRole: params.userRole,
      });
      return true;
    }
    return Promise.reject(new APIError(403, [
      {
        msg: 'User role is invalid',
        param: 'userRoleInvalid',
      }
    ]));
  } catch (error) {
    logger.error('CourseUserService updateCourseUser error:', error);
    throw error;
  }
}

/**
 * Get course users
 * @param {objectId} courseId
 * @param {number} page
 * @param {number} rowPerPage
 * @param {string} textSearch search by user fullName
 * @param {number} order
 * @param {number} orderBy
 * @returns {Promise.<*>}
 */
export async function getCourseUsers(courseId, page, rowPerPage, textSearch, order, orderBy, auth = {}) {
  try {
    const userType = await getUserTypeByConditions({ _id: auth.type });
    const isAdmin = userType && [USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN].some(role => userType?.roles.includes(role));
    const courseInfo = await getCourse(courseId);
    if (!courseInfo) {
      return Promise.reject(new APIError(403, [
        {
          msg: 'Course not found',
          param: 'courseNotFound',
        }
      ]));
    }
    const courses = [];
    if (!courseInfo?.parent) {
      return Promise.reject(new APIError(403, [
        {
          msg: 'Can\'t get user list of course',
          param: 'canNotgetUserList',
        }
      ]));
    }
    // Disable add user to course
    if (!isAdmin) {
      return await getUserCourseListByInstructor(courseInfo, page, rowPerPage, textSearch, order, orderBy)
    }
    courses.push(courseInfo._id);
    page = Number(page || 1).valueOf();
    let pageLimit = Number(rowPerPage || DEFAULT_PAGE_LIMIT).valueOf();
    if (pageLimit > MAX_PAGE_LIMIT) {
      pageLimit = MAX_PAGE_LIMIT;
    }
    const skip = (page - 1) * pageLimit;
    const sortCondition = {};
    const orderByValue = ORDER_BY[orderBy] || ORDER_BY.desc;
    if (order && COURSE_USER_ORDER_FIELDS[order]) {
      sortCondition[COURSE_USER_ORDER_FIELDS[order]] = orderByValue;
    } else {
      sortCondition[COURSE_USER_ORDER_FIELDS.role] = 1;
    }
    const userConditions = { status: USER_STATUS.ACTIVE };
    if (typeof textSearch === 'string' && textSearch) {
      userConditions.$or = [
        { fullName: { $regex: validSearchString(textSearch) } },
        { email: { $regex: validSearchString(textSearch) } }
      ];
    }
    const aggregateConditions = [
      {
        $match: userConditions,
      },
      {
        $lookup: {
          from: 'courseusers',
          as: 'courseUsers',
          let: { userId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$user', '$$userId'] },
                    { $in: ['$course', courses] },
                  ]
                }
              }
            },
          ],
        },
      }, {
        $lookup: {
          from: 'courses',
          localField: 'courseUsers.course',
          foreignField: '_id',
          as: 'courses'
        }
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
        '$lookup': {
          from: 'usercoursegroups',
          as: 'groupUser',
          let: { userId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$user', '$$userId'] },
                    { $in: ['$course', courses] },
                  ]
                }
              }
            }
          ]
        }
      },
      {
        $match: {
          'usertypes.roles': { $in: [USER_ROLES.INSTRUCTOR, USER_ROLES.LEARNER] },
        },
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
      {
        $project: {
          _id: 1,
          type: { $arrayElemAt: ['$usertypes', 0] },
          status: 1,
          firstName: 1,
          lastName: 1,
          email: 1,
          username: 1,
          createdAt: 1,
          fullName: 1,
          courseUsers: 1,
          courses: 1,
          groupUser: 1,
        },
      },
      {
        $project: {
          _id: 1,
          roles: '$type.roles',
          status: 1,
          firstName: 1,
          lastName: 1,
          email: 1,
          username: 1,
          createdAt: 1,
          fullName: 1,
          courseUsers: 1,
          courses: 1,
          groupUser: 1,
        },
      },
    ];
    const countConditions = [
      {
        $match: userConditions,
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
          'usertypes.roles': { $in: [USER_ROLES.INSTRUCTOR, USER_ROLES.LEARNER] },
        },
      },
      { $group: { _id: null, numUsers: { $sum: 1 } } },
    ];
    let totalItems = await User.aggregate(countConditions);
    totalItems = totalItems instanceof Array && totalItems[0] ? totalItems[0].numUsers : 0;
    let data = await User.aggregate(aggregateConditions);
    if(data?.length) {
      data = await Promise.all(data.map(async user => {
        if (user?.groupUser?.length) {
          const group = await Group.findOne({ _id: user?.groupUser[0].group, status: GROUP_STATUS.ACTIVE });
          if (group) {
            user.groupUser = {
              _id: user?.groupUser[0]._id,
              groupId: group._id,
              type: user?.groupUser[0].type,
              name: group.name,
              key: group.key
            };
          } else {
            delete user.groupUser;
          }
        }
        return user;
      }));
    }
    return {
      data: data,
      canEdit: true,
      currentPage: page,
      totalPage: Math.ceil(totalItems / pageLimit),
      totalItems: totalItems,
    };
  } catch (error) {
    logger.error('CourseUserService getCourseUsers error:', error);
    throw error;
  }
}

export async function getUserCourseListByInstructor(courseInfo, page, rowPerPage, textSearch, order, orderBy) {
  try {
    let courses = [];
    courses.push(courseInfo._id);
    page = Number(page || 1).valueOf();
    let pageLimit = Number(rowPerPage || DEFAULT_PAGE_LIMIT).valueOf();
    if (pageLimit > MAX_PAGE_LIMIT) {
      pageLimit = MAX_PAGE_LIMIT;
    }
    const skip = (page - 1) * pageLimit;
    const sortCondition = {};
    const orderByValue = ORDER_BY[orderBy] || ORDER_BY.desc;
    if (order && COURSE_USER_ORDER_FIELDS[order]) {
      sortCondition[COURSE_USER_ORDER_FIELDS[order]] = orderByValue;
    } else {
      sortCondition[COURSE_USER_ORDER_FIELDS.role] = 1;
    }
    const userConditions = { status: USER_STATUS.ACTIVE };
    if (typeof textSearch === 'string' && textSearch) {
      userConditions.$or = [
        { fullName: { $regex: validSearchString(textSearch) } },
        { email: { $regex: validSearchString(textSearch) } }
      ];
    }
    const aggregateConditions = [
      {
        $match: userConditions,
      },
      {
        $lookup: {
          from: 'courseusers',
          as: 'courseUsers',
          let: { userId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$user', '$$userId'] },
                    { $in: ['$course', courses] },
                  ]
                }
              }
            },
          ],
        },
      },
      {
        $lookup: {
          from: 'courses',
          localField: 'courseUsers.course',
          foreignField: '_id',
          as: 'courses'
        }
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
        '$lookup': {
          from: 'usercoursegroups',
          as: 'groupUser',
          let: { userId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$user', '$$userId'] },
                    { $in: ['$course', courses] },
                  ]
                }
              }
            }
          ]
        }
      },
      {
        $match: { courseUsers: { $ne: [] } },
      },
      {
        $match: {
          'usertypes.roles': { $in: [USER_ROLES.INSTRUCTOR, USER_ROLES.LEARNER] },
        },
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
      {
        $project: {
          _id: 1,
          type: { $arrayElemAt: ['$usertypes', 0] },
          status: 1,
          firstName: 1,
          lastName: 1,
          email: 1,
          username: 1,
          createdAt: 1,
          fullName: 1,
          courseUsers: 1,
          courses: 1,
          groupUser: 1,
        },
      },
      {
        $project: {
          _id: 1,
          roles: '$type.roles',
          status: 1,
          firstName: 1,
          lastName: 1,
          email: 1,
          username: 1,
          createdAt: 1,
          fullName: 1,
          courseUsers: 1,
          courses: 1,
          groupUser: 1,
        },
      },
    ];
    const countConditions = [
      {
        $match: userConditions,
      },
      {
        $lookup: {
          from: 'courseusers',
          as: 'courseUsers',
          let: { userId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$user', '$$userId'] },
                    { $in: ['$course', courses] },
                  ]
                }
              }
            },
          ],
        },
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
          'usertypes.roles': { $in: [USER_ROLES.INSTRUCTOR, USER_ROLES.LEARNER] },
        },
      },
      {
        $match: { courseUsers: { $ne: [] } },
      },
      { $group: { _id: null, numUsers: { $sum: 1 } } },
    ];
    let totalItems = await User.aggregate(countConditions);
    totalItems = totalItems instanceof Array && totalItems[0] ? totalItems[0].numUsers : 0;
    let data = await User.aggregate(aggregateConditions);
    if(data?.length) {
      data = await Promise.all(data.map(async user => {
        if (user?.groupUser?.length) {
          const group = await Group.findOne({ _id: user?.groupUser[0].group, status: GROUP_STATUS.ACTIVE });
          if (group) {
            user.groupUser = {
              _id: user?.groupUser[0]._id,
              groupId: group._id,
              type: user?.groupUser[0].type,
              name: group.name,
              key: group.key
            };
          } else {
            delete user.groupUser;
          }
        }
        return user;
      }));
    }
    return {
      data: data,
      canEdit: false,
      currentPage: page,
      totalPage: Math.ceil(totalItems / pageLimit),
      totalItems: totalItems,
    };
  } catch (error) {
    logger.error('CourseUserService getCourseUsers error:', error);
    throw error;
  }
}

/**
 * Get user courses
 * @param {objectId} user
 * @param {number} _page
 * @param {number} rowPerPage
 * @param {string} textSearch
 * @param {string} role
 * @param {objectId} courseId
 * @returns {Promise<{totalItems: *, data: *, totalPage: *, currentPage: *}>}
 */
export async function getUserCourses(user, role, query, courseId = null) {
  try {
    const {
      rowPerPage,
      textSearch
    } = query;
    const _page = query.page;

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
    const orderByValue = ORDER_BY[query.orderBy] || ORDER_BY.asc;
    if (query.order && COURSE_ORDER_FIELDS[query.order]) {
      sortCondition[COURSE_ORDER_FIELDS[query.order]] = orderByValue;
    } else {
      sortCondition._id = -1;
    }
    const courseStatus = [COURSE_STATUS.ACTIVE];
    const queryConditions = {
      status: { $in: [COURSE_USER_STATUS.ACTIVE, COURSE_USER_STATUS.COMPLETED, COURSE_USER_STATUS.IN_PROGRESS] },
      userRole: role,
      user: user,
    };
    const courseQueryConditions = {
      missingCourse: null,
      status: COURSE_STATUS.ACTIVE
    };
    if (typeof textSearch === 'string' && textSearch) {
      courseQueryConditions.$or = [
        { name: { $regex: validSearchString(textSearch) } },
        { code: { $regex: validSearchString(textSearch) } }
      ];
    }
    const aggregateConditions = [
      {
        $match: queryConditions,
      },
      {
        $lookup: {
          from: 'courses',
          as: 'course',
          let: { courseId: '$course' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$_id', '$$courseId'] },
                    { $in: ['$status', courseStatus] },
                    { parent: courseId }
                  ]
                }
              }
            },
          ],
        },
      },
      {
        $replaceRoot: {
          newRoot: { $mergeObjects: [{ user: '$user', courseUserStatus: '$status', progress: '$progress' }, { $ifNull: [{ $arrayElemAt: ['$course', 0] }, { _id: '$_id', missingCourse: true }] }] }
        }
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
          localField: 'parent',
          foreignField: '_id',
          as: 'courseParent'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'creator',
          foreignField: '_id',
          as: 'creator',
        }
      },
      {
        $lookup: {
          from: 'teachinglanguages',
          localField: 'teachingLanguage',
          foreignField: '_id',
          as: 'teachingLanguage',
        }
      },
      {
        $project: {
          _id: 1,
          user: 1,
          progress: 1,
          courseUserStatus: 1,
          status: 1,
          name: 1,
          category: { $arrayElemAt: ['$category', 0] },
          description: 1,
          code: 1,
          price: 1,
          videoIntro: 1,
          teachingLanguage: { $arrayElemAt: ['$teachingLanguage', 0] },
          creator: { $arrayElemAt: ['$creator', 0] },
          courseParent: { $arrayElemAt: ['$courseParent', 0] },
          parent: 1,
          createdAt: 1,
          updatedAt: 1,
          thumbnail: 1,
        }
      },
      {
        $match: courseQueryConditions,
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
      {
        $project: {
          _id: 1,
          user: 1,
          progress: 1,
          courseUserStatus: 1,
          status: 1,
          name: 1,
          category: {
            _id: 1,
            name: 1,
            status: 1,
          },
          description: 1,
          code: 1,
          price: 1,
          videoIntro: 1,
          teachingLanguage: {
            _id: 1,
            name: 1,
            value: 1,
            status: 1,
          },
          courseParent: {
            _id: 1,
            name: 1,
            code: 1,
            thumbnail: 1
          },
          creator: {
            _id: 1,
            firstName: 1,
            lastName: 1,
            fullName: 1,
            status: 1,
            avatar: { $concat: [`${UPLOAD_GET_HOST}/`, '$creator.avatar'] },
            username: 1,
          },
          parent: 1,
          createdAt: 1,
          updatedAt: 1,
          thumbnail: 1,
        }
      },
    ];
    const countConditions = [
      {
        $match: queryConditions,
      },
      {
        $lookup: {
          from: 'courses',
          as: 'course',
          let: { courseId: '$course' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$_id', '$$courseId'] },
                    { $in: ['$status', courseStatus] },
                  ]
                }
              }
            },
          ],
        },
      },
      {
        $replaceRoot: {
          newRoot: { $ifNull: [{ $arrayElemAt: ['$course', 0] }, { _id: '$_id', missingCourse: true }] }
        }
      },
      {
        $match: courseQueryConditions,
      },
      { $group: { _id: null, numItems: { $sum: 1 } } },
    ];
    let totalItems = await CourseUser.aggregate(countConditions);
    totalItems = totalItems instanceof Array && totalItems[0] ? totalItems[0].numItems : 0;
    let data = await CourseUser.aggregate(aggregateConditions);
    if (role === USER_ROLES.LEARNER) {
      let checked = []
      const promises = data.map(async (item, index) => {
        if (checked.indexOf(item._id.toString()) === -1) {
          checked.push(item._id.toString())
          item.index = index;
          item.learningPathsPassed = await CourseRulesAndPathService.checkCourseLearningPath(item._id, {
            _id: item.user,
          });
          const instructors = await getUsersInstructorByCourse(item._id);
          if (item.thumbnail) {
            item.thumbnail = getImageSize(item.thumbnail);
          } else if (item?.courseParent?.thumbnail) {
            item.thumbnail = getImageSize(item?.courseParent?.thumbnail);
          }
          item.instructors = instructors;
          return item;
        }
      });
      data = await Promise.all(promises);
      data = data.filter( item => item);
      data.sort((a, b) => a.index - b.index);
    } else {
      let checked = [];
      const promises = data.map(async (item) => {
        if (checked.indexOf(item._id.toString()) === -1) {
          checked.push(item._id.toString())
          const instructors = await getUsersInstructorByCourse(item._id);
          if (item.thumbnail) {
            item.thumbnail = getImageSize(item.thumbnail);
          } else if (item?.courseParent?.thumbnail) {
            item.thumbnail = getImageSize(item?.courseParent?.thumbnail);
          }
          item.instructors = instructors;
          return item;
        }
      });
      data = await Promise.all(promises);
      data = data.filter( item => item);
    }
    return {
      data: data,
      currentPage: page,
      totalPage: Math.ceil(totalItems / pageLimit),
      totalItems: totalItems,
    };
  } catch (error) {
    logger.error(`CourseService getCourses error: ${error}`);
    throw error;
  }
}

/**
 * Delete course user
 * @param id the course user id
 * @returns {Promise.<boolean>}
 */
export async function deleteCourseUser(id, auth = {}) {
  try {
    const userCourse = await CourseUser.findOneAndRemove({ _id: id });
    if (!userCourse) {
      return Promise.reject(new APIError(404, [{
        msg: 'User course not found',
        param: 'userCourseNotFound'
      }]));
    }
    createLogs({
      event: EVENT_LOGS.REMOVE_USER_FROM_INTAKE,
      type: EVENT_LOGS_TYPE.REMOVE,
      user: auth?._id,
      data: {
        user: userCourse.user,
        course: userCourse.course
      }
    });
    await removeMemberFromGroup(userCourse.course, userCourse.user);
    const courseInfo = await getCourseById(userCourse.course);
    const user = await UserService.getUserByConditions({
      _id: userCourse.user,
      status: USER_STATUS.ACTIVE
    });
    const notifications = await getNotificationByKey(courseInfo?.parent ? NOTIFICATION_EVENT.REMOVE_FROM_INTAKE : NOTIFICATION_EVENT.REMOVE_FROM_COURSE);
    if (JSON.stringify(notifications) !== '{}') {
      const userType = await getUserType(user.type);
      const notification = notifications[userType.systemRole] || notifications.ALL;
      if (notification) {
        await formatNotification(notification, {
          userInfo: {
            firstName: user.firstName,
            lastName: user.lastName,
            fullName: user.fullName,
            email: user.email,
          },
          courseInfo: courseInfo,
          email: user.email
        });
      }
    }
    return true;
  } catch (error) {
    logger.error('CourseUserService deleteCourseUser error:', error);
    throw error;
  }
}

/**
 * Get course user role
 * @param course the course id
 * @param user the user id
 * @returns {Promise<*|null>}
 */
export async function getCourseUserRole(course, user) {
  try {
    const courseUser = await CourseUser.findOne({
      course,
      user,
      status: { $nin: [COURSE_USER_STATUS.DELETED, COURSE_USER_STATUS.INACTIVE] },
    });
    return courseUser?.userRole ?? null;
  } catch (error) {
    logger.error('CourseUserService getCourseUserRole error:', error);
    throw error;
  }
}

/**
 * Get course user by conditions
 * @param conditions the query
 * @returns {Promise<*|null>}
 */
export async function getUserCourseByConditions(conditions) {
  try {
    return await CourseUser.findOne(conditions).lean();
  } catch (error) {
    logger.error('CourseUserService getCourseUserRole error:', error);
    throw error;
  }
}
/**
 * Get course users by conditions
 * @param conditions the query
 * @returns {Promise<*|null>}
 */
export async function getUserCoursesByConditions(conditions) {
  try {
    return await CourseUser.find(conditions);
  } catch (error) {
    logger.error('CourseUserService getCourseUserRole error:', error);
    throw error;
  }
}

/**
 * Get course users
 * @param {object|option} params
 * @param {objectId} params.courseId
 * @param {number|option} params.rowPerPage
 * @param {number|option} params.firstId
 * @param {number|option} params.lastId
 * @param {string|option} params.textSearch search by user fullName
 * @param {string[]|option} params.roles
 * @returns {Promise.<*>}
 */
export async function searchCourseUsers(params) {
  try {
    const {
      courseId,
      rowPerPage,
      firstId,
      lastId,
      textSearch,
      roles,
    } = params;
    if (firstId && lastId) {
      return Promise.reject(new APIError(422, [{
        msg: 'Please provide only firstId or only lastId to get message',
        param: 'firstIdConflictLastId',
        location: 'query',
      }]));
    }
    const sortCondition = {
      _id: -1,
    };
    const queryConditions = {
      course: getObjectId(courseId),
      status: { $in: [COURSE_USER_STATUS.ACTIVE, COURSE_USER_STATUS.IN_PROGRESS, COURSE_USER_STATUS.COMPLETED] },
    };
    if (roles?.length) {
      queryConditions.userRole = { $in: roles }
    }
    if (lastId) {
      queryConditions._id = { $lt: getObjectId(lastId) };
    } else if (firstId) {
      queryConditions._id = { $gt: getObjectId(firstId) };
      sortCondition._id = 1;
    }
    let pageLimit = Number(rowPerPage || DEFAULT_PAGE_LIMIT).valueOf();
    if (pageLimit > MAX_PAGE_LIMIT) {
      pageLimit = MAX_PAGE_LIMIT;
    }
    let aggregateConditions = [];
    if (typeof textSearch === 'string' && textSearch) {
      aggregateConditions = [
        {
          $match: queryConditions,
        },
        {
          $sort: sortCondition,
        },
        {
          $lookup: {
            from: 'users',
            as: 'user',
            let: { userId: '$user' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$_id', '$$userId'] },
                      { $eq: ['$status', USER_STATUS.ACTIVE] },
                    ]
                  }
                }
              },
            ],
          },
        },
        {
          $match: {
            'user.fullName': { $regex: validSearchString(textSearch) }
          },
        },
        {
          $project: {
            _id: 1,
            user: { $arrayElemAt: ['$user', 0] },
          },
        },
        {
          $replaceRoot: {
            newRoot: { $ifNull: ['$user', { _id: '$_id', missingUser: true }] }
          }
        },
        {
          $match: {
            missingUser: null,
          }
        },
        {
          $limit: pageLimit,
        },
        {
          $project: {
            _id: 1,
            fullName: 1,
            status: 1,
          },
        },
      ];
    } else {
      aggregateConditions = [
        {
          $match: queryConditions,
        },
        {
          $sort: sortCondition,
        },
        {
          $lookup: {
            from: 'users',
            as: 'user',
            let: { userId: '$user' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$_id', '$$userId'] },
                      { $eq: ['$status', USER_STATUS.ACTIVE] },
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
            user: { $arrayElemAt: ['$user', 0] },
          },
        },
        {
          $replaceRoot: {
            newRoot: { $ifNull: ['$user', { _id: '$_id', missingUser: true }] }
          }
        },
        {
          $match: {
            missingUser: null,
          }
        },
        {
          $limit: pageLimit,
        },
        {
          $project: {
            _id: 1,
            fullName: 1,
            status: 1,
          },
        },
      ];
    }
    return await CourseUser.aggregate(aggregateConditions);
  } catch (error) {
    logger.error('CourseUserService searchCourseUsers error:', error);
    throw error;
  }
}


/**
 * Get user by course
 * @param id the course id
 * @returns {Promise.<boolean>}
 */
export async function getUsersByCourse(id) {
  try {
    let courseUser = await CourseUser.find({ course: id }).lean();
    if (!courseUser?.length) {
      return [];
    }
    courseUser = await Promise.all(courseUser.map( async item => {
      const user = await UserService.getUser(item.user);
      const course = await getCourse(item.course);
      if (user && course) {
        return {
          user: user.email,
          code: course.code || '',
          name: course.name || '',
        };
      }
    }));
    return courseUser.filter( course => course);
  } catch (error) {
    logger.error('CourseUserService getCourseUserRole error:', error);
    throw error;
  }
}
/**
 * Is all courses are completed
 * @param {object} user
 * @param {objectId} user._id
 * @param {objectId[]} courseIds the course id
 * @returns {Promise.<*>}
 */
export async function isAllCoursesCompleted(user, courseIds) {
  try {
    if (!user?._id || !courseIds || courseIds?.length === 0) {
      return false;
    }
    const numCoursesCompleted = await CourseUser.countDocuments({
      course: { $in: courseIds },
      user: user._id,
      userRole: USER_ROLES.LEARNER,
      status: COURSE_USER_STATUS.COMPLETED,
    });
    return numCoursesCompleted === courseIds.length;
  } catch (error) {
    logger.error('CourseUserService isAllCoursesCompleted error:', error);
    throw error;
  }
}

/**
 * Set user course is completed
 * @param userId
 * @param courseId
 * @returns {Promise<boolean>}
 */
export async function setCourseCompleted(userId, courseId) {
  try {
    await CourseUser.updateOne(
      {
        user: userId,
        course: courseId,
        status: { $ne: COURSE_USER_STATUS.COMPLETED },
      },
      {
        $set: {
          status: COURSE_USER_STATUS.COMPLETED,
          completionDate: Date.now(),
        },
      },
    );
    createLogs({
      event: EVENT_LOGS.USER_COMPLETED_INTAKE,
      type: EVENT_LOGS_TYPE.COMPLETED,
      user: userId,
      data: {
        course: courseId
      }
    });
    await UserLogin.updateOne({
      date: new Date(new Date().setHours(0,0,0,0))
    }, { $inc: {
        completed: 1 } }, { upsert: true, new: true, setDefaultsOnInsert: true })
    const notifications = await getNotificationByKey(NOTIFICATION_EVENT.USER_COMPLETED_COURSE);
    if (JSON.stringify(notifications) !== '{}') {
      const user = await UserService.getUserByConditions({
        _id: userId,
        status: USER_STATUS.ACTIVE
      });
      const userType = await getUserType(user.type);
      const notification = notifications[userType.systemRole] || notifications.ALL;
      if (user && notification) {
        await formatNotification(notification, {
          userInfo: {
            firstName: user.firstName,
            lastName: user.lastName,
            fullName: user.fullName,
            email: user.email,
          },
          courseInfo: await getCourseById(courseId),
          email: user.email
        });
      }
    }
    return true;
  } catch (error) {
    logger.error(`CourseUserService setCourseCompleted error: ${error}`);
    throw error;
  }
}

/**
 * Set user course status
 * @param userId
 * @param courseId
 * @param status
 * @returns {Promise<boolean>}
 */
export async function setCourseStatus(userId, courseId, status) {
  try {
    await CourseUser.updateOne(
      {
        user: userId,
        course: courseId,
      },
      {
        $set: {
          status: status,
        },
      },
    );
    return true;
  } catch (error) {
    logger.error(`CourseUserService setCourseStatus error: ${error}`);
    throw error;
  }
}

/**
 * Set course completed percent
 * @param {objectId} userId
 * @param {objectId} courseId
 * @param {number} completedPercent
 * @returns {Promise<boolean>}
 */
export async function setCourseCompletedPercent(userId, courseId, completedPercent) {
  try {
    await CourseUser.updateOne(
      {
        user: userId,
        course: courseId,
      },
      {
        $set: {
          progress: completedPercent,
        },
      },
    );
    return true;
  } catch (error) {
    logger.error(`CourseUserService setCourseCompletedPercent error: ${error}`);
    throw error;
  }
}

/**
 * Set user course score
 * @param {objectId} userId
 * @param {objectId} courseId
 * @param {number} score
 * @returns {Promise<boolean>}
 */
export async function setUserCourseScore(userId, courseId, score) {
  try {
    await CourseUser.updateOne(
      {
        user: userId,
        course: courseId,
      },
      {
        $set: {
          score: score,
        },
      },
    );
    return true;
  } catch (error) {
    logger.error(`CourseService setUserCourseScore error: ${error}`);
    throw error;
  }
}

/**
 * Get course completed percent
 * @param {objectId} userId
 * @param {objectId} courseId
 * @returns {Promise<boolean>}
 */
export async function getCourseCompletedPercent(userId, courseId) {
  try {
    const courseUser = await CourseUser.findOne(
      {
        user: userId,
        course: courseId,
      },
    );
    return courseUser?.progress ?? 0;
  } catch (error) {
    logger.error(`CourseUserService getCourseCompletedPercent error: ${error}`);
    throw error;
  }
}

/**
 * Get instructor by course
 * @param id the course id
 * @returns {Promise.<boolean>}
 */
export async function getUsersInstructorByCourse(id) {
  try {
    let courseUser = await CourseUser.find({ course: id, userRole: USER_ROLES.INSTRUCTOR }).lean();
    if (!courseUser?.length) {
      return [];
    }
    let checked = []
    courseUser = await Promise.all(courseUser.map( async item => {
      if(checked.indexOf(item.user.toString()) === -1) {
        checked.push(item.user.toString())
        let user = await User.findOne({ _id: item.user, status: USER_STATUS.ACTIVE });
        if (user) {
          user = user.toJSON();
          return {
            _id: user._id,
            email: user.email,
            avatar: user.avatar,
            online: user.online,
            fullName: user.fullName,
          };
        }
      }
    }));
    return courseUser.filter( course => course);
  } catch (error) {
    logger.error('CourseUserService getCourseUserRole error:', error);
    throw error;
  }
}
