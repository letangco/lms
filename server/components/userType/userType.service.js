import UserType from './userType.model';
import logger from '../../util/logger';
import {
  DEFAULT_PAGE_LIMIT,
  MAX_PAGE_LIMIT,
  REDIS_KEYS, USER_ROLES,
  USER_TYPE_STATUS,
  USER_TYPE_UNIT_STATUS,
} from '../../constants';
import APIError from '../../util/APIError';
import Redis from '../../util/Redis';
import { getRootRoles, getUserTypeUnitForRoles } from '../userTypeUnit/userTypeUnit.service';
import { validSearchString } from '../../helpers/string.helper';

/**
 * Update user type cache
 * @returns {Promise<*>}
 */
async function updateCache(id) {
  try {
    const userType = await UserType.findOne({ _id: id }).populate({
      path: 'userTypeUnits',
      select: 'name key parent role routes status dependencies',
      match: { status: USER_TYPE_UNIT_STATUS.ACTIVE },
    });
    const redisKey = `${REDIS_KEYS.USER_TYPE}_${id}`;
    await Redis.set(redisKey, JSON.stringify(userType));
    return userType;
  } catch (error) {
    logger.error('UserTypeService updateCache error:', error);
    throw error;
  }
}

/**
 * Delete user type cache
 * @returns {Promise<*>}
 */
async function deleteCache(id) {
  try {
    const redisKey = `${REDIS_KEYS.USER_TYPE}_${id}`;
    await Redis.del(redisKey);
    return true;
  } catch (error) {
    logger.error('UserTypeService deleteCache error:', error);
    throw error;
  }
}

/**
 * Clear all user type cache
 * @returns {Promise<*>}
 */
export async function clearUserTypeCache() {
  try {
    const scanResult = await Redis.scan('0', `${REDIS_KEYS.USER_TYPE}*`);
    const keys = scanResult?.[1] ?? [];
    await Promise.all(keys.map(key => Redis.del(key)));
    return true;
  } catch (error) {
    logger.error('UserTypeService clearUserTypeCache error:', error);
    throw error;
  }
}

/**
 * Get user types
 * @param _page
 * @param rowPerPage
 * @param textSearch
 * @returns {Promise<{totalItems: *, data: *, totalPage: *, currentPage: *}>}
 */
export async function getUserTypes(_page, rowPerPage, textSearch) {
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
      status: USER_TYPE_STATUS.ACTIVE,
    };
    if (typeof textSearch === 'string' && textSearch) {
      queryConditions.name = { $regex: validSearchString(textSearch) };
    }
    const totalItems = await UserType.countDocuments(queryConditions);
    const data = await UserType.find(queryConditions, '_id key name defaultRole systemRole roles').sort(sortCondition).skip(skip).limit(pageLimit);
    return {
      data: data,
      currentPage: page,
      totalPage: Math.ceil(totalItems / pageLimit),
      totalItems: totalItems,
    };
  } catch (error) {
    logger.error(`UserTypeUnitService getUserTypes error: ${error}`);
    throw error;
  }
}

/**
 * Get user types as list, pagination by id
 * @param params
 * @param params.rowPerPage
 * @param params.firstId
 * @param params.lastId
 * @param params.textSearch
 * @returns {Promise<*>}
 */
