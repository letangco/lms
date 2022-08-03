import mongoose from 'mongoose';
import logger from '../../util/logger';
import APIError from '../../util/APIError';
import Unit from '../unit/unit.model';
import UserUnit from '../userUnit/userUnit.model';
import CountUnit from '../userUnit/countUnit.model';
import UnitQuestion from '../unit/unitQuestion.model';
import UnitSurvey from '../unit/unitSurvey.model';
import { getUser } from '../user/user.service';
import { getCourse, getCourseById } from '../course/course.service';
import { getUserFile, getFile, getFilesByIds, getFileById } from '../file/file.service';
import {
  userGetQuestion,
  getTotalQuestionByUnit,
  addResultQuestion,
  getUserQuestion,
  getQuestionById,
  resetQuestionUserUnit
} from '../question/question.service';
import {
  userGetSurvey,
  getTotalSurveyByUnit,
  resetSurveyUserUnit,
  addResultSurvey,
  getUserSurvey
} from '../survey/survey.service';
import { getUnitByConditions, getUnitById } from '../unit/unit.service';
import {
  UNIT_STATUS,
  UNIT_TYPE,
  USER_UNIT_STATUS,
  COMPLETE_TYPE,
  RESULT_TYPE,
  QUESTION_TYPE,
  USER_QUESTION_STATUS,
  COURSE_RULES_AND_PATH_SHOW_UNITS,
  SESSION_USER_MAPPING_UNIT,
  NOTIFICATION_EVENT,
  USER_ROLES,
  USER_STATUS,
  UNIT_STATUS_SUBMISSION,
  UNIT_STATUS_SUBMISSION_TYPE,
  USER_GROUP_TYPE,
  COURSE_USER_STATUS,
  USER_TYPE_STATUS,
  STATUS_FILES,
  USER_FILE,
  EVENT_LOGS, EVENT_LOGS_TYPE,
  COURSE_STATUS, REDIS_KEYS
} from '../../constants';
import UserQuestion from '../question/userQuestion.model';
import UserSurvey from '../survey/userSurvey.model';
import { getSessionsByUnit } from '../classroomSession/classroomSession.service';
import {
  getCourseUserRole,
  getUserCourseByConditions,
  getUserCoursesByConditions
} from '../courseUser/courseUser.service';
import { getRulesAndPathShowUnitsOption } from '../courseRulesAndPath/courseRulesAndPath.service';
import { getObjectId } from '../../helpers/string.helper';
import { formatNotification, getNotificationByKey } from '../notification/notificaition.service';
import * as UserService from '../user/user.service';
import { getUserGroupCourseByConditions } from '../courseGroup/courseGroup.service';
import { getUnitIsLiving } from '../userEvent/userEvent.service';
import { checkUserTypeByConditions, getUserType } from '../userType/userType.service';
import { createLogs } from '../logs/logs.service';
import Redis from '../../util/Redis';

/**
 * Get list unit ids that user can learn
 * @param user
 * @param course
 * @returns {Promise<*>}
 */
async function getCanLearnUnits(user, course) {
  try {
    // Latest completed unit
    const latestCompletedUnit = await UserUnit.aggregate([
      {
        $match: {
          user: getObjectId(user),
          course: getObjectId(course),
          status: USER_UNIT_STATUS.COMPLETED,
        },
      },
      {
        $lookup: {
          from: 'units',
          as: 'unit',
          let: { unitId: '$unit' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$_id', '$$unitId'] },
                    { $eq: ['$status', UNIT_STATUS.ACTIVE] },
                  ]
                }
              }
            },
          ],
        },
      },
      {
        $unwind: '$unit',
      },
      {
        $sort: { 'unit.order': -1 }
      },
      {
        $skip: 0,
      },
      {
        $limit: 1,
      },
    ]);
    const latestCompletedUnitOrder = latestCompletedUnit?.[0]?.unit?.order ?? 0;
    const nextUnit = await Unit
      .find({ course, status: UNIT_STATUS.ACTIVE, type: { $ne: UNIT_TYPE.SECTION }, order: { $gt: latestCompletedUnitOrder } })
      .sort({ order: 1 }).skip(0).limit(1);
    const nextUnitOrder = nextUnit?.[0]?.order ?? 0;
    // Can learn units
    const units = await Unit.find({ course, order: { $lte: nextUnitOrder } });
    return units.map(unit => unit._id.toString());
  } catch (error) {
    throw error;
  }
}

