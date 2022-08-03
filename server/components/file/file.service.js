import logger from '../../util/logger';
import APIError from '../../util/APIError';
import { getUser, getUserByConditions } from '../user/user.service';
import File from './file.model';
import UserFile from './userFile.model';
import CourseUser from '../courseUser/courseUser.model';
import UserCourseGroup from '../courseGroup/userCourseGroup.model';
import {
  DEFAULT_PAGE_LIMIT,
  FILE_STATUS,
  MAX_PAGE_LIMIT,
  ROOT_PATH,
  WORKER_NAME,
  FILE_TYPE,
  FILE_SHARE_TYPE, COURSE_USER_STATUS, USER_ROLES, USER_STATUS, USER_GROUP_STATUS
} from '../../constants';
import AMPQ from '../../../rabbitmq/ampq';
import { extraFile } from '../../helpers/extractFile';
import { resizeImage } from '../../helpers/resize';
import { getUserCourseByConditions } from '../courseUser/courseUser.service';
/**
 * Create createFile
 * @param auth
 * @param auth.email
 * @param auth.fullName
 * @param data
 * @param data.title
 * @param data.course
 * @param data.type
 * @param file
 * @returns {Promise.<boolean>}
 */
export async function createFile(auth, data, file) {
  try {
    const promises = await Promise.all([
      getUser(auth._id)
    ]);
    if (!promises[0]) {
      return Promise.reject(new APIError(403, [
        {
          msg: 'User not found',
          param: 'userNotFound',
        },
      ]));
    }
    let path = '';
    if (file) {
      const rootPath = file.destination.replace(`${ROOT_PATH}/`, '');
      path = `${rootPath}/${file.filename}`;
    }
    const fileType = checkFile(file.filename);
    if (!data.type) {
      data.type = getFileTypeByType(fileType);
    }
    const result = await File.create({
      title: data.title,
      user: auth._id,
      course: data.course,
      type: data.type,
      originalname: file.originalname,
      filename: file.fieldname,
      mimetype: file.mimetype,
      path: path,
      size: file.size,
      status: FILE_STATUS.PRIVATE,
      share: {
        type: FILE_SHARE_TYPE[data?.share?.type] || FILE_SHARE_TYPE.PRIVATE,
        data: Array.isArray(data?.share?.data) ? data.share.data : [],
      },
    });
    if (fileType === 'image') {
      resizeImage(result);
    }
    if (data.type === FILE_TYPE.SCORM) {
      await extraFile({
        _id: result._id,
        file: path,
        fileType: `.${fileType}`
      });
      return await File.findById(result._id);
    } else {
      AMPQ.sendDataToQueue(WORKER_NAME.CONVERT_MEDIA, {
        file: path,
        fileType: `.${fileType}`,
        _id: result._id,
        type: 'file'
      });
    }
    return result;
  } catch (error) {
    logger.error(' createFile error:', error);
    throw error;
  }
}
export async function userCreateFile(auth, data, file) {
  try {
    const promises = await Promise.all([
      getUser(auth._id)
    ]);
    if (!promises[0]) {
      return Promise.reject(new APIError(403, [
        {
          msg: 'User not found',
          param: 'userNotFound',
        },
      ]));
    }
    try {
      let path = '';
      if (file) {
        const rootPath = file.destination.replace(`${ROOT_PATH}/`, '');
        path = `${rootPath}/${file.filename}`;
      }
      let fileType = checkFile(file.filename);
      let result = await UserFile.create({
        user: auth._id,
        originalname: file.originalname,
        filename: file.fieldname,
        mimetype: file.mimetype,
        path: path,
        size: file.size
      });
      AMPQ.sendDataToQueue(WORKER_NAME.CONVERT_MEDIA, {
        file: path,
        fileType: `.${fileType}`,
        _id: result._id,
        type: 'userFile'
      });
      return result;
    } catch (error) {
      logger.error('userCreateFile error:', error);
      return Promise.reject(new APIError(500, 'Internal server error'));
    }
  } catch (error) {
    logger.error(' userCreateFile error:', error);
    throw new APIError(500, 'Internal server error');
  }
}
export function checkFile(file) {
  const regDoc = /(.*?)\.(ppt|pptx|doc|docx|xls|xlsx|txt|csv)$/;
  const regVideo = /(.*?)\.(webm|ogg|ogv|avi|mpeg|mpg|mov|wmv|3gp|flv|mp4)$/;
  const regAudio = /(.*?)\.(aac|ogg|wav|mpeg|webm|wave|wma|ra|aif|aiff|mp3|oga)$/;
  const regImage = /(.*?)\.(jpg|jpeg|png|gif)$/;
  if (file.match(regDoc)) {
    return 'pdf';
  }
  if (file.match(regVideo)) {
    return 'mp4';
  }
  if (file.match(regAudio)) {
    return 'mp3';
  }
  if (file.match(regImage)) {
    return 'image';
  }
  return '';
}
export function getFileTypeByType(file) {
  switch (file) {
    case 'pdf':
      return FILE_TYPE.PRESENTATION;
    case 'mp4':
      return FILE_TYPE.VIDEO;
    case 'mp3':
      return FILE_TYPE.AUDIO;
    case 'image':
      return FILE_TYPE.IMAGE;
    default:
      return FILE_TYPE.OTHER;
  }
  const regDoc = /(.*?)\.(ppt|pptx|doc|docx|xls|xlsx|txt|csv)$/;
  const regVideo = /(.*?)\.(webm|ogg|ogv|avi|mpeg|mpg|mov|3gp|flv|mp2|mpe|pmv|mp4|m4p|m4v|wmv|swf)$/;
  const regAudio = /(.*?)\.(aac|ogg|wav|mpeg|webm|wave|wma|ra|aif|aiff|aifc|pcm|au|l16|flac|m4a|caf|wmv)$/;
  const regImage = /(.*?)\.(jpg|jpeg|png|gif|raw|tiff)$/;
  if (file.match(regDoc)) {
    return 'pdf';
  }
  if (file.match(regVideo)) {
    return 'mp4';
  }
  if (file.match(regAudio)) {
    return 'mp3';
  }
  if (file.match(regImage)) {
    return 'image';
  }
  return '';
}
export async function getUserFile(id) {
  try {
    const isArray = Array.isArray(id);
    if (!isArray) {
      id = [id];
    }
    const promise = id?.map(async fileId => {
      const file = await UserFile.findById(fileId);
      return file.toJSON();
    });
    const result = await Promise.all(promise);
    return isArray ? result : result[0];
  } catch (error) {
    logger.error('getUserFile error:', error);
    return Promise.reject(new APIError(500, 'Internal server error'));
  }
}
export async function getFilesByIds(id) {
  try {
    const isArray = Array.isArray(id);
    if (!isArray) {
      id = [id];
    }
    const promise = id?.map(async fileId => {
      const file = await File.findById(fileId);
      return file;
    });
    let result = await Promise.all(promise);
    result = result.filter(item => item);
    return isArray ? result : result[0];
  } catch (error) {
    logger.error('getUserFile error:', error);
    return Promise.reject(new APIError(500, 'Internal server error'));
  }
}

