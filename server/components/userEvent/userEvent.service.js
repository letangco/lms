import logger from '../../util/logger';
import UserEvent from './userEvent.model';
import User from '../user/user.model';
import APIError from '../../util/APIError';
import {
  COURSE_USER_STATUS,
  NOTIFICATION_EVENT,
  USER_EVENT_PRIVACY,
  USER_EVENT_STATUS,
  USER_EVENT_TYPE,
  USER_ROLES,
  USER_EVENT,
  USER_STATUS,
  LIVESTREAM_TYPE,
  ROOM_STATUS,
  USER_ROOM_STATUS,
  MAX_PAGE_LIMIT,
  UNIT_STATUS,
  REDIS_KEYS,
  REDIS_TIME,
  DEFAULT_PAGE_LIMIT,
  USER_ZOOM_STATUS_LIVE, COURSE_STATUS, SESSION_USER_STATUS, EVENT_LOGS, EVENT_LOGS_TYPE, USER_TYPE_STATUS,
} from '../../constants';
import {
  createScheduleRoom,
  getMeetingsRoom,
  getMeetingRoom,
  getScheduleEvent,
  getZoomReport,
  getParticipantZoomReport,
  zoomDetail,
  getMeetingZoomByConditions,
  getZoomReportByConditions,
  getTotalUsersZoomByConditions, getZoomByConditions
} from '../zoom/zoom.service';
import { getAllZoom } from '../zoom/zoomConfig.service';
import * as SessionUserService from '../sessionUser/sessionUser.service';
import { getUserByEmail } from '../user/user.service';
import {getCourseUserRole, getUserCourseByConditions} from '../courseUser/courseUser.service';
import CourseUser from '../courseUser/courseUser.model';
import Unit from '../unit/unit.model';
import SessionUser from '../sessionUser/sessionUser.model';
import { formatNotification, getNotificationByKey } from '../notification/notificaition.service';
import { getUnitByConditions, getUnitById } from '../unit/unit.service';
import { getCourseById, getCourseInfoByConditions } from '../course/course.service';
import * as UserService from '../user/user.service';
import { checkUserTypeByConditions, getUserType, getUserTypeByConditions } from '../userType/userType.service';
import { getObjectId, validSearchString } from '../../helpers/string.helper';
import { getRedisInfo, setRedisInfo, setRedisExpire } from '../../helpers/redis';
import { getSessionUsersByConditions, getTotalSessionUserByConditions } from '../sessionUser/sessionUser.service';
import { createLogs } from '../logs/logs.service';

/**
 * Create user event
 * @param {object} creator
 * @param {objectId} creator._id
 * @param {string} creator.fullName
 * @param {string} creator.email
 * @param {object} params
 * @param {string} params.name
 * @param {object} params.time
 * @param {string} params.time.begin
 * @param {string} params.time.end
 * @param {string} params.timezone
 * @param {string} params.location
 * @param {string} params.description
 * @param {number} params.duration
 * @param {object} params.settings
 * @param {string} params.settings.accessCode
 * @param {boolean} params.settings.muteOnStart
 * @param {boolean} params.settings.requireModeratorApprove
 * @param {boolean} params.settings.anyUserCanStart
 * @param {boolean} params.settings.anyUserCanJoinAsModerator
 * @param {ObjectId} params.instructor
 * @param {ObjectId[]} params.groups
 * @param {ObjectId[]} params.courses
 * @param {String} params.privacy
 * @param {ObjectId} params.unit
 * @param {ObjectId} params.type
 * @returns {Promise<*>}
 */
export async function createUserEvent(creator, params) {
  try {
    const {
      name,
      time,
      timezone,
      location,
      description,
      duration,
      settings,
      instructor,
      groups,
      courses,
      privacy,
      unit,
      type,
      optionUser
    } = params;
    const createdUserEvent = await UserEvent.create({
      creator: creator._id,
      name: name,
      time: time,
      timezone: timezone,
      location: location,
      description: description,
      duration: duration,
      settings: settings,
      instructor: instructor,
      groups: groups,
      courses: courses,
      privacy: privacy,
      unit: unit,
      type: type,
      optionUser: optionUser,
      status: USER_EVENT_STATUS.ACTIVE,
    });
    switch (optionUser) {
      case USER_EVENT.ALL:
        await addAllUserCourseToEvent(createdUserEvent);
        break;
      case USER_EVENT.CUSTOM:
        await addUserCourseToEvent(createdUserEvent, params.users);
        break;
      default:
        break;
    }
    createLogs({
      event: EVENT_LOGS.EVENT_CREATION,
      type: EVENT_LOGS_TYPE.CREATE,
      user: creator?._id,
      data: {
        event: createdUserEvent._id
      }
    });
    return await UserEvent.populate(createdUserEvent, [{
      path: 'instructor',
      select: 'fullName avatar',
    }]);
  } catch (error) {
    throw error;
  }
}

