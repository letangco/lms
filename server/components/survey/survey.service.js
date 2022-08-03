import logger from '../../util/logger';
import APIError from '../../util/APIError';
import Survey from './survey.model';
import UnitSurvey from '../unit/unitSurvey.model';
import {
  UNIT_STATUS,
  DEFAULT_PAGE_LIMIT,
  MAX_PAGE_LIMIT,
  QUESTION_STATUS,
  QUESTION_TYPE, EVENT_LOGS, EVENT_LOGS_TYPE,
} from '../../constants';
import { getUser } from '../user/user.service';
import UserSurvey from '../survey/userSurvey.model';
import {createLogs} from "../logs/logs.service";
/**
 * Create Survey
 * @param auth
 * @param auth.email
 * @param auth.fullName
 * @param data
 * @returns {Promise.<boolean>}
 */
export async function createSurvey(auth, data) {
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
      const survey = await Survey.create({
        title: data.title,
        user: auth._id,
        course: data.course,
        content: data.content,
        type: data.type,
        status: UNIT_STATUS.ACTIVE,
        data: data?.data || [],
        config: data?.config || {},
        tag: data.tag,
        feedback: data.feedback
      });
      return survey;
    } catch (error) {
      logger.error('createSurvey error:', error);
      return Promise.reject(new APIError(500, 'Internal server error'));
    }
  } catch (error) {
    logger.error('createSurvey error:', error);
    throw new APIError(500, 'Internal server error');
  }
}
export async function deleteUserSurveyByUnit(id) {
  try {
    await UnitSurvey.deleteMany({
      unit: id
    });
    return true;
  } catch (error) {
    logger.error('deleteUserSurveyByUnit error:', error);
    return Promise.reject(new APIError(500, 'Internal server error'));
  }
}

export async function resetSurveyUserUnit(id, user) {
  try {
    const result = await UserSurvey.deleteMany({
      unit: id,
      user
    });
    return result;
  } catch (error) {
    logger.error('resetSurveyUserUnit error:', error);
    return Promise.reject(new APIError(500, 'Internal server error'));
  }
}

export async function userGetSurvey(id) {
  try {
    const survey = await Survey.findOne({
      _id: id,
      status: QUESTION_STATUS.ACTIVE
    }).lean();
    if (!survey) {
      return {};
    }
    return {
      _id: survey._id,
      title: survey.title,
      content: survey.content,
      typeAnswer: survey?.config?.requiredAnswer === true ? 'RADIO' : 'CHECKBOX',
      data: survey.data,
      type: survey.type,
      tag: survey.tag
    };
  } catch (error) {
    logger.error('userGetSurvey error:', error);
    return Promise.reject(new APIError(500, 'Internal server error'));
  }
}
export async function getTotalSurveyByUnit(id) {
  try {
    return await UnitSurvey.countDocuments({
      unit: id
    }).lean();
  } catch (error) {
    logger.error('getTotalSurveyByUnit error:', error);
    return Promise.reject(new APIError(500, 'Internal server error'));
  }
}
// export async function resetSurveyUserUnit(id) {
//   try {
//     return await UserSu.countDocuments({
//       unit: id
//     }).lean();
//   } catch (error) {
//     logger.error('getTotalSurveyByUnit error:', error);
//     return Promise.reject(new APIError(500, 'Internal server error'));
//   }
// }
/**
 * update Survey
 * @param id
 * @param auth
 * @param auth.email
 * @param auth.fullName
 * @param data
 * @returns {Promise.<boolean>}
 */

export async function updateSurvey(id, auth, data) {
  try {
    const promises = await Promise.all([
      getUser(auth._id),
      getSurveyById(id),
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
          msg: 'Survey not found',
          param: 'surveyNotFound',
        },
      ]));
    }
    try {
      await Survey.updateOne(
        { _id: id },
        { $set:
          {
            title: data.title,
            content: data.content,
            data: data.data,
            config: data.config,
            tag: data.tag,
            feedback: data.feedback
          }
        }
      );
      return true;
    } catch (error) {
      logger.error('updateSurvey error:', error);
      return Promise.reject(new APIError(500, 'Internal server error'));
    }
  } catch (error) {
    logger.error('updateSurvey error:', error);
    throw new APIError(500, 'Internal server error');
  }
}

