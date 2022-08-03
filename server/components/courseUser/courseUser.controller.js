import * as CourseUserService from './courseUser.service';

export async function createCourseUser(req, res, next) {
  try {
    const data = await CourseUserService.createCourseUser(req.auth, req.body);
    return res.json({
      success: true,
      payload: data,
    });
  } catch (error) {
    return next(error);
  }
}

export async function updateCourseUser(req, res, next) {
  try {
    const {
      id,
    } = req.params;
    await CourseUserService.updateCourseUser(req.auth, id, req.body);
    return res.json({
      success: true,
    });
  } catch (error) {
    return next(error);
  }
}

export async function getCourseUsers(req, res, next) {
  try {
    const {
      page,
      rowPerPage,
      textSearch,
      order,
      orderBy,
    } = req.query;
    const {
      id,
    } = req.params;
    const data = await CourseUserService.getCourseUsers(id, page, rowPerPage, textSearch, order, orderBy, req.auth);
    return res.json({
      success: true,
      payload: data,
    });
  } catch (error) {
    return next(error);
  }
}

export async function deleteCourseUser(req, res, next) {
  try {
    const {
      id,
    } = req.params;
    await CourseUserService.deleteCourseUser(id, req.auth);
    return res.json({
      success: true,
    });
  } catch (error) {
    return next(error);
  }
}

export async function searchCourseUsers(req, res, next) {
  try {
    const {
      courseId,
      firstId,
      lastId,
      rowPerPage,
      textSearch,
      roles,
    } = req.query;
    const data = await CourseUserService.searchCourseUsers({
      courseId,
      rowPerPage,
      firstId,
      lastId,
      textSearch,
      roles,
    });
    return res.json({
      success: true,
      payload: data,
    });
  } catch (error) {
    return next(error);
  }
}
