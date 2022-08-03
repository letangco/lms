import mongoose from 'mongoose';
import logger from '../../util/logger';
import APIError from '../../util/APIError';
import Unit from './unit.model';
import Course from '../course/course.model';
import UnitQuestion from './unitQuestion.model';
import UnitSurvey from './unitSurvey.model';
import UserUnit from '../userUnit/userUnit.model';
import UserEvent from '../userEvent/userEvent.model';
import UserUnitTracking from '../userUnit/userUnitTracking.model';
import UserFile from '../file/userFile.model';
import { deleteUserUnitByUnit, inactiveUserUnitByUnit, activeUserUnitByUnit } from '../userCourse/userCourse.service';
import { getUser, getUsersByConditions } from '../user/user.service';
import { getCourse, getCourseById } from '../course/course.service';
import { fetchData } from '../../helpers/fetch';
import {
  UNIT_STATUS,
  UNIT_TYPE,
  UNIT_DATA_TYPE,
  DEFAULT_PAGE_LIMIT,
  MAX_PAGE_LIMIT,
  USER_UNIT_STATUS,
  NOTIFICATION_EVENT,
  USER_STATUS,
  SESSION_USER_STATUS,
  USER_EVENT_STATUS,
  USER_ROLES,
  USER_EVENT_TYPE, USER_TYPE_STATUS, USER_FILE, EVENT_LOGS, EVENT_LOGS_TYPE, USER_GROUP_STATUS,
} from '../../constants';
import { getFilesByConditions, getUserFile } from '../file/file.service';
import { validSearchString } from '../../helpers/string.helper';
import { formatNotification, getNotificationByKey } from '../notification/notificaition.service';
import * as UserService from '../user/user.service';
import { getUnitIsLiving } from '../userEvent/userEvent.service';
import UserSession from '../sessionUser/sessionUser.model';
import Event from '../userEvent/userEvent.model';
import { getUserType } from '../userType/userType.service';
import { createLogs } from '../logs/logs.service';
import {  getGroupsCourseByConditions } from '../courseGroup/courseGroup.service';

export async function getLastOrderUnitByCourse(course) {
  try {
    const unit = await Unit.find({
      course
    }).sort({ order: -1 }).limit(1).skip(0);
    if (unit && unit.length) {
      return unit[0].order;
    }
    return 0;
  } catch (error) {
    logger.error('getTotalUnitByCourse error:', error);
    throw new APIError(500, 'Internal server error');
  }
}

export async function getLastOrderUnitByCondition(conditions) {
  try {
    const unit = await Unit.find(conditions).sort({ order: -1 }).limit(1).skip(0);
    if (unit && unit.length) {
      return unit[0].order;
    }
    return 0;
  } catch (error) {
    logger.error('getTotalUnitByCourse error:', error);
    throw new APIError(500, 'Internal server error');
  }
}

export async function getLastQuestionByUnit(unit) {
  try {
    const question = await UnitQuestion.find({
      unit
    }).sort({ order: -1 }).limit(1).skip(0);
    if (question && question.length) {
      return question[0].order;
    }
    return 0;
  } catch (error) {
    logger.error('getLastQuestionByUnit error:', error);
    throw new APIError(500, 'Internal server error');
  }
}
export async function getLastSurveyByUnit(unit) {
  try {
    const survey = await UnitSurvey.find({
      unit
    }).sort({ order: -1 }).limit(1).skip(0);
    if (survey && survey.length) {
      return survey[0].order;
    }
    return 0;
  } catch (error) {
    logger.error('getLastSurveyByUnit error:', error);
    throw new APIError(500, 'Internal server error');
  }
}

export async function getUnitById(id) {
  try {
    return await Unit.findById(id);
  } catch (error) {
    logger.error('getUnitById error:', error);
    throw new APIError(500, 'Internal server error');
  }
}
export async function getUnitByConditions(conditions) {
  try {
    return await Unit.findOne(conditions);
  } catch (error) {
    logger.error('getUnitById error:', error);
    throw new Error(error);
  }
}

export async function getQuestionUnit(id) {
  try {
    return await UnitQuestion.findById(id);
  } catch (error) {
    logger.error('getQuestionUnit error:', error);
    throw new APIError(500, 'Internal server error');
  }
}

export async function validationUnit(id = '', unit) {
  const error = [];
  try {
    switch (unit.type) {
      case UNIT_TYPE.CONTENT:
        if (!unit.content) {
          error.push({
            msg: 'Content is required',
            param: 'content'
          });
        }
        return error;
      case UNIT_TYPE.WEBPAGE:
      case UNIT_TYPE.IFRAME:
        if (!unit.link) {
          error.push({
            msg: 'Link website is required',
            param: 'link'
          });
        }
        return error;
      case UNIT_TYPE.AUDIO:
      case UNIT_TYPE.SCORM:
        if (!unit.file) {
          error.push({
            msg: 'File is required',
            param: 'file'
          });
        }
        return error;
      case UNIT_TYPE.VIDEO:
      case UNIT_TYPE.DOCUMENT:
        if (unit.typeData === UNIT_DATA_TYPE.LINK) {
          if (!unit.link) {
            error.push({
              msg: 'Link is required',
              param: 'link'
            });
          }
        } else if (!unit.file) {
          error.push({
            msg: 'File is required',
            param: 'file'
          });
        }
        return error;
      case UNIT_TYPE.TEST:
        if (id) {
          if (!unit?.questions?.length) {
            error.push({
              msg: 'Question is required',
              param: 'questions'
            });
          }
        }
        return error;
      case UNIT_TYPE.SURVEY:
        if (id) {
          if (!unit?.surveys?.length) {
            error.push({
              msg: 'Survey is required',
              param: 'surveys'
            });
          }
        }
        return error;
      case UNIT_TYPE.FILES:
          if (!unit?.config?.files?.length) {
            error.push({
              msg: 'File is required',
              param: 'files'
            });
          } else if (unit?.config?.files?.length > 20) {
            error.push({
              msg: 'Maximum 20 files are allowed for upload',
              param: 'files'
            });
          }
        return error;
      default:
        return error;
    }
  } catch (err) {
    logger.error('validationUnit error:', err);
    throw new APIError(500, 'Internal server error');
  }
}

