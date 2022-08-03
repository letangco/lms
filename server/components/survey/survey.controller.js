import * as SurveyService from './survey.service';

export async function createSurvey(req, res, next) {
  try {
    const {
      body,
      auth,
    } = req;
    const survey = await SurveyService.createSurvey(auth, body);
    return res.json({
      success: true,
      payload: survey,
    });
  } catch (error) {
    return next(error);
  }
}

export async function updateSurvey(req, res, next) {
  try {
    const {
      body,
      auth,
      query
    } = req;
    const survey = await SurveyService.updateSurvey(query.id, auth, body);
    return res.json({
      success: true,
      payload: survey,
    });
  } catch (error) {
    return next(error);
  }
}

export async function getSurvey(req, res, next) {
  try {
    const {
      auth,
      query
    } = req;
    const survey = await SurveyService.getSurvey(query.id, auth);
    return res.json({
      success: true,
      payload: survey,
    });
  } catch (error) {
    return next(error);
  }
}
export async function getSurveys(req, res, next) {
  try {
    const {
      auth,
      query
    } = req;
    const surveys = await SurveyService.getSurveys(query, auth);
    return res.json({
      success: true,
      payload: surveys,
    });
  } catch (error) {
    return next(error);
  }
}

export async function deleteSurvey(req, res, next) {
  try {
    const {
      auth,
      query
    } = req;
    const survey = await SurveyService.deleteSurvey(query.id, auth);
    return res.json({
      success: true,
      payload: survey,
    });
  } catch (error) {
    return next(error);
  }
}