export async function addAllUserCourseToEvent(event) {
  try {
    const unit = await Unit.findById(event.unit).lean();
    if (!unit) {
      return;
    }
    const users = await CourseUser.find({
      course: unit.course,
      userRole: USER_ROLES.LEARNER,
      status: { $in: [COURSE_USER_STATUS.ACTIVE, COURSE_USER_STATUS.IN_PROGRESS, COURSE_USER_STATUS.COMPLETED] }
    }).lean();
    const notifications = await getNotificationByKey(NOTIFICATION_EVENT.ADD_TO_EVENT);
    if (users?.length && JSON.stringify(notifications) !== '{}') {
      await Promise.all(users.map(async user => {
        const userInfo = await User.findOne( {
          _id: user.user,
          status: { $in: [ USER_STATUS.ACTIVE, USER_STATUS.INACTIVE ] }
        });
        if (!userInfo) { return }
        const sessionUser = await SessionUser.updateOne({
          session: event._id,
          unit: event.unit,
          user: user.user
        }, { $set: {
          creator: event.creator,
          session: event._id,
          unit: event.unit,
          user: user.user
        } } );
        if (sessionUser.nModified) {
          return;
        }
        await SessionUser.create({
          creator: event.creator,
          session: event._id,
          unit: event.unit,
          user: user.user
        });
        createLogs({
          event: EVENT_LOGS.ADD_USER_TO_EVENT,
          type: EVENT_LOGS_TYPE.ADD,
          user: event.creator,
          data: {
            event: event._id,
            user: user.user
          }
        });
        if (!userInfo) {
          return;
        }
        const unitInfo = await getUnitById(event.unit);
        const courseInfo = unitInfo ? await getCourseById(unitInfo.course) : {};
        const type = await getUserType(userInfo.type);
        const notification = notifications[type?.systemRole] || notifications.ALL;
        if (notification) {
          await formatNotification(notification, {
            userInfo: {
              firstName: userInfo.firstName,
              lastName: userInfo.lastName,
              fullName: userInfo.fullName,
              email: userInfo.email,
            },
            courseInfo,
            unitInfo,
            eventInfo: event,
            email: userInfo.email
          });
        }
      }));
    }
    return;
  } catch (error) {
    logger.error('UserEventService addAllUserCourseToEvent, error:');
    logger.error(error);
    throw error;
  }
}

export async function addUserCourseToEvent(event, users) {
  try {
    const unit = await Unit.findById(event.unit).lean();
    if (!unit) {
      return;
    }
    const notifications = await getNotificationByKey(NOTIFICATION_EVENT.ADD_TO_EVENT);
    if (users?.length && JSON.stringify(notifications) !== '{}') {
      await Promise.all(users.map(async user => {
        const sessionUser = await SessionUser.updateOne({
          session: event._id,
          unit: event.unit,
          user: user
        }, { $set: {
            creator: event.creator,
            session: event._id,
            unit: event.unit,
            user: user
          } } );
        if (sessionUser.nModified) {
          return;
        }
        await SessionUser.create({
          creator: event.creator,
          session: event._id,
          unit: event.unit,
          user: user
        });
        createLogs({
          event: EVENT_LOGS.ADD_USER_TO_EVENT,
          type: EVENT_LOGS_TYPE.ADD,
          user: event.creator,
          data: {
            event: event._id,
            user: user
          }
        });
        const userInfo = await UserService.getUser(user);
        if (!userInfo) {
          return;
        }
        const unitInfo = await getUnitById(event.unit);
        const courseInfo = unitInfo ? await getCourseById(unitInfo.course) : {};
        const type = await getUserType(userInfo.type);
        const notification = notifications[type?.systemRole] || notifications.ALL;
        if (notification) {
          await formatNotification(notification, {
            userInfo: {
              firstName: userInfo.firstName,
              lastName: userInfo.lastName,
              fullName: userInfo.fullName,
              email: userInfo.email,
            },
            courseInfo,
            unitInfo,
            eventInfo: event,
            email: userInfo.email
          });
        }
      }));
    }
    return;
  } catch (error) {
    logger.error('UserEventService addUserCourseToEvent, error:');
    logger.error(error);
    throw error;
  }
}

export async function removeUserCourseToEvent(event) {
  try {
    await SessionUser.deleteMany({
      session: event._id,
      unit: event.unit,
      creator: event.creator
    });
  } catch (error) {
    logger.error('UserEventService removeUserCourseToEvent, error:');
    logger.error(error);
    throw error;
  }
}

export async function removeUserCourseEventAddedByCreator(event, users) {
  try {
    await SessionUser.deleteMany({
      session: event._id,
      unit: event.unit,
      user: { $ne: users }
    });
  } catch (error) {
    logger.error('UserEventService removeUserCourseEventAddedByCreator, error:');
    logger.error(error);
    throw error;
  }
}

/**
 * Get user's events
 * @param {object} auth
 * @param {objectId} auth._id
 * @param {email} auth.email
 * @param {object} params
 * @param {date} params.begin
 * @param {date} params.end
 * @param {string[]} params.types
 * @param {objectId|option} params.unit
 * @returns {Promise<void>}
 */
