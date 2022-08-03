const fs = require('fs');
const path = require('path');

import Notification from './notificaition.model';
import { SENDER_NAME, CLIENT_HOST, SUPER_ADMIN, SENDER_EMAIL } from '../../config';
import logger from '../../util/logger';
import APIError from '../../util/APIError';
import {
  DEFAULT_PAGE_LIMIT,
  MAX_PAGE_LIMIT,
  NOTIFICATION_STATUS,
  NOTIFICATION_SYSTEM_DATA,
  NOTIFICATION_DATA_SYSTEM,
  NOTIFICATION_DATA_COURSE,
  NOTIFICATION_DATA_DISCUSSION,
  NOTIFICATION_DATA_REPLY_DISCUSSION,
  NOTIFICATION_DATA_REPLY_COMMENT_DISCUSSION,
  NOTIFICATION_DATA_EVENT,
  NOTIFICATION_DATA_UNIT,
  NOTIFICATION_DATA_TEST,
  NOTIFICATION_DATA_SURVEY,
  NOTIFICATION_DATA_ASSIGNMENT,
  NOTIFICATION_DATA_SCORM,
  NOTIFICATION_DATA_USER_INFO,
  NOTIFICATION_DATA_USER_RES,
  NOTIFICATION_DATA_USER_RESET,
  FOOTER_NOTIFICATION,
  NOTIFICATION_DATA_COURSE_GRADING,
  EVENT_LOGS,
  EVENT_LOGS_TYPE,
  NOTIFICATION_LOG_STATUS,
  ORDER_BY,
  NOTIFICATION_ORDER_FIELDS
} from '../../constants';
import { validSearchString } from '../../helpers/string.helper';
import { sendEmail } from '../../../mailService/SendGrid';
import { getUserSetting } from '../userSetting/userSetting.service';
import { createLogs } from '../logs/logs.service';
import { getFilesByConditions, getFilesByIds } from '../file/file.service';
import NotificationLog from './notificaitionLog.model';

/**
 * Create new notification
 * @param creator
 * @param creator._id
 * @param params
 * @param params.name
 * @param params.message
 * @param params.event
 * @param params.status
 * @returns {Promise.<boolean>}
 */
export async function createNotification(creator, params) {
  try {
    const notification = await Notification.create({
      creator: creator._id,
      ...params,
    });
    createLogs({
      event: EVENT_LOGS.NOTIFICATION_CREATION,
      type: EVENT_LOGS_TYPE.CREATE,
      user: creator?._id,
      data: {
        notification: notification?._id
      }
    });
    return notification;
  } catch (error) {
    logger.error('NotificationService createNotification error:', error);
    throw error;
  }
}

/**
 * Get notifications
 * @returns {Promise<{totalItems: *, data: *, totalPage: *, currentPage: *}>}
 */
export async function getNotifications(query) {
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
      _id: query.parent ? 1 : -1
    };

    const queryConditions = {
    };
    if (typeof textSearch === 'string' && textSearch) {
      queryConditions.$or = [
        { name: { $regex: validSearchString(textSearch) } },
        { message: { $regex: validSearchString(textSearch) } }
      ];
    }
    if (query.status) {
      queryConditions.status = query.status;
    } else {
      queryConditions.status = { $ne: NOTIFICATION_STATUS.DELETED };
    }
    if (query.event) {
      queryConditions.event = query.event;
    }
    if (query.creator) {
      queryConditions.creator = query.creator;
    }
    const totalItems = await Notification.countDocuments(queryConditions);
    const data = await Notification.find(queryConditions)
      .sort(sortCondition)
      .skip(skip)
      .limit(pageLimit)
      .lean();
    return {
      data,
      currentPage: page,
      totalPage: Math.ceil(totalItems / pageLimit),
      totalItems: totalItems,
    };
  } catch (error) {
    logger.error(`NotificationService getNotifications error: ${error}`);
    throw error;
  }
}

/**
 * Delete notification
 * @param id the notification id
 * @returns {Promise.<boolean>}
 */