/**
 * updateFile
 * @param id
 * @param auth
 * @param auth.email
 * @param auth.fullName
 * @param data
 * @param data.title
 * @param data.type
 * @returns {Promise.<boolean>}
 */
export async function updateFile(id, auth, data) {
  try {
    const promises = await Promise.all([
      getUser(auth._id),
      getFileById(id)
    ]);
    if (!promises[0]) {
      return Promise.reject(new APIError(403, [
        {
          msg: 'User not found',
          param: 'userNotFound',
        },
      ]));
    }
    if (!promises[1]) {
      return Promise.reject(new APIError(403, [
        {
          msg: 'File not found',
          param: 'FILENotFound',
        },
      ]));
    }
    try {
      if (data.type === 'title') {
        return await File.updateOne({
          _id: id
        }, { $set: {
            title: data.title
          }});
      }
      if (data.type === 'status') {
        return await File.updateOne({
          _id: id
        }, { $set: {
            status: data.status
          }});
      }
      return Promise.reject(new APIError(403, [
        {
          msg: 'Update failed',
          param: 'fileNotFound',
        },
      ]));
    } catch (error) {
      logger.error('createFile error:', error);
      return Promise.reject(new APIError(500, 'Internal server error'));
    }
  } catch (error) {
    logger.error(' createFile error:', error);
    throw new APIError(500, 'Internal server error');
  }
}