export async function getUserEvents(auth, params) {
  try {
    const {
      begin,
      end,
      types,
      unit,
    } = params;
    const userRole = await checkUserTypeByConditions({
      _id: auth?.type,
      status: USER_TYPE_STATUS.ACTIVE
    });
    const sortCondition = {
      begin: 1,
    };
    const queryConditions = {
      status: USER_EVENT_STATUS.ACTIVE,
      type: { $in: types },
    };
    if (begin && end) {
      queryConditions['time.begin'] = { $gte: new Date(begin), $lte: new Date(end) };
    }
    if (unit) {
      queryConditions.unit = getObjectId(unit);
    }
    const queryAggregate = [
      {
        $match : queryConditions
      },
      {
        $lookup: {
          from: 'users',
          localField: 'creator',
          foreignField: '_id',
          as: 'creator'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'instructor',
          foreignField: '_id',
          as: 'instructor'
        }
      },
      {
        $lookup: {
          from: 'courses',
          localField: 'courses',
          foreignField: '_id',
          as: 'courses'
        }
      },
      {
        $lookup: {
          from: 'groups',
          localField: 'groups',
          foreignField: '_id',
          as: 'groups'
        }
      },
      {
        $lookup: {
          from: 'units',
          as: 'unit',
          let: { unitId: '$unit' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$_id', '$$unitId'] },
                    { $in: ['$status', ([USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN].indexOf(userRole) !== -1)
                          ? [UNIT_STATUS.ACTIVE, UNIT_STATUS.INACTIVE]
                          : [UNIT_STATUS.ACTIVE]] },
                  ]
                }
              }
            },
          ],
        }
      },
      {
        $lookup: {
          from: 'sessionusers',
          as: 'sessionusers',
          let: { session: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$user', getObjectId(auth?._id)] },
                    { $eq: ['$session', '$$session'] },
                    { $eq: ['$status', USER_STATUS.ACTIVE] },
                  ]
                }
              }
            }
          ]
        }
      },
      {
        $lookup: {
          from: 'locations',
          localField: 'unit',
          foreignField: '_id',
          as: 'location'
        }
      },
      {
        $project: {
          _id: 1,
          name: 1,
          description: 1,
          optionUser: 1,
          privacy: 1,
          recorded: 1,
          roomStatus: 1,
          time: 1,
          type: 1,
          unit: { $ifNull: [{ $arrayElemAt: ['$unit', 0] }, { _id: '$_id', missingUnit: true }] },
          creator: { $arrayElemAt: ['$creator', 0] },
          instructor: { $arrayElemAt: ['$instructor', 0] },
          sessionusers: { $ifNull: [{ $arrayElemAt: ['$sessionusers', 0] }, { _id: '$_id', missingUserCourse: true }] },
        }
      },
      {
        $lookup: {
          from: 'courses',
          as: 'course',
          let: { courseId: '$unit.course' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$_id', '$$courseId'] },
                    { $in: ['$status', ([USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN].indexOf(userRole) !== -1)
                          ? [COURSE_STATUS.ACTIVE, COURSE_STATUS.INACTIVE]
                          : [COURSE_STATUS.ACTIVE]] },
                  ]
                }
              }
            }
          ]
        }
      },
      {
        $project: {
          _id: 1,
          name: 1,
          description: 1,
          optionUser: 1,
          privacy: 1,
          recorded: 1,
          roomStatus: 1,
          time: 1,
          type: 1,
          course: { $ifNull: [{ $arrayElemAt: ['$course', 0] }, { _id: '$_id', missingCourse: true }] },
          creator: 1,
          instructor: 1,
          sessionusers: 1,
        }
      },
      {
        $match: {
          $expr: {
            $or: [
              { $ne: ['$sessionusers.missingUserCourse', true] },
              { $eq: ['$instructor._id', getObjectId(auth?._id)] },
              { $eq: ['$creator._id', getObjectId(auth?._id)] },
              { $eq: ['$privacy', USER_EVENT_PRIVACY.PUBLIC] },
            ]
          },
        }
      },
      {
        $match: {
          $expr: {
            $or: [
              { $ne: ['$unit.missingUnit', true] },
              { $eq: ['$type', USER_EVENT_TYPE.EVENT] },
            ]
          },
        }
      },
      {
        $match: {
          $expr: {
            $or: [
              { $ne: ['$course.missingCourse', true] },
              { $eq: ['$type', USER_EVENT_TYPE.EVENT] },
            ]
          },
        }
      },
      {
        $project: {
          _id: 1,
          name: 1,
          description: 1,
          optionUser: 1,
          privacy: 1,
          recorded: 1,
          roomStatus: 1,
          time: 1,
          type: 1,
          creator: {
            firstName: 1,
            lastName: 1,
            fullName: 1,
            avatar: 1,
            status: 1
          },
          instructor: {
            firstName: 1,
            lastName: 1,
            fullName: 1,
            avatar: 1,
            status: 1
          },
          unit: {
            _id: 1,
            course: 1,
            title: 1
          },
          course: 1
        }
      }
    ];
    return await UserEvent.aggregate(queryAggregate).sort(sortCondition);
  } catch (error) {
    logger.error('UserEventService getUserEvents, error:');
    logger.error(error);
    throw error;
  }
}

