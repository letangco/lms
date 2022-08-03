import * as UnitService from './unit.service';
import {USER_ROLES, USER_TYPE_STATUS} from "../../constants";
import * as UserCourseService from "../userCourse/userCourse.service";
import { checkUserTypeByConditions } from "../userType/userType.service";
import { getCourseById } from '../course/course.service';

export async function createUnit(req, res, next) {
  try {
    const {
      body,
      auth,
    } = req;
    const unit = await UnitService.createUnit(auth, body);
    return res.json({
      success: true,
      payload: unit,
    });
  } catch (error) {
    return next(error);
  }
}

export async function saveClassroom(req, res, next) {
  try {
    const {
      auth,
    } = req;
    await UnitService.saveClassroom(auth, req.params.id);
    return res.json({
      success: true,
    });
  } catch (error) {
    return next(error);
  }
}

export async function updateUnit(req, res, next) {
  try {
    const {
      body,
      auth,
      query
    } = req;
    const unit = await UnitService.updateUnit(query?.id, auth, body);
    return res.json({
      success: true,
      payload: unit,
    });
  } catch (error) {
    return next(error);
  }
}

export async function quickUpdateUnit(req, res, next) {
  try {
    const {
      body,
      auth,
      query
    } = req;
    const unit = await UnitService.quickUpdateUnit(query?.id, auth, body);
    return res.json({
      success: true,
      payload: unit,
    });
  } catch (error) {
    return next(error);
  }
}

export async function sortUnits(req, res, next) {
  try {
    const {
      body,
      auth,
      query
    } = req;
    const unit = await UnitService.sortUnits(query?.id, auth, body);
    return res.json({
      success: true,
      payload: unit,
    });
  } catch (error) {
    return next(error);
  }
}

export async function sortQuestions(req, res, next) {
  try {
    const {
      body,
      auth,
      query
    } = req;
    const unit = await UnitService.sortQuestions(query?.id, auth, body);
    return res.json({
      success: true,
      payload: unit,
    });
  } catch (error) {
    return next(error);
  }
}
export async function updateOptions(req, res, next) {
  try {
    const {
      body,
      auth,
      query
    } = req;
    const unit = await UnitService.updateOptions(query?.id, auth, body);
    return res.json({
      success: true,
      payload: unit,
    });
  } catch (error) {
    return next(error);
  }
}
export async function updateQuestionWeight(req, res, next) {
  try {
    const {
      body,
      auth,
      query
    } = req;
    const unit = await UnitService.updateQuestionWeight(query?.id, auth, body);
    return res.json({
      success: true,
      payload: unit,
    });
  } catch (error) {
    return next(error);
  }
}

export async function addQuestion(req, res, next) {
  try {
    const {
      body,
      auth,
      query
    } = req;
    const unit = await UnitService.addQuestion(query?.id, auth, body);
    return res.json({
      success: true,
      payload: unit,
    });
  } catch (error) {
    return next(error);
  }
}

export async function addSurvey(req, res, next) {
  try {
    const {
      body,
      auth,
      query
    } = req;
    const unit = await UnitService.addSurvey(query?.id, auth, body);
    return res.json({
      success: true,
      payload: unit,
    });
  } catch (error) {
    return next(error);
  }
}

export async function removeQuestion(req, res, next) {
  try {
    const {
      auth,
      query
    } = req;
    const unit = await UnitService.removeQuestion(query?.id, auth);
    return res.json({
      success: true,
      payload: unit,
    });
  } catch (error) {
    return next(error);
  }
}
export async function removeSurvey(req, res, next) {
  try {
    const {
      auth,
      query
    } = req;
    const unit = await UnitService.removeSurvey(query?.id, auth);
    return res.json({
      success: true,
      payload: unit,
    });
  } catch (error) {
    return next(error);
  }
}

