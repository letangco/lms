import Discussion from './discussion.model';
import DiscussionComment from './discussionComment.model';
import logger from '../../util/logger';
import APIError from '../../util/APIError';
import {
  COURSE_STATUS,
  DEFAULT_PAGE_LIMIT,
  GROUP_STATUS,
  MAX_PAGE_LIMIT,
  UNIT_STATUS,
  USER_STATUS,
  DISCUSSION_STATUS,
  FILE_STATUS,
  NOTIFICATION_EVENT,
  COURSE_USER_STATUS,
  EVENT_LOGS,
  EVENT_LOGS_TYPE,
} from '../../constants';
import { getObjectId, validSearchString } from '../../helpers/string.helper';
import { getUserCoursesByConditions } from '../courseUser/courseUser.service';
import { formatNotification, getNotificationByKey } from '../notification/notificaition.service';
import { getCourseById } from '../course/course.service';
import * as UserService from '../user/user.service';
import { getUnitById } from '../unit/unit.service';
import { getUserType } from '../userType/userType.service';
import { createLogs } from '../logs/logs.service';

/**
 * Create new discussion
 * @param creator
 * @param creator._id
 * @param params
 * @param params.name
 * @param params.message
 * @param params.files
 * @param params.group
 * @param params.course
 * @param params.unit
 * @returns {Promise.<boolean>}
 */
export async function createDiscussion(creator, params) {
  try {
    const discussion = await Discussion.create({
      creator: creator._id,
      ...params,
    });
    createLogs({
      event: EVENT_LOGS.DISCUSSION_CREATION,
      type: EVENT_LOGS_TYPE.CREATE,
      user: creator?._id,
      data: {
        discussion: discussion?._id
      }
    });
    addNotificationToUseInDiscussion(discussion);
    return discussion;
  } catch (error) {
    logger.error('DiscussionService createDiscussion error:', error);
    throw error;
  }
}

/**
 * Create new discussion comment
 * @param creator
 * @param creator._id
 * @param params
 * @param params.message
 * @param params.files
 * @returns {Promise.<boolean>}
 */
export async function createDiscussionComment(creator, params) {
  try {
    const discussion = await DiscussionComment.create({
      creator: creator._id,
      ...params,
    });
    if (discussion.parent) {
      addNotificationToUseInDiscussionCommentReply(discussion);
    } else {
      addNotificationToUseInDiscussionComment(discussion);
    }
    return discussion;
  } catch (error) {
    logger.error('DiscussionService createDiscussionComment error:', error);
    throw error;
  }
}

export async function addNotificationToUseInDiscussion(discussion) {
  try {
    if (!discussion.course) {
      return;
    }
    const users = await getUserCoursesByConditions({
      course: discussion.course,
      status: { $in: [COURSE_USER_STATUS.ACTIVE, COURSE_USER_STATUS.COMPLETED, COURSE_USER_STATUS.IN_PROGRESS] }
    });
    const notifications = await getNotificationByKey(NOTIFICATION_EVENT.ADD_DISCUSSION);
    if (users?.length && JSON.stringify(notifications) !== '{}') {
      let courseInfo; let unitInfo;
      if (discussion.course) {
        courseInfo = await getCourseById(discussion.course);
        if (!courseInfo) {
          return;
        }
      }
      if (discussion.unit) {
        unitInfo = await getUnitById(discussion.unit);
      }
      const userSend = await UserService.getUserByConditions({ _id: discussion.creator, status: USER_STATUS.ACTIVE });
      await Promise.all(users.map(async user => {
        const userInfo = await UserService.getUserByConditions({ _id: user.user, status: USER_STATUS.ACTIVE });
        if (!userInfo || userInfo._id === discussion.creator) {
          return;
        }
        const userType = await getUserType(userInfo.type);
        const notification = notifications[userType.systemRole] || notifications.ALL;
        if (notification) {
          const data = {
            userInfo: {
              firstName: userInfo.firstName,
              lastName: userInfo.lastName,
              fullName: userInfo.fullName,
              email: userInfo.email,
            },
            userSend: {
              firstName: userSend.firstName,
              lastName: userSend.lastName,
              fullName: userSend.fullName,
              email: userSend.email,
            },
            discussionInfo: discussion,
            email: userInfo.email
          };
          if (courseInfo) {
            data.courseInfo = courseInfo;
          }
          if (unitInfo) {
            data.unitInfo = unitInfo;
          }
          await formatNotification(notification, data);
        }
      }));
    }
  } catch (error) {
    logger.error('DiscussionService addNotificationToUseInDiscussion error:', error);
    throw error;
  }
}