/**
 * Get user's events
 * @param {object} auth
 * @param {objectId} auth._id
 * @param {email} auth.email
 * @param {object} params
 * @param {date} params.begin
 * @param {date} params.end
 * @param {string[]} params.types
 * @param {objectId|option} params.unit
 * @returns {Promise<void>}
 */
export async function getUserEventsLive( query) {
  try {
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
    const sortCondition = { _id: -1 };
    const queryConditions = {
      status: USER_EVENT_STATUS.ACTIVE,
      type: USER_EVENT_TYPE.WEBINAR,
      roomStatus: USER_ROOM_STATUS.RUNNING
    };
    if (typeof query.textSearch === 'string' && query.textSearch) {
      queryConditions.name = { $regex: validSearchString(query.textSearch) };
    }
    const totalItems = await UserEvent.countDocuments(queryConditions);
    let data = await UserEvent
      .find(queryConditions, '-settings')
        .sort(sortCondition)
        .skip(skip)
        .limit(pageLimit)
      .populate([
        {
          path: 'instructor',
          select: '_id fullName avatar',
        },
        {
          path: 'groups',
          select: 'name status',
        },
        {
          path: 'unit',
          select: 'title course',
        }
      ]).lean();
    if (data?.length) {
      data = await Promise.all(data.map( async item => {
        const promises = await Promise.all([
          getTotalUsersZoomByConditions({
            event: item._id,
            status: USER_ZOOM_STATUS_LIVE.JOINED
          }),
          getCourseInfoByConditions({
            _id: item?.unit?.course,
            status: COURSE_STATUS.ACTIVE
          }),
          getZoomByConditions({
            event: item?._id,
            status: ROOM_STATUS.LIVING
          }),
          getTotalSessionUserByConditions({
            session: item?._id,
            status: SESSION_USER_STATUS.ACTIVE
          })
        ]);
        let isInstructor = true;
        if (promises[1] && item?.instructor?._id) {
          isInstructor = !!await getUserCourseByConditions({
            course: promises[1]?._id,
            user: item?.instructor?._id,
            status: { $in: [COURSE_USER_STATUS.ACTIVE, COURSE_USER_STATUS.IN_PROGRESS, COURSE_USER_STATUS.COMPLETED] }
          });
        }
        return {
          _id: item._id,
          name: item.name,
          instructor: isInstructor ? item.instructor : {},
          unit: item.unit,
          joined: promises[0],
          total: promises[3],
          course: {
            _id: promises[1]?._id,
            name: promises[1]?.name,
            code: promises[1]?.code,
          },
          zoom: {
            id: promises[2]?.zoom?.id,
            host_email: promises[2]?.zoom?.host_email,
            start_time: promises[2]?.startTime,
          }
        };
      }));
    }
    return {
      data: data,
      currentPage: page,
      totalPage: Math.ceil(totalItems / pageLimit),
      totalItems: totalItems,
    };
  } catch (error) {
    logger.error('UserEventService getUserEvents, error:');
    logger.error(error);
    throw error;
  }
}

/**
 * Get user event
 * @param query
 * @param populate
 * @returns {Promise<*>}
 */
export async function getUserEvent(query, populate = {}) {
  try {
    const userEvent = UserEvent.findOne(query);
    if (populate && JSON.stringify(populate) !== '{}') {
      return await userEvent.populate(populate);
    }
    return await userEvent;
  } catch (error) {
    logger.error('UserEventService getUserEvent, error:');
    logger.error(error);
    throw error;
  }
}

/**
 * Get user event
 * @param id
 * @param query
 * @returns {Promise<*>}
 */
