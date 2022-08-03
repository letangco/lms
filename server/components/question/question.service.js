import logger from '../../util/logger';
import APIError from '../../util/APIError';
import Question from './question.model';
import UnitQuestion from '../unit/unitQuestion.model';
import UserQuestion from './userQuestion.model';
import { getUser } from '../user/user.service';
import {
  UNIT_STATUS, DEFAULT_PAGE_LIMIT, MAX_PAGE_LIMIT, QUESTION_TYPE, QUESTION_STATUS, RESULT_TYPE, CONDITION_TYPE,
  USER_QUESTION_STATUS, ANSWER_TYPE, USER_ROLES
} from '../../constants';
import { validSearchString } from '../../helpers/string.helper';
import { getFileById } from '../file/file.service';
import { getUserTypeByConditions } from '../userType/userType.service';

/**
 * Create Question
 * @param auth
 * @param auth.email
 * @param auth.fullName
 * @param data
 * @returns {Promise.<boolean>}
 */
export async function createQuestion(auth, data) {
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
      if (data.type === QUESTION_TYPE.FILLTHEGAP) {
        let answers = data.content.match(/{(.*?)}/g);
        if (!answers?.length) {
          return Promise.reject(new APIError(403, [
            {
              msg: 'You must specify at least two possible answers',
              param: 'specifyTwoAnswers',
            },
          ]));
        }
        let checked = false, validation = true;
        let multiAnswers = [];
        answers.map((answer, index) => {
          let answerType;
          const type =  answer?.substring(1)?.slice(0, -1)?.split('-');
          if (type?.length !== 2) {
            validation = false;
          } else {
            answerType = ANSWER_TYPE[type[0]?.trim()?.toLowerCase()]
            if (!answerType) {
              validation = false;
            }
          }
          answer = type[1]?.trim()?.split('|');
          if (!checked && answer?.length > 1) {
            checked = true;
          }
          if (!checked && index > 0) {
            checked = true;
          }
          if (answer?.length === 1 && answerType == ANSWER_TYPE.select) {
            multiAnswers.push(answer[0]);
          }
        });
        if (!validation) {
          return Promise.reject(new APIError(403, [
            {
              msg: 'Content is malformed',
              param: 'contentMalformed',
            },
          ]));
        }
        if (!checked) {
          return Promise.reject(new APIError(403, [
            {
              msg: 'You must specify at least two possible answers',
              param: 'specifyTwoAnswers',
            },
          ]));
        }
        let contentAnswers = data.content;
        let multiAnswersHTML = '<select class="selectedAnswer"><option>-</option>';
        multiAnswers = shuffleArr(multiAnswers);
        multiAnswers.map((answer) => {
          multiAnswersHTML += `<option value="${answer}">${answer}</option>`;
        });
        multiAnswersHTML += '</select>';

        const answersData = [];
        answers.forEach((answer) => {
          const type =  answer?.substring(1)?.slice(0, -1)?.split('-');
          const answerType = ANSWER_TYPE[type[0]?.trim()?.toLowerCase()]
          const result = type[1]?.trim()?.split('|');
          answersData.push({
            type: answerType,
            data: [...result]
          });
          if (answerType == ANSWER_TYPE.select) {
            if (result?.length === 1) {
              contentAnswers = contentAnswers.replace(answer, multiAnswersHTML);
            } else {
              const multiAnswer = shuffleArr(result);
              let multiAnswerHTML = '<select class="selectedAnswer"><option>-</option>';
              multiAnswer.map((item) => {
                multiAnswerHTML += `<option value="${item}">${item}</option>`;
              });
              multiAnswerHTML += '</select>';
              contentAnswers = contentAnswers.replace(answer, multiAnswerHTML);
            }
          } else if (answerType === ANSWER_TYPE.input) {
            let multiAnswerHTML = '<input type="text" value="" class="selectedAnswer"/>';
            contentAnswers = contentAnswers.replace(answer, multiAnswerHTML);
          }
        });
        const question = await Question.create({
          title: data.title,
          user: auth._id,
          course: data.course,
          content: data.content,
          type: data.type,
          status: UNIT_STATUS.ACTIVE,
          data: answersData,
          contentHTML: contentAnswers,
          tag: data.tag,
          feedback: data.feedback
        });
        return question;
      }
      const question = await Question.create({
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
      return question;
    } catch (error) {
      logger.error('createQuestion error:', error);
      return Promise.reject(new APIError(500, 'Internal server error'));
    }
  } catch (error) {
    logger.error('createQuestion error:', error);
    throw new APIError(500, 'Internal server error');
  }
}
/**
 * update Question
 * @param id
 * @param auth
 * @param auth.email
 * @param auth.fullName
 * @param data
 * @returns {Promise.<boolean>}
 */
