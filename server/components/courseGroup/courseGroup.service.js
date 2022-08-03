import Group from './courseGroup.model';
import UserGroup from './userCourseGroup.model';
import logger from '../../util/logger';
import APIError from '../../util/APIError';
import {
  DEFAULT_PAGE_LIMIT, EVENT_LOGS, EVENT_LOGS_TYPE,
  GROUP_STATUS,
  MAX_PAGE_LIMIT, USER_GROUP_STATUS, USER_STATUS,
} from '../../constants';
import { getObjectId, validSearchString } from '../../helpers/string.helper';
import { createLogs } from '../logs/logs.service';

/**
 * Create new group
 * @param creator
 * @param creator._id
 * @param params
 * @param params.name
 * @param params.description
 * @param params.key
 * @param params.course
 * @param params.status
 * @returns {Promise.<boolean>}
 */
export async function createGroup(creator, params) {
  try {
    if (params?.key) {
      const group = await getGroupByConditions({
        key: params.key,
        status: { $in: [GROUP_STATUS.ACTIVE, GROUP_STATUS.INACTIVE] }
      });
      if (group) {
        return Promise.reject(new APIError(403, [
          {
            msg: 'The key already existed.',
            param: 'keyExisted',
          }
        ]));
      }
    }
    const group = await Group.create({
      creator: creator._id,
      ...params,
    });
    await createLogs({
      event: EVENT_LOGS.GROUP_USER_CREATION,
      type: EVENT_LOGS_TYPE.CREATE,
      user: creator?._id,
      data: {
        group: group?._id
      }
    });
    return group;
  } catch (error) {
    logger.error('GroupService createCategory error:', error);
    throw error;
  }
}

/**
 * Create new user group
 * @param creator
 * @param creator._id
 * @param params
 * @param params.group
 * @param params.user
 * @param params.course
 * @param params.type
 * @returns {Promise.<boolean>}
 */
export async function createUserGroup(creator, params) {
  try {
    const group = await UserGroup.create({
      creator: creator._id,
      ...params,
    });
    return group;
  } catch (error) {
    logger.error('GroupService createCategory error:', error);
    throw error;
  }
}

/**
 * Get groups
 * @param {string} course
 * @param {string} status
 * @param {number} _page
 * @param {number} rowPerPage
 * @param {string|option} textSearch
 * @returns {Promise<{totalItems: *, data: *, totalPage: *, currentPage: *}>}
 */
export async function getGroups(course, status, _page, rowPerPage, textSearch) {
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
    };
    if (status) {
      queryConditions.status = status;
    } else {
      queryConditions.status = { $in: [GROUP_STATUS.ACTIVE, GROUP_STATUS.INACTIVE] };
    }
    if (course) {
      queryConditions.course = course;
    }
    if (typeof textSearch === 'string' && textSearch) {
      textSearch = textSearch.replace(/\\/g, String.raw`\\`);
      const regExpKeyWord = new RegExp(textSearch, 'i');
      queryConditions.name = { $regex: regExpKeyWord };
    }
    const totalItems = await Group.countDocuments(queryConditions);
    const data = await Group.find(queryConditions)
    .sort(sortCondition)
    .skip(skip)
    .limit(pageLimit).populate([
      {
        path: 'course',
        select: '_id name thumbnail code',
      }
    ]);
    let results = [];
    if (data?.length) {
      results = await Promise.all(data.map(async result => {
       const count = await UserGroup.countDocuments({
         group: result._id
       });
        return {
          _id: result._id,
          status: result.status,
          creator: result.creator,
          name: result.name,
          key: result.key,
          course: result.course,
          description: result.description,
          createdAt: result.createdAt,
          totalUsers: count
        };
     }));
    }
    return {
      data: results,
      currentPage: page,
      totalPage: Math.ceil(totalItems / pageLimit),
      totalItems: totalItems,
    };
  } catch (error) {
    logger.error(`GroupService getGroups error: ${error}`);
    throw error;
  }
}

/**
 * Get user group
 * @param {object} params
 */
export async function getUserGroups(params) {
  try {
    const {
      group,
      rowPerPage,
      _page,
      textSearch
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
    const sortCondition = {
      _id: -1,
    };
    const queryConditions = {
      group: getObjectId(group)
    };
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
            type: 1,
            user: { $arrayElemAt: ['$user', 0] },
          },
        },
        {
          $project: {
            _id: 1,
            type: 1,
            user: {
              fullName: 1,
              firstName: 1,
              lastName: 1,
              email: 1,
              status: 1,
            }
          },
        },
        {
          $match: { user: { $ne: null } },
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
            type: 1
          },
        },
        {
          $project: {
            _id: 1,
            type: 1,
            user: {
              fullName: 1,
              firstName: 1,
              lastName: 1,
              email: 1,
              status: 1,
            }
          },
        },
        {
          $match: { user: { $ne: null } },
        },
      ];
    }
    const counter = await UserGroup.aggregate([
        ...aggregateConditions,
        { $group: { _id: null, totalItems: { $sum: 1 } } }
    ]);
    const totalItems = counter?.[0]?.totalItems ?? 0;
    const data = await UserGroup.aggregate([
      ...aggregateConditions,
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
    logger.error(`UserGroupService getGroups error: ${error}`);
    throw error;
  }
}

/**
 * Delete group
 * @param id the group id
 * @returns {Promise.<boolean>}
 */
