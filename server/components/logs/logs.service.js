import Logs from './logs.model';
import logger from '../../util/logger';
import moment from 'moment';

import {
  COURSE_STATUS,
  DEFAULT_PAGE_LIMIT, DISCUSSION_STATUS,
  EVENT_LOGS,
  EVENT_LOGS_TYPE,
  GROUP_STATUS,
  MAX_PAGE_LIMIT,
  NOTIFICATION_STATUS,
  SESSION_USER_STATUS,
  UNIT_STATUS,
  USER_EVENT_STATUS,
  USER_GROUP_STATUS,
  USER_STATUS,
} from '../../constants';
import APIError from '../../util/APIError';
import { getUser } from '../user/user.service';
import User from '../user/user.model';
import Course from '../course/course.model';
import Notification from '../notification/notificaition.model';
import Event from '../userEvent/userEvent.model';
import Unit from '../unit/unit.model';
import CourseGroup from '../courseGroup/courseGroup.model';
import { getCourseById } from '../course/course.service';
import UserSession from '../sessionUser/sessionUser.model';
import { getGroupByConditions } from '../courseGroup/courseGroup.service';
import UserGroup from '../courseGroup/userCourseGroup.model';
import Discussion from '../discussion/discussion.model';
import { getUserEvent } from '../sessionUser/sessionUser.service';
import { getNotification } from '../notification/notificaition.service';
import { getDiscussionByConditions } from '../discussion/discussion.service';
import { getUnitById } from '../unit/unit.service';
/**
 * Create new log
 * @param params
 * @param params.name
 * @param params.parent
 * @returns {Promise.<boolean>}
 */
export async function createLogs(params) {
  try {
    const log = await Logs.create(params);
    return log;
  } catch (error) {
    logger.error('LogsService createLogs error:', error);
    throw error;
  }
}

/**
 * undoEvent logs
 * @returns {Promise.<boolean>}
 */
export async function undoEvent(query = '', auth = {}) {
  try {
    const log = await getLogByConditions({
      _id: query?.id
    });
    if (!log) {
      return Promise.reject(new APIError(404, [
        {
          msg: 'Log not found.',
          param: 'logNotFound',
        },
      ]));
    }
    switch (log.event) {
      case EVENT_LOGS.USER_DELETION:
        return await undoUserDeletionEvent(log, auth);
      case EVENT_LOGS.COURSE_DELETION:
        return await undoCourseDeletionEvent(log, auth, EVENT_LOGS.COURSE_DELETION);
      case EVENT_LOGS.INTAKE_DELETION:
        return await undoCourseDeletionEvent(log, auth, EVENT_LOGS.INTAKE_DELETION);
      case EVENT_LOGS.GROUP_USER_DELETION:
        return await undoGroupUserDeletionEvent(log, auth);
      case EVENT_LOGS.EVENT_DELETION:
        return await undoEventDeletionEvent(log, auth);
      case EVENT_LOGS.DISCUSSION_DELETION:
        return await undoDiscussionDeletionEvent(log, auth);
      case EVENT_LOGS.NOTIFICATION_DELETION:
        return await undoNotificationDeletionEvent(log, auth);
      case EVENT_LOGS.UNIT_DELETION:
        return await undoUnitDeletionEvent(log, auth);
      default:
        return ;
    }
  } catch (error) {
    logger.error('LogsService undoEvent error:', error);
    throw error;
  }
}

/**
 * undoEvent logs
 * @returns {Promise.<boolean>}
 */
export async function getLogByConditions(conditions) {
  try {
    return await Logs.findOne(conditions);
  } catch (error) {
    logger.error('LogsService getLogByConditions error:', error);
    throw error;
  }
}

/**
 * undoEvent logs
 * @returns {Promise.<boolean>}
 */