export async function updateQuestion(id, auth, data) {
  try {
    const promises = await Promise.all([
      getUser(auth._id),
      getQuestionById(id),
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
          msg: 'Question not found',
          param: 'questionNotFound',
        },
      ]));
    }
    try {
      let question = promises[1];
      if (question.type === QUESTION_TYPE.FILLTHEGAP) {
        let answers = data.content.match(/{(.*?)}/g);
        if (!answers?.length) {
          return Promise.reject(new APIError(403, [
            {
              msg: 'You must specify at least two possible answers',
              param: 'specifyTwoAnswers',
            },
          ]));
        }
        let checked = false, validation = true;
        let multiAnswers = [];

        answers.map((answer, index) => {
          let answerType;
          const type =  answer?.substring(1)?.slice(0, -1)?.split('-');
          if (type?.length !== 2) {
            validation = false;
          } else {
            answerType = ANSWER_TYPE[type[0]?.trim()?.toLowerCase()]
            if (!answerType) {
              validation = false;
            }
          }
          answer = type[1]?.trim()?.split('|');
          if (!checked && answer?.length > 1) {
            checked = true;
          }
          if (!checked && index > 0) {
            checked = true;
          }
          if (answer?.length === 1 && answerType == ANSWER_TYPE.select) {
            multiAnswers.push(answer[0]);
          }
        });
        if (!validation) {
          return Promise.reject(new APIError(403, [
            {
              msg: 'Content is malformed',
              param: 'contentMalformed',
            },
          ]));
        }
        if (!checked) {
          return Promise.reject(new APIError(403, [
            {
              msg: 'You must specify at least two possible answers',
              param: 'specifyTwoAnswers',
            },
          ]));
        }
        let contentAnswers = data.content;
        let multiAnswersHTML = '<select class="selectedAnswer"><option>-</option>';
        multiAnswers = shuffleArr(multiAnswers);
        multiAnswers.map((answer) => {
          multiAnswersHTML += `<option value="${answer}">${answer}</option>`;
        });
        multiAnswersHTML += '</select>';

        const answersData = [];
        answers.forEach((answer) => {
          const type =  answer?.substring(1)?.slice(0, -1)?.split('-');
          const answerType = ANSWER_TYPE[type[0]?.trim()?.toLowerCase()]
          const result = type[1]?.trim()?.split('|');
          answersData.push({
            type: answerType,
            data: [...result]
          });
          if (answerType == ANSWER_TYPE.select) {
            if (result?.length === 1) {
              contentAnswers = contentAnswers.replace(answer, multiAnswersHTML);
            } else {
              const multiAnswer = shuffleArr(result);
              let multiAnswerHTML = '<select class="selectedAnswer"><option>-</option>';
              multiAnswer.map((item) => {
                multiAnswerHTML += `<option value="${item}">${item}</option>`;
              });
              multiAnswerHTML += '</select>';
              contentAnswers = contentAnswers.replace(answer, multiAnswerHTML);
            }
          } else if (answerType === ANSWER_TYPE.input) {
            let multiAnswerHTML = '<input type="text" class="selectedAnswer" value=""/>';
            contentAnswers = contentAnswers.replace(answer, multiAnswerHTML);
          }
        });
        await Question.updateOne(
          { _id: id },
          { $set:
              {
                title: data.title,
                content: data.content,
                data: answersData,
                contentHTML: contentAnswers,
                tag: data.tag,
                feedback: data.feedback
              }
          }
        );
        return true;
      }
      await Question.updateOne(
        { _id: id },
        { $set:
          {
            title: data.title,
            content: data.content,
            data: data?.data || [],
            config: data?.config || {},
            tag: data.tag,
            feedback: data.feedback
          }
        }
      );
      return true;
    } catch (error) {
      logger.error('updateQuestion error:', error);
      return Promise.reject(new APIError(500, 'Internal server error'));
    }
  } catch (error) {
    logger.error('updateQuestion error:', error);
    throw new APIError(500, 'Internal server error');
  }
}