export async function deleteGroup(id, auth) {
  try {
    await Group.updateOne({ _id: id }, { $set: { status: GROUP_STATUS.DELETED } });
    await UserGroup.updateMany({ group: id, status: USER_GROUP_STATUS.ACTIVE },
        { $set: { status: USER_GROUP_STATUS.GROUPDELETED } });
    await createLogs({
      event: EVENT_LOGS.GROUP_USER_DELETION,
      type: EVENT_LOGS_TYPE.DELETE,
      user: auth?._id,
      data: {
        group: id
      }
    });
    return true;
  } catch (error) {
    logger.error('GroupService deleteGroup error:', error);
    throw error;
  }
}
/**
 * Delete group
 * @param id the group id
 * @returns {Promise.<boolean>}
 */
export async function deleteUserGroup(id) {
  try {
    await UserGroup.deleteOne({ _id: id });
    return true;
  } catch (error) {
    logger.error('GroupService deleteUserGroup error:', error);
    throw error;
  }
}

/**
 * Get group by id
 * @param id the group id
 * @returns {Promise.<boolean>}
 */
export async function getGroup(id) {
  try {
    const group = await Group.findOne({ _id: id, status: { $in: [GROUP_STATUS.ACTIVE, GROUP_STATUS.INACTIVE] } })
        .populate({
      path: 'course',
      select: '_id name thumbnail code',
    });
    if (!group) {
      return Promise.reject(new APIError(404, 'Group not found'));
    }
    return group;
  } catch (error) {
    logger.error('GroupService getGroup error:', error);
    throw error;
  }
}
/**
 * Get group by id
 * @param id the group id
 * @returns {Promise.<boolean>}
 */
export async function getGroupByConditions(conditions) {
  try {
    return await Group.findOne(conditions);
  } catch (error) {
    logger.error('GroupService getGroup error:', error);
    throw error;
  }
}

/**
 * Update group
 * @param id the group id
 * @param params
 * @param {String} params.name
 * @param {String} params.description
 * @param {String} params.key
 * @param {String} params.course
 * @param {String} params.status
 * @returns {Promise.<boolean>}
 */
export async function updateGroup(id, params, auth = {}) {
  try {
    if (params?.key) {
      const info = await getGroupByConditions({
        _id: id
      });
      if (info?.key && info?.key !== params.key) {
        const group = await getGroupByConditions({
          key: params.key,
          status: { $in: [GROUP_STATUS.ACTIVE, GROUP_STATUS.INACTIVE] }
        });
        if (group) {
          return Promise.reject(new APIError(403, [
            {
              msg: 'The key already existed.',
              param: 'keyExisted',
            }
          ]));
        }
      }
    }
    const validFields = ['name', 'description', 'key', 'status'];
    const updateValues = {};
    validFields.forEach((validField) => {
      if (params[validField]) {
        updateValues[validField] = params[validField];
      }
    });
    if (Object.keys(updateValues).length > 0) {
      const updateResult = await Group.updateOne({
        _id: id,
      }, {
        $set: updateValues,
      });
      if (!updateResult.nModified) {
        return Promise.reject(new APIError(304, 'Not Modified'));
      }
      await createLogs({
        event: EVENT_LOGS.GROUP_USER_UPDATE,
        type: EVENT_LOGS_TYPE.UPDATE,
        user: auth?._id,
        data: {
          group: id
        }
      });
      return await Group.findOne({
        _id: id,
      });
    }
    return Promise.reject(new APIError(304, 'Not Modified'));
  } catch (error) {
    logger.error('GroupService updateGroup error:', error);
    throw error;
  }
}

/**
 * Update user group
 * @param id the group id
 * @param params
 * @param {String} params.name
 * @param {String} params.description
 * @param {String} params.key
 * @param {String} params.course
 * @param {String} params.status
 * @returns {Promise.<boolean>}
 */
export async function updateUserGroup(id, params, auth = {}) {
  try {
    const validFields = ['user', 'group', 'type', 'course'];
    const updateValues = {};
    validFields.forEach((validField) => {
      if (params[validField]) {
        updateValues[validField] = params[validField];
      }
    });
    if (Object.keys(updateValues).length > 0) {
      const updateResult = await UserGroup.updateOne({
        _id: id,
      }, {
        $set: updateValues,
      });
      if (!updateResult.nModified) {
        return Promise.reject(new APIError(304, 'Not Modified'));
      }
      createLogs({
        event: EVENT_LOGS.GROUP_USER_UPDATE,
        type: EVENT_LOGS_TYPE.UPDATE,
        user: auth?._id,
        data: {
          group: id
        }
      });
      return await UserGroup.findOne({
        _id: id,
      });
    }
    return Promise.reject(new APIError(304, 'Not Modified'));
  } catch (error) {
    logger.error('GroupService updateGroup error:', error);
    throw error;
  }
}

export async function getUserGroupCourseByConditions(conditions) {
  try {
    return await UserGroup.findOne(conditions);
  } catch (error) {
    logger.error('GroupService getUserGroupCourseByConditions error:', error);
    throw error;
  }
}


export async function getGroupsCourseByConditions(conditions, selected = '') {
  try {
    if (selected) {
      return await Group.find(conditions, selected);
    }
    return await Group.find(conditions);
  } catch (error) {
    logger.error('GroupService getUserGroupCourseByConditions error:', error);
    throw error;
  }
}