export async function addNotificationToUseInDiscussionComment(discussion) {
  try {
    const discussionParent = await getDiscussionById(discussion.discussion);
    if (!discussionParent) {
      return;
    }
    if (!discussionParent.course) {
      return;
    }
    const users = await getUserCoursesByConditions({
      course: discussionParent.course,
      status: { $in: [COURSE_USER_STATUS.ACTIVE, COURSE_USER_STATUS.COMPLETED, COURSE_USER_STATUS.IN_PROGRESS] }
    });
    const notifications = await getNotificationByKey(NOTIFICATION_EVENT.REPLY_DISCUSSION);
    if (users?.length && JSON.stringify(notifications) !== '{}') {
      let courseInfo; let unitInfo;
      if (discussionParent.course) {
        courseInfo = await getCourseById(discussionParent.course);
        if (!courseInfo) {
          return;
        }
      }
      if (discussion.unit) {
        unitInfo = await getUnitById(discussion.unit);
      }
      const userSend = await UserService.getUserByConditions({ _id: discussion.creator, status: USER_STATUS.ACTIVE });
      await Promise.all(users.map(async user => {
        const userInfo = await UserService.getUserByConditions({ _id: user.user, status: USER_STATUS.ACTIVE });
        if (!userInfo || userInfo._id === discussion.creator) {
          return;
        }
        const userType = await getUserType(userInfo.type);
        const notification = notifications[userType.systemRole] || notifications.ALL;
        if (notification) {
          const data = {
            userInfo: {
              firstName: userInfo.firstName,
              lastName: userInfo.lastName,
              fullName: userInfo.fullName,
              email: userInfo.email,
            },
            userSend: {
              firstName: userSend.firstName,
              lastName: userSend.lastName,
              fullName: userSend.fullName,
              email: userSend.email,
            },
            discussionInfo: discussionParent,
            commentInfo: discussion,
            email: userInfo.email
          };
          if (courseInfo) {
            data.courseInfo = courseInfo;
          }
          if (unitInfo) {
            data.unitInfo = unitInfo;
          }
          await formatNotification(notification, data);
        }
      }));
    }
  } catch (error) {
    logger.error('DiscussionService addNotificationToUseInDiscussionComment error:', error);
    throw error;
  }
}

export async function addNotificationToUseInDiscussionCommentReply(discussion) {
  try {
    const discussionParent = await getDiscussionById(discussion.discussion);
    if (!discussionParent) {
      return;
    }
    const commentParent = await DiscussionComment.findById({ _id: discussion.parent });
    if (!commentParent) {
      return;
    }
    const notifications = await getNotificationByKey(NOTIFICATION_EVENT.REPLY_COMMENT_DISCUSSION);
    if (JSON.stringify(notifications) !== '{}') {
      let courseInfo; let unitInfo;
      if (discussionParent.course) {
        courseInfo = await getCourseById(discussionParent.course);
        if (!courseInfo) {
          return;
        }
      }
      if (discussion.unit) {
        unitInfo = await getUnitById(discussion.unit);
      }
      const userInfo = await UserService.getUserByConditions({ _id: commentParent.creator, status: USER_STATUS.ACTIVE });
      if (!userInfo
      || userInfo._id === discussion.creator) {
        return;
      }
      const userSend = await UserService.getUserByConditions({ _id: discussion.creator, status: USER_STATUS.ACTIVE });
      if (!userSend) {
        return;
      }
      const userType = await getUserType(userInfo.type);
      const notification = notifications[userType.systemRole] || notifications.ALL;
      if (notification) {
        const data = {
          userInfo: {
            firstName: userInfo.firstName,
            lastName: userInfo.lastName,
            fullName: userInfo.fullName,
            email: userInfo.email,
          },
          userSend: {
            firstName: userSend.firstName,
            lastName: userSend.lastName,
            fullName: userSend.fullName,
            email: userSend.email,
          },
          discussionInfo: discussionParent,
          commentParent: commentParent,
          commentInfo: discussion,
          email: userInfo.email
        };
        if (courseInfo) {
          data.courseInfo = courseInfo;
        }
        if (unitInfo) {
          data.unitInfo = unitInfo;
        }
        await formatNotification(notification, data);
      }
    }
  } catch (error) {
    logger.error('DiscussionService addNotificationToUseInDiscussion error:', error);
    throw error;
  }
}

