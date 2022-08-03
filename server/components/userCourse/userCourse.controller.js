import * as UserCourseService from './userCourse.service';
import { COURSE_USER_STATUS, USER_ROLES, USER_TYPE_STATUS } from '../../constants';
import { checkUserTypeByConditions } from '../userType/userType.service';
import { getUserCourseByConditions } from '../courseUser/courseUser.service';
import { getCourseById } from '../course/course.service';
export async function getCourseUnits(req, res, next) {
  try {
    const {
      query,
      auth
    } = req;
    const promises = await Promise.all([
      checkUserTypeByConditions({
        _id: auth?.type,
        status: USER_TYPE_STATUS.ACTIVE
      }),
      getCourseById(query?.id),
      getUserCourseByConditions({
        course: query?.id,
        user: auth._id,
        status: { $in: [COURSE_USER_STATUS.ACTIVE, COURSE_USER_STATUS.COMPLETED, COURSE_USER_STATUS.IN_PROGRESS] }
      })
    ]);
    const userRole = promises[0];
    const courseInfo = promises[1];
    const isUser = promises[2];
    if ([USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN].indexOf(userRole) !== -1
        || courseInfo?.creator.toString() === auth?._id.toString()
    ) {
      return res.json({
        success: true,
        payload: await UserCourseService.getCourseUnits(query?.id, auth, false, userRole),
      });
    }
    return res.json({
      success: true,
      payload: await UserCourseService.getCourseUnitsByUser(query?.id, req.auth, isUser, userRole),
    });
  } catch (error) {
    return next(error);
  }
}
export async function getUnit(req, res, next) {
  try {
    const {
      query,
      auth
    } = req;
    return res.json({
      success: true,
      payload: await UserCourseService.getUnit(query?.id, auth),
    });
  } catch (error) {
    return next(error);
  }
}
export async function startUnitQuestion(req, res, next) {
  try {
    const {
      query,
      auth,
      body
    } = req;
    return res.json({
      success: true,
      payload: await UserCourseService.startUnitQuestion(query, auth, body),
    });
  } catch (error) {
    return next(error);
  }
}
export async function startUnitSurvey(req, res, next) {
  try {
    const {
      query,
      auth
    } = req;
    return res.json({
      success: true,
      payload: await UserCourseService.startUnitSurvey(query, auth),
    });
  } catch (error) {
    return next(error);
  }
}
export async function submitUnitQuestion(req, res, next) {
  try {
    const {
      query,
      auth,
      body
    } = req;
    return res.json({
      success: true,
      payload: await UserCourseService.submitUnitQuestion(query, auth, body),
    });
  } catch (error) {
    return next(error);
  }
}
export async function submitUnitSurvey(req, res, next) {
  try {
    const {
      query,
      auth,
      body
    } = req;
    return res.json({
      success: true,
      payload: await UserCourseService.submitUnitSurvey(query, auth, body),
    });
  } catch (error) {
    return next(error);
  }
}
export async function resetUnitResult(req, res, next) {
  try {
    const {
      query,
      auth
    } = req;
    await UserCourseService.resetUnitResult(query?.id, auth);
    return res.json({
      success: true,
      payload: true
    });
  } catch (error) {
    return next(error);
  }
}
export async function completeUnit(req, res, next) {
  try {
    const {
      query,
      auth,
      body
    } = req;
    return res.json({
      success: true,
      payload: await UserCourseService.completeUnit(query?.id, auth, body),
    });
  } catch (error) {
    return next(error);
  }
}
export async function getUnitCompleted(req, res, next) {
  try {
    const {
      query,
      auth
    } = req;
    return res.json({
      success: true,
      payload: await UserCourseService.getUnitCompleted(query?.id, auth)
    });
  } catch (error) {
    return next(error);
  }
}
