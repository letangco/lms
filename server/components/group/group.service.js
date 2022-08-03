import Group from './group.model';
import logger from '../../util/logger';
import APIError from '../../util/APIError';
import {
  DEFAULT_PAGE_LIMIT,
  GROUP_STATUS,
  MAX_PAGE_LIMIT,
} from '../../constants';

/**
 * Create new group
 * @param creator
 * @param creator._id
 * @param params
 * @param params.name
 * @param params.description
 * @param params.key
 * @param params.price
 * @returns {Promise.<boolean>}
 */
export async function createGroup(creator, params) {
  try {
    return await Group.create({
      creator: creator._id,
      ...params,
    });
  } catch (error) {
    logger.error('GroupService createCategory error:', error);
    throw error;
  }
}

/**
 * Get groups
 * @param {number} _page
 * @param {number} rowPerPage
 * @param {string|option} textSearch
 * @returns {Promise<{totalItems: *, data: *, totalPage: *, currentPage: *}>}
 */
export async function getGroups(_page, rowPerPage, textSearch) {
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
      status: GROUP_STATUS.ACTIVE,
    };
    if (typeof textSearch === 'string' && textSearch) {
      textSearch = textSearch.replace(/\\/g, String.raw`\\`);
      const regExpKeyWord = new RegExp(textSearch, 'i');
      queryConditions.name = { $regex: regExpKeyWord };
    }
    const totalItems = await Group.countDocuments(queryConditions);
    const data = await Group.find(queryConditions)
    .sort(sortCondition)
    .skip(skip)
    .limit(pageLimit);
    return {
      data: data,
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
 * Delete group
 * @param id the group id
 * @returns {Promise.<boolean>}
 */
export async function deleteGroup(id) {
  try {
    await Group.updateOne({ _id: id }, { $set: { status: GROUP_STATUS.DELETED } });
    return true;
  } catch (error) {
    logger.error('GroupService deleteGroup error:', error);
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
    const group = await Group.findOne({ _id: id, status: GROUP_STATUS.ACTIVE });
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
 * Update group
 * @param id the group id
 * @param params
 * @param {String} params.name
 * @param {String} params.description
 * @param {String} params.key
 * @param {String} params.price
 * @returns {Promise.<boolean>}
 */
export async function updateGroup(id, params) {
  try {
    const validFields = ['name', 'description', 'key', 'price'];
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