export async function getUsersEvent(id, query = {}) {
  try {
    const queryConditions = {
      status: USER_EVENT_STATUS.ACTIVE,
      session: getObjectId(id)
    };
    let queryAggregate;
    if (query.status === USER_ZOOM_STATUS_LIVE.JOINED) {
      queryAggregate = [
        {
          $match : queryConditions
        },
        {
          $lookup: {
            from: 'userzooms',
            as: 'userzoom',
            let: { session: '$session', user: '$user' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$event', '$$session'] },
                      { $eq: ['$user', '$$user'] },
                      { $eq: ['$status', USER_ZOOM_STATUS_LIVE.JOINED] },
                    ]
                  }
                }
              }
            ]
          }
        },
        {
          $lookup: {
            from: 'users',
            as: 'user',
            let: { user: '$user' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$_id', '$$user'] },
                      { $eq: ['$status', USER_STATUS.ACTIVE] },
                    ]
                  }
                }
              }
            ]
          }
        },
        {
          $project: {
            _id: 1,
            userzoom: { $ifNull: [{ $arrayElemAt: ['$userzoom', 0] }, { _id: '$_id', missingUserZoom: true }] },
            user: { $ifNull: [{ $arrayElemAt: ['$user', 0] }, { _id: '$_id', missingUser: true }] },
          }
        },
        {
          $match: {
            $expr: {
              $and: [
                { $ne: ['$userzoom.missingUserZoom', true] },
                { $ne: ['$user.missingUser', true] }
              ]
            }
          }
        },
        {
          $project: {
            _id: 1,
            userzoom: {
              status: 1,
              zoom: {
                id: 1,
                topic: 1,
                join_time: 1
              }
            },
            user: {
              _id: 1,
              email: 1,
              fullName: 1,
              status: 1
            }
          }
        }
      ];
    } else {
      queryAggregate = [
        {
          $match : queryConditions
        },
        {
          $lookup: {
            from: 'userzooms',
            as: 'userzoom',
            let: { session: '$session', user: '$user' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$event', '$$session'] },
                      { $eq: ['$user', '$$user'] },
                      { $eq: ['$status', USER_ZOOM_STATUS_LIVE.JOINED] },
                    ]
                  }
                }
              }
            ]
          }
        },
        {
          $lookup: {
            from: 'users',
            as: 'user',
            let: { user: '$user' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$_id', '$$user'] },
                      { $eq: ['$status', USER_STATUS.ACTIVE] },
                    ]
                  }
                }
              }
            ]
          }
        },
        {
          $project: {
            _id: 1,
            userzoom: { $ifNull: [{ $arrayElemAt: ['$userzoom', 0] }, { _id: '$_id', missingUserZoom: true }] },
            user: { $ifNull: [{ $arrayElemAt: ['$user', 0] }, { _id: '$_id', missingUser: true }] },
          }
        },
        {
          $match: {
            $expr: {
              $and: [
                { $ne: ['$userzoom.status', USER_ZOOM_STATUS_LIVE.JOINED] },
                { $ne: ['$user.missingUser', true] }
              ]
            }
          }
        },
        {
          $project: {
            _id: 1,
            user: {
              _id: 1,
              email: 1,
              fullName: 1,
              status: 1
            }
          }
        }
      ];
    }
    const results = await SessionUser.aggregate(queryAggregate);
    return results;
  } catch (error) {
    logger.error('UserEventService getUserEvent, error:');
    logger.error(error);
    throw error;
  }
}

/**
 * Get user event detail
 * @param auth
 * @param auth._id
 * @param id the user event detail
 * @returns {Promise<any>}
 */
export async function getUserEventDetail(auth, id) {
  try {
    let userEvent = await UserEvent.findOne({ _id: id }).populate([
      {
        path: 'creator',
        select: 'firstName lastName fullName username avatar status',
      },
      {
        path: 'instructor',
        select: 'fullName avatar',
      },
      {
        path: 'courses',
        select: 'name status',
      },
      {
        path: 'groups',
        select: 'name status',
      },
      {
        path: 'unit',
        select: 'title course',
        populate: {
          path: 'course',
          select: 'name'
        }
      },
      {
        path: 'location',
        select: 'name description capacity',
      }
    ]);
    if (!userEvent) {
      return next(new APIError(404, 'User event not found'));
    }
    const sessionUser = await SessionUserService.getUserEvent({
      user: auth._id,
      session: userEvent._id,
      status: USER_EVENT_STATUS.ACTIVE,
    });
    userEvent = userEvent.toJSON();
    userEvent.userRole = await getCourseUserRole(userEvent?.unit?.course?._id, auth._id);
    if (sessionUser) {
      userEvent.registered = true;
      userEvent.sessionUserId = sessionUser._id;
    }
    // Check the instructor now still be set as instructor or not
    const instructorRole = await getCourseUserRole(userEvent?.unit?.course?._id, userEvent?.instructor?._id);
    if (instructorRole !== USER_ROLES.INSTRUCTOR) {
      delete userEvent.instructor;
    }
    if (auth?._id && userEvent?.instructor?._id?.toString() === auth._id?.toString()) {
      userEvent.isInstructor = true;
    }
    // Only creator can edit event
    if (userEvent.type === USER_EVENT_TYPE.EVENT) {
      userEvent.editable = userEvent.creator?._id?.toString() === auth._id?.toString();
    } else {
      // Instructors can edit classroom/live-training
      userEvent.editable = userEvent.userRole === USER_ROLES.INSTRUCTOR || userEvent.creator?._id?.toString() === auth._id?.toString();
    }
    userEvent.accessCodeRequired = !userEvent.editable && !!userEvent?.settings?.accessCode;
    if (!userEvent.editable) {
      delete userEvent.settings;
    }
    userEvent.users = await SessionUser.find({
      session: userEvent._id
    }).populate({
      path: 'user',
      select: '_id fullName',
      match: { status: USER_STATUS.ACTIVE },
    });
    if (userEvent.users?.length) {
      userEvent.users = userEvent.users.map(user => {
        return user.user;
      }).filter(item => item);
    }
    return userEvent;
  } catch (error) {
    logger.error('UserEventService getUserEventDetail, error:');
    logger.error(error);
    throw error;
  }
}

