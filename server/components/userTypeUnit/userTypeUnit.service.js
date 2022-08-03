import UserTypeUnit from './userTypeUnit.model';
import logger from '../../util/logger';
import Redis from '../../util/Redis';
import { DEFAULT_PERMISSIONS, REDIS_KEYS, USER_TYPE_UNIT_STATUS } from '../../constants';
import { clearUserTypeCache } from '../userType/userType.service';

/**
 * Get children user type unit id for user roles
 * @param {string[]} roles
 * @returns {Promise<[]>}
 */
export async function getUserTypeUnitForRoles(roles) {
  try {
    const childUnits = [];
    await Promise.all(roles.map(async (role) => {
      const children = await UserTypeUnit.aggregate([
        {
          $match: {
            status: 'ACTIVE',
            role: role,
          },
        },
        {
          $lookup: {
            from: 'usertypeunits',
            as: 'userTypeUnits',
            let: { id: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$parent', '$$id'] },
                      { $eq: ['$status', USER_TYPE_UNIT_STATUS.ACTIVE] },
                    ]
                  }
                }
              },
            ],
          },
        },
        {
          $match: {
            userTypeUnits: { $size: 0 },
          },
        },
        {
          $project: {
            _id: 1,
          },
        },
      ]);
      const childIds = children.map(child => child._id);
      childUnits.push(...childIds);
      return childIds;
    }));
    return childUnits;
  } catch (error) {
    throw error;
  }
}

/**
 * Find the root role for list of userTypeUnitIds
 * @param userTypeUnitIds
 * @returns {Promise<[]>}
 */
export async function getRootRoles(userTypeUnitIds) {
  try {
    const rootRoles = [];
    await Promise.all(userTypeUnitIds.map(async (userTypeUnitId) => {
      const userTypeUnit = await UserTypeUnit.findOne({ _id: userTypeUnitId }, '_id role');
      if (rootRoles.indexOf(userTypeUnit?.role) === -1) {
        rootRoles.push(userTypeUnit.role);
      }
    }));
    return rootRoles;
  } catch (error) {
    throw error;
  }
}

async function getChildrenTypeUnits(parent) {
  try {
    const children = await UserTypeUnit.find({ parent: parent._id, status: USER_TYPE_UNIT_STATUS.ACTIVE });
    const promises = children.map(async (child) => {
      child = child.toJSON();
      await getChildrenTypeUnits(child);
      return child;
    });
    parent.children = await Promise.all(promises);
    return parent.children;
  } catch (error) {
    throw error;
  }
}

/**
 * Update user type unit cache
 * @returns {Promise<*>}
 */
async function updateCache() {
  try {
    const userTypeUnits = await getChildrenTypeUnits({ _id: null });
    await Redis.set(REDIS_KEYS.UNIT_USER_TYPE, JSON.stringify(userTypeUnits));
    return userTypeUnits;
  } catch (error) {
    logger.error('UserTypeUnitService updateCache error:', error);
    throw error;
  }
}

/**
 * Get user type units
 * @returns {Promise<boolean>}
 */
export async function getUserTypeUnits() {
  try {
    let userTypeUnits = JSON.parse(await Redis.get(REDIS_KEYS.UNIT_USER_TYPE));
    if (!userTypeUnits?.length) {
      userTypeUnits = await updateCache();
    }
    return userTypeUnits;
  } catch (error) {
    logger.error(`UserTypeUnit getUserTypeUnits error: ${error}`);
    throw error;
  }
}

/**
 * Create new user type unit
 * @param params
 * @param {String} params.name
 * @param {String} params.role
 * @param {String} params.routes
 * @param {String} params.routes.method
 * @param {String} params.routes.route
 * @param {ObjectId} params.parent
 * @param {String} params.status
 * @returns {Promise<boolean>}
 */
export async function createUserTypeUnit(params) {
  try {
    await UserTypeUnit.create(params);
    await updateCache();
    return true;
  } catch (error) {
    logger.error(`UserTypeUnit createUserTypeUnit error: ${error}`);
    throw error;
  }
}

/**
 * Update user type unit
 * @param id
 * @param params
 * @param {String} params.name
 * @param {String} params.role
 * @param {String} params.routes
 * @param {String} params.routes.method
 * @param {String} params.routes.route
 * @param {ObjectId} params.parent
 * @param {String} params.status
 * @returns {Promise<boolean>}
 */
export async function updateUserTypeUnit(id, params) {
  try {
    await UserTypeUnit.updateOne({
      _id: id,
    }, {
      $set: {
        ...params,
      }
    });
    await updateCache();
    await clearUserTypeCache();
    return UserTypeUnit.findOne({ _id: id });
  } catch (error) {
    logger.error(`UserTypeUnit updateUserTypeUnit error: ${error}`);
    throw error;
  }
}

/**
 * Delete user type unit
 * @param id
 * @returns {Promise<boolean>}
 */
export async function deleteUserTypeUnit(id) {
  try {
    await UserTypeUnit.updateOne({
      _id: id,
    }, {
      $set: {
        status: USER_TYPE_UNIT_STATUS.DELETED,
      }
    });
    await updateCache();
    await clearUserTypeCache();
    return true;
  } catch (error) {
    logger.error(`UserTypeUnit deleteUserTypeUnit error: ${error}`);
    throw error;
  }
}

async function addUserTypeUnit(parent) {
  try {
    const data = {
      name: parent.name,
      role: parent.role,
      routes: parent.routes,
      parent: parent.parent,
      status: parent.status,
    };
    Object.keys(data).forEach((key) => {
      if (!data[key]) {
        delete data[key];
      }
    });
    if (data.routes instanceof Array) {
      data.routes = data.routes?.map((route) => {
        if (parent.role) {
          route.role = parent.role;
        }
        return route;
      });
    }
    const userTypeUnit = await UserTypeUnit.create(data);
    if (parent.children instanceof Array) {
      const children = [];
      for (let i = 0; i < parent.children.length; i += 1) {
        const child = parent.children[i];
        child.parent = userTypeUnit._id;
        child.role = parent.role;
        // eslint-disable-next-line no-await-in-loop
        children.push(await addUserTypeUnit(child));
      }
      const promises = children.map((unit, index) => {
        const child = parent.children[index];
        let dependencies = child.dependencies;
        if (dependencies instanceof Array) {
          dependencies = dependencies.map((dependencyIndex) => {
            return children[dependencyIndex]._id;
          });
          return UserTypeUnit.updateOne({ _id: unit._id }, {
            $set: {
              dependencies: dependencies,
            },
          });
        }
        return false;
      });
      await Promise.all(promises);
    }
    return userTypeUnit;
  } catch (error) {
    throw error;
  }
}

/**
 * Import default user type unit if not existed on database
 * @returns {Promise<boolean>}
 */
export async function createUserTypeUnits() {
  try {
    const numUserTypeUnits = await UserTypeUnit.countDocuments();
    if (numUserTypeUnits !== 0) {
      return false;
    }
    const promises = DEFAULT_PERMISSIONS.map(parent => addUserTypeUnit(parent));
    await Promise.all(promises);
    await updateCache();
    logger.info('importUserTypeUnits DONE');
    return true;
  } catch (error) {
    logger.error(`UserTypeUnit importUserTypeUnits error: ${error}`);
    throw error;
  }
}
