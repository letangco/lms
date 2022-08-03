import Language from './language.model';
import logger from '../../util/logger';
import Redis from '../../util/Redis';
import {
  DEFAULT_LANGUAGES,
  LANGUAGE_STATUS,
  REDIS_KEYS,
} from '../../constants';

/**
 * Update language cache
 * @returns {Promise<*>}
 */
async function updateCache() {
  try {
    const languages = await Language.find({ status: LANGUAGE_STATUS.ACTIVE });
    await Redis.set(REDIS_KEYS.LANGUAGE, JSON.stringify(languages));
    return languages;
  } catch (error) {
    logger.error('LanguageService updateCache error:', error);
    throw error;
  }
}

/**
 * Create language if doesn't have any language
 * @returns {Promise.<boolean>}
 */
export async function createLanguage() {
  try {
    const numLanguage = await Language.countDocuments();
    if (!numLanguage) {
      await Language.insertMany(DEFAULT_LANGUAGES);
      await updateCache();
      return true;
    }
    return false;
  } catch (error) {
    logger.error('LanguageService createLanguage error:', error);
    throw error;
  }
}

/**
 * Get languages
 * @returns {Promise.<boolean>}
 */
export async function getLanguages() {
  try {
    let languages = JSON.parse(await Redis.get(REDIS_KEYS.LANGUAGE));
    if (!languages) {
      languages = await updateCache();
    }
    return languages;
  } catch (error) {
    logger.error('LanguageService getLanguages error:', error);
    throw error;
  }
}