export async function getUserTypeList(params) {
  try {
    const {
      rowPerPage,
      firstId,
      lastId,
      textSearch,
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
      status: USER_TYPE_STATUS.ACTIVE,
      systemRole: { $ne: USER_ROLES.SUPER_ADMIN },
    };
    if (typeof textSearch === 'string' && textSearch) {
      queryConditions.name = { $regex: validSearchString(textSearch) };
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
    const userTypes = await UserType.find(queryConditions, '_id key name defaultRole systemRole roles').sort(sortCondition).limit(pageLimit);
    if (firstId) {
      return userTypes.reverse();
    }
    return userTypes;
  } catch (error) {
    logger.error(`UnitService getUserTypeList error: ${error}`);
    throw error;
  }
}

/**
 * Create new user type
 * @param params
 * @param {String} params.name
 * @param {String} params.defaultRole
 * @param {String} params.systemRole
 * @param {ObjectId[]} params.userTypeUnits
 * @param {String} params.status
 * @returns {Promise<boolean>}
 */
export async function createUserType(params) {
  try {
    const rootRoles = await getRootRoles(params.userTypeUnits);
    if (rootRoles.indexOf(params.defaultRole) === -1) {
      return Promise.reject(new APIError(403, [
        {
          msg: 'User default role is invalid',
          param: 'userDefaultRoleInvalid',
        }
      ]));
    }
    if (params?.key) {
      const checked = await getUserTypeByConditions({
        status: USER_TYPE_STATUS.ACTIVE,
        key: params.key
      });
      if (checked) { return Promise.reject(new APIError(403, [
        {
          msg: 'The key already existed.',
          param: 'keyExisted',
        }
      ]));
      }
    }
    return await UserType.create({
      ...params,
      roles: rootRoles,
    });
  } catch (error) {
    logger.error(`UserTypeService createUserType error: ${error}`);
    throw error;
  }
}

/**
 * Update the existed user type
 * @param user
 * @param user._id
 * @param user.avatar
 * @param userTypeId
 * @param params
 * @param params.name
 * @param params.defaultRole
 * @param params.userTypeUnits
 * @param params.dependencies
 * @returns {Promise<*>}
 */
export async function updateUserType(user, userTypeId, params) {
  try {
    const userType = await UserType.findOne({
      _id: userTypeId,
    });
    if (!userType) {
      return Promise.reject(new APIError(404, 'User type not found'));
    }
    if (userType.systemRole) {
      return Promise.reject(new APIError(403, [
        {
          msg: 'Cannot update system user type',
          param: 'CannotUpdateSystemUserType',
        }
      ]));
    }
    if (params?.key && params.key !== userType.key) {
      const checked = await getUserTypeByConditions({
        status: USER_TYPE_STATUS.ACTIVE,
        key: params.key
      });
      if (checked) {
        return Promise.reject(new APIError(403, [
        {
          msg: 'The key already existed.',
          param: 'keyExisted',
        }
      ]));
      }
    }
    const validFields = ['name', 'key', 'defaultRole', 'userTypeUnits', 'dependencies'];
    const updateValues = {};
    validFields.forEach((validField) => {
      if (params[validField]) {
        updateValues[validField] = params[validField];
      }
    });
    if (Object.keys(updateValues).length > 0) {
      if (updateValues.userTypeUnits) {
        updateValues.roles = await getRootRoles(updateValues.userTypeUnits);
      }
      if (updateValues?.roles?.indexOf(params.defaultRole) === -1) {
        return Promise.reject(new APIError(403, [
          {
            msg: 'User default role is invalid',
            param: 'userDefaultRoleInvalid',
          }
        ]));
      }
      const updateResult = await UserType.updateOne({
        _id: userTypeId,
      }, {
        $set: updateValues,
      });
      if (updateResult.nModified > 0) {
        await updateCache(userTypeId);
        return await UserType.findOne({
          _id: userTypeId,
        });
      }
    }
    return Promise.reject(new APIError(304, 'Not Modified'));
  } catch (error) {
    logger.error(`UserTypeService updateUserType error: ${error}`);
    throw error;
  }
}

/**
 * Delete user type
 * @param id
 * @returns {Promise<boolean>}
 */
export async function deleteUserType(id) {
  try {
    await UserType.updateOne({ _id: id }, { $set: { status: USER_TYPE_STATUS.DELETED } });
    await deleteCache(id);
    return true;
  } catch (error) {
    logger.error(`UserTypeService deleteUserType error: ${error}`);
    throw error;
  }
}

/**
 * Get user type
 * @param id
 * @returns {Promise<boolean>}
 */
export async function getUserType(id) {
  try {
    const redisKey = `${REDIS_KEYS.USER_TYPE}_${id}`;
    let userType = null;
    const userTypeCache = await Redis.get(redisKey);
    if (typeof userTypeCache === 'string') {
      userType = JSON.parse(userTypeCache);
    } else {
      userType = await updateCache(id);
    }
    return userType;
  } catch (error) {
    logger.error(`UserTypeService getUserType error: ${error}`);
    throw error;
  }
}

/**
 * Check user type permission
 * @param userTypeId user type id
 * @param method
 * @param route
 * @param role
 * @returns {Promise<boolean>}
 */
export async function checkUserPermission(userTypeId, method, route) {
  try {
    if (!userTypeId || !method || !route) {
      return false;
    }
    const userType = await getUserType(userTypeId);
    if (userType?.defaultRole === USER_ROLES.SUPER_ADMIN) {
      return true;
    }
    const role = userType?.defaultRole;
    const userTypeStringify = JSON.stringify(userType);
    const routeString = `"method":"${method}","route":"${route}","role":"${role}"`;
    return userTypeStringify.includes(routeString);
  } catch (error) {
    logger.error(`UserTypeService checkUserPermission error: ${error}`);
    throw error;
  }
}

/**
 * Create system user type
 * @returns {Promise<boolean>}
 */
export async function createSystemUserType(systemRole, roles) {
  try {
    const systemTypeCount = await UserType.countDocuments({ systemRole: systemRole });
    if (!systemTypeCount) {
      const userTypeUnits = await getUserTypeUnitForRoles(roles);
      const userTypeCreated = await UserType.create({
        name: systemRole,
        roles: roles,
        key: systemRole,
        defaultRole: systemRole,
        systemRole: systemRole,
        userTypeUnits: userTypeUnits,
      });
      await updateCache(userTypeCreated._id);
    }
    return true;
  } catch (error) {
    logger.error(`UserTypeService createSystemUserType error: ${error}`);
    throw error;
  }
}

/**
 * Create system user types
 * @returns {Promise<boolean>}
 */
export async function createSystemUserTypes() {
  try {
    const types = {
      [USER_ROLES.SUPER_ADMIN]: [USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.INSTRUCTOR, USER_ROLES.LEARNER],
      [USER_ROLES.ADMIN]: [USER_ROLES.ADMIN, USER_ROLES.INSTRUCTOR, USER_ROLES.LEARNER],
      [USER_ROLES.INSTRUCTOR]: [USER_ROLES.INSTRUCTOR, USER_ROLES.LEARNER],
      [USER_ROLES.LEARNER]: [USER_ROLES.LEARNER],
    };
    await Promise.all(Object.keys(types).map(systemRole => createSystemUserType(systemRole, types[systemRole])));
    return true;
  } catch (error) {
    logger.error(`UserTypeService createSystemUserTypes error: ${error}`);
    throw error;
  }
}

/**
 * Get system user type
 * @returns {Promise<boolean>}
 */
export async function getSystemUserType(systemRole) {
  try {
    return await UserType.findOne({ systemRole: systemRole });
  } catch (error) {
    logger.error(`UserTypeService getSystemUserType error: ${error}`);
    throw error;
  }
}


/**
 * Get system user type by conditions
 * @returns {Promise<boolean>}
 */
export async function getUserTypeByConditions(conditions) {
  try {
    return await UserType.findOne(conditions);
  } catch (error) {
    logger.error(`UserTypeService getUserTypeByConditions error: ${error}`);
    throw error;
  }
}

/**
 * Get system user type by conditions
 * @returns {Promise<boolean>}
 */
export async function checkUserTypeByConditions(conditions) {
  try {
    const role = await UserType.findOne(conditions);
    if (!role) {
      return Promise.reject(new APIError(401, 'Permission denied'));
    }
    return role.defaultRole;
  } catch (error) {
    logger.error(`UserTypeService getSystemUserType error: ${error}`);
    throw error;
  }
}

/**
 * Get system user type by conditions
 * @returns {Promise<boolean>}
 */
export async function checkUserTypeIsAdmin(id) {
  try {
    const role = await UserType.findOne({
      _id: id,
      status: USER_TYPE_STATUS.ACTIVE,
      defaultRole: { $in: [USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN] }
    });
    if (!role) {
      return Promise.reject(new APIError(401, 'Permission denied'));
    }
    return true;
  } catch (error) {
    logger.error(`UserTypeService getSystemUserType error: ${error}`);
    throw error;
  }
}