export async function deleteNotification(id, auth = {}) {
  try {
    await Notification.updateOne({ _id: id }, { $set: { status: NOTIFICATION_STATUS.DELETED } });
    createLogs({
      event: EVENT_LOGS.NOTIFICATION_DELETION,
      type: EVENT_LOGS_TYPE.DELETE,
      user: auth?._id,
      data: {
        notification: id
      }
    });
    return true;
  } catch (error) {
    logger.error('NotificationService deleteNotification error:', error);
    throw error;
  }
}
export async function formatNotification(notification, data) {
  try {
    let message = notification?.message ?? '';
    let name = notification?.name ?? '';
    const { userInfo, userSend, courseInfo, unitInfo, eventInfo, info, email, discussionInfo, commentParent, commentInfo } = data;
    const NOTIFICATION_DATA = {
      ...NOTIFICATION_DATA_SYSTEM,
      ...NOTIFICATION_DATA_COURSE,
      ...NOTIFICATION_DATA_COURSE_GRADING,
      ...NOTIFICATION_DATA_DISCUSSION,
      ...NOTIFICATION_DATA_REPLY_DISCUSSION,
      ...NOTIFICATION_DATA_REPLY_COMMENT_DISCUSSION,
      ...NOTIFICATION_DATA_EVENT,
      ...NOTIFICATION_DATA_UNIT,
      ...NOTIFICATION_DATA_TEST,
      ...NOTIFICATION_DATA_SURVEY,
      ...NOTIFICATION_DATA_ASSIGNMENT,
      ...NOTIFICATION_DATA_SCORM,
      ...NOTIFICATION_DATA_USER_INFO,
      ...NOTIFICATION_DATA_USER_RES,
      ...NOTIFICATION_DATA_USER_RESET,
    };
    for (const key of Object.keys(NOTIFICATION_DATA)) {
      let link;
      switch (NOTIFICATION_DATA[key]) {
        case 'user_email':
          if (!userInfo?.email) break;
          message = message.replace(/{user_email}/g, userInfo?.email);
          name = name.replace(/{user_email}/g, userInfo?.email);
          break;
        case 'user_fullName':
          if (!userInfo?.fullName) break;
          message = message.replace(/{user_fullName}/g, userInfo?.fullName);
          name = name.replace(/{user_fullName}/g, userInfo?.fullName);
          break;
        case 'user_firstName':
          if (!userInfo?.firstName) break;
          message = message.replace(/{user_firstName}/g, userInfo?.firstName);
          name = name.replace(/{user_firstName}/g, userInfo?.firstName);
          break;
        case 'user_lastName':
          if (!userInfo?.lastName) break;
          message = message.replace(/{user_lastName}/g, userInfo?.lastName);
          name = name.replace(/{user_lastName}/g, userInfo?.lastName);
          break;
        case 'email_user_send':
          if (!userSend?.email) break;
          message = message.replace(/{email_user_send}/g, userSend?.email);
          name = name.replace(/{email_user_send}/g, userSend?.email);
          break;
        case 'fullName_user_send':
          if (!userSend?.fullName) break;
          message = message.replace(/{fullName_user_send}/g, userSend?.fullName);
          name = name.replace(/{fullName_user_send}/g, userSend?.fullName);
          break;
        case 'firstName_user_send':
          if (!userSend?.firstName) break;
          message = message.replace(/{firstName_user_send}/g, userSend?.firstName);
          name = name.replace(/{firstName_user_send}/g, userSend?.firstName);
          break;
        case 'lastName_user_send':
          if (!userSend?.lastName) break;
          message = message.replace(/{lastName_user_send}/g, userSend?.lastName);
          name = name.replace(/{lastName_user_send}/g, userSend?.lastName);
          break;
        case 'site_url':
          message = message.replace(/{site_url}/g, CLIENT_HOST);
          name = name.replace(/{site_url}/g, CLIENT_HOST);
          break;
        case 'site_name':
          const siteName = await getUserSetting({ key: 'name' });
          message = message.replace(/{site_name}/g, siteName?.value ?? SENDER_NAME);
          name = name.replace(/{site_name}/g, siteName?.value ?? SENDER_NAME);
          break;
        case 'footer_notification':
          const footer = await getUserSetting({ key: 'footer_notification' });
          if (footer) {
            const footerTemp = `<div style="white-space: pre-line">${footer?.value ?? ''}</div>`
            message = message.replace(/{footer_notification}/g, footerTemp);
            name = name.replace(/{footer_notification}/g, footerTemp);
            break;
          }
          message = message.replace(/{footer_notification}/g, FOOTER_NOTIFICATION);
          name = name.replace(/{footer_notification}/g, FOOTER_NOTIFICATION);
          break;
        case 'admin_email':
          message = message.replace(/{admin_email}/g, SUPER_ADMIN.EMAIL);
          name = name.replace(/{admin_email}/g, SUPER_ADMIN.EMAIL);
          break;
        case 'admin_name':
          message = message.replace(/{admin_name}/g, `${SUPER_ADMIN.FIRST_NAME} ${SUPER_ADMIN.LAST_NAME}`);
          name = name.replace(/{admin_name}/g, `${SUPER_ADMIN.FIRST_NAME} ${SUPER_ADMIN.LAST_NAME}`);
          break;
        case 'course_name':
          if (!courseInfo) break;
          message = message.replace(/{course_name}/g, courseInfo?.name);
          name = name.replace(/{course_name}/g, courseInfo?.name);
          break;
        case 'course_url':
          if (!courseInfo) break;
          message = message.replace(/{course_url}/g, `${CLIENT_HOST}/course/${courseInfo?._id}`);
          name = name.replace(/{course_url}/g, `${CLIENT_HOST}/course/${courseInfo?._id}`);
          break;
        case 'unit_url':
          if (!unitInfo) break;
          message = message.replace(/{unit_url}/g, `${CLIENT_HOST}/course/${unitInfo?.course}/unit/${unitInfo?._id}`);
          name = name.replace(/{unit_url}/g, `${CLIENT_HOST}/course/${unitInfo?.course}/unit/${unitInfo?._id}`);
          break;
        case 'event_name':
          if (!eventInfo) break;
          message = message.replace(/{event_name}/g, eventInfo?.name);
          name = name.replace(/{event_name}/g, eventInfo?.name);
          break;
        case 'reset_url':
          if (!userInfo?.reset_url) break;
          message = message.replace(/{reset_url}/g, userInfo?.reset_url);
          name = name.replace(/{reset_url}/g, userInfo?.reset_url);
          break;
        case 'user_password':
          if (!userInfo?.user_password) break;
          message = message.replace(/{user_password}/g, userInfo?.user_password);
          name = name.replace(/{user_password}/g, userInfo?.user_password);
          break;
        case 'test_result':
          if (!info) break;
          message = message.replace(/{test_result}/g, `${CLIENT_HOST}/reports/tests/${info?.unit}?result=${info?._id}`);
          break;
        case 'survey_result':
          if (!info) break;
          message = message.replace(/{survey_result}/g, `${CLIENT_HOST}/reports/surveys/${info?.unit}?result=${info?._id}`);
          break;
        case 'assignment_result':
          if (!info) break;
          message = message.replace(/{assignment_result}/g, `${CLIENT_HOST}/reports/assignments/${info?.unit}?result=${info?._id}`);
          break;
        case 'scorm_result':
          if (!info) break;
          message = message.replace(/{scorm_result}/g, `${CLIENT_HOST}/reports/scorm/${info?.unit}?result=${info?._id}`);
          break;
        case 'course_grading':
          if (!info) break;
          message = message.replace(/{course_grading}/g, info?.grade);
          name = name.replace(/{course_grading}/g, info?.grade);
          break;
        case 'discussion_name':
          if (!discussionInfo) break;
          message = message.replace(/{discussion_name}/g, discussionInfo?.name);
          name = name.replace(/{discussion_name}/g, discussionInfo?.name);
          break;
        case 'discussion_link':
          if (!discussionInfo) break;
          link = `${CLIENT_HOST}/course/${courseInfo?._id}/discussion/${discussionInfo?._id}`;
          if (unitInfo) {
            link += `?unit=${unitInfo._id}`;
          }
          message = message.replace(/{discussion_link}/g, link);
          break;
        case 'reply_discussion_link':
          if (!commentInfo) break;
          link = `${CLIENT_HOST}/course/${courseInfo?._id}/discussion/${discussionInfo?._id}`;
          if (unitInfo) {
            link += `?unit=${unitInfo._id}&reply=${commentInfo._id}`;
          } else {
            link += `?reply=${commentInfo._id}`;
          }
          message = message.replace(/{reply_discussion_link}/g, link);
          break;
        case 'reply_comment_discussion_link':
          if (!commentInfo) break;
          link = `${CLIENT_HOST}/course/${courseInfo?._id}/discussion/${discussionInfo?._id}`;
          if (unitInfo) {
            link += `?unit=${unitInfo._id}&comment=${commentParent._id}&reply=${commentInfo._id}`;
          } else {
            link += `?comment=${commentParent?._id}&reply=${commentInfo?._id}`;
          }
          message = message.replace(/{reply_comment_discussion_link}/g, link);
          break;
        case 'date':
          message = message.replace(/{date}/g, new Date().toString());
          name = name.replace(/{date}/g, new Date().toString());
          break;
        default:
          break;
      }
    }
    let attachments = [];
    if (notification?.files?.length) {
      attachments = await Promise.all(notification.files.map( async file => {
        const fileInfo = await getFilesByIds(file);
        if (fileInfo?.path) {
          const dir = path.join(__dirname, `../../../.../../${fileInfo?.path}`);
          if (fs.existsSync(dir)) {
            const attachment = fs.readFileSync(dir).toString('base64');
            return {
              content: attachment,
              filename: fileInfo.title,
              type: fileInfo.mimetype,
              disposition: 'attachment'
            };
          }
        }
      }));
    }
    attachments = attachments.filter(file => file);
    await sendEmail({
      from: {
        name: SENDER_NAME,
        email: SENDER_EMAIL,
      },
      to: email,
      template: '',
      data: {
        content: message
      },
      title: name,
      attachments,
      files: notification?.files
    });
    return notification;
  } catch (err) {
    logger.error('NotificationService formatNotification error:', err);
    throw err;
  }
}
/**
 * Get notification by id
 * @param id the notification id
 * @returns {Promise.<boolean>}
 */