export async function undoUserDeletionEvent(log, auth) {
  try {
    if (log?.data?.user) {
      const user = await getUser(log?.data?.user);
      switch (user?.status) {
        case USER_STATUS.DELETED:
          await Promise.all([
            User.updateOne({
              _id: user._id
            }, { $set: {
                status: USER_STATUS.ACTIVE
              } }),
            createLogs({
              event: EVENT_LOGS.UNDELETE_USER,
              type: EVENT_LOGS_TYPE.UNDELETE,
              user: auth?._id,
              data: { user: user._id }
            }),
            Logs.updateOne({ _id: log._id },
                { $set: { unDelete: true } })
          ]);
          return;
        case USER_STATUS.PERMANENTLY_DELETED:
          await Promise.all([
            User.updateOne({ _id: user._id }, {
              $set: {
                status: USER_STATUS.ACTIVE,
                email: user.oldEmail,
                username: user.oldUsername,
              },
              $unset: {
                oldEmail: 1,
                oldUsername: 1,
              }
            }),
            createLogs({
              event: EVENT_LOGS.UNDELETE_USER,
              type: EVENT_LOGS_TYPE.UNDELETE,
              user: auth?._id,
              data: { user: user._id }
            }),
            Logs.updateOne({ _id: log._id },
                { $set: { unDelete: true } })
          ]);
          return;
        default:
          return;
      }
    }
  } catch (error) {
    logger.error('LogsService undoUserDeletionEvent error:', error);
    throw error;
  }
}

/**
 * undoEvent logs
 * @returns {Promise.<boolean>}
 */
export async function undoGroupUserDeletionEvent(log, auth) {
  try {
    if (log?.data?.group) {
      const group = await getGroupByConditions({
        _id: log?.data?.group
      });
      if (group?.status === GROUP_STATUS.DELETED) {
        await Promise.all([
          CourseGroup.updateOne({ _id: group?._id },
              { $set: { status: GROUP_STATUS.ACTIVE } }),
          UserGroup.updateMany({ group: group?._id, status: USER_GROUP_STATUS.GROUPDELETED },
              { $set: { status: USER_GROUP_STATUS.ACTIVE } }),
          createLogs({
            event: EVENT_LOGS.GROUP_USER_UNDELETE,
            type: EVENT_LOGS_TYPE.UNDELETE,
            user: auth?._id,
            data: { group: group?._id }
          }),
          Logs.updateOne({ _id: log._id },
              { $set: { unDelete: true } })
        ]);
      }
    }
  } catch (error) {
    logger.error('LogsService undoGroupUserDeletionEvent error:', error);
    throw error;
  }
}

/**
 * undoEvent logs
 * @returns {Promise.<boolean>}
 */
export async function undoCourseDeletionEvent(log, auth, event) {
  try {
    if (log?.data?.course) {
      const course = await getCourseById(log?.data?.course);
      if (course?.status === COURSE_STATUS.DELETED) {
        const promises = await Promise.all([
          Course.updateOne({
            _id: course?._id }, { $set: {
            status: COURSE_STATUS.ACTIVE,
              code: course?.oldCode
            } }, {
            $unset: {
              oldCode: 1
            }
          }),
          Unit.distinct('_id',{
            course: course?._id,
            status: UNIT_STATUS.COURSEDELETED
          }),
          createLogs({
            event: event === EVENT_LOGS.UNDELETE_COURSE ? EVENT_LOGS.UNDELETE_COURSE : EVENT_LOGS.UNDELETE_INTAKE,
            type: EVENT_LOGS_TYPE.UNDELETE,
            user: auth?._id,
            data: { course: course?._id }
          }),
          Logs.updateOne({ _id: log._id },
              { $set: { unDelete: true } })
        ]);
        const units = promises[1];
        const promise = [
          Unit.updateMany({
            course: course?._id,
            status: UNIT_STATUS.COURSEDELETED
          }, { $set: {
              status: UNIT_STATUS.ACTIVE
          } } )
        ];
        if (units?.length) {
          promise.push(
            UserSession.updateMany({
              unit: { $in: units }
            }, { $set: {
              status: SESSION_USER_STATUS.ACTIVE
            } } )
          );
          promise.push(
            Event.updateMany({
              unit: { $in: units }
            }, { $set: {
              status: USER_EVENT_STATUS.ACTIVE
            } } )
          );
        }
        await Promise.all(promise);
      }
    }
  } catch (error) {
    logger.error('LogsService undoCourseDeletionEvent error:', error);
    throw error;
  }
}