export async function userGetUnitResults(unitUser, auth) {
  try {
    const userQuestions = await UserQuestion.find({
      user: auth?._id,
      course: unitUser.course,
      unit: unitUser.unit
    }).lean();
    const configs = unitUser?.config || {};
    const results = await Promise.all(userQuestions.map(async (question) => {
      if (question.status === USER_QUESTION_STATUS.COMPLETED
        && configs?.completion?.hideAnswers === true) {
        return null;
      }
      const data = {
        _id: question._id,
        type: question.type,
        points: question.points
      };
      if (configs?.completion?.showAnswers
      || (configs?.completion?.showCorrect === 'ALWAYS'
          || (configs?.completion?.showCorrect === 'PASSED'
            && unitUser.status === USER_UNIT_STATUS.COMPLETED))) {
        data.typeResult = question.typeResult;
        data.title = question.title;
        if (question?.type !== QUESTION_TYPE.FILLTHEGAP){
          data.content = question.content;
        }
        if (question?.type === QUESTION_TYPE.FILLTHEGAP) {
          data.contentHTML =question.contentHTML;
        }
      }
      if (configs?.completion?.showCorrect === 'ALWAYS'
        || (configs?.completion?.showCorrect === 'PASSED'
        && unitUser.status === USER_UNIT_STATUS.COMPLETED
      )) {
        data.data = question.data;
        if (question?.type === QUESTION_TYPE.FREETEXT) {
          data.totalPoints = question?.config?.points;
          data.answers = question?.config?.answers;
        }
      }
      if (configs?.completion?.showAnswers) {
        data.result = question.result;
        data.dataContent = question.dataContent || '';
        if (data?.data?.length) {
          data.resultAnswers = question.resultAnswers;
        }
      }
      if (configs?.completion?.labels) {
        data.status = question.status;
      }
      data.resultAnswers = question.resultAnswers;
      if (question?.type === QUESTION_TYPE.IMPORTMTC) {
        let correct = 0; let inCorrect = 0;
        if (question?.config?.file) {
          const file = await getFileById(question.config.file);
          data.file = file;
        }
        question?.resultAnswers.map( item => {
          if (item?.correct) {
            correct++;
          } else {
            inCorrect++;
          }
        });
        data.correct = correct;
        data.inCorrect = inCorrect;
        if (question?.config?.percent) {
          data.percent = question.config.percent;
        }
      }
      return data;
    }));
    return results.filter(result => result);
  } catch (error) {
    logger.error('getUnit error:', error);
    throw error;
  }
}
export async function userGetUnitSurvey(unitUser, auth) {
  try {
    const userSurveys = await UserSurvey.find({
      user: auth?._id,
      course: unitUser.course,
      unit: unitUser.unit
    });
    const results = userSurveys.map(survey => ({
        _id: survey._id,
        result: survey.result,
        resultAnswers: survey.resultAnswers,
        title: survey.title,
        content: survey.content,
        type: survey.type,
        data: survey.data,
        dataContent: survey.dataContent,
      }));
    return results;
  } catch (error) {
    logger.error('userGetUnitSurvey error:', error);
    throw error;
  }
}
export async function getUnit(id, auth) {
  try {
    const promises = await Promise.all([
      Unit.findOne({
        _id: id
      }).lean(),
      UserUnit.findOne({
        unit: id,
        user: auth?._id,
        unitStatus: { $nin: [UNIT_STATUS.INACTIVE, UNIT_STATUS.DELETED, UNIT_STATUS.DRAFT, UNIT_STATUS.COURSEDELETED] }
      }).lean()
    ]);
    const _unit = promises[0];
    const userUnit = promises[1];
    if (!_unit) {
      return Promise.reject(new APIError(403, [
        {
          msg: 'Unit not found',
          param: 'unitNotFound',
        },
      ]));
    }
    const promisesCheckedCreator = await Promise.all([
      checkUserTypeByConditions({
        _id: auth?.type,
        status: USER_TYPE_STATUS.ACTIVE
      }),
      getCourseById(_unit?.course)
    ]);
    const userRole = promisesCheckedCreator[0];
    const courseInfo = promisesCheckedCreator[1];
    if ([USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN].indexOf(userRole) === -1
        && courseInfo?.creator.toString() !== auth?._id.toString()
    ) {
      if (courseInfo.status !== COURSE_STATUS.ACTIVE) {
        return Promise.reject(new APIError(403, [
          {
            msg: 'Unit not found',
            param: 'unitNotFound',
          },
        ]));
      }
    }
    const isUser = await getUserCourseByConditions({
      course: _unit?.course,
      user: auth?._id,
      status: { $in: [COURSE_USER_STATUS.ACTIVE, COURSE_USER_STATUS.COMPLETED, COURSE_USER_STATUS.IN_PROGRESS] }
    });
    if (!isUser && [USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN].indexOf(userRole) === -1
      && courseInfo?.creator.toString() !== auth?._id.toString()) {
      return Promise.reject(new APIError(401, [
        {
          msg: 'Permission denied',
          param: 'permissionDenied',
        },
      ]));
    }
    const unit = await getMetaDataUnit(_unit, auth, [USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN].indexOf(userRole) !== -1);
    const showUnits = await getRulesAndPathShowUnitsOption(_unit.course);
    const showUnitsInSequentialOrder = showUnits === COURSE_RULES_AND_PATH_SHOW_UNITS.IN_SEQUENTIAL_ORDER;
    const canLearnUnits = await getCanLearnUnits(auth?._id, _unit.course);
    if (showUnitsInSequentialOrder) {
      unit.canLearn = canLearnUnits.indexOf(unit?._id?.toString()) !== -1;
    }
    if (unit.submissions === UNIT_STATUS_SUBMISSION.GROUP) {
      const userGroup = await getUserGroupCourseByConditions({
        user: auth?._id,
        course: unit.course
      });
      if (userGroup) {
        if (unit.submissionsType === UNIT_STATUS_SUBMISSION_TYPE.USER) {
          unit.canLearn = canLearnUnits.indexOf(unit?._id?.toString()) !== -1;
        } else if (userGroup.type === USER_GROUP_TYPE.CAPTAIN) {
          unit.canLearn = canLearnUnits.indexOf(unit?._id?.toString()) !== -1;
        } else {
          unit.canLearn = false;
        }
      } else {
        unit.canLearn = false;
      }
    }
    unit.userRole = await getCourseUserRole(_unit?.course, auth?._id);
    if ([UNIT_TYPE.CLASSROOM, UNIT_TYPE.LIVESTREAMING].indexOf(_unit?.type) !== -1) {
      unit.events = await getSessionsByUnit(auth, id);
      return unit;
    }
    if (userUnit) {
      unit.status = userUnit.status;
      switch (_unit?.type) {
        case UNIT_TYPE.ASSIGNMENT:
          unit.assignment = userUnit?.result;
          if (userUnit?.result?.file) {
            unit.assignment.file = await getUserFile(userUnit?.result?.file);
          }
          if (userUnit?.result?.attachment) {
            unit.assignment.attachment = await getUserFile(userUnit?.result?.attachment);
          }
          break;
        case UNIT_TYPE.TEST:
          unit.results = await userGetUnitResults(userUnit, auth);
          unit.config = await getUnitTestConfig(userUnit, auth);
          if (userUnit.config?.completion?.score) {
            unit.points = userUnit.points;
          }
          if (userUnit.config?.security?.type === 'SNAPSHOT') {
            unit.snapshot = await getUserFile(userUnit.snapshot);
          }
          if (unit.config?.stats) {
            const stats = await UserUnit.aggregate(
              [
                {
                  $match: {
                    unit: mongoose.Types.ObjectId(id),
                    points: {
                      $gt: userUnit?.points || 0
                    }
                  }
                },
                {
                  $count: 'scores'
                }
              ]
            );
            unit.stats = stats?.length ? stats[0].scores + 1 : 1;
            // unit. = stats?.length ? stats[0].scores + 1 : 1;
            const countUnit = await CountUnit.findOne({
              unit: id,
              user: auth?._id
            });
            if (countUnit) {
              unit.start_time = countUnit.start_time;
              unit.end_time = countUnit.end_time;
            }
            unit.totalUsers = await UserUnit.countDocuments({
              unit: id,
              user: auth?._id
            });
          }
          break;
        case UNIT_TYPE.SURVEY:
          if (userUnit?.config?.showAnswer) {
            unit.results = await userGetUnitSurvey(userUnit, auth);
          }
          break;
        default:
          const configs = _unit?.config || {};
          if (_unit?.type === UNIT_TYPE.TEST) {
            const results = {};
            results.message = configs?.description || '';
            results.duration = parseFloat(configs?.duration) || 0;
            results.completion = configs?.completion || {};
            if (configs?.security) {
              results.security = configs?.security?.type;
            }
            if (configs?.behavior) {
              results.behavior = configs?.behavior;
            }
            unit.config = results;
          }
          break;
      }
    } else {
      const configs = _unit?.config || {};
      if (_unit?.type === UNIT_TYPE.TEST) {
        const results = {};
        results.message = configs?.description || '';
        results.duration = parseFloat(configs?.duration) || 0;
        results.completion = configs?.completion || {};
        if (configs?.security) {
          results.security = configs?.security?.type;
        }
        if (configs?.behavior) {
          results.behavior = configs?.behavior;
        }
        unit.config = results;
      }
    }
    return unit;
  } catch (error) {
    logger.error('getUnit error:', error);
    throw error;
  }
}
export async function getUnitTestConfig(userTested, auth) {
  try {
    const count = await CountUnit.findOne({
      user: auth?._id,
      unit: userTested.unit
    });
    const configs = userTested?.config || {};

    const results = {
      repetitions: true,
      message: configs?.description || ''
    };
    if (count) {
      const repetitions = configs?.repetitions;
      if (!repetitions || !repetitions.status) {
        results.repetitions = false;
      } else {
        if (repetitions.maximum <= count.count) {
          results.repetitions = false;
        } else {
          results.repetitionsNo = repetitions.maximum - count.count;
          if (repetitions.type === 'NOTPASSED'
            && userTested.status !== USER_UNIT_STATUS.INACTIVE) {
            results.repetitions = false;
          }
        }
      }
      if (userTested.status === USER_UNIT_STATUS.INACTIVE) {
        results.message = configs?.messNotPass || '';
      } else if (userTested.status === USER_UNIT_STATUS.COMPLETED) {
        results.message = configs?.messPassed || '';
      }
      results.score = configs?.completion?.score ? configs.completion.score : false;
      results.stats = configs?.completion?.stats ? configs.completion.stats : false;
    }
    results.duration = parseFloat(configs?.duration) || 0;
    results.completion = configs?.completion ?? {};
    if (configs?.security) {
      results.security = configs?.security?.type;
    }
    if (configs?.behavior) {
      results.behavior = configs?.behavior;
    }
    results.score = configs?.completion?.score;
    if (configs?.completion?.score) {
      results.scores = configs.score || 0;
    }
    return results;
  } catch (error) {
    logger.error('getUnitTestConfig error:', error);
    throw error;
  }
}
export async function resetUnitResult(id, auth) {
  try {
    const promises = await Promise.all([
      getUser(auth?._id),
      Unit.findOne({
        _id: id,
        status: UNIT_STATUS.ACTIVE
      }).lean(),
      UserUnit.findOne({
        unit: id,
        user: auth?._id
      })
    ]);
    if (!promises[0]) {
      return Promise.reject(new APIError(403, [
        {
          msg: 'User not found',
          param: 'userNotFound',
        },
      ]));
    }
    const promise = [];
    if (promises[2]?.type === UNIT_TYPE.TEST) {
      const configs = promises[2]?.config;
      const count = await CountUnit.findOne({
        user: auth?._id,
        unit: id
      });
      if (count) {
        const repetitions = configs?.repetitions;
        if (!repetitions || !repetitions.status || repetitions.maximum <= count.count
          || (repetitions?.type === 'NOTPASSED' && promises[2]?.status !== USER_UNIT_STATUS.INACTIVE)) {
          return Promise.reject(new APIError(403, [
            {
              msg: 'You can\'t reset unit result',
              param: 'cannotResetUnit',
            },
          ]));
        }
      }
      promise.push(
        resetQuestionUserUnit(id, auth?._id)
      );
      promise.push(
        CountUnit.updateOne({
          unit: id,
          user: auth?._id
        },
          {
          $unset: {
            start_time: 1,
            end_time: 1,
          }
        })
      );
      promise.push(
          createLogs({
            event: EVENT_LOGS.USER_TEST_RESET,
            type: EVENT_LOGS_TYPE.REMOVE,
            user: auth?._id,
            data: {
              unit: id
            }
          })
      );
    }
    if (promises[2]?.type === UNIT_TYPE.ASSIGNMENT && promises[2]?.status !== USER_UNIT_STATUS.PENDING) {
      return Promise.reject(new APIError(403, [
        {
          msg: 'You can\'t reset unit result',
          param: 'cannotResetUnit',
        },
      ]));
    }
    promise.push(
      UserUnit.deleteMany({
        unit: id,
        user: auth?._id
      })
    );
    if (promises[1].type === UNIT_TYPE.SURVEY) {
      promise.push(
        resetSurveyUserUnit(id, auth?._id)
      );
    }
    if (promises[1].type === UNIT_TYPE.ASSIGNMENT) {
      promise.push(
        createLogs({
          event: EVENT_LOGS.USER_ASSIGNMENT_RESET,
          type: EVENT_LOGS_TYPE.REMOVE,
          user: auth?._id,
          data: {
            unit: id
          }
        })
      );
    }
    await Promise.all(promise);
    return true;
  } catch (error) {
    logger.error('resetUnitResult error:', error);
    throw error;
  }
}