/**
 * Create Unit course
 * @param auth
 * @param auth.email
 * @param auth.fullName
 * @param data
 * @param data.title
 * @param data.content
 * @param data.course
 * @param data.type
 * @returns {Promise.<boolean>}
 */
export async function createUnit(auth, data) {
  try {
    const promises = await Promise.all([
      getUser(auth?._id),
      getCourse(data.course),
      getLastOrderUnitByCourse(data.course),
      validationUnit('', data)
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
          msg: 'Course not found',
          param: 'courseNotFound',
        },
      ]));
    }
    if (promises[3]?.length) {
      return Promise.reject(new APIError(403, promises[3]));
    }
    const defaultTypeSaveAsDraft = [
      UNIT_TYPE.TEST,
      UNIT_TYPE.SURVEY,
      UNIT_TYPE.CLASSROOM,
      UNIT_TYPE.LIVESTREAMING,
    ];
    try {
      const unit = await Unit.create({
        user: auth._id,
        course: data.course,
        title: data.title,
        content: data.content,
        type: data.type,
        typeData: data.typeData,
        link: data.link,
        clone: data.clone,
        file: data.file,
        complete: data.complete,
        status: defaultTypeSaveAsDraft.indexOf(data.type) !== -1 ? UNIT_STATUS.DRAFT : UNIT_STATUS.ACTIVE,
        config: data.config,
        submissions: data.submissions,
        submissionsType: data.submissionsType,
        order: promises[2] ? promises[2] + 1 : 1
      });
      let results;
        if (data.type === UNIT_TYPE.TEST && data?.questions?.length) {
        results = data.questions.map(async (question, index) => {
          await UnitQuestion.create({
            question: question,
            course: data.course,
            unit: unit._id,
            order: index + 1,
            weight: question.weight || 1
          });
        });
        await Promise.all(results);
      }
      if (data.type === UNIT_TYPE.SURVEY && data?.surveys?.length) {
        results = data.surveys.map(async (survey, index) => {
          await UnitSurvey.create({
            survey: survey,
            course: data.course,
            unit: unit._id,
            order: index + 1
          });
        });
        await Promise.all(results);
      }
      await createLogs({
        event: EVENT_LOGS.UNIT_CREATION,
        type: EVENT_LOGS_TYPE.CREATE,
        user: auth?._id,
        data: {
          unit: unit._id,
          course: unit.course,
        }
      });
      return unit;
    } catch (error) {
      logger.error('createUnit error:', error);
      return Promise.reject(new APIError(500, 'Internal server error'));
    }
  } catch (error) {
    logger.error('UnitService createUser error:', error);
    throw new APIError(500, 'Internal server error');
  }
}

/**
 * Create Unit course from import file
 * @param auth
 * @param auth.email
 * @param auth.fullName
 * @param data
 * @param data.title
 * @param data.course
 * @param data.type
 * @param data.order
 * @returns {Promise.<boolean>}
 */
export async function createUnitImportFile(data) {
  try {
    const unitInfo = {
      user: data.user,
      course: data.course,
      title: data.title,
      type: data.type,
      order: data.order
    };
    if (data.description) {
      unitInfo.content = data.description;
    }
    if (data.complete) {
      unitInfo.complete = data.complete;
    }
    const unit = await Unit.create(unitInfo);
    await createLogs({
      event: EVENT_LOGS.UNIT_CREATION,
      type: EVENT_LOGS_TYPE.CREATE,
      user: data.user,
      data: {
        unit: unit._id,
        course: unit?.course
      }
    });
    return unit;
  } catch (error) {
    logger.error('UnitService createUnitImportFile error:', error);
    throw new APIError(500, 'Internal server error');
  }
}

/**
 * Save classroom, set status to active
 * @param auth
 * @param id
 * @returns {Promise<boolean>}
 */
export async function saveClassroom(auth, id) {
  try {
    const unit = await Unit.findOne({
      _id: id,
      user: auth._id,
    });
    if (!unit) {
      return Promise.reject(new APIError(404, 'Unit not found'));
    }
    await Unit.updateOne({
      _id: id,
      user: auth._id,
    }, {
      $set: {
        status: UNIT_STATUS.ACTIVE,
      },
    });
    return true;
  } catch (error) {
    logger.error('UnitService saveClassroom error:', error);
    throw new APIError(500, 'Internal server error');
  }
}

export async function addQuestion(id, auth, data) {
  try {
    const promises = await Promise.all([
      getUser(auth?._id),
      getUnitById(id),
      getLastQuestionByUnit(id)
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
          msg: 'Unit not found',
          param: 'unitNotFound',
        },
      ]));
    }
    try {
      if (promises[1] && promises[1].status === UNIT_STATUS.DRAFT) {
        await Unit.updateOne({
          _id: id
        }, {
        $set: {
            status: UNIT_STATUS.ACTIVE
          }
        });
      }
      return await UnitQuestion.create({
        question: data.question,
        course: promises[1].course,
        unit: id,
        order: promises[2] ? promises[2] + 1 : 1,
        weight: 1
      });
    } catch (error) {
      logger.error('addQuestion error:', error);
      return Promise.reject(new APIError(500, 'Internal server error'));
    }
  } catch (error) {
    logger.error('addQuestion error:', error);
    throw new APIError(500, 'Internal server error');
  }
}
export async function removeQuestion(id, auth) {
  try {
    const promises = await Promise.all([
      getUser(auth?._id)
    ]);
    if (!promises[0]) {
      return Promise.reject(new APIError(403, [
        {
          msg: 'User not found',
          param: 'userNotFound',
        },
      ]));
    }
    await UnitQuestion.deleteOne({
      _id: id
    });
    return true;
  } catch (error) {
    logger.error('removeQuestion error:', error);
    throw new APIError(500, 'Internal server error');
  }
}
export async function removeSurvey(id, auth) {
  try {
    const promises = await Promise.all([
      getUser(auth?._id)
    ]);
    if (!promises[0]) {
      return Promise.reject(new APIError(403, [
        {
          msg: 'User not found',
          param: 'userNotFound',
        },
      ]));
    }
    await UnitSurvey.deleteOne({
      _id: id
    });
    return true;
  } catch (error) {
    logger.error('removeQuestion error:', error);
    throw new APIError(500, 'Internal server error');
  }
}
export async function addSurvey(id, auth, data) {
  try {
    const promises = await Promise.all([
      getUser(auth?._id),
      getUnitById(id),
      getLastSurveyByUnit(id)
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
          msg: 'Unit not found',
          param: 'unitNotFound',
        },
      ]));
    }
    if (promises[1] && promises[1].status === UNIT_STATUS.DRAFT) {
      await Unit.updateOne({
        _id: id
      }, { $set: {
          status: UNIT_STATUS.ACTIVE
        }
      });
    }
    try {
      return await UnitSurvey.create({
        survey: data.survey,
        course: promises[1].course,
        unit: id,
        order: promises[2] ? promises[2] + 1 : 1,
        weight: 1
      });
    } catch (error) {
      logger.error('addSurvey error:', error);
      return Promise.reject(new APIError(500, 'Internal server error'));
    }
  } catch (error) {
    logger.error('addSurvey error:', error);
    throw new APIError(500, 'Internal server error');
  }
}
/**
 * Update Unit course
 * @param id
 * @param auth
 * @param auth.email
 * @param auth.fullName
 * @param data
 * @param data.title
 * @param data.content
 * @returns {Promise.<boolean>}
 */
