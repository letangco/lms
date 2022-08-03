import bcrypt from 'bcryptjs';
import Course from './course.model';
import logger from '../../util/logger';
import APIError from '../../util/APIError';
import {
  BCRYPT_SALT_ROUNDS,
  CATEGORY_STATUS,
  COURSE_STATUS,
  DEFAULT_PAGE_LIMIT,
  MAX_PAGE_LIMIT,
  USER_ROLES,
  USER_STATUS,
  DEFAULT_COURSE_LANGUAGES,
  UNIT_STATUS,
  NOTIFICATION_EVENT,
  UNIT_TYPE,
  USER_EVENT,
  USER_EVENT_TYPE,
  TIMEZOME_DEFAULT,
  COMPLETE_TYPE,
  USER_EVENT_STATUS,
  SESSION_USER_STATUS,
  COURSE_USER_STATUS,
  ORDER_BY,
  COURSE_ORDER_FIELDS,
  EVENT_LOGS,
  EVENT_LOGS_TYPE,
  CHAT_GROUP_TYPE
} from '../../constants';
import { removeFile } from '../../helpers/file.helper';
import {
  generateRandom8Digits,
  validateEmail,
  validSearchString,
  formatNumber2Length,
  getObjectId,
} from '../../helpers/string.helper';
import User from '../user/user.model';
import { sendEmail } from '../../../mailService/SendGrid';
import { SENDER_EMAIL, SENDER_NAME } from '../../config';
import { emailUsed, getUserByConditions, getUserByEmail } from '../user/user.service';
import * as CourseUserService from '../courseUser/courseUser.service';
import { getTeachingLanguage } from '../teachingLanguage/teachingLanguage.service';
import CourseUser from '../courseUser/courseUser.model';
import {
  createUnitImportFile,
  duplicateCourseData,
  duplicateCourseDataImport,
  getTotalUnitsByConditions,
  getLastOrderUnitByCondition
} from '../unit/unit.service';
import * as CourseRulesAndPathService from '../courseRulesAndPath/courseRulesAndPath.service';
import { formatNotification, getNotificationByKey } from '../notification/notificaition.service';
import { getSystemUserType, getUserType } from '../userType/userType.service';
import * as UserService from '../user/user.service';
import CourseGroup from '../courseGroup/courseGroup.model';
import { createUserEvent } from '../userEvent/userEvent.service';
import Unit from '../unit/unit.model';
import UserSession from '../sessionUser/sessionUser.model';
import Event from '../userEvent/userEvent.model';
import { getUserCourseByConditions } from '../courseUser/courseUser.service';
import { createLogs } from '../logs/logs.service';
import ChatGroup from '../chatGroup/chatGroup.model';
import { getImageSize } from '../../helpers/resize';
/**
 * Create new course
 * @param auth
 * @param auth._id
 * @param params
 * @param params.name
 * @param params.category
 * @param params.description
 * @param params.thumbnail
 * @param params.creator
 * @param params.code
 * @param params.price
 * @param params.videoIntro
 * @param params.status
 * @returns {Promise.<*>}
 */
export async function createCourse(auth, params) {
  try {
    params.creator = auth._id;
    if (params?.code
      && params?.code.replace(/\s/g, '')
      && await checkCodeExist(params.code.replace(/\s/g, ''), '')) {
      return Promise.reject(new APIError(403, [
        {
          msg: 'Course code is exist.',
          param: 'courseCodeExist',
        },
      ]));
    }
    params.code = params.code.toUpperCase();
    const course = await Course.create(params);
    createLogs({
      event: EVENT_LOGS.COURSE_CREATION,
      type: EVENT_LOGS_TYPE.CREATE,
      user: auth?._id,
      data: { course: course?._id }
    });
    return await Course.populate(course, [
      {
        path: 'category',
        select: 'name',
        match: { status: CATEGORY_STATUS.ACTIVE },
      },
      {
        path: 'creator',
        select: 'firstName lastName fullName avatar username',
      },
      {
        path: 'teachingLanguage',
        select: 'name value',
      },
    ]);
  } catch (error) {
    logger.error('CourseService createCourse error:', error);
    throw error;
  }
}

function checkRoles(userRoles, role) {
  if (!userRoles instanceof Array || typeof role !== 'string') {
    return false;
  }
  return userRoles.indexOf(role) !== -1;
}

/**
 * Get courses
 * @param {object} auth
 * @param {objectId} auth._id
 * @param {number} _page
 * @param {number} rowPerPage
 * @param {string} textSearch
 * @param {string} intake
 * @param {string} role
 * @returns {Promise<{totalItems: *, data: *, totalPage: *, currentPage: *}>}
 */