export async function deleteUserUnitByUnit(id) {
  try {
    await UserUnit.updateMany({
      unit: id
    }, {
     $set: {
            unitStatus: UNIT_STATUS.DELETED
          }
    });
    return true;
  } catch (error) {
    logger.error('deleteUserUnitByUnit error:', error);
    throw error;
  }
}
export async function inactiveUserUnitByUnit(id) {
  try {
    await UserUnit.updateMany({
      unit: id
    }, {
 $set: {
        unitStatus: UNIT_STATUS.INACTIVE
      }
});
    return true;
  } catch (error) {
    logger.error('deleteUserUnitByUnit error:', error);
    throw error;
  }
}
export async function activeUserUnitByUnit(id) {
  try {
    await UserUnit.updateMany({
      unit: id,
      unitStatus: UNIT_STATUS.INACTIVE
    }, {
 $set: {
        unitStatus: UNIT_STATUS.ACTIVE
      }
});
    return true;
  } catch (error) {
    logger.error('deleteUserUnitByUnit error:', error);
    throw error;
  }
}
export async function submitUnitQuestion(query, auth, data) {
  try {
    let { id, question, next, questionLink, skip, autoSubmit } = query;
    next = parseInt(next);
    const promises = await Promise.all([
      getUnitById(id)
    ]);
    if (!promises[0]) {
      return Promise.reject(new APIError(403, [
        {
          msg: 'Unit not found',
          param: 'unitNotFound',
        },
      ]));
    }
    const userUnit = await UserUnit.findOne({
      unit: id,
      user: auth?._id
    });
    if (userUnit) {
      return Promise.reject(new APIError(403, [
        {
          msg: 'You completed unit.',
          param: 'yourComplete',
        },
      ]));
    }
    await addResultQuestion({
      id: question,
      skip: promises[0]?.config?.behavior?.nextQuestion ? skip : false,
      autoSubmit,
      questionLink,
      data: data.data,
      unit: id,
      course: promises[0].course,
      user: auth._id,
      typeResult: RESULT_TYPE.CONTENT,
      checked: promises[0]?.config?.behavior?.checkAnswer || false
    });
    const questions = await UnitQuestion.find({
      unit: id
    }).sort({ order: 1 }).lean();
    if (next && questions[next - 1]?.question && !autoSubmit) {
      if (!questions?.length) {
        return Promise.reject(new APIError(403, [
          {
            msg: 'Unit question not found',
            param: 'unitQuestionNotFound',
          },
        ]));
      }
      let userQuestion = {};
      let nextQuestion = {};
      if (questions[next - 1]?.question) {
        userQuestion = await getUserQuestion({
          user: auth?._id,
          unit: id,
          question: questions[next - 1]?.question || {}
        });
        nextQuestion = await userGetQuestion(questions[next - 1].question);
      }
      let resultQuestions = nextQuestion.type === QUESTION_TYPE.FREETEXT ? '' : [];
      if (userQuestion) {
        resultQuestions = userQuestion.type === QUESTION_TYPE.FREETEXT ? userQuestion.dataContent : userQuestion.result;
      }
      const count = await CountUnit.findOne({
        user: auth?._id,
        unit: id,
      });
      return {
        question: nextQuestion,
        resultQuestions,
        unit: id,
        unitQuestion: questions?.[next - 1]?._id || '',
        course: promises[0].course,
        behavior: promises[0]?.config?.behavior || '',
        total: questions.length,
        start_time: count?.start_time || '',
        current: next
      };
    }
    const errorQuestion = []; let pointsCorrect = 0; let totalPoints = 0;
    await Promise.all(questions.map(async (question, index) => {
      const userQuestion = await UserQuestion.findOne({
        question: question.question,
        course: question.course,
        unit: question.unit,
        user: auth?._id
      });
      totalPoints += question.weight;
      if (userQuestion?.status === USER_QUESTION_STATUS.COMPLETED) {
        pointsCorrect += userQuestion.weight;
      }
      if (!userQuestion) {
        errorQuestion.push(index + 1);
      }
    }));
    if (errorQuestion.length && !autoSubmit) {
      return Promise.reject(new APIError(403, [
        {
          msg: `You have not completed questions: ${errorQuestion.join(', ')}`,
          param: 'notCompletedQuestions',
        },
      ]));
    }
    const pass = pointsCorrect * 100 / totalPoints;
    let status = false;
    if (promises[0]?.config?.score) {
      if (pass >= promises[0]?.config?.score) {
        status = true;
      }
    } else if (pointsCorrect === totalPoints) {
      status = true;
    }
    await CountUnit.updateOne({
      user: auth?._id,
      unit: id,
    }, {
     $set: {
            end_time: Date.now()
          }
    });
    const result = {
      title: promises[0].title,
      course: promises[0]?.course,
      user: auth?._id,
      unit: promises[0]._id,
      type: promises[0].type,
      complete: promises[0].complete,
      content: promises[0].content,
      typeData: promises[0].typeData,
      link: promises[0].link,
      file: promises[0].file,
      config: promises[0].config,
      points: pass,
      status: status ? USER_QUESTION_STATUS.COMPLETED : USER_QUESTION_STATUS.FAILED
    };
    if (promises[0]?.config?.security?.type === 'SNAPSHOT') {
      result.snapshot = await Redis.get(`${REDIS_KEYS.SNAPSHOT}-${auth?._id}-${promises[0]._id}`);
    }
    const info = await UserUnit.create(result);
    await Redis.del(`${REDIS_KEYS.SNAPSHOT}-${auth?._id}-${promises[0]._id}`);
    sendNotificationToInstructor(info);
    return info;
  } catch (error) {
    logger.error('submitUnitQuestion error:', error);
    throw error;
  }
}
export async function sendNotificationToInstructor(userUnit) {
  try {
    const users = await getUserCoursesByConditions({
      course: userUnit.course,
      userRole: USER_ROLES.INSTRUCTOR,
      status: { $in: [COURSE_USER_STATUS.ACTIVE, COURSE_USER_STATUS.COMPLETED, COURSE_USER_STATUS.IN_PROGRESS] }
    });
    if (users?.length) {
      const key = userUnit.type === 'TEST' ? NOTIFICATION_EVENT.USER_COMPLETED_TEST
        : userUnit.type === 'SURVEY' ? NOTIFICATION_EVENT.USER_COMPLETED_SURVEY
          : userUnit.type === 'ASSIGNMENT' ? NOTIFICATION_EVENT.USER_COMPLETED_ASSIGNMENT
            : userUnit.type === 'SCORM' ? NOTIFICATION_EVENT.USER_COMPLETED_SCORM
              : '';

      if (!key) return true;
      const notifications = await getNotificationByKey(key);
      if (JSON.stringify(notifications) !== '{}') {
        const courseInfo = await getCourseById(userUnit.course);
        await Promise.all(users.map(async (user) => {
          const userInfo = await UserService.getUserByConditions({ _id: user.user, status: USER_STATUS.ACTIVE });
          if (!userInfo) {
            return;
          }
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
              info: {
                unit: userUnit.unit,
                type: userUnit.type,
                _id: userUnit._id
              },
              email: userInfo.email
            });
          }
        }));
      }
    }
  } catch (error) {
    logger.error('sendNotificationToInstructor error:', error);
    throw error;
  }
}
export async function submitUnitSurvey(query, auth, data) {
  try {
    let { id, survey, next } = query;
    next = parseInt(next);
    const promises = await Promise.all([
      getUnitById(id)
    ]);
    if (!promises[0]) {
      return Promise.reject(new APIError(403, [
        {
          msg: 'Unit not found',
          param: 'unitNotFound',
        },
      ]));
    }
    const userUnit = await UserUnit.findOne({
      unit: id,
      user: auth?._id
    });
    if (userUnit) {
      return Promise.reject(new APIError(403, [
        {
          msg: 'You completed unit.',
          param: 'yourComplete',
        },
      ]));
    }
    await addResultSurvey({
      id: survey,
      data: data.data,
      unit: id,
      course: promises[0].course,
      user: auth._id,
      checked: promises[0]?.config?.preventContinue ? promises[0].config.preventContinue : false
    });
    createLogs({
      event: EVENT_LOGS.USER_SURVEY_COMPLETED,
      type: EVENT_LOGS_TYPE.ADD,
      user: auth?._id,
      data: {
        unit: id
      }
    });
    // Get next or pre question for unit when user complete
    const surveys = await UnitSurvey.find({
      unit: id
    }).sort({ order: 1 }).lean();
    if (next && surveys[next - 1]?.survey) {
      if (!surveys?.length) {
        return Promise.reject(new APIError(403, [
          {
            msg: 'Unit survey not found',
            param: 'unitSurveyNotFound',
          },
        ]));
      }
      const userSurvey = await getUserSurvey({
        user: auth?._id,
        unit: id,
        survey: surveys[next - 1].survey
      });
      const nextSurvey = await userGetSurvey(surveys[next - 1].survey);
      let resultSurveys = nextSurvey.type === QUESTION_TYPE.FREETEXT ? '' : [];
      if (userSurvey) {
        resultSurveys = userSurvey.type === QUESTION_TYPE.FREETEXT ? userSurvey.result : userSurvey.resultAnswers;
      }
      return {
        survey: nextSurvey,
        resultSurveys,
        unit: id,
        unitSurvey: surveys[next - 1]._id,
        course: promises[0].course,
        typeAnswer: promises[0]?.config?.selectedAnswer === true ? 'RADIO' : 'CHECKBOX',
        total: surveys.length,
        current: next
      };
    }
    const errorSurvey = [];
    await Promise.all(surveys.map(async (survey, index) => {
      const userSurvey = await UserSurvey.findOne({
        survey: survey.survey,
        course: survey.course,
        unit: survey.unit,
        user: auth?._id
      });
      if (!userSurvey) {
        errorSurvey.push(index + 1);
      }
    }));
    if (errorSurvey.length) {
      return Promise.reject(new APIError(403, [
        {
          msg: `You have not completed surveys: ${errorSurvey.join(', ')}`,
          param: 'notCompletedSurveys',
        },
      ]));
    }
    const info = await UserUnit.create({
      title: promises[0].title,
      course: promises[0]?.course,
      user: auth?._id,
      unit: promises[0]._id,
      type: promises[0].type,
      complete: promises[0].complete,
      content: promises[0].content,
      typeData: promises[0].typeData,
      link: promises[0].link,
      file: promises[0].file,
      config: promises[0].config,
      status: USER_QUESTION_STATUS.COMPLETED
    });
    sendNotificationToInstructor(info);
    return info;
  } catch (error) {
    logger.error('submitUnitSurvey error:', error);
    throw error;
  }
}
export async function startUnitQuestion(query, auth, data) {
  try {
    const unit = await getUnitByConditions({
      _id: query.id,
      status: UNIT_STATUS.ACTIVE
    });
    if (!unit) {
      return Promise.reject(new APIError(403, [
        {
          msg: 'Unit not found',
          param: 'unitNotFound',
        },
      ]));
    }
    if (unit.type !== UNIT_TYPE.TEST) {
      return Promise.reject(new APIError(403, [
        {
          msg: 'Unit question not found',
          param: 'unitQuestionNotFound',
        },
      ]));
    }
    const promises = await Promise.all([
      checkUserTypeByConditions({
        _id: auth?.type,
        status: USER_TYPE_STATUS.ACTIVE
      }),
      getCourseById(unit?.course),
      getUserCourseByConditions({
        course: unit?.course,
        user: auth?._id,
        status: { $in: [COURSE_USER_STATUS.ACTIVE, COURSE_USER_STATUS.COMPLETED, COURSE_USER_STATUS.IN_PROGRESS] }
      })
    ]);
    const userRole = promises[0];
    const courseInfo = promises[1];
    const isUser = promises[2];
    if (!isUser
        && [USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN].indexOf(userRole) === -1
        && courseInfo?.creator.toString() !== auth?._id.toString()) {
      return Promise.reject(new APIError(401, [
        {
          msg: 'Permission denied',
          param: 'permissionDenied',
        },
      ]));
    }
    const userUnit = await UserUnit.findOne({
      unit: query.id,
      user: auth?._id
    });
    if (userUnit) {
      return Promise.reject(new APIError(403, [
        {
          msg: 'You completed unit.',
          param: 'yourComplete',
        },
      ]));
    }
    const config = unit?.config;
    switch (config?.security?.type) {
      case 'PASSWORD':
        if (config?.security?.data !== data.password) {
          return Promise.reject(new APIError(403, [
            {
              msg: 'Wrong password',
              param: 'wrongPassword',
            },
          ]));
        }
        break;
      case 'SNAPSHOT':
        if (!data.id) {
          return Promise.reject(new APIError(403, [
            {
              msg: 'Photo is required',
              param: 'photoIsRequired',
            },
          ]));
        }
        await Redis.del(`${REDIS_KEYS.SNAPSHOT}-${auth?._id}-${query.id}`);
        await Redis.set(`${REDIS_KEYS.SNAPSHOT}-${auth?._id}-${query.id}`, data.id);
        break;
      default:
        break;
    }
    const questions = await UnitQuestion.find({
      unit: unit._id
    }).sort({ order: 1 }).lean();
    if (!questions?.length) {
      return Promise.reject(new APIError(403, [
        {
          msg: 'Unit question not found',
          param: 'unitQuestionNotFound',
        },
      ]));
    }
    let question = {};
    let index = 0;
    for (let i = 0; i < questions.length; i++) {
      const userQuestion = await getUserQuestion({
        user: auth?._id,
        unit: query.id,
        question: questions[i].question
      });
      if (!userQuestion) {
        question = await userGetQuestion(questions[i].question);
        index = i;
        if (question) break;
      }
    }
    let count = await CountUnit.findOne({
      user: auth?._id,
      unit: unit._id,
    });
    if (count) {
      await CountUnit.updateOne({
        user: auth?._id,
        unit: unit._id,
      }, {
        $set: {
          count: count?.start_time ? count.count : count.count + 1,
          start_time: count?.start_time ? count?.start_time : Date.now()
        }
      });
      count = await CountUnit.findOne({
        user: auth?._id,
        unit: unit._id,
      });
    } else {
      count = await CountUnit.create({
        user: auth?._id,
        unit: unit._id,
        count: 1,
        start_time: Date.now()
      });
    }
    return {
      question,
      unit: unit._id,
      unitQuestion: questions[index]._id,
      course: unit.course,
      behavior: config?.behavior || {},
      total: questions.length,
      start_time: count?.start_time || '',
      current: index + 1
    };
  } catch (error) {
    logger.error('startUnitQuestion error:', error);
    throw error;
  }
}
export async function startUnitSurvey(query, auth) {
  try {
    const unit = await getUnitByConditions({
      _id: query.id,
      status: UNIT_STATUS.ACTIVE
    });
    const isUser = await getUserCourseByConditions({
      course: unit?.course,
      user: auth?._id,
      status: { $in: [COURSE_USER_STATUS.ACTIVE, COURSE_USER_STATUS.COMPLETED, COURSE_USER_STATUS.IN_PROGRESS] }
    });
    const userRole = await checkUserTypeByConditions({
      _id: auth?.type,
      status: USER_TYPE_STATUS.ACTIVE
    });
    if (!isUser && [USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN].indexOf(userRole) === -1) {
      return Promise.reject(new APIError(401, [
        {
          msg: 'Permission denied',
          param: 'permissionDenied',
        },
      ]));
    }
    if (!unit) {
      return Promise.reject(new APIError(403, [
        {
          msg: 'Unit not found',
          param: 'unitNotFound',
        },
      ]));
    }
    if (unit.type !== UNIT_TYPE.SURVEY) {
      return Promise.reject(new APIError(403, [
        {
          msg: 'Unit survey not found',
          param: 'unitSurveyNotFound',
        },
      ]));
    }
    const userUnit = await UserUnit.findOne({
      unit: query.id,
      user: auth?._id
    });
    if (userUnit) {
      return Promise.reject(new APIError(403, [
        {
          msg: 'You completed unit.',
          param: 'yourComplete',
        },
      ]));
    }
    const surveys = await UnitSurvey.find({
      unit: unit._id
    }).sort({ order: 1 }).lean();
    if (!surveys?.length) {
      return Promise.reject(new APIError(403, [
        {
          msg: 'Unit survey not found',
          param: 'unitSurveyNotFound',
        },
      ]));
    }
    let survey = {}; let index = 0;
    for (let i = 0; i < surveys.length; i++) {
      const userSurvey = await getUserSurvey({
        user: auth?._id,
        unit: query.id,
        survey: surveys[i].survey
      });
      if (!userSurvey) {
        survey = await userGetSurvey(surveys[i].survey);
        index = i;
        if (survey) break;
      }
    }
    return {
      survey,
      unit: unit._id,
      unitSurvey: surveys[index]._id,
      course: unit.course,
      config: unit?.config || {},
      total: surveys.length,
      current: index + 1
    };
  } catch (error) {
    logger.error('startUnitSurvey error:', error);
    throw error;
  }
}
export async function getMetaDataUnit(unit, auth, userRole = false) {
  try {
    let result = {
      _id: unit?._id || '',
      title: unit.title || '',
      content: unit.content || '',
      type: unit.type || '',
      course: unit.course || '',
      submissions: unit.submissions || UNIT_STATUS_SUBMISSION.USER,
      submissionsType: unit.submissionsType || UNIT_STATUS_SUBMISSION_TYPE.USER,
      complete: unit.complete || {},
    };
    if (unit?.complete?.type === COMPLETE_TYPE.QUESTION) {
      unit.complete.question = await userGetQuestion(unit?.complete?.data?._id);
    }
    switch (unit.type) {
      case UNIT_TYPE.CONTENT:
      case UNIT_TYPE.WEBPAGE:
      case UNIT_TYPE.DOCUMENT:
      case UNIT_TYPE.AUDIO:
      case UNIT_TYPE.VIDEO:
      case UNIT_TYPE.IFRAME:
      case UNIT_TYPE.ASSIGNMENT:
        return result;
      case UNIT_TYPE.TEST:
        result.totalQuesiton = await getTotalQuestionByUnit(unit._id);
        return result;
      case UNIT_TYPE.SURVEY:
        result.totalSurvey = await getTotalSurveyByUnit(unit._id);
        result.description = unit.config?.description ? unit.config.description : '';
        result.preventContinue = unit.config?.preventContinue ? unit.config.preventContinue : false;
        return result;
      case UNIT_TYPE.LINK:
        result = getUnit(unit.clone, auth);
        result.unitLink = unit._id;
        return result;
      case UNIT_TYPE.SCORM:
        result.file = await getFile(unit?.file, auth);
        return result;
      case UNIT_TYPE.LIVESTREAMING:
      case UNIT_TYPE.CLASSROOM:
      case UNIT_TYPE.SECTION:
        return result;
      case UNIT_TYPE.FILES:
        const {
         userType, files, users, time, groups
        } = unit?.config;
        result.time = time;
        if (time?.start && Date.now() < new Date(time?.start).getTime()) {
          result.statusFile = STATUS_FILES.UPCOMING;
        } else if (time?.end && Date.now() > new Date(time?.end).getTime()) {
          result.statusFile = STATUS_FILES.EXPIRED;
        } else if (userType === USER_FILE.CUSTOM
          && (!users?.length || users?.indexOf(auth?._id?.toString()) === -1)
          && !userRole) {
          result.statusFile = STATUS_FILES.PERMISSION;
        } else if (userType === USER_FILE.GROUP && !userRole) {
          const checked = await getUserGroupCourseByConditions({
            group: { $in: groups },
            user: auth?._id
          });
          if (!checked) {
            result.statusFile = STATUS_FILES.PERMISSION;
          }
        }
        result.files = await getFilesByIds(files);
        if (result.statusFile && result?.files?.length) {
          result.files = result.files.map( file => {
            return {
              _id: file._id,
              share: file.share,
              title: file.title,
              type: file.type,
              originalname: file.originalname,
              filename: file.filename,
              mimetype: file.mimetype,
              size: file.size,
              status: file.status,
              createdAt: file.createdAt
            };
          });
        }
        return result;
      default:
        break;
    }
  } catch (error) {
    logger.error('getMetaDataUnit error:', error);
    throw new APIError(500, 'Internal server error');
  }
}

