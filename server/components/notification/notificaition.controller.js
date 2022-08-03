import * as NotificationService from './notificaition.service';
import {
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
  NOTIFICATION_EVENT, USER_ROLES_NOTIFICATION,
  NOTIFICATION_DATA_COURSE_GRADING,
  NOTIFICATION_LOG_STATUS
} from '../../constants';
import { checkUserTypeIsAdmin } from '../userType/userType.service';
export async function createNotification(req, res, next) {
  try {
    const notification = await NotificationService.createNotification(req.auth, req.body);
    return res.json({
      success: true,
      payload: notification,
    });
  } catch (error) {
    return next(error);
  }
}

export async function getNotifications(req, res, next) {
  try {
    const notifications = await NotificationService.getNotifications(req.query);
    return res.json({
      success: true,
      payload: notifications,
    });
  } catch (error) {
    return next(error);
  }
}

export async function getNotificationData(req, res, next) {
  try {
    let data = {};
    const { event } = req.query;
    if (event) {
      switch (event) {
        case NOTIFICATION_EVENT.REGISTRY_ACCOUNT:
          data = {
            ...NOTIFICATION_DATA_SYSTEM,
            ...NOTIFICATION_DATA_USER_RES,
            ...NOTIFICATION_DATA_USER_INFO
          };
          break;
        case NOTIFICATION_EVENT.RESET_PASSWORD:
          data = {
            ...NOTIFICATION_DATA_SYSTEM,
            ...NOTIFICATION_DATA_USER_RESET,
            ...NOTIFICATION_DATA_USER_INFO
          };
          break;
        case NOTIFICATION_EVENT.CHANGE_PASSWORD_ACCOUNT:
          data = {
            ...NOTIFICATION_DATA_SYSTEM,
            ...NOTIFICATION_DATA_USER_RES,
            ...NOTIFICATION_DATA_USER_INFO
          };
          break;
        case NOTIFICATION_EVENT.DELETE_ACCOUNT:
          data = {
            ...NOTIFICATION_DATA_SYSTEM,
            ...NOTIFICATION_DATA_USER_INFO
          };
          break;
        case NOTIFICATION_EVENT.ADD_TO_COURSE:
        case NOTIFICATION_EVENT.ADD_TO_INTAKE:
        case NOTIFICATION_EVENT.REMOVE_FROM_COURSE:
        case NOTIFICATION_EVENT.REMOVE_FROM_INTAKE:
        case NOTIFICATION_EVENT.COURSE_DELETED:
        case NOTIFICATION_EVENT.INTAKE_DELETED:
          data = {
            ...NOTIFICATION_DATA_SYSTEM,
            ...NOTIFICATION_DATA_USER_INFO,
            ...NOTIFICATION_DATA_COURSE
          };
          break;
        case NOTIFICATION_EVENT.ADD_TO_EVENT:
        case NOTIFICATION_EVENT.REMOVE_FROM_EVENT:
        case NOTIFICATION_EVENT.EVENT_STARTED:
        case NOTIFICATION_EVENT.EVENT_DELETED:
          data = {
            ...NOTIFICATION_DATA_SYSTEM,
            ...NOTIFICATION_DATA_USER_INFO,
            ...NOTIFICATION_DATA_COURSE,
            ...NOTIFICATION_DATA_EVENT,
          };
          break;
        case NOTIFICATION_EVENT.USER_COMPLETED_COURSE:
          data = {
            ...NOTIFICATION_DATA_SYSTEM,
            ...NOTIFICATION_DATA_USER_INFO,
            ...NOTIFICATION_DATA_COURSE,
          };
          break;
        case NOTIFICATION_EVENT.ADD_DISCUSSION:
          data = {
            ...NOTIFICATION_DATA_SYSTEM,
            ...NOTIFICATION_DATA_USER_INFO,
            ...NOTIFICATION_DATA_COURSE,
            ...NOTIFICATION_DATA_UNIT,
            ...NOTIFICATION_DATA_DISCUSSION,
          };
          break;
        case NOTIFICATION_EVENT.REPLY_DISCUSSION:
          data = {
            ...NOTIFICATION_DATA_SYSTEM,
            ...NOTIFICATION_DATA_USER_INFO,
            ...NOTIFICATION_DATA_COURSE,
            ...NOTIFICATION_DATA_UNIT,
            ...NOTIFICATION_DATA_DISCUSSION,
            ...NOTIFICATION_DATA_REPLY_DISCUSSION,
          };
          break;
        case NOTIFICATION_EVENT.REPLY_COMMENT_DISCUSSION:
          data = {
            ...NOTIFICATION_DATA_SYSTEM,
            ...NOTIFICATION_DATA_USER_INFO,
            ...NOTIFICATION_DATA_COURSE,
            ...NOTIFICATION_DATA_UNIT,
            ...NOTIFICATION_DATA_DISCUSSION,
            ...NOTIFICATION_DATA_REPLY_DISCUSSION,
            ...NOTIFICATION_DATA_REPLY_COMMENT_DISCUSSION,
          };
          break;
        case NOTIFICATION_EVENT.INSTRUCTOR_GRADING:
          data = {
            ...NOTIFICATION_DATA_SYSTEM,
            ...NOTIFICATION_DATA_USER_INFO,
            ...NOTIFICATION_DATA_COURSE,
            ...NOTIFICATION_DATA_UNIT,
            ...NOTIFICATION_DATA_COURSE_GRADING,
          };
          break;
        case NOTIFICATION_EVENT.USER_COMPLETED_TEST:
          data = {
            ...NOTIFICATION_DATA_SYSTEM,
            ...NOTIFICATION_DATA_USER_INFO,
            ...NOTIFICATION_DATA_COURSE,
            ...NOTIFICATION_DATA_UNIT,
            ...NOTIFICATION_DATA_TEST,
          };
          break;
        case NOTIFICATION_EVENT.USER_COMPLETED_ASSIGNMENT:
          data = {
            ...NOTIFICATION_DATA_SYSTEM,
            ...NOTIFICATION_DATA_USER_INFO,
            ...NOTIFICATION_DATA_COURSE,
            ...NOTIFICATION_DATA_UNIT,
            ...NOTIFICATION_DATA_ASSIGNMENT,
          };
          break;
        case NOTIFICATION_EVENT.USER_COMPLETED_SURVEY:
          data = {
            ...NOTIFICATION_DATA_SYSTEM,
            ...NOTIFICATION_DATA_USER_INFO,
            ...NOTIFICATION_DATA_COURSE,
            ...NOTIFICATION_DATA_UNIT,
            ...NOTIFICATION_DATA_SURVEY,
          };
          break;
        case NOTIFICATION_EVENT.USER_COMPLETED_SCORM:
          data = {
            ...NOTIFICATION_DATA_SYSTEM,
            ...NOTIFICATION_DATA_USER_INFO,
            ...NOTIFICATION_DATA_COURSE,
            ...NOTIFICATION_DATA_UNIT,
            ...NOTIFICATION_DATA_SCORM,
          };
          break;
        default:
          break;
      }
    }
    return res.json({
      success: true,
      payload: data,
    });
  } catch (error) {
    return next(error);
  }
}