/**
 * Get discussions
 * @returns {Promise<{totalItems: *, data: *, totalPage: *, currentPage: *}>}
 */
export async function getDiscussions(query) {
  try {
    const _page = query.page; const rowPerPage = query.rowPerPage; const textSearch = query.textSearch;
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
      _id: parseInt(query.sort)
    };

    const queryConditions = {
      status: DISCUSSION_STATUS.ACTIVE,
    };
    if (typeof textSearch === 'string' && textSearch) {
      queryConditions.$or = [
        { name: { $regex: validSearchString(textSearch) } },
        { message: { $regex: validSearchString(textSearch) } }
      ];
    }
    if (query.group) {
      queryConditions.group = query.group;
    }
    if (query.course) {
      queryConditions.course = query.course;
    }
    if (query.unit) {
      queryConditions.unit = query.unit;
    }
    if (query.creator) {
      queryConditions.creator = query.creator;
    }
    const totalItems = await Discussion.countDocuments(queryConditions);
    let data = await Discussion.find(queryConditions)
    .sort(sortCondition)
    .skip(skip)
    .limit(pageLimit)
      .populate([
        {
          path: 'creator',
          select: '_id fullName avatar',
          match: { status: USER_STATUS.ACTIVE },
        },
        {
          path: 'course',
          select: '_id name',
          match: { status: COURSE_STATUS.ACTIVE },
        },
        {
          path: 'unit',
          select: '_id title',
          match: { status: UNIT_STATUS.ACTIVE },
        },
        {
          path: 'group',
          select: '_id name',
          match: { status: GROUP_STATUS.ACTIVE },
        },
        {
          path: 'files',
          match: { status: FILE_STATUS.ACTIVE },
        }
      ]);
    if (data?.length) {
      data = await Promise.all(
        data.map( async (item) => {
          const total = await DiscussionComment.countDocuments({ discussion: item._id });
          const result = item.toJSON();
          result.child = total;
          return result;
        })
      );
    }
    return {
      data: data,
      currentPage: page,
      totalPage: Math.ceil(totalItems / pageLimit),
      totalItems: totalItems,
    };
  } catch (error) {
    logger.error(`DiscussionService getDiscussions error: ${error}`);
    throw error;
  }
}

/**
 * Get discussion comments
 * @returns {Promise<{totalItems: *, data: *, totalPage: *, currentPage: *}>}
 */