export async function getCourseUnitsByUser(id, auth) {
  try {
    const isUser = await getUserCourseByConditions({
      course: id,
      user: auth._id,
      status: { $in: [COURSE_USER_STATUS.ACTIVE, COURSE_USER_STATUS.COMPLETED, COURSE_USER_STATUS.IN_PROGRESS] }
    });
    if (!isUser) {
      return Promise.reject(new APIError(403, [
        {
          msg: 'Course not found',
          param: 'courseNotFound',
        },
      ]));
    }
    return await getCourseUnits(id, auth, isUser);
  } catch (error) {
    logger.error('getCourseUnitsByUser error:', error);
    throw error;
  }
}
export async function getCourseUnits(id, auth, isUser = {}, userRole = '') {
  try {
    const promises = await Promise.all([
      getUser(auth?._id),
      getCourse(id)
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
    const showUnits = await getRulesAndPathShowUnitsOption(id);
    const showUnitsInSequentialOrder = showUnits === COURSE_RULES_AND_PATH_SHOW_UNITS.IN_SEQUENTIAL_ORDER;
    let canLearnUnits = [];
    if (showUnitsInSequentialOrder && (!isUser || isUser.status !== COURSE_USER_STATUS.COMPLETED)) {
      canLearnUnits = await getCanLearnUnits(auth?._id, id);
    }
    const units = await Unit.aggregate([
      {
        $match: {
          course: getObjectId(id),
          status: UNIT_STATUS.ACTIVE,
        }
      },
      {
        $lookup: {
          from: 'userunits',
          as: 'userUnits',
          let: { unitId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$unit', '$$unitId'] },
                    { $eq: ['$user', getObjectId(auth?._id)] },
                  ]
                }
              }
            },
          ],
        },
      },
      {
        $sort: { order: 1 },
      },
    ]);
    let results = [];
    if (units?.length) {
      results = await Promise.all(units.map(async (unit) => {
        const userUnitStatus = unit?.userUnits?.[0]?.status ?? '';
        const data = {
          _id: unit._id,
          title: unit.title,
          type: unit.type,
          course: unit.course,
          countLink: unit.countLink,
          order: unit.order,
          status: userUnitStatus,
        };
        if (unit?.type === UNIT_TYPE.LIVESTREAMING) {
          data.isLiving = !!await getUnitIsLiving(unit._id);
        }
        if (showUnitsInSequentialOrder) {
          data.canLearn = isUser?.status === COURSE_USER_STATUS.COMPLETED
                || [USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN].indexOf(userRole) !== -1
                  ? true : canLearnUnits.indexOf(unit?._id?.toString()) !== -1;
          // if (unit.submissions !== UNIT_STATUS_SUBMISSION.GROUP) {
          //   data.canLearn = canLearnUnits.indexOf(unit?._id?.toString()) !== -1;
          // } else {
          //   const userGroup = await getUserCourseByConditions({
          //     user: auth?._id,
          //     course: id
          //   });
          //   if (userGroup) {
          //     if (unit.submissions === UNIT_STATUS_SUBMISSION_TYPE.USER) {
          //       data.canLearn = canLearnUnits.indexOf(unit?._id?.toString()) !== -1;
          //     } else if (userGroup.type === USER_GROUP_TYPE.CAPTAIN) {
          //       data.canLearn = canLearnUnits.indexOf(unit?._id?.toString()) !== -1;
          //     }
          //   }
          // }
        }
        if (data.type === UNIT_TYPE.ASSIGNMENT) {
          data.submissions = await UserUnit.findOne({
            unit: unit._id,
            user: auth?._id
          });
        }
        return data;
      }));
    }
    return {
      _id: promises[1]._id,
      name: promises[1].name,
      data: results
    };
  } catch (error) {
    logger.error('getCourseUnit error:', error);
    throw error;
  }
}