export async function sortSurveys(req, res, next) {
  try {
    const {
      body,
      auth,
      query
    } = req;
    const unit = await UnitService.sortSurveys(query?.id, auth, body);
    return res.json({
      success: true,
      payload: unit,
    });
  } catch (error) {
    return next(error);
  }
}

export async function cloneUnit(req, res, next) {
  try {
    const {
      auth,
      query
    } = req;
    const unit = await UnitService.cloneUnit(query, auth);
    return res.json({
      success: true,
      payload: unit,
    });
  } catch (error) {
    return next(error);
  }
}

export async function deleteUnit(req, res, next) {
  try {
    const {
      auth,
      query
    } = req;
    await UnitService.deleteUnit(query, auth);
    return res.json({
      success: true
    });
  } catch (error) {
    return next(error);
  }
}

export async function getUnit(req, res, next) {
  try {
    const data = await UnitService.getUnit(req.query?.id, req.auth);
    return res.json({
      success: true,
      payload: data,
    });
  } catch (error) {
    return next(error);
  }
}

export async function getUnits(req, res, next) {
  try {
    const {
      query,
      auth
    } = req;
    const promises = await Promise.all([
      checkUserTypeByConditions({
        _id: req.auth?.type,
        status: USER_TYPE_STATUS.ACTIVE
      }),
      getCourseById(query?.course)
    ]);
    const userRole = promises[0];
    const courseInfo = promises[1];
    if ([USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN].indexOf(userRole) !== -1
        || courseInfo?.creator.toString() === auth?._id.toString()
    ) {
      return res.json({
        success: true,
        payload: await UnitService.getUnits(req.query)
      });
    }
    return res.json({
      success: true,
      payload: await UserCourseService.getCourseUnitsByUser(query?.course, auth),
    });
  } catch (error) {
    return next(error);
  }
}

export async function getUnitSubmissions(req, res, next) {
  try {
    const data = await UnitService.getUnitSubmissions(req.query);
    return res.json({
      success: true,
      payload: data,
    });
  } catch (error) {
    return next(error);
  }
}

export async function getUnitSubmission(req, res, next) {
  try {
    const data = await UnitService.getUnitSubmission(req.query?.id);
    return res.json({
      success: true,
      payload: data,
    });
  } catch (error) {
    return next(error);
  }
}

export async function gradeUnitSubmission(req, res, next) {
  try {
    const data = await UnitService.gradeUnitSubmission(req.query?.id, req.body, req.auth);
    return res.json({
      success: true,
      payload: data,
    });
  } catch (error) {
    return next(error);
  }
}
export async function resetUnitSubmission(req, res, next) {
  try {
    const data = await UnitService.resetUnitSubmission(req.query?.id, req.body, req.auth);
    return res.json({
      success: true,
      payload: data,
    });
  } catch (error) {
    return next(error);
  }
}

export async function checkUnitLink(req, res, next) {
  try {
    return res.json({
      success: true,
      payload: await UnitService.checkUnitLink(req.query)
    });
  } catch (error) {
    return next(error);
  }
}

export async function getSlideShareIframe(req, res, next) {
  try {
    return res.json({
      success: true,
      payload: await UnitService.getSlideShareIframe(req.query)
    });
  } catch (error) {
    return next(error);
  }
}

export async function undoGradeSubmission(req, res, next) {
  try {
    const {
      body,
      role,
      auth
    } = req;
    await UnitService.undoGradeSubmission(body, role, auth);
    return res.json({
      success: true,
      payload: true
    });
  } catch (error) {
    return next(error);
  }
}

export async function getTrackingResultUnit(req, res, next) {
  try {
    const {
      query,
      auth,
      role
    } = req;
    const page = Number(query?.page) || 1;
    const limit = Number(query?.limit) || 12;
    const skip = (page - 1) * limit;
    query.page = page;
    query.skip = skip;
    query.limit = limit;
    return res.json({
      success: true,
      payload: await UnitService.getTrackingResultUnit(auth, query, role)
    });
  } catch (error) {
    return next(error);
  }
}