/**
 * undoEvent logs
 * @returns {Promise.<boolean>}
 */
export async function undoEventDeletionEvent(log, auth) {
  try {
    if (log?.data?.event) {
      const event = await getUserEvent({
        _id: log?.data?.event
      });
      if (event?.status === USER_EVENT_STATUS.DELETED) {
        await Promise.all([
          Event.updateOne({
            _id: event?._id
          }, { $set: { status: USER_EVENT_STATUS.ACTIVE } }),
          UserSession.updateMany({ group: event?._id, status: SESSION_USER_STATUS.EVENTDELETED },
              { $set: { status: SESSION_USER_STATUS.ACTIVE } }),
          createLogs({
            event: EVENT_LOGS.EVENT_UNDELETE,
            type: EVENT_LOGS_TYPE.UNDELETE,
            user: auth?._id,
            data: { event: event._id }
          }),
          Logs.updateOne({ _id: log._id },
              { $set: { unDelete: true } })
        ]);
      }
    }
  } catch (error) {
    logger.error('LogsService undoEventDeletionEvent error:', error);
    throw error;
  }
}

/**
 * undoEvent logs
 * @returns {Promise.<boolean>}
 */
export async function undoUnitDeletionEvent(log, auth) {
  try {
    if (log?.data?.unit) {
      const unit = await getUnitById({
        _id: log?.data?.unit
      });
      if (unit?.status === UNIT_STATUS.DELETED) {
        await Promise.all([
          Unit.updateOne({
            _id: unit?._id
          }, { $set: { status: USER_EVENT_STATUS.ACTIVE } }),
          Event.updateMany({ unit: unit?._id, status: USER_EVENT_STATUS.UNITDELETED },
              { $set: { status: USER_EVENT_STATUS.ACTIVE } }),
          UserSession.updateMany({
            unit: unit?._id,
            status: SESSION_USER_STATUS.UNITDELETED
          }, { $set: {
              status: SESSION_USER_STATUS.ACTIVE
            } }),
          createLogs({
            event: EVENT_LOGS.UNDELETE_UNIT,
            type: EVENT_LOGS_TYPE.UNDELETE,
            user: auth?._id,
            data: {
              unit: unit?._id,
              course: unit?.course
            }
          }),
          Logs.updateOne({ _id: log._id },
              { $set: { unDelete: true } })
        ]);
      }
    }
  } catch (error) {
    logger.error('LogsService undoEventDeletionEvent error:', error);
    throw error;
  }
}

/**
 * undoEvent logs
 * @returns {Promise.<boolean>}
 */
export async function undoNotificationDeletionEvent(log, auth) {
  try {
    if (log?.data?.notification) {
      const notification = await getNotification(log?.data?.notification);
      if (notification?.status === NOTIFICATION_STATUS.DELETED) {
        await Promise.all([
          Notification.updateOne({
            _id: notification?._id
          }, { $set: { status: NOTIFICATION_STATUS.ACTIVE } }),
          createLogs({
            event: EVENT_LOGS.NOTIFICATION_UNDELETE,
            type: EVENT_LOGS_TYPE.UNDELETE,
            user: auth?._id,
            data: { notification: notification._id }
          }),
          Logs.updateOne({ _id: log._id },
              { $set: { unDelete: true } })
        ]);
      }
    }
  } catch (error) {
    logger.error('LogsService undoNotificationDeletionEvent error:', error);
    throw error;
  }
}
/**
 * undoEvent logs
 * @returns {Promise.<boolean>}
 */