/**
 * Check user is instructor or not
 * @param userId
 * @param userEventId
 * @returns {Promise<boolean>}
 */
export async function isInstructor(userId, userEventId) {
  try {
    const userEvent = await UserEvent.findOne({ _id: userEventId, instructor: userId });
    return !!userEvent;
  } catch (error) {
    logger.error('UserEventService isInstructor, error:');
    logger.error(error);
    throw error;
  }
}

/**
 * Update user event
 * @param {object} creator
 * @param {objectId} creator._id
 * @param {string} creator.fullName
 * @param {string} creator.email
 * @param {ObjectId} id the user event id
 * @param {object} params
 * @param {string} params.name
 * @param {object} params.time
 * @param {string} params.time.begin
 * @param {string} params.time.end
 * @param {string} params.timezone
 * @param {string} params.location
 * @param {string} params.description
 * @param {number} params.duration
 * @param {object} params.settings
 * @param {string} params.settings.accessCode
 * @param {boolean} params.settings.muteOnStart
 * @param {boolean} params.settings.requireModeratorApprove
 * @param {boolean} params.settings.anyUserCanStart
 * @param {boolean} params.settings.anyUserCanJoinAsModerator
 * @param {ObjectId} params.instructor
 * @param {ObjectId[]} params.groups
 * @param {ObjectId[]} params.courses
 * @param {String} params.privacy
 * @param {ObjectId} params.unit
 * @param {ObjectId} params.type
 * @returns {Promise<boolean>}
 */
export async function updateUserEvent(creator, id, params) {
  try {
    const validFields = [
      'name',
      'time',
      'timezone',
      'location',
      'description',
      'duration',
      'settings',
      'groups',
      'courses',
      'privacy',
      'instructor',
      'optionUser'
    ];
    const queryCondition = { _id: id };
    const userEvent = await UserEvent.findOne(queryCondition);
    if (!userEvent) {
      return Promise.reject(new APIError(404, 'User event not found'));
    }
    const updateValues = {};
    validFields.forEach((validField) => {
      if (params[validField]) {
        updateValues[validField] = params[validField];
      }
    });
    const unsetValues = {};
    if (params.privacy === USER_EVENT_PRIVACY.PRIVATE) {
      unsetValues.groups = true;
      unsetValues.courses = true;
      delete updateValues.groups;
      delete updateValues.courses;
    }
    await UserEvent.updateOne(queryCondition, {
      $set: updateValues,
      $unset: unsetValues,
    });
    const eventInfo = await UserEvent.findOne(queryCondition).lean();
    switch (params.optionUser) {
      case USER_EVENT.ALL:
        await addAllUserCourseToEvent(eventInfo);
        break;
      case USER_EVENT.CUSTOM:
        await removeUserCourseToEvent(eventInfo, params.users);
        await addUserCourseToEvent(eventInfo, params.users);
        break;
      case USER_EVENT.REGISTRY:
        await removeUserCourseEventAddedByCreator(eventInfo);
        break;
      default:
        break;
    }
    return true;
  } catch (error) {
    logger.error('UserEventService updateUserEvent, error:');
    logger.error(error);
    throw error;
  }
}

/**
 * Delete user event
 * @param creatorId
 * @param userEventId
 * @returns {Promise<boolean>}
 */
// Todo: Delete all database of userEvent (event, user event, zoom, zoom event, zoom user, tracking user)
export async function deleteUserEvent(creatorId, userEventId) {
  try {
    const session = await UserEvent.findOneAndUpdate({ _id: userEventId }, { $set: { status: USER_EVENT_STATUS.DELETED } });
    // if (session.type === USER_EVENT_TYPE.WEBINAR) {
    //   await deleteUserEventViewTrackingByConditions({ event: userEventId });
    // }
    if (!session) {
      return Promise.reject(new APIError(404, 'Event is not found'));
    }
    const users = await SessionUserService.getSessionUsersByConditions({
      _id: userEventId,
      status: SESSION_USER_STATUS.ACTIVE
    });
    const notifications = await getNotificationByKey(NOTIFICATION_EVENT.EVENT_DELETED);
    if (users?.length && JSON.stringify(notifications) !== '{}') {
      await Promise.all(users.map(async user => {
        const userInfo = await UserService.getUser(user.user);
        user.status = SESSION_USER_STATUS.EVENTDELETED;
        await user.save();
        if (!userInfo || !session) {
          return;
        }
        const unitInfo = await getUnitById(session.unit);
        const courseInfo = unitInfo ? await getCourseById(unitInfo.course) : {};
        const type = await getUserType(userInfo.type);
        const notification = notifications[type?.systemRole] || notifications.ALL;
        if (notification) {
          await formatNotification(notification, {
            userInfo: {
              firstName: userInfo.firstName,
              lastName: userInfo.lastName,
              fullName: userInfo.fullName,
              email: userInfo.email,
            },
            courseInfo,
            unitInfo,
            email: userInfo.email
          });
        }
      }));
    }
    return true;
  } catch (error) {
    logger.error('UserEventService deleteUserEvent, error:');
    logger.error(error);
    throw error;
  }
}
/**
 * join event
 * @param creator
 * @param userEventId
 * @returns {Promise<boolean>}
 */
