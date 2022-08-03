import bcrypt from 'bcryptjs';
import ms from 'ms';
import logger from '../../util/logger';
import APIError from '../../util/APIError';
import User from './user.model';
import UserLogin from './userLogin.model';
import { removeFile } from '../../helpers/file.helper';
import { exportDataExcel } from '../../helpers/excel';
import {
  validateEmail,
  validSearchString,
  generateRandom6Digits
} from '../../helpers/string.helper';
import {
  getCourseByCode, importCourses, importIntakes, importUserToIntakes,
  importLiveSessionToIntake, getCourseByConditions
} from '../course/course.service';
import { getRedisInfo, setRedisInfo, setRedisExpire } from '../../helpers/redis';
import {
  BCRYPT_SALT_ROUNDS,
  DEFAULT_PAGE_LIMIT,
  USER_STATUS,
  MAX_PAGE_LIMIT,
  FORGOT_PASSWORD_EXPIRE_DURATION, USER_TYPE_STATUS, LANGUAGE_STATUS, USER_ROLES,
  NOTIFICATION_EVENT,
  SOCKET_CHAT_EVENT, COURSE_STATUS, USER_MIN_PASSWORD_LENGTH, ORDER_BY, USER_ORDER_FIELDS,
  TIME_SELECT_LOGIN, REDIS_TIME_USER_LOGIN, EVENT_LOGS, EVENT_LOGS_TYPE
} from '../../constants';
import { sendEmail } from '../../../mailService/SendGrid';
import {
  SENDER_EMAIL,
  SENDER_NAME,
  CLIENT_HOST,
} from '../../config';
import { checkUserTypeByConditions, getUserType, getUserTypeByConditions } from '../userType/userType.service';
import { formatNotification, getNotificationByKey } from '../notification/notificaition.service';
import ChatNamespace from '../../socket/chat/chat.namespace';
import { createLogs } from '../logs/logs.service';
import { convertArrayToArrayObject } from '../../helpers/array.helper';

export async function increaseUserUnreadMessage(userId) {
  const INCREASE_VALUE = 1;
  const res = await User.findOneAndUpdate({ _id: userId }, { $inc: { unreadMessage: INCREASE_VALUE } });
  ChatNamespace.emitToRoom(userId, SOCKET_CHAT_EVENT.USER_UNREAD_MESSAGE_NUM, {
    unreadMessage: res?.unreadMessage + INCREASE_VALUE,
  });
  return true;
}

export function resetUserUnreadMessage(userId) {
  ChatNamespace.emitToRoom(userId, SOCKET_CHAT_EVENT.USER_UNREAD_MESSAGE_NUM, {
    unreadMessage: 0,
  });
  return User.updateOne({ _id: userId }, { $set: { unreadMessage: 0 } });
}

/**
 * Check the email is already used
 * @param email
 * @returns {Promise<boolean>}
 */
export async function emailUsed(email) {
  return !!await User.findOne({ email: email.toLowerCase() });
}

/**
 * Login with email and password
 * @param {string} email
 * @param {string} password
 * @returns {Promise.<*>} The user model after login success or an error
 */
export async function login(email, password) {
  try {
    let user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return Promise.reject(new APIError(403, [
        {
          msg: 'The email address that you\'ve entered doesn\'t match any account',
          param: 'emailNotRegistered',
        },
      ]));
    }
    if (!user.comparePassword(password)) {
      return Promise.reject(new APIError(403, [
        {
          msg: 'Email or password is not correct',
          param: 'emailPassword',
        },
      ]));
    }
    switch (user.status) {
      case USER_STATUS.INACTIVE:
        return Promise.reject(new APIError(403, [
          {
            msg: 'Your account was deactivated',
            param: 'accountDeactivated',
          },
        ]));
      case USER_STATUS.DELETED:
        return Promise.reject(new APIError(403, [
          {
            msg: 'Your account was deleted',
            param: 'accountDeleted',
          },
        ]));
      default:
    }

    const token = user.signJWT();
    user = user.toJSON();
    user.token = token;
    if (user.type?._id) {
      user.userType = JSON.stringify(await getUserType(user.type._id));
    }
    return user;
  } catch (error) {
    logger.error('UserService login error:', error);
    throw new APIError(500, 'Internal server error');
  }
}
/**
 * Login account user with admin role
 * @param {string} id
 * @returns {Promise.<*>} The user model after login success or an error
 */
export async function adminLoginUser(auth, id) {
  try {
    let user = await User.findById(id);
    if (!user) {
      return Promise.reject(new APIError(403, [
        {
          msg: 'The email address that you\'ve entered doesn\'t match any account',
          param: 'emailNotRegistered',
        },
      ]));
    }
    const userType = await getUserType(auth.type);
    if (!userType
        || ([USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN].indexOf(userType.defaultRole) === -1)) {
      return Promise.reject(new APIError(401, [
        {
          msg: 'Permission denied',
          param: 'permissionDenied',
        },
      ]));
    }
    switch (user.status) {
      case USER_STATUS.INACTIVE:
        return Promise.reject(new APIError(403, [
          {
            msg: 'Your account was deactivated',
            param: 'accountDeactivated',
          },
        ]));
      case USER_STATUS.DELETED:
        return Promise.reject(new APIError(403, [
          {
            msg: 'Your account was deleted',
            param: 'accountDeleted',
          },
        ]));
      default:
    }

    const token = user.signJWT();
    user = user.toJSON();
    user.token = token;
    if (user.type?._id) {
      user.userType = JSON.stringify(await getUserType(user.type._id));
    }
    return user;
  } catch (error) {
    logger.error('UserService adminLoginUser error:', error);
    throw new APIError(500, 'Internal server error');
  }
}