/**
 * get Question FILLTHEGAP content
 * @param content
 * @returns {Promise.<boolean>}
 */
export function getContentFillTheGap(content) {
  try {
    let answers = content.match(/{(.*?)}/g);
    let multiAnswers = [];
    answers.map((answer, index) => {
      let answerType;
      const type =  answer?.substring(1)?.slice(0, -1)?.split('-');
      answerType = ANSWER_TYPE[type[0]?.trim()?.toLowerCase()]
      answer = type[1]?.trim()?.split('|');
      if (answer?.length === 1 && answerType == ANSWER_TYPE.select) {
        multiAnswers.push(answer[0]);
      }
    });
    let contentAnswers = content;
    let multiAnswersHTML = '<select class="selectedAnswer"><option>-</option>';
    multiAnswers = shuffleArr(multiAnswers);
    multiAnswers.map((answer) => {
      multiAnswersHTML += `<option value="${answer}">${answer}</option>`;
    });
    multiAnswersHTML += '</select>';
    answers.forEach((answer) => {
      const type =  answer?.substring(1)?.slice(0, -1)?.split('-');
      const answerType = ANSWER_TYPE[type[0]?.trim()?.toLowerCase()]
      const result = type[1]?.trim()?.split('|');
      if (answerType == ANSWER_TYPE.select) {
        if (result?.length === 1) {
          contentAnswers = contentAnswers.replace(answer, multiAnswersHTML);
        } else {
          const multiAnswer = shuffleArr(result);
          let multiAnswerHTML = '<select class="selectedAnswer"><option>-</option>';
          multiAnswer.map((item) => {
            multiAnswerHTML += `<option value="${item}">${item}</option>`;
          });
          multiAnswerHTML += '</select>';
          contentAnswers = contentAnswers.replace(answer, multiAnswerHTML);
        }
      } else if (answerType === ANSWER_TYPE.input) {
        let multiAnswerHTML = '<input type="text" class="selectedAnswer" value=""/>';
        contentAnswers = contentAnswers.replace(answer, multiAnswerHTML);
      }
    });
    return contentAnswers;
  } catch (error) {
    logger.error('updateQuestion error:', error);
    throw new APIError(500, 'Internal server error');
  }
}

export async function getQuestionById(id) {
  try {
    return await Question.findById(id).lean();
  } catch (error) {
    logger.error('getQuestionById error:', error);
    return Promise.reject(new APIError(500, 'Internal server error'));
  }
}

export async function resetQuestionUserUnit (id, user) {
  try {
    return await UserQuestion.deleteMany({
      unit: id,
      user
    })
  } catch (error) {
    logger.error('getQuestionById error:', error);
    return Promise.reject(new APIError(500, 'Internal server error'));
  }
}