export async function joinUserEvent(creator, userEventId) {
  try {
    const eventInfo = await UserEvent.findById(userEventId).lean();
    if (eventInfo.type !== USER_EVENT_TYPE.WEBINAR) {
      return Promise.reject(new APIError(404, 'User event not found'));
    }
    const zoomLive = await getMeetingZoomByConditions({
      event: userEventId,
      status: ROOM_STATUS.LIVING
    });
    const userType = await getUserTypeByConditions({ _id: creator.type });
    let canStart = false;
    if (eventInfo?.instructor?.toString() === creator?._id?.toString()
        || (
            userType
            && [USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN].some(role=> userType?.roles?.includes(role))
        )
    ) {
      canStart = true;
    } else {
      const unitInfo = await getUnitByConditions({
        _id: eventInfo?.unit,
        status: UNIT_STATUS.ACTIVE
      });
      const userRole = await getCourseUserRole(unitInfo?.course, creator?._id);
      if (userRole === USER_ROLES.INSTRUCTOR) {
        canStart = true;
      }
    }
    if (canStart) {
      if (JSON.stringify(zoomLive) === '{}') {
        const zoomsConfig = await getAllZoom();
        zoomsConfig.sort(function() { return 0.5 - Math.random() });
        if (zoomsConfig) {
          for (const zoom of zoomsConfig) {
            const zoomRedis = await getRedisInfo(`${REDIS_KEYS.ZOOM_ACCOUNT}-${zoom.zoom_client}`);
            if (!zoomRedis) {
              await setRedisInfo(`${REDIS_KEYS.ZOOM_ACCOUNT}-${zoom.zoom_client}`, true);
              await setRedisExpire(`${REDIS_KEYS.ZOOM_ACCOUNT}-${zoom.zoom_client}`, REDIS_TIME);
              const zooms = await getMeetingsRoom({
                type: 'live'
              }, zoom);
              if (zooms && zooms.total_records === 0) {
                const event = await createScheduleRoom(eventInfo, zoom, creator);
                return event?.start_url;
              }
            }
          }
          return Promise.reject(new APIError(403, 'Zoom account is full.'));
        }
        return Promise.reject(new APIError(403, 'Please setup a zoom account before start.'));
      }
      const zoomInfo = await getMeetingRoom(zoomLive?.zoom?.id, zoomLive.account);
      if (zoomInfo) {
        return zoomInfo?.start_url;
      }
      return zoomLive?.zoom?.start_url;
    }
    if (JSON.stringify(zoomLive) !== '{}') {
      const userSession = await SessionUserService.getUserEvent({
        user: creator._id,
        session: userEventId,
        status: USER_EVENT_STATUS.ACTIVE
      });
      if (!userSession) {
        return Promise.reject(new APIError(401, 'Permission denied'));
      }
      return await getScheduleEvent(userEventId, creator, 'registrant', zoomLive || {});
    } else {
      return Promise.reject(new APIError(403, 'Class is not started yet by the Instructor.'));
    }
  } catch (error) {
    logger.error('UserEventService joinUserEvent, error:');
    logger.error(error);
    throw error;
  }
}

/**
 * join event
 * @param creator
 * @param userEventId
 * @returns {Promise<boolean>}
 */
export async function getEventHistories(userEventId) {
  try {
    let zoom = await getZoomReportByConditions({
      event: userEventId,
      status: { $in : [ROOM_STATUS.LIVING, ROOM_STATUS.STOP] }
    }, { _id: -1 }, MAX_PAGE_LIMIT);
    if (zoom?.length) {
      zoom = zoom.map( item => {
        return {
          _id: item._id,
          status: item.status,
          zoom: {
            topic: item?.zoom?.topic ?? '',
            start_time: item?.zoom?.start_time ?? '',
            duration: item?.zoom?.duration ?? '',
            timezone: item?.zoom?.timezone ?? '',
          },
          account: item?.account?.zoom_client ?? '',
          startTime: item.startTime,
          endTime: item.endTime,
        };
      });
    }
    return zoom
  } catch (error) {
    logger.error('UserEventService getEventHistories, error:');
    logger.error(error);
    throw error;
  }
}

/**
 * event detail for zoom
 * @param creator
 * @param userEventId
 * @returns {Promise<boolean>}
 */
export async function eventDetail(creator, userEventId) {
  try {
    const eventInfo = await UserEvent.findById(userEventId).lean();
    if (eventInfo.type !== USER_EVENT_TYPE.WEBINAR) {
      return Promise.reject(new APIError(404, 'User event not found'));
    }
    return await zoomDetail(userEventId, creator?._id);
  } catch (error) {
    logger.error('UserEventService joinUserEvent, error:');
    logger.error(error);
    throw error;
  }
}