export async function completeUnit(id, auth, data) {
  try {
    const unit = await getUnitById(id);
    if (!unit) {
      return Promise.reject(new APIError(403, [
        {
          msg: 'Unit not found',
          param: 'unitNotFound',
        },
      ]));
    }
    const promises = await Promise.all([
      checkUserTypeByConditions({
        _id: auth?.type,
        status: USER_TYPE_STATUS.ACTIVE
      }),
      getCourseById(unit?.course),
      getUserCourseByConditions({
        course: unit?.course,
        user: auth?._id,
        status: { $in: [COURSE_USER_STATUS.ACTIVE, COURSE_USER_STATUS.COMPLETED, COURSE_USER_STATUS.IN_PROGRESS] }
      })
    ]);
    const userRole = promises[0];
    const courseInfo = promises[1];
    const isUser = promises[2];
    if (!isUser && [USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN].indexOf(userRole) === -1
        && courseInfo?.creator.toString() !== auth?._id.toString()) {
      return Promise.reject(new APIError(401, [
        {
          msg: 'Permission denied',
          param: 'permissionDenied',
        },
      ]));
    }
    if (unit.type === UNIT_TYPE.ASSIGNMENT) {
      let info = await UserUnit.findOne({
        user: auth?._id,
        unit: unit._id
      });
      if (!info) {
        info = await UserUnit.create({
          title: unit.title,
          course: unit?.course,
          user: auth?._id,
          unit: unit._id,
          type: unit.type,
          result: {
            content: data.content,
            file: data._id
          },
          complete: unit.complete,
          content: unit.content,
          typeData: unit.typeData,
          link: unit.link,
          file: unit.file,
          config: unit.config,
          status: unit?.complete?.type === COMPLETE_TYPE.UPLOADING_ANSWER ? USER_UNIT_STATUS.COMPLETED : USER_UNIT_STATUS.PENDING
        });
        createLogs({
          event: EVENT_LOGS.USER_ASSIGNMENT_SUBMISSION,
          type: EVENT_LOGS_TYPE.ADD,
          user: auth?._id,
          data: {
            unit: unit._id
          }
        });
      } else {
        if (info?.status !== USER_UNIT_STATUS.RESUBMIT) {
          return Promise.reject(new APIError(403, [
            {
              msg: 'You can\'t submit your answer',
              param: 'cantSubmitAnswer',
            },
          ]));
        }
        info = await UserUnit.updateOne({
          user: auth?._id,
          unit: unit._id
        }, {
        $set: {
          title: unit.title,
          result: {
            content: data.content,
            file: data._id,
            changer: auth?._id,
          },
          complete: unit.complete,
          content: unit.content,
          typeData: unit.typeData,
          link: unit.link,
          file: unit.file,
          config: unit.config,
          status: unit?.complete?.type === COMPLETE_TYPE.UPLOADING_ANSWER ? USER_UNIT_STATUS.COMPLETED : USER_UNIT_STATUS.PENDING,
        } });
        createLogs({
          event: EVENT_LOGS.USER_ASSIGNMENT_RESUBMIT,
          type: EVENT_LOGS_TYPE.ADD,
          user: auth?._id,
          data: {
            unit: unit._id
          }
        });
      }
      sendNotificationToInstructor(info);
      return info;
    } if (unit.type === UNIT_TYPE.SCORM) {
      const info = await UserUnit.create({
        title: unit.title,
        course: unit?.course,
        user: auth?._id,
        unit: unit._id,
        type: unit.type,
        result: data.data,
        complete: unit.complete,
        content: unit.content,
        typeData: unit.typeData,
        link: unit.link,
        file: unit.file,
        config: unit.config,
        status: data.status
      });
      createLogs({
        event: EVENT_LOGS.USER_SCORM_COMPLETED,
        type: EVENT_LOGS_TYPE.COMPLETED,
        user: auth?._id,
        data: {
          unit: unit._id
        }
      });
      sendNotificationToInstructor(info);
      return info;
    }
    if (unit?.complete?.type === COMPLETE_TYPE.QUESTION) {
      const question = await getQuestionById(unit?.complete?.data?._id);
      if (question?.type === QUESTION_TYPE.RANDOMIZED) {
        if (question.data.indexOf(data.id) === -1) {
          return Promise.reject(new APIError(403, [
            {
              msg: 'Question not found',
              param: 'questionNotFound',
            },
          ]));
        }
      } else {
        if (!data.id || data.id !== unit?.complete?.data?._id) {
          return Promise.reject(new APIError(403, [
            {
              msg: 'Question not found',
              param: 'questionNotFound',
            },
          ]));
        }
      }
      await addResultQuestion({
        id: data.id,
        data: data.data,
        unit: id,
        course: promises[1].course,
        user: auth._id,
        typeResult: RESULT_TYPE.COMPLETE
      });
    }
    return await UserUnit.create({
      title: unit.title,
      course: unit?.course,
      user: auth?._id,
      unit: unit._id,
      type: unit.type,
      complete: unit.complete,
      content: unit.content,
      typeData: unit.typeData,
      link: unit.link,
      file: unit.file,
      config: unit.config
    });
  } catch (error) {
    throw error;
  }
}