/**
 * Get user by user _id
 * @param {string} _id The user _id
 * @param populate
 * @returns {Promise.<{id: *}>} Return user or an error
 */
export async function getUser(_id, populate) {
  try {
    const user = User.findOne({ _id: _id });
    if (user) {
      if (populate) {
        return await user.populate(populate);
      }
      return await user;
    }
    return Promise.reject(new APIError(404, 'User not found'));
  } catch (error) {
    logger.error(`UserService getUser error: ${error}`);
    throw error;
  }
}
/**
 * Get user by conditions
 * @param {{_id: *, status: string}} conditions The user conditions
 * @param populate
 * @returns {Promise.<{id: *}>} Return user or an error
 */
export async function getUserByConditions(conditions, populate = {}) {
  try {
    const user = await User.findOne(conditions);
    if (user) {
      if (populate && JSON.stringify(populate) !== '{}') {
        return await user.populate(populate);
      }
    }
    return user;
  } catch (error) {
    logger.error(`UserService getUserByConditions error: ${error}`);
    throw error;
  }
}
/**
 * Get users by conditions
 * @param {{_id: *, status: string}} conditions The user conditions
 * @param populate
 * @returns {Promise.<{id: *}>} Return user or an error
 */
export async function getUsersByConditions(conditions) {
  try {
    return await User.find(conditions);
  } catch (error) {
    logger.error(`UserService getUsersByConditions error: ${error}`);
    throw error;
  }
}

/**
 * Get my user info by user _id
 * @param {string} _id The user _id
 * @returns {Promise.<{id: *}>} Return user or an error
 */
export async function getMyUser(_id) {
  try {
    let user = await User.findOne({ _id: _id }).populate({
      path: 'type',
      select: 'roles name',
      match: { status: USER_TYPE_STATUS.ACTIVE },
    });
    if (!user) {
      return Promise.reject(new APIError(404, 'User not found'));
    }
    if (user.type?._id) {
      user = user.toJSON();
      user.userType = JSON.stringify(await getUserType(user.type._id));
    }
    return user;
  } catch (error) {
    logger.error(`UserService getMyUser error: ${error}`);
    throw error;
  }
}

/**
 * Get user info by user _id
 * @param {object} requester
 * @param {object} requester._id
 * @param {string} _id The user _id
 * @returns {Promise.<{id: *}>} Return user or an error
 */
export async function getUserInfo(requester, _id) {
  try {
    const user = await User.findOne({ _id: _id }).populate([
      {
        path: 'language',
        select: 'name value status',
        match: { status: LANGUAGE_STATUS.ACTIVE },
      },
      {
        path: 'type',
        select: 'roles name',
        match: { status: USER_TYPE_STATUS.ACTIVE },
      },
    ]);
    if (user) {
      return user.toJSON();
    }
    return Promise.reject(new APIError(404, 'User not found'));
  } catch (error) {
    logger.error(`UserService getUserInfo error: ${error}`);
    throw error;
  }
}

/**
 * Update the existed user
 * @param user
 * @param user._id
 * @param user.avatar
 * @param params
 * @param params.firstName
 * @param params.lastName
 * @param params.email
 * @param params.username
 * @param params.avatar
 * @param params.password
 * @param params.bio
 * @param params.timezone
 * @param params.language
 * @param params.status
 * @returns {Promise<*>}
 */
export async function updateUserProfile(user, params) {
  try {
    const validFields = ['firstName', 'lastName', 'email', 'username', 'avatar', 'password', 'bio', 'timezone', 'language', 'status'];
    if (typeof params.email === 'string'
        && user?.email !== params?.email) {
      if (await emailUsed(params.email)) {
        return Promise.reject(new APIError(403, [
          {
            msg: 'The email address is already using by someone',
            param: 'emailAlreadyUsed',
          },
        ]));
      }
    }
    const updateValues = {};
    validFields.forEach((validField) => {
      if (params[validField]) {
        if (validField === 'password') {
          updateValues[validField] = bcrypt.hashSync(params[validField], BCRYPT_SALT_ROUNDS);
        } else {
          updateValues[validField] = params[validField];
        }
      } else if (validField === 'bio') {
        updateValues[validField] = params[validField];
      }
    });
    const prevAvatar = user.avatar;
    if (Object.keys(updateValues).length > 0) {
      await User.updateOne({
        _id: user._id,
      }, {
        $set: updateValues,
      });
      if (updateValues.avatar) {
        removeFile(prevAvatar);
      }
      const userInfo = await User.findOne({
        _id: user._id,
      });
      if (updateValues.password) {
        const notifications = await getNotificationByKey(NOTIFICATION_EVENT.CHANGE_PASSWORD_ACCOUNT);
        if (JSON.stringify(notifications) !== '{}' && userInfo) {
          const type = await getUserType(userInfo.type);
          const notification = notifications[type?.systemRole] || notifications.ALL;
          if (notification) {
            await formatNotification(notification, {
              userInfo: {
                firstName: userInfo.firstName,
                lastName: userInfo.lastName,
                fullName: `${userInfo.firstName} ${userInfo.lastName}`,
                email: userInfo.email,
                user_password: updateValues.password,
              },
              email: userInfo.email
            });
          }
        }
      }
      createLogs({
        event: EVENT_LOGS.USER_UPDATE,
        type: EVENT_LOGS_TYPE.UPDATE,
        user: user?._id
      });
      return user;
    }
    return Promise.reject(new APIError(304, 'Not Modified'));
  } catch (error) {
    logger.error(`UserService updateUserProfile error: ${error}`);
    throw error;
  }
}