export async function getNotification(id) {
  try {
    const notification = await Notification.findById(id).lean();
    if (notification?.files?.length) {
      notification.files = await getFilesByConditions({
        _id: { $in: notification?.files }
      });
    }
    return notification;
  } catch (error) {
    logger.error('NotificationService getNotification error:', error);
    throw error;
  }
}
/**
 * Get notification log by id
 * @param id the notification log id
 * @returns {Promise.<boolean>}
 */
export async function getNotificationLog(id) {
  try {
    const notification = await NotificationLog.findById(id).lean();
    if (notification?.files?.length) {
      notification.files = await getFilesByConditions({
        _id: { $in: notification?.files }
      });
    }
    return notification;
  } catch (error) {
    logger.error('NotificationService getNotificationLog error:', error);
    throw error;
  }
}
/**
 * Get notification by key
 * @param event
 * @returns {Promise.<boolean>}
 */
export async function getNotificationByKey(event) {
  try {
    const notification = await Notification.find({ event, status: NOTIFICATION_STATUS.ACTIVE }).sort({ _id: 1 });
    if (!notification?.length) {
      return [];
    }
    const results = {};
    notification.map(item => {
      if (item.userType) {
        results[item.userType] = item;
      } else {
        results.ALL = item;
      }
    });
    return results;
  } catch (error) {
    logger.error('NotificationService getNotificationByKey error:', error);
    throw error;
  }
}