export async function updateUnit(id, auth, data) {
  try {
    const promises = await Promise.all([
      getUser(auth._id),
      validationUnit(id, data),
      getUnitById(id)
    ]);
    if (!promises[0]) {
      return Promise.reject(new APIError(403, [
        {
          msg: 'User not found',
          param: 'userNotFound',
        }
      ]));
    }
    if (promises[1]?.length) {
      return Promise.reject(new APIError(403, promises[1]));
    }
    if (!promises[2]) {
      return Promise.reject(new APIError(403, [
        {
          msg: 'Unit not found',
          param: 'unitNotFound',
        }
      ]));
    }
    try {
      await Unit.updateOne(
        {
          _id: id
        }, {
          $set: {
          title: data.title,
          content: data.content,
          typeData: data.typeData,
          link: data.link,
          clone: data.clone,
          file: data.file,
          complete: data.complete,
          config: data.config,
          submissions: data.submissions,
          submissionsType: data.submissionsType,
          status: data.status || promises[2].status,
        }
      });
      await createLogs({
        event: EVENT_LOGS.UNIT_UPDATE,
        type: EVENT_LOGS_TYPE.UPDATE,
        user: auth?._id,
        data: {
          unit: promises[2]?._id,
          course: promises[2]?.course
        }
      });
      return true;
    } catch (error) {
      logger.error('createUnit error:', error);
      return Promise.reject(new APIError(500, 'Internal server error'));
    }
  } catch (error) {
    logger.error('UnitService createUser error:', error);
    throw new APIError(500, 'Internal server error');
  }
}
/**
 * Update Unit course
 * @param id
 * @param auth
 * @param auth.email
 * @param auth.fullName
 * @param data
 * @param data.title
 * @param data.content
 * @returns {Promise.<boolean>}
 */
export async function quickUpdateUnit(id, auth, data) {
  try {
    const promises = await Promise.all([
      getUser(auth._id),
      getUnitById(id)
    ]);
    if (!promises[0]) {
      return Promise.reject(new APIError(403, [
        {
          msg: 'User not found',
          param: 'userNotFound',
        }
      ]));
    }
    if (!promises[1]) {
      return Promise.reject(new APIError(401, [
        {
          msg: 'Unit not found',
          param: 'unitNotFound',
        }
      ]));
    }
    try {
      if (data.type === 'title') {
        await Unit.updateOne(
          {
            _id: id
          }, {
            $set: {
              title: data.title
            }
        }
        );
        return true;
      }
      if (data.type === 'status'
          && UNIT_STATUS[data?.status?.toUpperCase()]
          && [UNIT_STATUS.ACTIVE, UNIT_STATUS.INACTIVE].indexOf(UNIT_STATUS[data?.status?.toUpperCase()]) !== -1
      ) {
        await Unit.updateOne(
          {
            _id: id
          }, {
            $set: {
              status: UNIT_STATUS[data?.status?.toUpperCase()]
            }
        }
        );
        switch (UNIT_STATUS[data?.status?.toUpperCase()]) {
          case SESSION_USER_STATUS.INACTIVE:
            await inactiveUserUnitByUnit(id);
            await UserSession.updateMany({
              unit: id
            }, { $set: {
                status: SESSION_USER_STATUS.INACTIVE
              } });
            await Event.updateMany({
              unit: id
            }, { $set: {
                status: USER_EVENT_STATUS.INACTIVE
              } });
            break;
          case SESSION_USER_STATUS.ACTIVE:
            await activeUserUnitByUnit(id);
            await UserSession.updateMany({
              unit: id,
              status: SESSION_USER_STATUS.INACTIVE
            }, { $set: {
                status: SESSION_USER_STATUS.ACTIVE
              } });
            await Event.updateMany({
              unit: id,
              status: SESSION_USER_STATUS.INACTIVE
            }, { $set: {
                status: USER_EVENT_STATUS.ACTIVE
              } });
            break;
          default:
            break;
        }
        return true;
      }
      return Promise.reject(new APIError(401, [
        {
          msg: 'Unit not found',
          param: 'unitNotFound',
        }
      ]));
    } catch (error) {
      logger.error('quickUpdateUnit error:', error);
      return Promise.reject(new APIError(500, 'Internal server error'));
    }
  } catch (error) {
    logger.error('UnitService quickUpdateUnit error:', error);
    throw new APIError(500, 'Internal server error');
  }
}

/**
 * Update sortUnits course
 * @param id
 * @param auth
 * @param auth.email
 * @param auth.fullName
 * @param data
 * @returns {Promise<unknown[]>}
 */