/**
 * report event
 * @param creator
 * @param userEventId
 * @returns {Promise<boolean>}
 */
export async function reportUserEvent(creator, userEventId) {
  try {
    const eventInfo = await UserEvent.findById(userEventId).lean();
    if (eventInfo.type !== USER_EVENT_TYPE.WEBINAR) {
      return Promise.reject(new APIError(404, 'User event not found'));
    }
    return await getZoomReport(userEventId, creator?._id);
  } catch (error) {
    logger.error('UserEventService joinUserEvent, error:');
    logger.error(error);
    throw error;
  }
}

/**
 * report participant event
 * @param creator
 * @param userEventId
 * @returns {Promise<boolean>}
 */
export async function reportParticipantUserEvent(creator, userEventId) {
  try {
    const eventInfo = await UserEvent.findById(userEventId).lean();
    if (eventInfo.type !== USER_EVENT_TYPE.WEBINAR) {
      return Promise.reject(new APIError(404, 'User event not found'));
    }
    const participants = await getParticipantZoomReport(userEventId, creator?._id);
    if (participants?.participants?.length) {
      participants.participants = await Promise.all(participants.participants.map(async (participant) => {
        const user = await getUserByEmail(participant.user_email);
        if (user) {
          participant.userLMS = {
            _id: user._id,
            email: user.email,
            fulName: user.fullName,
            avatar: user.avatar
          };
        }
        return participant;
      }));
    }
    return participants;
  } catch (error) {
    logger.error('UserEventService joinUserEvent, error:');
    logger.error(error);
    throw error;
  }
}

/**
 * Add record to user event
 * @param userEventId
 * @param {object} recordedInfo
 * @param {string} recordedInfo.recordId
 * @param {object} recordedInfo.playback
 * @param {string} recordedInfo.playback.format
 * @param {string} recordedInfo.playback.link
 * @param {number} recordedInfo.playback.processing_time
 * @param {number} recordedInfo.playback.duration in milliseconds
 * @param {object} recordedInfo.playback.extensions
 * @param {object} recordedInfo.playback.extensions.preview
 * @param {object} recordedInfo.playback.extensions.preview.images
 * @param {Array} recordedInfo.playback.extensions.preview.images.image
 * @param {number} recordedInfo.playback.size
 * @returns {Promise<boolean>}
 */
export async function addRecordToUserEvent(userEventId, recordedInfo) {
  try {
    await UserEvent.updateOne(
      {
        _id: userEventId,
        'recorded._id': { $ne: recordedInfo.recordId },
      },
      {
        $push: {
          recorded: {
            _id: recordedInfo.recordId,
            time: Date.now(),
            type: LIVESTREAM_TYPE.BBB,
            playback: recordedInfo.playback,
          },
        },
      }
    );
    return true;
  } catch (error) {
    logger.error('UserEventService addRecordToUserEvent, error:');
    logger.error(error);
    throw error;
  }
}

export async function addRecordZoomToUserEvent(userEventId, recordedInfo) {
  try {
    await UserEvent.updateOne(
      {
        _id: userEventId,
        'recorded._id': { $ne: recordedInfo.id.toString() },
      },
      {
        $push: {
          recorded: {
            _id: recordedInfo.id.toString(),
            time: Date.now(),
            type: LIVESTREAM_TYPE.ZOOM,
            playback: recordedInfo,
          },
        },
      }
    );
    return true;
  } catch (error) {
    logger.error('UserEventService addRecordZoomToUserEvent, error:');
    logger.error(error);
    throw error;
  }
}

/**
 * Change user event room status
 * @param {objectId} userEventId
 * @param {string} roomStatus
 * @returns {Promise<boolean>}
 */
export async function changeUserEventRoomStatus(userEventId, roomStatus) {
  try {
    await UserEvent.updateOne(
      {
        _id: userEventId,
      },
      {
        $set: {
          roomStatus: roomStatus,
        },
      }
    );
    return true;
  } catch (error) {
    logger.error('UserEventService changeUserEventStatus, error:');
    logger.error(error);
    throw error;
  }
}

/**
 * get unit status is Living
 * @param {objectId} userEventId
 * @param {string} roomStatus
 * @returns {Promise<boolean>}
 */
export async function getUnitIsLiving(unit) {
  try {
    return await UserEvent.countDocuments({
      unit,
      roomStatus: USER_ROOM_STATUS.RUNNING
    });
  } catch (error) {
    logger.error('UserEventService changeUserEventStatus, error:');
    logger.error(error);
    throw error;
  }
}

/**
 * get unit getUserEventsByCondition
 * @param {objectId} conditions
 * @returns {Promise<boolean>}
 */
export async function getUserEventsByCondition(conditions) {
  try {
    return await UserEvent.find(conditions);
  } catch (error) {
    logger.error('UserEventService getUserEventsByCondition, error:');
    logger.error(error);
    throw error;
  }
}
