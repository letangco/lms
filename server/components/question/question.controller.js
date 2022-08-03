import * as QuestionService from './question.service';

export async function createQuestion(req, res, next) {
  try {
    const {
      body,
      auth,
    } = req;
    const question = await QuestionService.createQuestion(auth, body);
    return res.json({
      success: true,
      payload: question,
    });
  } catch (error) {
    return next(error);
  }
}

export async function updateQuestion(req, res, next) {
  try {
    const {
      body,
      auth,
      query
    } = req;
    const question = await QuestionService.updateQuestion(query.id, auth, body);
    return res.json({
      success: true,
      payload: question,
    });
  } catch (error) {
    return next(error);
  }
}

export async function getQuestion(req, res, next) {
  try {
    const {
      auth,
      query
    } = req;
    const question = await QuestionService.getQuestion(query.id, auth);
    return res.json({
      success: true,
      payload: question,
    });
  } catch (error) {
    return next(error);
  }
}
export async function userGetQuestion(req, res, next) {
  try {
    const {
      auth,
      query
    } = req;
    const question = await QuestionService.userGetQuestionCourse(query.id, auth);
    return res.json({
      success: true,
      payload: question,
    });
  } catch (error) {
    return next(error);
  }
}
export async function getQuestions(req, res, next) {
  try {
    const {
      auth,
      query
    } = req;
    const questions = await QuestionService.getQuestions(query, auth);
    return res.json({
      success: true,
      payload: questions,
    });
  } catch (error) {
    return next(error);
  }
}

export async function deleteQuestion(req, res, next) {
  try {
    const {
      auth,
      query
    } = req;
    const question = await QuestionService.deleteQuestion(query.id, auth);
    return res.json({
      success: true,
      payload: question,
    });
  } catch (error) {
    return next(error);
  }
}