/**
 * Update the existed user
 * @param auth
 * @param auth._id
 * @param auth.avatar
 * @param userId
 * @param params
 * @param params.firstName
 * @param params.firstName
 * @param params.lastName
 * @param params.email
 * @param params.username
 * @param params.avatar
 * @param params.password
 * @param params.bio
 * @param params.timezone
 * @param params.language
 * @param params.status
 * @param params.type
 * @returns {Promise<*>}
 */
export async function adminUpdateUserProfile(auth, userId, params) {
  try {
    const validFields = ['firstName', 'lastName', 'email', 'username', 'avatar', 'password', 'bio', 'timezone', 'language', 'status', 'type'];
    const user = await User.findOne({
      _id: userId,
    }).populate({
      path: 'type',
      select: 'name roles defaultRole systemRole',
      match: { status: USER_TYPE_STATUS.ACTIVE },
    });
    if (typeof params.email === 'string' && user?.email !== params.email) {
      params.email = params.email.toLowerCase();
      if (await emailUsed(params.email)) {
        return Promise.reject(new APIError(403, [
          {
            msg: 'The email address is already using by someone',
            param: 'emailAlreadyUsed',
          },
        ]));
      }
    }
    const updateValues = {};
    validFields.forEach((validField) => {
      if (params[validField]) {
        if (validField === 'password') {
          updateValues[validField] = bcrypt.hashSync(params[validField], BCRYPT_SALT_ROUNDS);
        } else {
          updateValues[validField] = params[validField];
        }
      }
    });
    // Check user is super admin or not
    const isSuperAdmin = user?.type?.roles?.indexOf(USER_ROLES.SUPER_ADMIN) !== -1;
    if (isSuperAdmin) {
      if (updateValues.type) {
        return Promise.reject(new APIError(403, [
          {
            msg: 'You can not update super admin user type',
            param: 'youCannotUpdateSuperAdminUserType',
          }
        ]));
      }
      if (auth._id.toString() !== user._id.toString()) {
        return Promise.reject(new APIError(403, [
          {
            msg: 'You can not update super admin profile',
            param: 'youCannotUpdateSuperAdminProfile',
          }
        ]));
      }
    }
    const prevAvatar = user.avatar;
    if (Object.keys(updateValues).length > 0) {
      const updateResult = await User.updateOne({
        _id: userId,
      }, {
        $set: updateValues,
      });
      if (updateValues.avatar) {
        removeFile(prevAvatar);
      }
      if (updateResult.nModified > 0) {
        const userInfo = await User.findOne({
          _id: userId,
        });
        if (updateValues.password) {
          const notifications = await getNotificationByKey(NOTIFICATION_EVENT.CHANGE_PASSWORD_ACCOUNT);
          if (JSON.stringify(notifications) !== '{}' && userInfo) {
            const type = await getUserType(userInfo.type);
            const notification = notifications[type?.systemRole] || notifications.ALL;
            if (notification) {
              await formatNotification(notification, {
                userInfo: {
                  firstName: userInfo.firstName,
                  lastName: userInfo.lastName,
                  fullName: `${userInfo.firstName} ${userInfo.lastName}`,
                  email: userInfo.email,
                  user_password: params.password,
                },
                email: userInfo.email
              });
            }
          }
        }
        createLogs({
          event: EVENT_LOGS.USER_UPDATE,
          type: EVENT_LOGS_TYPE.UPDATE,
          user: auth?._id,
          data: { user: userId }
        });
        return userInfo;
      }
    }
    return Promise.reject(new APIError(304, 'Not Modified'));
  } catch (error) {
    logger.error(`UserService adminUpdateUserProfile error: ${error}`);
    throw error;
  }
}

export async function getUserByEmail(email) {
  if (!email) return null;
  const user = await User.findOne({
    email: email?.toLowerCase()
  });
  if (user) {
    return user.toJSON();
  }
  return user;
}

/**
 * Create super admin when have no admin before
 * @param auth
 * @param auth.email
 * @param auth.fullName
 * @param params
 * @param params.firstName
 * @param params.lastName
 * @param params.email
 * @param params.avatar
 * @param params.username
 * @param params.avatar
 * @param params.password
 * @param params.bio
 * @param params.timezone
 * @param params.language
 * @param params.type
 * @returns {Promise.<boolean>}
 */
