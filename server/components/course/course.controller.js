import * as CourseService from './course.service';
import * as UnitService from '../unit/unit.service';
import * as QuestionService from '../question/question.service';
import {COURSE_USER_STATUS, ROOT_PATH, USER_ROLES, USER_TYPE_STATUS} from '../../constants';
import { resizeImage } from '../../helpers/resize';
import {
  checkUserTypeByConditions,
  checkUserTypeIsAdmin,
} from '../userType/userType.service';
import {getUserCourseByConditions} from "../courseUser/courseUser.service";
import APIError from "../../util/APIError";
import { getCourseById } from './course.service';

export async function createCourse(req, res, next) {
  try {
    // await checkUserTypeIsAdmin(req.auth?.type);
    const {
      body,
      auth,
    } = req;
    const info = {};
    const file = req.file;
    if (file) {
      const rootPath = file.destination.replace(`${ROOT_PATH}/`, '');
      info.thumbnail = `${rootPath}/${file.filename}`;
      resizeImage(info.thumbnail);
    }
    Object.keys(body).forEach((bodyKey) => {
      info[bodyKey] = body[bodyKey];
    });
    const course = await CourseService.createCourse(auth, info);
    return res.json({
      success: true,
      payload: course,
    });
  } catch (error) {
    return next(error);
  }
}

export async function updateCourse(req, res, next) {
  try {
    // await checkUserTypeIsAdmin(req.auth?.type);
    const {
      body,
      auth,
    } = req;
    const info = {};
    const file = req.file;
    if (file) {
      const rootPath = file.destination.replace(`${ROOT_PATH}/`, '');
      info.thumbnail = `${rootPath}/${file.filename}`;
      resizeImage(info.thumbnail);
    }
    Object.keys(body).forEach((bodyKey) => {
      info[bodyKey] = body[bodyKey];
    });
    const course = await CourseService.updateCourse(req.params.id, auth, info);
    return res.json({
      success: true,
      payload: course,
    });
  } catch (error) {
    return next(error);
  }
}

export async function getCourses(req, res, next) {
  try {
    let userRole = await checkUserTypeByConditions({
      _id: req.auth?.type,
      status: USER_TYPE_STATUS.ACTIVE
    });
    const {
      auth,
    } = req;
    if ([USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN].indexOf(userRole) !== -1
        && [USER_ROLES.INSTRUCTOR, USER_ROLES.LEARNER].indexOf(req.role) !== -1) {
      userRole = req.role;
    }
    const courses = await CourseService.getCourses(auth, userRole, req.query);
    return res.json({
      success: true,
      payload: courses,
    });
  } catch (error) {
    return next(error);
  }
}

export async function getAllIntakes(req, res, next) {
  try {
    const userRole = await checkUserTypeByConditions({
      _id: req.auth?.type,
      status: USER_TYPE_STATUS.ACTIVE
    });
    const {
      auth,
    } = req;
    const courses = await CourseService.getAllIntakes(auth, req.query, userRole);
    return res.json({
      success: true,
      payload: courses,
    });
  } catch (error) {
    return next(error);
  }
}

export async function createIntake(req, res, next) {
  try {
    // await checkUserTypeIsAdmin(req.auth?.type);
    const { auth } = req;
    const { id } = req.params;
    const { title, description, code, units, status } = req.body;
    return res.json({
      success: true,
      payload: await CourseService.createIntake(id, auth, title, description, code, units, status)
    });
  } catch (error) {
    return next(error);
  }
}
export async function getIntakes(req, res, next) {
  try {
    await checkUserTypeByConditions({
      _id: req.auth?.type,
      status: USER_TYPE_STATUS.ACTIVE
    });
    const { id } = req.params;
    const { textSearch } = req.query;
    return res.json({
      success: true,
      payload: await CourseService.getIntakes(id, textSearch)
    });
  } catch (error) {
    return next(error);
  }
}

export async function deleteCourse(req, res, next) {
  try {
    // await checkUserTypeIsAdmin(req.auth?.type);
    const {
      id,
    } = req.params;
    await CourseService.deleteCourse(id, req.auth);
    return res.json({
      success: true,
    });
  } catch (error) {
    return next(error);
  }
}