export async function getDiscussionComments(query) {
  const { rowPerPage, firstId, lastId } = query;
  try {
    if (firstId && lastId) {
      return Promise.reject(new APIError(422, [{
        msg: 'Please provide only firstId or only lastId to get comment',
        param: 'firstIdConflictLastId',
        location: 'query',
      }]));
    }
    let pageLimit = Number(rowPerPage || DEFAULT_PAGE_LIMIT).valueOf();
    if (pageLimit > MAX_PAGE_LIMIT) {
      pageLimit = MAX_PAGE_LIMIT;
    }
    const queryConditions = {
      status: DISCUSSION_STATUS.ACTIVE,
    };
    const sortCondition = {
      createdAt: -1,
    };
    if (lastId) {
      queryConditions._id = { $lt: getObjectId(lastId) };
    } else if (firstId) {
      queryConditions._id = { $gt: getObjectId(firstId) };
    }
    if (query.discussion) {
      queryConditions.discussion = query.discussion;
    }
    if (query.parent) {
      queryConditions.parent = query.parent;
    } else {
      queryConditions.parent = null;
    }
    if (query.creator) {
      queryConditions.creator = query.creator;
    }
    let data = await DiscussionComment.find(queryConditions)
    .sort(sortCondition)
    .limit(pageLimit)
      .populate([
        {
          path: 'creator',
          select: '_id fullName avatar',
          match: { status: USER_STATUS.ACTIVE },
        },
        {
          path: 'files',
          match: { status: FILE_STATUS.ACTIVE },
        }
      ]);
    if (data?.length) {
      data = await Promise.all(
        data.map( async (item) => {
          const total = await DiscussionComment.countDocuments({ parent: item._id });
          const result = item.toJSON();
          result.child = total;
          return result;
        })
      );
    }
    if (firstId) {
      data.reverse();
    }
    return data;
  } catch (error) {
    logger.error(`DiscussionService getDiscussionComments error: ${error}`);
    throw error;
  }
}

/**
 * Delete discussion
 * @param id the discussion id
 * @returns {Promise.<boolean>}
 */
export async function deleteDiscussion(id, auth = {}) {
  try {
    await Discussion.updateOne({ _id: id }, { $set: { status: DISCUSSION_STATUS.DELETED } });
    createLogs({
      event: EVENT_LOGS.DISCUSSION_DELETION,
      type: EVENT_LOGS_TYPE.DELETE,
      user: auth?._id,
      data: {
        discussion: id
      }
    });
    return true;
  } catch (error) {
    logger.error('DiscussionService deleteDiscussion error:', error);
    throw error;
  }
}

/**
 * Delete discussion comment
 * @param id the discussion id
 * @returns {Promise.<boolean>}
 */
export async function deleteDiscussionComment(id) {
  try {
    await DiscussionComment.updateOne({ _id: id }, { $set: { status: DISCUSSION_STATUS.DELETED } });
    return true;
  } catch (error) {
    logger.error('DiscussionService deleteDiscussionComment error:', error);
    throw error;
  }
}

/**
 * Get discussion by id
 * @param id the discussion id
 * @returns {Promise.<boolean>}
 */
export async function getDiscussion(id) {
  try {
    const discussion = await Discussion.findOne({ _id: id, status: DISCUSSION_STATUS.ACTIVE })
      .populate([
        {
          path: 'creator',
          select: '_id fullName avatar',
          match: { status: USER_STATUS.ACTIVE },
        },
        {
          path: 'course',
          select: '_id name',
          match: { status: COURSE_STATUS.ACTIVE },
        },
        {
          path: 'unit',
          select: '_id title',
          match: { status: UNIT_STATUS.ACTIVE },
        },
        {
          path: 'group',
          select: '_id name',
          match: { status: GROUP_STATUS.ACTIVE },
        },
        {
          path: 'files',
          match: { status: FILE_STATUS.ACTIVE },
        }
      ]);
    if (!discussion) {
      return Promise.reject(new APIError(404, 'Discussion not found'));
    }
    const total = await DiscussionComment.countDocuments({ discussion: discussion._id });
    const result = discussion.toJSON();
    result.child = total;
    return result;
  } catch (error) {
    logger.error('DiscussionService getDiscussion error:', error);
    throw error;
  }
}
/**
 * Get discussion comment by id
 * @param id the discussion id
 * @returns {Promise.<boolean>}
 */