export async function createUser(auth, params) {
  try {
    if (typeof params.email === 'string') {
      params.email = params.email.toLowerCase();
    }
    if (await emailUsed(params.email)) {
      return Promise.reject(new APIError(403, [
        {
          msg: 'The email address is already using by someone',
          param: 'emailAlreadyUsed',
        },
      ]));
    }
    let createdUser;
    try {
      createdUser = await User.create({
        firstName: params.firstName,
        lastName: params.lastName,
        email: params.email,
        avatar: params.avatar,
        username: params.username,
        password: bcrypt.hashSync(params.password, BCRYPT_SALT_ROUNDS),
        status: USER_STATUS.ACTIVE,
        timezone: params.timezone,
        language: params.language,
        type: params.type,
        creator: auth?._id
      });
      createLogs({
        event: EVENT_LOGS.USER_REGISTER,
        type: EVENT_LOGS_TYPE.REGISTER,
        user: auth?._id,
        data: { user: createdUser?._id }
      });
    } catch (error) {
      logger.error('UserService createUser save error:', error);
      return Promise.reject(new APIError(500, 'Internal server error'));
    }
    // Send invitation email
    try {
      const userType = await getUserType(params.type);
      const notifications = await getNotificationByKey(NOTIFICATION_EVENT.REGISTRY_ACCOUNT);
      if (JSON.stringify(notifications) !== '{}') {
        const notification = notifications[userType?.systemRole] || notifications.ALL;
        if (notification) {
          await formatNotification(notification, {
            userInfo: {
              firstName: params.firstName,
              lastName: params.lastName,
              fullName: `${params.firstName} ${params.lastName}`,
              email: params.email,
              user_password: params.password,
            },
            email: params.email
          });
        }
      } else {
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
            password: params.password,
          }
        });
      }
    } catch (error) {
      logger.error('UserService createUser sendEmail error:', error);
      return Promise.reject(new APIError(500, 'Internal server error'));
    }
    return createdUser;
  } catch (error) {
    logger.error('UserService createUser error:', error);
    throw error;
  }
}

/**
 * Delete user by user _id
 * @param {string} _id The user _id
 * @returns {Promise.<boolean>}
 */
export async function deleteUser(_id, auth = {}) {
  try {
    await User.updateOne({ _id }, { $set: { status: USER_STATUS.DELETED } });
    createLogs({
      event: EVENT_LOGS.USER_DELETION,
      type: EVENT_LOGS_TYPE.DELETE,
      user: auth?._id,
      data: { user: _id }
    });
    return true;
  } catch (error) {
    logger.error(`UserService deleteUser error: ${error}`);
    throw error;
  }
}

/**
 * Permanently delete user by user _id
 * Unset user email and user username
 * Allow new user can use this email and username to create new account
 * @param {string} _id The user _id
 * @returns {Promise.<boolean>}
 */
export async function permanentlyDeleteUser(_id, auth = {}) {
  try {
    const user = await User.findOne({ _id });
    await User.updateOne({ _id }, {
      $set: {
        status: USER_STATUS.PERMANENTLY_DELETED,
        oldEmail: user.email,
        oldUsername: user.username,
      },
      $unset: {
        email: 1,
        username: 1,
      }
    });
    const userType = await getUserType(user.type);
    const notifications = await getNotificationByKey(NOTIFICATION_EVENT.DELETE_ACCOUNT);
    if (JSON.stringify(notifications) !== '{}') {
      const notification = notifications[userType?.systemRole] || notifications.ALL;
      if (user && notification) {
        await formatNotification(notification, {
          userInfo: {
            firstName: user.firstName,
            lastName: user.lastName,
            fullName: user.fullName,
            email: user.email
          },
          email: user.email.toLowerCase()
        });
      }
      createLogs({
        event: EVENT_LOGS.USER_DELETION,
        type: EVENT_LOGS_TYPE.DELETE,
        user: auth?._id,
        data: { user: _id }
      });
      return true;
    }
  } catch (error) {
    logger.error(`UserService permanentlyDeleteUser error: ${error}`);
    throw error;
  }
}

/**
 * Search user pagination by id
 * @param {object} params
 * @param {number|option} params.rowPerPage
 * @param {objectId|option} params.firstId
 * @param {objectId|option} params.lastId
 * @param {string|option} params.textSearch
 * @param {string[]|option} params.roles
 * @returns {Promise<*>}
 */