/**
 * Update notification
 * @param id the notification id
 * @param params
 * @param {String} params.name
 * @param {String} params.message
 * @param {String} params.event
 * @param {String} params.hours
 * @param {String} params.status
 * @returns {Promise.<boolean>}
 */
export async function updateNotification(id, params, auth = {}) {
  try {
    const validFields = ['name', 'message', 'event', 'hours', 'status', 'design', 'userType', 'files'];
    const updateValues = {};
    validFields.forEach((validField) => {
      if (params[validField]) {
        updateValues[validField] = params[validField];
      }
    });
    if (Object.keys(updateValues).length > 0) {
      const updateResult = await Notification.updateOne({
        _id: id,
      }, {
        $set: updateValues,
      });
      if (!updateResult.nModified) {
        return Promise.reject(new APIError(304, 'Not Modified'));
      }
      createLogs({
        event: EVENT_LOGS.NOTIFICATION_UPDATE,
        type: EVENT_LOGS_TYPE.UPDATE,
        user: auth?._id,
        data: {
          notification: id
        }
      });
      return await Notification.findOne({
        _id: id,
      });
    }
    return Promise.reject(new APIError(304, 'Not Modified'));
  } catch (error) {
    logger.error('NotificationService updateNotification error:', error);
    throw error;
  }
}

export async function createSystemNotification() {
  try {
    Object.keys(NOTIFICATION_SYSTEM_DATA).map(async function(key) {
      const content = NOTIFICATION_SYSTEM_DATA[key];
      const notification = await getNotificationByKey(key);
      if (!notification) {
        return await Notification.create({
          event: key,
          name: content.name,
          message: content.message,
        });
      }
    });
  } catch (error) {
    logger.error('NotificationService createSystemNotification error:', error);
    throw error;
  }
}