export async function getNotificationEvent(req, res, next) {
  try {
    return res.json({
      success: true,
      payload: NOTIFICATION_EVENT,
    });
  } catch (error) {
    return next(error);
  }
}
export async function getNotificationUserType(req, res, next) {
  try {
    return res.json({
      success: true,
      payload: USER_ROLES_NOTIFICATION,
    });
  } catch (error) {
    return next(error);
  }
}
export async function getNotificationLogStatus(req, res, next) {
  try {
    return res.json({
      success: true,
      payload: NOTIFICATION_LOG_STATUS,
    });
  } catch (error) {
    return next(error);
  }
}

export async function getNotificationLog(req, res, next) {
  try {
    return res.json({
      success: true,
      payload: await NotificationService.getNotificationLog(req.params.id),
    });
  } catch (error) {
    return next(error);
  }
}

export async function getNotification(req, res, next) {
  try {
    const notification = await NotificationService.getNotification(req.params.id);
    return res.json({
      success: true,
      payload: notification,
    });
  } catch (error) {
    return next(error);
  }
}

export async function deleteNotification(req, res, next) {
  try {
    const {
      id,
    } = req.params;
    await checkUserTypeIsAdmin(req.auth?.type);
    await NotificationService.deleteNotification(id, req.auth);
    return res.json({
      success: true,
    });
  } catch (error) {
    return next(error);
  }
}

export async function updateNotification(req, res, next) {
  try {
    await checkUserTypeIsAdmin(req.auth?.type);
    const notification = await NotificationService.updateNotification(req.params.id, req.body, req.auth);
    return res.json({
      success: true,
      payload: notification,
    });
  } catch (error) {
    return next(error);
  }
}

export async function cleanNotificationLog(req, res, next) {
  try {
    await checkUserTypeIsAdmin(req.auth?.type);
    const notification = await NotificationService.cleanNotificationLog();
    return res.json({
      success: true,
      payload: notification?.deletedCount,
    });
  } catch (error) {
    return next(error);
  }
}

export async function getListEmailHistory(req, res, next) {
  try {
      const {
          textSearch,
          status,
          order,
          orderBy,
          rowPerPage,
          page
      } = req.query;
      const histories = await NotificationService.getListEmailHistoryService({
          textSearch,
          status,
          order,
          orderBy,
          rowPerPage,
          page
      });
      return res.json({
          success: true,
          payload: histories,
      });
  } catch (error) {
    return next(error);
  }
}

export async function resendEmailHistory(req, res) {
  try {
    await checkUserTypeIsAdmin(req.auth?.type);
      const { id } = req.params;
      const result = await NotificationService.resendEmailHistoryService(id);
      return res.json({
          success: true,
          payload: result
      });
  } catch (error) {
      return res.json({
          success: false,
          payload: false
      });
  }
}