export async function updateCompleteUnit(data) {
  try {
    const unit = await getUnitById(data.unit);
    if (!unit) {
      return Promise.reject(new APIError(403, [
        {
          msg: 'Unit not found',
          param: 'unitNotFound',
        },
      ]));
    }
    return await UserUnit.updateOne({
      user: data.user,
        unit: unit._id
      },
      {
 $set: {
      title: unit.title,
      course: unit?.course,
      type: unit.type,
      complete: unit.complete,
      content: unit.content,
      typeData: unit.typeData,
      link: unit.link,
      file: unit.file,
      config: unit.config,
      status: SESSION_USER_MAPPING_UNIT[data.gradeStatus]
    }
}, { upsert: true });
  } catch (error) {
    throw error;
  }
}

/**
 * @param id The course id
 * @param auth
 * @param auth._id
 * @returns {Promise<number>}
 */
export async function getUnitCompleted(id, auth) {
  try {
    const promises = await Promise.all([
      getUser(auth?._id),
      getCourse(id),
      Unit.countDocuments({
        course: id,
        status: UNIT_STATUS.ACTIVE,
        type: { $ne: UNIT_TYPE.SECTION }
      }),
      UserUnit.aggregate([
        {
          $match: {
            course: id,
            user: auth?._id,
            status: USER_UNIT_STATUS.COMPLETED,
          },
        },
        {
          $lookup: {
            from: 'units',
            localField: 'unit',
            foreignField: '_id',
            as: 'unit'
          }
        },
        {
          $project: {
            _id: 1,
            unit: { $arrayElemAt: ['$unit', 0] },
          }
        },
        {
          $match: { 'unit.status': UNIT_STATUS.ACTIVE },
        },
        { $group: { _id: null, totalItems: { $sum: 1 } } },
      ]),
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
    // const isUser = await getUserCourseByConditions({
    //   course: promises[1]?.course,
    //   user: auth?._id,
    //   status: { $in: [COURSE_USER_STATUS.ACTIVE, COURSE_USER_STATUS.COMPLETED, COURSE_USER_STATUS.IN_PROGRESS] }
    // });
    // const userRole = await checkUserTypeByConditions({
    //   _id: auth?.type,
    //   status: USER_TYPE_STATUS.ACTIVE
    // });
    // if (!isUser && [USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN].indexOf(userRole) === -1) {
    //   return Promise.reject(new APIError(401, [
    //     {
    //       msg: 'Permission denied',
    //       param: 'permissionDenied',
    //     },
    //   ]));
    // }
    if (!promises[2]) {
      return 0;
    }
    const numUserUnitCompleted = promises[3]?.[0]?.totalItems ?? 0;
    if (!numUserUnitCompleted) {
      return 0;
    }
    return Math.round(numUserUnitCompleted * 100 / promises[2]);
  } catch (error) {
    logger.error('getUnitCompleted error:', error);
    throw error;
  }
}

/**
 * @param {object} user
 * @param {objectId} user._id
 * @param {objectId[]} units
 * @returns {Promise<boolean>}
 */
export async function isAllUnitsCompleted(user, units) {
  try {
    if (!units || units?.length === 0) {
      return true;
    }
    const numUnitsCompleted = await UserUnit.countDocuments({
      unit: { $in: units },
      user: user?._id,
      status: USER_UNIT_STATUS.COMPLETED,
    });
    return numUnitsCompleted === units.length;
  } catch (error) {
    logger.error('UserCourseService isAllUnitsCompleted error:', error);
    throw error;
  }
}

/**
 * @param {object} user
 * @param {objectId} user._id
 * @param {objectId} unit
 * @returns {Promise<boolean>}
 */
export async function isUnitCompleted(user, unit) {
  try {
    if (!unit) {
      return true;
    }
    const unitCompleted = await UserUnit.findOne({
      unit: unit,
      user: user?._id,
      status: USER_UNIT_STATUS.COMPLETED,
    });
    return !!unitCompleted;
  } catch (error) {
    logger.error('UserCourseService isUnitCompleted error:', error);
    throw error;
  }
}

/**
 * @param id The course id
 * @param auth
 * @param auth._id
 * @returns {Promise<{unitsCompleted: *, totalUnits: *}|number>}
 */
export async function countCourseUnitsAndUnitsUserCompleted(id, auth) {
  try {
    const promises = await Promise.all([
      getUser(auth?._id),
      getCourse(id),
      Unit.countDocuments({
        course: id,
        status: UNIT_STATUS.ACTIVE,
        type: { $ne: UNIT_TYPE.SECTION }
      }),
      UserUnit.aggregate([
        {
          $match: {
            course: id,
            user: auth?._id,
            status: USER_UNIT_STATUS.COMPLETED,
          },
        },
        {
          $lookup: {
            from: 'units',
            localField: 'unit',
            foreignField: '_id',
            as: 'unit'
          }
        },
        {
          $project: {
            _id: 1,
            unit: { $arrayElemAt: ['$unit', 0] },
          }
        },
        {
          $match: { 'unit.status': UNIT_STATUS.ACTIVE },
        },
        { $group: { _id: null, totalItems: { $sum: 1 } } },
      ]),
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
    const numUserUnitCompleted = promises[3]?.[0]?.totalItems ?? 0;
    return {
      totalUnits: promises[2] ? promises[2] : 0,
      unitsCompleted: numUserUnitCompleted,
    };
  } catch (error) {
    logger.error('countCourseUnitsAndUnitsUserCompleted error:', error);
    throw error;
  }
}