export async function undoDiscussionDeletionEvent(log, auth) {
  try {
    if (log?.data?.discussion) {
      const discussion = await getDiscussionByConditions({ _id: log?.data?.discussion });
      if (discussion?.status === DISCUSSION_STATUS.DELETED) {
        await Promise.all([
          Discussion.updateOne({
            _id: discussion?._id
          }, { $set: { status: DISCUSSION_STATUS.ACTIVE } }),
          createLogs({
            event: EVENT_LOGS.NOTIFICATION_UNDELETE,
            type: EVENT_LOGS_TYPE.UNDELETE,
            user: auth?._id,
            data: { discussion: discussion._id }
          }),
          Logs.updateOne({ _id: log._id },
              { $set: { unDelete: true } })
        ]);
      }
    }
  } catch (error) {
    logger.error('LogsService undoDiscussionDeletionEvent error:', error);
    throw error;
  }
}

/**
 * Get logs
 * @returns {Promise.<boolean>}
 */
export async function getLogs(query = '', auth = {}) {
  try {
    const {
      rowPerPage,
      intake,
      course,
      event,
      user,
      from,
      type,
      to
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
    const sortCondition = { _id: -1 };
    const queryConditions = {
    };
    if (event) {
      queryConditions.event = event;
    }
    if (type) {
      queryConditions.type = type;
    }
    if (user) {
      queryConditions.user = user;
    }
    if (course) {
      queryConditions['data.course'] = course;
    }
    if (intake) {
      queryConditions['data.course'] = intake;
    }
    if (from && to) {
      queryConditions.createdAt = { $gte: new Date(from), $lte: new Date(to) };
    } else if (from) {
      queryConditions.createdAt = { $gte: new Date(from) };
    } else if (to) {
      queryConditions.createdAt = { $lte: new Date(to) };
    }
    const totalItems = await Logs.countDocuments(queryConditions);
    let data = await Logs.find(queryConditions).sort(sortCondition).skip(skip).limit(pageLimit)
        .populate([
          {
            path: 'user',
            select: '_id fullName email oldEmail'
          },
          {
            path: 'data.user',
            select: '_id fullName email oldEmail'
          },
          {
            path: 'data.course',
            select: '_id name code oldCode',
          },
          {
            path: 'data.group',
            select: '_id name',
          },
          {
            path: 'data.unit',
            select: '_id title',
          },
          {
            path: 'data.notification',
            select: '_id name',
          },
          {
            path: 'data.event',
            select: '_id name',
          },
          {
            path: 'data.discussion',
            select: '_id name',
          },
          {
            path: 'data.file',
            select: '_id title',
          },
        ]).lean();
    if (data?.length) {
      data = data.map( item => {
        const result = getDescriptionLog(item, auth);
        return {
          _id: item._id,
          type: item.type,
          unDelete: item.unDelete,
          ...result
        };
      });
    }
    return {
      data: data,
      currentPage: page,
      totalPage: Math.ceil(totalItems / pageLimit),
      totalItems: totalItems,
    };
  } catch (error) {
    logger.error('LogsService getLogs error:', error);
    throw error;
  }
}
export function getDescriptionLog(log, auth) {
  try {
    const sender = log?.user?._id?.toString() === auth?._id?.toString()
        ? '<strong>You</strong>'
        : `<strong>${log?.user?.fullName}</strong>`;
    const time = `<span>${moment(log.updatedAt).fromNow()}</span>`;
    switch (log.event) {
      case EVENT_LOGS.USER_LOGIN:
        return {
          description: `${sender} signed in - ${time}`
        };
      case EVENT_LOGS.USER_REGISTER:
        return {
          description: `${sender} created the user <strong>${log?.data?.user?.fullName}</strong> - ${time}`
        };
      case EVENT_LOGS.USER_DELETION:
        return {
          description: `${sender} deleted the user <strong>${log?.data?.user?.fullName}</strong> - ${time}`,
          action: ['UNDO']
        };
      case EVENT_LOGS.UNDELETE_USER:
        return {
          description: `${sender} undeleted the user <strong>${log?.data?.user?.fullName}</strong> - ${time}`
        };
      case EVENT_LOGS.USER_UPDATE:
        return {
          description: log?.user?._id?.toString() === auth?._id?.toString()
              ? `${sender} updated the user profile <strong>${log?.data?.user?.fullName}</strong> - ${time}`
              : `${sender} updated the user profile - ${time}`
        };
      case EVENT_LOGS.COURSE_CREATION:
        return {
          description: `${sender} created the course <strong>${log?.data?.course?.name}</strong> <span>(${log?.data?.course?.code || log?.data?.course?.oldCode })<span> - ${time}`
        };
      case EVENT_LOGS.COURSE_DELETION:
        return {
          description: `${sender} deleted the course <strong>${log?.data?.course?.name}</strong> <span>(${log?.data?.course?.code || log?.data?.course?.oldCode})<span> - ${time}`,
          action: ['UNDO']
        };
      case EVENT_LOGS.UNDELETE_COURSE:
        return {
          description: `${sender} undeleted the course <strong>${log?.data?.course?.name}</strong> <span>(${log?.data?.course?.code || log?.data?.course?.oldCode})<span> - ${time}`
        };
      case EVENT_LOGS.COURSE_UPDATE:
        return {
          description: `${sender} updated the course <strong>${log?.data?.course?.name}</strong> <span>(${log?.data?.course?.code || log?.data?.course?.oldCode})<span> - ${time}`
        };
      case EVENT_LOGS.INTAKE_CREATION:
        return {
          description: `${sender} created the intake <strong>${log?.data?.course?.name}</strong> <span>(${log?.data?.course?.code || log?.data?.course?.oldCode})<span> - ${time}`
        };
      case EVENT_LOGS.INTAKE_DELETION:
        return {
          description: `${sender} deleted the intake <strong>${log?.data?.course?.name}</strong> <span>(${log?.data?.course?.code || log?.data?.course?.oldCode})<span> - ${time}`,
          action: ['UNDO']
        };
      case EVENT_LOGS.UNDELETE_INTAKE:
        return {
          description: `${sender} undeleted the intake <strong>${log?.data?.course?.name}</strong> <span>(${log?.data?.course?.code || log?.data?.course?.oldCode})<span> - ${time}`
        };
      case EVENT_LOGS.INTAKE_UPDATE:
        return {
          description: `${sender} updated the intake <strong>${log?.data?.course?.name}</strong> <span>(${log?.data?.course?.code || log?.data?.course?.oldCode})<span> - ${time}`
        };
      case EVENT_LOGS.UNIT_CREATION:
        return {
          description: `${sender} created the unit <strong>${log?.data?.unit?.title}</strong> of the course <strong>${log?.data?.course?.name}</strong> <span>(${log?.data?.course?.code || log?.data?.course?.oldCode})<span> - ${time}`
        };
      case EVENT_LOGS.UNIT_DELETION:
        return {
          description: `${sender} deleted the unit <strong>${log?.data?.unit?.title}</strong> of the course <strong>${log?.data?.course?.name}</strong> <span>(${log?.data?.course?.code || log?.data?.course?.oldCode})<span> - ${time}`,
          action: ['UNDO']
        };
      case EVENT_LOGS.UNDELETE_UNIT:
        return {
          description: `${sender} undeleted the unit <strong>${log?.data?.unit?.title}</strong> of the course <strong>${log?.data?.course?.name}</strong> <span>(${log?.data?.course?.code || log?.data?.course?.oldCode})<span> - ${time}`
        };
      case EVENT_LOGS.UNIT_UPDATE:
        return {
          description: `${sender} updated the unit <strong>${log?.data?.unit?.title}</strong> of the course <strong>${log?.data?.course?.name}</strong> <span>(${log?.data?.course?.code || log?.data?.course?.oldCode})<span> - ${time}`
        };
      case EVENT_LOGS.GROUP_USER_CREATION:
        return {
          description: `${sender} created the user group <strong>${log?.data?.group?.name}</strong> - ${time}`
        };
      case EVENT_LOGS.GROUP_USER_DELETION:
        return {
          description: `${sender} deleted the user group <strong>${log?.data?.group?.name}</strong> - ${time}`,
          action: ['UNDO']
        };
      case EVENT_LOGS.GROUP_USER_UNDELETE:
        return {
          description: `${sender} undeleted the user group <strong>${log?.data?.group?.name}</strong> - ${time}`,
        };
      case EVENT_LOGS.GROUP_USER_UPDATE:
        return {
          description: `${sender} updated the user group <strong>${log?.data?.group?.name}</strong> - ${time}`
        };
      case EVENT_LOGS.ADD_USER_TO_GROUP:
        return {
          description: `${sender} were added the user <strong>${log?.data?.user?.fullName}</strong> to group <strong>${log?.data?.group?.name}</strong> - ${time}`
        };
      case EVENT_LOGS.REMOVE_USER_FROM_GROUP:
        return {
          description: `${sender} were removed the user <strong>${log?.data?.user?.fullName}</strong> from group <strong>${log?.data?.group?.name}</strong> - ${time}`
        };
      case EVENT_LOGS.EVENT_CREATION:
        return {
          description: `${sender} created the event <strong>${log?.data?.event?.name || ''}</strong> - ${time}`
        };
      case EVENT_LOGS.EVENT_DELETION:
        return {
          description: `${sender} deleted the event <strong>${log?.data?.event?.name || ''}</strong> - ${time}`,
          action: ['UNDO']
        };
      case EVENT_LOGS.EVENT_UNDELETE:
        return {
          description: `${sender} undeleted the event <strong>${log?.data?.event?.name || ''}</strong> - ${time}`
        };
      case EVENT_LOGS.EVENT_UPDATE:
        return {
          description: `${sender} updated the event <strong>${log?.data?.event?.name || ''}</strong> - ${time}`
        };
      case EVENT_LOGS.DISCUSSION_CREATION:
        return {
          description: `${sender} created the discussion <strong>${log?.data?.discussion?.name || ''}</strong> - ${time}`
        };
      case EVENT_LOGS.DISCUSSION_DELETION:
        return {
          description: `${sender} deleted the discussion <strong>${log?.data?.discussion?.name || ''}</strong> - ${time}`,
          action: ['UNDO']
        };
      case EVENT_LOGS.DISCUSSION_UPDATE:
        return {
          description: `${sender} updated the discussion <strong>${log?.data?.discussion?.name || ''}</strong> - ${time}`
        };
      case EVENT_LOGS.DISCUSSION_UNDELETE:
        return {
          description: `${sender} undeleted the discussion <strong>${log?.data?.discussion?.name || ''}</strong> - ${time}`
        };
      case EVENT_LOGS.ADD_USER_TO_EVENT:
        return {
          description: `${sender} were added the user <strong>${log?.data?.user?.fullName}</strong> to event <strong>${log?.data?.event?.name || ''}</strong> - ${time}`
        };
      case EVENT_LOGS.REMOVE_USER_FROM_EVENT:
        return {
          description: `${sender} were removed the user <strong>${log?.data?.user?.fullName}</strong> to event <strong>${log?.data?.event?.name || ''}</strong> - ${time}`
        };
      case EVENT_LOGS.STARTED_EVENT:
        return {
          description: `${sender} started the event <strong>${log?.data?.event?.name || ''}</strong> - ${time}`
        };
      case EVENT_LOGS.ENDED_EVENT:
        return {
          description: `${sender} ended the event <strong>${log?.data?.event?.name || ''}</strong> - ${time}`
        };
      case EVENT_LOGS.ADD_USER_TO_INTAKE:
        return {
          description: `${sender} were added the user <strong>${log?.data?.user?.fullName}</strong> to intake <strong>${log?.data?.course?.name || ''}</strong> <span>(${log?.data?.course?.code || log?.data?.course?.oldCode})<span> - ${time}`
        };
      case EVENT_LOGS.REMOVE_USER_FROM_INTAKE:
        return {
          description: `${sender} were removed the user <strong>${log?.data?.user?.fullName}</strong> to intake <strong>${log?.data?.course?.name || ''}</strong> <span>(${log?.data?.course?.code || log?.data?.course?.oldCode})<span> - ${time}`
        };
      case EVENT_LOGS.USER_COMPLETED_INTAKE:
        return {
          description: `${sender} completed the intake <strong>${log?.data?.course?.name}</strong> <span>(${log?.data?.course?.code || log?.data?.course?.oldCode})<span> - ${time}`
        };
      case EVENT_LOGS.USER_NOT_PASS_INTAKE:
        return {
          description: `${sender} not pass the intake <strong>${log?.data?.course?.name}</strong> <span>(${log?.data?.course?.code || log?.data?.course?.oldCode})<span> - ${time}`
        };
      case EVENT_LOGS.USER_TEST_COMPLETED:
        return {
          description: `${sender} completed the test <strong>${log?.data?.unit?.title}</strong> - ${time}`
        };
      case EVENT_LOGS.USER_TEST_FAILED:
        return {
          description: `${sender} failed the test <strong>${log?.data?.unit?.title}</strong> - ${time}`
        };
      case EVENT_LOGS.USER_TEST_RESET:
        return {
          description: `${sender} reset the test <strong>${log?.data?.unit?.title}</strong> - ${time}`
        };
      case EVENT_LOGS.USER_SURVEY_COMPLETED:
        return {
          description: `${sender} completed the survey <strong>${log?.data?.unit?.title}</strong> - ${time}`
        };
      case EVENT_LOGS.USER_ASSIGNMENT_SUBMISSION:
        return {
          description: `${sender} submission the assignment <strong>${log?.data?.unit?.title}</strong> - ${time}`
        };
      case EVENT_LOGS.USER_ASSIGNMENT_GRADED:
        return {
          description: `${sender} graded the assignment <strong>${log?.data?.unit?.title}</strong> - ${time}`
        };
      case EVENT_LOGS.USER_ASSIGNMENT_RESET:
        return {
          description: `${sender} reset the assignment <strong>${log?.data?.unit?.title}</strong> - ${time}`
        };
      case EVENT_LOGS.USER_ASSIGNMENT_RESUBMIT:
        return {
          description: `${sender} resubmit the assignment <strong>${log?.data?.unit?.title}</strong> for the user <strong>${log?.data?.user?.fullName}</strong> - ${time}`
        };
      case EVENT_LOGS.USER_SCORM_COMPLETED:
        return {
          description: `${sender} completed the scorm <strong>${log?.data?.unit?.title}</strong> - ${time}`
        };
      case EVENT_LOGS.USER_SCORM_RESET:
        return {
          description: `${sender} reset the survey <strong>${log?.data?.unit?.title}</strong> - ${time}`
        };
      case EVENT_LOGS.NOTIFICATION_CREATION:
        return {
          description: `${sender} created the notification <strong>${log?.data?.notification?.name}</strong> - ${time}`
        };
      case EVENT_LOGS.NOTIFICATION_DELETION:
        return {
          description: `${sender} deleted the notification <strong>${log?.data?.notification?.name}</strong> - ${time}`,
          action: ['UNDO']
        };
      case EVENT_LOGS.NOTIFICATION_UNDELETE:
        return {
          description: `${sender} undeleted the notification <strong>${log?.data?.notification?.name}</strong> - ${time}`
        };
      case EVENT_LOGS.NOTIFICATION_UPDATE:
        return {
          description: `${sender} updated the notification <strong>${log?.data?.notification?.name}</strong> - ${time}`
        };
      case EVENT_LOGS.USER_DOWNLOAD:
        return {
          description: `${sender} download the file <strong>${log?.data?.file?.title}</strong> - ${time}`
        };
      case EVENT_LOGS.IMPORT_DATA:
        return {
          description: `${sender} imported data - ${time}`
        };
      case EVENT_LOGS.EXPORT_DATA:
        return {
          description: `${sender} exported data - ${time}`
        };
      default:
        return;
    }
  } catch (err) {
    logger.error('LogsService getDescriptionLog error:', err);
    throw err;
  }
}


export async function cleanLogs() {
  try {
    return await Logs.deleteMany({});
  } catch (error) {
    logger.error('LogsService cleanLogs error:', error);
    throw error;
  }
}
