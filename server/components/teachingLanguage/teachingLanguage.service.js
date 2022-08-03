import TeachingLanguage from './teachingLanguage.model';
import logger from '../../util/logger';
import APIError from '../../util/APIError';
import Redis from '../../util/Redis';
import {
  TEACHING_LANGUAGE_STATUS,
  REDIS_KEYS,
  DEFAULT_TEACHING_LANGUAGES,
} from '../../constants';
import Course from '../course/course.model';

/**
 * Update language cache
 * @returns {Promise<*>}
 */
async function updateCache() {
  try {
    const teachingLanguages = await TeachingLanguage.find({ status: TEACHING_LANGUAGE_STATUS.ACTIVE });
    await Redis.set(REDIS_KEYS.TEACHING_LANGUAGE, JSON.stringify(teachingLanguages));
    return teachingLanguages;
  } catch (error) {
    logger.error('TeachingLanguageService updateCache error:', error);
    throw error;
  }
}

/**
 * Create teaching language if doesn't have any teaching language
 * @returns {Promise.<boolean>}
 */
export async function createTeachingLanguage() {
  try {
    const numTeachingLanguage = await TeachingLanguage.countDocuments();
    if (!numTeachingLanguage) {
      await TeachingLanguage.insertMany(DEFAULT_TEACHING_LANGUAGES);
      await updateCache();
      return true;
    }
    return false;
  } catch (error) {
    logger.error('TeachingLanguageService createTeachingLanguage error:', error);
    throw error;
  }
}

/**
 * Get teaching languages
 * @returns {Promise.<boolean>}
 */
export async function getTeachingLanguages() {
  try {
    let languages = JSON.parse(await Redis.get(REDIS_KEYS.TEACHING_LANGUAGE));
    if (!languages) {
      languages = await updateCache();
    }
    return languages;
  } catch (error) {
    logger.error('TeachingLanguageService getTeachingLanguages error:', error);
    throw error;
  }
}

/**
 * Get language by code
 * @param value
 * @returns {Promise<any>}
 */
export async function getTeachingLanguage(value) {
  try {
    const regExpKeyWord = new RegExp(value, 'i');
    return await TeachingLanguage.findOne({
      value: { $regex: regExpKeyWord }
    }).lean();
  } catch (error) {
    logger.error('TeachingLanguageService getTeachingLanguage error:', error);
    throw error;
  }
}
