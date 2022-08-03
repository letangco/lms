import SessionUser from './sessionUser.model';
import * as UserService from '../user/user.service';
import logger from '../../util/logger';
import APIError from '../../util/APIError';
import {
  DEFAULT_PAGE_LIMIT, EVENT_LOGS, EVENT_LOGS_TYPE,
  MAX_PAGE_LIMIT, NOTIFICATION_EVENT,
  SESSION_USER_STATUS,
  USER_STATUS,
} from '../../constants';
import { getObjectId } from '../../helpers/string.helper';
import { formatNotification, getNotificationByKey } from '../notification/notificaition.service';
import { getCourseById } from '../course/course.service';
import * as UserEventService from '../userEvent/userEvent.service';
import { getUnitById } from '../unit/unit.service';
import { getUserType } from '../userType/userType.service';
import { createLogs } from '../logs/logs.service';

/**
 * Create new session user
 * @param creator
 * @param creator._id
 * @param params
 * @param params.session
 * @param params.user
 * @param params.unit
 * @returns {Promise.<boolean>}
 */
export async function createSessionUser(creator, params) {
  try {
    const sessionUser = await SessionUser.findOne({
      user: params.user,
      session: params.session,
      unit: params.unit,
    });
    if (sessionUser) {
      if (sessionUser.status === SESSION_USER_STATUS.ACTIVE) {
        return Promise.reject(new APIError(403, [
          {
            msg: 'User already assign to session',
            param: 'userAssigned',
          }
        ]));
      }
      sessionUser.status = SESSION_USER_STATUS.ACTIVE;
      await sessionUser.save();
      return true;
    }
    const user = await UserService.getUser(params.user);
    if (!user) {
      return Promise.reject(new APIError(403, [
        {
          msg: 'User not found',
          param: 'userNotFound',
        }
      ]));
    }
    await SessionUser.create({
      creator: creator._id,
      ...params,
    });
    createLogs({
      event: EVENT_LOGS.ADD_USER_TO_EVENT,
      type: EVENT_LOGS_TYPE.ADD,
      user: creator?._id,
      data: {
        event: params.session,
        user: params.user
      }
    });
    const notifications = await getNotificationByKey(NOTIFICATION_EVENT.ADD_TO_EVENT);
    if (JSON.stringify(notifications) !== '{}') {
      const session = await UserEventService.getUserEvent({
        _id: params.session,
        status: USER_STATUS.ACTIVE
      });
      if (!session) {
        return true;
      }
      const unitInfo = await getUnitById(session.unit);
      const courseInfo = unitInfo ? await getCourseById(unitInfo.course) : {};
      const type = await getUserType(user.type);
      const notification = notifications[type?.systemRole] || notifications.ALL;
      if (notification) {
        await formatNotification(notification, {
          userInfo: {
            firstName: user.firstName,
            lastName: user.lastName,
            fullName: user.fullName,
            email: user.email,
          },
          courseInfo,
          unitInfo,
          eventInfo: session,
          email: user.email
        });
      }
    }
    return true;
  } catch (error) {
    logger.error('SessionUserService createSessionUser error:', error);
    throw error;
  }
}

/**
 * Delete session user
 * @param id the session user id
 * @returns {Promise.<boolean>}
 */
export async function deleteSessionUser(id, auth = {}) {
  try {
    const sessionUser = await SessionUser.findById(id);
    await SessionUser.updateOne({ _id: id }, { $set: { status: SESSION_USER_STATUS.DELETED } });
    createLogs({
      event: EVENT_LOGS.REMOVE_USER_FROM_EVENT,
      type: EVENT_LOGS_TYPE.REMOVE,
      user: auth?._id,
      data: {
        event: id
      }
    });
    const notifications = await getNotificationByKey(NOTIFICATION_EVENT.REMOVE_FROM_EVENT);
    if (JSON.stringify(notifications) !== '{}') {
      const user = await UserService.getUser(sessionUser.user);
      if (!user) { return true }
      const session = await UserEventService.getUserEvent({
        _id: sessionUser.session,
        status: USER_STATUS.ACTIVE
      });
      if (!session) {
        return true;
      }
      const unitInfo = await getUnitById(session.unit);
      const courseInfo = unitInfo ? await getCourseById(unitInfo.course) : {};
      const type = await getUserType(user.type);
      const notification = notifications[type?.systemRole] || notifications.ALL;
      if (notification) {
        await formatNotification(notification, {
          userInfo: {
            firstName: user.firstName,
            lastName: user.lastName,
            fullName: user.fullName,
            email: user.email,
          },
          courseInfo,
          unitInfo,
          eventInfo: session,
          email: user.email
        });
      }
    }
    return true;
  } catch (error) {
    logger.error('SessionUserService deleteSessionUser error:', error);
    throw error;
  }
}