export async function searchUsers(params) {
  try {
    const {
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
    let pageLimit = Number(rowPerPage || DEFAULT_PAGE_LIMIT).valueOf();
    if (pageLimit > MAX_PAGE_LIMIT) {
      pageLimit = MAX_PAGE_LIMIT;
    }
    const queryConditions = {
      status: USER_STATUS.ACTIVE,
    };
    let additionConditions = [];
    if (roles?.length !== 0) {
      additionConditions = [
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
            'usertypes.roles': { $in: roles },
          },
        },
      ];
    }
    if (typeof textSearch === 'string' && textSearch) {
      queryConditions.$or = [
        { fullName: { $regex: validSearchString(textSearch) } },
        { email: { $regex: validSearchString(textSearch) } }
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
    const users = await User.aggregate([
      {
        $match: queryConditions,
      },
      { ...additionConditions },
      {
        $sort: sortCondition,
      },
      {
        $limit: pageLimit,
      },
    ]);
    if (firstId) {
      return users.reverse();
    }
    return users;
  } catch (error) {
    logger.error('UserService searchUsers error:', error);
    throw error;
  }
}

/**
 * Get users
 * @param _page
 * @param rowPerPage
 * @param textSearch
 * @param userType
 * @returns {Promise<{totalItems: *, data: *, totalPage: *, currentPage: *}>}
 */
export async function getUsers(query, auth = {}) {
  try {
    const userRole = await checkUserTypeByConditions({
      _id: auth?.type,
      status: USER_TYPE_STATUS.ACTIVE
    });
    const _page = query.page; const rowPerPage = query.rowPerPage;
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
    if (query.order && USER_ORDER_FIELDS[query.order]) {
      sortCondition[USER_ORDER_FIELDS[query.order]] = orderByValue;
    } else if (query?.onlineTime) {
      sortCondition.lastLogin = -1;
    } else {
      sortCondition._id = -1;
    }
    const queryConditions = {
      status: { $in: [USER_STATUS.ACTIVE, USER_STATUS.INACTIVE] },
    };
    if (query.status) {
      queryConditions.status = query.status;
    }
    if ([USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN].indexOf(userRole) === -1) {
      queryConditions.creator = auth?._id
    }
    if (typeof query.textSearch === 'string' && query.textSearch) {
      queryConditions.$or = [
        { fullName: { $regex: validSearchString(query.textSearch) } },
        { email: { $regex: validSearchString(query.textSearch) } }
      ];
    }
    if (typeof query.userType === 'string' && query.userType) {
      queryConditions.type = query.userType;
    }
    if (query?.onlineTime) {
      const onlineTime = getTimeFromFilter(query?.onlineTime)
      if (onlineTime) {
        queryConditions.lastLogin = { $gte: new Date(onlineTime), $lte: new Date() }
      }
    }
    const totalItems = await User.countDocuments(queryConditions);
    const data = await User.find(queryConditions).sort(sortCondition).skip(skip).limit(pageLimit)
      .populate({
        path: 'type',
        select: '_id name defaultRole roles',
        match: { status: USER_TYPE_STATUS.ACTIVE },
      });
    return {
      data: data,
      currentPage: page,
      totalPage: Math.ceil(totalItems / pageLimit),
      totalItems: totalItems,
    };
  } catch (error) {
    logger.error(`UserService getUsers error: ${error}`);
    throw error;
  }
}

/**
 * Reset user password
 * @param params
 * @param params.email
 * @returns {Promise.<*>}
 */
export async function forgotPassword(params) {
  try {
    const successMessage = 'If your email is correct, we have sent you an email with instructions the password reset';
    const user = await User.findOne({ email: params.email.toLowerCase() });
    if (!user) {
      return successMessage;
    }
    if ([
      USER_STATUS.ACTIVE,
    ].indexOf(user.status) === -1) {
      return Promise.reject(new APIError(403, [
        {
          msg: 'Your account is not available, had been deleted or deactivated',
          param: 'accountNotAvailable',
        },
      ]));
    }
    let forgotPasswordInfo = user.forgotPasswordInfo;
    if (forgotPasswordInfo.expiredTime
      && forgotPasswordInfo.expiredTime > (Date.now() + 30000)
      && forgotPasswordInfo.email.toLowerCase() === user.email.toLowerCase()) {
      return successMessage;
    }
    forgotPasswordInfo = {
      expiredTime: Date.now() + ms(FORGOT_PASSWORD_EXPIRE_DURATION),
      email: params.email.toLowerCase(),
    };
    const userToken = user.signJWT(FORGOT_PASSWORD_EXPIRE_DURATION);
    try {
      const userType = await getUserType(user.type);
      const notifications = await getNotificationByKey(NOTIFICATION_EVENT.RESET_PASSWORD);
      if (JSON.stringify(notifications) !== '{}') {
        const notification = notifications[userType?.systemRole] || notifications.ALL;
        if (notification) {
          await formatNotification(notification, {
            userInfo: {
              firstName: user.firstName,
              lastName: user.lastName,
              fullName: user.fullName,
              email: user.email,
              reset_url: `${CLIENT_HOST}/forgot-password?token=${userToken}`,
            },
            email: user.email
          });
        }
      } else {
        await sendEmail({
          from: {
            name: SENDER_NAME,
            email: SENDER_EMAIL,
          },
          to: user.email.toLowerCase(),
          template: 'userForgotPassword',
          data: {
            fullName: user.fullName,
            expiredTime: `${(ms(FORGOT_PASSWORD_EXPIRE_DURATION) / 60000)} minutes`,
            token: userToken,
            domain: CLIENT_HOST,
          }
        });
      }
    } catch (error) {
      logger.error('UserService forgotPassword sendEmail error:', error);
      return Promise.reject(new APIError(500, 'Internal server error'));
    }
    try {
      user.forgotPasswordInfo = forgotPasswordInfo;
      await user.save();
      return successMessage;
    } catch (error) {
      logger.error('UserService forgotPassword update user error:', error);
      return Promise.reject(new APIError(500, 'Internal server error'));
    }
  } catch (error) {
    logger.error('UserService forgotPassword error:', error);
    throw error;
  }
}

/**
 * Reset user password
 * @param user
 * @param newPassword
 * @returns {Promise.<*>}
 */
export async function verifyForgotPassword(user, newPassword) {
  try {
    const forgotPasswordInfo = user.forgotPasswordInfo;
    if (!forgotPasswordInfo || !forgotPasswordInfo.email || !forgotPasswordInfo.expiredTime) {
      return Promise.reject(new APIError(403, [
        {
          msg: 'You have no forgot password request',
          param: 'noForgotPassword',
        },
      ]));
    }
    if (forgotPasswordInfo.expiredTime <= Date.now()) {
      return Promise.reject(new APIError(403, [
        {
          msg: 'Your forgot password request is expired, please request new one',
          param: 'tokenExpired',
        },
      ]));
    }

    user.password = bcrypt.hashSync(newPassword, BCRYPT_SALT_ROUNDS);
    user.set('forgotPasswordInfo', undefined);
    try {
      await user.save();
      return true;
    } catch (error) {
      logger.error('User verifyForgotPassword update user error:', error);
      return Promise.reject(new APIError(500, 'Internal server error'));
    }
  } catch (error) {
    logger.error('User verifyForgotPassword error:', error);
    throw error;
  }
}

/**
 * import users to system
 * @param data
 * @param auth
 * @returns {Promise<boolean>}
 */
export async function importUser(data, auth) {
  try {
    const checked = [];
    await Promise.all(data.map(async (params) => {
      if (checked.indexOf(params?.email) !== -1 || (params?.password && params?.password?.length < USER_MIN_PASSWORD_LENGTH)) {
        return false;
      }
      checked.push(params.email);
      if (validateEmail(params.email)) {
        if (!await emailUsed(params?.email?.toLowerCase()?.trim())) {
          let type;
          if (params.type) {
            type = await getUserTypeByConditions({ key: params?.type });
          }
          if (!type) {
            type = await getUserTypeByConditions({ systemRole: USER_ROLES.LEARNER });
          }
          const password = params?.password?.trim() || generateRandom6Digits();
          const createdUser = await User.create({
            firstName: params.firstName || 'First Name',
            lastName: params.lastName || '',
            email: params.email?.toLowerCase()?.trim(),
            bio: params.bio || '',
            password: bcrypt.hashSync(password.toString(), BCRYPT_SALT_ROUNDS),
            type: type._id,
            status: USER_STATUS[params?.status?.toUpperCase()] || USER_STATUS.ACTIVE,
          });
          if (createdUser) {
            createLogs({
              event: EVENT_LOGS.USER_REGISTER,
              type: EVENT_LOGS_TYPE.REGISTER,
              user: auth?._id,
              data: { user: createdUser?._id }
            });
            const notifications = await getNotificationByKey(NOTIFICATION_EVENT.REGISTRY_ACCOUNT);
            if (JSON.stringify(notifications) !== '{}') {
              const notification = notifications[type?.systemRole] || notifications.ALL;
              if (notification) {
                await formatNotification(notification, {
                  userInfo: {
                    firstName: params.firstName,
                    lastName: params.lastName,
                    fullName: `${params.firstName} ${params.lastName}`,
                    email: params.email,
                    user_password: password,
                  },
                  email: params.email
                });
              }
            } else {
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
                  password: password,
                }
              });
            }
          }
        } else {
          const dataUpdate = {};
          if (params.firstName) {
            dataUpdate.firstName = params.firstName;
          }
          if (params.lastName) {
            dataUpdate.lastName = params.lastName;
          }
          if (USER_STATUS[params?.status?.toUpperCase().trim()]) {
            dataUpdate.status = USER_STATUS[params?.status?.toUpperCase()];
          }
          if (params?.password && params?.password?.trim()?.length >= USER_MIN_PASSWORD_LENGTH) {
            dataUpdate.password = bcrypt.hashSync(params?.password?.trim(), BCRYPT_SALT_ROUNDS);
          }
          const userUpdate = await User.findOneAndUpdate({ email: params.email }, { $set: dataUpdate });
          if (dataUpdate.password) {
            const notifications = await getNotificationByKey(NOTIFICATION_EVENT.CHANGE_PASSWORD_ACCOUNT);
            if (JSON.stringify(notifications) !== '{}') {
              const type = await getUserTypeByConditions({ key: params?.type });
              const notification = notifications[type?.systemRole] || notifications.ALL;
              if (notification) {
                await formatNotification(notification, {
                  userInfo: {
                    firstName: params.firstName,
                    lastName: params.lastName,
                    fullName: `${params.firstName} ${params.lastName}`,
                    email: params.email,
                    user_password: params.password,
                  },
                  email: params.email
                });
              }
            }
          }
          if (userUpdate) {
            createLogs({
              event: EVENT_LOGS.USER_UPDATE,
              type: EVENT_LOGS_TYPE.UPDATE,
              user: auth?._id,
              data: { user: userUpdate?._id }
            });
          }
        }
      }
      return true;
    }));
    return true;
  } catch (error) {
    logger.error('User importUser error:', error);
    throw error;
  }
}
export async function checkImportUser(data) {
  try {
    const results = {
      done: [],
      failed: [],
      exist: []
    };
    await Promise.all(data.map(async (result) => {
      if (!validateEmail(result.email)) {
        results.failed.push(result.email);
      } else if (await emailUsed(result.email)) {
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
export async function checkImport(data) {
  try {
    const results = {
      users: {
        done: [],
        exist: [],
        failed: []
      },
      courses: {
        done: [],
        exist: [],
        failed: []
      },
      intakes: {
        done: [],
        exist: [],
        failed: []
      },
      userIntakes: {
        done: [],
        failed: []
      },
      liveSession: {
        done: [],
        failed: []
      }
    };
    const checkedUsers = [];
    const checkedEmail = [];
    const checkedIntakes = [];
    const checkedCoures = [];
    const checkedCode = [];
    const {
     users, courses, intakes, userIntakes, liveSession
    } = data;
    const checkedUserIntake = [];
    if (users?.length) {
      await Promise.all(users.map(async (result) => {
        if (checkedEmail.indexOf(result.email) !== -1) {
          return;
        }
        checkedEmail.push(result.email);
        if (!validateEmail(result.email)) {
          results.users.failed.push({
            ...result,
            message: 'Invalid email address.'
          });
          return;
        }
        if (await getUserByEmail(result.email)) {
          results.users.exist.push({
            ...result,
            message: 'Email already exists.'
          });
          return;
        }
        if (result.password?.trim() && result.password?.trim().length < USER_MIN_PASSWORD_LENGTH) {
          results.users.failed.push({
            ...result,
            message: `Password must be at least ${USER_MIN_PASSWORD_LENGTH} chars long`
          });
          return;
        }
        checkedUsers.push(result.email);
        results.users.done.push(result);
      }));
    }
    if (courses?.length) {
      await Promise.all(courses.map(async (result) => {
        if (checkedCode.indexOf(result.code) !== -1) {
          return;
        }
        checkedCode.push(result.code);
        if (!result.name || !result.code) {
          results.courses.failed.push({
            ...result,
            message: 'Invalid name or course code.'
          });
          return;
        }
        if (result.code && await getCourseByCode(result.code.toUpperCase())) {
          results.courses.exist.push({
            ...result,
            message: 'Course code already exists.'
          });
          return;
        }
        results.courses.done.push(result);
        checkedCoures.push(result.code);
      }));
    }
    if (intakes?.length) {
      await Promise.all(intakes.map(async (result) => {
        if (checkedCode.indexOf(result.code) !== -1) {
          return;
        }
        checkedCode.push(result.code);
        if (!result.code || !result.courseCode) {
          results.intakes.failed.push({
            ...result,
            message: 'Invalid intake code or course code.'
          });
          return;
        }
        if (await getCourseByCode(result.code.toUpperCase())) {
          results.intakes.exist.push({
            ...result,
            message: 'Intake code already exists.'
          });
          return;
        }
        const course = await getCourseByConditions({
          code: result?.courseCode.toUpperCase(),
          parent: null,
          status: { $in: [COURSE_STATUS.ACTIVE, COURSE_STATUS.INACTIVE] }
        });
        if (!course?.length
              && checkedCoures.indexOf(result.courseCode) === -1) {
          results.intakes.failed.push({
            ...result,
            message: 'Course code not found.'
          });
          return;
        }
        results.intakes.done.push(result);
        checkedIntakes.push(result.code);
      }));
    }
    if (userIntakes?.length) {
      await Promise.all(userIntakes.map(async (result) => {
        if (checkedUserIntake.indexOf(`${result.email}-${result.code}`) !== -1) {
          return;
        }
        checkedUserIntake.push(`${result.email}-${result.code}`);
        if (!validateEmail(result.email)) {
          results.userIntakes.failed.push({
            ...result,
            message: 'Invalid email address.'
          });
          return;
        }
        if (!await emailUsed(result.email)
          && checkedUsers.indexOf(result.email) === -1
        ) {
          results.userIntakes.failed.push({
            ...result,
            message: 'Email address not found.'
          });
          return;
        }
        const intake = await getCourseByConditions({
          code: result?.code.toUpperCase(),
          parent: { $ne: null },
          status: { $in: [COURSE_STATUS.ACTIVE, COURSE_STATUS.INACTIVE] }
        });
        if (!intake?.length && checkedIntakes.indexOf(result.code) === -1) {
          results.userIntakes.failed.push({
            ...result,
            message: 'Intake code not found.'
          });
          return;
        }
        results.userIntakes.done.push(result);
      }));
    }
    if (liveSession?.length) {
      await Promise.all(liveSession.map(async (result) => {
        const intake = await getCourseByConditions({
          code: result?.code.toUpperCase(),
          parent: { $ne: null },
          status: { $in: [COURSE_STATUS.ACTIVE, COURSE_STATUS.INACTIVE] }
        });
        const time = new Date(result.date).getTime();
        const startTime = new Date(result.startTime).getTime();
        const endTime = new Date(result.endTime).getTime();
        if (!result?.lesson?.length) {
          return results.liveSession.failed.push({
            ...result,
            message: 'Title event not empty..'
          });
        }
        if (!intake.length && checkedIntakes.indexOf(result.code) === -1) {
          return results.liveSession.failed.push({
            ...result,
            message: 'Intake code not found.'
          });
        }
        if (Number.isNaN(time)
            || Number.isNaN(startTime)
            || Number.isNaN(endTime)
            || startTime >= endTime) {
          return results.liveSession.failed.push({
            ...result,
            message: 'Invalid time event.'
          });
        }
        return results.liveSession.done.push(result);
      }));
    }
    return results;
  } catch (error) {
    logger.error('User checkImportUser error:', error);
    throw error;
  }
}

export async function importData(data, auth) {
  try {
    const {
 users, courses, intakes, userIntakes, liveSession
} = data;
    if (users?.length) {
      await importUser(users, auth);
    }
    if (courses?.length) {
      await importCourses(courses, auth);
    }
    if (intakes?.length) {
      await importIntakes(intakes, auth);
    }
    if (userIntakes?.length) {
      await importUserToIntakes(userIntakes, auth);
    }
    if (liveSession?.length) {
      await importLiveSessionToIntake(liveSession, auth);
    }
    createLogs({
      event: EVENT_LOGS.IMPORT_DATA,
      type: EVENT_LOGS_TYPE.IMPORT,
      user: auth?._id
    });
    return true;
  } catch (error) {
    logger.error('User checkImportUser error:', error);
    throw error;
  }
}
export async function exportData() {
  try {
    const data = await exportDataExcel();
    createLogs({
      event: EVENT_LOGS.EXPORT_DATA,
      type: EVENT_LOGS_TYPE.EXPORT,
      user: auth?._id
    });
    return data;
  } catch (error) {
    logger.error('User exportData error:', error);
    throw error;
  }
}
export async function getAllUser() {
  try {
    return await User.find({}, '_id email firstName lastName bio status').populate({
      path: 'type',
      select: 'name key',
      match: { status: USER_TYPE_STATUS.ACTIVE },
    });
  } catch (error) {
    logger.error('User getAllUser error:', error);
    throw error;
  }
}


/**
 * Set user online
 * @param userId
 * @returns {Promise<boolean>}
 */
export async function setUserOnline(userId) {
  try {
    const checked = await getRedisInfo(`${userId}-online`);
    if (checked) {
      await User.updateOne({ _id: userId }, { $set: {
        online: true
      } });
    } else {
      setRedisInfo(`${userId}-online`, true);
      await Promise.all([
        setRedisExpire(`${userId}-online`, REDIS_TIME_USER_LOGIN),
        User.updateOne({ _id: userId }, { $set: {
            online: true,
            lastLogin: Date.now()
          } }),
        UserLogin.updateOne({
          date: new Date(new Date().setHours(0,0,0,0))
        }, { $inc: {
          times: 1 } }, { upsert: true, new: true, setDefaultsOnInsert: true }),
        createLogs({
          event: EVENT_LOGS.USER_LOGIN,
          type: EVENT_LOGS_TYPE.LOGIN,
          user: userId
        })
      ]);
    }
    // Emit user online state
    ChatNamespace.broadcastToNamespace(SOCKET_CHAT_EVENT.USER_ONLINE_STATE_CHANGE, {
      userId: userId,
      online: true,
    });
    return true;
  } catch (error) {
    logger.error('UserService setUserOnline error:');
    logger.error(error);
    throw error;
  }
}
/**
 * get user login times by date range
 * @param userId
 * @returns {Promise<boolean>}
 */
export async function trackingLoginTimes(query) {
  try {
    const { begin, end } = query;
    let results = await UserLogin.find({
      date: { $gte: begin, $lte: end },
    });
    results = convertArrayToArrayObject(results, 'date');
    const data = [];
    const start = new Date(begin); const ended = new Date(end);
    const loop = new Date(start);
    while (loop < ended) {
      const newDate = new Date(loop).setHours(0,0,0,0);
      const timestamp = new Date(newDate).getTime() + 24*60*60*1000;
      if (results[timestamp]) {
        data.push(results[timestamp]);
      } else {
        data.push({
          date: new Date(newDate).toISOString(),
          completed: 0,
          times: 0
        });
      }
      loop.setDate(loop.getDate() + 1);
    }
    return data;
  } catch (error) {
    logger.error('UserService trackingLoginTimes error:');
    logger.error(error);
    throw error;
  }
}

/**
 * Set user offline
 * @param userId
 * @returns {Promise<boolean>}
 */
export async function setUserOffline(userId) {
  try {
    await User.updateOne({ _id: userId }, { $set: { online: false } });
    // Emit user online state
    ChatNamespace.broadcastToNamespace(SOCKET_CHAT_EVENT.USER_ONLINE_STATE_CHANGE, {
      userId: userId,
      online: false,
    });
    return true;
  } catch (error) {
    logger.error('UserService setUserOffline error:');
    logger.error(error);
    throw error;
  }
}
export function getTimeFromFilter(time) {
  switch (time) {
    case TIME_SELECT_LOGIN.HOUR:
      return new Date(Date.now() - 60*60*1000);
    case TIME_SELECT_LOGIN.FOURHOURS:
      return new Date(Date.now() - 4*60*60*1000);
    case TIME_SELECT_LOGIN.TODAY:
      return new Date().setHours(0,0,0,0);
      // return new Date(Date.now() - 24*60*60*1000);
    case TIME_SELECT_LOGIN.THREEDAY:
      return new Date(Date.now() - 3*24*60*60*1000);
    case TIME_SELECT_LOGIN.WEEK:
      return new Date(Date.now() - 7*24*60*60*1000);
    case TIME_SELECT_LOGIN.MONTH:
      return new Date(Date.now() - 30*24*60*60*1000);
      // const date = new Date();
      // return new Date(date.getFullYear(), date.getMonth(), 1);
    default:
      return null
  }
}