/**
 * deleteFile
 * @param id
 * @param auth
 * @param auth.email
 * @param auth.fullName
 * @returns {Promise.<boolean>}
 */
export async function deleteFile(id, auth) {
  try {
    const file = await getFileById(id);
    if (!file) {
      return Promise.reject(new APIError(403, [
        {
          msg: 'File not found',
          param: 'FILENotFound',
        },
      ]));
    }
    if (file?.user !== auth?._id) {
      return Promise.reject(new APIError(401, [
        {
          msg: 'Permission denied',
          param: 'permissionDenied'
        },
      ]));
    }
    try {
      return await File.deleteOne({ _id: id });
    } catch (error) {
      logger.error('createFile error:', error);
      return Promise.reject(new APIError(500, 'Internal server error'));
    }
  } catch (error) {
    logger.error(' createFile error:', error);
    throw new APIError(500, 'Internal server error');
  }
}

/**
 * getFile
 * @param id
 * @param auth
 * @param auth.email
 * @param auth.fullName
 * @returns {Promise.<boolean>}
 */
export async function getFile(id, auth) {
  try {
    const promises = await Promise.all([
      getUser(auth._id)
    ]);
    if (!promises[0]) {
      return Promise.reject(new APIError(403, [
        {
          msg: 'User not found',
          param: 'userNotFound',
        },
      ]));
    }
    try {
      return await File.findById(id);
    } catch (error) {
      logger.error('getFile error:', error);
      return Promise.reject(new APIError(500, 'Internal server error'));
    }
  } catch (error) {
    logger.error(' getFile error:', error);
    throw new APIError(500, 'Internal server error');
  }
}
/**
 * userGetFile
 * @param id
 * @param auth
 * @param auth.email
 * @param auth.fullName
 * @returns {Promise.<boolean>}
 */
export async function userGetFile(id) {
  try {
    try {
      const file = await UserFile.findById(id);
      return file.toJSON();
    } catch (error) {
      logger.error('getFile error:', error);
      return Promise.reject(new APIError(500, 'Internal server error'));
    }
  } catch (error) {
    logger.error(' getFile error:', error);
    throw new APIError(500, 'Internal server error');
  }
}
/**
 * getFiles
 * @param query
 * @param auth
 * @param auth.email
 * @param auth.fullName
 * @returns {Promise.<boolean>}
 */
export async function getFiles(query, auth) {
  try {
    const promises = await Promise.all([
      getUser(auth._id)
    ]);
    if (!promises[0]) {
      return Promise.reject(new APIError(403, [
        {
          msg: 'User not found',
          param: 'userNotFound',
        },
      ]));
    }
    let page = Number(query.page || 1).valueOf();
    if (page < 1) {
      page = 1;
    }
    let pageLimit = Number(query.limit || DEFAULT_PAGE_LIMIT).valueOf();
    if (pageLimit > MAX_PAGE_LIMIT || pageLimit < 1) {
      pageLimit = MAX_PAGE_LIMIT;
    }
    const skip = (page - 1) * pageLimit;
    const sortCondition = {
      _id: -1,
    };
    const queryConditions = {
      course: { $ne: null }
    };
    if (typeof query.textSearch === 'string') {
      const textSearch = query.textSearch.replace(/\\/g, String.raw`\\`);
      const regExpKeyWord = new RegExp(textSearch, 'i');
      queryConditions.title = { $regex: regExpKeyWord };
    }
    if (query.course) {
      queryConditions.course = query.course;
    }
    if (query.status) {
      queryConditions.status = query.status;
    }
    if (query.type) {
      queryConditions.type = query.type;
    }
    const totalItems = await File.countDocuments(queryConditions);
    const data = await File.find(queryConditions)
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
    logger.error(' getFile error:', error);
    throw new APIError(500, 'Internal server error');
  }
}