/**
 * Get session user detail
 * @param {object} user
 * @param {objectId} user._id
 * @param {objectId} id the session user id
 * @returns {Promise.<boolean>}
 */
export async function getSessionUser(user, id) {
  try {
    return await SessionUser.findOne({ _id: id })
      .populate({
        path: 'user',
        select: 'avatar fullName username',
      });
  } catch (error) {
    logger.error('SessionUserService getSessionUser error:', error);
    throw error;
  }
}


/**
 * Get session user detail
 * @param {object} user
 * @param {objectId} user._id
 * @param {objectId} id the session user id
 * @returns {Promise.<boolean>}
 */
export async function getSessionUsersById( id) {
  try {
    return await SessionUser.find({ session: id })
  } catch (error) {
    logger.error('SessionUserService getSessionUsers error:', error);
    throw error;
  }
}

/**
 * Get session users
 * @param id the session id
 * @param params
 * @param params._page
 * @param params.rowPerPage
 * @returns {Promise<{totalItems: *, data: *, totalPage: *, currentPage: *}>}
 */
export async function getSessionUsers(id, params) {
  try {
    const {
      _page,
      rowPerPage,
    } = params;
    let page = Number(_page || 1).valueOf();
    if (page < 1) {
      page = 1;
    }
    let pageLimit = Number(rowPerPage || DEFAULT_PAGE_LIMIT).valueOf();
    if (pageLimit > MAX_PAGE_LIMIT || pageLimit < 1) {
      pageLimit = MAX_PAGE_LIMIT;
    }
    const skip = (page - 1) * pageLimit;
    const sortCondition = { _id: -1 };
    // const orderByValue = ORDER_BY[orderBy] || ORDER_BY.desc;
    // if (order && SESSION_USER_ORDER_FIELDS[order]) {
    //   sortCondition[SESSION_USER_ORDER_FIELDS[order]] = orderByValue;
    // } else {
    //   sortCondition[SESSION_USER_ORDER_FIELDS.fullName] = 1;
    // }

    const queryConditions = {
      session: getObjectId(id),
      status: SESSION_USER_STATUS.ACTIVE,
    };
    // if (typeof textSearch === 'string') {
    //   const regExpKeyWord = validSearchString(textSearch);
    //   queryConditions.name = { $regex: regExpKeyWord };
    // }
    const counter = await SessionUser.aggregate([
      {
        $match: queryConditions,
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
        $match: { user: { $ne: null } },
      },
      { $group: { _id: null, totalItems: { $sum: 1 } } },
    ]);
    const totalItems = counter?.[0]?.totalItems ?? 0;
    const data = await SessionUser.aggregate([
      {
        $match: queryConditions,
      },
      {
        $lookup: {
          from: 'usereventviewtrackings',
          as: 'tracking',
          let: { userId: '$user', eventId: '$session' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$event', '$$eventId'] },
                    { $eq: ['$user', '$$userId'] },
                  ]
                }
              }
            },
          ],
        },
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
          gradeStatus: 1,
          session: 1,
          attendance: 1,
          unit: 1,
          tracking: 1,
          user: { $arrayElemAt: ['$user', 0] },
        },
      },
      {
        $match: { user: { $ne: null } },
      },
      {
        $project: {
          _id: 1,
          gradeStatus: 1,
          session: 1,
          unit: 1,
          attendance: 1,
          tracking: {
            _id: 1,
            event: 1,
            user: 1,
            internalMeetingId: 1,
            timeJoined: 1,
            timeLeft: 1,
            duration: 1,
          },
          user: {
            _id: 1,
            fullName: 1,
            status: 1,
            username: 1,
          },
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
    ]);
    return {
      data: data,
      currentPage: page,
      totalPage: Math.ceil(totalItems / pageLimit),
      totalItems: totalItems,
    };
  } catch (error) {
    logger.error(`SessionUserService getSessionUsers error: ${error}`);
    throw error;
  }
}

/**
 * Update sessionUser
 * @param {objectId} id the session user id
 * @param {object} params
 * @param {objectId} params.session
 * @param {string} params.grade
 * @param {string} params.gradeStatus
 * @param {string} params.gradeComment
 * @param {object} params.attendance
 * @param {string} params.attendance.status
 * @param {number} params.attendance.timeJoined
 * @param {number} params.attendance.timeLeft
 * @returns {Promise.<boolean>}
 */
