import Location from './location.model';
import logger from '../../util/logger';
import APIError from '../../util/APIError';
import { LOCATION_STATUS } from '../../constants';
/**
 * Create new location
 * @param params
 * @param params.name
 * @param params.parent
 * @returns {Promise.<boolean>}
 */
export async function createLocation(params) {
  try {
    const location = await Location.create(params);
    return location;
  } catch (error) {
    logger.error('LocationService createLocation error:', error);
    throw error;
  }
}

/**
 * Get locations
 * @returns {Promise.<boolean>}
 */
export async function getLocations(textSearch = '') {
  try {
    const regExpKeyWord = new RegExp(textSearch, 'i');
    return await Location.find({
      name: { $regex: regExpKeyWord },
      status: { $in: [LOCATION_STATUS.ACTIVE, LOCATION_STATUS.INACTIVE] }
    }).lean();
  } catch (error) {
    logger.error('LocationService getLocations error:', error);
    throw error;
  }
}
/**
 * User get locations
 * @returns {Promise.<boolean>}
 */
export async function userGetLocations(textSearch = '') {
  try {
    const regExpKeyWord = new RegExp(textSearch, 'i');
    return await Location.find({
      name: { $regex: regExpKeyWord },
      status: LOCATION_STATUS.ACTIVE
    }, '_id name description capacity').lean();
  } catch (error) {
    logger.error('LocationService getLocations error:', error);
    throw error;
  }
}

/**
 * get location detail
 * @param condition
 * @returns {Promise<any>}
 */
export async function getLocation(id) {
  try {
    return await Location.findOne({
      _id: id,
      status: { $in: [LOCATION_STATUS.ACTIVE, LOCATION_STATUS.INACTIVE] }
    }).lean();
  } catch (error) {
    logger.error('LocationService getLocation error:', error);
    throw error;
  }
}
/**
 * User get location detail
 * @param condition
 * @returns {Promise<any>}
 */
export async function userGetLocation(id) {
  try {
    return await Location.findOne({
      _id: id,
      status: LOCATION_STATUS.ACTIVE
  }, '_id name description capacity').lean();
  } catch (error) {
    logger.error('LocationService getLocation error:', error);
    throw error;
  }
}

/**
 * Delete location
 * @param id the location id
 * @returns {Promise.<boolean>}
 */
export async function deleteLocation(id) {
  try {
    await Location.updateOne({ _id: id }, { $set: { status: LOCATION_STATUS.DELETED } });
    return true;
  } catch (error) {
    logger.error('LocationService deleteLocation error:', error);
    throw error;
  }
}

/**
 * Update location
 * @param id the location id
 * @param params
 * @param params.name
 * @param params.parent
 * @returns {Promise.<boolean>}
 */
export async function updateLocation(id, params) {
  try {
    const updateResult = await Location.updateOne({
      _id: id,
    }, {
      $set: params,
    });
    if (updateResult.nModified > 0) {
      return await Location.findById(id);
    }
    return Promise.reject(new APIError(304, 'Not Modified'));
  } catch (error) {
    logger.error('LocationService updateLocation error:', error);
    throw error;
  }
}