export async function userGetQuestion(id) {
  try {
    const question = await Question.findOne({
      _id: id,
      status: QUESTION_STATUS.ACTIVE
    }).lean();
    if (!question) {
      return {};
    }
    return await getQuestionMeta(question);
  } catch (error) {
    logger.error('userGetQuestion error:', error);
    return Promise.reject(new APIError(500, 'Internal server error'));
  }
}
export async function getTotalQuestionByUnit(id) {
  try {
    return await UnitQuestion.countDocuments({
      unit: id
    }).lean();
  } catch (error) {
    logger.error('getTotalQuestionByUnit error:', error);
    return Promise.reject(new APIError(500, 'Internal server error'));
  }
}
function shuffleArr(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const rand = Math.floor(Math.random() * (i + 1));
    [array[i], array[rand]] = [array[rand], array[i]];
  }
  return array;
}
// export async function getUserQuestion(data) {
//   try {
//     return await UserQuestion.findOne({
//       unit: data.unit,
//       question: data.question,
//       user: data.user
//     }).lean();
//   } catch (error) {
//     logger.error('getUserQuestion error:', error);
//     return Promise.reject(new APIError(500, 'Internal server error'));
//   }
// }
export async function getUserQuestion(data) {
  try {
    return await UserQuestion.findOne({
      unit: data.unit,
      question: data.question,
      user: data.user
    }).lean();
  } catch (error) {
    logger.error('getUserQuestion error:', error);
    return Promise.reject(new APIError(500, 'Internal server error'));
  }
}
export async function deleteUserQuestionByUnit(id) {
  try {
    await UserQuestion.deleteMany({
      unit: id
    });
    return true;
  } catch (error) {
    logger.error('deleteUserQuestionByUnit error:', error);
    return Promise.reject(new APIError(500, 'Internal server error'));
  }
}
export async function getQuestionMeta(question) {
  try {
    const answers = [];
    const corrects = [];
    switch (question.type) {
      case QUESTION_TYPE.MTC:
        let correct = 0;
        if (question?.data?.length) {
          question.data.map((answer) => {
            answers.push(answer.content);
            if (answer.correct === true) {
              correct++;
            }
          });
        }
        return {
          _id: question._id,
          title: question.title,
          content: question.content,
          typeAnswer: correct === 1 ? 'RADIO' : 'CHECKBOX',
          answers: answers,
          type: question.type,
          tag: question.tag
        };
      case QUESTION_TYPE.IMPORTMTC:
        if (question?.data?.length) {
          question.data = question.data.map((answer) => {
            return answer.questions
          });
        }
        return {
          _id: question._id,
          title: question.title,
          content: question.content,
          file: question?.config?.file? await getFileById(question?.config?.file) : {} ,
          questions: question.data,
          type: question.type,
          tag: question.tag
        };
      case QUESTION_TYPE.FILLTHEGAP:
        return {
          _id: question._id,
          title: question.title,
          content: getContentFillTheGap(question.content),
          type: question.type,
          tag: question.tag
        };
      case QUESTION_TYPE.ORDERING:
        if (question?.data?.length) {
          question.data.map((answer) => {
            answers.push(answer);
          });
        }
        return {
          _id: question._id,
          title: question.title,
          content: question.content,
          type: question.type,
          answers: shuffleArr(answers),
          tag: question.tag
        };
      case QUESTION_TYPE.DRAGDROP:
        if (question?.data?.length) {
          question.data.map((answer) => {
            answers.push(answer.content);
            corrects.push(answer.correct);
          });
        }
        return {
          _id: question._id,
          title: question.title,
          content: question.content,
          type: question.type,
          answers: answers,
          corrects: shuffleArr(corrects),
          tag: question.tag
        };
      case QUESTION_TYPE.FREETEXT:
        return {
          _id: question._id,
          title: question.title,
          type: question.type,
          content: question.content,
          tag: question.tag
        };
      case QUESTION_TYPE.RANDOMIZED:
        if (question?.data) {
          const id = question.data[Math.floor(Math.random() * question.data.length)];
          let detail = await userGetQuestion(id);
          detail.questionLink = question._id;
          return detail;
        }
        return {
        };
      default:
        return {
        };
    }
  } catch (error) {
    logger.error('getQuestionById error:', error);
    return Promise.reject(new APIError(500, 'Internal server error'));
  }
}