export async function getSurveyById(id) {
  try {
    return await Survey.findById(id).lean();
  } catch (error) {
    logger.error('getSurveyById error:', error);
    return Promise.reject(new APIError(500, 'Internal server error'));
  }
}

export async function getSurvey(id, auth) {
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
    return await Survey.findById(id).lean();
  } catch (error) {
    logger.error('getSurveyById error:', error);
    return Promise.reject(new APIError(500, 'Internal server error'));
  }
}

/**
 * getSurveys
 * @param query
 * @param auth
 * @param auth.email
 * @param auth.fullName
 * @returns {Promise.<boolean>}
 */
export async function getSurveys(query, auth) {
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
    const queryConditions = {};
    if (typeof query.textSearch === 'string') {
      const textSearch = query.textSearch.replace(/\\/g, String.raw`\\`);
      const regExpKeyWord = new RegExp(textSearch, 'i');
      queryConditions.title = { $regex: regExpKeyWord };
    }
    if (query.course) {
      queryConditions.course = query.course;
    }
    if (query.unit) {
      const surveysId = await UnitSurvey.distinct('survey', { unit: query.unit }).lean();
      queryConditions._id = { $nin: surveysId };
    }
    if (query.status) {
      queryConditions.status = query.status;
    }
    if (query.type) {
      queryConditions.type = query.type;
    }
    const totalItems = await Survey.countDocuments(queryConditions);
    const data = await Survey.find(queryConditions)
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
    logger.error(' getSurveys error:', error);
    throw new APIError(500, 'Internal server error');
  }
}
export async function deleteSurvey(id, auth) {
  try {
    const promises = await Promise.all([
      getUser(auth._id),
      getSurveyById(id),
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
          msg: 'Survey not found',
          param: 'surveyNotFound',
        },
      ]));
    }
    await Promise.all([
      Survey.deleteOne({ _id: id }),
      UnitSurvey.deleteMany({ survey: id }),
    ])
  } catch (error) {
    logger.error('deleteSurvey error:', error);
    return Promise.reject(new APIError(500, 'Internal server error'));
  }
}

export async function getUserSurvey(data) {
  try {
    return await UserSurvey.findOne({
      unit: data.unit,
      survey: data.survey,
      user: data.user
    }).lean();
  } catch (error) {
    logger.error('getUserSurvey error:', error);
    return Promise.reject(new APIError(500, 'Internal server error'));
  }
}
export async function addResultSurvey(data) {
  try {
    const survey = await Survey.findById(data.id).lean();
    if (!survey) {
      return Promise.reject(new APIError(403, [
        {
          msg: 'Survey not found',
          param: 'surveyNotFound',
        },
      ]));
    }
    if (data.checked) {
      switch (survey.type) {
        case QUESTION_TYPE.MTC:
          if (!data.data?.length || data?.data.indexOf(true) === -1) {
            return Promise.reject(new APIError(403, [{
              msg: 'Answer not found',
              param: 'answerNotFound',
            }]));
          }
          break;
        case QUESTION_TYPE.FREETEXT:
          if (!data.data) {
            return Promise.reject(new APIError(403, [{
              msg: 'Answer not found',
              param: 'answerNotFound',
            }]));
          }
          break;
        default:
          break;
      }
    }
    return await UserSurvey.create({
      survey: survey._id,
      title: survey.title,
      content: survey.content,
      user: data.user,
      unit: data.unit,
      course: data.course,
      type: survey.type,
      data: survey.data,
      result: survey.type === QUESTION_TYPE.FREETEXT ? data.data : '',
      resultAnswers: survey.type === QUESTION_TYPE.MTC ? data.data : [],
      config: survey.config
    });
  } catch (error) {
    throw error;
  }
}