export async function getFileById(id) {
  try {
    return await File.findById(id);
  } catch (error) {
    logger.error('getFileById error:', error);
    return Promise.reject(new APIError(500, 'Internal server error'));
  }
}

export async function getFileByConditions(conditions) {
  try {
    return await File.findOne(conditions);
  } catch (error) {
    logger.error('getFileByConditions error:', error);
    return Promise.reject(new APIError(500, 'Internal server error'));
  }
}

export async function getFilesByConditions(conditions) {
  try {
    return await File.find(conditions);
  } catch (error) {
    logger.error('getFilesByConditions error:', error);
    return Promise.reject(new APIError(500, 'Internal server error'));
  }
}

/**
 *
 * @param options
 * @pararm {string} options.id
 * @returns {Promise<*>}
 */
export async function getDetailFile(options, role) {
  try {
    let file = await File.findById(options.id).populate([
        {
          path: 'share',
          populate: [
            {
              path: 'users',
              select: '_id fullName avatar',
              match: { status: { $in: [USER_STATUS.ACTIVE] } },
            },
            {
              path: 'groups',
              select: '_id name key description status',
              match: { status: { $in: [USER_GROUP_STATUS.ACTIVE] } },
            }
          ]
        },
        {
          path: 'course',
          select: '_id name thumbnail'
        },
        {
          path: 'user',
          select: '_id fullName avatar',
          match: { status: { $in: [USER_STATUS.ACTIVE] } },
        }
      ]);
    if (!file) {
      return Promise.reject(new APIError(403, [
        {
          msg: 'File not found',
          param: 'FILENotFound',
        },
      ]));
    }
    file = file.toJSON();
    // creator or admin
    if (role === USER_ROLES.ADMIN || file?.user?._id?.toString() === options.auth._id?.toString()) {
      // custom users
      if (file?.share?.type === FILE_SHARE_TYPE.CUSTOM) {
        file.share.users = await Promise.all(file?.share?.users?.map(async item => {
          const results = await Promise.all([
            getUserByConditions({
              _id: item?._id,
              status: USER_STATUS.ACTIVE
            }),
            getUserCourseByConditions({
            course: file?.course?._id,
            user: item?._id,
            status: { $in: [COURSE_USER_STATUS.ACTIVE, COURSE_USER_STATUS.COMPLETED, COURSE_USER_STATUS.IN_PROGRESS] }
            })
          ]);
          if (results[0] && results[1]) {
            return item;
          }
          return null;
        }));
        file.share.users = file?.share?.users?.filter(item => item);
      }
      return file;
    }
    // public to course
    if (file?.share?.type === FILE_SHARE_TYPE.PUBLIC) {
      const conditionCourseUser = {
        user: options.auth._id,
        status: COURSE_USER_STATUS.ACTIVE,
        course: file?.course?._id
      };
      const courseJoined = await CourseUser.findOne(conditionCourseUser);
      if (courseJoined) {
        return file;
      }
    }
    // custom users
    if (file?.share?.type === FILE_SHARE_TYPE.CUSTOM) {
      const userIds = file?.share?.users?.map(item => item?._id) || [];
      const isJoinedCourse = userIds.includes(options.auth._id?.toString());
      if (isJoinedCourse) {
        return file;
      }
    }
    // custom group
    if (file?.share?.type === FILE_SHARE_TYPE.GROUP) {
      const conditionUserCourseGroup = {
        user: options.auth._id,
        course: file?.course?._id,
      };
      const userCourseGroup = await UserCourseGroup.findOne(conditionUserCourseGroup);
      const groupIds = file?.share?.group?.map(item => item?._id) || [];
      const isJoinedGroup = groupIds?.includes(userCourseGroup?.group?.toString());
      if (isJoinedGroup) {
        return file;
      }
    }
    return Promise.reject(new APIError(401, [
      {
        msg: 'Permission denied',
        param: 'permissionDenied',
      },
    ]));
  } catch (error) {
    logger.error('getDetailFile error:', error);
    return Promise.reject(new APIError(500, 'Internal server error'));
  }
}