export async function updateSessionUser(id, params) {
  try {
    const validFields = ['session', 'grade', 'gradeStatus', 'gradeComment', 'attendance'];
    const updateValues = {};
    validFields.forEach((validField) => {
      if (params[validField]) {
        updateValues[validField] = params[validField];
      }
    });
    if (Object.keys(updateValues).length > 0) {
      const updateResult = await SessionUser.updateOne({
        _id: id,
      }, {
        $set: updateValues,
      });
      if (updateResult.nModified > 0) {
        return await SessionUser.findOne({
          _id: id,
        });
      }
    }
    return Promise.reject(new APIError(304, 'Not Modified'));
  } catch (error) {
    logger.error(`GroupService updateSessionUser error: ${error}`);
    throw error;
  }
}

/**
 * Bulk update sessionUser
 * @param {objectId[]} ids the session user ids
 * @param {object} params
 * @param {object} params.attendance
 * @param {string} params.attendance.status
 * @param {number} params.attendance.timeJoined
 * @param {number} params.attendance.timeLeft
 * @returns {Promise.<boolean>}
 */
export async function bulkUpdateSessionUser(ids, params) {
  try {
    const validFields = ['attendance'];
    const updateValues = {};
    validFields.forEach((validField) => {
      if (params[validField]) {
        updateValues[validField] = params[validField];
      }
    });
    if (Object.keys(updateValues).length > 0) {
      await SessionUser.updateMany({
        _id: { $in: ids },
      }, {
        $set: updateValues,
      });
      return true;
    }
    return Promise.reject(new APIError(304, 'Not Modified'));
  } catch (error) {
    logger.error(`GroupService bulkUpdateSessionUser error: ${error}`);
    throw error;
  }
}

export async function getUserEvent(conditions) {
  try {
    return await SessionUser.findOne(conditions).lean();
  } catch (error) {
    logger.error(`SessionUserService getUserEvent error: ${error}`);
    throw error;
  }
}

/**
 * Registry session user
 * @param auth
 * @param auth._id
 * @param params
 * @param params.session
 * @param params.unit
 * @returns {Promise.<boolean>}
 */
export async function registrySessionUser(auth, params) {
  try {
    const sessionUser = await SessionUser.findOne({
      user: auth._id,
      session: params.session,
      unit: params.unit,
    });
    if (sessionUser) {
      return Promise.reject(new APIError(403, [
        {
          msg: 'User already assign to session',
          param: 'userAssigned',
        }
      ]));
    }
    const user = await UserService.getUser(auth._id);
    if (!user) {
      return Promise.reject(new APIError(403, [
        {
          msg: 'User not found',
          param: 'userNotFound',
        }
      ]));
    }
    await SessionUser.create({
      creator: auth._id,
      user: auth._id,
      session: params.session,
      unit: params.unit,
    });
    createLogs({
      event: EVENT_LOGS.ADD_USER_TO_EVENT,
      type: EVENT_LOGS_TYPE.ADD,
      user: auth?._id,
      data: {
        event: params.session,
        user: auth._id
      }
    });
    return true;
  } catch (error) {
    logger.error('SessionUserService registrySessionUser error:', error);
    throw error;
  }
}

/**
 * Remove registry session user
 * @param auth
 * @param auth._id
 * @param id the session user id
 * @returns {Promise.<boolean>}
 */
export async function removeRegistrySessionUser(auth, id) {
  try {
    await SessionUser.updateOne({ _id: id }, { $set: { status: SESSION_USER_STATUS.DELETED } });
    createLogs({
      event: EVENT_LOGS.REMOVE_USER_FROM_EVENT,
      type: EVENT_LOGS_TYPE.REMOVE,
      user: auth?._id,
      data: {
        event: id
      }
    });
    return true;
  } catch (error) {
    logger.error('SessionUserService removeRegistrySessionUser error:', error);
    throw error;
  }
}

/**
 * get total user by conditions
 * @param auth
 * @param auth._id
 * @param id the session user id
 * @returns {Promise.<boolean>}
 */
export async function getTotalSessionUserByConditions(conditions) {
  try {
    return await SessionUser.countDocuments(conditions);
  } catch (error) {
    logger.error('SessionUserService removeRegistrySessionUser error:', error);
    throw error;
  }
}

/**
 * get user sesion by conditions
 * @param auth
 * @param auth._id
 * @param id the session user id
 * @returns {Promise.<boolean>}
 */
export async function getSessionUsersByConditions(conditions) {
  try {
    return await SessionUser.find(conditions);
  } catch (error) {
    logger.error('SessionUserService getSessionUsersByConditions error:', error);
    throw error;
  }
}
