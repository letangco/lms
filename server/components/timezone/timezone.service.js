import momentTimezone from 'moment-timezone';
import Timezone from './timezone.model';
import logger from '../../util/logger';
import APIError from '../../util/APIError';
import { REDIS_KEYS, TIMEZONE_STATUS } from '../../constants';
import Redis from '../../util/Redis';

/**
 * Get the moment timezone
 * @returns {[]}
 */
export function getMomentTimezones() {
  const timezones = momentTimezone.tz.names();
  const offsetTmz = [];
  timezones.forEach((tz) => {
    offsetTmz.push({
      name: `(GMT ${momentTimezone.tz(tz).format('Z')}) ${tz}`,
      value: tz,
    });
  });
  return offsetTmz;
}

/**
 * Create timezone if doesn't have any timezone
 * @returns {Promise.<boolean>}
 */
export async function createTimezone() {
  try {
    const numTimezone = await Timezone.countDocuments();
    if (!numTimezone) {
      await Timezone.insertMany(await getMomentTimezones());
      return true;
    }
    return false;
  } catch (error) {
    logger.error('TimezoneService createTimezone error:', error);
    throw error;
  }
}

/**
 * Update timezone cache
 * @returns {Promise<*>}
 */
async function updateCache() {
  try {
    const timezones = await Timezone.find({ status: TIMEZONE_STATUS.ACTIVE });
    await Redis.set(REDIS_KEYS.TIMEZONE, JSON.stringify(timezones));
    return timezones;
  } catch (error) {
    logger.error('TimezoneService updateCache error:', error);
    throw error;
  }
}

/**
 * Get timezones
 * @returns {Promise.<boolean>}
 */
export async function getTimezones() {
  try {
    let timezones = JSON.parse(await Redis.get(REDIS_KEYS.TIMEZONE));
    if (!timezones) {
      timezones = await updateCache();
    }
    return timezones;
  } catch (error) {
    logger.error('TimezoneService getTimezones error:', error);
    throw error;
  }
}

/**
 * Deactivate timezone
 * @param id the timezone id
 * @returns {Promise.<boolean>}
 */
export async function deactivateTimezone(id) {
  try {
    const updateResult = await Timezone.updateOne({ _id: id }, { $set: { status: TIMEZONE_STATUS.INACTIVE } });
    if (updateResult.nModified > 0) {
      await updateCache();
    }
    return true;
  } catch (error) {
    logger.error('TimezoneService deactivateTimezone error:', error);
    throw error;
  }
}

/**
 * Activate timezone
 * @param id the timezone id
 * @returns {Promise.<boolean>}
 */
export async function activateTimezone(id) {
  try {
    const updateResult = await Timezone.updateOne({ _id: id }, { $set: { status: TIMEZONE_STATUS.ACTIVE } });
    if (updateResult.nModified > 0) {
      await updateCache();
    }
    return true;
  } catch (error) {
    logger.error('TimezoneService activateTimezone error:', error);
    throw error;
  }
}

export function getTimezoneInfo(tz) {
  return {
    name: `(GMT ${momentTimezone.tz(tz).format('Z')}) ${tz}`,
    value: tz,
  };
}