/**
 *
 * @param auth
 * @param params
 * @param {string} params.id
 * @param data
 * @param {string} data.title
 * @param {string} data.share.type
 * @params {array} data.share.data
 * @returns {Promise<never>}
 */
export async function editDetailFile(auth, params, data) {
  try {
    const file = await File.findById(params.id).lean();
    if (!file) {
      return Promise.reject(new APIError(403, [
        {
          msg: 'File not found',
          param: 'FILENotFound',
        },
      ]));
    }
    if (file?.user?.toString() !== auth?._id?.toString()) {
      return Promise.reject(new APIError(401, [
        {
          msg: 'Permission denied',
          param: 'permissionDenied',
        },
      ]));
    }
    const updateField = {};
    if (data?.title) {
      updateField.title = data.title;
    }
    if (data?.share?.type && Object.values(FILE_SHARE_TYPE).includes(data.share.type)) {
      updateField.share = {
        type: data.share.type,
      };
      if (data.share.type === FILE_SHARE_TYPE.CUSTOM) {
        updateField.share.users = Array.isArray(data?.share?.users) ? data.share.users : [];
      }
      if (data.share.type === FILE_SHARE_TYPE.GROUP) {
        updateField.share.groups = Array.isArray(data?.share?.groups) ? data.share.groups : [];
      }
    }
    await File.updateOne(
      {
        _id: file._id,
      },
      {
        $set: updateField,
      }
    );
    const fileUpdated = await File.findById(params.id)
      .populate([
        {
          path: 'share',
          populate: [
            {
              path: 'users',
              select: '_id fullName avatar',
            },
            {
              path: 'groups',
              select: '_id name key description status'
            }
          ]
        },
        {
          path: 'course',
          select: '_id name thumbnail'
        },
        {
          path: 'user',
          select: '_id fullName avatar'
        }
      ]);
    return fileUpdated.toJSON();
  } catch (error) {
    logger.error('editDetailFile error:', error);
    return Promise.reject(new APIError(500, 'Internal server error'));
  }
}

/**
 *
 * @param auth
 * @param {string} auth._id
 * @param query
 * @param {number} query.page
 * @param {number} query.limit
 * @param {number} query.skip
 * @param {string} query.course
 * @param {string} query.textSearch
 * @returns {Promise<never>}
 */
export async function getShareFiles(auth, query, role) {
  try {
    let conditionQuery = {};
    const courseIds = [];
    if (query?.course) {
      courseIds.push(query.course);
    }
    const conditionCourseUser = {
      user: auth._id,
      status: {$ne: COURSE_USER_STATUS.DELETED }
    };
    const conditionGroup = {
      user: auth._id,
    };
    if (query?.course) {
      conditionCourseUser.course = query.course;
      conditionGroup.course = query.course;
    }
    const promiseQuery = [
      CourseUser.find(conditionCourseUser).populate({ path: 'course', select: '_id name parent'}).lean(),
      UserCourseGroup.find(conditionGroup).lean(),
    ];
    const dataCondition = await Promise.all(promiseQuery);
    const courseUsers = dataCondition[0];
      courseUsers?.map((item) => {
      courseIds.push(item?.course?._id?.toString());
      if (item?.course?.parent) {
        courseIds.push(item?.course?.parent?.toString());
      }
    });
    const groupIds = dataCondition[1]?.map(item => item?.group);
    if (role !== USER_ROLES.ADMIN) {
      conditionQuery = {
        $or: [
          // public file
          {
            'share.type': FILE_SHARE_TYPE.PUBLIC,
            course: {
              $in: courseIds
            }
          },
          // custom users
          {
            'share.type': FILE_SHARE_TYPE.CUSTOM,
            'share.users': auth._id,
            course: {
              $in: courseIds
            }
          },
          // group
          {
            'share.type': FILE_SHARE_TYPE.GROUP,
            'share.groups': {
              $in: groupIds
            }
          }
        ]
      };
      if (role === USER_ROLES.INSTRUCTOR) {
        // creator
        conditionQuery.$or.push({
          user: auth?._id
        });
      }
    } else {
      conditionQuery = {
        $or: [
          {
            course: {
              $in: courseIds
            }
          }, {
            user:  auth?._id
          }
        ]
      };
    }
    if (typeof query.textSearch === 'string') {
      const textSearch = query.textSearch.replace(/\\/g, String.raw`\\`);
      const regExpKeyWord = new RegExp(textSearch, 'i');
      conditionQuery.title = { $regex: regExpKeyWord };
    }
    const promise = [
      File.countDocuments(conditionQuery),
      File.find(conditionQuery)
        .limit(query.limit)
        .populate([
          {
            path: 'course',
            select: '_id name thumbnail'
          },
          {
            path: 'user',
            select: '_id fullName avatar'
          }
        ])
        .skip(query.skip)
        .sort({ _id: -1 })
    ];

    const data = await Promise.all(promise);
    return {
      data: data[1],
      currentPage: query.page,
      totalPage: Math.ceil(data[0] / query.limit),
      totalItems: data[0],
    };
  } catch (error) {
    logger.error('getShareFiles error:', error);
    return Promise.reject(new APIError(500, 'Internal server error'));
  }
}