export async function sortUnits(id, auth, data) {
  try {
    const promises = await Promise.all([
      getUser(auth._id),
      getCourse(id),
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
      return Promise.reject(new APIError(401, [
        {
          msg: 'Course not found',
          param: 'courseNotFound',
        }
      ]));
    }
    try {
      const promise = data.map((unit, index) => Unit.updateOne({
          _id: unit
        }, {
          $set: {
            order: index + 1
          }
        }));
      await Promise.all(promise);
      return true;
    } catch (error) {
      logger.error('sortUnits error:', error);
      return Promise.reject(new APIError(500, 'Internal server error'));
    }
  } catch (error) {
    logger.error('UnitService sortUnits error:', error);
    throw new APIError(500, 'Internal server error');
  }
}
/**
 * Update Question Weight course
 * @param id
 * @param auth
 * @param auth.email
 * @param auth.fullName
 * @param data
 * @returns {Promise.<boolean>}
 */
export async function updateQuestionWeight(id, auth, data) {
  try {
    const promises = await Promise.all([
      getUser(auth._id),
      getQuestionUnit(id),
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
      return Promise.reject(new APIError(401, [
        {
          msg: 'Question not found',
          param: 'questionNotFound',
        }
      ]));
    }
    try {
      await UnitQuestion.updateOne({
        _id: id
      }, {
        $set: {
          weight: data.weight
        }
      });
      return true;
    } catch (error) {
      logger.error('sortUnits error:', error);
      return Promise.reject(new APIError(500, 'Internal server error'));
    }
  } catch (error) {
    logger.error('UnitService sortUnits error:', error);
    throw new APIError(500, 'Internal server error');
  }
}

/**
 * Update sortQuestions course
 * @param id
 * @param auth
 * @param auth.email
 * @param auth.fullName
 * @param data
 * @returns {Promise<unknown[]>}
 */
export async function sortQuestions(id, auth, data) {
  try {
    const promises = await Promise.all([
      getUser(auth._id),
      getUnitById(id),
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
      return Promise.reject(new APIError(401, [
        {
          msg: 'Unit not found',
          param: 'unitNotFound',
        }
      ]));
    }
    try {
      const promise = data.map((question, index) => UnitQuestion.updateOne({
          _id: question
        }, {
          $set: {
            order: index + 1
          }
        }));
      await Promise.all(promise);
      return true;
    } catch (error) {
      logger.error('sortQuestions error:', error);
      return Promise.reject(new APIError(500, 'Internal server error'));
    }
  } catch (error) {
    logger.error('UnitService sortQuestions error:', error);
    throw new APIError(500, 'Internal server error');
  }
}

/**
 * update question options
 * @param id
 * @param auth
 * @param auth.email
 * @param auth.fullName
 * @param data
 * @returns {Promise<unknown[]>}
 */
export async function updateOptions(id, auth, data) {
  try {
    const promises = await Promise.all([
      getUser(auth._id),
      getUnitById(id),
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
      return Promise.reject(new APIError(401, [
        {
          msg: 'Unit not found',
          param: 'unitNotFound',
        }
      ]));
    }
    try {
      return await Unit.updateOne({
        _id: id
      }, {
        $set: {
          config: data
        }
      });
    } catch (error) {
      logger.error('updateOptions error:', error);
      return Promise.reject(new APIError(500, 'Internal server error'));
    }
  } catch (error) {
    logger.error('updateOptions error:', error);
    throw new APIError(500, 'Internal server error');
  }
}

/**
 * Update sortSurveys course
 * @param id
 * @param auth
 * @param auth.email
 * @param auth.fullName
 * @param data
 * @returns {Promise<unknown[]>}
 */
export async function sortSurveys(id, auth, data) {
  try {
    const promises = await Promise.all([
      getUser(auth._id),
      getUnitById(id),
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
      return Promise.reject(new APIError(401, [
        {
          msg: 'Unit not found',
          param: 'unitNotFound',
        }
      ]));
    }
    try {
      const promise = data.map((survey, index) => UnitSurvey.updateOne({
          _id: survey
        }, {
          $set: {
            order: index + 1
          }
        }));
      return await Promise.all(promise);
    } catch (error) {
      logger.error('sortQuestions error:', error);
      return Promise.reject(new APIError(500, 'Internal server error'));
    }
  } catch (error) {
    logger.error('UnitService sortQuestions error:', error);
    throw new APIError(500, 'Internal server error');
  }
}

/**
 * Clone unit
 * @param id
 * @param auth
 * @param auth.email
 * @param auth.fullName
 * @returns {Promise.<boolean>}
 */
export async function cloneUnit(query, auth) {
  try {
    const { id, course } = query;
    const promises = await Promise.all([
      getUser(auth._id),
      getUnitById(id)
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
      return Promise.reject(new APIError(401, [
        {
          msg: 'Unit not found',
          param: 'unitNotFound',
        }
      ]));
    }
    try {
      const data = promises[1];
      const total = await getLastOrderUnitByCourse(query.course);
      const unit = await Unit.create({
        title: `${data.title} (clone)`,
        user: auth._id,
        course: course || data.course,
        content: data.content,
        type: data.type,
        typeData: data.typeData,
        link: data.link,
        clone: data.clone,
        file: data.file,
        complete: data.complete,
        status: data.status,
        config: data.config,
        submission: data.submission,
        submissionType: data.submissionType,
        order: total ? total + 1 : 1
      });
      let results;
      if (data.type === UNIT_TYPE.TEST) {
        const questions = await UnitQuestion.find({
          unit: data._id
        });
        if (questions && questions.length) {
          results = questions.map(async (question, index) => {
            await UnitQuestion.create({
              question: question.question,
              unit: unit._id,
              course: unit.course,
              order: question.order,
              weight: question.weight
            });
          });
          await Promise.all(results);
        }
      }
      if (data.type === UNIT_TYPE.SURVEY) {
        const surveys = await UnitSurvey.find({
          unit: data._id
        });
        results = surveys.map(async (survey, index) => {
          await UnitSurvey.create({
            survey: survey.survey,
            unit: unit._id,
            course: survey.course,
            order: survey.order
          });
        });
        await Promise.all(results);
      }
      return unit;
    } catch (error) {
      logger.error('cloneUnit error:', error);
      return Promise.reject(new APIError(500, 'Internal server error'));
    }
  } catch (error) {
    logger.error('UnitService cloneUnit error:', error);
    throw new APIError(500, 'Internal server error');
  }
}

/**
 * Delete Unit course
 * @param id
 * @param auth
 * @param auth.email
 * @param auth.fullName
 * @returns {Promise.<boolean>}
 */
export async function deleteUnit(query, auth) {
  try {
    const { id, keep } = query;
    const promises = await Promise.all([
      getUser(auth._id),
      getUnitById(id)
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
          msg: 'Unit not found',
          param: 'unitNotFound',
        },
      ]));
    }
    try {
      await Unit.updateOne({ _id: id }, { $set: { status: UNIT_STATUS.DELETED } });
      const unit = promises[1];
      await checkKeepUnitLink(unit, keep);
      await deleteUserUnitByUnit(id);
      // TODO: remove all date refer with unit
      // TODO: Remove delede data of unit when delete
      // if (unit.type === UNIT_TYPE.TEST) {
      //   await UnitQuestion.updateMany({ unit: id });
      //   await deleteUserQuestionByUnit(id);
      // }
      // if (unit.type === UNIT_TYPE.SURVEY) {
      //   await UnitSurvey.deleteMany({ unit: id });
      //   await deleteUserSurveyByUnit(id);
      // }
      // if (unit.type === UNIT_TYPE.TEST) {
      //   await UnitQuestion.deleteMany({ unit: id });
      //   await deleteUserQuestionByUnit(id);
      // }
      // if (unit.type === UNIT_TYPE.SURVEY) {
      //   await UnitSurvey.deleteMany({ unit: id });
      //   await deleteUserSurveyByUnit(id);
      // }
      await UserSession.updateMany({
        unit: id,
        status: SESSION_USER_STATUS.ACTIVE
      }, { $set: {
          status: SESSION_USER_STATUS.UNITDELETED
        } });
      await Event.updateMany({
        unit: id,
        status: USER_EVENT_STATUS.ACTIVE
      }, { $set: {
          status: USER_EVENT_STATUS.UNITDELETED
        } });
      await createLogs({
        event: EVENT_LOGS.UNIT_DELETION,
        type: EVENT_LOGS_TYPE.DELETE,
        user: auth?._id,
        data: {
          unit: unit?._id,
          course: unit?.course
        }
      });
      return true;
    } catch (error) {
      logger.error('deleteUnit error:', error);
      return Promise.reject(new APIError(500, 'Internal server error'));
    }
  } catch (error) {
    logger.error('UnitService deleteUnit error:', error);
    throw new APIError(500, 'Internal server error');
  }
}

export async function checkKeepUnitLink(unit, keep) {
  try {
    const unitsLink = await Unit.find({ clone: unit._id });
    if (!unitsLink) return;
    let unitsQuestion = []; let
unitsSurvey = [];
    if (unit.type === UNIT_TYPE.TEST) {
      unitsQuestion = await UnitQuestion.find({ unit: unit._id });
    }
    if (unit.type === UNIT_TYPE.SURVEY) {
      unitsSurvey = await UnitSurvey.find({ unit: unit._id });
    }
    if (keep) {
      await Promise.all(unitsLink.map(async (link) => {
        await Unit.updateOne({
          _id: link._id
          }, {
          $set: {
            content: unit.content,
            type: unit.type,
            typeData: unit.typeData,
            link: unit.link,
            clone: '',
            file: unit.file,
            complete: unit.complete,
            status: unit.status,
            submission: unit.submission,
            submissionType: unit.submissionType,
            config: unit.config,
          }
        });
        if (unitsQuestion?.length) {
          await Promise.all(unitsQuestion.map(async (question) => {
            await UnitQuestion.create({
              question: question.question,
              course: link.course,
              unit: link._id,
              order: question.order,
              weight: question.weight
            });
          }));
        }
        if (unitsSurvey?.length) {
          await Promise.all(unitsSurvey.map(async (survey) => {
            await UnitSurvey.create({
              question: survey.survey,
              course: link.course,
              unit: link._id,
              order: survey.order
            });
          }));
        }
      }));
    } else {
      await Promise.all(unitsLink.map(async (link) => {
        await Unit.updateOne({
          _id: link._id
        },
        { $set: { status: UNIT_STATUS.DELETED } }
        );
        await deleteUserUnitByUnit(link._id);
        // await deleteUserQuestionByUnit(link._id);
        // await deleteUserSurveyByUnit(link._id);
        await UserSession.updateMany({
          unit: link._id
        }, { $set: {
            status: SESSION_USER_STATUS.DELETED
          } });
        await Event.updateMany({
          unit: link._id
        }, { $set: {
            status: USER_EVENT_STATUS.DELETED
          } });
      }));
    }
  } catch (error) {
    logger.error('checkKeepUnitLink error:', error);
    throw new APIError(500, 'Internal server error');
  }
}

/**
 * @param {objectId} id
 * @param {object} auth
 * @param {string} auth._id
 * @returns {Promise<{totalItems: *, data: *, totalPage: *, currentPage: *}>}
 */
export async function getUnit(id, auth) {
  try {
    const data = await Unit.findById(id).lean();
    switch (data?.type) {
      case UNIT_TYPE.TEST:
        data.questions = await UnitQuestion.find({
          unit: id
        }).sort({ order: 1 }).populate({
          path: 'question',
          select: 'title type status'
        });
        break;
      case UNIT_TYPE.SURVEY:
        data.surveys = await UnitSurvey.find({
          unit: id
        }).sort({ order: 1 }).populate({
          path: 'survey',
          select: 'title type status'
        });
        break;
      case UNIT_TYPE.FILES:
        if (data?.config?.files?.length) {
          data.config.files = await getFilesByConditions({
            _id: { $in: data.config.files }
          });
        }
        if (data?.config?.userType === USER_FILE.CUSTOM && data?.config?.users?.length) {
          data.config.users = await getUsersByConditions({
            _id: { $in: data.config.users }
          });
        }
        if (data?.config?.userType === USER_FILE.GROUP && data?.config?.groups?.length) {
          data.config.groups = await getGroupsCourseByConditions({
            _id: { $in: data.config.groups },
            status: USER_GROUP_STATUS.ACTIVE
          }, '_id name key');
        }
        break;
      default:
        break;
    }
    return data;
  } catch (error) {
    logger.error('getUnit error:', error);
    throw new APIError(500, 'Internal server error');
  }
}

export async function getUnitsByConditions(conditions) {
  try {
    return await Unit.find(conditions);
  } catch (error) {
    logger.error('getUnitsByConditions error:', error);
    throw new APIError(500, 'Internal server error');
  }
}
export async function getTotalUnitsByConditions(conditions) {
  try {
    return await Unit.countDocuments(conditions);
  } catch (error) {
    logger.error('getUnitsByConditions error:', error);
    throw new APIError(500, 'Internal server error');
  }
}
export async function getUnits(query) {
  try {
    let page = Number(query.page || 1).valueOf();
    if (page < 1) {
      page = 1;
    }
    let pageLimit = Number(query.limit || MAX_PAGE_LIMIT).valueOf();
    if (pageLimit > MAX_PAGE_LIMIT || pageLimit < 1) {
      pageLimit = MAX_PAGE_LIMIT;
    }
    const skip = (page - 1) * pageLimit;
    const sortCondition = {
      order: 1,
      createdAt: -1
    };
    const conditions = { status: { $nin: [UNIT_STATUS.DRAFT, UNIT_STATUS.DELETED, UNIT_STATUS.COURSEDELETED] } };
    if (query?.course) {
      conditions.course = mongoose.Types.ObjectId(query.course);
    }
    if (query?.status) {
      conditions.status = query.status;
    }
    if (query?.type === 'unit') {
      conditions.type = { $ne: UNIT_TYPE.SECTION };
    }
    if (query.textSearch && typeof query.textSearch === 'string') {
      const textSearch = query.textSearch.replace(/\\/g, String.raw`\\`);
      const regExpKeyWord = new RegExp(textSearch, 'i');
      conditions.title = { $regex: regExpKeyWord };
    }
    const totalItems = await Unit.countDocuments(conditions);
    let data = await Unit.find(conditions)
      .sort(sortCondition)
      .skip(skip)
      .limit(pageLimit)
.lean();
    if (data?.length) {
      data = await Promise.all(
        data.map(async (unit) => {
          if (unit?.type === UNIT_TYPE.LINK) {
            const unitLink = await Unit.findById(unit.clone).lean();
            unit.typeLink = unitLink?.type || '';
            unit.courseLink = unitLink?.course || '';
          } else if (unit?.type === UNIT_TYPE.ASSIGNMENT) {
            unit.submissions = await UserUnit.countDocuments({
              unit: unit._id,
              status: USER_UNIT_STATUS.PENDING
            });
          } else if (unit?.type === UNIT_TYPE.LIVESTREAMING) {
            unit.isLiving = !!await getUnitIsLiving(unit._id);
          }
          unit.countLink = await Unit.countDocuments({
            clone: unit._id
          });
          return unit;
        })
      );
      data.sort((a, b) => a.index - b.index);
    }
    return {
      data: data,
      currentPage: page,
      totalPage: Math.ceil(totalItems / pageLimit),
      totalItems: totalItems,
    };
  } catch (error) {
    logger.error('getTotalUnitByCourse error:', error);
    throw new APIError(500, 'Internal server error');
  }
}
export async function getUnitSubmission(id) {
  try {
    const data = await UserUnit.findById(id).lean();
    if (data?.result?.file) {
        data.result.file = await getUserFile(data.result.file);
    }
    if (data?.result?.attachment?.length) {
      data.result.attachment = await getUserFile(data.result.attachment);
    }
    return data;
  } catch (error) {
    logger.error('getUnitSubmission error:', error);
    throw new APIError(500, 'Internal server error');
  }
}
export async function resetUnitSubmission(id, body, auth) {
  try {
    const data = await UserUnit.findById(id).lean();
    if (!data) {
      return Promise.reject(new APIError(401, [
        {
          msg: 'User submission not found',
          param: 'userSubmissionNotFound',
        }
      ]));
    }
    return await UserUnit.updateOne(
      {
        _id: id
      },
      {
        $set: {
          status: USER_UNIT_STATUS.RESUBMIT,
          'result.reasonReset': body?.reasonReset || '',
          'result.changer': auth?._id
      }
      }
      );
  } catch (error) {
    logger.error('resetUnitSubmission error:', error);
    throw new APIError(500, 'Internal server error');
  }
}
export async function gradeUnitSubmission(id, data, auth) {
  try {
    const unit = await UserUnit.findOne({
      _id: id,
      type: UNIT_TYPE.ASSIGNMENT
    }).lean();
    if (!unit) {
      return Promise.reject(new APIError(401, [
        {
          msg: 'Assigment not found',
          param: 'assigmentNotFound',
        }
      ]));
    }
    const info = await UserUnit.findOneAndUpdate({
      _id: id
    }, {
 $set: {
      status: data.status,
      result: {
        content: unit.result.content,
        date: Date.now(),
        file: unit.result.file,
        grade: data?.grade || '',
        comment: data?.comment || '',
        attachment: data?.attachment || [],
        changer: auth?._id
      },
    }
}).lean();
    const notifications = await getNotificationByKey(NOTIFICATION_EVENT.INSTRUCTOR_GRADING);
    if (JSON.stringify(notifications) !== '{}') {
      const userInfo = await UserService.getUserByConditions({
        _id: info.user,
        status: USER_STATUS.ACTIVE
      });
      if (!userInfo) { return true; }
      const courseInfo = await getCourseById(info.course);
      const unitInfo = await getUnitById(info.unit);
      const type = await getUserType(userInfo.type);
      const notification = notifications[type?.systemRole] || notifications.ALL;
      if (notification) {
        await formatNotification(notification, {
          userInfo: {
            firstName: userInfo.firstName,
            lastName: userInfo.lastName,
            fullName: userInfo.fullName,
            email: userInfo.email,
          },
          courseInfo,
          unitInfo,
          info: {
            unit: info.unit,
            grade: data.grade,
            type: info.type,
            _id: info._id
          },
          email: userInfo.email
        });
      }
    }
    return true;
  } catch (error) {
    logger.error('getUnitSubmission error:', error);
    throw new APIError(500, 'Internal server error');
  }
}
export async function getUnitSubmissions(query) {
  try {
    let page = Number(query.page || 1).valueOf();
    if (page < 1) {
      page = 1;
    }
    let pageLimit = Number(query.limit || DEFAULT_PAGE_LIMIT).valueOf();
    if (pageLimit > MAX_PAGE_LIMIT || pageLimit < 1) {
      pageLimit = MAX_PAGE_LIMIT;
    }
    const skip = (page - 1) * pageLimit;
    const sortCondition = { _id: -1 };
    const conditions = {};
    if (query?.status) {
      conditions.status = query.status;
    }
    if (query?.id) {
      conditions.unit = query.id;
    }
    const totalItems = await UserUnit.countDocuments(conditions);
    let data = await UserUnit.find(conditions)
      .sort(sortCondition)
      .skip(skip)
      .limit(pageLimit)
.lean();
    if (data?.length) {
      data = await Promise.all(
        data.map(async (submission) => {
          submission.user = await getUser(submission.user);
          return submission;
        })
      );
    }
    return {
      data: data,
      currentPage: page,
      totalPage: Math.ceil(totalItems / pageLimit),
      totalItems: totalItems,
    };
  } catch (error) {
    logger.error('getTotalUnitByCourse error:', error);
    throw new APIError(500, 'Internal server error');
  }
}

export async function checkUnitLink(id) {
  try {
    return await Unit.countDocuments({
    clone: id
  });
  } catch (error) {
    logger.error('getTotalUnitByCourse error:', error);
    throw new APIError(500, 'Internal server error');
  }
}

export async function getSlideShareIframe(query) {
  try {
    return await fetchData(`https://www.slideshare.net/api/oembed/2?url=${query.link}&format=json`);
  } catch (error) {
    logger.error('getTotalUnitByCourse error:', error);
    throw new APIError(500, 'Internal server error');
  }
}

/**
 * clone unit data
 * @param oldId
 * @param newId
 * @returns {Promise<boolean>}
 */
export async function duplicateUnitData(oldId, newId) {
  try {
    const promises = await Promise.all([
      Unit.findById(oldId),
      Unit.findById(newId)
    ]);
    const oldUnit = promises?.[0] || {};
    const newUnit = promises?.[1] || {};
    if (!oldUnit) {
      return Promise.reject(new APIError(403, [
        {
          msg: 'Unit clone not found',
          param: 'unitCloneNotFound',
        },
      ]));
    }
    if (!newUnit) {
      return Promise.reject(new APIError(403, [
        {
          msg: 'New unit not found',
          param: 'newUnitNotFound'
        },
      ]));
    }
    switch (newUnit.type) {
      case UNIT_TYPE.SURVEY:
        return await cloneUnitSurvey(oldId, newId, newUnit.course);
      case UNIT_TYPE.TEST:
        return await cloneUnitTest(oldId, newId, newUnit.course);
      default:
        return;
    }
  } catch (error) {
    logger.error('duplicateUnitData error:', error);
    throw error;
  }
}
/**
 * clone course data
 * @param oldId
 * @param newId
 * @returns {Promise<boolean>}
 */
export async function duplicateCourseData(oldId, newId, unitsId) {
  try {
    const promises = await Promise.all([
      Course.findById(oldId),
      Course.findById(newId)
    ]);
    const oldCourse = promises?.[0] || {};
    const newCourse = promises?.[1] || {};
    if (!oldCourse) {
      return Promise.reject(new APIError(403, [
        {
          msg: 'Course clone not found',
          param: 'courseCloneNotFound',
        },
      ]));
    }
    if (!newCourse) {
      return Promise.reject(new APIError(403, [
        {
          msg: 'New course not found',
          param: 'newCourseNotFound'
        },
      ]));
    }
    const units = await Unit.find({ course: oldId });
    if (units?.length) {
      await Promise.all(units.map(async (unit) => {
        if (unitsId.indexOf(unit._id.toString()) !== -1) {
          const newUnit = await Unit.create({
            title: unit.title,
            user: unit.user,
            course: newId,
            type: unit.type,
            order: unit.order,
            complete: unit.complete,
            content: unit.content,
            typeData: unit.typeData,
            link: unit.link,
            file: unit.file,
            clone: unit.clone,
            config: unit.config
          });
          switch (unit.type) {
            case UNIT_TYPE.SURVEY:
              await cloneUnitSurvey(unit._id, newUnit._id, newId);
              break;
            case UNIT_TYPE.TEST:
              await cloneUnitTest(unit._id, newUnit._id, newId);
              break;
            default:
              break;
          }
        }
      }));
    }
    return true;
  } catch (error) {
    logger.error('duplicateUnitData error:', error);
    throw error;
  }
}
/**
 * clone course data
 * @param oldId
 * @param newId
 * @returns {Promise<boolean>}
 */
export async function duplicateCourseDataImport(oldId, newId) {
  try {
    const promises = await Promise.all([
      Course.findById(oldId),
      Course.findById(newId)
    ]);
    const oldCourse = promises?.[0] || {};
    const newCourse = promises?.[1] || {};
    if (!oldCourse) {
      return Promise.reject(new APIError(403, [
        {
          msg: 'Course clone not found',
          param: 'courseCloneNotFound',
        },
      ]));
    }
    if (!newCourse) {
      return Promise.reject(new APIError(403, [
        {
          msg: 'New course not found',
          param: 'newCourseNotFound'
        },
      ]));
    }
    const units = await Unit.find({ course: oldId });
    if (units?.length) {
      await Promise.all(units.map(async (unit) => {
        const newUnit = await Unit.create({
          title: unit.title,
          user: unit.user,
          course: newId,
          type: unit.type,
          order: unit.order,
          complete: unit.order,
          content: unit.content,
          typeData: unit.typeData,
          link: unit.link,
          file: unit.file,
          submission: unit.submission,
          submissionType: unit.submissionType,
          clone: unit.clone,
          config: unit.config
        });
        switch (unit.type) {
          case UNIT_TYPE.SURVEY:
            await cloneUnitSurvey(unit._id, newUnit._id, newId);
            break;
          case UNIT_TYPE.TEST:
            await cloneUnitTest(unit._id, newUnit._id, newId);
            break;
          default:
            break;
        }
      }));
    }
    return true;
  } catch (error) {
    logger.error('duplicateUnitData error:', error);
    throw error;
  }
}
export async function cloneUnitSurvey(oldId, newId, course) {
  try {
    const results = await UnitSurvey.find({ unit: oldId });
    if (results?.length) {
      await Promise.all(results.map(async (result) => {
        await UnitSurvey.create({
          survey: result.survey,
          unit: newId,
          course,
          order: result.order
        });
      }));
    }
    return true;
  } catch (error) {
    logger.error('cloneUnitSurvey error:', error);
    throw error;
  }
}

export async function cloneUnitTest(oldId, newId, course) {
  try {
    const results = await UnitQuestion.find({ unit: oldId });
    if (results?.length) {
      await Promise.all(results.map(async (result) => {
        await UnitQuestion.create({
          question: result.question,
          unit: newId,
          course,
          order: result.order,
          weight: result.weight,
        });
      }));
    }
    return true;
  } catch (error) {
    logger.error('cloneUnitTest error:', error);
    throw error;
  }
}

/**
 * Get course units by course id
 * @param course the course id
 * @param params
 * @param params.rowPerPage
 * @param params.firstId
 * @param params.lastId
 * @param params.textSearch
 * @param {string[]} params.types
 * @returns {Promise<*>}
 */
export async function getCourseUnits(course, params) {
  try {
    const {
      rowPerPage,
      firstId,
      lastId,
      textSearch,
      types,
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
      course: course,
      status: UNIT_STATUS.ACTIVE,
    };
    if (types?.length !== 0) {
      queryConditions.type = { $in: types };
    }
    if (typeof textSearch === 'string' && textSearch) {
      queryConditions.title = { $regex: validSearchString(textSearch) };
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
    const units = await Unit.find(queryConditions, '_id title').sort(sortCondition).limit(pageLimit);
    if (firstId) {
      return units.reverse();
    }
    return units;
  } catch (error) {
    logger.error(`UnitService getCourseUnits error: ${error}`);
    throw error;
  }
}

/**
 *
 * @param data
 * @param {string} data.id
 * @param {string} role
 * @param {string} auth.id
 * @returns {Promise<void>}
 */
export async function undoGradeSubmission(data, role, auth) {
  try {
    if (![USER_ROLES.ADMIN, USER_ROLES.INSTRUCTOR].includes(role)) {
      return Promise.reject(new APIError(401, [
        {
          msg: 'Permission denied',
          param: 'permissionDenied',
        },
      ]));
    }
    const submission = await UserUnit.findById(data?.id).lean();
    if (!submission) {
      return Promise.reject(new APIError(403, [
        {
          msg: 'Submission not found',
          param: 'submissionNotFound',
        },
      ]));
    }
    if (submission?.status !== USER_UNIT_STATUS.RESUBMIT) {
      return Promise.reject(new APIError(403, [
        {
          msg: 'You can\'t undo re-submit submission',
          param: 'cantUndoResubmit',
        },
      ]));
    }
    const dataUpdate = {
      status: USER_UNIT_STATUS.PENDING,
      'result.grade': '',
      'result.comment': '',
      'result.attachment': '',
      'result.reasonReset': '',
      'result.changer': auth?._id,
    };
    await UserUnit.updateOne(
      {
        _id: submission._id
      }, {
        $set: dataUpdate,
      }
    );
    return true;
  } catch (error) {
    logger.error(`UnitService undoGradeSubmission error: ${error}`);
    throw error;
  }
}

/**
 *
 * @param auth
 * @param {string} auth._id
 * @param query
 * @param {string} query.id
 * @param {number} query.page
 * @param {number} query.skip
 * @param {number} query.limit
 * @param {string} role
 * @returns {Promise<void>}
 */
export async function getTrackingResultUnit(auth, query, role) {
  try {
    const condition = {
      unit: query.id
    };
    if (role === USER_ROLES.LEARNER) {
      condition.user = auth._id;
    }
    if (role !== USER_ROLES.LEARNER && query?.user) {
      condition.user = query.user;
    }
    const promise = [
      UserUnitTracking.countDocuments(condition),
      UserUnitTracking.find(condition)
        .populate([
          {
            path: 'user',
            select: '_id fullName avatar'
          },
          {
            path: 'changer',
            select: '_id fullName avatar'
          }
        ])
        .limit(query.limit)
        .skip(query.skip)
        .sort({ _id: -1 })
    ];
    const data = await Promise.all(promise);
    return {
      data: await getMetaDataTrackingResultUnit(data[1]),
      currentPage: query.page,
      totalPage: Math.ceil(data[0] / query.limit),
      totalItems: data[0],
    };
  } catch (error) {
    logger.error(`UnitService getTrackingResultUnit error: ${error}`);
    throw error;
  }
}

export async function updateTitleUnitLive(userEvent) {
  try {
    if (userEvent?.type === USER_EVENT_TYPE.WEBINAR) {
      const condition = {
        unit: userEvent?.unit,
        status: USER_EVENT_STATUS.ACTIVE
      };
      const userEvents = await UserEvent.countDocuments(condition);
      if (userEvents === 1) {
        const unit = await Unit.findById(userEvent?.unit);
        if (unit?.title !== userEvent?.name) {
          unit.title = userEvent?.name;
          await unit.save();
        }
      }
    }
  } catch (error) {
    logger.error(`UnitService updateTitleUnitLive error: ${error}`);
    throw error;
  }
}


export async function getMetaDataTrackingResultUnit(data) {
  try {
    const isArray = Array.isArray(data);
    if (!isArray) {
      data = [data];
    }
    const promise = data?.map(async item => {
      item = item?.toJSON();
      let listFile = item?.result?.file;
      if (listFile) {
        const isArrayFile = Array.isArray(listFile);
        if (!isArrayFile) {
          listFile = [listFile];
        }
        const promiseFile = listFile?.map(async (fileId) => {
          const file = await UserFile.findById(fileId);
          return file?.toJSON();
        })
        listFile = await Promise.all(promiseFile);
        item.result.file = isArrayFile ? listFile : listFile?.[0];
      }
      return item;
    })
    const dataResult = await Promise.all(promise);
    return isArray ? dataResult : dataResult?.[0];
  } catch (error) {
    logger.error(`UnitService getMetaDataTrackingResultUnit error: ${error}`);
    throw error;
  }
}
