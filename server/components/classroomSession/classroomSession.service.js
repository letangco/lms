import logger from '../../util/logger';
import UserEvent from '../userEvent/userEvent.model';
import {
  DEFAULT_PAGE_LIMIT,
  USER_EVENT_STATUS,
  MAX_PAGE_LIMIT,
  USER_EVENT_TYPE,
  ORDER_BY,
  USER_FOR_SESSION_ORDER_FIELDS,
  USER_STATUS,
  SESSION_USER_STATUS,
  USER_ROLES,
  COURSE_USER_STATUS, ROOM_STATUS,
} from '../../constants';
import APIError from '../../util/APIError';
import { getObjectId } from '../../helpers/string.helper';
import User from '../user/user.model';
import SessionUser from '../sessionUser/sessionUser.model';
import { getCourseUserRole } from '../courseUser/courseUser.service';
import Zoom from '../zoom/zoom.model';
import {Promise} from "mongoose";
import { getZoomReportByConditions } from "../zoom/zoom.service";
import { getUserTypeByConditions } from "../userType/userType.service";

/**
 * Get sessions classroom
 * @param auth
 * @param auth._id
 * @param auth.email
 * @param unit
 * @param begin
 * @param end
 * @returns {Promise<void>}
 */
export async function getClassroomSessions(auth, unit, begin, end) {
  try {
    const sortCondition = {
      begin: 1,
    };

    const queryConditions = {
      'time.begin': { $gte: begin, $lte: end },
      unit: unit,
      type: USER_EVENT_TYPE.CLASSROOM,
      status: USER_EVENT_STATUS.ACTIVE,
    };
    return await UserEvent
      .find(queryConditions)
      .sort(sortCondition)
      .populate([
        {
          path: 'creator',
          select: 'firstName lastName fullName username avatar status',
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
          path: 'instructor',
          select: 'fullName avatar',
        },
      ]);
  } catch (error) {
    logger.error('ClassroomSessionService getClassroomSessions, error:');
    logger.error(error);
    throw error;
  }
}

/**
 * Get sessions by unit
 * @param auth
 * @param auth._id
 * @param unit
 * @returns {Promise<*>}
 */
export async function getSessionsByUnit(auth, unit) {
  try {
    const sortCondition = {
      begin: 1,
    };
    const authId = auth?._id?.toString();
    let userEvents = await UserEvent.find({
      unit: unit,
      status: USER_EVENT_STATUS.ACTIVE,
    }).sort(sortCondition).populate([
      {
        path: 'instructor',
        select: 'fullName avatar',
      },
      {
        path: 'location',
        select: 'name description capacity',
      },
      {
        path: 'unit',
        select: 'title course',
        populate: {
          path: 'course',
          select: 'name',
        },
      },
    ]);
    userEvents = await Promise.all(userEvents?.map(async (userEvent, index) => {
      userEvent = userEvent.toJSON();
      userEvent.index = index;
      userEvent.userRole = await getCourseUserRole(userEvent?.unit?.course?._id, authId);
      const instructorRole = await getCourseUserRole(userEvent?.unit?.course?._id, userEvent?.instructor?._id);
      if ([USER_ROLES.INSTRUCTOR, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN].indexOf(instructorRole) === -1) {
        delete userEvent.instructor;
      }
      if (userEvent.userRole === USER_ROLES.INSTRUCTOR) {
        userEvent.isInstructor = true;
      } else {
        const userType = await getUserTypeByConditions({ _id: auth.type });
        if (userType && [USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN].some(role => userType?.roles.includes(role))) {
          userEvent.isInstructor = true;
        }
      }
      // Only creator can edit event
      if (userEvent.type === USER_EVENT_TYPE.EVENT) {
        userEvent.editable = userEvent.creator?.toString() === authId;
      } else {
        // Instructors can edit classroom/live-training
        userEvent.editable = userEvent.userRole === USER_ROLES.INSTRUCTOR ||
            userEvent.userRole === USER_ROLES.ADMIN ||
            userEvent.userRole === USER_ROLES.SUPER_ADMIN;
      }
      userEvent.accessCodeRequired = !userEvent.editable && !!userEvent?.settings?.accessCode;
      if (!userEvent.editable) {
        delete userEvent.settings;
      }
      const promises = await Promise.all([
        SessionUser.findOne({
          user: auth._id,
          unit: userEvent.unit,
          session: userEvent._id,
          status: USER_EVENT_STATUS.ACTIVE,
        }),
        getZoomReportByConditions({
          event: userEvent._id,
          status: { $in : [ROOM_STATUS.LIVING, ROOM_STATUS.STOP] }
        }, { _id: -1 }, 3)
      ]);
      const sessionUser = promises[0];
      const zoom = promises[1];
      if (sessionUser) {
        userEvent.registered = true;
        userEvent.sessionUserId = sessionUser._id;
      }
      if (zoom?.length) {
        let liveDetails = zoom.map( item => {
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
          }
        });
        userEvent.liveDetails = liveDetails
      }
      return userEvent;
    }));
    return userEvents.sort((a, b) => a.index - b.index);
  } catch (error) {
    logger.error(`ClassroomSessionService getSessionsByUnit, error: ${error}`);
    throw error;
  }
}

/**
 * Search classroom session pagination by id
 * @param unit
 * @param rowPerPage
 * @param firstId
 * @param lastId
 * @param textSearch
 * @param types
 * @returns {Promise<*>}
 */