export async function getCourse(req, res, next) {
  try {
    const {
      id,
    } = req.params;
    const { auth } = req;
    const promises = await Promise.all([
      checkUserTypeByConditions({
        _id: req.auth?.type,
        status: USER_TYPE_STATUS.ACTIVE
      }),
      getCourseById(id)
    ]);
    const userRole = promises[0];
    const courseInfo = promises[1];
    if ([USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN].indexOf(userRole) !== -1
        || courseInfo?.creator.toString() === auth?._id.toString()
    ) {
      const course = await CourseService.getCourse(id, auth);
      return res.json({
        success: true,
        payload: course,
      });
    }
    const course = await CourseService.getCourseByUser(id, auth);
    return res.json({
      success: true,
      payload: course,
    });
  } catch (error) {
    return next(error);
  }
}

export async function importUser(req, res, next) {
  try {
    await checkUserTypeIsAdmin(req.auth?.type);
    const auth = req.auth;
    const users = req.body.data;
    const id = req.params.id;
    await CourseService.importUser(id, users, auth);
    return res.json({
      success: true
    });
  } catch (error) {
    return next(error);
  }
}

export async function checkImportUser(req, res, next) {
  try {
    await checkUserTypeIsAdmin(req.auth?.type);
    const users = req.body.data;
    const id = req.params.id;
    return res.json({
      success: true,
      payload: await CourseService.checkImportUser(id, users)
    });
  } catch (error) {
    return next(error);
  }
}

export async function searchCourses(req, res, next) {
  try {
    const {
      rowPerPage,
      firstId,
      lastId,
      textSearch,
      exceptionIds,
    } = req.query;
    const courses = await CourseService.searchCourses({
      rowPerPage,
      firstId,
      lastId,
      textSearch,
      exceptionIds,
    });
    return res.json({
      success: true,
      payload: courses,
    });
  } catch (error) {
    return next(error);
  }
}

export async function searchIntakes(req, res, next) {
  try {
    const {
      rowPerPage,
      firstId,
      lastId,
      textSearch,
      exceptionIds,
    } = req.query;
    const courses = await CourseService.searchIntakes({
      rowPerPage,
      firstId,
      lastId,
      textSearch,
      exceptionIds,
    });
    return res.json({
      success: true,
      payload: courses,
    });
  } catch (error) {
    return next(error);
  }
}

export async function getCourseUnits(req, res, next) {
  try {
    const {
      rowPerPage,
      firstId,
      lastId,
      textSearch,
      types,
    } = req.query;
    const userRole = await checkUserTypeByConditions({
      _id: req.auth?.type,
      status: USER_TYPE_STATUS.ACTIVE
    });
    const isUser = await getUserCourseByConditions({
      course: req.params.id,
      user: req.auth._id,
      status: { $in: [COURSE_USER_STATUS.ACTIVE, COURSE_USER_STATUS.COMPLETED, COURSE_USER_STATUS.IN_PROGRESS] }
    });
    if ([USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN].indexOf(userRole) !== -1 || isUser) {
      const units = await UnitService.getCourseUnits(req.params.id, {
        rowPerPage,
        firstId,
        lastId,
        textSearch,
        types,
      });
      return res.json({
        success: true,
        payload: units,
      });
    }
    return Promise.reject(new APIError(403, [
      {
        msg: 'Course not found',
        param: 'courseNotFound',
      },
    ]));
  } catch (error) {
    return next(error);
  }
}

export async function getCourseQuestions(req, res, next) {
  try {
    const {
      rowPerPage,
      firstId,
      lastId,
      textSearch,
    } = req.query;

    const userRole = await checkUserTypeByConditions({
      _id: req.auth?.type,
      status: USER_TYPE_STATUS.ACTIVE
    });
    const isUser = await getUserCourseByConditions({
      course: req.params.id,
      user: req.auth?._id,
      status: { $in: [COURSE_USER_STATUS.ACTIVE, COURSE_USER_STATUS.COMPLETED, COURSE_USER_STATUS.IN_PROGRESS] }
    });
    if ([USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN].indexOf(userRole) !== -1 || isUser) {
      const questions = await QuestionService.getCourseQuestions(req.params.id, {
        rowPerPage,
        firstId,
        lastId,
        textSearch,
      });
      return res.json({
        success: true,
        payload: questions,
      });
    }
    return Promise.reject(new APIError(403, [
      {
        msg: 'Course not found',
        param: 'courseNotFound',
      },
    ]));
  } catch (error) {
    return next(error);
  }
}