export async function getQuestion(id, auth) {
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
    let question = await Question.findById(id).lean();
    if (question && question?.type === QUESTION_TYPE.RANDOMIZED) {
      question.data = await Question.find({
        _id: { $in: question.data }
      })
    } else if (question && question?.type === QUESTION_TYPE.IMPORTMTC) {
      question.config.file = question?.config?.file? await getFileById(question?.config?.file) : {};
    }
    return question
  } catch (error) {
    logger.error('getQuestionById error:', error);
    return Promise.reject(new APIError(500, 'Internal server error'));
  }
}


export async function userGetQuestionCourse(id, auth) {
  try {
    const promises = await Promise.all([
      getUser(auth._id),
      Question.findOne({
        _id: id,
        status: QUESTION_STATUS.ACTIVE
      }).lean()
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
          msg: 'Question not found',
          param: 'questionNotFound',
        },
      ]));
    }
    return await getQuestionMeta(promises[1]);
  } catch (error) {
    logger.error('userGetQuestionCourse error:', error);
    return Promise.reject(new APIError(500, 'Internal server error'));
  }
}

/**
 * getQuestions
 * @param query
 * @param auth
 * @param auth.email
 * @param auth.fullName
 * @returns {Promise.<boolean>}
 */
export async function getQuestions(query, auth) {
  try {
    const userType = await getUserTypeByConditions({ _id: auth.type });
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
      queryConditions.course = { $in: query.course.split(',') };
    }
    if (query.unit) {
      const questionsId = await UnitQuestion.distinct('question', { unit: query.unit }).lean();
      queryConditions._id = { $nin: questionsId };
    }
    if (query.question) {
      const question = await Question.findById(query.question).lean();
      queryConditions._id = { $nin: question.data };
      queryConditions.type = { $ne: QUESTION_TYPE.RANDOMIZED };
    }
    if (query.status) {
      queryConditions.status = query.status;
    }
    if (query.type) {
      queryConditions.type = query.type;
    }
    if ([USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN].indexOf(userType) === -1) {
      queryConditions.user = auth._id;
    }
    const totalItems = await Question.countDocuments(queryConditions);
    const data = await Question.find(queryConditions)
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
    logger.error(' getQuestions error:', error);
    throw new APIError(500, 'Internal server error');
  }
}
export async function deleteQuestion(id, auth) {
  try {
    const promises = await Promise.all([
      getUser(auth._id),
      getQuestionById(id),
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
          msg: 'Question not found',
          param: 'questionNotFound',
        },
      ]));
    }
    await Promise.all([
      Question.deleteOne({ _id: id }),
      UnitQuestion.deleteMany({ question: id }),

      Question.updateMany({}, {
        $pull: { data: id }
      }),
    ]);
    return true;
  } catch (error) {
    logger.error('deleteQuestion error:', error);
    return Promise.reject(new APIError(500, 'Internal server error'));
  }
}