export async function searchClassroomSessions(unit, rowPerPage, firstId, lastId, textSearch, types) {
  try {
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
      unit: unit,
      status: USER_EVENT_STATUS.ACTIVE,
      type: { $in: types },
    };
    if (typeof textSearch === 'string' && textSearch) {
      textSearch = textSearch.replace(/\\/g, String.raw`\\`);
      const regExpKeyWord = new RegExp(textSearch, 'i');
      queryConditions.name = { $regex: regExpKeyWord };
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
    const userEvents = await UserEvent.find(queryConditions).sort(sortCondition).limit(pageLimit);
    if (firstId) {
      return userEvents.reverse();
    }
    return userEvents;
  } catch (error) {
    logger.error(`ClassroomSessionService searchClassroomSessions error: ${error}`);
    throw error;
  }
}

/**
 * Get session users
 * @param {objectId} courseId
 * @param {objectId} unitId
 * @param {object} params
 * @param {number} params.pageNum
 * @param {number} params.rowPerPage
 * @param {string} params.textSearch search by user fullName
 * @param {number} params.order
 * @param {number} params.orderBy
 * @returns {Promise.<*>}
 */
export async function getSessionUsers(courseId, unitId, params) {
  try {
    const {
      pageNum,
      rowPerPage,
      order,
      orderBy,
    } = params;
    let {
      textSearch,
    } = params;
    const page = Number(pageNum || 1).valueOf();
    let pageLimit = Number(rowPerPage || DEFAULT_PAGE_LIMIT).valueOf();
    if (pageLimit > MAX_PAGE_LIMIT) {
      pageLimit = MAX_PAGE_LIMIT;
    }
    const skip = (page - 1) * pageLimit;
    const sortCondition = {};
    const orderByValue = ORDER_BY[orderBy] || ORDER_BY.desc;
    if (order && USER_FOR_SESSION_ORDER_FIELDS[order]) {
      sortCondition[USER_FOR_SESSION_ORDER_FIELDS[order]] = orderByValue;
    } else {
      sortCondition[USER_FOR_SESSION_ORDER_FIELDS.fullName] = 1;
    }
    const userConditions = { status: USER_STATUS.ACTIVE };
    if (typeof textSearch === 'string' && textSearch) {
      textSearch = textSearch.replace(/\\/g, String.raw`\\`);
      const regExpKeyWord = new RegExp(textSearch, 'i');
      userConditions.fullName = { $regex: regExpKeyWord };
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
                    { $eq: ['$course', getObjectId(courseId)] },
                    { $eq: ['$userRole', USER_ROLES.LEARNER] },
                    { $in: ['$status', [COURSE_USER_STATUS.ACTIVE, COURSE_USER_STATUS.IN_PROGRESS, COURSE_USER_STATUS.COMPLETED]] },
                  ],
                },
              },
            },
          ],
        },
      },
      {
        $match: {
          'courseUsers.0': { $eq: null }
        },
      },
      {
        $lookup: {
          from: 'sessionusers',
          as: 'sessionUser',
          let: { userId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$user', '$$userId'] },
                    { $eq: ['$unit', getObjectId(unitId)] },
                    { $eq: ['$status', SESSION_USER_STATUS.ACTIVE] },
                  ]
                }
              }
            },
            {
              $lookup: {
                from: 'userevents',
                let: { session: '$session' },
                pipeline: [
                  { $match: { $expr: { $eq: ['$_id', '$$session'] } } },
                  { $project: { _id: 1, status: 1, type: 1, name: 1 } }
                ],
                as: 'event'
              }
            },
            {
              $project: {
                _id: 1,
                gradeStatus: 1,
                status: 1,
                event: { $arrayElemAt: ['$event', 0] }
              }
            }
          ],
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
          status: 1,
          firstName: 1,
          lastName: 1,
          email: 1,
          username: 1,
          createdAt: 1,
          fullName: 1,
          avatar: 1,
          sessionUser: 1
        },
      },
      {
        $project: {
          _id: 1,
          status: 1,
          firstName: 1,
          lastName: 1,
          email: 1,
          username: 1,
          createdAt: 1,
          fullName: 1,
          avatar: 1,
          sessionUser: {
            _id: 1,
            gradeDate: 1,
            grade: 1,
            gradeStatus: 1,
            gradeComment: 1,
            status: 1,
            event: 1
          },
        }
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
                    { $eq: ['$course', getObjectId(courseId)] },
                    { $eq: ['$userRole', USER_ROLES.LEARNER] },
                    { $in: ['$status', [COURSE_USER_STATUS.ACTIVE, COURSE_USER_STATUS.IN_PROGRESS, COURSE_USER_STATUS.COMPLETED]] },
                  ],
                },
              },
            },
          ],
        },
      },
      {
        $match: {
          'courseUsers.0': { $eq: null }
        },
      },
      { $group: { _id: null, numUsers: { $sum: 1 } } },
    ];
    let totalItems = await User.aggregate(countConditions);
    totalItems = totalItems?.[0]?.numUsers ?? 0;
    const data = await User.aggregate(aggregateConditions);
    return {
      data: data,
      currentPage: page,
      totalPage: Math.ceil(totalItems / pageLimit),
      totalItems: totalItems,
    };
  } catch (error) {
    logger.error('SessionUserService getSessionUsers error:', error);
    throw error;
  }
}