export async function getCourses(auth, userRole, query) {
  try {
    const {
      rowPerPage,
      textSearch,
      intake,
      status,
      category,
      role
    } = query;
    const _page = query.page;
    if ([USER_ROLES.INSTRUCTOR, USER_ROLES.LEARNER].indexOf(userRole) !== -1 && role !== USER_ROLES.ADMIN) {
      return await CourseUserService.getUserCourses(auth._id, userRole, query);
    }
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
    const queryConditions = {
      status: { $in: [COURSE_STATUS.ACTIVE, COURSE_STATUS.INACTIVE] }
    };
    if (status) {
      queryConditions.status = status;
    }
    if (!intake) {
      queryConditions.parent = null;
    }
    if ([USER_ROLES.INSTRUCTOR, USER_ROLES.LEARNER].indexOf(userRole) !== -1 && role === USER_ROLES.ADMIN) {
      queryConditions.creator = getObjectId(auth?._id);
    }
    if (typeof textSearch === 'string' && textSearch) {
      queryConditions.$or = [
        { name: { $regex: validSearchString(textSearch) } },
        { code: { $regex: validSearchString(textSearch) } }
      ];
    }
    if (category && typeof category === 'string') {
      queryConditions.category = getObjectId(category);
    }
    const totalItems = await Course.countDocuments(queryConditions);
    const data = await Course.aggregate([
      {
        $match: queryConditions
      },
      {
        $skip: skip
      },
      {
        $limit: pageLimit
      },
      {
        $lookup: {
          from: 'categories',
          let: { category: '$category' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$_id', '$$category'] },
                    { $in: ['$status', [CATEGORY_STATUS.ACTIVE]] },
                  ]
                }
              }
            },
            {
              $project: {
                _id: 1,
                name: 1
              }
            }
          ],
          as: 'category',
        }
      },
      {
        $lookup: {
          from: 'users',
          let: { creator: '$creator' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$_id', '$$creator'] },
                  ]
                }
              }
            },
            {
              $project: {
                _id: 1,
                firstName: 1,
                lastName: 1,
                fullName: 1,
                avatar: 1,
                username: 1,
                status: 1
              }
            }
          ],
          as: 'creator'
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
                name: 1,
                code: 1,
                thumbnail: 1,
              }
            }
          ],
          as: 'parent'
        }
      },
      {
        $project: {
          _id: 1,
          name: 1,
          code: 1,
          status: 1,
          instructors: 1,
          thumbnail: 1,
          description: 1,
          price: 1,
          videoIntro: 1,
          teachingLanguage: 1,
          updatedAt: 1,
          category: { $arrayElemAt: ['$category', 0] },
          creator: { $arrayElemAt: ['$creator', 0] },
          parent: { $arrayElemAt: ['$parent', 0] },
        }
      },
      {
        $sort: sortCondition
      }
    ]);
    return {
      data: data.map((item) => {
        item.thumbnail = getImageSize(item.thumbnail);
        return item;
      }),
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
 * Get intakes
 * @param {object} auth
 * @param {objectId} auth._id
 * @param {number} _page
 * @param {number} rowPerPage
 * @param {string} textSearch
 * @param {string} role
 * @param {objectId} course
 * @returns {Promise<{totalItems: *, data: *, totalPage: *, currentPage: *}>}
 */
export async function getAllIntakes(auth, query, role) {
  try {
    if ([USER_ROLES.INSTRUCTOR, USER_ROLES.LEARNER].indexOf(role) !== -1 && query?.role === USER_ROLES.ADMIN) {
      return await CourseUserService.getUserCourses(auth._id, role, query);
    }
    const {
      rowPerPage,
      textSearch,
      status,
      course,
      category
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

    const queryConditions = {
      status: { $in: [COURSE_STATUS.ACTIVE, COURSE_STATUS.INACTIVE] },
      parent: { $ne: null }
    };
    if (status) {
      queryConditions.status = status;
    }
    if (course) {
      queryConditions.parent = getObjectId(course);
    }
    if ([USER_ROLES.INSTRUCTOR, USER_ROLES.LEARNER].indexOf(role) !== -1 && query.role !== USER_ROLES.ADMIN) {
      queryConditions.creator = getObjectId(auth?._id);
    }
    if (typeof textSearch === 'string' && textSearch) {
      queryConditions.$or = [
        { name: { $regex: validSearchString(textSearch) } },
        { code: { $regex: validSearchString(textSearch) } }
      ];
    }
    if (category && typeof category === 'string') {
      queryConditions.category = getObjectId(category);
    }
    const totalItems = await Course.countDocuments(queryConditions);
    const data = await Course.aggregate([
      {
        $match: queryConditions
      },
      {
        $skip: skip
      },
      {
        $limit: pageLimit
      },
      {
        $lookup: {
          from: 'categories',
          let: { category: '$category' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$_id', '$$category'] },
                    { $in: ['$status', [CATEGORY_STATUS.ACTIVE]] },
                  ]
                }
              }
            },
            {
              $project: {
                _id: 1,
                name: 1
              }
            }
          ],
          as: 'category',
        }
      },
      {
        $lookup: {
          from: 'users',
          let: { creator: '$creator' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$_id', '$$creator'] },
                  ]
                }
              }
            },
            {
              $project: {
                _id: 1,
                firstName: 1,
                lastName: 1,
                fullName: 1,
                status: 1,
                avatar: 1,
                username: 1
              }
            }
          ],
          as: 'creator'
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
                name: 1,
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
          from: 'teachinglanguages',
          let: { teachingLanguage: '$teachingLanguage' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$_id', '$$teachingLanguage'] },
                  ]
                }
              }
            },
            {
              $project: {
                _id: 1,
                name: 1,
                value: 1,
              }
            }
          ],
          as: 'teachingLanguage'
        }
      },
      {
        $project: {
          _id: 1,
          name: 1,
          code: 1,
          status: 1,
          instructors: 1,
          thumbnail: 1,
          description: 1,
          price: 1,
          videoIntro: 1,
          updatedAt: 1,
          category: { $arrayElemAt: ['$category', 0] },
          creator: { $arrayElemAt: ['$creator', 0] },
          parent: { $arrayElemAt: ['$parent', 0] },
          teachingLanguage: { $arrayElemAt: ['$teachingLanguage', 0] },
        }
      },
      {
        $sort: sortCondition
      }
    ]);
    if (data?.length) {
      data.map((item) => {
        if (!item.thumbnail) {
          if (item?.parent?.thumbnail) {
            item.thumbnail = item?.parent?.thumbnail;
          }
        }
        item.thumbnail = getImageSize(item?.thumbnail);
        return item;
      });
    }
    return {
      data,
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
 * Delete course
 * @param id the course id
 * @returns {Promise.<boolean>}
 */
export async function deleteCourse(id, auth = {}) {
  try {
    const courseInfo = await Course.findById(id);
    if (courseInfo) {
      await Course.updateOne({ _id: id },
      {
 $set: {
        status: COURSE_STATUS.DELETED,
        code: '',
          oldCode: courseInfo.code
      }
});
      const notifications = await getNotificationByKey(courseInfo.parent ? NOTIFICATION_EVENT.INTAKE_DELETED : NOTIFICATION_EVENT.COURSE_DELETED);
      if (JSON.stringify(notifications) !== '{}') {
        const userCourses = await CourseUser.find({ course: courseInfo._id });
        if (userCourses?.length) {
          await Promise.all(userCourses.map(async (user) => {
            const userInfo = await UserService.getUserByConditions({
              _id: user.user,
              status: USER_STATUS.ACTIVE
            });
            if (userInfo) {
              const userType = await getUserType(userInfo.type);
              const notification = notifications[userType?.systemRole] || notifications.ALL;
              if (userInfo && notification) {
                await formatNotification(notification, {
                  userInfo: userInfo,
                  courseInfo: courseInfo,
                  email: userInfo.email
                });
              }
            }
          }));
        }
      }
      const units = await Unit.distinct('_id', { course: id });
      await Unit.updateMany({
        course: id,
        status: UNIT_STATUS.ACTIVE
      }, {
 $set: {
          status: UNIT_STATUS.COURSEDELETED
        }
});
      if (units?.length) {
        await UserSession.updateMany({
          unit: { $in: units },
        status: SESSION_USER_STATUS.ACTIVE
        }, {
 $set: {
            status: SESSION_USER_STATUS.COURSEDELETED
          }
});
        await Event.updateMany({
          unit: { $in: units },
          status: USER_EVENT_STATUS.ACTIVE
        }, {
 $set: {
            status: USER_EVENT_STATUS.COURSEDELETED
          }
});
      }
      createLogs({
        event: courseInfo?.parent ? EVENT_LOGS.INTAKE_DELETION : EVENT_LOGS.COURSE_DELETION,
        type: EVENT_LOGS_TYPE.DELETE,
        user: auth?._id,
        data: { course: courseInfo?._id }
      });
      return true;
    }
    return Promise.reject(new APIError(403, [
      {
        msg: 'Course code not found.',
        param: 'courseNotFound',
      },
    ]));
  } catch (error) {
    logger.error('CourseService deleteCourse error:', error);
    throw error;
  }
}


/**
 * Intake course
 * @param id the course id
 * @returns {Promise.<boolean>}
 */
export async function createIntake(id, auth, title, description, code, units, status) {
  try {
    if (code && await checkCodeExist(code.toUpperCase().replace(/\s/g, ''))) {
      return Promise.reject(new APIError(403, [
        {
          msg: 'Course code is exist',
          param: 'courseCodeExist',
        },
      ]));
    }
    const course = await Course.findById(id).lean();
    let countIntakes = await Course.countDocuments({ parent: id });
    countIntakes = formatNumber2Length(countIntakes + 1);
    course.code = code ? code.toUpperCase().replace(/\s/g, '') : await getCodeIntake(course.code, countIntakes);
    if (title) {
      course.name = title;
    } else {
      course.name += ` - Intake ${countIntakes}`;
    }
    if (status && COURSE_STATUS[status]) {
      course.status = status;
    }
    if (description) {
      course.description += description;
    }
    course.parent = course._id;
    delete course._id;
    delete course.createdAt;
    delete course.updatedAt;
    delete course.__v;
    const newCourse = await Course.create(course);

    // Clone user course group
    const groups = await CourseGroup.find({ course: id });
    if (groups?.length) {
      groups.map(async (group) => {
        await CourseGroup.create({
          creator: group.creator,
          name: group.name,
          description: group.description,
          course: newCourse._id,
          key: group?.key ? await getCodeGroup(group?.key) : '',
          status: group.status
        });
      });
    }
    if (units?.length) {
      await duplicateCourseData(id, newCourse._id, units);
    }
    createLogs({
      event: EVENT_LOGS.INTAKE_CREATION,
      type: EVENT_LOGS_TYPE.CREATE,
      user: auth?._id,
      data: { course: newCourse?._id }
    });
    return newCourse;
  } catch (error) {
    logger.error('CourseService createIntake error:', error);
    throw error;
  }
}

/**
 * Intake course by import
 * @param id the course id
 * @returns {Promise.<boolean>}
 */
export async function createIntakeByImport(course, auth, data) {
  try {
    if (data.code) {
      course.code = data.code?.trim().toUpperCase();
    } else {
      const countIntakes = await Course.countDocuments({ parent: course._id });
      course.code = await getCodeIntake(course.code, formatNumber2Length(countIntakes + 1));
    }
    if (data.name) {
      course.name = data.name;
    } else {
      course.name += ` - Intake ${countIntakes}`;
    }
    course.parent = course._id;
    if (COURSE_STATUS[data.status.trim().toUpperCase()]) {
      course.status = COURSE_STATUS[data.status.trim().toUpperCase()];
    }
    delete course._id;
    delete course.createdAt;
    delete course.updatedAt;
    delete course.__v;
    const newCourse = await Course.create(course);
    // Clone user course group
    const groups = await CourseGroup.find({ course: course?._id });
    if (groups?.length) {
      await Promise.all(groups.map(async (group) => {
        await CourseGroup.create({
          creator: group.creator,
          name: group.name,
          description: group.description,
          course: newCourse._id,
          key: group?.key ? await getCodeGroup(group?.key) : '',
          status: group.status
        });
      }));
    }
    await duplicateCourseDataImport(course._id, newCourse._id);
    await ChatGroup.create({
      course: newCourse._id,
      type: CHAT_GROUP_TYPE.COURSE
    });
    createLogs({
      event: EVENT_LOGS.INTAKE_CREATION,
      type: EVENT_LOGS_TYPE.CREATE,
      user: auth?._id,
      data: { course: newCourse?._id }
    });
    return newCourse;
  } catch (error) {
    logger.error('CourseService createIntake error:', error);
    throw error;
  }
}

/**
 * get Intake course
 * @param id the course id
 * @param textSearch
 * @returns {Promise.<boolean>}
 */
export async function getIntakes(id, textSearch) {
  try {
    const queryConditions = {
      parent: id,
      status: { $ne: COURSE_STATUS.DELETED }
    };
    if (typeof textSearch === 'string' && textSearch) {
      queryConditions.$or = [
        { name: { $regex: validSearchString(textSearch) } },
        { code: { $regex: validSearchString(textSearch) } }
      ];
    }
    return await Course.find(queryConditions, '_id name code').lean();
  } catch (error) {
    logger.error('CourseService createIntake error:', error);
    throw error;
  }
}
/**
 * get code for intake clone
 * @param code the course
 * @returns {Promise.<boolean>}
 */
export async function getCodeIntake(code, count = 0) {
  try {
    if (code) {
      code += `-IT-${count}`;
    } else {
      code = `IT-${count}`;
    }
    if (!await checkCodeExist(code, '')) {
      return code;
    }
    return getCodeIntake(code, count + 1);
  } catch (error) {
    logger.error('CourseService createIntake error:', error);
    throw error;
  }
}
/**
 * get code for intake clone
 * @param code the course
 * @returns {Promise.<boolean>}
 */
export async function getCodeGroup(code, count = 0) {
  try {
    if (code) {
      code += `-IT-${count}`;
    } else {
      code = `IT-${count}`;
    }
    if (!await CourseGroup.findOne({ code })) {
      return code;
    }
    return getCodeGroup(code, count + 1);
  } catch (error) {
    logger.error('CourseService getCodeGroup error:', error);
    throw error;
  }
}

/**
 * Update course
 * @param id the course id
 * @param auth
 * @param auth._id
 * @param params
 * @param params.name
 * @param params.course
 * @param params.description
 * @param params.thumbnail
 * @param params.creator
 * @param params.code
 * @param params.price
 * @param params.videoIntro
 * @param params.status
 * @param params.unset
 * @param params.unset.category
 * @param params.unset.thumbnail
 * @param params.unset.price
 * @returns {Promise.<*>}
 */
export async function updateCourse(id, auth, params) {
  try {
    const course = await Course.findOne({ _id: id });
    if (params?.code
      && params?.code.replace(/\s/g, '')
      && await checkCodeExist(params.code.toUpperCase().replace(/\s/g, ''), id)) {
      return Promise.reject(new APIError(403, [
        {
          msg: 'Course code is exist.',
          param: 'courseCodeExist',
        },
      ]));
    }
    const prevThumbnail = course.thumbnail;
    const validFields = ['name', 'category', 'description', 'thumbnail', 'creator', 'parent', 'code', 'price', 'videoIntro', 'teachingLanguage', 'status'];
    const unsetAbleFields = ['category', 'thumbnail', 'price'];
    const updateValues = {};
    const unsetValues = {};
    const unset = params?.unset ?? {};
    unsetAbleFields.forEach((unsetAbleField) => {
      if (unset[unsetAbleField]) {
        unsetValues[unsetAbleField] = unset[unsetAbleField];
      }
    });
    validFields.forEach((validField) => {
      if (params[validField]) {
        updateValues[validField] = params[validField];
      }
      if (params[validField] && validField === 'code') {
        updateValues[validField] = params[validField] ? params[validField].toUpperCase() : '';
      }
    });
    if (Object.keys(updateValues).length > 0) {
      await Course.updateOne({
        _id: id,
      }, {
        $set: updateValues,
        $unset: unsetValues,
      });
      if (updateValues.thumbnail) {
        removeFile(prevThumbnail);
      }
      if (unsetValues.thumbnail) {
        removeFile(prevThumbnail);
      }
      createLogs({
        event: course?.parent ? EVENT_LOGS.INTAKE_UPDATE : EVENT_LOGS.COURSE_UPDATE,
        type: EVENT_LOGS_TYPE.UPDATE,
        user: auth?._id,
        data: { course: course?._id }
      });
      return await Course.findOne({
        _id: id,
      })
      .populate([
        {
          path: 'category',
          select: 'name',
          match: { status: CATEGORY_STATUS.ACTIVE },
        },
        {
          path: 'creator',
          select: 'firstName lastName fullName avatar username',
        },
        {
          path: 'teachingLanguage',
          select: 'name value',
        },
      ]);
    }
    return Promise.reject(new APIError(304, 'Not Modified'));
  } catch (error) {
    logger.error('CourseService deleteCourse error:', error);
    throw error;
  }
}
export async function getCourseByUser(id, user = {}) {
  try {
    const isUser = await getUserCourseByConditions({
      course: id,
      user: user._id,
      status: { $in: [COURSE_USER_STATUS.ACTIVE, COURSE_USER_STATUS.COMPLETED, COURSE_USER_STATUS.IN_PROGRESS] }
    });
    if (!isUser) {
      return Promise.reject(new APIError(403, [
        {
          msg: 'Course not found',
          param: 'courseNotFound',
        },
      ]));
    }
    return await getCourse(id, user, USER_ROLES.LEARNER);
  } catch (error) {
    logger.error('CourseService getCourseByUser error:', error);
    throw error;
  }
}
/**
 * Get course
 * @param {objectId} id the course id
 * @param user
 * @param user._id
 * @returns {Promise.<boolean>}
 */
export async function getCourse(id, user = {}, role = USER_ROLES.ADMIN) {
  try {
    let course;
    if (role === USER_ROLES.ADMIN) {
      course = await Course.findOne({
        _id: id
      });
    } else {
      course = await Course.findOne({
        _id: id,
        status: COURSE_STATUS.ACTIVE
      });
    }
    if (!course) {
      return Promise.reject(new APIError(404, 'Course not found'));
    }
    course = await Course.populate(course, [
      {
        path: 'category',
        select: 'name',
        match: { status: CATEGORY_STATUS.ACTIVE },
      },
      {
        path: 'creator',
        select: 'firstName lastName fullName avatar username',
      },
      {
        path: 'teachingLanguage',
        select: 'name value',
      },
      {
        path: 'parent',
        select: '_id name thumbnail',
      },
      {
        path: 'rulesAndPath',
        select: 'showUnits completedWhen calculateScoreByAverageOf learningPaths',
        populate: [
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
        ],
      },
    ]);
    course = course ? course.toJSON() : {};
    if (user?._id) {
      course.learningPathsPassed = await CourseRulesAndPathService.checkCourseLearningPath(id, user);
    }
    if (!course?.parent) {
      course.intakes = await Course.countDocuments({ parent: id });
    }
    course.instructors = await CourseUserService.getUsersInstructorByCourse(id);
    if (!course.thumbnail && course?.parent?.thumbnail) {
      course.thumbnail = course?.parent?.thumbnail;
    }
    course.parent = course?.parent?._id;
    return course;
  } catch (error) {
    logger.error('CourseService getCourse error:', error);
    throw error;
  }
}

/**
 * check code update is exist
 * @param code
 * @param id
 * @returns {Promise<any>}
 */
export async function checkCodeExist(code, id = '') {
  try {
    const conditions = {
      code: code
    };
    if (id) {
      conditions._id = { $ne: id };
    }
    return !!await Course.findOne(conditions);
  } catch (error) {
    logger.error('CourseService checkCodeExist error:', error);
    throw error;
  }
}

/**
 * Get learner courses
 * @param _page
 * @param rowPerPage
 * @param textSearch
 * @returns {Promise<{totalItems: *, data: *, totalPage: *, currentPage: *}>}
 */
export async function getLearnerCourses(_page, rowPerPage, textSearch) {
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
    const sortCondition = {
      _id: -1,
    };

    const queryConditions = {
      status: COURSE_STATUS.ACTIVE,
    };
    if (typeof textSearch === 'string' && textSearch) {
      queryConditions.$or = [
        { name: { $regex: validSearchString(textSearch) } },
        { code: { $regex: validSearchString(textSearch) } }
      ];
    }
    const totalItems = await Course.countDocuments(queryConditions);
    const data = await Course.find(queryConditions)
    .sort(sortCondition)
    .skip(skip)
    .limit(pageLimit)
    .populate([
      {
        path: 'category',
        select: 'name',
        match: { status: CATEGORY_STATUS.ACTIVE },
      },
      {
        path: 'creator',
        select: 'firstName lastName fullName avatar username',
      },
      {
        path: 'teachingLanguage',
        select: 'name value',
      },
    ]);
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

export async function importUser(course, data, auth) {
  try {
    if (!await getCourse(course)) {
      return Promise.reject(new APIError(403, [
        {
          msg: 'Course not found',
          param: 'courseNotFound',
        },
      ]));
    }
    await Promise.all(data.map(async (params) => {
      if (validateEmail(params.email)) {
        if (!await emailUsed(params.email)) {
          const password = generateRandom8Digits();
          const userType = await getSystemUserType(USER_ROLES.LEARNER);
          if (!userType) {
            return Promise.reject(new APIError(403, [
              {
                msg: 'User type is not available',
                param: 'userTypeIsNotAvailable',
              }
            ]));
          }
          const createdUser = await User.create({
            firstName: params.firstName || 'First Name',
            lastName: params.lastName || 'Last Name',
            email: params.email,
            bio: params.bio || '',
            password: bcrypt.hashSync(password.toString(), BCRYPT_SALT_ROUNDS),
            status: USER_STATUS.ACTIVE,
            type: userType._id,
          });
          createLogs({
            event: EVENT_LOGS.USER_REGISTER,
            type: EVENT_LOGS_TYPE.REGISTER,
            user: auth?._id,
            data: { user: createdUser?._id }
          });
          await sendEmail({
            from: {
              name: SENDER_NAME,
              email: SENDER_EMAIL,
            },
            to: params.email,
            template: 'userInvitation',
            data: {
              inviter: auth.fullName,
              fullName: createdUser.fullName,
              email: params.email,
              password: password
            }
          });
          await CourseUser.create({
            creator: auth._id,
            course,
            user: createdUser._id,
            userRole: USER_ROLES.LEARNER,
          });
          createLogs({
            event: EVENT_LOGS.ADD_USER_TO_INTAKE,
            type: EVENT_LOGS_TYPE.ADD,
            user: auth?._id,
            data: {
              course,
              user: createdUser._id
            }
          });
        } else {
          const user = await getUserByConditions({
            email: params.email,
            status: { $in: [USER_STATUS.ACTIVE, USER_STATUS.INACTIVE] }
          });
          if (!user) {
            return false;
          }
          const userCourse = await CourseUser.findOne({
            user: user._id,
            course,
          });
          if (userCourse) {
            return false;
          }
          await CourseUser.create({
            creator: auth._id,
            course,
            user: user._id,
            userRole: USER_ROLES.LEARNER,
          });
          createLogs({
            event: EVENT_LOGS.ADD_USER_TO_INTAKE,
            type: EVENT_LOGS_TYPE.ADD,
            user: auth?._id,
            data: {
              course,
              user: user._id
            }
          });
        }
        return true;
      }
    }));
    return true;
  } catch (error) {
    logger.error('User importUser error:', error);
    throw error;
  }
}
export async function checkImportUser(course, data) {
  try {
    const results = {
      done: [],
      failed: [],
      exist: []
    };
    if (!await getCourse(course)) {
      return Promise.reject(new APIError(403, [
        {
          msg: 'Course not found',
          param: 'courseNotFound',
        },
      ]));
    }
    await Promise.all(data.map(async (result) => {
      if (!validateEmail(result.email)) {
        results.failed.push(result.email);
      } else if (await checkEmailAvailableCourse(course, result.email)) {
        results.exist.push(result.email);
      } else {
        results.done.push(result.email);
      }
    }));
    return results;
  } catch (error) {
    logger.error('User checkImportUser error:', error);
    throw error;
  }
}

export async function checkEmailAvailableCourse(course, email) {
  try {
    const user = await getUserByEmail(email);
    if (!user) {
      return false;
    }
    return !!await CourseUser.findOne({
      user: user._id,
      course: course,
    });
  } catch (error) {
    logger.error('User checkImportUser error:', error);
    throw error;
  }
}

/**
 * Search courses
 * @param params
 * @param params.rowPerPage
 * @param params.firstId
 * @param params.lastId
 * @param params.textSearch
 * @param {objectId[]} params.exceptionIds
 * @returns {Promise<*>}
 */
export async function searchCourses(params) {
  try {
    const {
      rowPerPage,
      firstId,
      lastId,
      textSearch,
      exceptionIds,
    } = params;
    if (firstId && lastId) {
      return Promise.reject(new APIError(422, [{
        msg: 'Please provide only firstId or only lastId to get message',
        param: 'firstIdConflictLastId',
        location: 'query',
      }]));
    }
    let pageLimit = Number(rowPerPage || DEFAULT_PAGE_LIMIT).valueOf();
    if (pageLimit > MAX_PAGE_LIMIT) {
      pageLimit = MAX_PAGE_LIMIT;
    }
    const queryConditions = {
      status: COURSE_STATUS.ACTIVE,
      parent: null
    };
    if (typeof textSearch === 'string' && textSearch) {
      queryConditions.$or = [
        { name: { $regex: validSearchString(textSearch) } },
        { code: { $regex: validSearchString(textSearch) } }
      ];
    }
    const sortCondition = {
      _id: -1,
    };
    if (lastId) {
      queryConditions._id = { $lt: lastId };
    } else if (firstId) {
      queryConditions._id = { $gt: firstId };
      sortCondition._id = 1;
    }
    if (exceptionIds instanceof Array && exceptionIds.length !== 0) {
      if (!queryConditions._id) {
        queryConditions._id = {};
      }
      queryConditions._id.$nin = exceptionIds;
    }
    const courses = await Course.find(queryConditions, '_id name').sort(sortCondition).limit(pageLimit);
    if (firstId) {
      return courses.reverse();
    }
    return courses;
  } catch (error) {
    logger.error(`CourseService searchCourses error: ${error}`);
    throw error;
  }
}

/**
 * Search intakes
 * @param params
 * @param params.rowPerPage
 * @param params.firstId
 * @param params.lastId
 * @param params.textSearch
 * @param {objectId[]} params.exceptionIds
 * @returns {Promise<*>}
 */
export async function searchIntakes(params) {
  try {
    const {
      rowPerPage,
      firstId,
      lastId,
      textSearch,
      exceptionIds,
    } = params;
    if (firstId && lastId) {
      return Promise.reject(new APIError(422, [{
        msg: 'Please provide only firstId or only lastId to get message',
        param: 'firstIdConflictLastId',
        location: 'query',
      }]));
    }
    let pageLimit = Number(rowPerPage || DEFAULT_PAGE_LIMIT).valueOf();
    if (pageLimit > MAX_PAGE_LIMIT) {
      pageLimit = MAX_PAGE_LIMIT;
    }
    const queryConditions = {
      status: COURSE_STATUS.ACTIVE,
      parent: { $ne: null }
    };
    if (typeof textSearch === 'string' && textSearch) {
      queryConditions.$or = [
        { name: { $regex: validSearchString(textSearch) } },
        { code: { $regex: validSearchString(textSearch) } }
      ];
    }
    const sortCondition = {
      _id: -1,
    };
    if (lastId) {
      queryConditions._id = { $lt: lastId };
    } else if (firstId) {
      queryConditions._id = { $gt: firstId };
      sortCondition._id = 1;
    }
    if (exceptionIds instanceof Array && exceptionIds.length !== 0) {
      if (!queryConditions._id) {
        queryConditions._id = {};
      }
      queryConditions._id.$nin = exceptionIds;
    }
    const courses = await Course.find(queryConditions, '_id name').sort(sortCondition).limit(pageLimit);
    if (firstId) {
      return courses.reverse();
    }
    return courses;
  } catch (error) {
    logger.error(`CourseService searchIntakes error: ${error}`);
    throw error;
  }
}

/**
 * Update course rules and path
 * @param id
 * @param rulesAndPath
 * @returns {Promise<boolean>}
 */
export async function updateCourseRulesAndPath(id, rulesAndPath) {
  try {
    await Course.updateOne({ _id: id }, {
      $set: {
        rulesAndPath: rulesAndPath,
      },
    });
    return true;
  } catch (error) {
    logger.error(`CourseService updateCourseRulesAndPath error: ${error}`);
    throw error;
  }
}

/**
 * get course info by code
 * @param code
 * @returns {Promise<boolean>}
 */
export async function getCourseByCode(code) {
  try {
    if (!code) {
      return {};
    }
    return await Course.findOne({
      code
    }).lean();
  } catch (error) {
    logger.error(`CourseService getCourseByCode error: ${error}`);
    throw error;
  }
}
/**
 * get course info by code
 * @param code
 * @returns {Promise<boolean>}
 */
export async function getCourseById(id) {
  try {
    return await Course.findById(id).lean();
  } catch (error) {
    logger.error(`CourseService getCourseById error: ${error}`);
    throw error;
  }
}

/**
 * import course from file
 * @param data
 * @param auth
 * @returns {Promise<any>}
 */
export async function importCourses(data, auth) {
  try {
    const checked = [];
    return await Promise.all(data.map(async (course) => {
      if (checked.indexOf(course.code) !== -1) {
        return;
      }
      checked.push(course.code);
      if (!course?.code?.trim()?.toUpperCase()) {
        return;
      }
      const promise = [
        // eslint-disable-next-line no-use-before-define
        getCourseInfoByConditions({
          code: course?.code?.trim()?.toUpperCase(),
          status: { $in: [COURSE_STATUS.ACTIVE, COURSE_STATUS.INACTIVE] }
        }),
        getTeachingLanguage(course.language)
      ];
      const promises = await Promise.all(promise);
      if (!promises[1]) {
        promises[1] = await getTeachingLanguage(DEFAULT_COURSE_LANGUAGES);
      }
      if (promises[0] && course?.code?.trim()?.toUpperCase()) {
        const dataUpdate = {
          name: course.name,
          description: course.description,
          status: COURSE_STATUS[course?.status?.trim()?.toUpperCase()] || promises[0].status
        };
        return Course.updateOne({
          _id: promises[0]._id
        }, {
          $set: dataUpdate
        });
      }
      // eslint-disable-next-line consistent-return
      const dateCreate = {
        name: course.name,
        description: course.description,
        creator: auth?._id,
        teachingLanguage: promises[1]._id,
        code: course?.code?.trim()?.toUpperCase(),
        status: COURSE_STATUS[course?.status?.trim()?.toUpperCase()] || COURSE_STATUS.ACTIVE
      };
      const courseInfo = await Course.create(dateCreate);
      if (courseInfo) {
        createLogs({
          event: EVENT_LOGS.COURSE_CREATION,
          type: EVENT_LOGS_TYPE.CREATE,
          user: auth?._id,
          data: {
            course: courseInfo?._id
          }
        });
      }
    }));
  } catch (error) {
    logger.error(`CourseService importCourses error: ${error}`);
    throw error;
  }
}

/**
 * import intake from file
 * @param data
 * @param auth
 * @returns {Promise<any>}
 */
export async function importIntakes(data, auth) {
  try {
    const checked = [];
    return await Promise.all(data.map(async (course) => {
      if (checked.indexOf(course.code) !== -1) {
        return;
      }
      checked.push(course.code);
      const promises = await Promise.all([
        getCourseInfoByConditions({
          code: course?.code?.trim()?.toUpperCase(),
          parent: { $ne: null },
          status: { $in: [COURSE_STATUS.ACTIVE, COURSE_STATUS.INACTIVE] }
        }),
        getCourseInfoByConditionsToUpdate({
          code: course?.courseCode?.trim()?.toUpperCase(),
          parent: null,
          status: { $in: [COURSE_STATUS.ACTIVE, COURSE_STATUS.INACTIVE] }
        })
      ]);
      const intake = promises[0]; const courseParent = promises[1];
      if (intake && course?.code && course?.code?.trim()) {
        const updated = Course.updateOne({
          _id: intake._id
        }, {
          $set: {
            name: course.name || intake.name,
            description: course.description || intake.description,
            status: COURSE_STATUS[course?.status?.trim()?.toUpperCase()] || intake.status
          }
        });
        createLogs({
          event: EVENT_LOGS.INTAKE_UPDATE,
          type: EVENT_LOGS_TYPE.UPDATE,
          user: auth?._id,
          data: {
            course: intake._id
          }
        });
        return updated;
      }
      if (!courseParent) {
        return;
      }
      await createIntakeByImport(courseParent, auth, course);
    }));
  } catch (error) {
    logger.error(`CourseService importIntakes error: ${error}`);
    throw error;
  }
}

/**
 * import user to course from file
 * @param data
 * @param auth
 * @returns {Promise<any>}
 */
export async function importUserToCourses(data, auth) {
  try {
    await Promise.all(data.map(async (course) => {
      const promises = await Promise.all([
        getCourseByCode(course?.code?.toUpperCase()?.replace(/\s/g, '')),
        getUserByEmail(course?.email?.replace(/\s/g, ''))
      ]);
      if (!promises[0] || !promises[1]) {
        return null;
      }
      if (await CourseUserService.getUserCourse(promises[0]._id, promises[1]._id)) {
        return null;
      }
      return CourseUserService.createCourseUser(auth, { course: promises[0]._id, user: promises[1]._id });
    }));
  } catch (error) {
    logger.error(`CourseService importCourses error: ${error}`);
    throw error;
  }
}

/**
 * import user to course from file
 * @param data
 * @param auth
 * @returns {Promise<any>}
 */
export async function importUserToIntakes(data, auth) {
  try {
    const checked = [];
    await Promise.all(data.map(async (course) => {
      if (checked.indexOf(`${course.email}-${course.code}`) !== -1) {
        return;
      }
      checked.push(`${course.email}-${course.code}`);
      const promises = await Promise.all([
        getCourseInfoByConditions({
          code: course?.code?.trim()?.toUpperCase(),
          parent: { $ne: null },
          status: { $in: [COURSE_STATUS.ACTIVE, COURSE_STATUS.INACTIVE] }
        }),
        getUserByEmail(course?.email?.toLowerCase()?.replace(/\s/g, ''))
      ]);
      if (!promises[0] || !promises[1]) {
        return;
      }
      const isAdded = await CourseUserService.getUserCourse(promises[0]._id, promises[1]._id);
      if (isAdded) {
        return;
      }
      await CourseUserService.createCourseUser(auth, { course: promises[0]._id, user: promises[1]._id });
    }));
  } catch (error) {
    logger.error(`CourseService importUserToIntakes error: ${error}`);
    throw error;
  }
}

/**
 * import user to course from file
 * @param data
 * @param auth
 * @returns {Promise<any>}
 */
export async function importLiveSessionToIntake(data, auth) {
  try {
    let sectionLive = false, sectionAssignment = false;
    let checkCreateAss = [];
    let total, totalAssignment;
    await data.reduce(async (promiseResolve, lesson) => {
      await promiseResolve;
      const time = new Date(lesson.date).getTime();
      const startTime = new Date(lesson.startTime).getTime();
      const endTime = new Date(lesson.endTime).getTime();
      if (Number.isNaN(time)
          || Number.isNaN(startTime)
          || Number.isNaN(endTime)
          || startTime >= endTime
          || !lesson?.code?.toUpperCase()) {
        return;
      }
      if (!lesson?.lesson?.length) {
        return;
      }
      const promises = await Promise.all([
        getCourseByCode(lesson?.code?.trim()?.toUpperCase()),
        getUserByEmail(lesson?.instructor?.toLowerCase()?.replace(/\s/g, '')),
      ]);
      if (!promises[0]) {
        return;
      }
      const units = await getTotalUnitsByConditions({
        course: promises[0]?._id,
        status: { $in: [UNIT_STATUS.ACTIVE, UNIT_STATUS.INACTIVE] },
        type: UNIT_TYPE.LIVESTREAMING,
        title: lesson?.lesson?.trim()
      });
      if (units) {
        checkCreateAss.push(lesson?.lesson?.trim());
        return;
      }
      total = await getLastOrderUnitByCondition({
        course: promises[0]._id,
        type: UNIT_TYPE.LIVESTREAMING,
        status: { $in: [UNIT_STATUS.ACTIVE, UNIT_STATUS.INACTIVE] }
      });
      if (total) {
        sectionLive = true;
        const liveSesion = await createUnitImportFile({
          user: auth._id,
          course: promises[0]._id,
          title: lesson?.lesson?.trim(),
          type: UNIT_TYPE.LIVESTREAMING,
          order: total ? total + 1 : 1
        });
        if (liveSesion) {
          let userCourse;
          if (promises[1]) {
            userCourse = await CourseUser.findOne({
              course: promises[0]?._id,
              user: promises[1]?._id,
              userRole: USER_ROLES.INSTRUCTOR
            });
          }
          await createUserEvent(auth, {
            date: lesson.date,
            description: lesson?.lesson?.trim(),
            end: lesson.endTime,
            instructor: userCourse ? promises[1]?._id : auth?._id,
            name: lesson?.lesson?.trim(),
            optionUser: USER_EVENT.ALL,
            start: lesson.startTime,
            time: {
              begin: lesson.startTime,
              end: lesson.endTime
            },
            timezone: promises[1] ? promises[1]?.timezone?.value : TIMEZOME_DEFAULT,
            title: lesson?.lesson?.trim(),
            type: USER_EVENT_TYPE.WEBINAR,
            unit: liveSesion?._id,
            users: []
          });
        }
      } else {
        await createUnitImportFile({
          user: auth._id,
          course: promises[0]._id,
          title: lesson?.liveSection ?? 'LIVE SECTION',
          type: UNIT_TYPE.SECTION,
          order: total ? total + 1 : 1
        });
        const liveSession = await createUnitImportFile({
          user: auth._id,
          course: promises[0]._id,
          title: lesson?.lesson?.trim(),
          type: UNIT_TYPE.LIVESTREAMING,
          order: total ? total + 2 : 2
        });
        if (liveSession) {
          let userCourse;
          if (promises[1]) {
            userCourse = await CourseUser.findOne({
              course: promises[0]?._id,
              user: promises[1]?._id,
              userRole: USER_ROLES.INSTRUCTOR
            });
          }
          await createUserEvent(auth, {
            date: lesson.date,
            description: lesson?.lesson?.trim(),
            end: lesson.endTime,
            instructor: userCourse ? promises[1]?._id : auth?._id,
            name: lesson?.lesson?.trim(),
            optionUser: USER_EVENT.ALL,
            start: lesson.startTime,
            time: {
              begin: lesson.startTime,
              end: lesson.endTime
            },
            timezone: promises[1] ? promises[1]?.timezone?.value : TIMEZOME_DEFAULT,
            title: lesson?.lesson?.trim(),
            type: USER_EVENT_TYPE.WEBINAR,
            unit: liveSession?._id,
            users: []
          });
        }
      }
    }, Promise.resolve());
    await data.reduce(async (promiseResolve, lesson) => {
      await promiseResolve;
      const time = new Date(lesson.date).getTime();
      const startTime = new Date(lesson.startTime).getTime();
      const endTime = new Date(lesson.endTime).getTime();
      if (Number.isNaN(time)
          || Number.isNaN(startTime)
          || Number.isNaN(endTime)
          || startTime >= endTime
          || !lesson?.code?.toUpperCase()) {
        return;
      }
      if (!lesson?.lesson?.length || checkCreateAss.indexOf(lesson?.lesson?.trim()) !== -1) {
        return;
      }
      const promises = await Promise.all([
        getCourseByCode(lesson?.code?.trim()?.toUpperCase())
      ]);
      if (!promises[0]) {
        return;
      }
      totalAssignment = await getLastOrderUnitByCondition({
        course: promises[0]._id,
        type: UNIT_TYPE.ASSIGNMENT,
        status: { $in: [UNIT_STATUS.ACTIVE, UNIT_STATUS.INACTIVE] }
      });
      let promise = [];
      if (totalAssignment) {
        sectionAssignment = true;
        if (lesson?.assignmentName) {
          promise = [
            createUnitImportFile({
              user: auth._id,
              course: promises[0]._id,
              title: lesson?.assignmentName || `Assignment for ${lesson?.lesson?.trim()}`,
              description: `<p>${lesson?.assignmentDescription}</p>` || '',
              type: UNIT_TYPE.ASSIGNMENT,
              complete: { type: COMPLETE_TYPE.INSTRUCTOR_ACCEPT },
              order: totalAssignment ? totalAssignment + 1 : 1
            })
          ];
          await Promise.all(promise);
        }
      } else {
        if (lesson?.assignmentName) {
          promise = [
            createUnitImportFile({
              user: auth._id,
              course: promises[0]._id,
              title: lesson?.assignmentSection ?? 'HOME WORK',
              type: UNIT_TYPE.SECTION,
              order: 100
            }),
            createUnitImportFile({
              user: auth._id,
              course: promises[0]._id,
              title: lesson?.assignmentName || `Assignment for ${lesson?.lesson?.trim()}`,
              description: `<p>${lesson?.assignmentDescription}</p>` || '',
              type: UNIT_TYPE.ASSIGNMENT,
              complete: { type: COMPLETE_TYPE.INSTRUCTOR_ACCEPT },
              order: 101
            })
          ];
          await Promise.all(promise);
        }
      }
    }, Promise.resolve());
  } catch (error) {
    logger.error(`CourseService importUserToIntakes error: ${error}`);
    throw error;
  }
}

/**
 * get all Course
 * @returns {Promise<void>}
 */
export async function getAllCourse() {
  try {
    return await Course.find({
      parent: null
    }, 'name code description price status');
  } catch (error) {
    logger.error(`CourseService importCourses error: ${error}`);
    throw error;
  }
}
/**
 * get getCourseByConditions
 * @returns {Promise<void>}
 */
export async function getCourseByConditions(conditions) {
  try {
    return await Course.find(conditions);
  } catch (error) {
    logger.error(`CourseService getCourseByConditions error: ${error}`);
    throw error;
  }
}
/**
 * get getCourseByConditions
 * @returns {Promise<void>}
 */
export async function getCourseInfoByConditions(conditions) {
  try {
    const course = await Course.findOne(conditions);
    return course?.toJSON();
  } catch (error) {
    logger.error(`CourseService getCourseByConditions error: ${error}`);
    throw error;
  }
}
/**
 * get getCourseByConditions to update
 * @returns {Promise<void>}
 */
export async function getCourseInfoByConditionsToUpdate(conditions) {
  try {
    return await Course.findOne(conditions).lean();
  } catch (error) {
    logger.error(`CourseService getCourseByConditions error: ${error}`);
    throw error;
  }
}

/**
 * get all Course
 * @returns {Promise<void>}
 */
export async function getAllIntake() {
  try {
    return await Course.find({
      parent: { $ne: null }
    }, 'name code description price parent status')
      .populate({
        path: 'parent',
        select: 'name code'
      });
  } catch (error) {
    logger.error(`CourseService importCourses error: ${error}`);
    throw error;
  }
}

/**
 * get intakes id by course
 * @returns {Promise<void>}
 */
export async function getIntakesId(id) {
  try {
    return await Course.distinct('_id', { parent: id });
  } catch (error) {
    logger.error(`CourseService importCourses error: ${error}`);
    throw error;
  }
}

export async function checkUserPermissionToCourse(auth, id) {
  try {

  } catch (error) {
    logger.error(`CourseService checkUserPermissionToCourse error: ${error}`);
    throw error;
  }
}