export async function getDiscussionComment(id) {
  try {
    const discussion = await DiscussionComment.findOne({ _id: id, status: DISCUSSION_STATUS.ACTIVE })
      .populate([
        {
          path: 'creator',
          select: '_id fullName avatar',
          match: { status: USER_STATUS.ACTIVE },
        },
        {
          path: 'files',
          match: { status: FILE_STATUS.ACTIVE },
        }
      ]);
    if (!discussion) {
      return Promise.reject(new APIError(404, 'Discussion comment not found'));
    }
    const total = await DiscussionComment.countDocuments({ parent: id });
    const result = discussion.toJSON();
    result.child = total;
    return result;
  } catch (error) {
    logger.error('DiscussionService getDiscussionComment error:', error);
    throw error;
  }
}
/**
 * Get discussion by id
 * @param id the discussion id
 * @returns {Promise.<boolean>}
 */
export async function getDiscussionById(id) {
  try {
    return await Discussion.findOne({ _id: id, status: DISCUSSION_STATUS.ACTIVE });
  } catch (error) {
    logger.error('DiscussionService getDiscussionById error:', error);
    throw error;
  }
}
/**
 * Get discussion by id
 * @param conditions the discussion query
 * @returns {Promise.<boolean>}
 */
export async function getDiscussionByConditions(conditions) {
  try {
    return await Discussion.findOne(conditions);
  } catch (error) {
    logger.error('DiscussionService getDiscussionByConditions error:', error);
    throw error;
  }
}
/**
 * Get discussion by id
 * @param id the discussion id
 * @returns {Promise.<boolean>}
 */
export async function getDiscussionCommentById(id) {
  try {
    return await DiscussionComment.findOne({ _id: id, status: DISCUSSION_STATUS.ACTIVE });
  } catch (error) {
    logger.error('DiscussionService getDiscussionCommentById error:', error);
    throw error;
  }
}

/**
 * Update discussion
 * @param id the discussion id
 * @param params
 * @param {String} params.name
 * @param {String} params.message
 * @param {String} params.files
 * @param {String} params.status
 * @returns {Promise.<boolean>}
 */
export async function updateDiscussion(id, params, auth) {
  try {
    const validFields = ['name', 'message', 'files', 'status'];
    const updateValues = {};
    validFields.forEach((validField) => {
      if (params[validField]) {
        updateValues[validField] = params[validField];
      }
    });
    if (Object.keys(updateValues).length > 0) {
      const updateResult = await Discussion.updateOne({
        _id: id,
      }, {
        $set: updateValues,
      });
      if (!updateResult.nModified) {
        return Promise.reject(new APIError(304, 'Not Modified'));
      }
      const discussion = await Discussion.findOne({
        _id: id,
      });
      createLogs({
        event: EVENT_LOGS.DISCUSSION_UPDATE,
        type: EVENT_LOGS_TYPE.UPDATE,
        user: auth?._id,
        data: {
          discussion: id
        }
      });
      return discussion;
    }
    return Promise.reject(new APIError(304, 'Not Modified'));
  } catch (error) {
    logger.error('DiscussionService updateDiscussion error:', error);
    throw error;
  }
}


/**
 * Update discussion comment
 * @param id the discussion comment id
 * @param params
 * @param {String} params.name
 * @param {String} params.message
 * @param {String} params.files
 * @param {String} params.status
 * @returns {Promise.<boolean>}
 */
export async function updateDiscussionComment(id, params) {
  try {
    const validFields = ['message', 'files', 'status'];
    const updateValues = {};
    validFields.forEach((validField) => {
      if (params[validField]) {
        updateValues[validField] = params[validField];
      }
    });
    if (Object.keys(updateValues).length > 0) {
      const updateResult = await DiscussionComment.updateOne({
        _id: id,
      }, {
        $set: updateValues,
      });
      if (!updateResult.nModified) {
        return Promise.reject(new APIError(304, 'Not Modified'));
      }
      return await DiscussionComment.findOne({
        _id: id,
      });
    }
    return Promise.reject(new APIError(304, 'Not Modified'));
  } catch (error) {
    logger.error('DiscussionService updateDiscussionComment error:', error);
    throw error;
  }
}