export async function cleanNotificationLog() {
  try {
    return await NotificationLog.deleteMany({});
  } catch (error) {
    logger.error('NotificationService cleanNotificationLog error:', error);
    throw error;
  }
}

export async function getListEmailHistoryService(params) {
  try {
    const {
      textSearch,
      status,
      order,
      orderBy,
      rowPerPage,
      page
    } = params;
    let pageLimit = Number(rowPerPage || DEFAULT_PAGE_LIMIT).valueOf();
    if (pageLimit > MAX_PAGE_LIMIT) {
      pageLimit = MAX_PAGE_LIMIT;
    }
    let _page = Number(page || 1).valueOf();
    if (_page < 1) _page = 1;
    const skip = (_page - 1) * pageLimit;
    const queryConditions = {};
    if (typeof textSearch === 'string' && textSearch) {
      queryConditions.recipient = { $regex: validSearchString(textSearch) };
    }
    if (status) {
      switch (status.toLowerCase()) {
        case 'delivered':
          queryConditions.status = NOTIFICATION_LOG_STATUS.DELIVERED;
          break;
        case 'dropped':
          queryConditions.status = NOTIFICATION_LOG_STATUS.DROPPED;
          break;
          case 'deferred':
          queryConditions.status = NOTIFICATION_LOG_STATUS.DEFERRED;
          break;
        case 'bounce':
          queryConditions.status = NOTIFICATION_LOG_STATUS.BOUNCE;
          break;
        case 'blocked':
          queryConditions.status = NOTIFICATION_LOG_STATUS.BLOCKED;
          break;
        case 'open':
          queryConditions.status = NOTIFICATION_LOG_STATUS.OPEN;
          break;
        case 'click':
          queryConditions.status = NOTIFICATION_LOG_STATUS.CLICK;
          break;
        case 'spamreport':
          queryConditions.status = NOTIFICATION_LOG_STATUS.SPAM_REPORT;
          break;
        case 'pending':
          queryConditions.status = NOTIFICATION_LOG_STATUS.PENDING;
          break;
        case 'failed':
          queryConditions.status = NOTIFICATION_LOG_STATUS.FAILED;
          break;
        case 'completed':
          queryConditions.status = NOTIFICATION_LOG_STATUS.COMPLETED;
          break;
        default:
          break;
      }
    }
    const sortCondition = {};
    const orderByValue = ORDER_BY[orderBy] || ORDER_BY.asc;
    if (order && NOTIFICATION_ORDER_FIELDS[order]) {
      sortCondition[NOTIFICATION_ORDER_FIELDS[order]] = orderByValue;
    } else {
      sortCondition._id = -1;
    }
    const promiseHistory = await Promise.all([
      NotificationLog.countDocuments(queryConditions),
      NotificationLog.find(queryConditions)
      .skip(skip)
      .sort(sortCondition)
      .limit(pageLimit)
    ]);
    return {
      data: promiseHistory[1],
      currentPage: _page,
      totalPage: Math.ceil(promiseHistory[0] / pageLimit),
      totalItems: promiseHistory[0]
    };
  } catch (error) {
    logger.error('List Email history error:', error);
    throw error;
  }
}

export async function resendEmailHistoryService(id) {
  try {
    const hasHistory = await NotificationLog.findById(id);
    if (!hasHistory) {
      return Promise.reject(new APIError(404, 'History not found.'));
    }
    let attachments = [];
    if (hasHistory?.files?.length) {
      attachments = await Promise.all(hasHistory.files.map( async file => {
        const fileInfo = await getFilesByIds(file);
        if (fileInfo?.path) {
          const dir = path.join(__dirname, `../../../.../../${fileInfo?.path}`);
          const attachment = fs.readFileSync(dir).toString('base64');
          return {
            content: attachment,
            filename: fileInfo.title,
            type: fileInfo.mimetype,
            disposition: 'attachment'
          };
        }
      }));
    }
    attachments = attachments.filter(file => file);
    sendEmail({
      from: {
        name: SENDER_NAME,
        email: SENDER_EMAIL,
      },
      template: '',
      to: hasHistory.recipient,
      title: hasHistory.subject,
      data: {
        content: hasHistory.message
      },
      attachments: attachments
    });
    return true;
  } catch (error) {
    logger.error('Resend Email history error:', error);
    throw error;
  }
}
