import Category from './category.model';
import logger from '../../util/logger';
import APIError from '../../util/APIError';
import { CATEGORY_STATUS, REDIS_KEYS } from '../../constants';
import Redis from '../../util/Redis';
import TeachingLanguage from '../teachingLanguage/teachingLanguage.model';

async function getChildrenCategories(parent) {
  try {
    const children = await Category.find({ parent: parent._id, status: CATEGORY_STATUS.ACTIVE });
    const promises = children.map(async (child) => {
      child = child.toJSON();
      await getChildrenCategories(child);
      return child;
    });
    parent.children = await Promise.all(promises);
    return parent.children;
  } catch (error) {
    throw error;
  }
}

/**
 * Update categories cache
 * @returns {Promise<*>}
 */
async function updateCache() {
  try {
    const categories = await getChildrenCategories({ _id: null });
    await Redis.set(REDIS_KEYS.CATEGORY, JSON.stringify(categories));
    return categories;
  } catch (error) {
    logger.error('CategoryService updateCache error:', error);
    throw error;
  }
}

/**
 * Create new category
 * @param params
 * @param params.name
 * @param params.parent
 * @returns {Promise.<boolean>}
 */
export async function createCategory(params) {
  try {
    const cat = await Category.create(params);
    await updateCache();
    return cat;
  } catch (error) {
    logger.error('CategoryService createCategory error:', error);
    throw error;
  }
}

/**
 * Get categories
 * @returns {Promise.<boolean>}
 */
export async function getCategories() {
  try {
    let categories = JSON.parse(await Redis.get(REDIS_KEYS.CATEGORY));
    if (!categories?.length) {
      categories = await updateCache();
    }
    return categories;
  } catch (error) {
    logger.error('CategoryService getCategories error:', error);
    throw error;
  }
}

/**
 * get category detail
 * @param condition
 * @returns {Promise<any>}
 */
export async function getCategoryByName(name) {
  try {
    const regExpKeyWord = new RegExp(name, 'i');
    if (!regExpKeyWord) {
      return {};
    }
    return await Category.findOne({
      name: { $regex: regExpKeyWord }
    }).lean();
  } catch (error) {
    logger.error('CategoryService getCategoryByName error:', error);
    throw error;
  }
}

/**
 * Delete category
 * @param id the category id
 * @returns {Promise.<boolean>}
 */
export async function deleteCategory(id) {
  try {
    const updateResult = await Category.updateOne({ _id: id }, { $set: { status: CATEGORY_STATUS.DELETED } });
    if (updateResult.nModified > 0) {
      await updateCache();
    }
    return true;
  } catch (error) {
    logger.error('CategoryService deleteCategory error:', error);
    throw error;
  }
}

/**
 * Update category
 * @param id the category id
 * @param params
 * @param params.name
 * @param params.parent
 * @returns {Promise.<boolean>}
 */
export async function updateCategory(id, params) {
  try {
    const validFields = ['name', 'parent'];
    const updateValues = {};
    validFields.forEach((validField) => {
      if (params[validField]) {
        updateValues[validField] = params[validField];
      }
    });
    if (Object.keys(updateValues).length > 0) {
      const updateResult = await Category.updateOne({
        _id: id,
      }, {
        $set: updateValues,
      });
      if (updateResult.nModified > 0) {
        await updateCache();
        return await Category.findOne({
          _id: id,
        });
      }
    }
    return Promise.reject(new APIError(304, 'Not Modified'));
  } catch (error) {
    logger.error('CategoryService updateCategory error:', error);
    throw error;
  }
}
