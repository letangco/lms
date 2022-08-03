import Zoom from './zoomConfig.model';
import logger from '../../util/logger';
import APIError from '../../util/APIError';
import {
  DEFAULT_PAGE_LIMIT,
  MAX_PAGE_LIMIT,
  ORDER_BY,
  ZOOM_ORDER_FIELDS,
  ZOOM_STATUS, ZOOM_STATUS_LIVE
} from '../../constants';
import {validSearchString} from "../../helpers/string.helper";
/**
 * Create new zoom
 * @param params
 * @param params.name
 * @param params.parent
 * @returns {Promise.<boolean>}
 */
export async function createZoom(params) {
  try {
    const checked = await getZoomByConditions({
      zoom_client: params.zoom_client,
      status: { $in: [ZOOM_STATUS.ACTIVE, ZOOM_STATUS.INACTIVE] }
    })
    if (checked) {
      return Promise.reject(new APIError(403, [
        {
          msg: 'The zoom account is exist.',
          param: 'accountExist',
        },
      ]));
    }
    return await Zoom.create(params);
  } catch (error) {
    logger.error('ZoomService createZoom error:', error);
    throw error;
  }
}

/**
 * Get zooms
 * @returns {Promise.<boolean>}
 */
export async function getZooms(query) {
  try {
    const _page = query.page; const rowPerPage = query.rowPerPage;
    let page = Number(_page || 1).valueOf();
    if (page < 1) {
      page = 1;
    }
    let pageLimit = Number(rowPerPage || DEFAULT_PAGE_LIMIT).valueOf();
    if (pageLimit > MAX_PAGE_LIMIT || pageLimit < 1) {
      pageLimit = MAX_PAGE_LIMIT;
    }
    const skip = (page - 1) * pageLimit;
    const sortCondition = {};
    const orderByValue = ORDER_BY[query.orderBy] || ORDER_BY.asc;
    if (query.order && ZOOM_ORDER_FIELDS[query.order]) {
      sortCondition[ZOOM_ORDER_FIELDS[query.order]] = orderByValue;
    } else {
      sortCondition._id = -1;
    }
    const queryConditions = { status: { $in: [ZOOM_STATUS.ACTIVE, ZOOM_STATUS.INACTIVE] } };
    if (query.status) {
      queryConditions.status = query.status;
    }
    if (query.statusLive) {
      queryConditions.statusLive = query.statusLive;
    }
    if (query.statusLive) {
      if (queryConditions.statusLive === ZOOM_STATUS_LIVE.ONLINE) {
        queryConditions.statusLive = query.statusLive;
      } else {
        queryConditions.statusLive = { $in: [query.statusLive, null] }
      }
    }
    if (typeof query.textSearch === 'string' && query.textSearch) {
      queryConditions.$or = [
        { zoom_client: { $regex: validSearchString(query.textSearch) } },
        { zoom_key: { $regex: validSearchString(query.textSearch) } }
      ];
    }
    const totalItems = await Zoom.countDocuments(queryConditions);
    const data = await Zoom.find(queryConditions)
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
    logger.error('ZoomService getZooms error:', error);
    throw error;
  }
}

/**
 * Get all zooms
 * @returns {Promise.<boolean>}
 */
export async function getAllZoom() {
  try {
    return await Zoom.find({ status: ZOOM_STATUS.ACTIVE });
  } catch (error) {
    logger.error('ZoomService getAllZoom error:', error);
    throw error;
  }
}

/**
 * get zoom detail
 * @param condition
 * @returns {Promise<any>}
 */
export async function getZoom(id) {
  try {
    return await Zoom.findOne({
      _id: id,
      status: { $in: [ZOOM_STATUS.ACTIVE, ZOOM_STATUS.INACTIVE] }
    }).lean();
  } catch (error) {
    logger.error('ZoomService getZoom error:', error);
    throw error;
  }
}
/**
 * get zoom detail by conditions
 * @param condition
 * @returns {Promise<any>}
 */
export async function getZoomByConditions(conditions) {
  try {
    return await Zoom.findOne(conditions).lean();
  } catch (error) {
    logger.error('ZoomService getZoomByConditions error:', error);
    throw error;
  }
}
/**
 * Delete zoom
 * @param id the zoom id
 * @returns {Promise.<boolean>}
 */
export async function deleteZoom(id) {
  try {
    await Zoom.updateOne({ _id: id }, { $set: { status: ZOOM_STATUS.DELETED } });
    return true;
  } catch (error) {
    logger.error('ZoomService deleteZoom error:', error);
    throw error;
  }
}

/**
 * Update zoom
 * @param id the zoom id
 * @param params
 * @param params.name
 * @param params.parent
 * @returns {Promise.<boolean>}
 */
export async function updateZoom(id, params) {
  try {
    const zoom = await getZoom(id);
    if (zoom?.zoom_client !== params.zoom_client) {
      const checked = await getZoomByConditions({
        zoom_client: params.zoom_client,
        status: { $in: [ZOOM_STATUS.ACTIVE, ZOOM_STATUS.INACTIVE] }
      });
      if (checked) {
        return Promise.reject(new APIError(403, [
          {
            msg: 'The zoom account is exist.',
            param: 'accountExist',
          },
        ]));
      }
    }
    const updateResult = await Zoom.updateOne({
      _id: id,
    }, {
      $set: params,
    });
    if (updateResult.nModified > 0) {
      return await Zoom.findById(id);
    }
    return Promise.reject(new APIError(304, 'Not Modified'));
  } catch (error) {
    logger.error('ZoomService updateZoom error:', error);
    throw error;
  }
}