export async function addResultQuestion(data) {
  try {
    const question = await Question.findById(data.id).lean();
    if (!question) {
      return Promise.reject(new APIError(403, [
        {
          msg: 'Question not found',
          param: 'questionNotFound',
        },
      ]));
    }
    // TODO: check user answer result of question
    let checked = true, error = [], resultAnswers = [], points = 0, totalPoint = 0, totalAnswer = 0;
    switch (question.type) {
      case QUESTION_TYPE.MTC:
        if (question?.data.length !== data.data?.length
          && !data.skip
          && !data.autoSubmit
        ) {
          return Promise.reject(new APIError(403, [{
            msg: 'Answer not found',
            param: 'answerNotFound',
          }]));
        }
        data?.data?.map((answer, index) => {
          answer = answer && typeof answer === 'string' ? answer.trim() : answer;
          const result = question?.data[index];
          if (result.correct !== answer) {
            resultAnswers.push({
              content: result.content,
              correct: false
            });
            checked = false;
          } else {
            resultAnswers.push({
              content: result.content,
              correct: true
            });
          }
        });
        if (!data?.data?.length) {
          checked = false;
        }
        if (!checked) {
          error.push({
            msg: 'Incorrect Answer',
            param: 'incorrectAnswer',
          });
        }
        break;
      case QUESTION_TYPE.IMPORTMTC:
        if (question?.data.length !== data.data?.length
            && !data.skip
            && !data.autoSubmit
        ) {
          return Promise.reject(new APIError(403, [{
            msg: 'Answer not found',
            param: 'answerNotFound',
          }]));
        }
        data?.data?.map((answer, index) => {
          answer = answer && typeof answer === 'string' ? answer.trim() : answer;
          const result = question?.data[index];
          totalPoint += result.weight || 1, totalAnswer += 1;
          if (result.correct !== answer) {
            resultAnswers.push({
              content: result.questions,
              answer: result.correct,
              weight: result.weight || 1,
              correct: false
            });
            checked = false;
          } else {
            resultAnswers.push({
              content: result.questions,
              answer: result.correct,
              weight: result.weight || 1,
              correct: true
            });
            points += result.weight || 1;
          }
        });
        points = parseInt(points / totalPoint * 100)
        if (question?.config?.percent) {
          if (points < question.config.percent) {
            checked = false;
          } else {
            checked = true;
          }
        } else if (!data?.data?.length) {
          checked = false;
        }
        if (!checked) {
          error.push({
            msg: 'Incorrect Answer',
            param: 'incorrectAnswer',
          });
        }
        break;
      case QUESTION_TYPE.FILLTHEGAP:
        if (data?.data?.length !== question?.data?.length
          && !data.skip
          && !data.autoSubmit
        ) {
          return Promise.reject(new APIError(403, [{
            msg: 'Answer not found',
            param: 'answerNotFound',
          }]));
        }
        data?.data?.map((answer, index) => {
          answer = answer && typeof answer === 'string' ? answer.trim() : answer;
          const result = question?.data[index];
          if (result.type === ANSWER_TYPE.select) {
            if (result.data[0] !== answer) {
              resultAnswers.push({
                content: answer,
                answer: result.data[0],
                correct: false
              });
              checked = false;
            } else {
              resultAnswers.push({
                content: answer,
                answer: result.data[0],
                correct: true
              });
            }
          } else {
            if (result.data.indexOf(answer.toLowerCase()) === -1) {
              resultAnswers.push({
                content: answer,
                answer: result.data,
                correct: false
              });
              checked = false;
            } else {
              resultAnswers.push({
                content: answer,
                answer: result.data,
                correct: true
              });
            }
          }
        });
        if (!data?.data?.length) {
          checked = false;
        }
        if (!checked) {
          error.push({
            msg: 'Incorrect Answer',
            param: 'incorrectAnswer',
          });
        }
        break;
      case QUESTION_TYPE.ORDERING:
        if (data?.data?.length !== question?.data?.length
          && !data.skip
          && !data.autoSubmit
        ) {
          return Promise.reject(new APIError(403, [{
            msg: 'Answer not found',
            param: 'answerNotFound',
          }]));
        }
        data?.data?.map((answer, index) => {
          answer = answer && typeof answer === 'string' ? answer.trim() : answer;
          const result = question?.data[index];
          if (result !== answer) {
            resultAnswers.push({
              content: result,
              correct: false
            });
            checked = false;
          } else {
            resultAnswers.push({
              content: result,
              correct: true
            });
          }
        });
        if (!data?.data?.length) {
          checked = false;
        }
        if (!checked) {
          error.push({
            msg: 'Incorrect answer',
            param: 'incorrectAnswer',
          });
        }
        break;
      case QUESTION_TYPE.DRAGDROP:
        if (data?.data?.length !== question?.data?.length
          && !data.skip
          && !data.autoSubmit
        ) {
          return Promise.reject(new APIError(403, [{
            msg: 'Answer not found',
            param: 'answerNotFound',
          }]));
        }
        data?.data?.map((answer, index) => {
          answer = answer && typeof answer === 'string' ? answer.trim() : answer;
          const result = question?.data[index];
          if (result.correct !== answer) {
            resultAnswers.push({
              content: result.content,
              answer: answer,
              correct: false
            });
            checked = false;
          } else {
            resultAnswers.push({
              content: result.content,
              answer: answer,
              correct: true
            });
          }
        });
        if (!data?.data?.length) {
          checked = false;
        }
        if (!checked) {
          error.push({
            msg: 'Incorrect answer',
            param: 'incorrectAnswer',
          });
        }
        break;
      case QUESTION_TYPE.FREETEXT:
        const stringCheck = `${data?.data?.toLowerCase()?.replace(/[?\!\;\:\{\}\[\]]/g, ' ').replace(/  /g, ' ')} `;
        question?.config?.answers?.map( answer => {
          const results = answer.words.replace(/\\/g, String.raw`\\`).split('|');
          let exits = false;
          for (let i = 0; i < results.length; i++) {
            if (stringCheck.includes(`${results[i]?.trim()} `.toLowerCase())) {
              exits = true;
              break;
            }
          }
          if (exits) {
            if (answer.when === CONDITION_TYPE.CONTAIN) {
              points += answer.point;
            }
          }
          else {
            if (answer.when === CONDITION_TYPE.NOT_CONTAIN) {
              points += answer.point;
            }
          }
        });
        if (points < question.config.points) {
          error.push({
            msg: 'Incorrect answer',
            param: 'incorrectAnswer',
          });
          checked = false;
        }
        break;
      case QUESTION_TYPE.RANDOMIZED:
        break;
      default:
        break;
    }
    if (
      (data?.checked || data?.typeResult === RESULT_TYPE.COMPLETE)
      && error.length
      && !data.skip
      && !data.autoSubmit
    ) {
      return Promise.reject(new APIError(403, error));
    }
    // if (resultAnswers?.length) {
    const unitQuestion = await UnitQuestion.findOne({
      question: question._id,
      course: data.course,
      unit: data.unit,
    });
    return await UserQuestion.create({
      title: question.title,
      content: question.content,
      user: data.user,
      unit: data.unit,
      course: data.course,
      question: data?.questionLink || question._id,
      type: question.type,
      data: question.type !== QUESTION_TYPE.FREETEXT ? question.data : [],
      dataContent: question.type === QUESTION_TYPE.FREETEXT ? data.data : '',
      contentHTML: question.type === QUESTION_TYPE.FILLTHEGAP ? question.contentHTML : '',
      result: question.type !== QUESTION_TYPE.FREETEXT ? data.data : [],
      resultAnswers,
      weight: unitQuestion ? unitQuestion.weight : 1,
      points,
      status: checked ? USER_QUESTION_STATUS.COMPLETED : USER_QUESTION_STATUS.FAILED,
      config: question.config,
      typeResult: data?.typeResult || RESULT_TYPE.CONTENT
    });
    // }
  } catch (error) {
    throw error;
  }
}


/**
 * Get course questions by course id
 * @param course the course id
 * @param params
 * @param params.rowPerPage
 * @param params.firstId
 * @param params.lastId
 * @param params.textSearch
 * @returns {Promise<*>}
 */
export async function getCourseQuestions(course, params) {
  try {
    const {
      rowPerPage,
      firstId,
      lastId,
      textSearch,
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
      status: QUESTION_STATUS.ACTIVE,
    };
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
    const questions = await Question.find(queryConditions, '_id title').sort(sortCondition).limit(pageLimit);
    if (firstId) {
      return questions.reverse();
    }
    return questions;
  } catch (error) {
    logger.error(`QuestionService getCourseQuestions error: ${error}`);
    throw error;
  }
}