/**
 *
 * @param auth
 * @param {string} auth._id
 * @param query
 * @param {number} query.page
 * @param {number} query.limit
 * @param {number} query.skip
 * @param {string} query.course
 * @param {string} query.textSearch
 * @returns {Promise<never>}
 */
export async function getShareFilesByCourse(auth, query, role) {
  try {
    let conditionQuery = {};
    const courseIds = [];
    if (query?.course) {
      courseIds.push(query.course);
    }
    const conditionCourseUser = {
      user: auth._id,
      status: COURSE_USER_STATUS.ACTIVE
    };
    const conditionGroup = {
      user: auth._id,
    };
    if (query?.course) {
      conditionCourseUser.course = query.course;
      conditionGroup.course = query.course;
    }
    const promiseQuery = [
      CourseUser.find(conditionCourseUser).populate({ path: 'course', select: '_id name parent'}).lean(),
      UserCourseGroup.find(conditionGroup).lean(),
    ];
    const dataCondition = await Promise.all(promiseQuery);
    const groupIds = dataCondition[1]?.map(item => item?.group);
    if (role !== USER_ROLES.ADMIN) {
      conditionQuery = {
        $or: [
          // public file
          {
            'share.type': FILE_SHARE_TYPE.PUBLIC,
            course: {
              $in: courseIds
            }
          },
          // custom users
          {
            'share.type': FILE_SHARE_TYPE.CUSTOM,
            'share.users': auth._id,
            course: {
              $in: courseIds
            }
          },
          // group
          {
            'share.type': FILE_SHARE_TYPE.GROUP,
            'share.groups': {
              $in: groupIds
            }
          }
        ]
      };
      if (role === USER_ROLES.INSTRUCTOR) {
        // creator
        conditionQuery.$or.push({
          user: auth?._id
        });
      }
    } else {
      conditionQuery = {
        course: {
          $in: courseIds
        }
      };
    }
    if (typeof query.textSearch === 'string') {
      const textSearch = query.textSearch.replace(/\\/g, String.raw`\\`);
      const regExpKeyWord = new RegExp(textSearch, 'i');
      conditionQuery.title = { $regex: regExpKeyWord };
    }
    const promise = [
      File.countDocuments(conditionQuery),
      File.find(conditionQuery)
        .limit(query.limit)
        .populate([
          {
            path: 'course',
            select: '_id name thumbnail'
          },
          {
            path: 'user',
            select: '_id fullName avatar'
          }
        ])
        .skip(query.skip)
        .sort({ _id: -1 })
    ];

    const data = await Promise.all(promise);
    return {
      data: data[1],
      currentPage: query.page,
      totalPage: Math.ceil(data[0] / query.limit),
      totalItems: data[0],
    };
  } catch (error) {
    logger.error('getShareFiles error:', error);
    return Promise.reject(new APIError(500, 'Internal server error'));
  }
}
